import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.39.3";
import { PDFDocument, rgb, StandardFonts } from "npm:pdf-lib@1.17.1";

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

    if (!course_id || !user_id) {
      throw new Error('Missing course_id or user_id');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // 1. Check if certificate already exists
    const { data: existing } = await supabase
      .from('certificates')
      .select('*')
      .eq('course_id', course_id)
      .eq('user_id', user_id)
      .maybeSingle();

    if (existing) {
      return new Response(JSON.stringify({ certificate: existing, message: 'Already generated' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // 2. Fetch User and Course details
    const { data: profile } = await supabase.from('profiles').select('*').eq('id', user_id).single();
    const { data: course } = await supabase.from('courses').select('*').eq('id', course_id).single();

    if (!profile || !course) {
      throw new Error('User or Course not found');
    }

    // 3. Generate Verification Code and Certificate Number
    const certNumber = `CERT-${Math.floor(Math.random() * 1000000).toString().padStart(6, '0')}`;
    const verifyCode = Math.random().toString(36).substring(2, 10).toUpperCase();

    // 4. Generate PDF
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([842, 595]); // A4 landscape

    const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    
    // Draw Border
    page.drawRectangle({
      x: 20, y: 20, width: 802, height: 555,
      borderColor: rgb(0.1, 0.5, 0.8),
      borderWidth: 10,
    });

    // Title
    page.drawText('Certificate of Completion', {
      x: 180, y: 480, size: 40, font: helveticaBold, color: rgb(0.1, 0.1, 0.1)
    });

    page.drawText('This is to certify that', {
      x: 330, y: 400, size: 18, font: helveticaFont, color: rgb(0.4, 0.4, 0.4)
    });

    // Name
    page.drawText(profile.full_name || 'Student', {
      x: 421 - ((profile.full_name?.length || 7) * 8), y: 340, size: 30, font: helveticaBold, color: rgb(0.1, 0.5, 0.8)
    });

    page.drawText('has successfully completed the course', {
      x: 280, y: 280, size: 18, font: helveticaFont, color: rgb(0.4, 0.4, 0.4)
    });

    // Course Name
    page.drawText(course.title, {
      x: 421 - ((course.title.length) * 6), y: 220, size: 24, font: helveticaBold, color: rgb(0.1, 0.1, 0.1)
    });

    // IDs
    page.drawText(`Certificate ID: ${certNumber}`, {
      x: 50, y: 50, size: 12, font: helveticaFont, color: rgb(0.5, 0.5, 0.5)
    });
    page.drawText(`Verification Code: ${verifyCode}`, {
      x: 600, y: 50, size: 12, font: helveticaFont, color: rgb(0.5, 0.5, 0.5)
    });

    const pdfBytes = await pdfDoc.save();

    // 5. Upload PDF
    const pdfPath = `${user_id}/${certNumber}.pdf`;
    const { error: uploadError } = await supabase.storage
      .from('certificates')
      .upload(pdfPath, pdfBytes, { contentType: 'application/pdf' });

    if (uploadError) throw uploadError;

    // 6. Insert record
    const { data: newCert, error: insertError } = await supabase
      .from('certificates')
      .insert({
        user_id,
        course_id,
        certificate_number: certNumber,
        verification_code: verifyCode,
        pdf_path: pdfPath,
      })
      .select()
      .single();

    if (insertError) throw insertError;

    return new Response(JSON.stringify({ certificate: newCert }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error('Error generating certificate:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });
  }
});
