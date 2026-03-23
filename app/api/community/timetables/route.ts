import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import { CommunityTimeTable } from "@/lib/models/communityTimetable";

const DEFAULT_PAGE_SIZE = 20;

function isValidTimeTablePayload(timeTable: any): boolean {
  return Boolean(
    timeTable &&
    Array.isArray(timeTable.timeSlots) &&
    Array.isArray(timeTable.courses) &&
    Array.isArray(timeTable.events) &&
    timeTable.timeSlots.length > 0 &&
    timeTable.courses.length > 0,
  );
}

function normalizeSourceTimeTableId(source: any): string {
  if (!source) {
    return "";
  }

  if (typeof source === "string") {
    return source.trim();
  }

  if (typeof source === "object") {
    if (typeof source.$oid === "string") {
      return source.$oid.trim();
    }

    if (typeof source.id === "string") {
      return source.id.trim();
    }

    if (typeof source.toString === "function") {
      const asString = String(source.toString()).trim();
      if (asString && asString !== "[object Object]") {
        return asString;
      }
    }
  }

  return "";
}

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const url = new URL(req.url);
    const semester = url.searchParams.get("semester") || "";
    const branch = url.searchParams.get("branch") || "";
    const section = url.searchParams.get("section") || "";
    const createdYear = url.searchParams.get("year") || "";
    const publishedByEmail = url.searchParams.get("publishedByEmail") || "";
    const sortBy = (url.searchParams.get("sortBy") || "best").toLowerCase();
    const page = Math.max(Number(url.searchParams.get("page") || "1"), 1);
    const limit = Math.min(
      Math.max(Number(url.searchParams.get("limit") || DEFAULT_PAGE_SIZE), 1),
      50,
    );

    const query: Record<string, any> = {
      status: "published",
    };

    if (semester) query.semester = semester;
    if (branch) query.branch = branch;
    if (section) query.section = section;
    if (createdYear) query.createdYear = Number(createdYear);
    if (publishedByEmail) query.publishedByEmail = publishedByEmail;

    const sort: Record<string, 1 | -1> =
      sortBy === "new"
        ? { createdAt: -1 }
        : { voteScore: -1, lastActivityAt: -1, createdAt: -1 };

    const [rows, total] = await Promise.all([
      CommunityTimeTable.find(query)
        .sort(sort)
        .skip((page - 1) * limit)
        .limit(limit)
        .select(
          "title description semester branch section createdYear publishedByName sourceTimeTableId voteScore upvoteCount downvoteCount reportCount importCount createdAt updatedAt",
        )
        .lean(),
      CommunityTimeTable.countDocuments(query),
    ]);

    return NextResponse.json({
      success: true,
      data: rows,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error listing community timetables:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to list community timetables",
      },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const body = await req.json();
    const {
      user,
      timeTable,
      sourceTimeTableId,
      title,
      description,
      semester,
      branch,
      section,
      createdYear,
    } = body;

    if (!user?.email || !user?.name) {
      return NextResponse.json(
        { success: false, message: "Invalid user" },
        { status: 400 },
      );
    }

    if (!semester || !branch || !section) {
      return NextResponse.json(
        {
          success: false,
          message: "Semester, branch and section are required",
        },
        { status: 400 },
      );
    }

    if (!isValidTimeTablePayload(timeTable)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid timetable payload",
        },
        { status: 400 },
      );
    }

    const effectiveSourceTimeTableId = normalizeSourceTimeTableId(
      sourceTimeTableId || timeTable?._id,
    );
    if (!effectiveSourceTimeTableId) {
      return NextResponse.json(
        {
          success: false,
          message: "sourceTimeTableId is required",
        },
        { status: 400 },
      );
    }

    const effectiveYear = Number(createdYear) || new Date().getFullYear();

    const duplicate = await CommunityTimeTable.collection.findOne({
      publishedByEmail: user.email,
      sourceTimeTableId: effectiveSourceTimeTableId,
    });

    if (duplicate) {
      return NextResponse.json(
        {
          success: false,
          message:
            "This timetable is already published. Create a new timetable to publish again.",
        },
        { status: 409 },
      );
    }

    // Compatibility guard for older rows that were published before sourceTimeTableId existed.
    const legacyDuplicate: any = await CommunityTimeTable.collection.findOne({
      publishedByEmail: user.email,
      semester,
      branch,
      section,
      createdYear: effectiveYear,
      $or: [
        { sourceTimeTableId: { $exists: false } },
        { sourceTimeTableId: "" },
        { sourceTimeTableId: null },
      ],
    });

    if (legacyDuplicate) {
      await CommunityTimeTable.collection.updateOne(
        { _id: legacyDuplicate._id },
        { $set: { sourceTimeTableId: effectiveSourceTimeTableId } },
      );

      return NextResponse.json(
        {
          success: false,
          message:
            "This timetable is already published. Create a new timetable to publish again.",
        },
        { status: 409 },
      );
    }

    const newDoc = await CommunityTimeTable.create({
      title:
        title?.trim() ||
        `${branch} - Sem ${semester}${section ? ` Section ${section}` : ""}`,
      description: description?.trim() || "",
      semester,
      branch,
      section,
      createdYear: effectiveYear,
      publishedByEmail: user.email,
      publishedByName: user.name,
      sourceTimeTableId: effectiveSourceTimeTableId,
      status: "published",
      lastActivityAt: new Date(),
      timeTable,
    });

    // Force persistence of sourceTimeTableId at raw collection level as a safety net
    // when an older compiled model is still in memory.
    await CommunityTimeTable.collection.updateOne(
      { _id: newDoc._id },
      { $set: { sourceTimeTableId: effectiveSourceTimeTableId } },
    );

    return NextResponse.json({
      success: true,
      message: "Timetable published to community",
      data: {
        id: newDoc._id,
      },
    });
  } catch (error) {
    console.error("Error publishing community timetable:", error);
    if ((error as any)?.code === 11000) {
      return NextResponse.json(
        {
          success: false,
          message:
            "This timetable is already published. Create a new timetable to publish again.",
        },
        { status: 409 },
      );
    }
    return NextResponse.json(
      {
        success: false,
        message: "Failed to publish timetable",
      },
      { status: 500 },
    );
  }
}
