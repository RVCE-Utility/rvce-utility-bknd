import mongoose from "mongoose";
import User from "@/models/user";
import { NextRequest, NextResponse } from "next/server";

// Initialize MongoDB connection
let isConnected = false;

async function connectDB() {
  if (isConnected) return;

  try {
    await mongoose.connect(process.env.MONGODB_URI as string);
    isConnected = true;
    console.log("DB Connected");
  } catch (error) {
    console.error("DB Connection Error:", error);
    throw error;
  }
}

export const POST = async (req: NextRequest) => {
  await connectDB();

  try {
    const { email } = await req.json();
    const user = await User.findOne({ email });
    if (user) {
      return NextResponse.json({ resources: user.contribution });
    } else {
      return NextResponse.json({ resources: [] });
    }
  } catch (error) {
    console.error("Error in userUpload:", error);
    throw error;
  }
};
