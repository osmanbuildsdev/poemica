import { db } from "@/db";
import { poems, users } from "@/db/schema";
import { NextRequest, NextResponse } from "next/server";
import { eq, desc, sql } from "drizzle-orm";


export async function GET(request: NextRequest) {
  try {
    const limit = Number(request.nextUrl.searchParams.get("limit") || "9");
    const offset = Number(request.nextUrl.searchParams.get("offset") || "0");
    const sortBy = request.nextUrl.searchParams.get("sortBy") || "newest";
    const tag = request.nextUrl.searchParams.get("tag");
    const search = request.nextUrl.searchParams.get("search");
    

    let allPoems;
    

    const baseQuery = {
      id: poems.id,
      title: poems.title,
      content: poems.content,
      authorId: poems.authorId,
      coverImage: poems.coverImage,
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
    };
    

    switch (sortBy) {
      case "oldest":
        allPoems = await db
          .select(baseQuery)
          .from(poems)
          .innerJoin(users, eq(poems.authorId, users.id))
          .orderBy(poems.createdAt)
          .limit(limit)
          .offset(offset);
        break;
      case "popular":
        allPoems = await db
          .select(baseQuery)
          .from(poems)
          .innerJoin(users, eq(poems.authorId, users.id))
          .orderBy(desc(poems.likes))
          .limit(limit)
          .offset(offset);
        break;
      case "views":
        allPoems = await db
          .select(baseQuery)
          .from(poems)
          .innerJoin(users, eq(poems.authorId, users.id))
          .orderBy(desc(poems.views))
          .limit(limit)
          .offset(offset);
        break;
      case "newest":
      default:
        allPoems = await db
          .select(baseQuery)
          .from(poems)
          .innerJoin(users, eq(poems.authorId, users.id))
          .orderBy(desc(poems.createdAt))
          .limit(limit)
          .offset(offset);
        break;    }

    return NextResponse.json({ 
      success: true, 
      poems: allPoems 
    });

  } catch (error) {
    console.error("Şiirler getirilirken hata:", error);
    return NextResponse.json(
      { success: false, message: "Şiirler yüklenirken bir hata oluştu" },
      { status: 500 }
    );
  }
}


export async function POST(req: NextRequest) {
  try {

    const userEmail = req.headers.get("x-auth-email");
    const userId = req.headers.get("x-auth-user-id");

    if (!userEmail || !userId) {
      return NextResponse.json(
        { error: "Oturum açmanız gerekiyor." },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { title, content, tags = [], coverImage } = body;
    
    if (!title || !content) {
      return NextResponse.json(
        { error: "Başlık ve içerik gereklidir" },
        { status: 400 }
      );
    }
    

    const existingUser = await db.select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (existingUser.length === 0) {
      return NextResponse.json(
        { error: "Geçersiz kullanıcı." },
        { status: 403 }
      );
    }
    
    const newPoem = await db.insert(poems).values({
      title,
      content,
      authorId: userId,
      tags,
      coverImage,
      likes: 0,
      views: 0
    }).returning();
    
    if (!newPoem || newPoem.length === 0) {
      return NextResponse.json(
        { error: "Şiir kaydedilemedi" },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ 
      success: true,
      poem: newPoem[0] 
    });
  } catch (error) {
    console.error("Şiir ekleme hatası:", error);
    return NextResponse.json(
      { error: "Şiir kaydedilirken bir hata oluştu" },
      { status: 500 }
    );
  }
}