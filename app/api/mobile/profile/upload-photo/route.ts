import { NextRequest, NextResponse } from "next/server";
import { uploadFileToS3 } from "@/lib/utils/s3";
import { db } from "@/lib/db/db";
import { UsersTable } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { withAuth, errorResponse } from "@/lib/utils/api-utils";

export async function POST(req: NextRequest) {
  return withAuth(req, async (user) => {
    try {
      const body = await req.json();
      const { photo, contentType: imageType } = body;

      if (!photo || typeof photo !== "string") {
        return errorResponse("No photo provided", 400);
      }

      // Decode base64
      const buffer = Buffer.from(photo, "base64");
      const fileType = imageType || "image/jpeg";
      const fileName = `profile-${Date.now()}-${Math.random()
        .toString(36)
        .substring(7)}.${fileType.split("/")[1]}`;

      try {
        const photoUrl = await uploadFileToS3(buffer, fileName, fileType);

        await db
          .update(UsersTable)
          .set({ photo: photoUrl })
          .where(eq(UsersTable.id, user.id))
          .execute();

        return NextResponse.json({ photoUrl }, { status: 200 });
      } catch (uploadError) {
        console.error("Error uploading to S3:", uploadError);
        return errorResponse(
          uploadError instanceof Error
            ? uploadError.message
            : "Failed to upload photo"
        );
      }
    } catch (error) {
      console.error("Error in profile photo upload:", error);
      return errorResponse(
        error instanceof Error ? error.message : "Internal Server Error"
      );
    }
  });
}

export async function GET(req: NextRequest) {
  return withAuth(req, async (user) => {
    try {
      const userData = await db
        .select({ photo: UsersTable.photo })
        .from(UsersTable)
        .where(eq(UsersTable.id, user.id))
        .execute();

      return NextResponse.json(
        { photoUrl: userData[0]?.photo || null },
        { status: 200 }
      );
    } catch (error) {
      console.error("Error fetching profile photo:", error);
      return errorResponse(
        error instanceof Error ? error.message : "Internal Server Error"
      );
    }
  });
}

export async function DELETE(req: NextRequest) {
  return withAuth(req, async (user) => {
    try {
      await db
        .update(UsersTable)
        .set({ photo: null })
        .where(eq(UsersTable.id, user.id))
        .execute();

      return NextResponse.json(
        { message: "Profile photo removed" },
        { status: 200 }
      );
    } catch (error) {
      console.error("Error removing profile photo:", error);
      return errorResponse(
        error instanceof Error ? error.message : "Internal Server Error"
      );
    }
  });
}
