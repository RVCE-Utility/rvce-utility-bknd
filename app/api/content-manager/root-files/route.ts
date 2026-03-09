import { NextRequest, NextResponse } from "next/server";
import { listRootFiles } from "@/lib/google-drive";

export async function GET(request: NextRequest) {
  try {
    const files = await listRootFiles();
    return NextResponse.json({ files });
  } catch (error) {
    console.error("Error fetching root files:", error);
    return NextResponse.json(
      { error: "Failed to fetch root files" },
      { status: 500 },
    );
  }
}
