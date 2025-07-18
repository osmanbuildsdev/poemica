import { NextResponse } from "next/server";
import { db } from "@/db";
import { collections, collectionItems, poems, users } from "@/db/schema";
import { desc, eq, and, sql } from "drizzle-orm";
import { getServerSession } from "next-auth";
import authOptions from "@/lib/auth";


export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, message: "Bu işlem için giriş yapmalısınız" },
        { status: 401 }
      );
    }

    const collectionId = parseInt(params.id);
    if (isNaN(collectionId)) {
      return NextResponse.json(
        { success: false, message: "Geçersiz koleksiyon ID'si" },
        { status: 400 }
      );
    }


    const collection = await db
      .select()
      .from(collections)
      .where(
        and(
          eq(collections.id, collectionId),
          eq(collections.userId, session.user.id)
        )
      )
      .limit(1);

    if (collection.length === 0) {
      return NextResponse.json(
        { success: false, message: "Koleksiyon bulunamadı veya erişim yetkiniz yok" },
        { status: 403 }
      );
    }


    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    
    const validPage = page > 0 ? page : 1;
    const validLimit = limit > 0 && limit <= 50 ? limit : 10;
    const offset = (validPage - 1) * validLimit;


    const collectionPoems = await db
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
        addedAt: collectionItems.addedAt,
        note: collectionItems.note,
        author: {
          id: users.id,
          name: users.name,
          image: users.image,
        },
      })
      .from(collectionItems)
      .innerJoin(poems, eq(collectionItems.poemId, poems.id))
      .innerJoin(users, eq(poems.authorId, users.id))
      .where(eq(collectionItems.collectionId, collectionId))
      .orderBy(desc(collectionItems.addedAt))
      .limit(validLimit)
      .offset(offset);

    const totalCount = await db
      .select({ count: sql<number>`count(*)` })
      .from(collectionItems)
      .where(eq(collectionItems.collectionId, collectionId));

    const totalItems = Number(totalCount[0].count);
    const totalPages = Math.ceil(totalItems / validLimit);

    return NextResponse.json({
      success: true,
      data: collectionPoems,
      collection: collection[0],
      pagination: {
        page: validPage,
        limit: validLimit,
        totalItems,
        totalPages,
        hasNextPage: validPage < totalPages,
        hasPrevPage: validPage > 1,
      },
    });
  } catch (error) {
    console.error("Koleksiyon şiirleri getirilirken hata:", error);
    return NextResponse.json(
      { success: false, message: "Sunucu hatası" },
      { status: 500 }
    );
  }
}


export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, message: "Bu işlem için giriş yapmalısınız" },
        { status: 401 }
      );
    }

    const collectionId = parseInt(params.id);
    if (isNaN(collectionId)) {
      return NextResponse.json(
        { success: false, message: "Geçersiz koleksiyon ID'si" },
        { status: 400 }
      );
    }


    const collection = await db
      .select()
      .from(collections)
      .where(
        and(
          eq(collections.id, collectionId),
          eq(collections.userId, session.user.id)
        )
      )
      .limit(1);

    if (collection.length === 0) {
      return NextResponse.json(
        { success: false, message: "Koleksiyon bulunamadı veya erişim yetkiniz yok" },
        { status: 403 }
      );
    }


    const { poemId, note } = await request.json();
    
    if (!poemId || isNaN(parseInt(poemId))) {
      return NextResponse.json(
        { success: false, message: "Geçerli bir şiir ID'si gereklidir" },
        { status: 400 }
      );
    }


    await db
      .insert(collectionItems)
      .values({
        collectionId,
        poemId: parseInt(poemId),
        note: note || null,
      })
      .onConflictDoUpdate({
        target: [collectionItems.collectionId, collectionItems.poemId],
        set: {
          addedAt: new Date(),
          note: note || null,
        },
      });


    await db
      .update(collections)
      .set({ updatedAt: new Date() })
      .where(eq(collections.id, collectionId));

    return NextResponse.json({
      success: true,
      message: "Şiir koleksiyona başarıyla eklendi",
    });
  } catch (error) {
    console.error("Şiir koleksiyona eklenirken hata:", error);
    return NextResponse.json(
      { success: false, message: "Sunucu hatası" },
      { status: 500 }
    );
  }
}
