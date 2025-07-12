import { NextResponse } from "next/server";
import { db } from "@/db";
import { poems, users, recommendations, follows } from "@/db/schema";
import { eq, desc, inArray, and, sql } from "drizzle-orm";
import { getServerSession } from "next-auth";
import authOptions from "@/lib/auth";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {

      return NextResponse.json({ 
        success: false, 
        message: "Bu özellik için giriş yapmalısınız" 
      }, { status: 401 });
    }


    const currentUser = await db
      .select()
      .from(users)
      .where(eq(users.email, session.user.email))
      .limit(1);

    if (!currentUser.length) {
      return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });
    }

    const userId = currentUser[0].id;


    const following = await db
      .select({ followingId: follows.followingId })
      .from(follows)
      .where(eq(follows.followerId, userId));

    const followingIds = following.map((f) => f.followingId);

    if (followingIds.length === 0) {

      return NextResponse.json({ success: true, data: [] });
    }
    const recommendedPoems = await db
      .select({
        id: poems.id,
        title: poems.title,
        content: poems.content,
        coverImage: poems.coverImage,
        authorId: poems.authorId,
        likes: poems.likes,
        views: poems.views,
        tags: poems.tags,
        createdAt: poems.createdAt,
        recommends: sql<number>`1`.as('recommends'),
        author: {
          id: users.id,
          name: users.name,
          image: users.image,
        },
        recommendedBy: recommendations.userId
      })
      .from(recommendations)
      .innerJoin(poems, eq(recommendations.poemId, poems.id))
      .innerJoin(users, eq(poems.authorId, users.id))
      .where(
        inArray(recommendations.userId, followingIds)
      )
      .orderBy(desc(recommendations.createdAt))
      .limit(10);

    return NextResponse.json({ success: true, data: recommendedPoems });
  } catch (error) {
    console.error("Error fetching recommendations by following:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
