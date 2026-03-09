"use client";

import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { FolderOpen, File, CheckSquare, Square } from "lucide-react";

interface DriveItem {
  id: string;
  name: string;
  mimeType: string;
  size?: number;
  modifiedTime?: string;
}

interface DriveItemSelectorProps {
  items: DriveItem[];
  selectedIds: string[];
  onSelectionChange: (selectedIds: string[]) => void;
}

export const DriveItemSelector = React.memo(function DriveItemSelector({
  items,
  selectedIds,
  onSelectionChange,
}: DriveItemSelectorProps) {
  const isFolder = (mimeType: string) => {
    return mimeType === "application/vnd.google-apps.folder";
  };

  const toggleItem = (id: string) => {
    if (selectedIds.includes(id)) {
      onSelectionChange(selectedIds.filter((selectedId) => selectedId !== id));
    } else {
      onSelectionChange([...selectedIds, id]);
    }
  };

  const toggleAll = () => {
    if (selectedIds.length === items.length) {
      onSelectionChange([]);
    } else {
      onSelectionChange(items.map((item) => item.id));
    }
  };

  const allSelected = items.length > 0 && selectedIds.length === items.length;
  const someSelected =
    selectedIds.length > 0 && selectedIds.length < items.length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between bg-gradient-to-r from-slate-50 to-blue-50 p-3 rounded-lg border border-blue-200">
        <div className="flex items-center gap-2">
          <Checkbox
            checked={allSelected}
            onCheckedChange={toggleAll}
            className="mr-2 border-blue-400"
            id="select-all"
          />
          <label
            htmlFor="select-all"
            className="text-sm font-medium cursor-pointer text-slate-700"
          >
            {allSelected
              ? "Deselect All"
              : someSelected
                ? `Selected ${selectedIds.length} of ${items.length}`
                : "Select All"}
          </label>
        </div>
        <Badge className="bg-blue-600 text-white border-0">
          {items.length} {items.length === 1 ? "item" : "items"}
        </Badge>
      </div>

      <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
        {items.length === 0 ? (
          <Card className="border-slate-200 shadow-sm">
            <CardContent className="pt-6 text-center text-slate-500">
              No items found in root directory
            </CardContent>
          </Card>
        ) : (
          items.map((item) => {
            const selected = selectedIds.includes(item.id);
            const itemIsFolder = isFolder(item.mimeType);

            return (
              <Card
                key={item.id}
                className={`cursor-pointer transition-all duration-200 border-2 ${
                  selected
                    ? "bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-400 shadow-md"
                    : "border-slate-200 hover:border-blue-300 hover:shadow-sm"
                }`}
                onClick={() => toggleItem(item.id)}
              >
                <CardContent className="p-3">
                  <div className="flex items-center gap-3">
                    <Checkbox
                      checked={selected}
                      onCheckedChange={() => toggleItem(item.id)}
                      onClick={(e: React.MouseEvent) => e.stopPropagation()}
                      className="border-blue-400"
                    />
                    {itemIsFolder ? (
                      <FolderOpen className="h-5 w-5 text-amber-600 flex-shrink-0" />
                    ) : (
                      <File className="h-5 w-5 text-blue-600 flex-shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm truncate text-slate-800">
                        {item.name}
                      </div>
                      <div className="text-xs text-slate-500">
                        {itemIsFolder ? "Folder" : "File"}
                        {item.size && ` • ${formatFileSize(item.size)}`}
                      </div>
                    </div>
                    <Badge
                      className={
                        itemIsFolder
                          ? "bg-amber-500 text-white border-0"
                          : "bg-blue-500 text-white border-0"
                      }
                    >
                      {itemIsFolder ? "Folder" : "File"}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
});

function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
}
