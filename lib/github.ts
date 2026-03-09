// Validate required environment variables
if (!process.env.GITHUB_TOKEN) {
  throw new Error("GITHUB_TOKEN is not set in environment variables");
}
if (!process.env.GITHUB_REPO_OWNER) {
  throw new Error("GITHUB_REPO_OWNER is not set in environment variables");
}
if (!process.env.GITHUB_REPO_NAME) {
  throw new Error("GITHUB_REPO_NAME is not set in environment variables");
}

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GITHUB_REPO_OWNER = process.env.GITHUB_REPO_OWNER;
const GITHUB_REPO_NAME = process.env.GITHUB_REPO_NAME;
const GITHUB_API_BASE = "https://api.github.com";

interface GitHubFileResponse {
  content: string;
  sha: string;
  size: number;
  name: string;
  path: string;
  encoding: string;
}

interface GitHubUpdateResponse {
  content: {
    name: string;
    path: string;
    sha: string;
  };
  commit: {
    sha: string;
    message: string;
  };
}

/**
 * Fetches a file from the GitHub repository
 * @param path - Path to the file in the repository (e.g., "folderHierarchy.json")
 * @returns File content (decoded from base64) and SHA
 */
export async function getGitHubFile(path: string): Promise<{
  content: any;
  sha: string;
}> {
  try {
    const url = `${GITHUB_API_BASE}/repos/${GITHUB_REPO_OWNER}/${GITHUB_REPO_NAME}/contents/${path}`;

    const response = await fetch(url, {
      headers: {
        Accept: "application/vnd.github+json",
        Authorization: `Bearer ${GITHUB_TOKEN}`,
        "X-GitHub-Api-Version": "2022-11-28",
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(
        `GitHub API error: ${response.status} - ${error.message || "Unknown error"}`,
      );
    }

    const data: GitHubFileResponse = await response.json();

    // Decode base64 content
    const decodedContent = Buffer.from(data.content, "base64").toString(
      "utf-8",
    );

    // Parse JSON if applicable
    let content;
    try {
      content = JSON.parse(decodedContent);
    } catch {
      content = decodedContent;
    }

    return {
      content,
      sha: data.sha,
    };
  } catch (error) {
    console.error("Error fetching GitHub file:", error);
    throw error;
  }
}

/**
 * Updates or creates a file in the GitHub repository
 * @param path - Path to the file in the repository
 * @param content - Content to write (will be stringified if object)
 * @param message - Commit message
 * @param sha - SHA of the file being updated (required for updates, omit for new files)
 * @returns Update response with new SHA
 */
export async function updateGitHubFile(
  path: string,
  content: any,
  message: string,
  sha?: string,
): Promise<GitHubUpdateResponse> {
  try {
    const url = `${GITHUB_API_BASE}/repos/${GITHUB_REPO_OWNER}/${GITHUB_REPO_NAME}/contents/${path}`;

    // Stringify content if it's an object
    const contentString =
      typeof content === "string" ? content : JSON.stringify(content, null, 2);

    // Encode to base64
    const encodedContent = Buffer.from(contentString, "utf-8").toString(
      "base64",
    );

    const body: any = {
      message,
      content: encodedContent,
    };

    // Include SHA if updating an existing file
    if (sha) {
      body.sha = sha;
    }

    const response = await fetch(url, {
      method: "PUT",
      headers: {
        Accept: "application/vnd.github+json",
        Authorization: `Bearer ${GITHUB_TOKEN}`,
        "X-GitHub-Api-Version": "2022-11-28",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(
        `GitHub API error: ${response.status} - ${error.message || "Unknown error"}`,
      );
    }

    const data: GitHubUpdateResponse = await response.json();
    return data;
  } catch (error) {
    console.error("Error updating GitHub file:", error);
    throw error;
  }
}

/**
 * Gets the SHA of a file without fetching its content
 * @param path - Path to the file in the repository
 * @returns SHA of the file
 */
export async function getFileSha(path: string): Promise<string> {
  const { sha } = await getGitHubFile(path);
  return sha;
}

export { GITHUB_REPO_OWNER, GITHUB_REPO_NAME };
