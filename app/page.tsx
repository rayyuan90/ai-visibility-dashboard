"use client";
import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  Bell,
  Bot,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CircleHelp,
  ExternalLink,
  Eye,
  FileText,
  Filter,
  Layers3,
  LayoutDashboard,
  Search,
  Sparkles,
  Target,
  X,
} from "lucide-react";
import { PlatformChart, TrendChart } from "@/components/Charts";
import type { Dashboard, Question } from "@/lib/types";
const pct = (n: number) => `${n}%`;
export default function Home() {
  const [dash, setDash] = useState<Dashboard | null>(null),
    [questions, setQuestions] = useState<Question[]>([]),
    [loading, setLoading] = useState(true),
    [error, setError] = useState(""),
    [search, setSearch] = useState(""),
    [platform, setPlatform] = useState("all"),
    [topic, setTopic] = useState("all"),
    [status, setStatus] = useState("all"),
    [selected, setSelected] = useState<Question | null>(null),
    [insight, setInsight] = useState(""),
    [aiLoading, setAiLoading] = useState(false),
    [detailInsight, setDetailInsight] = useState(""),
    [insightProvider, setInsightProvider] = useState("");
  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const [d, q] = await Promise.all([
        fetch("/api/dashboard"),
        fetch(
          `/api/questions?search=${encodeURIComponent(search)}&platform=${encodeURIComponent(platform)}&topic=${encodeURIComponent(topic)}&status=${status}`,
        ),
      ]);
      if (!d.ok || !q.ok) throw new Error("数据加载失败");
      const dj = await d.json(),
        qj = await q.json();
      setDash(dj);
      setQuestions(qj.questions);
    } catch (e) {
      setError(e instanceof Error ? e.message : "发生未知错误");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    const t = setTimeout(() => void load(), 200);
    return () => clearTimeout(t);
  }, [search, platform, topic, status]);
  const runAI = async (id?: number) => {
    setAiLoading(true);
    setInsight("");
    try {
      const r = await fetch("/api/insights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(id ? { questionId: id } : {}),
      });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error);
      setInsightProvider(j.provider === "mock" ? "Mock AI（未配置 API Key）" : `真实模型 · ${j.model}`);
      id ? setDetailInsight(j.insight) : setInsight(j.insight);
    } catch (e) {
      const message = e instanceof Error ? e.message : "暂时无法生成分析，请稍后重试。";
      id ? setDetailInsight(message) : setInsight(message);
    } finally {
      setAiLoading(false);
    }
  };
  const topics = useMemo(() => dash?.topics.map((t) => t.topic) || [], [dash]);
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brandmark">
          <div className="mark">
            <Activity size={18} />
          </div>
          <span>
            aster<span className="brand-light">.intel</span>
          </span>
        </div>
        <div className="workspace">
          <div className="workspace-icon">A</div>
          <div>
            <b>AsterVision</b>
            <small>品牌工作区</small>
          </div>
          <ChevronDown size={15} />
        </div>
        <div className="nav-label">工作区</div>
        <nav>
          <a className="nav-item active">
            <LayoutDashboard size={17} />
            总览
          </a>
          <a className="nav-item">
            <Eye size={17} />
            问题分析
          </a>
          <a className="nav-item">
            <Layers3 size={17} />
            主题表现
          </a>
          <a className="nav-item">
            <BarChart3 size={17} />
            竞品对比
          </a>
        </nav>
        <div className="side-bottom">
          <div className="help-card">
            <div className="help-icon">
              <CircleHelp size={17} />
            </div>
            <b>需要帮助？</b>
            <span>了解如何提升 AI 搜索可见度</span>
            <button>
              查看指南 <ExternalLink size={12} />
            </button>
          </div>
          <div className="profile">
            <div className="avatar">L</div>
            <div>
              <b>Lin Zhang</b>
              <small>管理员</small>
            </div>
            <ChevronDown size={15} />
          </div>
        </div>
      </aside>
      <main className="main">
        <header className="topbar">
          <div className="crumb">
            工作区 <span>/</span> <b>总览</b>
          </div>
          <div className="top-actions">
            <div className="period">
              <span className="live-dot" />
              数据周期：2026.08.01 — 08.30 <ChevronDown size={14} />
            </div>
            <button className="icon-button">
              <Bell size={17} />
              <i />
            </button>
            <div className="avatar small">L</div>
          </div>
        </header>
        <div className="content">
          <div className="page-heading">
            <div>
              <div className="eyebrow">
                <span /> AI SEARCH INTELLIGENCE
              </div>
              <h1>品牌可见度总览</h1>
              <p>追踪 AsterVision 在 AI 搜索生态中的表现与声量。</p>
            </div>
            <div className="heading-right">
              <span className="updated">● 数据已更新</span>
              <button className="button secondary">
                <FileText size={15} /> 导出报告
              </button>
            </div>
          </div>
          {error && (
            <div className="error-state">
              {error} <button onClick={() => void load()}>重新加载</button>
            </div>
          )}
          {loading && !dash ? (
            <div className="loading-state">
              <span className="spinner" />
              正在加载数据…
            </div>
          ) : (
            dash && (
              <>
                <section className="metric-grid">
                  <Metric
                    icon={<Eye size={17} />}
                    label="可见度得分"
                    value={dash.summary.visibility_score}
                    suffix="/ 100"
                    trend="+8.4%"
                    up
                    note="较上周期"
                    tone="lavender"
                  />
                  <Metric
                    icon={<Activity size={17} />}
                    label="品牌提及"
                    value={dash.summary.mentions}
                    trend="+12.6%"
                    up
                    note="较上周期"
                    tone="mint"
                  />
                  <Metric
                    icon={<Target size={17} />}
                    label="推荐次数"
                    value={dash.summary.recommendations}
                    trend="+6.2%"
                    up
                    note="较上周期"
                    tone="peach"
                  />
                  <Metric
                    icon={<FileText size={17} />}
                    label="引用来源"
                    value={dash.summary.citations}
                    trend="−2.1%"
                    note="较上周期"
                    tone="blue"
                  />
                </section>
                <section className="chart-grid">
                  <div className="card trend-card">
                    <div className="card-head">
                      <div>
                        <h2>可见度趋势</h2>
                        <p>过去 30 天的品牌表现变化</p>
                      </div>
                      <button className="select-button">
                        近 30 天 <ChevronDown size={14} />
                      </button>
                    </div>
                    <TrendChart data={dash.trend} />
                  </div>
                  <div className="card platform-card">
                    <div className="card-head">
                      <div>
                        <h2>平台表现</h2>
                        <p>各 AI 平台的可见度得分</p>
                      </div>
                      <button className="dots">···</button>
                    </div>
                    <PlatformChart data={dash.platforms} />
                    <div className="platform-legend">
                      <span>
                        <i className="dot purple" />
                        提及 <b>{dash.summary.mentions}</b>
                      </span>
                      <span>
                        <i className="dot green" />
                        推荐 <b>{dash.summary.recommendations}</b>
                      </span>
                    </div>
                  </div>
                </section>
                <section className="card topics-card">
                  <div className="card-head">
                    <div>
                      <h2>主题表现</h2>
                      <p>了解品牌在哪些内容领域更容易被 AI 提及</p>
                    </div>
                    <button className="link-button">
                      查看全部主题 <ChevronRight size={15} />
                    </button>
                  </div>
                  <div className="topic-grid">
                    {dash.topics.slice(0, 4).map((t) => (
                      <button
                        className="topic"
                        key={t.topic}
                        onClick={() => {
                          setTopic(t.topic);
                          document
                            .getElementById("question-list")
                            ?.scrollIntoView({ behavior: "smooth" });
                        }}
                      >
                        <div className="topic-top">
                          <span>{t.topic}</span>
                          <b>{t.visibility}%</b>
                        </div>
                        <div className="progress">
                          <i style={{ width: `${t.visibility}%` }} />
                        </div>
                        <small>
                          {t.questions} 个问题 <span>·</span>{" "}
                          {t.recommendations} 次推荐
                        </small>
                      </button>
                    ))}
                  </div>
                </section>
                <section id="question-list" className="card questions-card">
                  <div className="card-head questions-title">
                    <div>
                      <h2>用户问题分析</h2>
                      <p>查看 AI 平台如何回答关于你所在领域的问题</p>
                    </div>
                    <span className="count-pill">
                      {questions.length} 条记录
                    </span>
                  </div>
                  <div className="filters">
                    <div className="search-box">
                      <Search size={16} />
                      <input
                        placeholder="搜索问题或回答…"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                      />
                      {search && (
                        <button onClick={() => setSearch("")}>
                          <X size={13} />
                        </button>
                      )}
                    </div>
                    <div className="filter-group">
                      <Filter size={14} />
                      <select
                        value={platform}
                        onChange={(e) => setPlatform(e.target.value)}
                      >
                        <option value="all">所有平台</option>
                        {dash.platforms.map((p) => (
                          <option key={p.name}>{p.name}</option>
                        ))}
                      </select>
                      <select
                        value={topic}
                        onChange={(e) => setTopic(e.target.value)}
                      >
                        <option value="all">所有主题</option>
                        {topics.map((t) => (
                          <option key={t}>{t}</option>
                        ))}
                      </select>
                      <select
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                      >
                        <option value="all">所有状态</option>
                        <option value="recommended">已推荐</option>
                        <option value="mentioned">已提及</option>
                        <option value="missed">未提及</option>
                      </select>
                    </div>
                  </div>
                  <div className="table-wrap">
                    <table>
                      <thead>
                        <tr>
                          <th>用户问题</th>
                          <th>平台</th>
                          <th>主题</th>
                          <th>提及</th>
                          <th>推荐</th>
                          <th>引用</th>
                          <th />
                        </tr>
                      </thead>
                      <tbody>
                        {questions.slice(0, 8).map((q) => (
                          <tr
                            key={q.id}
                            onClick={() => {
                              setSelected(q);
                              setDetailInsight("");
                            }}
                          >
                            <td className="question-cell">
                              <span>{q.question}</span>
                              <small>{q.date}</small>
                            </td>
                            <td>
                              <PlatformName name={q.platform} />
                            </td>
                            <td>
                              <span className="topic-chip">{q.topic}</span>
                            </td>
                            <td>
                              <Status yes={q.brand_mentioned} />
                            </td>
                            <td>
                              <Status yes={q.brand_recommended} recommended />
                            </td>
                            <td className="cite-count">
                              {q.citation_count} 来源
                            </td>
                            <td>
                              <ChevronRight size={16} className="row-chevron" />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {questions.length === 0 && (
                      <div className="empty-state">
                        <Search size={22} />
                        <b>没有找到匹配的问题</b>
                        <span>尝试调整关键词或筛选条件。</span>
                        <button
                          onClick={() => {
                            setSearch("");
                            setPlatform("all");
                            setTopic("all");
                            setStatus("all");
                          }}
                        >
                          清除筛选
                        </button>
                      </div>
                    )}
                  </div>
                  <div className="table-footer">
                    显示 {Math.min(questions.length, 8)} 条，共{" "}
                    {questions.length} 条{" "}
                    <div>
                      <button disabled>上一页</button>
                      <button className="current-page">1</button>
                      <button disabled>下一页</button>
                    </div>
                  </div>
                </section>
              </>
            )
          )}
          <footer>
            © 2026 Aster Intel <span>帮助中心　·　数据说明　·　隐私政策</span>
          </footer>
        </div>
      </main>
      {insight && (
        <div className="toast-insight">
          <Sparkles size={17} />
          <div>
            <b>AI 可见度分析</b>
            <p>{insight}</p>
          </div>
          <button onClick={() => setInsight("")}>
            <X size={15} />
          </button>
        </div>
      )}
      {selected && (
        <div className="overlay" onClick={() => setSelected(null)}>
          <aside className="detail-panel" onClick={(e) => e.stopPropagation()}>
            <div className="detail-head">
              <div>
                <span className="eyebrow">问题详情 · #{selected.id}</span>
                <h2>回答分析</h2>
              </div>
              <button className="icon-button" onClick={() => setSelected(null)}>
                <X size={18} />
              </button>
            </div>
            <div className="detail-content">
              <span className="topic-chip">{selected.topic}</span>
              <h3>{selected.question}</h3>
              <div className="detail-meta">
                <PlatformName name={selected.platform} />
                <span>{selected.date}</span>
              </div>
              <div className="detail-status">
                <div>
                  <small>品牌提及</small>
                  <Status yes={selected.brand_mentioned} />
                </div>
                <div>
                  <small>品牌推荐</small>
                  <Status yes={selected.brand_recommended} recommended />
                </div>
                <div>
                  <small>情绪倾向</small>
                  <span className="sentiment">{selected.sentiment}</span>
                </div>
              </div>
              <div className="detail-section">
                <h4>AI 回答摘要</h4>
                <p className="answer">{selected.answer_excerpt}</p>
                {selected.mentioned_products.length > 0 && (
                  <p className="products">
                    提及产品：{selected.mentioned_products.join("、")}
                  </p>
                )}
              </div>
              <div className="detail-section">
                <h4>
                  引用来源{" "}
                  <span className="count-pill">{selected.citation_count}</span>
                </h4>
                {selected.citations.length ? (
                  selected.citations.map((c, i) => (
                    <a
                      className="citation"
                      href={c.url}
                      target="_blank"
                      rel="noreferrer"
                      key={i}
                    >
                      <span className="citation-icon">
                        <FileText size={15} />
                      </span>
                      <span>
                        <b>{c.title}</b>
                        <small>
                          {c.source_type} · {c.url}
                        </small>
                      </span>
                      <ExternalLink size={14} />
                    </a>
                  ))
                ) : (
                  <div className="no-citations">该回答没有引用来源。</div>
                )}
              </div>
              <div className="detail-section analysis">
                <div className="analysis-title">
                  <Sparkles size={16} />
                  <h4>AI 分析</h4>
                </div>
                {insightProvider && <span className="provider-label">{insightProvider}</span>}
                {detailInsight ? (
                  <p>{detailInsight}</p>
                ) : (
                  <p className="muted">
                    生成针对该回答的品牌可见度解读与优化建议。
                  </p>
                )}
                <button
                  className="button primary full"
                  disabled={aiLoading}
                  onClick={() => void runAI(selected.id)}
                >
                  <Sparkles size={15} />
                  {aiLoading ? "正在生成…" : "生成分析"}
                </button>
              </div>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}
function Metric({
  icon,
  label,
  value,
  suffix,
  trend,
  up,
  note,
  tone,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  suffix?: string;
  trend: string;
  up?: boolean;
  note: string;
  tone: string;
}) {
  return (
    <div className="card metric">
      <div className="metric-top">
        <span className={`metric-icon ${tone}`}>{icon}</span>
        <span className={`trend ${up ? "up" : "down"}`}>
          {up ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />}{" "}
          {trend}
        </span>
      </div>
      <span className="metric-label">{label}</span>
      <div className="metric-value">
        {value}
        <small>{suffix}</small>
      </div>
      <span className="metric-note">{note}</span>
    </div>
  );
}
function Status({ yes, recommended }: { yes: boolean; recommended?: boolean }) {
  return (
    <span
      className={`status ${yes ? "yes" : "no"} ${recommended ? "recommend" : ""}`}
    >
      {yes ? (
        <>
          <Check size={12} />
          {recommended ? "推荐" : "提及"}
        </>
      ) : (
        "—"
      )}
    </span>
  );
}
function PlatformName({ name }: { name: string }) {
  const key = name.toLowerCase();
  return (
    <span className="platform-name">
      <i className={`platform-icon ${key}`}>
        {(
          {
            chatgpt: "✳",
            gemini: "✦",
            claude: "✳",
            perplexity: "◈",
            deepseek: "≈",
          } as Record<string, string>
        )[key] || "•"}
      </i>
      {name}
    </span>
  );
}
