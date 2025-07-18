import { NextResponse } from "next/server";
import { db } from "@/db";
import { collections, collectionItems } from "@/db/schema";
import { desc, eq, and, count, sql } from "drizzle-orm";
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
    const withCounts = searchParams.get("withCounts") === "true";


    let userCollections;
    
    if (withCounts) {

      userCollections = await db
        .select({
          id: collections.id,
          name: collections.name,
          description: collections.description,
          coverImage: collections.coverImage,
          isPrivate: collections.isPrivate,
          createdAt: collections.createdAt,
          updatedAt: collections.updatedAt,
          poemCount: sql<number>`COUNT(${collectionItems.poemId})`,
        })
        .from(collections)
        .leftJoin(collectionItems, eq(collections.id, collectionItems.collectionId))
        .where(eq(collections.userId, session.user.id))
        .groupBy(collections.id)
        .orderBy(desc(collections.updatedAt));
    } else {

      userCollections = await db
        .select({
          id: collections.id,
          name: collections.name,
          description: collections.description,
          coverImage: collections.coverImage,
          isPrivate: collections.isPrivate,
          createdAt: collections.createdAt,
          updatedAt: collections.updatedAt,
        })
        .from(collections)
        .where(eq(collections.userId, session.user.id))
        .orderBy(desc(collections.updatedAt));
    }    return NextResponse.json({ 
      success: true, 
      data: userCollections,
      collections: userCollections
    });
  } catch (error) {
    console.error("Koleksiyonlar getirilirken hata:", error);
    return NextResponse.json(
      { success: false, message: "Sunucu hatası", data: [], collections: [] },
      { status: 500 }
    );
  }
}


export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, message: "Bu işlem için giriş yapmalısınız" },
        { status: 401 }
      );
    }
    
    const { name, description, isPrivate } = await request.json();
    
    if (!name || name.trim() === "") {
      return NextResponse.json(
        { success: false, message: "Koleksiyon adı gereklidir" },
        { status: 400 }
      );
    }


    const result = await db.insert(collections).values({
      userId: session.user.id,
      name: name.trim(),
      description: description?.trim() || null,
      isPrivate: isPrivate || false,
    }).returning();

    const newCollection = result[0];
    
    return NextResponse.json({ 
      success: true, 
      message: "Koleksiyon başarıyla oluşturuldu",
      data: newCollection 
    });
  } catch (error) {
    console.error("Koleksiyon oluşturulurken hata:", error);
    return NextResponse.json(
      { success: false, message: "Sunucu hatası" },
      { status: 500 }
    );
  }
}
