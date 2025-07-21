import { updateSubjectPercentage } from "@/app/actions/dataUpload";
import { NextRequest, NextResponse } from "next/server";

export const POST = async (req: NextRequest) => {
  try {
    const user = await req.json();
    const data = await updateSubjectPercentage(user);
    return NextResponse.json({
      success: data.success,
    });
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      {
        success: false,
      },
      { status: 500 }
    );
  }
};
