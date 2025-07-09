import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/db";
import {
  ClassReviewsTable,
  UsersTable,
  ClassReviewLikesTable,
} from "@/lib/db/schema";
import { eq, and, inArray } from "drizzle-orm";
import { withAuth, errorResponse } from "@/lib/utils/api-utils";

/**
 * Endpoints:
 * - GET /api/mobile/classes/[id]/reviews: List reviews (with like/dislike info)
 * - POST /api/mobile/classes/[id]/reviews: Create review
 * - POST /api/mobile/classes/[id]/reviews/[reviewId]/like: Like/dislike/cancel a review (body: { action: 'like' | 'dislike' | 'cancel' })
 */
// GET: Fetch all reviews for a class (public)
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  console.log("[MOBILE REVIEWS API] GET called", {
    params,
    url: req.url,
    method: req.method,
  });
  const classId = Number(params.id);
  if (!classId) {
    return errorResponse("Invalid class ID", 400);
  }
  // Try to get user from auth (optional)
  let userId: number | null = null;
  try {
    const authHeader = req.headers.get("authorization");
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.replace("Bearer ", "");
      try {
        const jwt = await import("jsonwebtoken");
        const decoded = jwt.verify(
          token,
          process.env.JWT_SECRET || "your-secret-key"
        );
        if (decoded && typeof decoded === "object" && "id" in decoded) {
          userId = decoded.id;
        }
      } catch (e) {
        userId = null;
      }
    }
  } catch (e) {
    // Ignore auth errors for GET
    userId = null;
  }
  try {
    // Get all reviews for the class, joined with user info
    const reviews = await db
      .select({
        id: ClassReviewsTable.id,
        classId: ClassReviewsTable.classId,
        userId: ClassReviewsTable.userId,
        rating: ClassReviewsTable.rating,
        text: ClassReviewsTable.text,
        createdAt: ClassReviewsTable.createdAt,
        userName: UsersTable.name,
        userAvatarUrl: UsersTable.photo,
      })
      .from(ClassReviewsTable)
      .innerJoin(UsersTable, eq(ClassReviewsTable.userId, UsersTable.id))
      .where(eq(ClassReviewsTable.classId, classId));
    // For each review, get like/dislike counts and user status
    const reviewIds = reviews.map((r) => r.id);
    let likes: any[] = [];
    if (reviewIds.length > 0) {
      likes = await db
        .select({
          reviewId: ClassReviewLikesTable.reviewId,
          type: ClassReviewLikesTable.type,
          userId: ClassReviewLikesTable.userId,
        })
        .from(ClassReviewLikesTable)
        .where(inArray(ClassReviewLikesTable.reviewId, reviewIds));
    }
    const reviewsWithLikes = reviews.map((review) => {
      const reviewLikes = likes.filter((l) => l.reviewId === review.id);
      const likeCount = reviewLikes.filter((l) => l.type === "like").length;
      const dislikeCount = reviewLikes.filter(
        (l) => l.type === "dislike"
      ).length;
      let userLikeStatus: "like" | "dislike" | null = null;
      if (userId) {
        const userLike = reviewLikes.find((l) => l.userId === userId);
        userLikeStatus = userLike ? userLike.type : null;
      }
      return {
        ...review,
        likeCount,
        dislikeCount,
        userLikeStatus,
      };
    });
    return NextResponse.json(reviewsWithLikes);
  } catch (error) {
    console.error("[MOBILE REVIEWS API] Error fetching reviews", error);
    return errorResponse("Failed to fetch reviews");
  }
}

// POST: Submit a new review for a class (authenticated)
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  return withAuth(req, async (user) => {
    const classId = Number(params.id);
    if (!classId) {
      return errorResponse("Invalid class ID", 400);
    }
    const { rating, text } = await req.json();
    if (!rating || !text) {
      return errorResponse("Missing rating or text", 400);
    }
    try {
      const [review] = await db
        .insert(ClassReviewsTable)
        .values({
          classId,
          userId: user.id,
          rating: Number(rating),
          text,
        })
        .returning();
      return NextResponse.json(review, { status: 201 });
    } catch (error) {
      console.error("[MOBILE REVIEWS API] Error submitting review", error);
      return errorResponse("Failed to submit review");
    }
  });
}
