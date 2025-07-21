import { updateAttendance } from "@/app/actions/dataUpload";
import { NextRequest, NextResponse } from "next/server";

export const POST = async (req: NextRequest) => {
  try {
    const { user, daySchedule } = await req.json();
    const res = await updateAttendance({ user, daySchedule });
    return NextResponse.json(res);
  } catch (error) {
    console.error(" Error updating attendance", error);
    NextResponse.json(
      {
        success: false,
      },
      { status: 500 }
    );
  }
};
