// app/api/summaries/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/app/db";
import { summaries } from "@/app/db/schema";
import { and, eq } from "drizzle-orm";

// Next.js 15 route handlers require `params` to be a Promise
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<Response> {
  // Await Clerk's auth() to get userId
  const { userId } = await auth();

  if (!userId) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { id } = await params;
  const summaryId = parseInt(id, 10);

  if (isNaN(summaryId)) {
    return new Response("Invalid summary ID", { status: 400 });
  }

  try {
    await db
      .delete(summaries)
      .where(and(eq(summaries.id, summaryId), eq(summaries.userId, userId)));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete summary:", error);
    return NextResponse.json(
      { error: "Failed to delete summary" },
      { status: 500 }
    );
  }
}
