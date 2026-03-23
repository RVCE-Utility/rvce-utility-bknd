import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import {
  CommunityTimeTable,
  CommunityTimeTableVote,
} from "@/lib/models/communityTimetable";

async function recomputeVotes(timetableId: string) {
  const [upvotes, downvotes] = await Promise.all([
    CommunityTimeTableVote.countDocuments({ timetableId, vote: 1 }),
    CommunityTimeTableVote.countDocuments({ timetableId, vote: -1 }),
  ]);

  const voteScore = upvotes - downvotes;

  await CommunityTimeTable.findByIdAndUpdate(timetableId, {
    voteScore,
    upvoteCount: upvotes,
    downvoteCount: downvotes,
    lastActivityAt: new Date(),
  });

  return { voteScore, upvotes, downvotes };
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await connectDB();
    const { id } = await params;
    const { userEmail, vote } = await req.json();

    if (!userEmail) {
      return NextResponse.json(
        { success: false, message: "userEmail is required" },
        { status: 400 },
      );
    }

    if (![1, -1, 0].includes(vote)) {
      return NextResponse.json(
        {
          success: false,
          message: "vote must be 1, -1, or 0",
        },
        { status: 400 },
      );
    }

    const timetable: any = await CommunityTimeTable.findById(id).lean();
    if (!timetable || timetable.status !== "published") {
      return NextResponse.json(
        { success: false, message: "Timetable not found" },
        { status: 404 },
      );
    }

    if (vote === 0) {
      await CommunityTimeTableVote.findOneAndDelete({
        timetableId: id,
        userEmail,
      });
    } else {
      await CommunityTimeTableVote.findOneAndUpdate(
        { timetableId: id, userEmail },
        { vote },
        { upsert: true, new: true },
      );
    }

    const counts = await recomputeVotes(id);

    return NextResponse.json({
      success: true,
      data: {
        myVote: vote,
        ...counts,
      },
    });
  } catch (error) {
    console.error("Error voting on community timetable:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to vote on timetable",
      },
      { status: 500 },
    );
  }
}
