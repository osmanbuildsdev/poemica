import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { poems, users } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {

    const resolvedParams = await params;
    const id = resolvedParams.id;
    

    const { searchParams } = new URL(req.url);
    const tag = searchParams.get('tag');
    

    const userPoems = await db.select({
      id: poems.id,
      title: poems.title,
      content: poems.content,
      authorId: poems.authorId,
      createdAt: poems.createdAt,
      updatedAt: poems.updatedAt,
      coverImage: poems.coverImage,
      likes: poems.likes,
      views: poems.views,
      tags: poems.tags,
      author: {
        id: users.id,
        name: users.name,
        image: users.image
      }
    })
    .from(poems)
    .leftJoin(users, eq(poems.authorId, users.id))
    .where(eq(poems.authorId, id))
    .orderBy(desc(poems.createdAt));
    

    let filteredPoems = userPoems;
    if (tag) {
      filteredPoems = userPoems.filter(poem => 
        poem.tags && Array.isArray(poem.tags) && poem.tags.includes(tag)
      );
    }
    
    return NextResponse.json({ poems: filteredPoems });
  } catch (e) {
    console.error("Kullanıcı şiirleri getirme hatası:", e);
    return NextResponse.json({ error: "Şiirler alınamadı." }, { status: 500 });
  }
}
