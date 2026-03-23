import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import {
  CommunityTimeTable,
  CommunityTimeTableVote,
} from "@/lib/models/communityTimetable";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await connectDB();
    const { id } = await params;

    const doc: any = await CommunityTimeTable.findOne({
      _id: id,
      status: "published",
    }).lean();

    if (!doc) {
      return NextResponse.json(
        { success: false, message: "Timetable not found" },
        { status: 404 },
      );
    }

    const userEmail = new URL(req.url).searchParams.get("userEmail");
    let myVote = 0;

    if (userEmail) {
      const vote: any = await CommunityTimeTableVote.findOne({
        timetableId: id,
        userEmail,
      }).lean();
      myVote = vote?.vote ?? 0;
    }

    return NextResponse.json({
      success: true,
      data: {
        ...doc,
        myVote,
      },
    });
  } catch (error) {
    console.error("Error fetching community timetable detail:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch timetable",
      },
      { status: 500 },
    );
  }
}
