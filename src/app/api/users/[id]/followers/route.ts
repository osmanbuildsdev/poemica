import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { follows, users } from "@/db/schema";
import { eq, inArray } from "drizzle-orm";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {

    const resolvedParams = await params;
    const id = resolvedParams.id;

    const followerRecords = await db.select({
      followerId: follows.followerId
    })
    .from(follows)
    .where(eq(follows.followingId, id));
    

    if (followerRecords.length === 0) {
      return NextResponse.json({ followers: [] });
    }
    

    const followerIds = followerRecords.map(record => record.followerId);
    const followerUsers = await db.select({
      id: users.id,
      name: users.name,
      image: users.image
    })
    .from(users)
    .where(inArray(users.id, followerIds));
    
    return NextResponse.json({ followers: followerUsers });
  } catch (e) {
    return NextResponse.json({ error: "Takipçiler alınamadı." }, { status: 500 });
  }
}
