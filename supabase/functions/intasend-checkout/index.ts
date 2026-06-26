import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { course_id, user_id } = await req.json();
    if (!course_id || !user_id) throw new Error('Missing course_id or user_id');

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get Course details
    const { data: course, error: courseErr } = await supabase
      .from('courses')
      .select('*')
      .eq('id', course_id)
      .single();
    if (courseErr || !course) throw new Error('Course not found');

    // Get User profile
    const { data: profile, error: profileErr } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user_id)
      .single();
    if (profileErr || !profile) throw new Error('User not found');

    // Insert pending payment record
    const { data: payment, error: paymentErr } = await supabase
      .from('payments')
      .insert({
        user_id,
        course_id,
        amount_kes: course.price_kes,
        status: 'pending',
      })
      .select('id')
      .single();
    if (paymentErr || !payment) throw new Error('Failed to create payment record');

    // IntaSend Checkout
    const intasendSecret = Deno.env.get('INTASEND_SECRET_KEY');
    const intasendPublic = Deno.env.get('INTASEND_PUBLIC_KEY');
    const hostUrl = Deno.env.get('HOST_URL') || 'http://localhost:5173'; // Fallback for local dev

    // Check if we have valid keys, if not, fake a success response for demo purposes
    if (!intasendSecret || !intasendPublic) {
      console.warn('Missing IntaSend keys. Falling back to mock payment flow.');
      // Auto-approve payment in mock mode
      await supabase.from('payments').update({ status: 'completed' }).eq('id', payment.id);
      await supabase.from('enrollments').insert({ user_id, course_id, status: 'active' } as any);
      
      // Return URL to redirect user to learning page directly
      return new Response(JSON.stringify({ url: `${hostUrl}/learn/courses/${course.slug}` }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const payload = {
      public_key: intasendPublic,
      amount: course.price_kes,
      currency: "KES",
      email: profile.email,
      first_name: profile.full_name?.split(' ')[0] || 'Student',
      last_name: profile.full_name?.split(' ').slice(1).join(' ') || '',
      host: hostUrl,
      redirect_url: `${hostUrl}/learn`, // Redirect after payment UI
      api_ref: payment.id, // We'll receive this back in the webhook
    };

    const response = await fetch('https://payment.intasend.com/api/v1/checkout/', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${intasendSecret}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('IntaSend API error:', errText);
      throw new Error('Failed to initialize payment gateway');
    }

    const result = await response.json();
    // result.url should contain the checkout link
    if (!result.url) {
      throw new Error('IntaSend response did not contain checkout URL');
    }

    return new Response(JSON.stringify({ url: result.url }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error('Checkout error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
