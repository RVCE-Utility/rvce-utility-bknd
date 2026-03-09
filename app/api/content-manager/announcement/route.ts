import { NextResponse } from "next/server";
import { getGitHubFile } from "@/lib/github";

export async function GET() {
  try {
    const filePath = "infoCard.json";

    try {
      const { content, sha } = await getGitHubFile(filePath);

      return NextResponse.json({
        content,
        sha,
        path: filePath,
        isNew: false,
      });
    } catch (error: any) {
      // File doesn't exist yet (404)
      if (error.message.includes("404")) {
        return NextResponse.json({
          content: [],
          sha: null,
          path: filePath,
          isNew: true,
        });
      }
      throw error;
    }
  } catch (error: any) {
    console.error("Error fetching announcement file:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch announcement file" },
      { status: 500 },
    );
  }
}
