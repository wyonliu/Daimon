import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { plan, returnUrl } = await req.json();

    if (!plan || !returnUrl) {
      return NextResponse.json(
        { error: 'Missing plan or returnUrl' },
        { status: 400 }
      );
    }

    if (!['pro', 'master'].includes(plan)) {
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 });
    }

    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

    // Dev mode: no Stripe key configured — return mock success
    if (!stripeSecretKey) {
      console.log('[Checkout] Stripe not configured — returning mock session');
      const mockSessionId = `mock_session_${Date.now()}`;
      const successUrl = new URL(returnUrl);
      successUrl.pathname = '/success';
      successUrl.searchParams.set('session_id', mockSessionId);
      successUrl.searchParams.set('plan', plan);
      return NextResponse.json({ url: successUrl.toString() });
    }

    // Determine price ID based on plan
    const priceId =
      plan === 'master'
        ? process.env.STRIPE_MASTER_PRICE_ID
        : process.env.STRIPE_PRO_PRICE_ID;

    if (!priceId) {
      return NextResponse.json(
        { error: `Price ID not configured for plan: ${plan}` },
        { status: 500 }
      );
    }

    // Dynamic import to avoid issues when stripe isn't configured
    const Stripe = (await import('stripe')).default;
    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2024-12-18.acacia' as unknown as '2026-03-25.dahlia',
    });

    const successUrl = new URL('/success', returnUrl);
    successUrl.searchParams.set('session_id', '{CHECKOUT_SESSION_ID}');
    successUrl.searchParams.set('plan', plan);

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: successUrl.toString(),
      cancel_url: returnUrl,
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('[Checkout] Error creating session:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
