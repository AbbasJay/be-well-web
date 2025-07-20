import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/auth";
import { uploadFileToS3 } from "@/lib/utils/s3";
import { db } from "@/lib/db/db";
import { UsersTable } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("photo");

    if (!file || !(file instanceof Blob)) {
      return NextResponse.json({ error: "No photo provided" }, { status: 400 });
    }

    try {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const fileName = `profile-${Date.now()}-${Math.random()
        .toString(36)
        .substring(7)}.${file.type.split("/")[1]}`;

      const photoUrl = await uploadFileToS3(buffer, fileName, file.type);
      console.log("Successfully uploaded profile photo to S3:", photoUrl);

      await db
        .update(UsersTable)
        .set({ photo: photoUrl })
        .where(eq(UsersTable.id, parseInt(session.user.id)))
        .execute();

      return NextResponse.json({ photoUrl }, { status: 200 });
    } catch (uploadError) {
      console.error("Error uploading to S3:", uploadError);
      return NextResponse.json(
        {
          error: "Failed to upload photo",
          details:
            uploadError instanceof Error
              ? uploadError.message
              : "Unknown error",
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error in profile photo upload:", error);
    return NextResponse.json(
      {
        error: "Internal Server Error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await db
      .select({ photo: UsersTable.photo })
      .from(UsersTable)
      .where(eq(UsersTable.id, parseInt(session.user.id)))
      .execute();

    return NextResponse.json(
      { photoUrl: user[0]?.photo || null },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching profile photo:", error);
    return NextResponse.json(
      {
        error: "Internal Server Error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await db
      .update(UsersTable)
      .set({ photo: null })
      .where(eq(UsersTable.id, parseInt(session.user.id)))
      .execute();

    return NextResponse.json(
      { message: "Profile photo removed" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error removing profile photo:", error);
    return NextResponse.json(
      {
        error: "Internal Server Error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
