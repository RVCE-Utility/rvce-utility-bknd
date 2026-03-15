"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  type RedesignFeedbackEntry,
  listenToRedesignFeedback,
} from "@/lib/firebase";

const toDisplayString = (value: unknown): string => {
  if (value === null || value === undefined || value === "") {
    return "Not provided";
  }

  if (typeof value === "string") {
    return value;
  }

  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }

  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
};

export default function FeedbacksPage() {
  const [feedbacks, setFeedbacks] = useState<RedesignFeedbackEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = listenToRedesignFeedback(
      (entries) => {
        setFeedbacks(entries);
        setLoading(false);
        setError(null);
      },
      (listenerError) => {
        console.error("Failed to read feedbacks:", listenerError);
        setLoading(false);
        setError(
          "Could not read feedbacks from Firebase. Check your Realtime Database rules for feedback/redesign read access.",
        );
      },
    );

    return () => unsubscribe();
  }, []);

  const filteredFeedbacks = useMemo(() => {
    const value = search.trim().toLowerCase();
    if (!value) {
      return feedbacks;
    }

    return feedbacks.filter((item) => {
      return [
        item.id,
        item.name,
        item.email,
        item.userId,
        item.page,
        item.version,
        item.engagement,
        item.suggestion,
      ]
        .filter(Boolean)
        .some((field) => toDisplayString(field).toLowerCase().includes(value));
    });
  }, [feedbacks, search]);

  const overallStats = useMemo(() => {
    const ratingCounts = {
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      5: 0,
    };

    let ratingSum = 0;
    let ratedCount = 0;
    let withSuggestionCount = 0;
    const contributorKeys = new Set<string>();
    const now = Date.now();
    const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;
    let recentSevenDaysCount = 0;

    feedbacks.forEach((item) => {
      const rating = Number(item.rating);
      if (rating >= 1 && rating <= 5) {
        ratingCounts[rating as 1 | 2 | 3 | 4 | 5] += 1;
        ratingSum += rating;
        ratedCount += 1;
      }

      if ((item.suggestion || "").trim().length > 0) {
        withSuggestionCount += 1;
      }

      const contributorKey = (item.email || item.userId || item.name || "")
        .toString()
        .trim()
        .toLowerCase();
      if (contributorKey) {
        contributorKeys.add(contributorKey);
      }

      if (item.createdAt && now - item.createdAt <= sevenDaysMs) {
        recentSevenDaysCount += 1;
      }
    });

    const averageRating = ratedCount > 0 ? ratingSum / ratedCount : 0;

    return {
      totalFeedbacks: feedbacks.length,
      averageRating,
      ratedCount,
      ratingCounts,
      withSuggestionCount,
      uniqueContributors: contributorKeys.size,
      recentSevenDaysCount,
    };
  }, [feedbacks]);

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Feedbacks</h1>
          <p className="text-gray-600 mt-1">
            Full redesign feedback records from Firebase Realtime Database
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Average Rating
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">
                {overallStats.averageRating.toFixed(2)} / 5
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Based on {overallStats.ratedCount} rated feedbacks
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Total Feedbacks
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">
                {overallStats.totalFeedbacks}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Last 7 days: {overallStats.recentSevenDaysCount}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Suggestions Submitted
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">
                {overallStats.withSuggestionCount}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                With written feedback text
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Unique Contributors
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">
                {overallStats.uniqueContributors}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Estimated from email, userId, or name
              </p>
            </CardContent>
          </Card>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-base">Rating Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {[5, 4, 3, 2, 1].map((rating) => (
                <div
                  key={rating}
                  className="rounded-md border bg-white p-3 flex items-center justify-between"
                >
                  <span className="font-medium text-gray-700">
                    {rating} Star
                  </span>
                  <Badge variant="secondary">
                    {
                      overallStats.ratingCounts[
                        rating as keyof typeof overallStats.ratingCounts
                      ]
                    }
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-base">Filter Feedbacks</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Input
              placeholder="Search by email, name, suggestion, page, version, id..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <div className="text-sm text-gray-600">
              Total entries: <strong>{feedbacks.length}</strong>
              {search ? (
                <>
                  {" "}
                  | Matching: <strong>{filteredFeedbacks.length}</strong>
                </>
              ) : null}
            </div>
          </CardContent>
        </Card>

        {loading ? (
          <Card>
            <CardContent className="py-8 text-sm text-gray-600">
              Loading feedbacks...
            </CardContent>
          </Card>
        ) : error ? (
          <Card>
            <CardContent className="py-8 text-sm text-red-600">
              {error}
            </CardContent>
          </Card>
        ) : filteredFeedbacks.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-sm text-gray-600">
              No feedback entries found.
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredFeedbacks.map((item) => {
              const date = item.createdAt
                ? new Date(item.createdAt).toLocaleString()
                : "Unknown";

              return (
                <Card key={item.id}>
                  <CardHeader className="pb-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <CardTitle className="text-base">
                        {item.name || "Anonymous User"}
                      </CardTitle>
                      <Badge variant="secondary">Rating: {item.rating}/5</Badge>
                      {item.version ? (
                        <Badge variant="outline">{item.version}</Badge>
                      ) : null}
                    </div>
                    <p className="text-xs text-gray-500">Entry ID: {item.id}</p>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      <p>
                        <span className="font-semibold">Email:</span>{" "}
                        {toDisplayString(item.email)}
                      </p>
                      <p>
                        <span className="font-semibold">User ID:</span>{" "}
                        {toDisplayString(item.userId)}
                      </p>
                      <p>
                        <span className="font-semibold">Page:</span>{" "}
                        {toDisplayString(item.page)}
                      </p>
                      <p>
                        <span className="font-semibold">Engagement:</span>{" "}
                        {toDisplayString(item.engagement)}
                      </p>
                      <p>
                        <span className="font-semibold">Created At:</span>{" "}
                        {date}
                      </p>
                    </div>

                    <div className="rounded-md border bg-gray-50 p-3 whitespace-pre-wrap break-words">
                      <span className="font-semibold">Suggestion:</span>
                      <div className="mt-1">
                        {item.suggestion || "No suggestion provided."}
                      </div>
                    </div>

                    <details className="rounded-md border p-3">
                      <summary className="cursor-pointer font-medium">
                        Raw JSON
                      </summary>
                      <pre className="mt-2 overflow-auto text-xs bg-gray-50 p-3 rounded">
                        {JSON.stringify(item, null, 2)}
                      </pre>
                    </details>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
