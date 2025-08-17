// app/api/summaries/route.ts
import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/app/db';
import { summaries } from '@/app/db/schema';
import { eq } from 'drizzle-orm';

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const userSummaries = await db.select().from(summaries).where(eq(summaries.userId, userId));
  return NextResponse.json(userSummaries);
}
