import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { uploadFileToS3 } from "@/lib/utils/s3";
import { db } from "@/lib/db/db";
import { UsersTable } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

function verifyToken(authHeader: string | null) {
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }

  const token = authHeader.substring(7);

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "your-secret-key"
    ) as {
      id: number;
      email: string;
      name: string;
    };
    return decoded;
  } catch (error) {
    return null;
  }
}

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");

    const user = verifyToken(authHeader);

    if (!user) {
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

      await db
        .update(UsersTable)
        .set({ photo: photoUrl })
        .where(eq(UsersTable.id, user.id))
        .execute();

      return NextResponse.json({ photoUrl }, { status: 200 });
    } catch (uploadError) {
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
    return NextResponse.json(
      {
        error: "Internal Server Error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    const user = verifyToken(authHeader);

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

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
    return NextResponse.json(
      {
        error: "Internal Server Error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    const user = verifyToken(authHeader);

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

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
    return NextResponse.json(
      {
        error: "Internal Server Error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
