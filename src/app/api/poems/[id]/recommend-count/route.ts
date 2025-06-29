import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { recommendations, users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getServerSession } from "next-auth";
import authOptions from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {

    const id = req.nextUrl.pathname.split("/").slice(-2, -1)[0];
    const poemId = Number(id);

    if (!poemId || isNaN(poemId)) {
      return NextResponse.json(
        { success: false, message: "Geçersiz şiir." },
        { status: 400 }
      );
    }


    const all = await db
      .select()
      .from(recommendations)
      .where(eq(recommendations.poemId, poemId));

    const count = all.length;


    let recommended = false;
    const session = await getServerSession(authOptions);

    if (session?.user?.email) {
      const userArr = await db
        .select()
        .from(users)
        .where(eq(users.email, session.user.email));
      const user = userArr[0];

      if (user) {
        recommended = all.some((r) => r.userId === user.id);
      }
    }

    return NextResponse.json({ success: true, count, recommended });
  } catch (error) {
    console.error("Error in GET recommend-count:", error);
    return NextResponse.json(
      { success: false, message: "Bir hata oluştu." },
      { status: 500 }
    );
  }
}
