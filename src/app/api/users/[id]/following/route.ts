import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { follows, users } from "@/db/schema";
import { eq, inArray } from "drizzle-orm";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {

    const resolvedParams = await params;
    const id = resolvedParams.id;

    const followingRecords = await db.select({
      followingId: follows.followingId
    })
    .from(follows)
    .where(eq(follows.followerId, id));
    

    if (followingRecords.length === 0) {
      return NextResponse.json({ following: [] });
    }

    const followingIds = followingRecords.map(record => record.followingId);
    const followingUsers = await db.select({
      id: users.id,
      name: users.name,
      image: users.image
    })
    .from(users)
    .where(inArray(users.id, followingIds));
    
    return NextResponse.json({ following: followingUsers });
  } catch (e) {
    return NextResponse.json({ error: "Takip edilenler alınamadı." }, { status: 500 });
  }
}
