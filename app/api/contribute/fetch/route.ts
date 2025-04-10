import { getUsersContribution } from "@/app/actions/userUpload";
import { NextRequest, NextResponse } from "next/server";

export const GET = async () => {
  try {
    const res = await getUsersContribution();
    return NextResponse.json({
      success: true,
      contributors: res,
    });
  } catch (error) {
    console.error("error fetching user contributions :", error);
    return NextResponse.json({
      success: false,
    });
  }
};
