import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db/db";
import { Business, BusinessesTable } from "@/lib/db/schema";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/auth";
import { uploadFileToS3 } from "@/lib/utils/s3";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!session.user.id) {
      console.log("Missing user ID in session");
      return NextResponse.json({ error: "Invalid session" }, { status: 401 });
    }

    const businesses = await db
      .select()
      .from(BusinessesTable)
      .where(eq(BusinessesTable.userId, parseInt(session.user.id)))
      .execute();

    return NextResponse.json(businesses);
  } catch (error) {
    console.error("Error in businesses route:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("photo");
    let photoUrl: string | undefined;

    if (file instanceof Blob) {
      console.log("Processing photo:", {
        type: file.type,
        size: file.size,
      });

      try {
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const fileName = `${Date.now()}-${Math.random()
          .toString(36)
          .substring(7)}.${file.type.split("/")[1]}`;

        photoUrl = await uploadFileToS3(buffer, fileName, file.type);
        console.log("Successfully uploaded photo to S3:", photoUrl);
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
    }

    const businessData: Omit<Business, "userId"> = {
      name: formData.get("name") as string,
      address: formData.get("address") as string,
      phoneNumber: formData.get("phoneNumber") as string,
      description: (formData.get("description") as string) || undefined,
      hours: (formData.get("hours") as string) || undefined,
      email: formData.get("email") as string,
      type: formData.get("type") as string,
      country: (formData.get("country") as string) || undefined,
      zipCode: (formData.get("zipCode") as string) || undefined,
      city: (formData.get("city") as string) || undefined,
      state: (formData.get("state") as string) || undefined,
      latitude: (formData.get("latitude") as string) || undefined,
      longitude: (formData.get("longitude") as string) || undefined,
      photo: photoUrl,
    };

    const fullBusinessData: Business = {
      ...businessData,
      userId: parseInt(session.user.id),
    };

    await db.insert(BusinessesTable).values(fullBusinessData).execute();
    return NextResponse.json(
      { message: "Business added successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error inserting business:", error);
    return NextResponse.json(
      {
        error: "Internal Server Error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
