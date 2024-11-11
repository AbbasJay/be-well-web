import { db } from "@/lib/db/db";
import { ClassesTable } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const query = await db
      .select()
      .from(ClassesTable)
      .where(eq(ClassesTable.businessId, Number(params.id)));

    return NextResponse.json(query);
  } catch (error) {
    console.error("Error fetching classes:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    await db.delete(ClassesTable).where(eq(ClassesTable.id, Number(params.id)));

    return NextResponse.json({ message: "Class deleted successfully" });
  } catch (error) {
    console.error("Error deleting class:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const updatedData = await req.json();
    await db
      .update(ClassesTable)
      .set(updatedData)
      .where(eq(ClassesTable.id, Number(params.id)));

    return NextResponse.json({ message: "Class updated successfully" });
  } catch (error) {
    console.error("Error updating class:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
