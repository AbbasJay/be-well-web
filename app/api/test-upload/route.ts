import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    console.log("Test upload endpoint called");
    console.log("Content-Type:", req.headers.get("content-type"));

    const formData = await req.formData();
    const file = formData.get("photo");

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (!(file instanceof Blob)) {
      return NextResponse.json(
        { error: "File is not a blob" },
        { status: 400 }
      );
    }

    console.log("File received:", file.size, "bytes, type:", file.type);

    return NextResponse.json({
      success: true,
      fileSize: file.size,
      fileType: file.type,
    });
  } catch (error) {
    console.error("Test upload error:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({ message: "Test upload endpoint is working" });
}
