// app/api/summaries/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/app/db';
import { summaries } from '@/app/db/schema';
import { and, eq } from 'drizzle-orm';

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const { userId } = await auth();
  if (!userId) {
    return new Response('Unauthorized', { status: 401 });
  }

  // Convert the string param to a number
  const summaryId = parseInt(params.id, 10);

  // Check if the conversion was successful
  if (isNaN(summaryId)) {
    return new Response('Invalid summary ID', { status: 400 });
  }

  try {
    // The fix is here: we use the converted number
    await db.delete(summaries).where(
      and(
        eq(summaries.id, summaryId), // Compare number to number
        eq(summaries.userId, userId)
      )
    );
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete summary:", error);
    return NextResponse.json({ error: 'Failed to delete summary' }, { status: 500 });
  }
}