import { google } from "googleapis";
import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import fst from "fs";
import * as path from "path";
import os from "os";
import { writeFile } from "fs/promises";
import { mkdir } from "fs/promises";
import { userUpload } from "@/app/actions/userUpload";

interface UserProp {
  fullName: string;
  email: string;
  imageUrl: string;
}

const LOCK_DIR = path.join(process.cwd(), "tmp", "locks");

// Create the lock directory if it doesn't exist
try {
  await mkdir(LOCK_DIR, { recursive: true });
} catch (err) {
  console.error("Error creating lock directory:", err);
}

// Lock file implementation
const acquireLock = async (
  lockName: string,
  timeout = 10000
): Promise<boolean> => {
  const lockFile = path.join(LOCK_DIR, `${lockName}.lock`);
  const startTime = Date.now();

  while (Date.now() - startTime < timeout) {
    try {
      // Try to create the lock file
      await writeFile(lockFile, String(Date.now()), { flag: "wx" });
      return true;
    } catch (err) {
      // Lock file exists, check if it's stale (older than 30 seconds)
      try {
        const stats = await fs.stat(lockFile);
        if (Date.now() - stats.mtimeMs > 30000) {
          // Lock is stale, remove it and try again
          await fs.unlink(lockFile);
          continue;
        }
      } catch (statErr) {
        // Lock file might have been removed by another process
      }

      // Wait before retrying
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
  }

  return false;
};

const releaseLock = async (lockName: string): Promise<void> => {
  const lockFile = path.join(LOCK_DIR, `${lockName}.lock`);
  try {
    await fs.unlink(lockFile);
  } catch (err) {
    console.error("Error releasing lock:", err);
  }
};

// Helper to safely create or fetch a folder
const getOrCreateFolder = async (
  drive: any,
  folderName: string,
  parentId: string,
  lockName: string
): Promise<string> => {
  // Acquire lock for this folder creation
  const lockAcquired = await acquireLock(lockName);
  if (!lockAcquired) {
    throw new Error(`Failed to acquire lock for folder: ${folderName}`);
  }

  try {
    // Check if folder exists
    const folderList = await drive.files.list({
      q: `mimeType='application/vnd.google-apps.folder' and name='${folderName}' and '${parentId}' in parents and trashed=false`,
      fields: "files(id, name)",
    });

    if (folderList.data.files && folderList.data.files.length > 0) {
      return folderList.data.files[0].id;
    }

    // Create folder if it doesn't exist
    const folderResponse = await drive.files.create({
      requestBody: {
        name: folderName,
        mimeType: "application/vnd.google-apps.folder",
        parents: [parentId],
      },
      fields: "id, name",
    });

    return folderResponse.data.id;
  } finally {
    // Always release the lock
    await releaseLock(lockName);
  }
};

export async function POST(req: NextRequest) {
  let tempFilePath = "";

  try {
    const formData = await req.formData();
    const subject = formData.get("subject") as string;
    const semester = formData.get("semester");
    const branch = formData.get("branch");
    const file = formData.get("file") as File;
    const userStr = formData.get("user") as string | null;

    if (!userStr) {
      return NextResponse.json(
        { error: "User not logged in" },
        { status: 401 }
      );
    }
    const user = JSON.parse(userStr) as UserProp;

    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    await userUpload(user, subject, file.name);

    // Create temp file
    const tempDir = os.tmpdir();
    const randomName = Math.random().toString(36).substring(7);
    const fileExt = path.extname(file.name);
    tempFilePath = path.join(tempDir, `${randomName}${fileExt}`);

    // Write to temp file
    const bytes = await file.arrayBuffer();
    await fs.writeFile(tempFilePath, Buffer.from(bytes));

    // Initialize Google Drive
    const auth = new google.auth.GoogleAuth({
      keyFile: path.join(process.cwd(), "credentials.json"),
      scopes: ["https://www.googleapis.com/auth/drive.file"],
    });

    const drive = google.drive({ version: "v3", auth });

    // Get or create user folder with locking
    const userFolderName = `${user.email}/upload`;
    const userFolderId = await getOrCreateFolder(
      drive,
      userFolderName,
      "1X5LgbRPdPgVSDYFfwQxvZ9oaLqWZZVUO",
      `user_folder_${user.email}`
    );

    // Create subject folder name with semester and branch
    const subjectFolderName = `${subject}_${semester?.toString()}_${branch}`;

    // Get or create subject folder with locking
    const subjectFolderId = await getOrCreateFolder(
      drive,
      subjectFolderName,
      userFolderId,
      `subject_folder_${user.email}_${subjectFolderName}`
    );

    // Upload file to subject folder
    const response = await drive.files.create({
      requestBody: {
        name: file.name,
        parents: [subjectFolderId],
      },
      media: {
        mimeType: file.type,
        body: fst.createReadStream(tempFilePath),
      },
    });

    return NextResponse.json({
      success: true,
      fileId: response.data.id,
      fileName: file.name,
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Upload failed" },
      { status: 500 }
    );
  } finally {
    // Clean up temp file
    if (tempFilePath) {
      try {
        await fs.unlink(tempFilePath);
      } catch (err) {
        console.error("Error cleaning up temp file:", err);
      }
    }
  }
}

export const config = {
  api: {
    bodyParser: false,
  },
};
