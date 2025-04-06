import { getTimeTable } from "@/app/actions/getData";
import { NextRequest, NextResponse } from "next/server";

export const GET = async (req: NextRequest) => {
  try {
    const url = new URL(req.url);
    const email = url.searchParams.get("email") as string;

    const res = await getTimeTable(email);
    return NextResponse.json(
      {
        success: true,
        timeTable: res,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error(error.message);
    return NextResponse.json(
      {
        success: false,
      },
      { status: 404 }
    );
  }
};
