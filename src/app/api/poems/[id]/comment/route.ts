import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { comments, users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getServerSession } from "next-auth";
import authOptions from "@/lib/auth";


export async function GET(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const params = await context.params;
    const poemId = Number(params.id);
    if (!poemId || isNaN(poemId)) {
      return NextResponse.json({ success: false, message: "Geçersiz şiir." }, { status: 400 });
    }
    const allComments = await db
      .select({
        id: comments.id,
        content: comments.content,
        createdAt: comments.createdAt,
        author: {
          id: users.id,
          name: users.name,
          email: users.email,
          image: users.image,
        },
      })
      .from(comments)
      .leftJoin(users, eq(comments.userId, users.id))
      .where(eq(comments.poemId, poemId));
    return NextResponse.json({ success: true, comments: allComments });
  } catch (error) {
    console.error("Error in GET comments:", error);
    return NextResponse.json({ success: false, message: "Bir hata oluştu." }, { status: 500 });
  }
}

export async function POST(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ success: false, message: "Giriş yapmalısınız." }, { status: 401 });
    }

    const { content } = await req.json();
    if (!content || content.trim().length === 0) {
      return NextResponse.json({ success: false, message: "Yorum boş olamaz." }, { status: 400 });
    }


    const userArr = await db.select().from(users).where(eq(users.email, session.user.email));
    const user = userArr[0];
    if (!user) {
      return NextResponse.json({ success: false, message: "Kullanıcı bulunamadı." }, { status: 404 });
    }

    const params = await context.params;
    const poemId = Number(params.id);
    if (!poemId || isNaN(poemId)) {
      return NextResponse.json({ success: false, message: "Geçersiz şiir." }, { status: 400 });
    }
      const newCommentArr = await db.insert(comments).values({ 
      poemId, 
      userId: user.id, 
      content 
    }).returning();

    const newComment = newCommentArr[0];
    const author = { 
      id: user.id,
      name: user.name, 
      email: user.email,
      image: user.image
    };
    return NextResponse.json({ success: true, comment: { ...newComment, author } });
  } catch (error) {
    console.error("Error in POST comment:", error);
    return NextResponse.json({ success: false, message: "Bir hata oluştu." }, { status: 500 });
  }
} 