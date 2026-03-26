import { NextRequest } from 'next/server';
import { calculateBazi, baziToText } from '@/lib/bazi/calculator';
import { calculateDailyDestiny, dailyDestinyToText } from '@/lib/bazi/daily';
import { getDailyReadingPrompt } from '@/lib/ai/daily-prompt';

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || '';
const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { year, month, day, hour, gender, targetDate } = body;

    if (!year || !month || !day) {
      return new Response(JSON.stringify({ error: 'Birth date is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const yearNum = parseInt(year);
    const monthNum = parseInt(month);
    const dayNum = parseInt(day);
    const hourNum = hour !== undefined && hour !== null && hour !== '' ? parseInt(hour) : 12;

    if (isNaN(yearNum) || isNaN(monthNum) || isNaN(dayNum) || isNaN(hourNum)) {
      return new Response(JSON.stringify({ error: 'Invalid date values' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Calculate natal chart
    const natalChart = calculateBazi(
      yearNum, monthNum, dayNum, hourNum,
      gender === 'female' ? 'female' : 'male',
    );

    // Calculate daily destiny
    const date = targetDate ? new Date(targetDate) : new Date();
    const dailyDestiny = calculateDailyDestiny(natalChart, date);

    // Generate text for AI context
    const baziText = baziToText(natalChart);
    const dailyText = dailyDestinyToText(dailyDestiny, natalChart);

    // Build AI prompt
    const systemPrompt = getDailyReadingPrompt(dailyDestiny, baziText);

    // Stream AI reading
    const response = await fetch(OPENROUTER_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'HTTP-Referer': 'https://daimon.app',
        'X-Title': 'Daimon Daily Destiny',
      },
      body: JSON.stringify({
        model: 'deepseek/deepseek-chat-v3-0324',
        stream: true,
        max_tokens: 800,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Give me my personalized daily reading for ${dailyDestiny.date}. Here is today's calculated data:\n\n${dailyText}` },
        ],
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error('OpenRouter error:', response.status, err);
      // Return daily data without AI reading
      return new Response(JSON.stringify({
        daily: dailyDestiny,
        error: 'AI reading temporarily unavailable',
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Forward SSE stream with daily data prepended
    const encoder = new TextEncoder();
    const reader = response.body?.getReader();

    if (!reader) {
      return new Response(JSON.stringify({ daily: dailyDestiny }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const decoder = new TextDecoder();
    let buffer = '';

    const readableStream = new ReadableStream({
      async start(controller) {
        try {
          // First, send the daily data as a JSON event
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ daily: dailyDestiny })}\n\n`)
          );

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
                    encoder.encode(`data: ${JSON.stringify({ text: delta.content })}\n\n`)
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
    console.error('Daily destiny error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
