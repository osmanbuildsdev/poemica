import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { poems, users, follows } from "@/db/schema";
import { eq, desc, inArray, and } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get("userId");
    
    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Kullanıcı ID'si gerekli" },
        { status: 400 }
      );
    }


    const followings = await db
      .select({ followingId: follows.followingId })
      .from(follows)
      .where(eq(follows.followerId, userId));


    if (followings.length === 0) {
      return NextResponse.json({ 
        success: true, 
        message: "Takip edilen kullanıcı bulunamadı",
        data: [] 
      });
    }


    const followingIds = followings.map(follow => follow.followingId);


    const poemsWithAuthors = await db
      .select({
        id: poems.id,
        title: poems.title,
        content: poems.content,
        authorId: poems.authorId,
        tags: poems.tags,
        likes: poems.likes,
        views: poems.views,
        createdAt: poems.createdAt,
        updatedAt: poems.updatedAt,
        author: {
          id: users.id,
          name: users.name,
          email: users.email,
          image: users.image,
          bio: users.bio
        }
      })
      .from(poems)
      .innerJoin(users, eq(poems.authorId, users.id))
      .where(inArray(poems.authorId, followingIds))
      .orderBy(desc(poems.createdAt))
      .limit(20);

    return NextResponse.json({ 
      success: true, 
      data: poemsWithAuthors 
    });

  } catch (error) {
    console.error("Feed şiirleri getirilirken hata:", error);
    return NextResponse.json(
      { success: false, message: "Şiirler yüklenirken bir hata oluştu" },
      { status: 500 }
    );
  }
} 