// app/api/summarize/route.ts
import { Groq } from 'groq-sdk';
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/app/db';
import { summaries } from '@/app/db/schema';
import { eq } from 'drizzle-orm';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { transcript, prompt } = await req.json();
  const completion = await groq.chat.completions.create({
    messages: [
      { role: 'system', content: 'You are a helpful assistant that summarizes meeting transcripts.' },
      { role: 'user', content: `Transcript: ${transcript}\n\nInstructions: ${prompt}` },
    ],
    model: 'llama3-8b-8192',  
  });
  const summaryText = completion.choices[0]?.message?.content || 'Error';

  // Save to DB
  await db.insert(summaries).values({
    userId,
    transcript,
    prompt,
    summary: summaryText,
  });

  return NextResponse.json({ summary: summaryText });
}
