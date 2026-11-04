import { NextRequest, NextResponse } from "next/server";
import { allQuestions } from "@/lib/data";
export async function GET(request: NextRequest) {
  const p = request.nextUrl.searchParams;
  const search = (p.get("search") || "").toLowerCase();
  const platform = p.get("platform") || "all";
  const topic = p.get("topic") || "all";
  const status = p.get("status") || "all";
  const filtered = allQuestions.filter(
    (q) =>
      (!search ||
        q.question.toLowerCase().includes(search) ||
        q.answer_excerpt.toLowerCase().includes(search)) &&
      (platform === "all" || q.platform === platform) &&
      (topic === "all" || q.topic === topic) &&
      (status === "all" ||
        (status === "recommended"
          ? q.brand_recommended
          : status === "mentioned"
            ? q.brand_mentioned
            : !q.brand_mentioned)),
  );
  return NextResponse.json({ total: filtered.length, questions: filtered });
}
