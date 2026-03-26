import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.log('[Webhook] STRIPE_WEBHOOK_SECRET not configured — skipping');
    return NextResponse.json({ received: true });
  }

  try {
    const body = await req.text();
    const signature = req.headers.get('stripe-signature');

    if (!signature) {
      return NextResponse.json(
        { error: 'Missing stripe-signature header' },
        { status: 400 }
      );
    }

    const Stripe = (await import('stripe')).default;
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: '2026-03-25.dahlia',
    });

    const event = stripe.webhooks.constructEvent(body, signature, webhookSecret);

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        console.log(
          '[Webhook] checkout.session.completed — customer:',
          session.customer,
          'subscription:',
          session.subscription
        );
        // TODO: When database is added, mark user as pro here
        // For now, the client-side activatePro() handles this via the success redirect
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object;
        console.log(
          '[Webhook] customer.subscription.deleted — subscription:',
          subscription.id,
          'customer:',
          subscription.customer
        );
        // TODO: When database is added, remove pro status here
        break;
      }

      default:
        console.log(`[Webhook] Unhandled event type: ${event.type}`);
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
