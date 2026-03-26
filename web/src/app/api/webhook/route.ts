import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
  const secret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET;

  if (!secret) {
    console.log('[Webhook] LemonSqueezy webhook secret not configured');
    return NextResponse.json({ received: true });
  }

  try {
    const rawBody = await req.text();
    const signature = req.headers.get('x-signature');

    if (!signature) {
      return NextResponse.json(
        { error: 'Missing x-signature header' },
        { status: 400 }
      );
    }

    const hmac = crypto.createHmac('sha256', secret);
    hmac.update(rawBody);
    const digest = hmac.digest('hex');

    if (digest !== signature) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    const event = JSON.parse(rawBody);
    const eventName = event.meta.event_name;

    switch (eventName) {
      case 'order_created':
        console.log('[Webhook] Order created:', event.data.id);
        // Handles both one-time purchases and subscription initial orders
        break;
      case 'subscription_created':
        console.log('[Webhook] Subscription created:', event.data.id);
        // TODO: When database is added, mark user as pro here
        break;
      case 'subscription_updated':
        console.log('[Webhook] Subscription updated:', event.data.id);
        break;
      case 'subscription_cancelled':
        console.log('[Webhook] Subscription cancelled:', event.data.id);
        // TODO: When database is added, remove pro status here
        break;
      default:
        console.log(`[Webhook] Unhandled event: ${eventName}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('[Webhook] Error processing webhook:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 400 }
    );
  }
}
