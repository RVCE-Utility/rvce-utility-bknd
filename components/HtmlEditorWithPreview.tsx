"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Code, Eye } from "lucide-react";

interface HtmlEditorWithPreviewProps {
  value: string;
  onChange: (value: string) => void;
}

export const HtmlEditorWithPreview = React.memo(function HtmlEditorWithPreview({
  value,
  onChange,
}: HtmlEditorWithPreviewProps) {
  return (
    <div className="grid grid-cols-2 gap-4">
      {/* HTML Editor */}
      <Card className="border-blue-200 shadow-sm">
        <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200">
          <CardTitle className="text-sm font-semibold text-slate-700 flex items-center gap-2">
            <Code className="h-4 w-4" />
            HTML Editor
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Enter HTML content here..."
            className="min-h-[500px] font-mono text-sm border-0 rounded-none resize-none focus-visible:ring-0 focus-visible:ring-offset-0"
          />
        </CardContent>
      </Card>

      {/* Live Preview */}
      <Card className="border-blue-200 shadow-sm">
        <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200">
          <CardTitle className="text-sm font-semibold text-slate-700 flex items-center gap-2">
            <Eye className="h-4 w-4" />
            Live Preview
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <div
            className="prose prose-sm max-w-none min-h-[500px] overflow-auto bg-white p-4 rounded border border-slate-200"
            dangerouslySetInnerHTML={{ __html: value }}
          />
        </CardContent>
      </Card>
    </div>
  );
});
