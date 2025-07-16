import { NextResponse } from "next/server";
import { db } from "@/db";
import { savedPoems, poems, users } from "@/db/schema";
import { desc, eq, and, sql } from "drizzle-orm";
import { getServerSession } from "next-auth";
import authOptions from "@/lib/auth";


export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, message: "Bu işlem için giriş yapmalısınız" },
        { status: 401 }
      );
    }


    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const isArchived = searchParams.get("archived") === "true";
    const isRead = searchParams.get("read") === "true" ? true : 
                 searchParams.get("read") === "false" ? false : undefined;
    

    const validPage = page > 0 ? page : 1;
    const validLimit = limit > 0 && limit <= 50 ? limit : 10;
    const offset = (validPage - 1) * validLimit;


    const whereConditions = [
      eq(savedPoems.userId, session.user.id),
      eq(savedPoems.isArchived, isArchived)
    ];
    

    if (isRead !== undefined) {
      whereConditions.push(eq(savedPoems.isRead, isRead));
    }


    const savedPoemsList = await db
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
        savedAt: savedPoems.createdAt,
        isRead: savedPoems.isRead,
        isArchived: savedPoems.isArchived,
        author: {
          id: users.id,
          name: users.name,
          image: users.image,
        },
      })
      .from(savedPoems)
      .innerJoin(poems, eq(savedPoems.poemId, poems.id))
      .innerJoin(users, eq(poems.authorId, users.id))
      .where(and(...whereConditions))
      .orderBy(desc(savedPoems.createdAt))
      .limit(validLimit)
      .offset(offset);

    const totalCountResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(savedPoems)
      .where(and(...whereConditions));
    
    const totalItems = Number(totalCountResult[0].count);
    const totalPages = Math.ceil(totalItems / validLimit);

    return NextResponse.json({
      success: true,
      data: savedPoemsList,
      pagination: {
        page: validPage,
        limit: validLimit,
        totalItems,
        totalPages,
        hasNextPage: validPage < totalPages,
        hasPrevPage: validPage > 1
      }
    });
  } catch (error) {
    console.error("Kaydedilmiş şiirler getirilirken hata:", error);
    return NextResponse.json(
      { success: false, message: "Sunucu hatası" },
      { status: 500 }
    );
  }
}
