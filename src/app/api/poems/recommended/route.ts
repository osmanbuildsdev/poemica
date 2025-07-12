import { NextResponse } from "next/server";
import { db } from "@/db";
import { poems, users, follows, likes } from "@/db/schema";
import { eq, inArray, sql, desc, and, or, like } from "drizzle-orm";
import { getServerSession } from "next-auth";
import authOptions from "@/lib/auth";

export async function GET(request: Request) {
  try {

    const url = new URL(request.url);
    const preferredTags = url.searchParams.get('preferredTags')?.split(',') || [];
    
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {

      const popularPoems = await db
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
          author: {
            id: users.id,
            name: users.name,
            image: users.image,
          },
        })
        .from(poems)
        .leftJoin(users, eq(poems.authorId, users.id))
        .orderBy(desc(poems.likes))
        .limit(10);
      
      return NextResponse.json({ success: true, data: popularPoems });
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
    

    const userLikes = await db
      .select({ poemId: likes.poemId })
      .from(likes)
      .where(eq(likes.userId, userId));
      
    const likedPoemIds = userLikes.map(like => like.poemId);

    let recommendedPoems: any[] = [];
    
    if (followingIds.length > 0) {
      recommendedPoems = await db
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
          author: {
            id: users.id,
            name: users.name,
            image: users.image,
          },
        })
        .from(poems)
        .leftJoin(users, eq(poems.authorId, users.id))
        .where(inArray(poems.authorId, followingIds))
        .orderBy(desc(poems.createdAt))
        .limit(10);
    }
    

    if (recommendedPoems.length === 0) {
      const baseQuery = db
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
          author: {
            id: users.id,
            name: users.name,
            image: users.image,
          },
        })
        .from(poems)
        .leftJoin(users, eq(poems.authorId, users.id))
        .orderBy(desc(poems.createdAt))
        .limit(10);
      
      recommendedPoems = await baseQuery;
    }
      

    if (recommendedPoems.length < 5) {

      const trendingPoems = await db
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
          author: {
            id: users.id,
            name: users.name,
            image: users.image,
          },
        })
        .from(poems)
        .leftJoin(users, eq(poems.authorId, users.id))
        .orderBy(desc(poems.likes))
        .limit(10);
        

      const allPoemIds = recommendedPoems.map(poem => poem.id);
      const uniqueTrendingPoems = trendingPoems.filter(poem => !allPoemIds.includes(poem.id));
      
      recommendedPoems = [...recommendedPoems, ...uniqueTrendingPoems.slice(0, 10 - recommendedPoems.length)];
    }
    

    if (recommendedPoems.length === 0) {
      const latestPoems = await db
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
          author: {
            id: users.id,
            name: users.name,
            image: users.image,
          },
        })
        .from(poems)
        .leftJoin(users, eq(poems.authorId, users.id))
        .orderBy(desc(poems.createdAt))
        .limit(5);
        
      recommendedPoems = latestPoems;
    }


    console.log(`Returning ${recommendedPoems.length} recommended poems`);

    return NextResponse.json({ success: true, data: recommendedPoems });
    
  } catch (error) {
    console.error("Error fetching recommended poems:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}