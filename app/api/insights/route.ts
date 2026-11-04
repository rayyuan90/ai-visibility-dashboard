import { NextRequest, NextResponse } from "next/server";
import { allQuestions, dashboardData } from "@/lib/data";

type InsightRequest = { questionId?: number };

function createMockInsight(questionId?: number) {
  if (questionId) {
    const q = allQuestions.find((item) => item.id === Number(questionId));
    if (!q) return null;
    return `${q.platform} 在「${q.topic}」场景中${q.brand_mentioned ? "提及" : "未提及"} AsterVision，${q.brand_recommended ? "并给出了推荐" : "未明确推荐"}。回答情绪为${q.sentiment}，包含 ${q.citation_count} 条引用。建议补充该场景下的产品证据与第三方资料，提升答案中的品牌可见度。`;
  }
  const best = [...dashboardData.platforms].sort((a, b) => b.visibility - a.visibility)[0];
  const weakest = [...dashboardData.platforms].sort((a, b) => a.visibility - b.visibility)[0];
  return `AsterVision 当前可见度得分为 ${dashboardData.summary.visibility_score}，在 ${dashboardData.summary.questions_analyzed} 个问题中被提及 ${dashboardData.summary.mentions} 次、推荐 ${dashboardData.summary.recommendations} 次。${best.name} 表现最佳（${best.visibility}%），${weakest.name} 相对薄弱（${weakest.visibility}%）。建议优先补充 ${weakest.name} 可检索的权威产品资料，并加强 Office Security 等低可见度主题的内容覆盖。`;
}

export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => ({}))) as InsightRequest;
  const { questionId } = body;
  const question = questionId
    ? allQuestions.find((item) => item.id === Number(questionId))
    : undefined;

  if (questionId) {
    if (!question)
      return NextResponse.json(
        { error: "Question not found" },
        { status: 404 },
      );
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({
      insight: createMockInsight(questionId),
      provider: "mock",
      model: "mock-fallback",
    });
  }

  const baseUrl = (process.env.OPENAI_BASE_URL || "https://api.openai.com/v1").replace(/\/$/, "");
  const model = process.env.OPENAI_MODEL || "gpt-4o-mini";
  const context = question
    ? {
        brand: dashboardData.brand,
        question: question.question,
        platform: question.platform,
        topic: question.topic,
        mentioned: question.brand_mentioned,
        recommended: question.brand_recommended,
        sentiment: question.sentiment,
        answer: question.answer_excerpt,
        citations: question.citations,
      }
    : {
        brand: dashboardData.brand,
        period: dashboardData.period,
        summary: dashboardData.summary,
        platforms: dashboardData.platforms,
        topics: dashboardData.topics,
      };

  try {
    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        temperature: 0.4,
        messages: [
          {
            role: "system",
            content:
              "你是 AI 搜索品牌可见度分析顾问。只依据提供的数据分析，用简体中文回答。输出简洁的分析和 2-3 条可执行建议，不要编造数据或事实。",
          },
          {
            role: "user",
            content: `请分析以下${question ? "问题回答" : "品牌仪表盘"}数据，说明表现、机会和建议：\n${JSON.stringify(context)}`,
          },
        ],
      }),
      signal: AbortSignal.timeout(30_000),
    });

    if (!response.ok) {
      const detail = await response.text();
      console.error("LLM provider error", response.status, detail.slice(0, 500));
      return NextResponse.json(
        { error: `LLM 服务请求失败（${response.status}），请检查模型配置后重试。` },
        { status: 502 },
      );
    }

    const result = await response.json();
    const insight = result.choices?.[0]?.message?.content;
    if (typeof insight !== "string" || !insight.trim()) {
      return NextResponse.json({ error: "LLM 服务没有返回分析内容。" }, { status: 502 });
    }
    return NextResponse.json({ insight: insight.trim(), provider: "openai-compatible", model });
  } catch (error) {
    console.error("LLM request failed", error);
    return NextResponse.json(
      { error: "无法连接 LLM 服务，请检查网络和服务地址后重试。" },
      { status: 502 },
    );
  }
}
