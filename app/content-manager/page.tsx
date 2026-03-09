"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { DriveItemSelector } from "@/components/DriveItemSelector";
import { JsonDiffViewer } from "@/components/JsonDiffViewer";
import { HtmlEditorWithPreview } from "@/components/HtmlEditorWithPreview";
import {
  FolderOpen,
  FileJson,
  RefreshCw,
  GitMerge,
  Loader2,
  CheckCircle,
  AlertCircle,
  Construction,
  Save,
} from "lucide-react";
import { toast } from "sonner";

interface DriveItem {
  id: string;
  name: string;
  mimeType: string;
  size?: number;
  modifiedTime: string;
}

export default function ContentManager() {
  // Step 1: Root-level Drive items
  const [driveItems, setDriveItems] = useState<DriveItem[]>([]);
  const [loadingDriveItems, setLoadingDriveItems] = useState(false);

  // Step 2: Selected items
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Step 3: Hierarchies
  const [driveHierarchy, setDriveHierarchy] = useState<any>(null);
  const [githubHierarchy, setGithubHierarchy] = useState<any>(null);
  const [githubSha, setGithubSha] = useState<string | null>(null);
  const [loadingHierarchies, setLoadingHierarchies] = useState(false);

  // Step 4: Merge
  const [commitMessage, setCommitMessage] = useState("");
  const [merging, setMerging] = useState(false);

  // Announcements
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [announcementSha, setAnnouncementSha] = useState<string | null>(null);
  const [announcementContent, setAnnouncementContent] = useState("");
  const [loadingAnnouncement, setLoadingAnnouncement] = useState(false);
  const [savingAnnouncement, setSavingAnnouncement] = useState(false);
  const [announcementCommitMessage, setAnnouncementCommitMessage] =
    useState("");

  useEffect(() => {
    fetchDriveItems();
  }, []);

  const fetchDriveItems = async () => {
    setLoadingDriveItems(true);
    try {
      const response = await fetch("/api/content-manager/root-files");
      const data = await response.json();

      if (data.error) {
        toast.error(data.error);
        return;
      }

      setDriveItems(data.files || []);
    } catch (error) {
      toast.error("Failed to fetch Drive items");
      console.error("Error fetching Drive items:", error);
    } finally {
      setLoadingDriveItems(false);
    }
  };

  const buildHierarchies = async () => {
    if (selectedIds.length === 0) {
      toast.error("Please select at least one item");
      return;
    }

    setLoadingHierarchies(true);
    setDriveHierarchy(null);
    setGithubHierarchy(null);

    try {
      // Fetch both hierarchies in parallel
      const [driveResponse, githubResponse] = await Promise.all([
        fetch("/api/content-manager/drive-hierarchy", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ fileIds: selectedIds }),
        }),
        fetch("/api/content-manager/github-hierarchy"),
      ]);

      const driveData = await driveResponse.json();
      const githubData = await githubResponse.json();

      if (driveData.error) {
        toast.error(`Drive error: ${driveData.error}`);
        return;
      }

      if (githubData.error && !githubData.isNew) {
        toast.error(`GitHub error: ${githubData.error}`);
        return;
      }

      setDriveHierarchy(driveData.hierarchy);
      setGithubHierarchy(githubData.content);
      setGithubSha(githubData.sha);

      if (githubData.isNew) {
        toast.info(
          "GitHub file doesn't exist yet. A new file will be created.",
        );
      }

      toast.success("Hierarchies loaded successfully");
    } catch (error) {
      toast.error("Failed to build hierarchies");
      console.error("Error building hierarchies:", error);
    } finally {
      setLoadingHierarchies(false);
    }
  };

  const handleMerge = async () => {
    if (!commitMessage.trim()) {
      toast.error("Please enter a commit message");
      return;
    }

    if (!driveHierarchy) {
      toast.error("No hierarchy to merge");
      return;
    }

    setMerging(true);

    try {
      const response = await fetch("/api/content-manager/merge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: driveHierarchy,
          message: commitMessage,
          sha: githubSha,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 409) {
          toast.error(
            "File was modified by someone else. Please refresh and try again.",
          );
        } else {
          toast.error(data.error || "Failed to merge changes");
        }
        return;
      }

      toast.success(
        `Successfully committed to GitHub! Commit: ${data.commit.sha.substring(0, 7)}`,
      );

      // Update the GitHub SHA for next merge
      setGithubSha(data.file.sha);
      setGithubHierarchy(driveHierarchy);
      setCommitMessage("");
    } catch (error) {
      toast.error("Failed to merge changes");
      console.error("Error merging:", error);
    } finally {
      setMerging(false);
    }
  };

  const hasHierarchies = driveHierarchy !== null && githubHierarchy !== null;

  // Announcement functions
  const fetchAnnouncement = async () => {
    setLoadingAnnouncement(true);
    try {
      const response = await fetch("/api/content-manager/announcement");
      const data = await response.json();

      if (data.error && !data.isNew) {
        toast.error(data.error);
        return;
      }

      setAnnouncements(data.content || []);
      setAnnouncementSha(data.sha);

      // Set the content of the first announcement for editing
      if (data.content && data.content.length > 0) {
        setAnnouncementContent(data.content[0].content || "");
      } else {
        setAnnouncementContent("");
      }

      if (data.isNew) {
        toast.info(
          "Announcement file doesn't exist yet. A new file will be created.",
        );
      }
    } catch (error) {
      toast.error("Failed to fetch announcement");
      console.error("Error fetching announcement:", error);
    } finally {
      setLoadingAnnouncement(false);
    }
  };

  const handleSaveAnnouncement = async () => {
    if (!announcementCommitMessage.trim()) {
      toast.error("Please enter a commit message");
      return;
    }

    if (!announcementContent.trim()) {
      toast.error("Announcement content cannot be empty");
      return;
    }

    setSavingAnnouncement(true);

    try {
      // Create the updated announcements array
      const updatedAnnouncements = [
        {
          id:
            announcements.length > 0
              ? String(
                  Math.max(
                    ...announcements.map((a: any) => parseInt(a.id) || 0),
                  ) + 1,
                )
              : "1",
          content: announcementContent,
        },
      ];

      const response = await fetch("/api/content-manager/announcement/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: updatedAnnouncements,
          message: announcementCommitMessage,
          sha: announcementSha,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 409) {
          toast.error(
            "File was modified by someone else. Please refresh and try again.",
          );
        } else {
          toast.error(data.error || "Failed to save announcement");
        }
        return;
      }

      toast.success(
        `Successfully saved announcement! Commit: ${data.commit.sha.substring(0, 7)}`,
      );

      // Update the SHA and announcements
      setAnnouncementSha(data.file.sha);
      setAnnouncements(updatedAnnouncements);
      setAnnouncementCommitMessage("");

      // Refresh the announcement data
      await fetchAnnouncement();
    } catch (error) {
      toast.error("Failed to save announcement");
      console.error("Error saving announcement:", error);
    } finally {
      setSavingAnnouncement(false);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-7xl bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen">
      <div className="mb-8 bg-white p-6 rounded-lg shadow-sm border border-blue-100">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
          Content Manager
        </h1>
        <p className="text-slate-600 mt-2">
          Manage main website resources and announcements
        </p>
      </div>

      <Tabs defaultValue="resources" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 bg-white p-1 shadow-sm border border-blue-100">
          <TabsTrigger
            value="resources"
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-indigo-500 data-[state=active]:text-white"
          >
            <FolderOpen className="h-4 w-4 mr-2" />
            Main Resource Manager
          </TabsTrigger>
          <TabsTrigger
            value="announcements"
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-indigo-500 data-[state=active]:text-white"
          >
            <FileJson className="h-4 w-4 mr-2" />
            Announcement Manager
          </TabsTrigger>
        </TabsList>

        <TabsContent value="resources" className="space-y-6">
          {/* Step 1: Fetch root-level items */}
          <Card className="border-blue-200 shadow-sm bg-white">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-blue-900">
                  <Badge className="bg-blue-600 text-white border-0">
                    Step 1
                  </Badge>
                  Root-Level Drive Items
                </CardTitle>
                <Button
                  onClick={fetchDriveItems}
                  disabled={loadingDriveItems}
                  variant="outline"
                  size="sm"
                  className="border-blue-300 hover:bg-blue-50"
                >
                  {loadingDriveItems ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <RefreshCw className="h-4 w-4" />
                  )}
                  <span className="ml-2">Refresh</span>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {loadingDriveItems ? (
                <div className="text-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
                  <p className="text-slate-600">Loading Drive items...</p>
                </div>
              ) : (
                <DriveItemSelector
                  items={driveItems}
                  selectedIds={selectedIds}
                  onSelectionChange={setSelectedIds}
                />
              )}
            </CardContent>
          </Card>

          {/* Step 2: Build hierarchies */}
          <Card className="border-blue-200 shadow-sm bg-white">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100">
              <CardTitle className="flex items-center gap-2 text-blue-900">
                <Badge className="bg-blue-600 text-white border-0">
                  Step 2
                </Badge>
                Build and Compare Hierarchies
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Button
                onClick={buildHierarchies}
                disabled={selectedIds.length === 0 || loadingHierarchies}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
              >
                {loadingHierarchies ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Building Hierarchies...
                  </>
                ) : (
                  <>
                    <FileJson className="h-4 w-4 mr-2" />
                    Generate Hierarchy for {selectedIds.length} Selected Item
                    {selectedIds.length !== 1 ? "s" : ""}
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Step 3: View differences */}
          {hasHierarchies && (
            <Card className="border-blue-200 shadow-sm bg-white">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100">
                <CardTitle className="flex items-center gap-2 text-blue-900">
                  <Badge className="bg-blue-600 text-white border-0">
                    Step 3
                  </Badge>
                  Compare Changes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <JsonDiffViewer
                  leftJson={githubHierarchy}
                  rightJson={driveHierarchy}
                  leftTitle="GitHub (Current)"
                  rightTitle="Drive (New Selection)"
                />
              </CardContent>
            </Card>
          )}

          {/* Step 4: Merge */}
          {hasHierarchies && (
            <Card className="border-blue-200 shadow-sm bg-white">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100">
                <CardTitle className="flex items-center gap-2 text-blue-900">
                  <Badge className="bg-blue-600 text-white border-0">
                    Step 4
                  </Badge>
                  Commit Changes to GitHub
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Commit Message
                  </label>
                  <Textarea
                    placeholder="Update folder hierarchy from Drive selection..."
                    value={commitMessage}
                    onChange={(e) => setCommitMessage(e.target.value)}
                    rows={3}
                  />
                </div>
                <Button
                  onClick={handleMerge}
                  disabled={!commitMessage.trim() || merging}
                  className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                  size="lg"
                >
                  {merging ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin mr-2" />
                      Committing to GitHub...
                    </>
                  ) : (
                    <>
                      <GitMerge className="h-5 w-5 mr-2" />
                      Merge Changes to GitHub
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="announcements">
          <div className="space-y-6">
            {/* Step 1: Load Current Announcement */}
            <Card className="border-blue-200 shadow-sm bg-white">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-blue-900">
                    <Badge className="bg-blue-600 text-white border-0">
                      Step 1
                    </Badge>
                    Load Current Announcement
                  </CardTitle>
                  <Button
                    onClick={fetchAnnouncement}
                    disabled={loadingAnnouncement}
                    variant="outline"
                    size="sm"
                    className="border-blue-300 hover:bg-blue-50"
                  >
                    {loadingAnnouncement ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <RefreshCw className="h-4 w-4" />
                    )}
                    <span className="ml-2">Load from GitHub</span>
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                {loadingAnnouncement ? (
                  <div className="text-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
                    <p className="text-slate-600">
                      Loading announcement data...
                    </p>
                  </div>
                ) : announcements.length > 0 ? (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg border border-green-200">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                        <span className="font-medium text-green-900">
                          Announcement Loaded
                        </span>
                      </div>
                      <Badge className="bg-green-600 text-white border-0">
                        ID: {announcements[0]?.id || "N/A"}
                      </Badge>
                    </div>
                    <p className="text-sm text-slate-600 mt-2">
                      Edit the HTML content below. The ID will automatically
                      increment when you save.
                    </p>
                  </div>
                ) : (
                  <div className="text-center py-8 bg-amber-50 rounded-lg border border-amber-200">
                    <AlertCircle className="h-8 w-8 mx-auto mb-2 text-amber-600" />
                    <p className="text-amber-900 font-medium">
                      No announcement data loaded
                    </p>
                    <p className="text-sm text-amber-700 mt-1">
                      Click "Load from GitHub" to fetch the current announcement
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Step 2: Edit HTML Content */}
            {announcements.length > 0 && (
              <Card className="border-blue-200 shadow-sm bg-white">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100">
                  <CardTitle className="flex items-center gap-2 text-blue-900">
                    <Badge className="bg-blue-600 text-white border-0">
                      Step 2
                    </Badge>
                    Edit HTML Content
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <HtmlEditorWithPreview
                    value={announcementContent}
                    onChange={setAnnouncementContent}
                  />
                </CardContent>
              </Card>
            )}

            {/* Step 3: Save to GitHub */}
            {announcements.length > 0 && (
              <Card className="border-blue-200 shadow-sm bg-white">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100">
                  <CardTitle className="flex items-center gap-2 text-blue-900">
                    <Badge className="bg-blue-600 text-white border-0">
                      Step 3
                    </Badge>
                    Save to GitHub
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 pt-6">
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Commit Message
                    </label>
                    <Textarea
                      placeholder="Update announcement content..."
                      value={announcementCommitMessage}
                      onChange={(e) =>
                        setAnnouncementCommitMessage(e.target.value)
                      }
                      rows={3}
                    />
                  </div>
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <p className="text-sm text-blue-900">
                      <strong>Note:</strong> When saved, the announcement ID
                      will automatically increment from{" "}
                      <Badge className="bg-blue-600 text-white border-0 mx-1">
                        {announcements[0]?.id || "N/A"}
                      </Badge>
                      to
                      <Badge className="bg-green-600 text-white border-0 mx-1">
                        {announcements.length > 0
                          ? String(
                              Math.max(
                                ...announcements.map(
                                  (a: any) => parseInt(a.id) || 0,
                                ),
                              ) + 1,
                            )
                          : "1"}
                      </Badge>
                    </p>
                  </div>
                  <Button
                    onClick={handleSaveAnnouncement}
                    disabled={
                      !announcementCommitMessage.trim() ||
                      savingAnnouncement ||
                      !announcementContent.trim()
                    }
                    className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                    size="lg"
                  >
                    {savingAnnouncement ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin mr-2" />
                        Saving to GitHub...
                      </>
                    ) : (
                      <>
                        <Save className="h-5 w-5 mr-2" />
                        Save Announcement to GitHub
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
