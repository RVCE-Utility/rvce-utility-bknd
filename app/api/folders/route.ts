import mongoose from "mongoose";
import { NextResponse } from "next/server";

mongoose.connect(process.env.MONGODB_URI as string);

export const GET = async (request: Request) => {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("query");
  // const data = await Folder.find();
  if (!query) {
    return NextResponse.json({ error: "Query is required" }, { status: 400 });
  }

  // const results = searchFolderStructure(query, data);

  return NextResponse.json({ results: query });
};
