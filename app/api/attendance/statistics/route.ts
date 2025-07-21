import { getStats } from "@/app/actions/stats";
import { NextRequest, NextResponse } from "next/server";

export const GET = async (req: NextRequest) => {
  try {
    const url = new URL(req.url);
    const email = url.searchParams.get("email");

    if (!email || typeof email !== "string") {
      return NextResponse.json(
        { error: "Valid email is required" },
        { status: 400 }
      );
    }

    const stats = await getStats(email);

    if (!stats) {
      return NextResponse.json(
        { error: "No statistics found for the user" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error("Error in GET /api/attendance/statistics:", error);

    // Handle specific error cases
    if (error instanceof Error) {
      if (error.message.includes("User not found")) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }
      if (error.message.includes("Timetable not found")) {
        return NextResponse.json(
          { error: "Timetable not found for user" },
          { status: 404 }
        );
      }
    }

    // Generic error response
    return NextResponse.json(
      {
        error: "Failed to fetch attendance statistics",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
};
