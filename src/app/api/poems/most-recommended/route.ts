import { NextResponse } from "next/server";
import { db } from "@/db";
import { poems, users, recommendations } from "@/db/schema";
import { desc, eq, count, sql } from "drizzle-orm";

export async function GET() {
  try {

    const mostRecommendedPoems = await db
      .select({
        id: poems.id,
        title: poems.title,
        content: poems.content,
        coverImage: poems.coverImage,
        authorId: poems.authorId,
        likes: poems.likes,
        recommends: count(recommendations.poemId).as('recommends'),
        author: {
          id: users.id,
          name: users.name,
          image: users.image,
        },
      })
      .from(poems)
      .leftJoin(users, eq(poems.authorId, users.id))
      .leftJoin(recommendations, eq(poems.id, recommendations.poemId))      .groupBy(poems.id, users.id, users.name, users.image)
      .having(sql`count(${recommendations.poemId}) > 0`)
      .orderBy(desc(sql`recommends`))
      .limit(10);

    console.log(`Found ${mostRecommendedPoems.length} most recommended poems`);


    if (mostRecommendedPoems.length === 0) {
      const newestPoems = await db
        .select({
          id: poems.id,
          title: poems.title,
          content: poems.content,
          coverImage: poems.coverImage,
          authorId: poems.authorId,
          likes: poems.likes,
          recommends: sql<number>`0`.as('recommends'),
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

      console.log(`Falling back to ${newestPoems.length} newest poems instead`);

      return NextResponse.json({ success: true, data: newestPoems });
    }

    return NextResponse.json({ success: true, data: mostRecommendedPoems });
  } catch (error) {
    console.error("Error fetching most recommended poems:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}