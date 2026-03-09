import { NextRequest, NextResponse } from "next/server";
import { buildFolderHierarchy } from "@/lib/google-drive";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { fileIds } = body;

    if (!fileIds || !Array.isArray(fileIds) || fileIds.length === 0) {
      return NextResponse.json(
        { error: "fileIds array is required and must not be empty" },
        { status: 400 },
      );
    }

    // Build the folder hierarchy recursively
    const hierarchy = await buildFolderHierarchy(fileIds);

    return NextResponse.json({ hierarchy });
  } catch (error) {
    console.error("Error building drive hierarchy:", error);
    return NextResponse.json(
      {
        error: "Failed to build folder hierarchy",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
