import { NextResponse } from "next/server";
import { db } from "@/db";
import { poems, users, recommendations } from "@/db/schema";
import { eq, desc, count } from "drizzle-orm";

export async function GET() {
  try {


    const recommendedPoemsCount = db
      .select({
        poemId: recommendations.poemId,
        recommendCount: count(recommendations.poemId).as('recommendCount'),
      })
      .from(recommendations)
      .groupBy(recommendations.poemId)
      .as('recommendCounts');


    const mostRecommendedPoems = await db
      .select({
        id: poems.id,
        title: poems.title,
        content: poems.content,
        coverImage: poems.coverImage,
        authorId: poems.authorId,
        likes: poems.likes,
        views: poems.views,
        recommends: recommendedPoemsCount.recommendCount,
        tags: poems.tags,
        createdAt: poems.createdAt,
        author: {
          id: users.id,
          name: users.name,
          image: users.image,
        },
      })
      .from(poems)
      .leftJoin(users, eq(poems.authorId, users.id))
      .leftJoin(recommendedPoemsCount, eq(poems.id, recommendedPoemsCount.poemId))
      .orderBy(desc(recommendedPoemsCount.recommendCount))
      .limit(10);
    
    console.log(`Found ${mostRecommendedPoems.length} most recommended poems`);
    

    if (mostRecommendedPoems.length === 0) {
      const popularPoems = await db
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
          author: {
            id: users.id,
            name: users.name,
            image: users.image,
          },
        })
        .from(poems)
        .leftJoin(users, eq(poems.authorId, users.id))
        .orderBy(desc(poems.likes))
        .limit(5);
        
      console.log(`Falling back to ${popularPoems.length} liked poems instead`);
      

      const poemsWithZeroRecommendations = popularPoems.map(poem => ({
        ...poem,
        recommends: 0
      }));
      
      return NextResponse.json({ success: true, data: poemsWithZeroRecommendations });
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
