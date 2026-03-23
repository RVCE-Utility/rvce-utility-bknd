"use client";

import React, { useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye, Sparkles } from "lucide-react";

interface HtmlEditorWithPreviewProps {
  value: string;
  onChange: (value: string) => void;
}

export const HtmlEditorWithPreview = React.memo(function HtmlEditorWithPreview({
  value,
  onChange,
}: HtmlEditorWithPreviewProps) {
  const editorRef = useRef<HTMLTextAreaElement | null>(null);

  const insertSnippet = (snippet: string) => {
    const textarea = editorRef.current;

    if (!textarea) {
      onChange(`${value}${value.endsWith("\n") ? "" : "\n"}${snippet}`);
      return;
    }

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const next = `${value.slice(0, start)}${snippet}${value.slice(end)}`;

    onChange(next);

    requestAnimationFrame(() => {
      textarea.focus();
      const nextCursor = start + snippet.length;
      textarea.setSelectionRange(nextCursor, nextCursor);
    });
  };

  const snippetButtons = [
    {
      label: "Title",
      snippet: "<h2>Important update headline</h2>\n",
    },
    {
      label: "Paragraph",
      snippet: "<p>Write a clear and concise update for students here.</p>\n",
    },
    {
      label: "Bullet List",
      snippet:
        "<ul>\n  <li>First key point</li>\n  <li>Second key point</li>\n  <li>Third key point</li>\n</ul>\n",
    },
    {
      label: "Highlight Box",
      snippet:
        '<div style="padding:12px 14px;border-radius:12px;background:#eff6ff;border:1px solid #bfdbfe;">Don\'t miss this deadline.</div>\n',
    },
    {
      label: "Button Link",
      snippet:
        '<p><a href="https://example.com" target="_blank" rel="noreferrer">Open full update</a></p>\n',
    },
  ];

  return (
    <div className="grid gap-4 xl:grid-cols-2">
      {/* HTML Editor */}
      <Card className="border-blue-200 shadow-sm">
        <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200">
          <CardTitle className="text-sm font-semibold text-slate-700 flex items-center gap-2">
            <Sparkles className="h-4 w-4" />
            Announcement Composer
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 p-4">
          <div className="flex flex-wrap gap-2">
            {snippetButtons.map((button) => (
              <Button
                key={button.label}
                type="button"
                variant="outline"
                size="sm"
                onClick={() => insertSnippet(button.snippet)}
                className="h-8"
              >
                {button.label}
              </Button>
            ))}
          </div>

          <Textarea
            ref={editorRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Write announcement content here. Use quick inserts above to avoid hand-writing all HTML."
            className="min-h-[500px] font-mono text-sm resize-y"
          />

          <p className="text-xs text-slate-500">
            Tip: Keep it short, use a heading + 2 to 4 bullets + one action
            link.
          </p>
        </CardContent>
      </Card>

      {/* Live Preview */}
      <Card className="border-blue-200 shadow-sm">
        <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200">
          <CardTitle className="text-sm font-semibold text-slate-700 flex items-center gap-2">
            <Eye className="h-4 w-4" />
            Student Preview
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <div className="min-h-[500px] overflow-auto rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-50 to-white p-4">
            <div className="mx-auto max-w-2xl rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="mb-3 flex items-center justify-between gap-2">
                <h3 className="text-base font-semibold text-slate-900">
                  Campus bulletin
                </h3>
                <Badge className="bg-blue-600 text-white hover:bg-blue-600">
                  New
                </Badge>
              </div>
              <div
                className="prose prose-sm max-w-none text-slate-800 prose-headings:mb-2 prose-headings:mt-3 prose-p:my-2 prose-li:my-1 prose-a:text-blue-700 prose-a:no-underline hover:prose-a:underline"
                dangerouslySetInnerHTML={{
                  __html:
                    value ||
                    "<p>Your announcement preview will appear here as you type.</p>",
                }}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
});
