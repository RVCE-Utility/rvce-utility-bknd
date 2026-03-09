import { google } from "googleapis";

// Validate required environment variables
if (!process.env.GOOGLE_CLIENT_ID) {
  throw new Error("GOOGLE_CLIENT_ID is not set in environment variables");
}
if (!process.env.GOOGLE_CLIENT_SECRET) {
  throw new Error("GOOGLE_CLIENT_SECRET is not set in environment variables");
}
if (!process.env.GOOGLE_REFRESH_TOKEN) {
  throw new Error("GOOGLE_REFRESH_TOKEN is not set in environment variables");
}
if (!process.env.GOOGLE_ROOT_FOLDER_ID) {
  throw new Error("GOOGLE_ROOT_FOLDER_ID is not set in environment variables");
}

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const GOOGLE_REFRESH_TOKEN = process.env.GOOGLE_REFRESH_TOKEN;
const GOOGLE_ROOT_FOLDER_ID = process.env.GOOGLE_ROOT_FOLDER_ID;

const oauth2Client = new google.auth.OAuth2(
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
);
oauth2Client.setCredentials({ refresh_token: GOOGLE_REFRESH_TOKEN });

export const drive = google.drive({ version: "v3", auth: oauth2Client });

export async function listFiles(folderId: string = GOOGLE_ROOT_FOLDER_ID) {
  try {
    const response = await drive.files.list({
      q: `'${folderId}' in parents and trashed = false`,
      fields:
        "files(id, name, mimeType, size, createdTime, modifiedTime, webViewLink, webContentLink, description, parents)",
      orderBy: "name",
    });

    return response.data.files || [];
  } catch (error) {
    console.error("Error listing files:", error);
    throw error;
  }
}

/**
 * Lists files and folders at the root level of Google Drive (My Drive)
 * @returns Array of files and folders at root level
 */
export async function listRootFiles() {
  try {
    const response = await drive.files.list({
      q: "'root' in parents and trashed = false",
      fields:
        "files(id, name, mimeType, size, createdTime, modifiedTime, webViewLink, webContentLink, description, parents)",
      orderBy: "name",
    });

    return response.data.files || [];
  } catch (error) {
    console.error("Error listing root files:", error);
    throw error;
  }
}

export async function deleteFile(fileId: string) {
  try {
    await drive.files.delete({
      fileId: fileId,
    });
    return { success: true };
  } catch (error) {
    console.error("Error deleting file:", error);
    throw error;
  }
}

export async function getFileMetadata(fileId: string) {
  try {
    const response = await drive.files.get({
      fileId: fileId,
      fields:
        "id, name, mimeType, size, createdTime, modifiedTime, webViewLink, webContentLink, description, parents",
    });

    return response.data;
  } catch (error) {
    console.error("Error getting file metadata:", error);
    throw error;
  }
}

export async function searchFiles(searchTerm: string) {
  try {
    // Try to fetch by ID first
    let fileById = null;
    try {
      fileById = await getFileMetadata(searchTerm);
    } catch (e) {
      // Ignore if not found or invalid
    }

    // Search by name
    const q = `(name contains '${searchTerm.replace(
      /'/g,
      "\\'",
    )}' and trashed = false)`;
    const response = await drive.files.list({
      q,
      fields:
        "files(id, name, mimeType, size, createdTime, modifiedTime, webViewLink, webContentLink, description, parents)",
      orderBy: "name",
    });

    let files = response.data.files || [];
    // If fileById is found and not already in the list, add it
    if (fileById && !files.some((f) => f.id === fileById.id)) {
      files = [fileById, ...files];
    }
    return files;
  } catch (error) {
    console.error("Error searching files:", error);
    throw error;
  }
}

interface HierarchyItem {
  id: string;
  name: string;
  mimeType: string;
  children: HierarchyItem[];
  webViewLink?: string;
  webContentLink?: string;
}

/**
 * Normalizes webViewLink by replacing /view?usp=drivesdk with /preview
 * @param link - Original webViewLink from Google Drive
 * @returns Normalized link with /preview
 */
function normalizeWebViewLink(
  link: string | null | undefined,
): string | undefined {
  if (!link) return undefined;
  return link.replace(/\/view\?usp=drivesdk$/i, "/preview");
}

/**
 * Recursively builds a folder hierarchy structure from Google Drive
 * @param fileId - The ID of the file or folder to start from
 * @returns Hierarchy item with nested children
 */
async function buildHierarchyForItem(fileId: string): Promise<HierarchyItem> {
  const metadata = await getFileMetadata(fileId);
  const isFolder = metadata.mimeType === "application/vnd.google-apps.folder";

  const item: HierarchyItem = {
    id: metadata.id!,
    name: metadata.name!,
    mimeType: metadata.mimeType!,
    children: [],
  };

  // Only include webViewLink and webContentLink for files, not folders
  if (!isFolder) {
    item.webViewLink = normalizeWebViewLink(metadata.webViewLink);
    item.webContentLink = metadata.webContentLink || undefined;
  }

  // If it's a folder, fetch its children recursively
  if (isFolder) {
    const children = await listFiles(fileId);

    // Build hierarchy for each child
    const childPromises = children.map((child) =>
      buildHierarchyForItem(child.id!),
    );
    item.children = await Promise.all(childPromises);
  }

  return item;
}

/**
 * Builds a complete folder hierarchy structure for multiple items
 * @param fileIds - Array of file/folder IDs to include in the hierarchy
 * @returns Array of hierarchy items
 */
export async function buildFolderHierarchy(
  fileIds: string[],
): Promise<HierarchyItem[]> {
  try {
    const hierarchyPromises = fileIds.map((id) => buildHierarchyForItem(id));
    const hierarchy = await Promise.all(hierarchyPromises);
    return hierarchy;
  } catch (error) {
    console.error("Error building folder hierarchy:", error);
    throw error;
  }
}

export { GOOGLE_ROOT_FOLDER_ID };
