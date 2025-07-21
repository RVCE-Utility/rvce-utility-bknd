import { uploadTimeTable } from "@/app/actions/dataUpload";
import { NextRequest, NextResponse } from "next/server";

export const POST = async (req: NextRequest) => {
  try {
    const { timeTable, user } = await req.json();
    const res = await uploadTimeTable({ timeTable, user });
    return NextResponse.json(
      {
        ...res,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      {
        success: false,
      },
      { status: 200 }
    );
  }
};
