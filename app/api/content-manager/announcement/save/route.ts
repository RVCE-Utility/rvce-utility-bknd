import { NextResponse } from "next/server";
import { updateGitHubFile } from "@/lib/github";

export async function POST(request: Request) {
  try {
    const { content, message, sha } = await request.json();

    if (!content) {
      return NextResponse.json(
        { error: "Content is required" },
        { status: 400 },
      );
    }

    if (!message) {
      return NextResponse.json(
        { error: "Commit message is required" },
        { status: 400 },
      );
    }

    const filePath = "infoCard.json";

    // Increment the ID of the latest announcement
    const announcements = Array.isArray(content) ? content : [];
    if (announcements.length > 0) {
      const latestId = Math.max(
        ...announcements.map((a: any) => parseInt(a.id) || 0),
      );
      announcements[0].id = (latestId + 1).toString();
    }

    const result = await updateGitHubFile(
      filePath,
      announcements,
      message,
      sha || undefined,
    );

    return NextResponse.json({
      success: true,
      commit: result.commit,
      file: result.content,
    });
  } catch (error: any) {
    console.error("Error saving announcement file:", error);

    if (error.message.includes("409")) {
      return NextResponse.json(
        {
          error:
            "File was modified by someone else. Please refresh and try again.",
        },
        { status: 409 },
      );
    }

    if (error.message.includes("422")) {
      return NextResponse.json(
        { error: "Invalid file content or commit message" },
        { status: 422 },
      );
    }

    return NextResponse.json(
      { error: error.message || "Failed to save announcement file" },
      { status: 500 },
    );
  }
}
