import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

Deno.serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { course_title, lesson_title, lesson_content, messages } = await req.json();

    const anthropicApiKey = Deno.env.get('ANTHROPIC_API_KEY');
    if (!anthropicApiKey) {
      throw new Error('Missing ANTHROPIC_API_KEY environment variable');
    }

    const systemPrompt = `You are a helpful AI tutor for mbuku LMS.
You are currently helping a student who is taking the course "${course_title}".
They are currently on the lesson: "${lesson_title}".

Here is the lesson content for context:
${lesson_content ? lesson_content.substring(0, 3000) : 'No content provided.'}

Your goal is to help the student understand this material. Be encouraging, concise, and pedagogically sound. Do not give direct answers to quizzes or tests, but guide them to the answer.`;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': anthropicApiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 1024,
        system: systemPrompt,
        messages: messages,
      }),
    });

    if (!response.ok) {
      const errBody = await response.text();
      console.error('Anthropic API Error:', errBody);
      throw new Error(`Anthropic API returned ${response.status}: ${errBody}`);
    }

    const data = await response.json();

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error('Error in ai-tutor function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });
  }
});
