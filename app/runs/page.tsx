"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type Run = {
  id: number;
  name: string;
  date: string;
  distance: string;
  time: string;
  type: string;
  heartRate: string;
};

type WeeklyDistanceItem = {
  label: string;
  shortLabel: string;
  totalKm: number;
};

type HeartRateTrendItem = {
  id: number;
  label: string;
  fullLabel: string;
  heartRate: number;
};

function calculatePace(time: string, distance: string) {
  const distanceNumber = Number(distance);
  if (!time || !distanceNumber) return null;

  const parts = time.split(":").map(Number);
  if (parts.length !== 3 || parts.some(isNaN)) return null;

  const [hours, minutes, seconds] = parts;
  const totalSeconds = hours * 3600 + minutes * 60 + seconds;

  if (totalSeconds === 0) return null;

  return totalSeconds / distanceNumber;
}

function formatPace(seconds: number | null) {
  if (!seconds) return "--:--/km";

  const mins = Math.floor(seconds / 60);
  const secs = Math.round(seconds % 60);

  if (secs === 60) {
    return `${mins + 1}:00/km`;
  }

  return `${mins}:${String(secs).padStart(2, "0")}/km`;
}

function formatDate(dateString: string) {
  if (!dateString) return "";

  const date = new Date(dateString + "T00:00:00");

  return date.toLocaleDateString("en-AU", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function getStartOfWeek(date: Date) {
  const result = new Date(date);
  const day = result.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  result.setDate(result.getDate() + diff);
  result.setHours(0, 0, 0, 0);
  return result;
}

function formatWeekLabel(startOfWeek: Date) {
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);

  const startLabel = startOfWeek.toLocaleDateString("en-AU", {
    day: "numeric",
    month: "short",
  });

  const endLabel = endOfWeek.toLocaleDateString("en-AU", {
    day: "numeric",
    month: "short",
  });

  return `${startLabel} – ${endLabel}`;
}

function formatShortWeekLabel(startOfWeek: Date) {
  return startOfWeek.toLocaleDateString("en-AU", {
    day: "numeric",
    month: "short",
  });
}

function buildTrendLinePath(
  items: HeartRateTrendItem[],
  chartWidth: number,
  chartHeight: number,
  minHeartRate: number,
  maxHeartRate: number,
) {
  if (items.length === 0) return "";

  const safeRange = Math.max(maxHeartRate - minHeartRate, 1);
  const stepX =
    items.length > 1 ? chartWidth / (items.length - 1) : chartWidth / 2;

  const points = items.map((item, index) => {
    const x = items.length > 1 ? index * stepX : chartWidth / 2;
    const normalized = (item.heartRate - minHeartRate) / safeRange;
    const y = chartHeight - normalized * chartHeight;
    return `${x},${y}`;
  });

  return `M ${points.join(" L ")}`;
}

export default function RunsPage() {
  const [runs, setRuns] = useState<Run[]>([]);
  const [hasLoaded, setHasLoaded] = useState(false);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isCreateModalClosing, setIsCreateModalClosing] = useState(false);
  const [isEditModalClosing, setIsEditModalClosing] = useState(false);

  const [name, setName] = useState("");
  const [date, setDate] = useState("");
  const [distance, setDistance] = useState("");
  const [time, setTime] = useState("");
  const [type, setType] = useState("Easy");
  const [heartRate, setHeartRate] = useState("");

  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState("");
  const [editDate, setEditDate] = useState("");
  const [editDistance, setEditDistance] = useState("");
  const [editTime, setEditTime] = useState("");
  const [editType, setEditType] = useState("Easy");
  const [editHeartRate, setEditHeartRate] = useState("");

  useEffect(() => {
    const savedRuns = localStorage.getItem("runs");

    if (savedRuns) {
      setRuns(JSON.parse(savedRuns));
    }

    setHasLoaded(true);
  }, []);

  useEffect(() => {
    if (hasLoaded) {
      localStorage.setItem("runs", JSON.stringify(runs));
    }
  }, [runs, hasLoaded]);

  function resetCreateForm() {
    setName("");
    setDate("");
    setDistance("");
    setTime("");
    setType("Easy");
    setHeartRate("");
  }

  function resetEditForm() {
    setEditingId(null);
    setEditName("");
    setEditDate("");
    setEditDistance("");
    setEditTime("");
    setEditType("Easy");
    setEditHeartRate("");
  }

  function closeCreateModal() {
    setIsCreateModalClosing(true);

    setTimeout(() => {
      setIsCreateModalOpen(false);
      setIsCreateModalClosing(false);
      resetCreateForm();
    }, 180);
  }

  function closeEditModal() {
    setIsEditModalClosing(true);

    setTimeout(() => {
      setIsEditModalOpen(false);
      setIsEditModalClosing(false);
      resetEditForm();
    }, 180);
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!name || !date || !distance || !time || !heartRate) return;

    const newRun: Run = {
      id: Date.now(),
      name,
      date,
      distance,
      time,
      type,
      heartRate,
    };

    setRuns([newRun, ...runs]);
    closeCreateModal();
  }

  function handleDelete(id: number) {
    setRuns(runs.filter((run) => run.id !== id));

    if (editingId === id) {
      closeEditModal();
    }
  }

  function handleStartEdit(run: Run) {
    setEditingId(run.id);
    setEditName(run.name);
    setEditDate(run.date);
    setEditDistance(run.distance);
    setEditTime(run.time);
    setEditType(run.type);
    setEditHeartRate(run.heartRate);
    setIsEditModalOpen(true);
  }

  function handleSaveEdit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (
      editingId === null ||
      !editName ||
      !editDate ||
      !editDistance ||
      !editTime ||
      !editType ||
      !editHeartRate
    ) {
      return;
    }

    const updatedRuns = runs.map((run) =>
      run.id === editingId
        ? {
            ...run,
            name: editName,
            date: editDate,
            distance: editDistance,
            time: editTime,
            type: editType,
            heartRate: editHeartRate,
          }
        : run,
    );

    setRuns(updatedRuns);
    closeEditModal();
  }

  const sortedRuns = useMemo(() => {
    return [...runs].sort((a, b) => {
      const aTime = new Date(a.date + "T00:00:00").getTime();
      const bTime = new Date(b.date + "T00:00:00").getTime();
      return bTime - aTime;
    });
  }, [runs]);

  const totalRuns = runs.length;

  const totalKm = useMemo(() => {
    return runs.reduce((sum, run) => sum + Number(run.distance), 0);
  }, [runs]);

  const averageDistance = useMemo(() => {
    return totalKm / (runs.length || 1);
  }, [totalKm, runs.length]);

  const longestRun = useMemo(() => {
    if (runs.length === 0) return 0;
    return Math.max(...runs.map((run) => Number(run.distance)));
  }, [runs]);

  const averageHeartRate = useMemo(() => {
    return (
      runs.reduce((sum, run) => sum + Number(run.heartRate || 0), 0) /
      (runs.length || 1)
    );
  }, [runs]);

  const bestPaceSeconds = useMemo(() => {
    const paces = runs
      .map((run) => calculatePace(run.time, run.distance))
      .filter((pace): pace is number => pace !== null);

    if (paces.length === 0) return null;

    return Math.min(...paces);
  }, [runs]);

  const weeklyDistanceData = useMemo<WeeklyDistanceItem[]>(() => {
    const totals = new Map<string, number>();

    for (const run of runs) {
      if (!run.date) continue;

      const runDate = new Date(run.date + "T00:00:00");
      const weekStart = getStartOfWeek(runDate);
      const key = weekStart.toISOString().split("T")[0];
      const currentTotal = totals.get(key) || 0;

      totals.set(key, currentTotal + Number(run.distance));
    }

    return Array.from(totals.entries())
      .sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime())
      .map(([weekStartString, totalKm]) => {
        const weekStart = new Date(weekStartString + "T00:00:00");

        return {
          label: formatWeekLabel(weekStart),
          shortLabel: formatShortWeekLabel(weekStart),
          totalKm,
        };
      });
  }, [runs]);

  const recentWeeklyDistanceData = useMemo(() => {
    return weeklyDistanceData.slice(-8);
  }, [weeklyDistanceData]);

  const maxWeeklyKm = useMemo(() => {
    if (recentWeeklyDistanceData.length === 0) return 0;
    return Math.max(...recentWeeklyDistanceData.map((item) => item.totalKm));
  }, [recentWeeklyDistanceData]);

  const heartRateTrendData = useMemo<HeartRateTrendItem[]>(() => {
    return [...sortedRuns]
      .filter((run) => Number(run.heartRate) > 0)
      .slice(0, 8)
      .reverse()
      .map((run) => ({
        id: run.id,
        label: new Date(run.date + "T00:00:00").toLocaleDateString("en-AU", {
          day: "numeric",
          month: "short",
        }),
        fullLabel: `${run.name} • ${formatDate(run.date)}`,
        heartRate: Number(run.heartRate),
      }));
  }, [sortedRuns]);

  const minHeartRate = useMemo(() => {
    if (heartRateTrendData.length === 0) return 0;
    return Math.min(...heartRateTrendData.map((item) => item.heartRate)) - 5;
  }, [heartRateTrendData]);

  const maxHeartRate = useMemo(() => {
    if (heartRateTrendData.length === 0) return 0;
    return Math.max(...heartRateTrendData.map((item) => item.heartRate)) + 5;
  }, [heartRateTrendData]);

  const trendLinePath = useMemo(() => {
    return buildTrendLinePath(
      heartRateTrendData,
      100,
      100,
      minHeartRate,
      maxHeartRate,
    );
  }, [heartRateTrendData, minHeartRate, maxHeartRate]);

  return (
    <>
      <main className="min-h-screen px-4 py-8 md:px-6 md:py-10">
        <div className="mx-auto max-w-6xl">
          <div className="mb-10 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div className="max-w-2xl">
              <p
                className="mb-3 text-xs font-medium uppercase tracking-[0.24em]"
                style={{ color: "var(--muted)" }}
              >
                RunSmart OS
              </p>
              <h1 className="text-4xl font-semibold tracking-tight md:text-5xl">
                My Runs
              </h1>
              <p
                className="mt-3 text-sm leading-6"
                style={{ color: "var(--muted)" }}
              >
                Your full running history, stats, and past sessions in one
                place.
              </p>
            </div>

            <Link
              href="/"
              className="ui-button w-full rounded-3xl border px-5 py-4 text-sm font-medium shadow-sm transition md:w-auto md:min-w-[260px]"
              style={{
                backgroundColor: "var(--card)",
                borderColor: "var(--border)",
                color: "var(--muted)",
              }}
            >
              Back to Dashboard
            </Link>
          </div>

          <div className="grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
            <aside className="space-y-6">
              <section
                className="ui-card ui-fade-in rounded-3xl border p-6 shadow-sm"
                style={{
                  backgroundColor: "var(--card)",
                  borderColor: "var(--border)",
                }}
              >
                <div className="mb-4">
                  <p
                    className="text-sm font-medium"
                    style={{ color: "var(--muted)" }}
                  >
                    Quick Add
                  </p>
                  <h2 className="mt-1 text-2xl font-semibold tracking-tight">
                    Log a Run
                  </h2>
                </div>

                <button
                  onClick={() => setIsCreateModalOpen(true)}
                  className="ui-button w-full rounded-2xl px-4 py-3 text-sm font-medium transition hover:opacity-90"
                  style={{
                    backgroundColor: "var(--primary)",
                    color: "var(--primary-foreground)",
                  }}
                >
                  + Add New Run
                </button>
              </section>

              <section
                className="ui-card ui-fade-in rounded-3xl border p-6 shadow-sm"
                style={{
                  backgroundColor: "var(--card)",
                  borderColor: "var(--border)",
                }}
              >
                <div className="mb-6">
                  <p
                    className="text-sm font-medium"
                    style={{ color: "var(--muted)" }}
                  >
                    Overview
                  </p>
                  <h2 className="mt-1 text-2xl font-semibold tracking-tight">
                    General Stats
                  </h2>
                </div>

                <div className="space-y-4">
                  {[
                    ["Total Runs", `${totalRuns}`],
                    ["Total KM", totalKm.toFixed(2)],
                    [
                      "Average Distance",
                      runs.length > 0
                        ? `${averageDistance.toFixed(2)} km`
                        : "--",
                    ],
                    [
                      "Longest Run",
                      runs.length > 0 ? `${longestRun.toFixed(2)} km` : "--",
                    ],
                    [
                      "Avg HR",
                      runs.length > 0
                        ? `${Math.round(averageHeartRate)} bpm`
                        : "--",
                    ],
                    ["Best Pace", formatPace(bestPaceSeconds)],
                  ].map(([label, value]) => (
                    <div
                      key={label}
                      className="ui-soft flex items-center justify-between rounded-2xl px-4 py-3"
                      style={{ backgroundColor: "var(--card-soft)" }}
                    >
                      <span
                        className="text-sm"
                        style={{ color: "var(--muted)" }}
                      >
                        {label}
                      </span>
                      <span className="text-sm font-semibold">{value}</span>
                    </div>
                  ))}
                </div>
              </section>
            </aside>

            <div className="space-y-6">
              <section
                className="ui-card ui-fade-in rounded-3xl border p-6 shadow-sm"
                style={{
                  backgroundColor: "var(--card)",
                  borderColor: "var(--border)",
                }}
              >
                <div className="mb-6">
                  <p
                    className="text-sm font-medium"
                    style={{ color: "var(--muted)" }}
                  >
                    Trends
                  </p>
                  <h2 className="mt-1 text-2xl font-semibold tracking-tight">
                    Weekly Distance
                  </h2>
                  <p className="mt-1 text-sm" style={{ color: "var(--muted)" }}>
                    Last 8 weeks
                  </p>
                </div>

                {recentWeeklyDistanceData.length > 0 ? (
                  <div className="overflow-x-auto">
                    <div
                      className="rounded-2xl p-4"
                      style={{ backgroundColor: "var(--card-soft)" }}
                    >
                      <div className="flex min-w-[560px] items-end gap-4">
                        {recentWeeklyDistanceData.map((item) => {
                          const heightPercent =
                            maxWeeklyKm > 0
                              ? (item.totalKm / maxWeeklyKm) * 100
                              : 0;

                          return (
                            <div
                              key={item.label}
                              className="flex flex-1 flex-col items-center justify-end"
                              title={`${item.label}: ${item.totalKm.toFixed(2)} km`}
                            >
                              <p className="mb-2 text-xs font-medium">
                                {item.totalKm.toFixed(1)}
                              </p>

                              <div className="flex h-56 w-full items-end">
                                <div
                                  className="w-full rounded-t-2xl transition-all"
                                  style={{
                                    height: `${Math.max(heightPercent, 6)}%`,
                                    backgroundColor: "var(--primary)",
                                  }}
                                />
                              </div>

                              <p
                                className="mt-3 text-center text-xs"
                                style={{ color: "var(--muted)" }}
                              >
                                {item.shortLabel}
                              </p>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div
                    className="rounded-2xl border border-dashed p-8 text-center"
                    style={{
                      backgroundColor: "var(--card-soft)",
                      borderColor: "var(--border)",
                    }}
                  >
                    <p className="text-sm font-medium">
                      No weekly distance data yet
                    </p>
                    <p
                      className="mt-1 text-sm"
                      style={{ color: "var(--muted)" }}
                    >
                      Add a few runs to see your weekly distance build up here.
                    </p>
                  </div>
                )}
              </section>

              <section
                className="ui-card ui-fade-in rounded-3xl border p-6 shadow-sm"
                style={{
                  backgroundColor: "var(--card)",
                  borderColor: "var(--border)",
                }}
              >
                <div className="mb-6">
                  <p
                    className="text-sm font-medium"
                    style={{ color: "var(--muted)" }}
                  >
                    Trends
                  </p>
                  <h2 className="mt-1 text-2xl font-semibold tracking-tight">
                    Heart Rate Trend
                  </h2>
                  <p className="mt-1 text-sm" style={{ color: "var(--muted)" }}>
                    Last 8 runs
                  </p>
                </div>

                {heartRateTrendData.length > 0 ? (
                  <div className="overflow-x-auto">
                    <div
                      className="relative min-w-[560px] rounded-2xl p-4"
                      style={{ backgroundColor: "var(--card-soft)" }}
                    >
                      <svg
                        className="pointer-events-none absolute left-4 right-4 top-4 h-56 w-[calc(100%-2rem)]"
                        viewBox="0 0 100 100"
                        preserveAspectRatio="none"
                      >
                        <path
                          d={trendLinePath}
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          style={{ color: "var(--muted)" }}
                        />
                      </svg>

                      <div className="relative flex items-end gap-4">
                        {heartRateTrendData.map((item) => {
                          const safeRange = Math.max(
                            maxHeartRate - minHeartRate,
                            1,
                          );
                          const heightPercent =
                            ((item.heartRate - minHeartRate) / safeRange) * 100;

                          return (
                            <div
                              key={item.id}
                              className="flex flex-1 flex-col items-center justify-end"
                              title={`${item.fullLabel}: ${item.heartRate} bpm`}
                            >
                              <p className="mb-2 text-xs font-medium">
                                {item.heartRate}
                              </p>

                              <div className="flex h-56 w-full items-end">
                                <div
                                  className="w-full rounded-t-2xl transition-all"
                                  style={{
                                    height: `${Math.max(heightPercent, 8)}%`,
                                    backgroundColor: "var(--accent)",
                                  }}
                                />
                              </div>

                              <p
                                className="mt-3 text-center text-xs"
                                style={{ color: "var(--muted)" }}
                              >
                                {item.label}
                              </p>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div
                    className="rounded-2xl border border-dashed p-8 text-center"
                    style={{
                      backgroundColor: "var(--card-soft)",
                      borderColor: "var(--border)",
                    }}
                  >
                    <p className="text-sm font-medium">
                      No heart rate trend data yet
                    </p>
                    <p
                      className="mt-1 text-sm"
                      style={{ color: "var(--muted)" }}
                    >
                      Add runs with heart rate data to see the trend here.
                    </p>
                  </div>
                )}
              </section>

              <section
                className="ui-card ui-fade-in rounded-3xl border p-6 shadow-sm"
                style={{
                  backgroundColor: "var(--card)",
                  borderColor: "var(--border)",
                }}
              >
                <div className="mb-6 flex items-center justify-between">
                  <div>
                    <p
                      className="text-sm font-medium"
                      style={{ color: "var(--muted)" }}
                    >
                      History
                    </p>
                    <h2 className="mt-1 text-2xl font-semibold tracking-tight">
                      My Runs
                    </h2>
                  </div>

                  <div
                    className="rounded-full px-3 py-1 text-xs font-medium"
                    style={{
                      backgroundColor: "var(--accent)",
                      color: "var(--muted)",
                    }}
                  >
                    {runs.length} runs
                  </div>
                </div>

                <div className="space-y-3">
                  {sortedRuns.map((run) => (
                    <div
                      key={run.id}
                      className="ui-soft rounded-2xl border p-4 transition"
                      style={{
                        backgroundColor: "var(--card-soft)",
                        borderColor: "var(--border)",
                      }}
                    >
                      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                        <div>
                          <div className="mb-2 flex flex-wrap items-center gap-2">
                            <p className="text-base font-semibold">
                              {run.name}
                            </p>
                            <span
                              className="rounded-full px-2.5 py-1 text-xs font-medium"
                              style={{
                                backgroundColor: "var(--card)",
                                color: "var(--muted)",
                              }}
                            >
                              {run.type}
                            </span>
                          </div>

                          <p
                            className="mb-2 text-sm"
                            style={{ color: "var(--muted)" }}
                          >
                            {formatDate(run.date)}
                          </p>

                          <div className="flex flex-wrap gap-3 text-sm">
                            <span>{run.distance} km</span>
                            <span>{run.time}</span>
                            <span>
                              {formatPace(
                                calculatePace(run.time, run.distance),
                              )}
                            </span>
                            <span>{run.heartRate} bpm</span>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          <button
                            onClick={() => handleStartEdit(run)}
                            className="ui-button rounded-xl border px-3 py-2 text-sm transition hover:opacity-80"
                            style={{
                              backgroundColor: "var(--card)",
                              borderColor: "var(--border)",
                              color: "var(--muted)",
                            }}
                          >
                            Edit
                          </button>

                          <button
                            onClick={() => handleDelete(run.id)}
                            className="ui-button rounded-xl border px-3 py-2 text-sm transition hover:opacity-80"
                            style={{
                              backgroundColor: "var(--card)",
                              borderColor: "var(--border)",
                              color: "var(--muted)",
                            }}
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}

                  {runs.length === 0 && (
                    <div
                      className="rounded-2xl border border-dashed p-8 text-center"
                      style={{
                        backgroundColor: "var(--card-soft)",
                        borderColor: "var(--border)",
                      }}
                    >
                      <p className="text-sm font-medium">No runs logged yet</p>
                      <p
                        className="mt-1 text-sm"
                        style={{ color: "var(--muted)" }}
                      >
                        Add your first run using the button on the left.
                      </p>
                    </div>
                  )}
                </div>
              </section>
            </div>
          </div>
        </div>
      </main>

      {isCreateModalOpen && (
        <div
          className={`fixed inset-0 z-50 flex items-center justify-center px-4 ${
            isCreateModalClosing
              ? "ui-modal-overlay-closing"
              : "ui-modal-overlay"
          }`}
          style={{ backgroundColor: "rgba(28, 25, 23, 0.4)" }}
        >
          <div
            className={`w-full max-w-xl rounded-3xl border p-6 shadow-xl ${
              isCreateModalClosing ? "ui-modal-panel-closing" : "ui-modal-panel"
            }`}
            style={{
              backgroundColor: "var(--card)",
              borderColor: "var(--border)",
            }}
          >
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <p
                  className="text-sm font-medium"
                  style={{ color: "var(--muted)" }}
                >
                  Quick Add
                </p>
                <h2 className="mt-1 text-2xl font-semibold tracking-tight">
                  Log a New Run
                </h2>
              </div>

              <button
                onClick={closeCreateModal}
                className="ui-button rounded-xl border px-3 py-2 text-sm transition hover:opacity-80"
                style={{
                  backgroundColor: "var(--card)",
                  borderColor: "var(--border)",
                  color: "var(--muted)",
                }}
              >
                Close
              </button>
            </div>

            <form className="space-y-4" onSubmit={handleSubmit}>
              <div>
                <label className="mb-2 block text-sm font-medium">
                  Run name
                </label>
                <input
                  placeholder="Easy Run Glass House"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="ui-input rounded-2xl border px-4 py-3 outline-none transition"
                  style={{
                    backgroundColor: "var(--card-soft)",
                    borderColor: "var(--border)",
                  }}
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">Date</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full rounded-2xl border px-4 py-3 text-sm outline-none transition"
                  style={{
                    backgroundColor: "var(--card-soft)",
                    borderColor: "var(--border)",
                    WebkitAppearance: "none",
                  }}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Distance
                  </label>
                  <input
                    placeholder="5.50"
                    value={distance}
                    onChange={(e) => setDistance(e.target.value)}
                    className="ui-input rounded-2xl border px-4 py-3 outline-none transition"
                    style={{
                      backgroundColor: "var(--card-soft)",
                      borderColor: "var(--border)",
                    }}
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">Time</label>
                  <input
                    placeholder="00:33:30"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="ui-input rounded-2xl border px-4 py-3 outline-none transition"
                    style={{
                      backgroundColor: "var(--card-soft)",
                      borderColor: "var(--border)",
                    }}
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">Avg HR</label>
                <input
                  placeholder="152"
                  value={heartRate}
                  onChange={(e) => setHeartRate(e.target.value)}
                  className="ui-input rounded-2xl border px-4 py-3 outline-none transition"
                  style={{
                    backgroundColor: "var(--card-soft)",
                    borderColor: "var(--border)",
                  }}
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Run type
                </label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="ui-input rounded-2xl border px-4 py-3 outline-none transition"
                  style={{
                    backgroundColor: "var(--card-soft)",
                    borderColor: "var(--border)",
                  }}
                >
                  <option>Easy</option>
                  <option>Intervals</option>
                  <option>Tempo</option>
                  <option>Long</option>
                </select>
              </div>

              <div className="flex flex-wrap gap-2 pt-2">
                <button
                  type="submit"
                  className="ui-button rounded-2xl px-4 py-3 text-sm font-medium transition hover:opacity-90"
                  style={{
                    backgroundColor: "var(--primary)",
                    color: "var(--primary-foreground)",
                  }}
                >
                  Save Run
                </button>

                <button
                  type="button"
                  onClick={closeCreateModal}
                  className="ui-button rounded-2xl border px-4 py-3 text-sm transition hover:opacity-80"
                  style={{
                    backgroundColor: "var(--card)",
                    borderColor: "var(--border)",
                    color: "var(--muted)",
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isEditModalOpen && (
        <div
          className={`fixed inset-0 z-50 flex items-center justify-center px-4 ${
            isEditModalClosing ? "ui-modal-overlay-closing" : "ui-modal-overlay"
          }`}
          style={{ backgroundColor: "rgba(28, 25, 23, 0.4)" }}
        >
          <div
            className={`w-full max-w-xl rounded-3xl border p-6 shadow-xl ${
              isEditModalClosing ? "ui-modal-panel-closing" : "ui-modal-panel"
            }`}
            style={{
              backgroundColor: "var(--card)",
              borderColor: "var(--border)",
            }}
          >
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <p
                  className="text-sm font-medium"
                  style={{ color: "var(--muted)" }}
                >
                  Edit Run
                </p>
                <h2 className="mt-1 text-2xl font-semibold tracking-tight">
                  Update Run Details
                </h2>
              </div>

              <button
                onClick={closeEditModal}
                className="ui-button rounded-xl border px-3 py-2 text-sm transition hover:opacity-80"
                style={{
                  backgroundColor: "var(--card)",
                  borderColor: "var(--border)",
                  color: "var(--muted)",
                }}
              >
                Close
              </button>
            </div>

            <form className="space-y-4" onSubmit={handleSaveEdit}>
              <div>
                <label className="mb-2 block text-sm font-medium">
                  Run name
                </label>
                <input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="ui-input rounded-2xl border px-4 py-3 outline-none transition"
                  style={{
                    backgroundColor: "var(--card-soft)",
                    borderColor: "var(--border)",
                  }}
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">Date</label>
                <input
                  type="date"
                  value={editDate}
                  onChange={(e) => setEditDate(e.target.value)}
                  className="w-full rounded-2xl border px-4 py-3 text-sm outline-none transition"
                  style={{
                    backgroundColor: "var(--card-soft)",
                    borderColor: "var(--border)",
                    WebkitAppearance: "none",
                  }}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Distance
                  </label>
                  <input
                    value={editDistance}
                    onChange={(e) => setEditDistance(e.target.value)}
                    className="ui-input rounded-2xl border px-4 py-3 outline-none transition"
                    style={{
                      backgroundColor: "var(--card-soft)",
                      borderColor: "var(--border)",
                    }}
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">Time</label>
                  <input
                    value={editTime}
                    onChange={(e) => setEditTime(e.target.value)}
                    className="ui-input rounded-2xl border px-4 py-3 outline-none transition"
                    style={{
                      backgroundColor: "var(--card-soft)",
                      borderColor: "var(--border)",
                    }}
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">Avg HR</label>
                <input
                  value={editHeartRate}
                  onChange={(e) => setEditHeartRate(e.target.value)}
                  className="ui-input rounded-2xl border px-4 py-3 outline-none transition"
                  style={{
                    backgroundColor: "var(--card-soft)",
                    borderColor: "var(--border)",
                  }}
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Run type
                </label>
                <select
                  value={editType}
                  onChange={(e) => setEditType(e.target.value)}
                  className="ui-input rounded-2xl border px-4 py-3 outline-none transition"
                  style={{
                    backgroundColor: "var(--card-soft)",
                    borderColor: "var(--border)",
                  }}
                >
                  <option>Easy</option>
                  <option>Intervals</option>
                  <option>Tempo</option>
                  <option>Long</option>
                </select>
              </div>

              <div className="flex flex-wrap gap-2 pt-2">
                <button
                  type="submit"
                  className="ui-button rounded-2xl px-4 py-3 text-sm font-medium transition hover:opacity-90"
                  style={{
                    backgroundColor: "var(--primary)",
                    color: "var(--primary-foreground)",
                  }}
                >
                  Save Changes
                </button>

                <button
                  type="button"
                  onClick={closeEditModal}
                  className="ui-button rounded-2xl border px-4 py-3 text-sm transition hover:opacity-80"
                  style={{
                    backgroundColor: "var(--card)",
                    borderColor: "var(--border)",
                    color: "var(--muted)",
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
