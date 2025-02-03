import { db } from "@/lib/db/db";
import { ClassesTable } from "@/lib/db/schema";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const newClass = await req.json();
    newClass.slotsLeft = newClass.capacity;

    const insertedClass = await db
      .insert(ClassesTable)
      .values(newClass)
      .returning();

    return NextResponse.json(insertedClass, { status: 201 });
  } catch (error) {
    console.error("Error creating class:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
