import { NextRequest, NextResponse } from "next/server";
import { uploadFileToS3 } from "@/lib/utils/s3";
import { db } from "@/lib/db/db";
import { UsersTable } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { withAuth, errorResponse } from "@/lib/utils/api-utils";

export async function POST(req: NextRequest) {
  return withAuth(req, async (user) => {
    try {
      const contentType = req.headers.get("content-type") || "";
      let buffer: Buffer;
      let fileType: string;
      let fileName: string;

      if (contentType.includes("application/json")) {
        // Handle JSON base64 (React Native approach)
        const body = await req.json();
        const { photo, contentType: imageType } = body;

        if (!photo || typeof photo !== "string") {
          return errorResponse("No photo provided in JSON", 400);
        }

        // Decode base64
        buffer = Buffer.from(photo, "base64");
        fileType = imageType || "image/jpeg";
        fileName = `profile-${Date.now()}-${Math.random()
          .toString(36)
          .substring(7)}.${fileType.split("/")[1]}`;
      } else if (contentType.includes("multipart/form-data")) {
        // Handle FormData (web approach)
        const formData = await req.formData();
        const file = formData.get("photo");

        if (!file || !(file instanceof Blob)) {
          return errorResponse("No photo provided in FormData", 400);
        }

        const bytes = await file.arrayBuffer();
        buffer = Buffer.from(bytes);
        fileType = file.type;
        fileName = `profile-${Date.now()}-${Math.random()
          .toString(36)
          .substring(7)}.${file.type.split("/")[1]}`;
      } else {
        return errorResponse(
          "Content-Type must be application/json or multipart/form-data",
          400
        );
      }

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
