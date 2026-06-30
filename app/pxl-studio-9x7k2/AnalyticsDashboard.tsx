"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import styles from "./AnalyticsDashboard.module.css";

type MetricTotals = {
  PAGE_VIEW: number;
  PROJECT_VIEW: number;
  CATEGORY_VIEW: number;
  WHATSAPP_CLICK: number;
  EMAIL_CLICK: number;
  PROJECT_LIKE: number;
  PROJECT_SHARE: number;
  MEDIA_VIEW: number;
  MEDIA_LIKE: number;
  MEDIA_SHARE: number;
};

type DataPoint = MetricTotals & {
  label: string;
};

type PeriodData = {
  label: string;
  totals: MetricTotals;
  timeline: DataPoint[];
  interval: string;
};

type DateRange = {
  start: string;
  end: string;
  label: string;
};

type SeriesItem = {
  id: string;
  label: string;
  color: string;
  data: number[];
  rawData: DataPoint[];
};

type ProjectItem = {
  id: string;
  title: string;
  likesCount: number;
  fakeLikes: number;
  viewsCount: number;
  fakeViews: number;
  sharesCount: number;
  fakeShares: number;
  category: { name: string; servicePage: { title: string } };
  media?: any[];
};

const METRICS_DEF: { id: keyof MetricTotals; title: string; icon: string }[] = [
  { id: "PAGE_VIEW", title: "Site Visits", icon: "👁" },
  { id: "PROJECT_VIEW", title: "Project Views", icon: "◈" },
  { id: "MEDIA_VIEW", title: "PDF/Media Views", icon: "📄" },
  { id: "CATEGORY_VIEW", title: "Category Views", icon: "▤" },
  { id: "WHATSAPP_CLICK", title: "WhatsApp Clicks", icon: "💬" },
  { id: "EMAIL_CLICK", title: "Emails Sent", icon: "✉" },
  { id: "PROJECT_LIKE", title: "Real Likes", icon: "♥" },
  { id: "MEDIA_LIKE", title: "PDF/Media Likes", icon: "👍" },
  { id: "PROJECT_SHARE", title: "Real Shares", icon: "🔗" },
  { id: "MEDIA_SHARE", title: "PDF/Media Shares", icon: "🚀" },
];

const COLOR_PALETTE = [
  "#1565d8", "#f59e0b", "#10b981", "#ef4444", "#8b5cf6",
  "#ec4899", "#06b6d4", "#f97316", "#84cc16", "#3b82f6"
];

const calculatePresetRanges = (tf: string): { start: string; end: string } => {
  const end = new Date();
  const start = new Date();
  switch (tf) {
    case "1h":   start.setHours(end.getHours() - 1); break;
    case "24h":  start.setDate(end.getDate() - 1); break;
    case "7d":   start.setDate(end.getDate() - 7); break;
    case "30d":  start.setDate(end.getDate() - 30); break;
    case "90d":  start.setDate(end.getDate() - 90); break;
    case "180d": start.setDate(end.getDate() - 180); break;
    case "1y":   start.setFullYear(end.getFullYear() - 1); break;
    case "5y":   start.setFullYear(end.getFullYear() - 5); break;
    default:     start.setDate(end.getDate() - 7);
  }
  return {
    start: start.toISOString().split("T")[0],
    end: end.toISOString().split("T")[0],
  };
};

const PeriodManager = ({
  state,
  setState,
}: {
  state: DateRange[];
  setState: (v: DateRange[]) => void;
}) => {
  const [mode, setMode] = useState<"preset" | "custom">("preset");
  const [preset, setPreset] = useState<string>("7d");

  useEffect(() => {
    if (mode === "preset") {
      const { start, end } = calculatePresetRanges(preset);
      setState([{ start, end, label: `Last ${preset}` }]);
    }
  }, [mode, preset, setState]);

  return (
    <div style={{ background: "var(--adm-bg)", padding: "16px", borderRadius: "8px", border: "1px solid var(--adm-border)", display: "flex", flexDirection: "column", gap: "12px", width: "100%" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ fontSize: "0.9rem", fontWeight: 600 }}>Timeframe Settings</div>
        <select
          className="select"
          style={{ width: "200px" }}
          value={mode === "preset" ? preset : "custom"}
          onChange={e => {
            if (e.target.value === "custom") {
              setMode("custom");
            } else {
              setMode("preset");
              setPreset(e.target.value);
            }
          }}
        >
          <option value="1h">Last 1 Hour</option>
          <option value="24h">Last 24 Hours</option>
          <option value="7d">Last 7 Days</option>
          <option value="30d">Last 30 Days</option>
          <option value="90d">Last 3 Months</option>
          <option value="180d">Last 6 Months</option>
          <option value="1y">Last 1 Year</option>
          <option value="5y">Last 5 Years</option>
          <option value="custom">Custom (Multiple Periods)</option>
        </select>
      </div>

      {mode === "custom" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginTop: "8px" }}>
          {state.map((p, idx) => (
            <div key={idx} style={{ display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap" }}>
              <input
                type="text"
                className="input"
                style={{ width: "140px" }}
                value={p.label}
                onChange={e => {
                  const n = [...state];
                  n[idx] = { ...n[idx], label: e.target.value };
                  setState(n);
                }}
                placeholder="Label (e.g. 2024)"
              />
              <input type="date" className="input" value={p.start} onChange={e => {
                const n = [...state];
                n[idx] = { ...n[idx], start: e.target.value };
                setState(n);
              }} />
              <span style={{ color: "var(--adm-muted)", fontSize: "0.85rem" }}>to</span>
              <input type="date" className="input" value={p.end} onChange={e => {
                const n = [...state];
                n[idx] = { ...n[idx], end: e.target.value };
                setState(n);
              }} />
              {state.length > 1 && (
                <button onClick={() => setState(state.filter((_, i) => i !== idx))} className="btnGhost" style={{ color: "#ef4444", padding: "4px 8px" }}>✕</button>
              )}
            </div>
          ))}
          <button
            onClick={() => setState([...state, { start: new Date().toISOString().split("T")[0], end: new Date().toISOString().split("T")[0], label: `Period ${state.length + 1}` }])}
            className="btnGhost"
            style={{ alignSelf: "flex-start", fontSize: "0.85rem" }}
          >
            + Add Comparison Period
          </button>
        </div>
      )}
    </div>
  );
};

export default function AnalyticsDashboard({
  initialProjectCount,
  initialCategoryCount,
  initialProjects,
}: {
  initialProjectCount: number;
  initialCategoryCount: number;
  initialProjects: ProjectItem[];
}) {
  const [activeTab, setActiveTab] = useState<"overview" | "analytics">("overview");

  const [activeMetrics, setActiveMetrics] = useState<(keyof MetricTotals)[]>(["PAGE_VIEW"]);

  const toggleMetric = (metric: keyof MetricTotals) => {
    setActiveMetrics(prev => {
      if (prev.includes(metric)) {
        return prev.length > 1 ? prev.filter(m => m !== metric) : prev;
      }
      return [...prev, metric];
    });
  };

  const [periods, setPeriods] = useState<DateRange[]>([
    {
      start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      end: new Date().toISOString().split("T")[0],
      label: "Last 7 Days",
    },
  ]);

  const [chartType, setChartType] = useState<"line" | "bar">("line");
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number } | null>(null);

  const [analyticsData, setAnalyticsData] = useState<PeriodData[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [selectedMediaId, setSelectedMediaId] = useState<string | null>(null);
  const [projectAnalytics, setProjectAnalytics] = useState<PeriodData[]>([]);
  const [projectLoading, setProjectLoading] = useState<boolean>(false);

  const [projectPeriods, setProjectPeriods] = useState<DateRange[]>([
    {
      start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      end: new Date().toISOString().split("T")[0],
      label: "Last 7 Days",
    },
  ]);
  const [projectActiveMetrics, setProjectActiveMetrics] = useState<(keyof MetricTotals)[]>(["PROJECT_VIEW", "PROJECT_LIKE", "PROJECT_SHARE"]);

  const svgRef = useRef<SVGSVGElement>(null);
  const modalSvgRef = useRef<SVGSVGElement>(null);

  const fetchAnalytics = async () => {
    if (periods.length === 0) return;
    setLoading(true);
    try {
      const url = `/api/admin/analytics?periods=${encodeURIComponent(JSON.stringify(periods))}`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.success) setAnalyticsData(data.periodsData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchProjectAnalytics = async () => {
    if (!selectedProjectId || projectPeriods.length === 0) return;
    setProjectLoading(true);
    try {
      let url = `/api/admin/analytics?projectId=${selectedProjectId}&periods=${encodeURIComponent(JSON.stringify(projectPeriods))}`;
      if (selectedMediaId) {
        url += `&mediaId=${selectedMediaId}`;
      }
      const res = await fetch(url);
      const data = await res.json();
      if (data.success) setProjectAnalytics(data.periodsData);
    } catch (err) {
      console.error(err);
    } finally {
      setProjectLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === "analytics") {
      fetchAnalytics();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, periods]);

  useEffect(() => {
    if (selectedProjectId) {
      fetchProjectAnalytics();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedProjectId, projectPeriods, selectedMediaId]);

  const generateSeries = (data: PeriodData[], selectedMetrics: (keyof MetricTotals)[]): SeriesItem[] => {
    const series: SeriesItem[] = [];
    let colorIdx = 0;
    data.forEach(period => {
      selectedMetrics.forEach(metric => {
        const metricDef = METRICS_DEF.find(m => m.id === metric);
        series.push({
          id: `${period.label}-${metric}`,
          label: `${period.label} - ${metricDef?.title ?? metric}`,
          color: COLOR_PALETTE[colorIdx % COLOR_PALETTE.length],
          data: period.timeline.map(pt => pt[metric] ?? 0),
          rawData: period.timeline,
        });
        colorIdx++;
      });
    });
    return series;
  };

  const svgWidth = 800;
  const svgHeight = 280;
  const padding = 45;
  const chartW = svgWidth - 2 * padding;
  const chartH = svgHeight - 2 * padding;

  const renderChart = (
    series: SeriesItem[],
    dataSrc: PeriodData[],
    targetRef: React.RefObject<SVGSVGElement | null>
  ) => {
    if (series.length === 0 || dataSrc.length === 0) {
      return <div className="emptyStateText">No data available to plot.</div>;
    }

    const allVals = series.flatMap(s => s.data.map(v => Number(v) || 0));
    const rawMax = allVals.length > 0 ? Math.max(...allVals, 8) : 8;
    const maxVal = isNaN(rawMax) ? 8 : Math.max(rawMax, 1);
    const numPoints = series[0].rawData.length;

    const getLinePath = (dataArr: number[]): string => {
      if (dataArr.length === 0) return "";
      return dataArr.reduce((path, val, idx) => {
        const x = padding + (idx * chartW) / Math.max(numPoints - 1, 1);
        const y = svgHeight - padding - (val / maxVal) * chartH;
        return idx === 0 ? `M ${x} ${y}` : `${path} L ${x} ${y}`;
      }, "");
    };

    const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
      if (!targetRef.current || numPoints === 0) return;
      const rect = targetRef.current.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const relativeX = (mouseX / rect.width) * svgWidth;

      let closestIdx = 0;
      let minDiff = Infinity;

      series[0].rawData.forEach((_, idx) => {
        const x = padding + (idx * chartW) / Math.max(numPoints - 1, 1);
        const diff = Math.abs(x - relativeX);
        if (diff < minDiff) { minDiff = diff; closestIdx = idx; }
      });

      setHoveredIndex(closestIdx);
      const ptX = padding + (closestIdx * chartW) / Math.max(numPoints - 1, 1);
      const tooltipX = (ptX / svgWidth) * rect.width;
      const tooltipY = Math.max(0, rect.height / 2 - 80);
      setTooltipPos({ x: tooltipX, y: tooltipY });
    };

    return (
      <div className={styles.chartWrapper}>
        <svg
          ref={targetRef as React.RefObject<SVGSVGElement>}
          className={styles.svgChart}
          onMouseMove={handleMouseMove}
          onMouseLeave={() => { setHoveredIndex(null); setTooltipPos(null); }}
        >
          {Array.from({ length: 5 }).map((_, idx) => {
            const y = padding + (idx * chartH) / 4;
            const val = Math.round(maxVal - (idx * maxVal) / 4);
            return (
              <g key={`grid-${idx}`}>
                <line x1={padding} y1={y} x2={svgWidth - padding} y2={y} stroke="rgba(255, 255, 255, 0.05)" />
                <text x={padding - 10} y={y + 4} fill="var(--adm-muted)" fontSize="0.75rem" textAnchor="end">{val}</text>
              </g>
            );
          })}

          {series[0].rawData.map((pt, idx) => {
            const step = Math.max(Math.ceil(numPoints / 8), 1);
            if (idx % step !== 0 && idx !== numPoints - 1) return null;
            const x = padding + (idx * chartW) / Math.max(numPoints - 1, 1);
            return (
              <text key={`lx-${idx}`} x={x} y={svgHeight - padding + 20} fill="var(--adm-muted)" fontSize="0.75rem" textAnchor="middle">
                {pt.label}
              </text>
            );
          })}

          {chartType === "line" && series.map(s => (
            <path key={s.id} d={getLinePath(s.data)} fill="none" stroke={s.color} strokeWidth={2.5} />
          ))}

          {chartType === "bar" && series[0].rawData.map((_, ptIdx) => {
            const x = padding + (ptIdx * chartW) / Math.max(numPoints - 1, 1);
            const w = Math.max((chartW / numPoints) * 0.7, 4);
            const isHovered = hoveredIndex === ptIdx;

            return series.map((s, sIdx) => {
              const val = Number(s.data[ptIdx]) || 0;
              const h = Math.max(0, (val / maxVal) * chartH);
              const y = svgHeight - padding - h;
              const barW = w / series.length;
              const barX = x - w / 2 + sIdx * barW;

              return (
                <rect
                  key={`bar-${ptIdx}-${sIdx}`}
                  x={barX}
                  y={isNaN(y) ? 0 : y}
                  width={Math.max(0, barW - 1)}
                  height={isNaN(h) ? 0 : h}
                  fill={s.color}
                  opacity={isHovered ? 1 : 0.8}
                  rx={1}
                />
              );
            });
          })}

          {hoveredIndex !== null && chartType === "line" && (
            <>
              <line
                x1={padding + (hoveredIndex * chartW) / Math.max(numPoints - 1, 1)}
                y1={padding}
                x2={padding + (hoveredIndex * chartW) / Math.max(numPoints - 1, 1)}
                y2={svgHeight - padding}
                stroke="rgba(255,255,255,0.15)"
                strokeWidth={1.5}
              />
              {series.map(s => {
                const cx = padding + (hoveredIndex * chartW) / Math.max(numPoints - 1, 1);
                const safeVal = Number(s.data[hoveredIndex]) || 0;
                const cy = svgHeight - padding - (safeVal / maxVal) * chartH;
                return <circle key={`dot-${s.id}`} cx={cx} cy={isNaN(cy) ? 0 : cy} r={5} fill={s.color} stroke="var(--adm-bg)" strokeWidth={2} />;
              })}
            </>
          )}
        </svg>

        {tooltipPos && hoveredIndex !== null && (
          <div className={styles.tooltip} style={{ left: `${tooltipPos.x}px`, top: `${tooltipPos.y}px` }}>
            <div className={styles.tooltipTitle}>{series[0].rawData[hoveredIndex]?.label}</div>
            {series.map(s => (
              <div key={s.id} className={styles.tooltipRow}>
                <span><span className={styles.tooltipDot} style={{ background: s.color }} /> {s.label}:</span>
                <span style={{ fontWeight: 700 }}>{s.data[hoveredIndex]}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const mainSeries = generateSeries(analyticsData, activeMetrics);
  const projSeries = generateSeries(projectAnalytics, projectActiveMetrics);

  return (
    <div className={styles.analyticsContainer}>
      <div className={styles.tabs}>
        <button onClick={() => setActiveTab("overview")} className={`${styles.tabBtn} ${activeTab === "overview" ? styles.activeTab : ""}`}>Overview</button>
        <button onClick={() => setActiveTab("analytics")} className={`${styles.tabBtn} ${activeTab === "analytics" ? styles.activeTab : ""}`}>Advanced Analytics</button>
      </div>

      {activeTab === "overview" ? (
        <>
          <div className="pageHeader">
            <div>
              <div className="pageTitle">Dashboard Overview</div>
              <div className="pageSubtitle">Control and monitor Pixelectro metrics instantly.</div>
            </div>
            <Link href="/pxl-studio-9x7k2/projects" className="btnPrimary">+ New Project</Link>
          </div>

          <div className="statsGrid">
            <div className="statCard"><span className="statCardIcon">◈</span><div className="statCardValue">{initialProjectCount}</div><div className="statCardLabel">Total Projects</div></div>
            <div className="statCard"><span className="statCardIcon">▤</span><div className="statCardValue">{initialCategoryCount}</div><div className="statCardLabel">Categories</div></div>
            <div className="statCard"><span className="statCardIcon">◉</span><div className="statCardValue">Live</div><div className="statCardLabel">Status</div></div>
          </div>

          <div className="card" style={{ marginBottom: "24px" }}>
            <div className="cardHeader"><div className="cardTitle">Quick Navigation</div></div>
            <div className="cardBody" style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
              <Link href="/pxl-studio-9x7k2/projects" className="btnPrimary">Manage Projects</Link>
              <Link href="/pxl-studio-9x7k2/categories" className="btnGhost">Manage Categories</Link>
              <button onClick={() => setActiveTab("analytics")} className="btnPrimary" style={{ background: "var(--adm-green)" }}>📊 View Web Analytics</button>
            </div>
          </div>

          <div className="card">
            <div className="cardHeader"><div className="cardTitle">All Projects &amp; Interactions</div><span className="badge badgeBlue">{initialProjects.length} entries</span></div>
            <div className="tableWrap">
              <table className="table">
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Category</th>
                    <th>Real Interactions</th>
                    <th style={{ width: 140 }}>Analytics</th>
                  </tr>
                </thead>
                <tbody>
                  {initialProjects.map(p => {
                    const isPdf = p.media?.some((m: any) => m.url?.toLowerCase().endsWith('.pdf') || m.type === 'PDF');
                    return (
                    <tr key={p.id}>
                      <td style={{ fontWeight: 600 }}>{p.title}</td>
                      <td><span className="badge badgeBlue">{p.category.name}</span></td>
                      <td style={{ color: "var(--adm-green)", fontWeight: 700 }}>
                        {isPdf ? <span style={{ color: "var(--adm-muted)", fontSize: "0.8rem", fontWeight: "normal" }}>N/A (PDF Project)</span> : (
                          <>
                            <span title="Likes">♥ {p.likesCount}</span> &nbsp;
                            <span title="Views">👁 {p.viewsCount}</span> &nbsp;
                            <span title="Shares">🔗 {p.sharesCount}</span>
                          </>
                        )}
                      </td>
                      <td>
                        <button onClick={() => {
                          setSelectedProjectId(p.id);
                          if (isPdf) {
                            const pdfMedia = p.media?.find((m: any) => m.url?.toLowerCase().endsWith('.pdf') || m.type === 'PDF') || p.media?.[0];
                            if (pdfMedia) setSelectedMediaId(pdfMedia.id);
                            setProjectActiveMetrics(["MEDIA_VIEW", "MEDIA_LIKE", "MEDIA_SHARE"]);
                          } else {
                            setSelectedMediaId(null);
                            setProjectActiveMetrics(["PROJECT_VIEW", "PROJECT_LIKE", "PROJECT_SHARE"]);
                          }
                        }} className="btnGhost" style={{ padding: "4px 10px", fontSize: "0.78rem" }}>📊 Detailed Stats</button>
                      </td>
                    </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        <>
          <div className={styles.controlsRow}>
            <PeriodManager state={periods} setState={setPeriods} />
          </div>

          <div style={{ marginBottom: "16px", color: "var(--adm-muted)", fontSize: "0.9rem" }}>Select one or multiple metrics to plot them together on the chart:</div>
          <div className={styles.metricsGrid}>
            {METRICS_DEF.map(m => {
              const isSelected = activeMetrics.includes(m.id);
              const totalVal = analyticsData.reduce((sum, period) => sum + (period.totals[m.id] ?? 0), 0);
              return (
                <div key={m.id} onClick={() => toggleMetric(m.id)} className={`${styles.metricCard} ${isSelected ? styles.metricCardActive : ""}`}>
                  <div className={styles.metricHeader}>
                    <span className={styles.metricTitle}>{m.title}</span>
                    <span className={styles.metricIcon}>{m.icon}</span>
                  </div>
                  <div className={styles.metricValue}>{totalVal.toLocaleString()}</div>
                  <div style={{ fontSize: "0.75rem", color: "var(--adm-muted)" }}>Across all selected periods</div>
                </div>
              );
            })}
          </div>

          <div className={styles.chartContainer}>
            <div className={styles.chartHeader}>
              <div className={styles.chartTitle}>Chart: Multi-Variable Analytics</div>
              <div className={styles.chartToggles}>
                <button onClick={() => setChartType("line")} className={`${styles.toggleBtn} ${chartType === "line" ? styles.toggleBtnActive : ""}`}>Line</button>
                <button onClick={() => setChartType("bar")} className={`${styles.toggleBtn} ${chartType === "bar" ? styles.toggleBtnActive : ""}`}>Bar</button>
              </div>
            </div>

            {loading ? (
              <div style={{ height: "320px", display: "flex", alignItems: "center", justifyContent: "center" }}><span className="badge badgeBlue">Loading Data...</span></div>
            ) : (
              renderChart(mainSeries, analyticsData, svgRef)
            )}

            <div className={styles.legend}>
              {mainSeries.map(s => (
                <div key={s.id} className={styles.legendItem}>
                  <div className={styles.legendColor} style={{ background: s.color }} />
                  <span>{s.label}</span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {selectedProjectId && (() => {
        const proj = initialProjects.find(p => p.id === selectedProjectId);
        if (!proj) return null;

        const isPdf = proj.media?.some((m: any) => m.url?.toLowerCase().endsWith('.pdf') || m.type === 'PDF');
        
        let displayStats = { views: 0, likes: 0, shares: 0 };
        if (selectedMediaId) {
          const activeMedia = proj.media?.find((m: any) => m.id === selectedMediaId);
          if (activeMedia) {
            displayStats = {
              views: activeMedia.viewsCount,
              likes: activeMedia.likesCount,
              shares: activeMedia.sharesCount
            };
          }
        } else {
          displayStats = {
            views: proj.viewsCount,
            likes: proj.likesCount,
            shares: proj.sharesCount
          };
        }

        return (
          <div className={styles.modalOverlay} onClick={() => { setSelectedProjectId(null); setSelectedMediaId(null); }}>
            <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
              <div className={styles.modalHeader}>
                <div className={styles.modalTitle}>📈 {proj.title} - Stats</div>
                <button onClick={() => { setSelectedProjectId(null); setSelectedMediaId(null); }} className={styles.modalClose}>✕</button>
              </div>

              <div className={styles.modalBody}>
                {proj.media && proj.media.length > 0 && isPdf && (
                  <div style={{ marginBottom: "16px", display: "flex", gap: "8px", overflowX: "auto", paddingBottom: "4px" }}>
                    <button 
                      className={`${styles.presetBtn} ${!selectedMediaId ? styles.activePreset : ""}`}
                      onClick={() => {
                        setSelectedMediaId(null);
                        setProjectActiveMetrics(["PROJECT_VIEW", "PROJECT_LIKE", "PROJECT_SHARE"]);
                      }}
                    >
                      Project Overview
                    </button>
                    {proj.media.map((m: any, i: number) => (
                      <button 
                        key={m.id}
                        className={`${styles.presetBtn} ${selectedMediaId === m.id ? styles.activePreset : ""}`}
                        onClick={() => {
                          setSelectedMediaId(m.id);
                          setProjectActiveMetrics(["MEDIA_VIEW", "MEDIA_LIKE", "MEDIA_SHARE"]);
                        }}
                      >
                        Book {i + 1}
                      </button>
                    ))}
                  </div>
                )}

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '12px', marginBottom: '16px' }}>
                  <div style={{ background: 'var(--adm-bg)', padding: '12px', borderRadius: '8px', border: '1px solid var(--adm-border)' }}>
                    <div style={{ fontSize: '0.8rem', color: 'var(--adm-muted)' }}>👁 Total Views</div>
                    <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{displayStats.views}</div>
                  </div>
                  <div style={{ background: 'var(--adm-bg)', padding: '12px', borderRadius: '8px', border: '1px solid var(--adm-border)' }}>
                    <div style={{ fontSize: '0.8rem', color: 'var(--adm-muted)' }}>♥ Total Likes</div>
                    <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{displayStats.likes}</div>
                  </div>
                  <div style={{ background: 'var(--adm-bg)', padding: '12px', borderRadius: '8px', border: '1px solid var(--adm-border)' }}>
                    <div style={{ fontSize: '0.8rem', color: 'var(--adm-muted)' }}>🔗 Total Shares</div>
                    <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{displayStats.shares}</div>
                  </div>
                </div>

                <PeriodManager state={projectPeriods} setState={setProjectPeriods} />

                <div style={{ margin: "16px 0", display: "flex", gap: "8px", flexWrap: "wrap" }}>
                  {METRICS_DEF.filter(m => selectedMediaId ? m.id.startsWith("MEDIA_") : m.id.startsWith("PROJECT_")).map(m => (
                    <button
                      key={m.id}
                      onClick={() => {
                        setProjectActiveMetrics(prev =>
                          prev.includes(m.id)
                            ? prev.length > 1 ? prev.filter(x => x !== m.id) : prev
                            : [...prev, m.id]
                        );
                      }}
                      className={`${styles.presetBtn} ${projectActiveMetrics.includes(m.id) ? styles.activePreset : ""}`}
                    >
                      {m.icon} {m.title}
                    </button>
                  ))}
                </div>

              {projectLoading ? (
                <div style={{ height: "240px", display: "flex", alignItems: "center", justifyContent: "center" }}><span className="badge badgeBlue">Loading project stats...</span></div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                  <div style={{ background: "var(--adm-bg)", border: "1px solid var(--adm-border)", borderRadius: "8px", padding: "12px" }}>
                    <div style={{ height: "240px", position: "relative" }}>
                      {renderChart(projSeries, projectAnalytics, modalSvgRef)}
                    </div>
                    <div className={styles.legend} style={{ marginTop: "12px" }}>
                      {projSeries.map(s => (
                        <div key={s.id} className={styles.legendItem}>
                          <div className={styles.legendColor} style={{ background: s.color }} />
                          <span style={{ fontSize: "0.8rem" }}>{s.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        );
      })()}
    </div>
  );
}
