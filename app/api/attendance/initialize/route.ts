import mongoose from "mongoose";
import User from "@/lib/models/user";
import { Attendance, TimeTable } from "@/lib/models/attendance";
import { NextResponse } from "next/server";
import { getDaySchedules } from "@/utils/daySchedules";

interface DaySchedule {
  day: string;
  dates: string[];
}

// Initialize MongoDB connection
let isConnected = false;

async function connectDB() {
  if (isConnected) return;

  try {
    if (!process.env.MONGODB_URI) {
      throw new Error("MONGODB_URI environment variable is not defined");
    }
    await mongoose.connect(process.env.MONGODB_URI);
    isConnected = true;
  } catch (error) {
    console.error("DB Connection Error:", error);
    throw new Error("Failed to connect to database");
  }
}

// Utility function to convert a date to IST and return date string
function toISTDateString(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : new Date(date);
  // Get the date in IST timezone
  const istDateString = d.toLocaleString("en-US", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });

  // Parse MM/DD/YYYY and create a Date object
  const [month, day, year] = istDateString.split("/");
  const istDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));

  // Return the date string in format "Mon Sep 29 2025"
  return istDate.toDateString();
}

export async function POST(request: Request) {
  await connectDB();
  try {
    const body = await request.json();
    if (!body || !body.user) {
      return NextResponse.json(
        { error: "Invalid request body" },
        { status: 400 }
      );
    }

    const { user } = body;

    // Validate user data
    if (!user.email || !user.semester || !user.branch || !user.courseStart) {
      return NextResponse.json(
        { error: "Missing required user data" },
        { status: 400 }
      );
    }

    const existingUser = await User.findOne({ email: user.email });

    if (existingUser) {
      if (existingUser.timeTable) {
        const customTimeTable =
          (await Attendance.findOne({
            timeTable: existingUser.timeTable,
            custom: true,
          })) || null;

        if (customTimeTable) {
          await Attendance.findByIdAndDelete(customTimeTable._id);

          await TimeTable.deleteOne({ _id: existingUser.timeTable });
        }
      }
    }

    // Use IST for 'now'
    const now = new Date();
    const attendance = await Attendance.findOne({
      class: user.semester + user.branch + user.section,
    }).populate("timeTable");

    if (!attendance) {
      return NextResponse.json(
        { error: "Attendance record not found" },
        { status: 404 }
      );
    }

    if (!attendance.timeTable) {
      return NextResponse.json(
        { error: "Timetable not found for attendance record" },
        { status: 404 }
      );
    }

    // Get attendance records for each day
    const daySchedules = getDaySchedules(user.courseStart, now);
    const attendanceRecords = daySchedules.flatMap((schedule: any) =>
      schedule.dates.map((date: any) => ({
        date: toISTDateString(date),
        dayTimeTable: attendance.timeTable.events
          .filter((event: any) => event.day === schedule.day)
          .map((event: any) => {
            if (!event.slotId) {
              console.warn("Event without slotId found");
              return null;
            }

            const timeSlot = attendance.timeTable
              .toObject()
              .timeSlots.find((slot: any) => slot.slotId === event.slotId);

            return {
              ...event.toObject(),
              display: timeSlot?.display || "",
              attendance: "pending",
              custom: false,
            };
          })
          .filter(Boolean), // Remove null entries
      }))
    );

    if (!attendanceRecords.length) {
      return NextResponse.json(
        { error: "No attendance records generated" },
        { status: 400 }
      );
    }

    const userData = {
      name: user.fullName,
      email: user.email,
      imageUrl: user.imageUrl,
      branch: user.branch,
      section: user.section,
      courseStart: user.courseStart,
      courseEnd: user.courseEnd,
      minAttendance: user.minAttendance || 75, // Default to 75% if not specified
      timeTable: attendance.timeTable._id,
      courses: attendance.timeTable.courses.map((course: any) => ({
        ...course.toObject(),
        minAttendance: user.minAttendance || 75,
      })),
      attendance: attendanceRecords,
    };

    if (!existingUser) {
      const newUser = new User(userData);
      await newUser.save();
      return NextResponse.json({
        success: true,
        message: "User created with attendance records",
      });
    } else {
      Object.assign(existingUser, userData);
      await existingUser.save();
      return NextResponse.json({
        success: true,
        message: "User updated with new attendance records",
      });
    }
  } catch (error) {
    console.error("Error in POST /api/attendance/initialize:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to initialize attendance",
        details: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}
