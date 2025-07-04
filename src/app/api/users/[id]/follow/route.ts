import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { follows, users } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { getAuthenticatedUser } from "@/lib/api-auth";

export async function GET(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const auth = await getAuthenticatedUser(req);
  if (!auth.success) {
    return NextResponse.json({ isFollowing: false });
  }
  const userId = auth.user.id;
  const params = await context.params;
  const targetId = params.id;
  if (userId === targetId) return NextResponse.json({ isFollowing: false });
  const existing = await db.select().from(follows).where(and(eq(follows.followerId, userId), eq(follows.followingId, targetId)));
  return NextResponse.json({ isFollowing: existing.length > 0 });
}

export async function POST(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const auth = await getAuthenticatedUser(req);
  if (!auth.success) {
    return NextResponse.json({ isFollowing: false });
  }
  const userId = auth.user.id;
  const params = await context.params;
  const targetId = params.id;
  if (userId === targetId) return NextResponse.json({ isFollowing: false });
  const existing = await db.select().from(follows).where(and(eq(follows.followerId, userId), eq(follows.followingId, targetId)));
  if (existing.length > 0) {

    await db.delete(follows).where(and(eq(follows.followerId, userId), eq(follows.followingId, targetId)));
    return NextResponse.json({ isFollowing: false });
  } else {

    await db.insert(follows).values({ followerId: userId, followingId: targetId });
    return NextResponse.json({ isFollowing: true });
  }
}
