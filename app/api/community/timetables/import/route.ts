import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import User from "@/lib/models/user";
import { Attendance, TimeTable } from "@/lib/models/attendance";
import { CommunityTimeTable } from "@/lib/models/communityTimetable";
import { getDaySchedules } from "@/utils/daySchedules";

interface ImportRequestBody {
  timetableId: string;
  user: {
    fullName: string;
    email: string;
    imageUrl?: string;
    semester: string;
    branch: string;
    section: string;
    minAttendance?: number;
    courseStart?: string;
    courseEnd?: string;
  };
}

function toDateString(date: Date | string): string {
  return new Date(date).toDateString();
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const body = (await req.json()) as ImportRequestBody;

    if (!body?.timetableId || !body?.user?.email) {
      return NextResponse.json(
        {
          success: false,
          message: "timetableId and user are required",
        },
        { status: 400 },
      );
    }

    const source: any = await CommunityTimeTable.findById(
      body.timetableId,
    ).lean();
    if (!source || source.status !== "published") {
      return NextResponse.json(
        {
          success: false,
          message: "Community timetable not found",
        },
        { status: 404 },
      );
    }

    const now = new Date();
    const courseStart = body.user.courseStart
      ? new Date(body.user.courseStart)
      : new Date(now.getFullYear(), now.getMonth(), 1);
    const courseEnd = body.user.courseEnd
      ? new Date(body.user.courseEnd)
      : new Date(now.getFullYear(), now.getMonth() + 4, 0);

    const existingUser = await User.findOne({ email: body.user.email });

    if (existingUser?.timeTable) {
      const customTimeTable = await Attendance.findOne({
        timeTable: existingUser.timeTable,
        custom: true,
      });

      if (customTimeTable) {
        await Attendance.findByIdAndDelete(customTimeTable._id);
        await TimeTable.deleteOne({ _id: existingUser.timeTable });
      }
    }

    const copiedTimeTable = await TimeTable.create({
      timeSlots: source.timeTable.timeSlots,
      courses: source.timeTable.courses,
      events: source.timeTable.events,
    });

    await Attendance.create({
      class: `${body.user.semester}${body.user.branch}${body.user.section}`,
      custom: true,
      timeTable: copiedTimeTable._id,
    });

    const daySchedules = getDaySchedules(courseStart, now);
    const attendanceRecords = daySchedules.flatMap((schedule: any) =>
      schedule.dates.map((date: string) => ({
        date: toDateString(date),
        dayTimeTable: copiedTimeTable.events
          .filter((event: any) => event.day === schedule.day)
          .map((event: any) => {
            const timeSlot = copiedTimeTable
              .toObject()
              .timeSlots.find((slot: any) => slot.slotId === event.slotId);

            return {
              ...event.toObject(),
              display: timeSlot?.display || "",
              attendance: "pending",
              custom: false,
            };
          }),
      })),
    );

    const userData = {
      name: body.user.fullName,
      email: body.user.email,
      imageUrl: body.user.imageUrl,
      branch: body.user.branch,
      section: body.user.section,
      courseStart,
      courseEnd,
      minAttendance: body.user.minAttendance || 85,
      timeTable: copiedTimeTable._id,
      courses: copiedTimeTable.courses,
      attendance: attendanceRecords,
    };

    if (!existingUser) {
      await User.create(userData);
    } else {
      Object.assign(existingUser, userData);
      await existingUser.save();
    }

    await CommunityTimeTable.findByIdAndUpdate(body.timetableId, {
      $inc: { importCount: 1 },
      $set: { lastActivityAt: new Date() },
    });

    return NextResponse.json({
      success: true,
      message: "Community timetable imported successfully",
    });
  } catch (error) {
    console.error("Error importing community timetable:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to import community timetable",
      },
      { status: 500 },
    );
  }
}
