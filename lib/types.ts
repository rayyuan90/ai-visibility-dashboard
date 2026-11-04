export type Citation = { title: string; url: string; source_type: string };
export type Question = {
  id: number;
  date: string;
  platform: string;
  topic: string;
  intent_type: string;
  question: string;
  brand_mentioned: boolean;
  brand_recommended: boolean;
  sentiment: string;
  mentioned_products: string[];
  answer_excerpt: string;
  citations: Citation[];
  citation_count: number;
};
export type Dashboard = {
  brand: string;
  period: string;
  summary: {
    visibility_score: number;
    mentions: number;
    recommendations: number;
    citations: number;
    questions_analyzed: number;
  };
  platforms: {
    name: string;
    visibility: number;
    mentions: number;
    recommendations: number;
    citations: number;
    question_count: number;
  }[];
  trend: {
    date: string;
    visibility: number;
    mentions: number;
    recommendations: number;
  }[];
  topics: {
    topic: string;
    questions: number;
    visibility: number;
    recommendations: number;
  }[];
};
