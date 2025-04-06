import { hasTimeTable } from "@/app/actions/getData";
import { NextRequest, NextResponse } from "next/server";

export const GET = async (req: NextRequest) => {
  try {
    const url = new URL(req.url);
    const email = url.searchParams.get("email") as string;

    const res = await hasTimeTable(email);
    return NextResponse.json({
      success: true,
      hasTimeTable: res?.hasTimeTable,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      {
        success: false,
      },
      { status: 500 }
    );
  }
};
