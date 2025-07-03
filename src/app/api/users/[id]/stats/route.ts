
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { poems, comments, likes } from "@/db/schema";
import { eq, sql, and } from "drizzle-orm";
import { getServerSession } from "next-auth";
import authOptions from "@/lib/auth";


export async function GET(req: NextRequest) {

  const urlParts = req.nextUrl.pathname.split('/');
  const id = urlParts[urlParts.length - 2];
  try {
    console.log('Stats API called for user ID:', id);

    const session = await getServerSession(authOptions);    console.log('Session user:', session?.user?.id);










    const userPoems = await db
      .select({
        id: poems.id,
        title: poems.title,
        views: poems.views,
        likes: poems.likes,
      })
      .from(poems)
      .where(eq(poems.authorId, id));


    const totalViews = userPoems.reduce((sum, poem) => sum + (poem.views || 0), 0);
    const totalLikes = userPoems.reduce((sum, poem) => sum + (poem.likes || 0), 0);


    const totalCommentsResult = await db
      .select({ count: sql`count(*)` })
      .from(comments)
      .innerJoin(poems, eq(poems.id, comments.poemId))
      .where(eq(poems.authorId, id));


    const mostViewedPoem = userPoems.length > 0
      ? userPoems.reduce((max, poem) => (poem.views || 0) > (max.views || 0) ? poem : max)
      : null;

    const mostLikedPoem = userPoems.length > 0
      ? userPoems.reduce((max, poem) => (poem.likes || 0) > (max.likes || 0) ? poem : max)
      : null;


    const weeklyViews = userPoems.reduce(
      (sum, poem) => sum + ((poem.views || 0) > 0 ? 1 : 0),
      0
    );

    const weeklyLikes = userPoems.reduce(
      (sum, poem) => sum + ((poem.likes || 0) > 0 ? 1 : 0),
      0
    );

    const statsResponse = {
      success: true,
      stats: {
        totalViews,
        totalLikes,
        totalComments: Number(totalCommentsResult[0]?.count) || 0,
        mostViewedPoem,
        mostLikedPoem,
        totalPoems: userPoems.length,
        weeklyViews,
        weeklyLikes,
      },
    };
    
    console.log('Returning stats:', statsResponse);
    return NextResponse.json(statsResponse);
  } catch (error) {
    console.error("Stats fetch error:", error);
    return NextResponse.json(
      { success: false, message: "İstatistikler alınırken bir hata oluştu." },
      { status: 500 }
    );
  }
}
