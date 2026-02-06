"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { posthog } from "@/lib/posthog";
import {
  BarChart3,
  Users,
  Image as ImageIcon,
  Video,
  AlertTriangle,
  TrendingUp,
  Clock,
  Zap,
  RefreshCw,
  ArrowLeft,
  Activity,
  Monitor,
  Cpu,
  Globe,
  Layers,
  Filter,
} from "lucide-react";

// ============================================================
// POSTHOG ANALYTICS DASHBOARD
// Real-time analytics powered by PostHog event data
// ============================================================

interface EventSummary {
  event: string;
  count: number;
  lastSeen?: string;
}

interface ModelUsage {
  model: string;
  count: number;
  percentage: number;
}

interface RecentEvent {
  event: string;
  timestamp: string;
  properties: Record<string, any>;
  distinctId?: string;
}

interface DashboardData {
  // Overview metrics
  totalGenerations: number;
  imageGenerations: number;
  videoGenerations: number;
  failedGenerations: number;
  totalSignIns: number;
  totalSignUps: number;
  uniqueUsers: number;
  // Model breakdown
  modelUsage: ModelUsage[];
  // Recent events
  recentEvents: RecentEvent[];
  // Error breakdown
  recentErrors: RecentEvent[];
  // Time range
  timeRange: string;
}

const POSTHOG_API_KEY = "phc_kGvq1FhHyjyyfIDIPRUj1xinb83b0iaarPExfWjFbMc";
const POSTHOG_PROJECT_ID = ""; // Will be fetched dynamically
const POSTHOG_HOST = "https://us.posthog.com";

// Fetcher for PostHog API
async function fetchPostHogAPI(endpoint: string, body?: any) {
  const res = await fetch(`${POSTHOG_HOST}${endpoint}`, {
    method: body ? "POST" : "GET",
    headers: {
      Authorization: `Bearer ${POSTHOG_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    console.warn(`PostHog API ${endpoint} returned ${res.status}`);
    return null;
  }
  return res.json();
}

export default function AnalyticsDashboard() {
  const { user, session, loading } = useAuth();
  const router = useRouter();

  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<"24h" | "7d" | "30d">("7d");
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const [activeView, setActiveView] = useState<
    "overview" | "generations" | "users" | "errors" | "live"
  >("overview");

  // Auth guard
  useEffect(() => {
    if (loading) return;
    if (!session || !user) {
      router.replace("/login");
      return;
    }
    if (user.email !== "andregreengp@gmail.com") {
      router.replace("/vizual/studio");
      return;
    }
  }, [user, session, loading, router]);

  // Fetch analytics from PostHog
  const fetchAnalytics = useCallback(async () => {
    setIsLoading(true);
    try {
      // Calculate date range
      const now = new Date();
      const rangeMap = { "24h": 1, "7d": 7, "30d": 30 };
      const daysBack = rangeMap[timeRange];
      const dateFrom = new Date(now.getTime() - daysBack * 86400000)
        .toISOString()
        .split("T")[0];

      // Fetch events from PostHog query API
      // We'll use the events endpoint to get recent events
      const eventsRes = await fetchPostHogAPI(
        `/api/event/?token=${POSTHOG_API_KEY}&after=${dateFrom}&limit=1000`
      );

      // Process events locally for dashboard metrics
      const events: RecentEvent[] = (eventsRes?.results || []).map(
        (e: any) => ({
          event: e.event,
          timestamp: e.timestamp,
          properties: e.properties || {},
          distinctId: e.distinct_id,
        })
      );

      // Calculate metrics from events
      const generationStarted = events.filter(
        (e) => e.event === "generation_started"
      );
      const generationCompleted = events.filter(
        (e) => e.event === "generation_completed"
      );
      const generationFailed = events.filter(
        (e) => e.event === "generation_failed"
      );
      const signIns = events.filter((e) => e.event === "user_signed_in");
      const signUps = events.filter((e) => e.event === "user_signed_up");

      const imageGens = generationCompleted.filter(
        (e) => e.properties.creation_mode === "IMAGE"
      );
      const videoGens = generationCompleted.filter(
        (e) => e.properties.creation_mode === "VIDEO"
      );

      // Model usage breakdown
      const modelCounts: Record<string, number> = {};
      generationStarted.forEach((e) => {
        const model = e.properties.model_name || "Unknown";
        modelCounts[model] = (modelCounts[model] || 0) + 1;
      });

      const totalModelUse = Object.values(modelCounts).reduce(
        (a, b) => a + b,
        0
      );
      const modelUsage: ModelUsage[] = Object.entries(modelCounts)
        .map(([model, count]) => ({
          model,
          count,
          percentage: totalModelUse > 0 ? (count / totalModelUse) * 100 : 0,
        }))
        .sort((a, b) => b.count - a.count);

      // Unique users
      const uniqueUserIds = new Set(
        events.map((e) => e.distinctId).filter(Boolean)
      );

      // Recent errors (generation failures + API errors)
      const recentErrors = events
        .filter(
          (e) =>
            e.event === "generation_failed" || e.event === "api_error"
        )
        .slice(0, 20);

      setData({
        totalGenerations: generationStarted.length,
        imageGenerations: imageGens.length,
        videoGenerations: videoGens.length,
        failedGenerations: generationFailed.length,
        totalSignIns: signIns.length,
        totalSignUps: signUps.length,
        uniqueUsers: uniqueUserIds.size,
        modelUsage,
        recentEvents: events.slice(0, 50),
        recentErrors,
        timeRange,
      });

      setLastRefresh(new Date());
    } catch (err) {
      console.error("Failed to fetch analytics:", err);
    } finally {
      setIsLoading(false);
    }
  }, [timeRange]);

  useEffect(() => {
    if (user?.email === "andregreengp@gmail.com") {
      fetchAnalytics();
    }
  }, [user, fetchAnalytics]);

  // Auto refresh every 30 seconds
  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(fetchAnalytics, 30000);
    return () => clearInterval(interval);
  }, [autoRefresh, fetchAnalytics]);

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  const successRate =
    data && data.totalGenerations > 0
      ? (
          ((data.totalGenerations - data.failedGenerations) /
            data.totalGenerations) *
          100
        ).toFixed(1)
      : "100";

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Header */}
      <header className="border-b border-white/10 bg-[#0a0a0a]/90 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-[1600px] mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push("/admin")}
              className="p-2 hover:bg-white/10 rounded-lg transition"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-xl font-semibold flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-emerald-400" />
                Vizual Analytics
              </h1>
              <p className="text-sm text-white/50">
                PostHog Event Dashboard · Last refresh:{" "}
                {lastRefresh.toLocaleTimeString()}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Time Range Selector */}
            <div className="flex bg-white/5 rounded-lg border border-white/10 overflow-hidden">
              {(["24h", "7d", "30d"] as const).map((range) => (
                <button
                  key={range}
                  onClick={() => setTimeRange(range)}
                  className={`px-3 py-1.5 text-sm transition ${
                    timeRange === range
                      ? "bg-white/15 text-white"
                      : "text-white/50 hover:text-white/80"
                  }`}
                >
                  {range}
                </button>
              ))}
            </div>

            {/* Auto Refresh Toggle */}
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition ${
                autoRefresh
                  ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                  : "bg-white/5 text-white/50 border border-white/10"
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              {autoRefresh ? "Live" : "Paused"}
            </button>

            {/* Manual Refresh */}
            <button
              onClick={fetchAnalytics}
              disabled={isLoading}
              className="p-2 hover:bg-white/10 rounded-lg transition disabled:opacity-50"
            >
              <RefreshCw
                className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`}
              />
            </button>
          </div>
        </div>

        {/* Sub-nav */}
        <div className="max-w-[1600px] mx-auto px-6 pb-3 flex gap-1">
          {(
            [
              { id: "overview", label: "Overview", icon: Monitor },
              { id: "generations", label: "Generations", icon: Layers },
              { id: "users", label: "Users", icon: Users },
              { id: "errors", label: "Errors", icon: AlertTriangle },
              { id: "live", label: "Live Feed", icon: Activity },
            ] as const
          ).map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveView(id)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm transition ${
                activeView === id
                  ? "bg-white/10 text-white"
                  : "text-white/40 hover:text-white/70 hover:bg-white/5"
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>
      </header>

      <main className="max-w-[1600px] mx-auto px-6 py-6 space-y-6">
        {/* Overview Section */}
        {activeView === "overview" && (
          <>
            {/* Key Metrics Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <MetricCard
                label="Total Generations"
                value={data?.totalGenerations || 0}
                icon={<Zap className="w-5 h-5 text-amber-400" />}
                trend={`${data?.imageGenerations || 0} img / ${data?.videoGenerations || 0} vid`}
              />
              <MetricCard
                label="Unique Users"
                value={data?.uniqueUsers || 0}
                icon={<Users className="w-5 h-5 text-blue-400" />}
                trend={`${data?.totalSignUps || 0} new signups`}
              />
              <MetricCard
                label="Success Rate"
                value={`${successRate}%`}
                icon={<TrendingUp className="w-5 h-5 text-emerald-400" />}
                trend={`${data?.failedGenerations || 0} failures`}
                trendColor={
                  (data?.failedGenerations || 0) > 0 ? "text-red-400" : "text-emerald-400"
                }
              />
              <MetricCard
                label="Sign-ins"
                value={data?.totalSignIns || 0}
                icon={<Globe className="w-5 h-5 text-cyan-400" />}
                trend={`in last ${timeRange}`}
              />
            </div>

            {/* Model Usage & Recent Events */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Model Usage */}
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                  <Cpu className="w-5 h-5 text-white/50" />
                  Model Usage
                </h3>
                {data?.modelUsage && data.modelUsage.length > 0 ? (
                  <div className="space-y-3">
                    {data.modelUsage.slice(0, 10).map((m) => (
                      <div key={m.model} className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span className="text-white/80">{m.model}</span>
                          <span className="text-white/50">
                            {m.count} ({m.percentage.toFixed(0)}%)
                          </span>
                        </div>
                        <div className="w-full bg-white/5 rounded-full h-2 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-white/30 to-white/60 transition-all duration-500"
                            style={{ width: `${m.percentage}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <EmptyState message="No model usage data yet. Generate some content to see stats." />
                )}
              </div>

              {/* Generation Breakdown */}
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-white/50" />
                  Generation Breakdown
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <StatBlock
                    label="Images"
                    value={data?.imageGenerations || 0}
                    icon={<ImageIcon className="w-8 h-8 text-blue-400/50" />}
                  />
                  <StatBlock
                    label="Videos"
                    value={data?.videoGenerations || 0}
                    icon={<Video className="w-8 h-8 text-cyan-400/50" />}
                  />
                  <StatBlock
                    label="Failed"
                    value={data?.failedGenerations || 0}
                    icon={
                      <AlertTriangle className="w-8 h-8 text-red-400/50" />
                    }
                  />
                  <StatBlock
                    label="Success"
                    value={
                      (data?.totalGenerations || 0) -
                      (data?.failedGenerations || 0)
                    }
                    icon={
                      <TrendingUp className="w-8 h-8 text-emerald-400/50" />
                    }
                  />
                </div>
              </div>
            </div>
          </>
        )}

        {/* Generations Detail View */}
        {activeView === "generations" && (
          <div className="space-y-6">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <h3 className="text-lg font-medium mb-4">
                Generation Events ({timeRange})
              </h3>
              <div className="space-y-2 max-h-[600px] overflow-y-auto">
                {data?.recentEvents
                  .filter(
                    (e) =>
                      e.event === "generation_started" ||
                      e.event === "generation_completed" ||
                      e.event === "generation_failed"
                  )
                  .map((event, i) => (
                    <EventRow key={i} event={event} />
                  ))}
                {(!data ||
                  data.recentEvents.filter(
                    (e) =>
                      e.event.includes("generation")
                  ).length === 0) && (
                  <EmptyState message="No generation events recorded yet." />
                )}
              </div>
            </div>
          </div>
        )}

        {/* Users View */}
        {activeView === "users" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <MetricCard
                label="Total Sign-ups"
                value={data?.totalSignUps || 0}
                icon={<Users className="w-5 h-5 text-emerald-400" />}
              />
              <MetricCard
                label="Total Sign-ins"
                value={data?.totalSignIns || 0}
                icon={<Globe className="w-5 h-5 text-blue-400" />}
              />
              <MetricCard
                label="Active Users"
                value={data?.uniqueUsers || 0}
                icon={<Activity className="w-5 h-5 text-amber-400" />}
              />
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <h3 className="text-lg font-medium mb-4">Auth Events</h3>
              <div className="space-y-2 max-h-[500px] overflow-y-auto">
                {data?.recentEvents
                  .filter(
                    (e) =>
                      e.event === "user_signed_in" ||
                      e.event === "user_signed_up" ||
                      e.event === "user_signed_out"
                  )
                  .map((event, i) => (
                    <EventRow key={i} event={event} />
                  ))}
                {(!data ||
                  data.recentEvents.filter((e) =>
                    e.event.includes("sign")
                  ).length === 0) && (
                  <EmptyState message="No auth events recorded yet." />
                )}
              </div>
            </div>
          </div>
        )}

        {/* Errors View */}
        {activeView === "errors" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <MetricCard
                label="Failed Generations"
                value={data?.failedGenerations || 0}
                icon={
                  <AlertTriangle className="w-5 h-5 text-red-400" />
                }
                trendColor="text-red-400"
              />
              <MetricCard
                label="API Errors"
                value={
                  data?.recentErrors.filter(
                    (e) => e.event === "api_error"
                  ).length || 0
                }
                icon={
                  <AlertTriangle className="w-5 h-5 text-orange-400" />
                }
              />
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-400" />
                Recent Errors
              </h3>
              <div className="space-y-3 max-h-[500px] overflow-y-auto">
                {data?.recentErrors.map((event, i) => (
                  <div
                    key={i}
                    className="bg-red-500/5 border border-red-500/20 rounded-xl p-4"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <span className="text-sm font-medium text-red-400">
                        {event.event}
                      </span>
                      <span className="text-xs text-white/40">
                        {new Date(event.timestamp).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-sm text-white/70">
                      {event.properties.error_message || "Unknown error"}
                    </p>
                    {event.properties.model_name && (
                      <span className="text-xs text-white/40 mt-1 block">
                        Model: {event.properties.model_name}
                      </span>
                    )}
                  </div>
                ))}
                {(!data || data.recentErrors.length === 0) && (
                  <EmptyState message="No errors recorded. Everything is running smoothly! 🎉" />
                )}
              </div>
            </div>
          </div>
        )}

        {/* Live Feed View */}
        {activeView === "live" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium flex items-center gap-2">
                <Activity className="w-5 h-5 text-emerald-400" />
                Live Event Feed
                {autoRefresh && (
                  <span className="inline-flex items-center gap-1 text-xs text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                    <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                    Live
                  </span>
                )}
              </h3>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl divide-y divide-white/5 max-h-[700px] overflow-y-auto">
              {data?.recentEvents.map((event, i) => (
                <EventRow key={i} event={event} detailed />
              ))}
              {(!data || data.recentEvents.length === 0) && (
                <div className="p-12">
                  <EmptyState message="No events yet. Use the app to generate events." />
                </div>
              )}
            </div>
          </div>
        )}

        {/* PostHog Direct Link */}
        <div className="pt-6 pb-12 text-center">
          <a
            href="https://us.posthog.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-white/30 hover:text-white/60 transition"
          >
            Open PostHog Dashboard →
          </a>
        </div>
      </main>
    </div>
  );
}

// ============================================================
// SUB-COMPONENTS
// ============================================================

function MetricCard({
  label,
  value,
  icon,
  trend,
  trendColor = "text-white/40",
}: {
  label: string;
  value: number | string;
  icon: React.ReactNode;
  trend?: string;
  trendColor?: string;
}) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-5 hover:border-white/20 transition">
      <div className="flex items-start justify-between mb-3">
        <span className="text-sm text-white/50">{label}</span>
        {icon}
      </div>
      <div className="text-3xl font-semibold tabular-nums">{value}</div>
      {trend && (
        <p className={`text-xs mt-1 ${trendColor}`}>{trend}</p>
      )}
    </div>
  );
}

function StatBlock({
  label,
  value,
  icon,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
}) {
  return (
    <div className="bg-white/5 rounded-xl p-4 flex items-center gap-3">
      {icon}
      <div>
        <div className="text-2xl font-semibold tabular-nums">{value}</div>
        <div className="text-xs text-white/40">{label}</div>
      </div>
    </div>
  );
}

function EventRow({
  event,
  detailed = false,
}: {
  event: RecentEvent;
  detailed?: boolean;
}) {
  const eventColors: Record<string, string> = {
    generation_started: "text-amber-400 bg-amber-500/10",
    generation_completed: "text-emerald-400 bg-emerald-500/10",
    generation_failed: "text-red-400 bg-red-500/10",
    user_signed_in: "text-blue-400 bg-blue-500/10",
    user_signed_up: "text-cyan-400 bg-cyan-500/10",
    user_signed_out: "text-gray-400 bg-gray-500/10",
    model_selected: "text-violet-400 bg-violet-500/10",
    credits_consumed: "text-amber-400 bg-amber-500/10",
    credit_limit_reached: "text-red-400 bg-red-500/10",
    api_error: "text-red-400 bg-red-500/10",
    $pageview: "text-white/30 bg-white/5",
  };

  const colorClass =
    eventColors[event.event] || "text-white/50 bg-white/5";
  const [textColor, bgColor] = colorClass.split(" ");

  return (
    <div className="flex items-center gap-3 px-4 py-3 hover:bg-white/5 rounded-lg transition">
      <span
        className={`text-xs px-2 py-0.5 rounded-full font-mono ${colorClass}`}
      >
        {event.event}
      </span>
      <div className="flex-1 min-w-0">
        {detailed && event.properties && (
          <span className="text-xs text-white/40 truncate block">
            {event.properties.model_name
              ? `Model: ${event.properties.model_name}`
              : event.properties.method
              ? `Method: ${event.properties.method}`
              : event.properties.creation_mode
              ? `Mode: ${event.properties.creation_mode}`
              : event.properties.$current_url
              ? event.properties.$current_url.replace(
                  window?.location?.origin || "",
                  ""
                )
              : ""}
          </span>
        )}
      </div>
      <span className="text-xs text-white/30 whitespace-nowrap">
        {new Date(event.timestamp).toLocaleTimeString()}
      </span>
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="text-center py-12">
      <BarChart3 className="w-10 h-10 text-white/10 mx-auto mb-3" />
      <p className="text-sm text-white/30">{message}</p>
    </div>
  );
}
