// app/api/summarize/route.ts
import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import Groq from 'groq-sdk';

// Initialize Groq client
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    const { transcript, prompt } = await req.json();

    if (!transcript) {
      return new Response('Transcript is required', { status: 400 });
    }

    // 1. Generate summary from Groq AI
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'You are an expert meeting summarizer. Your goal is to provide clear, concise, and accurate summaries of meeting transcripts based on the user\'s specific instructions.',
        },
        {
          role: 'user',
          content: `Here is the meeting transcript:\n\n${transcript}\n\nPlease follow this instruction: "${prompt}"`,
        },
      ],
      model: 'llama3-8b-8192',
    });

    const generatedSummary = chatCompletion.choices[0]?.message?.content || 'Sorry, I couldn\'t generate a summary.';

    // 2. REMOVED DATABASE LOGIC. Only return the generated summary.
    return NextResponse.json({ summary: generatedSummary });

  } catch (error) {
    console.error('Failed to generate summary:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}