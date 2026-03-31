"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type PlannedRun = {
  id: number;
  name: string;
  date: string;
  distance: string;
  type: string;
};
function formatDate(dateString: string) {
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

function isSameDay(dateA: Date, dateB: Date) {
  return (
    dateA.getFullYear() === dateB.getFullYear() &&
    dateA.getMonth() === dateB.getMonth() &&
    dateA.getDate() === dateB.getDate()
  );
}

export default function PlannedRunsPage() {
  const [runs, setRuns] = useState<PlannedRun[]>([]);
  const [hasLoaded, setHasLoaded] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  const [name, setName] = useState("");
  const [date, setDate] = useState("");
  const [distance, setDistance] = useState("");
  const [type, setType] = useState("Easy");

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isEditClosing, setIsEditClosing] = useState(false);

  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState("");
  const [editDate, setEditDate] = useState("");
  const [editDistance, setEditDistance] = useState("");
  const [editType, setEditType] = useState("Easy");

  useEffect(() => {
    const saved = localStorage.getItem("plannedRuns");
    if (saved) setRuns(JSON.parse(saved));
    setHasLoaded(true);
  }, []);

  useEffect(() => {
    if (hasLoaded) {
      localStorage.setItem("plannedRuns", JSON.stringify(runs));
    }
  }, [runs, hasLoaded]);

  function resetForm() {
    setName("");
    setDate("");
    setDistance("");
    setType("Easy");
  }

  function closeModal() {
    setIsClosing(true);
    setTimeout(() => {
      setIsModalOpen(false);
      setIsClosing(false);
      resetForm();
    }, 180);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!name || !date || !distance) return;

    const newRun: PlannedRun = {
      id: Date.now(),
      name,
      date,
      distance,
      type,
    };

    setRuns([newRun, ...runs]);
    closeModal();
  }

  function handleDelete(id: number) {
    setRuns(runs.filter((r) => r.id !== id));
  }
  const thisWeekDays = (() => {
    const start = getStartOfWeek(new Date());

    return Array.from({ length: 7 }, (_, index) => {
      const day = new Date(start);
      day.setDate(start.getDate() + index);

      const runsForDay = runs.filter((run) => {
        const runDate = new Date(run.date + "T00:00:00");
        return isSameDay(runDate, day);
      });

      return {
        date: day,
        label: day.toLocaleDateString("en-AU", { weekday: "short" }),
        shortDate: day.toLocaleDateString("en-AU", {
          day: "numeric",
          month: "short",
        }),
        runs: runsForDay,
        isToday: isSameDay(day, new Date()),
      };
    });
  })();

  const thisWeekTotalKm = thisWeekDays.reduce((sum, day) => {
    const dayTotal = day.runs.reduce(
      (daySum, run) => daySum + Number(run.distance),
      0,
    );

    return sum + dayTotal;
  }, 0);

  function handleStartEdit(run: PlannedRun) {
    setEditingId(run.id);
    setEditName(run.name);
    setEditDate(run.date);
    setEditDistance(run.distance);
    setEditType(run.type);
    setIsEditModalOpen(true);
  }

  function closeEditModal() {
    setIsEditClosing(true);

    setTimeout(() => {
      setIsEditModalOpen(false);
      setIsEditClosing(false);
      setEditingId(null);
      setEditName("");
      setEditDate("");
      setEditDistance("");
      setEditType("Easy");
    }, 180);
  }

  function handleSaveEdit(e: React.FormEvent) {
    e.preventDefault();

    if (!editingId || !editName || !editDate || !editDistance) return;

    const updatedRuns = runs.map((run) =>
      run.id === editingId
        ? {
            ...run,
            name: editName,
            date: editDate,
            distance: editDistance,
            type: editType,
          }
        : run,
    );

    setRuns(updatedRuns);
    closeEditModal();
  }

  function formatDate(dateString: string) {
    const date = new Date(dateString + "T00:00:00");

    return date.toLocaleDateString("en-AU", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  }

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
                Planned Runs
              </h1>
              <p
                className="mt-3 text-sm leading-6"
                style={{ color: "var(--muted)" }}
              >
                Your upcoming training schedule in one place.
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

          <section
            className="ui-card ui-fade-in mb-6 rounded-3xl border p-6 shadow-sm"
            style={{
              backgroundColor: "var(--card)",
              borderColor: "var(--border)",
            }}
          >
            <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
              <div>
                <p
                  className="text-sm font-medium"
                  style={{ color: "var(--muted)" }}
                >
                  This Week
                </p>
                <h2 className="mt-1 text-2xl font-semibold tracking-tight">
                  Weekly Planner
                </h2>
              </div>

              <div
                className="rounded-2xl border px-4 py-3"
                style={{
                  backgroundColor: "var(--card-soft)",
                  borderColor: "var(--border)",
                }}
              >
                <p
                  className="text-xs uppercase tracking-[0.2em]"
                  style={{ color: "var(--muted)" }}
                >
                  Weekly Total
                </p>
                <p className="mt-1 text-sm font-semibold">
                  {thisWeekTotalKm.toFixed(1)} km planned
                </p>
              </div>
            </div>

            <div className="grid gap-3 md:grid-cols-7">
              {thisWeekDays.map((day) => (
                <div
                  key={day.shortDate}
                  className="ui-soft rounded-2xl border p-4 transition"
                  style={{
                    backgroundColor: day.isToday
                      ? "var(--accent)"
                      : "var(--card-soft)",
                    borderColor: day.isToday
                      ? "var(--primary)"
                      : "var(--border)",
                    boxShadow: day.isToday
                      ? "0 0 0 1px var(--primary)"
                      : "none",
                  }}
                >
                  <div className="mb-3 flex items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-semibold">{day.label}</p>
                      <p className="text-xs" style={{ color: "var(--muted)" }}>
                        {day.shortDate}
                      </p>
                    </div>

                    {day.isToday && (
                      <span
                        className="rounded-full px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.14em]"
                        style={{
                          backgroundColor: "var(--primary)",
                          color: "var(--primary-foreground)",
                        }}
                      >
                        Today
                      </span>
                    )}
                  </div>

                  <div className="space-y-2">
                    {day.runs.length > 0 ? (
                      day.runs.map((run) => (
                        <div
                          key={run.id}
                          className="rounded-xl border px-3 py-2"
                          style={{
                            backgroundColor: "var(--card)",
                            borderColor: "var(--border)",
                          }}
                        >
                          <p className="text-sm font-medium">{run.name}</p>
                          <p
                            className="text-xs"
                            style={{ color: "var(--muted)" }}
                          >
                            {run.distance} km • {run.type}
                          </p>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs" style={{ color: "var(--muted)" }}>
                        No run planned
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section
            className="ui-card ui-fade-in rounded-3xl border p-6 shadow-sm"
            style={{
              backgroundColor: "var(--card)",
              borderColor: "var(--border)",
            }}
          >
            <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p
                  className="text-sm font-medium"
                  style={{ color: "var(--muted)" }}
                >
                  Planning
                </p>
                <h2 className="mt-1 text-2xl font-semibold tracking-tight">
                  Upcoming Runs
                </h2>
              </div>

              <button
                onClick={() => setIsModalOpen(true)}
                className="ui-button rounded-2xl px-4 py-3 text-sm font-medium transition hover:opacity-90"
                style={{
                  backgroundColor: "var(--primary)",
                  color: "var(--primary-foreground)",
                }}
              >
                + Add Planned Run
              </button>
            </div>

            <div className="space-y-3">
              {[...runs]
                .sort(
                  (a, b) =>
                    new Date(a.date).getTime() - new Date(b.date).getTime(),
                )
                .map((run) => (
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
                          <p className="text-base font-semibold">{run.name}</p>
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
                  <p className="text-sm font-medium">No planned runs yet</p>
                  <p className="mt-1 text-sm" style={{ color: "var(--muted)" }}>
                    Add your next planned session to get started.
                  </p>
                </div>
              )}
            </div>
          </section>
        </div>
      </main>

      {isModalOpen && (
        <div
          className={`fixed inset-0 z-50 flex items-center justify-center px-4 ${
            isClosing ? "ui-modal-overlay-closing" : "ui-modal-overlay"
          }`}
          style={{ backgroundColor: "rgba(28, 25, 23, 0.4)" }}
        >
          <div
            className={`w-full max-w-xl rounded-3xl border p-6 shadow-xl ${
              isClosing ? "ui-modal-panel-closing" : "ui-modal-panel"
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
                  Planning
                </p>
                <h2 className="mt-1 text-2xl font-semibold tracking-tight">
                  Add Planned Run
                </h2>
              </div>

              <button
                onClick={closeModal}
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
                  placeholder="Long Run"
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

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Distance
                </label>
                <input
                  placeholder="10"
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
                  Save Planned Run
                </button>

                <button
                  type="button"
                  onClick={closeModal}
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
            isEditClosing ? "ui-modal-overlay-closing" : "ui-modal-overlay"
          }`}
          style={{ backgroundColor: "rgba(28, 25, 23, 0.4)" }}
        >
          <div
            className={`w-full max-w-xl rounded-3xl border p-6 shadow-xl ${
              isEditClosing ? "ui-modal-panel-closing" : "ui-modal-panel"
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
                  Planning
                </p>
                <h2 className="mt-1 text-2xl font-semibold tracking-tight">
                  Edit Planned Run
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
