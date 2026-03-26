import { NextRequest } from 'next/server';
import { getSystemPrompt, getInitialReadingPrompt, getTruncatedReadingPrompt } from '@/lib/ai/system-prompt';

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || '';
const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { messages, baziText, zodiacText, isInitial, truncated } = body;

    if (!baziText || !zodiacText) {
      return new Response(JSON.stringify({ error: 'Chart data required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const systemPrompt = getSystemPrompt(baziText, zodiacText);

    const chatMessages: { role: string; content: string }[] = [];

    if (isInitial && truncated) {
      chatMessages.push({ role: 'user', content: getTruncatedReadingPrompt() });
    } else if (isInitial) {
      chatMessages.push({ role: 'user', content: getInitialReadingPrompt() });
    } else if (messages && messages.length > 0) {
      for (const msg of messages) {
        chatMessages.push({ role: msg.role, content: msg.content });
      }
    } else {
      chatMessages.push({ role: 'user', content: getInitialReadingPrompt() });
    }

    const response = await fetch(OPENROUTER_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'HTTP-Referer': 'https://daimon.app',
        'X-Title': 'Daimon Destiny Engine',
      },
      body: JSON.stringify({
        model: 'deepseek/deepseek-chat-v3-0324',
        stream: true,
        max_tokens: truncated ? 1200 : 4096,
        messages: [
          { role: 'system', content: systemPrompt },
          ...chatMessages,
        ],
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error('OpenRouter error:', response.status, err);
      return new Response(JSON.stringify({ error: 'Our reading service is temporarily unavailable. Please try again shortly.' }), {
        status: 502,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Forward SSE stream
    const encoder = new TextEncoder();
    const reader = response.body?.getReader();

    if (!reader) {
      return new Response(JSON.stringify({ error: 'No response stream' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const decoder = new TextDecoder();
    let buffer = '';

    const isTruncated = !!truncated;
    const readableStream = new ReadableStream({
      async start(controller) {
        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            buffer = lines.pop() || '';

            for (const line of lines) {
              if (!line.startsWith('data: ')) continue;
              const data = line.slice(6).trim();
              if (data === '[DONE]') {
                if (isTruncated) {
                  controller.enqueue(encoder.encode(`data: ${JSON.stringify({ paywall: true })}\n\n`));
                }
                controller.enqueue(encoder.encode('data: [DONE]\n\n'));
                continue;
              }

              try {
                const parsed = JSON.parse(data);
                const delta = parsed.choices?.[0]?.delta;
                if (delta?.content) {
                  controller.enqueue(
                    encoder.encode(`data: ${JSON.stringify({ text: delta.content })}\n\n`)
                  );
                }
              } catch {
                // Skip malformed chunks
              }
            }
          }
          if (isTruncated) {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ paywall: true })}\n\n`));
          }
          controller.enqueue(encoder.encode('data: [DONE]\n\n'));
          controller.close();
        } catch (error) {
          console.error('Stream processing error:', error);
          controller.close();
        }
      },
    });

    return new Response(readableStream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error) {
    console.error('Chat error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
