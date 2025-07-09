import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/db";
import { ClassReviewLikesTable } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { withAuth, errorResponse } from "@/lib/utils/api-utils";

// POST: Like/dislike/cancel a review
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string; reviewId: string } }
) {
  return withAuth(req, async (user) => {
    const reviewId = Number(params.reviewId);
    if (!reviewId) {
      return errorResponse("Invalid review ID", 400);
    }
    const { action } = await req.json();
    if (!["like", "dislike", "cancel"].includes(action)) {
      return errorResponse("Invalid action", 400);
    }
    try {
      // Remove any existing like/dislike by this user for this review
      await db
        .delete(ClassReviewLikesTable)
        .where(
          and(
            eq(ClassReviewLikesTable.reviewId, reviewId),
            eq(ClassReviewLikesTable.userId, user.id)
          )
        );
      if (action === "like" || action === "dislike") {
        await db.insert(ClassReviewLikesTable).values({
          reviewId,
          userId: user.id,
          type: action,
        });
      }
      // Return updated counts and userLikeStatus
      const likes = await db
        .select({
          type: ClassReviewLikesTable.type,
          userId: ClassReviewLikesTable.userId,
        })
        .from(ClassReviewLikesTable)
        .where(eq(ClassReviewLikesTable.reviewId, reviewId));
      const likeCount = likes.filter((l) => l.type === "like").length;
      const dislikeCount = likes.filter((l) => l.type === "dislike").length;
      let userLikeStatus = null;
      const userLike = likes.find((l) => l.userId === user.id);
      if (userLike) userLikeStatus = userLike.type;
      return NextResponse.json({ likeCount, dislikeCount, userLikeStatus });
    } catch (error) {
      console.error("[REVIEW LIKE API] Error", error);
      return errorResponse("Failed to update like/dislike");
    }
  });
}
