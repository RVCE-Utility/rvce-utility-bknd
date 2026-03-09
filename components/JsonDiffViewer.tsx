"use client";

import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeftRight, FileJson, Copy, Check } from "lucide-react";

interface JsonDiffViewerProps {
  leftJson: any;
  rightJson: any;
  leftTitle?: string;
  rightTitle?: string;
}

type DiffLine = {
  type: "same" | "added" | "removed" | "modified";
  leftContent: string;
  rightContent: string;
  leftLineNum: number;
  rightLineNum: number;
};

export const JsonDiffViewer = React.memo(function JsonDiffViewer({
  leftJson,
  rightJson,
  leftTitle = "GitHub (Current)",
  rightTitle = "Drive (New)",
}: JsonDiffViewerProps) {
  const [viewMode, setViewMode] = useState<"side-by-side" | "unified">(
    "side-by-side",
  );
  const [copied, setCopied] = useState(false);

  const formatJson = (obj: any): string => {
    return JSON.stringify(obj, null, 2);
  };

  const { diffLines, stats } = useMemo(() => {
    const leftStr = formatJson(leftJson);
    const rightStr = formatJson(rightJson);

    const leftLines = leftStr.split("\n");
    const rightLines = rightStr.split("\n");

    const lines: DiffLine[] = [];
    let added = 0;
    let removed = 0;
    let modified = 0;

    const maxLen = Math.max(leftLines.length, rightLines.length);

    for (let i = 0; i < maxLen; i++) {
      const left = leftLines[i] ?? "";
      const right = rightLines[i] ?? "";

      if (left === right) {
        lines.push({
          type: "same",
          leftContent: left,
          rightContent: right,
          leftLineNum: i + 1,
          rightLineNum: i + 1,
        });
      } else if (left && !right) {
        removed++;
        lines.push({
          type: "removed",
          leftContent: left,
          rightContent: "",
          leftLineNum: i + 1,
          rightLineNum: -1,
        });
      } else if (!left && right) {
        added++;
        lines.push({
          type: "added",
          leftContent: "",
          rightContent: right,
          leftLineNum: -1,
          rightLineNum: i + 1,
        });
      } else {
        modified++;
        lines.push({
          type: "modified",
          leftContent: left,
          rightContent: right,
          leftLineNum: i + 1,
          rightLineNum: i + 1,
        });
      }
    }

    const identical = added === 0 && removed === 0 && modified === 0;

    return {
      diffLines: lines,
      stats: { identical, added, removed, modified },
    };
  }, [leftJson, rightJson]);

  const copyToClipboard = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-200">
        <div className="flex items-center gap-4">
          <FileJson className="h-5 w-5 text-blue-600" />
          <div className="text-sm space-x-4">
            {stats.identical ? (
              <span className="text-green-700 font-medium flex items-center gap-1">
                <Check className="h-4 w-4" />
                Files are identical
              </span>
            ) : (
              <div className="flex gap-3">
                {stats.added > 0 && (
                  <span className="text-green-700 font-medium bg-green-100 px-2 py-1 rounded">
                    +{stats.added} added
                  </span>
                )}
                {stats.removed > 0 && (
                  <span className="text-red-700 font-medium bg-red-100 px-2 py-1 rounded">
                    -{stats.removed} removed
                  </span>
                )}
                {stats.modified > 0 && (
                  <span className="text-amber-700 font-medium bg-amber-100 px-2 py-1 rounded">
                    ~{stats.modified} modified
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant={viewMode === "side-by-side" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("side-by-side")}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <ArrowLeftRight className="h-4 w-4 mr-2" />
            Side by Side
          </Button>
          <Button
            variant={viewMode === "unified" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("unified")}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <FileJson className="h-4 w-4 mr-2" />
            Unified
          </Button>
        </div>
      </div>

      {viewMode === "side-by-side" ? (
        <div className="grid grid-cols-2 gap-4">
          <Card className="border-blue-200 shadow-sm">
            <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold text-slate-700">
                  {leftTitle}
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(formatJson(leftJson))}
                >
                  {copied ? (
                    <Check className="h-4 w-4 text-green-600" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-auto max-h-[600px] font-mono text-xs">
                {diffLines.map((line, idx) => (
                  <div
                    key={`left-${idx}`}
                    className={`flex ${
                      line.type === "removed"
                        ? "bg-red-50 text-red-900"
                        : line.type === "modified"
                          ? "bg-amber-50 text-amber-900"
                          : line.type === "added"
                            ? "bg-slate-50 text-slate-400"
                            : "hover:bg-slate-50"
                    }`}
                  >
                    <span className="px-3 py-1 text-slate-400 select-none w-12 text-right border-r border-slate-200">
                      {line.leftLineNum > 0 ? line.leftLineNum : ""}
                    </span>
                    <pre className="px-4 py-1 flex-1 whitespace-pre">
                      {line.leftContent || " "}
                    </pre>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="border-blue-200 shadow-sm">
            <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold text-slate-700">
                  {rightTitle}
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(formatJson(rightJson))}
                >
                  {copied ? (
                    <Check className="h-4 w-4 text-green-600" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-auto max-h-[600px] font-mono text-xs">
                {diffLines.map((line, idx) => (
                  <div
                    key={`right-${idx}`}
                    className={`flex ${
                      line.type === "added"
                        ? "bg-green-50 text-green-900"
                        : line.type === "modified"
                          ? "bg-amber-50 text-amber-900"
                          : line.type === "removed"
                            ? "bg-slate-50 text-slate-400"
                            : "hover:bg-slate-50"
                    }`}
                  >
                    <span className="px-3 py-1 text-slate-400 select-none w-12 text-right border-r border-slate-200">
                      {line.rightLineNum > 0 ? line.rightLineNum : ""}
                    </span>
                    <pre className="px-4 py-1 flex-1 whitespace-pre">
                      {line.rightContent || " "}
                    </pre>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        <Card className="border-blue-200 shadow-sm">
          <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200">
            <CardTitle className="text-sm font-semibold text-slate-700">
              Unified View
            </CardTitle>
          </CardHeader>
          <CardContent className="p-2">
            <Tabs defaultValue="left">
              <TabsList className="grid w-full grid-cols-2 bg-slate-100">
                <TabsTrigger
                  value="left"
                  className="data-[state=active]:bg-blue-600 data-[state=active]:text-white"
                >
                  {leftTitle}
                </TabsTrigger>
                <TabsTrigger
                  value="right"
                  className="data-[state=active]:bg-blue-600 data-[state=active]:text-white"
                >
                  {rightTitle}
                </TabsTrigger>
              </TabsList>
              <TabsContent value="left">
                <pre className="text-xs overflow-auto max-h-[600px] bg-slate-50 p-4 rounded-md border border-slate-200">
                  <code className="text-slate-800">{formatJson(leftJson)}</code>
                </pre>
              </TabsContent>
              <TabsContent value="right">
                <pre className="text-xs overflow-auto max-h-[600px] bg-slate-50 p-4 rounded-md border border-slate-200">
                  <code className="text-slate-800">
                    {formatJson(rightJson)}
                  </code>
                </pre>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}
    </div>
  );
});
