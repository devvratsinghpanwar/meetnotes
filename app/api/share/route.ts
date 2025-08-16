// app/api/share/route.ts
import sgMail from '@sendgrid/mail';
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';

sgMail.setApiKey(process.env.SENDGRID_API_KEY!);

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { summary, recipients } = await req.json();
  const msg = {
    to: recipients,
    from: process.env.SENDGRID_FROM_EMAIL!,
    subject: 'Meeting Summary',
    text: summary,
  };
  await sgMail.sendMultiple(msg);
  return NextResponse.json({ success: true });
}
