"use server";

import mongoose from "mongoose";
import User from "@/models/user";
import Contributors from "@/models/contibutors";

interface UserProp {
  fullName: string;
  email: string;
  imageUrl: string;
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

export const userUpload = async (
  user: UserProp,
  subject: string,
  fileName: string
) => {
  // Input validation
  if (!user || !user.email || !user.fullName) {
    throw new Error("Invalid user data provided");
  }

  if (!subject || typeof subject !== "string") {
    throw new Error("Invalid subject provided");
  }

  if (!fileName || typeof fileName !== "string") {
    throw new Error("Invalid file name provided");
  }

  await connectDB();

  try {
    const existingUser = await User.findOne({ email: user.email });
    const contribution = { subject, file: fileName };

    if (existingUser) {
      // Check for duplicate contribution
      const isDuplicate = existingUser.contribution.some(
        (cont: any) => cont.subject === subject && cont.file === fileName
      );

      if (isDuplicate) {
        throw new Error("Duplicate contribution detected");
      }

      // Update existing user
      existingUser.contribution.push(contribution);
      await existingUser.save();
    } else {
      // Create new user
      const newUser = new User({
        name: user.fullName,
        email: user.email,
        imageUrl: user.imageUrl,
        contribution: [contribution],
      });
      await newUser.save();
    }

    return { success: true, message: "Contribution recorded successfully" };
  } catch (error) {
    console.error("Error in userUpload:", error);
    throw error instanceof Error
      ? error
      : new Error("Failed to record contribution");
  }
};

export const getUsersContribution = async () => {
  await connectDB();
  try {
    const contributors = await Contributors.find();
    if (!contributors) {
      throw new Error("No contributors found");
    }
    return contributors;
  } catch (error) {
    console.error("Error in getUsersContribution:", error);
    throw error instanceof Error
      ? error
      : new Error("Failed to fetch contributors");
  }
};

// export const updateUserContributionb = async () => {
//   await connectDB();
//   try {

//   } catch (error) {
//     console.log(error);

//   }
// }
