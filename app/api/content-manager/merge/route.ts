import { NextRequest, NextResponse } from "next/server";
import { updateGitHubFile } from "@/lib/github";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { content, message, sha, path = "folderHierarchy.json" } = body;

    if (!content) {
      return NextResponse.json(
        { error: "content is required" },
        { status: 400 },
      );
    }

    if (!message) {
      return NextResponse.json(
        { error: "commit message is required" },
        { status: 400 },
      );
    }

    // Validate that content is valid JSON if it's a string
    let validatedContent = content;
    if (typeof content === "string") {
      try {
        validatedContent = JSON.parse(content);
      } catch {
        return NextResponse.json(
          { error: "content must be valid JSON" },
          { status: 400 },
        );
      }
    }

    // Update the file on GitHub
    const result = await updateGitHubFile(path, validatedContent, message, sha);

    return NextResponse.json({
      success: true,
      commit: {
        sha: result.commit.sha,
        message: result.commit.message,
      },
      file: {
        name: result.content.name,
        path: result.content.path,
        sha: result.content.sha,
      },
    });
  } catch (error) {
    console.error("Error merging to GitHub:", error);

    // Check for specific GitHub errors
    if (error instanceof Error) {
      if (error.message.includes("409")) {
        return NextResponse.json(
          {
            error:
              "Conflict: File was modified by someone else. Please refresh and try again.",
            details: error.message,
          },
          { status: 409 },
        );
      }

      if (error.message.includes("422")) {
        return NextResponse.json(
          {
            error: "Validation failed. Please check your content and SHA.",
            details: error.message,
          },
          { status: 422 },
        );
      }
    }

    return NextResponse.json(
      {
        error: "Failed to commit changes to GitHub",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
