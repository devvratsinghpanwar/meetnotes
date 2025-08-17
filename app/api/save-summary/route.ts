// app/api/save-summary/route.ts
import { db } from '@/app/db';
import { summaries } from '@/app/db/schema';
import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    // Get all the necessary data from the frontend
    const { transcript, prompt, summary } = await req.json();

    const newSummary = {
      // Your schema expects an integer, so we don't pass a string ID
      userId,
      transcript,
      prompt,
      summary,
      createdAt: new Date(),
    };

    await db.insert(summaries).values(newSummary);

    return NextResponse.json({ success: true, message: 'Summary saved.' });

  } catch (error) {
    console.error('Failed to save summary:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}