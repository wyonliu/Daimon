import { NextRequest, NextResponse } from 'next/server';
import { calculateBazi, baziToText } from '@/lib/bazi/calculator';
import { calculateZodiac, zodiacToText } from '@/lib/astro/zodiac';

export const runtime = 'edge';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { year, month, day, hour, gender } = body;

    if (!year || !month || !day) {
      return NextResponse.json({ error: 'Birth date is required' }, { status: 400 });
    }

    const yearNum = parseInt(year);
    const monthNum = parseInt(month);
    const dayNum = parseInt(day);
    const hourNum = hour !== undefined && hour !== null && hour !== '' ? parseInt(hour) : 12;

    if (isNaN(yearNum) || isNaN(monthNum) || isNaN(dayNum) || isNaN(hourNum)) {
      return NextResponse.json({ error: 'Invalid date values' }, { status: 400 });
    }
    if (monthNum < 1 || monthNum > 12 || dayNum < 1 || dayNum > 31 || hourNum < 0 || hourNum > 23) {
      return NextResponse.json({ error: 'Date values out of range' }, { status: 400 });
    }

    const bazi = calculateBazi(
      yearNum,
      monthNum,
      dayNum,
      hourNum,
      gender === 'female' ? 'female' : 'male'
    );

    const zodiac = calculateZodiac(
      yearNum,
      monthNum,
      dayNum
    );

    return NextResponse.json({
      bazi,
      zodiac,
      baziText: baziToText(bazi),
      zodiacText: zodiacToText(zodiac),
    });
  } catch (error) {
    console.error('Calculation error:', error);
    return NextResponse.json(
      { error: 'Failed to calculate chart: ' + (error instanceof Error ? error.message : 'Unknown error') },
      { status: 500 }
    );
  }
}
