import { initDay } from "@/app/actions/dataUpload";
import { NextRequest, NextResponse } from "next/server";

export const POST = async (req: NextRequest) => {
  try {
    const { user } = await req.json();
    const response = await initDay(user);

    return NextResponse.json({
      response,
    });
  } catch (error) {
    console.error("Error initializing timetable : ", error);
    return NextResponse.json({
      success: false,
      message: "Error initializing timetable ",
    });
  }
};
