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

    if (!['pro', 'master', 'single'].includes(plan)) {
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 });
    }

    const apiKey = process.env.LEMONSQUEEZY_API_KEY;

    // Dev mode: no LemonSqueezy key configured — return mock success
    if (!apiKey) {
      console.log('[Checkout] LemonSqueezy not configured — returning mock session');
      const mockSessionId = `mock_session_${Date.now()}`;
      const successUrl = new URL(returnUrl);
      successUrl.pathname = '/success';
      successUrl.searchParams.set('session_id', mockSessionId);
      successUrl.searchParams.set('plan', plan);
      return NextResponse.json({ url: successUrl.toString() });
    }

    // Determine variant ID based on plan
    let variantId: string | undefined;
    if (plan === 'single') {
      variantId = process.env.LEMONSQUEEZY_SINGLE_VARIANT_ID;
    } else if (plan === 'master') {
      variantId = process.env.LEMONSQUEEZY_MASTER_VARIANT_ID;
    } else {
      variantId = process.env.LEMONSQUEEZY_PRO_VARIANT_ID;
    }

    const storeId = process.env.LEMONSQUEEZY_STORE_ID;

    if (!variantId) {
      return NextResponse.json(
        { error: `Variant ID not configured for plan: ${plan}` },
        { status: 500 }
      );
    }

    if (!storeId) {
      return NextResponse.json(
        { error: 'Store ID not configured' },
        { status: 500 }
      );
    }

    const successUrl = new URL('/success', returnUrl);
    successUrl.searchParams.set('session_id', '{checkout_id}');
    successUrl.searchParams.set('plan', plan);

    const response = await fetch('https://api.lemonsqueezy.com/v1/checkouts', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/vnd.api+json',
        'Accept': 'application/vnd.api+json',
      },
      body: JSON.stringify({
        data: {
          type: 'checkouts',
          attributes: {
            checkout_options: {
              dark: true,
              success_url: successUrl.toString(),
              logo: false,
            },
            product_options: {
              redirect_url: successUrl.toString(),
            },
          },
          relationships: {
            store: {
              data: { type: 'stores', id: storeId },
            },
            variant: {
              data: { type: 'variants', id: variantId },
            },
          },
        },
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('[Checkout] LemonSqueezy error:', JSON.stringify(data));
      return NextResponse.json(
        { error: 'Failed to create checkout session' },
        { status: 500 }
      );
    }

    const checkoutUrl = data.data.attributes.url;
    return NextResponse.json({ url: checkoutUrl });
  } catch (error) {
    console.error('[Checkout] Error creating session:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
