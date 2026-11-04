import questions from "../questions.json";
import dashboard from "../dashboard_summary.json";
import type { Dashboard, Question } from "./types";
export const allQuestions = questions as Question[];
export const dashboardData = dashboard as Dashboard;
