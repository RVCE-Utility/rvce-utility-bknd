import { NextRequest, NextResponse } from "next/server";
import { getGitHubFile } from "@/lib/github";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const path = searchParams.get("path") || "folderHierarchy.json";

    // Fetch the file from GitHub
    const { content, sha } = await getGitHubFile(path);

    return NextResponse.json({
      content,
      sha,
      path,
    });
  } catch (error) {
    console.error("Error fetching GitHub file:", error);

    // Check if it's a 404 (file doesn't exist yet)
    if (error instanceof Error && error.message.includes("404")) {
      return NextResponse.json(
        {
          content: [],
          sha: null,
          path: "folderHierarchy.json",
          isNew: true,
        },
        { status: 200 },
      );
    }

    return NextResponse.json(
      {
        error: "Failed to fetch file from GitHub",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
