import { addSubject, deleteSubject } from "@/app/actions/dataUpload";
import { NextRequest, NextResponse } from "next/server";

export const POST = async (req: NextRequest) => {
  try {
    const { user, subject } = await req.json();
    const res = await addSubject({ user, subject });
    return NextResponse.json(
      {
        success: res.success,
        subject: res.newSubject,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error Adding Subject", error);
    return NextResponse.json({
      success: false,
      message: "Error Adding Subject",
    });
  }
};

export const DELETE = async (req: NextRequest) => {
  try {
    const url = new URL(req.url);
    const queries: Record<string, string> = Object.fromEntries(
      url.searchParams.entries()
    );

    const res = await deleteSubject({
      email: queries.email,
      date: new Date(queries.date),
      slotId: queries.slotId,
      courseId: queries.courseId,
    });
    return NextResponse.json({
      success: true,
      daySchedule: res.daySchedule,
    });
  } catch (error) {
    console.error("Error Deleting Subject", error);
    return NextResponse.json({
      success: false,
      message: "Error Deleting Subject",
    });
  }
};
