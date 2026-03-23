import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import {
  CommunityTimeTable,
  CommunityTimeTableReport,
} from "@/lib/models/communityTimetable";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await connectDB();
    const { id } = await params;
    const { userEmail, reason, comment } = await req.json();

    if (!userEmail || !reason) {
      return NextResponse.json(
        {
          success: false,
          message: "userEmail and reason are required",
        },
        { status: 400 },
      );
    }

    const timetable = await CommunityTimeTable.findById(id);
    if (!timetable || timetable.status !== "published") {
      return NextResponse.json(
        { success: false, message: "Timetable not found" },
        { status: 404 },
      );
    }

    const existing = await CommunityTimeTableReport.findOne({
      timetableId: id,
      userEmail,
    }).lean();

    if (existing) {
      return NextResponse.json(
        {
          success: false,
          message: "You already reported this timetable",
        },
        { status: 409 },
      );
    }

    await CommunityTimeTableReport.create({
      timetableId: id,
      userEmail,
      reason: reason.trim(),
      comment: comment?.trim() || "",
      status: "open",
    });

    timetable.reportCount = (timetable.reportCount || 0) + 1;
    timetable.lastActivityAt = new Date();
    if (timetable.reportCount >= 5) {
      timetable.status = "hidden";
    }
    await timetable.save();

    return NextResponse.json({
      success: true,
      data: {
        reportCount: timetable.reportCount,
        status: timetable.status,
      },
    });
  } catch (error) {
    console.error("Error reporting community timetable:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to report timetable",
      },
      { status: 500 },
    );
  }
}
