import { NextRequest } from 'next/server';
import { calculateBazi, baziToText } from '@/lib/bazi/calculator';
import { calculateCompatibility, compatibilityToText } from '@/lib/bazi/compatibility';
import { getCompatibilityPrompt, getCompatibilityReadingPrompt } from '@/lib/ai/system-prompt';

export const runtime = 'edge';

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || '';
const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';

interface PersonInput {
  year: number;
  month: number;
  day: number;
  hour?: number | null;
  gender: 'male' | 'female';
  name: string;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { personA, personB, locale } = body as { personA: PersonInput; personB: PersonInput; locale?: string };

    if (!personA || !personB) {
      return new Response(JSON.stringify({ error: 'Both persons data required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (!personA.year || !personA.month || !personA.day || !personB.year || !personB.month || !personB.day) {
      return new Response(JSON.stringify({ error: 'Birth date is required for both persons' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Step 1: Calculate BaZi for both
    const hourA = personA.hour !== undefined && personA.hour !== null ? personA.hour : 12;
    const hourB = personB.hour !== undefined && personB.hour !== null ? personB.hour : 12;

    const baziA = calculateBazi(personA.year, personA.month, personA.day, hourA, personA.gender || 'male');
    const baziB = calculateBazi(personB.year, personB.month, personB.day, hourB, personB.gender || 'male');

    const chartAText = baziToText(baziA);
    const chartBText = baziToText(baziB);

    // Step 2: Calculate compatibility
    const compatibility = calculateCompatibility(baziA, baziB);
    const compatText = compatibilityToText(compatibility, personA.name || 'Person A', personB.name || 'Person B');

    // Step 3: Stream AI reading
    const systemPrompt = getCompatibilityPrompt(
      compatText, chartAText, chartBText,
      personA.name || 'Person A', personB.name || 'Person B',
      locale
    );

    const response = await fetch(OPENROUTER_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'HTTP-Referer': 'https://daimon.app',
        'X-Title': 'Daimon Destiny Match',
      },
      body: JSON.stringify({
        model: 'deepseek/deepseek-chat-v3-0324',
        stream: true,
        max_tokens: 4096,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: getCompatibilityReadingPrompt() },
        ],
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error('OpenRouter error:', response.status, err);

      // Return compatibility data without AI reading
      return new Response(JSON.stringify({
        compatibility,
        baziA,
        baziB,
        error: 'AI reading unavailable',
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Build SSE stream with compatibility data header + AI text
    const encoder = new TextEncoder();
    const reader = response.body?.getReader();

    if (!reader) {
      return new Response(JSON.stringify({
        compatibility,
        baziA,
        baziB,
        error: 'No response stream',
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const decoder = new TextDecoder();
    let buffer = '';

    const readableStream = new ReadableStream({
      async start(controller) {
        try {
          // First event: send compatibility data
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ type: 'data', compatibility, baziA, baziB })}\n\n`)
          );

          // Then stream AI text
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
                controller.enqueue(encoder.encode('data: [DONE]\n\n'));
                continue;
              }

              try {
                const parsed = JSON.parse(data);
                const delta = parsed.choices?.[0]?.delta;
                if (delta?.content) {
                  controller.enqueue(
                    encoder.encode(`data: ${JSON.stringify({ type: 'text', text: delta.content })}\n\n`)
                  );
                }
              } catch {
                // Skip malformed chunks
              }
            }
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
    console.error('Match error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
