import { NextResponse } from "next/server";
import { db } from "@/lib/db/db";
import { Business, BusinessesTable, ClassesTable } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/auth";
import { uploadFileToS3 } from "@/lib/utils/s3";

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const businessId = parseInt(params.id);
    if (isNaN(businessId)) {
      return NextResponse.json(
        { error: "Invalid business ID" },
        { status: 400 }
      );
    }

    // Check if business exists and belongs to user
    const business = await db
      .select()
      .from(BusinessesTable)
      .where(
        and(
          eq(BusinessesTable.id, businessId),
          eq(BusinessesTable.userId, parseInt(session.user.id))
        )
      )
      .execute();

    if (!business.length) {
      return NextResponse.json(
        { error: "Business not found or not authorized" },
        { status: 404 }
      );
    }

    // First delete all associated classes
    await db
      .delete(ClassesTable)
      .where(eq(ClassesTable.businessId, businessId))
      .execute();

    // Then delete the business
    await db
      .delete(BusinessesTable)
      .where(eq(BusinessesTable.id, businessId))
      .execute();

    return NextResponse.json(
      { message: "Business and associated classes deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting business:", error);
    return NextResponse.json(
      {
        error: "Failed to delete business",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const businessId = parseInt(params.id);
    if (isNaN(businessId)) {
      return NextResponse.json(
        { error: "Invalid business ID" },
        { status: 400 }
      );
    }

    const [business] = await db
      .select()
      .from(BusinessesTable)
      .where(
        and(
          eq(BusinessesTable.id, businessId),
          eq(BusinessesTable.userId, parseInt(session.user.id))
        )
      )
      .execute();

    if (!business) {
      return NextResponse.json(
        { error: "Business not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(business, { status: 200 });
  } catch (error) {
    console.error("Error fetching business:", error);
    return NextResponse.json(
      { error: "Failed to fetch business" },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const businessId = parseInt(params.id);
    if (isNaN(businessId)) {
      return NextResponse.json(
        { error: "Invalid business ID" },
        { status: 400 }
      );
    }

    // Check if business exists and belongs to user
    const existingBusiness = await db
      .select()
      .from(BusinessesTable)
      .where(
        and(
          eq(BusinessesTable.id, businessId),
          eq(BusinessesTable.userId, parseInt(session.user.id))
        )
      )
      .execute();

    if (!existingBusiness.length) {
      return NextResponse.json(
        { error: "Business not found or not authorized" },
        { status: 404 }
      );
    }

    const formData = await req.formData();
    const file = formData.get("photo");
    let photoUrl = existingBusiness[0].photo;

    if (file instanceof Blob) {
      try {
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const fileName = `${Date.now()}-${Math.random()
          .toString(36)
          .substring(7)}.${file.type.split("/")[1]}`;

        // Upload to S3
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

    const businessData: Partial<Business> = {
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

    Object.keys(businessData).forEach(
      (key) =>
        businessData[key as keyof Business] === undefined &&
        delete businessData[key as keyof Business]
    );

    // update db
    await db
      .update(BusinessesTable)
      .set(businessData)
      .where(eq(BusinessesTable.id, businessId))
      .execute();

    return NextResponse.json(
      { message: "Business updated successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating business:", error);
    return NextResponse.json(
      {
        error: "Failed to update business",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
