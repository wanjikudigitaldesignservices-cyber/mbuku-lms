import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.39.3";

Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  try {
    const payload = await req.json();
    console.log('IntaSend Webhook Payload:', payload);

    // If IntaSend sends a challenge, respond with it
    if (payload.challenge) {
      return new Response(payload.challenge, { status: 200 });
    }

    const { state, api_ref, invoice_id } = payload;

    // We only care about COMPLETED or FAILED states
    if (state !== 'COMPLETED' && state !== 'FAILED') {
      return new Response('Ignored state', { status: 200 });
    }

    const paymentId = api_ref;
    if (!paymentId) {
      return new Response('Missing api_ref', { status: 400 });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Find the payment record
    const { data: payment, error: paymentErr } = await supabase
      .from('payments')
      .select('*')
      .eq('id', paymentId)
      .single();

    if (paymentErr || !payment) {
      console.error('Payment not found:', paymentErr);
      return new Response('Payment not found', { status: 404 });
    }

    if (payment.status === 'completed') {
      return new Response('Already processed', { status: 200 });
    }

    const newStatus = state === 'COMPLETED' ? 'completed' : 'failed';

    // Update payment record
    await supabase
      .from('payments')
      .update({
        status: newStatus,
        intasend_invoice_id: invoice_id || null,
      })
      .eq('id', paymentId);

    // If payment was successful, enroll the user
    if (newStatus === 'completed' && payment.course_id) {
      const { error: enrollErr } = await supabase
        .from('enrollments')
        .insert({
          user_id: payment.user_id,
          course_id: payment.course_id,
          status: 'active',
        } as any);
        
      if (enrollErr) {
        // Just log the error, don't fail the webhook
        console.error('Failed to create enrollment:', enrollErr);
      }
    }

    return new Response('Webhook processed successfully', { status: 200 });
  } catch (error: any) {
    console.error('Webhook error:', error);
    return new Response('Webhook error', { status: 500 });
  }
});
