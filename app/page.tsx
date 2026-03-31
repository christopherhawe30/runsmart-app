"use client";

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

type PlannedRun = {
  id: number;
  name: string;
  date: string;
  distance: string;
  type: string;
};

type UserProfile = {
  name: string;
  age: string;
  focusPhrase: string;
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

function getEndOfWeek(date: Date) {
  const start = getStartOfWeek(date);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  end.setHours(23, 59, 59, 999);
  return end;
}

function isDateInCurrentWeek(dateString: string) {
  if (!dateString) return false;

  const itemDate = new Date(dateString + "T00:00:00");
  const now = new Date();
  const startOfWeek = getStartOfWeek(now);
  const endOfWeek = getEndOfWeek(now);

  return itemDate >= startOfWeek && itemDate <= endOfWeek;
}

export default function Home() {
  const [runs, setRuns] = useState<Run[]>([]);
  const [plannedRuns, setPlannedRuns] = useState<PlannedRun[]>([]);
  const [profile, setProfile] = useState<UserProfile>({
    name: "",
    age: "",
    focusPhrase: "Consistency over perfection",
  });

  const [name, setName] = useState("");
  const [date, setDate] = useState("");
  const [distance, setDistance] = useState("");
  const [time, setTime] = useState("");
  const [type, setType] = useState("Easy");
  const [heartRate, setHeartRate] = useState("");
  const [hasLoaded, setHasLoaded] = useState(false);

  useEffect(() => {
    const savedRuns = localStorage.getItem("runs");
    const savedPlannedRuns = localStorage.getItem("plannedRuns");
    const savedProfile = localStorage.getItem("runsmart-profile");

    if (savedRuns) {
      setRuns(JSON.parse(savedRuns));
    }

    if (savedPlannedRuns) {
      setPlannedRuns(JSON.parse(savedPlannedRuns));
    }

    if (savedProfile) {
      setProfile(JSON.parse(savedProfile));
    }

    setHasLoaded(true);
  }, []);

  useEffect(() => {
    if (hasLoaded) {
      localStorage.setItem("runs", JSON.stringify(runs));
    }
  }, [runs, hasLoaded]);

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

    setName("");
    setDate("");
    setDistance("");
    setTime("");
    setType("Easy");
    setHeartRate("");
  }

  function handleDelete(id: number) {
    setRuns(runs.filter((run) => run.id !== id));
  }

  const thisWeeksRuns = useMemo(() => {
    return runs.filter((run) => isDateInCurrentWeek(run.date));
  }, [runs]);

  const thisWeeksPlannedRuns = useMemo(() => {
    return plannedRuns.filter((run) => isDateInCurrentWeek(run.date));
  }, [plannedRuns]);

  const totalKm = thisWeeksRuns.reduce(
    (sum, run) => sum + Number(run.distance),
    0,
  );

  const totalPlannedKm = thisWeeksPlannedRuns.reduce(
    (sum, run) => sum + Number(run.distance),
    0,
  );

  const totalRuns = thisWeeksRuns.length;

  const averageHeartRate =
    thisWeeksRuns.reduce((sum, run) => sum + Number(run.heartRate || 0), 0) /
    (thisWeeksRuns.length || 1);

  const dashboardTitle = profile.name
    ? `${profile.name}'s Dashboard`
    : "Dashboard";

  const focusPhrase = profile.focusPhrase || "Consistency over perfection";

  const progressPercent =
    totalPlannedKm > 0 ? Math.min((totalKm / totalPlannedKm) * 100, 100) : 0;

  return (
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
              {dashboardTitle}
            </h1>
            <p
              className="mt-3 text-sm leading-6"
              style={{ color: "var(--muted)" }}
            >
              Your weekly training view for runs, heart rate, and consistency.
            </p>
          </div>

          <div
            className="ui-card w-full rounded-3xl border px-5 py-4 shadow-sm md:w-auto md:min-w-[260px]"
            style={{
              backgroundColor: "var(--card)",
              borderColor: "var(--border)",
            }}
          >
            <p
              className="text-xs uppercase tracking-[0.2em]"
              style={{ color: "var(--muted)" }}
            >
              Focus
            </p>
            <p className="mt-2 text-sm font-medium">{focusPhrase}</p>
          </div>
        </div>

        <div className="mb-8 grid gap-4 md:grid-cols-4">
          <div
            className="ui-card rounded-3xl border p-5 shadow-sm"
            style={{
              backgroundColor: "var(--card)",
              borderColor: "var(--border)",
            }}
          >
            <p className="text-sm" style={{ color: "var(--muted)" }}>
              This Week&apos;s Runs
            </p>
            <p className="mt-2 text-3xl font-semibold tracking-tight">
              {totalRuns}
            </p>
          </div>

          <div
            className="ui-card rounded-3xl border p-5 shadow-sm"
            style={{
              backgroundColor: "var(--card)",
              borderColor: "var(--border)",
            }}
          >
            <p className="text-sm" style={{ color: "var(--muted)" }}>
              This Week&apos;s KM
            </p>
            <p className="mt-2 text-3xl font-semibold tracking-tight">
              {totalKm.toFixed(2)}
            </p>
          </div>

          <div
            className="ui-card rounded-3xl border p-5 shadow-sm"
            style={{
              backgroundColor: "var(--card)",
              borderColor: "var(--border)",
            }}
          >
            <div
              className="flex items-center gap-2 text-sm"
              style={{ color: "var(--muted)" }}
            >
              <span>❤</span>
              <p>Avg HR</p>
            </div>
            <p className="mt-2 text-3xl font-semibold tracking-tight">
              {thisWeeksRuns.length > 0
                ? `${Math.round(averageHeartRate)} bpm`
                : "-- bpm"}
            </p>
          </div>

          <div
            className="ui-card rounded-3xl border p-5 shadow-sm"
            style={{
              backgroundColor: "var(--card)",
              borderColor: "var(--border)",
            }}
          >
            <p className="text-sm" style={{ color: "var(--muted)" }}>
              Weekly Progress
            </p>
            <p className="mt-2 text-3xl font-semibold tracking-tight">
              {totalKm.toFixed(1)} / {totalPlannedKm.toFixed(1)} km
            </p>

            <div
              className="mt-3 h-2 w-full rounded-full"
              style={{ backgroundColor: "var(--card-soft)" }}
            >
              <div
                className="h-2 rounded-full transition-all"
                style={{
                  width: `${progressPercent}%`,
                  backgroundColor: "var(--primary)",
                }}
              />
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[380px_minmax(0,1fr)]">
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
                Log a Run
              </p>
              <h2 className="mt-1 text-2xl font-semibold tracking-tight">
                Add today&apos;s session
              </h2>
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
                  className="w-full rounded-2xl border px-4 py-3 text-sm outline-none transition"
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
                    className="w-full rounded-2xl border px-4 py-3 text-sm outline-none transition"
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
                    className="w-full rounded-2xl border px-4 py-3 text-sm outline-none transition"
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
                  className="w-full rounded-2xl border px-4 py-3 text-sm outline-none transition"
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
                  className="w-full rounded-2xl border px-4 py-3 text-sm outline-none transition"
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

              <button
                type="submit"
                className="ui-button w-full rounded-2xl px-4 py-3 text-sm font-medium transition"
                style={{
                  backgroundColor: "var(--primary)",
                  color: "var(--primary-foreground)",
                }}
              >
                Save Run
              </button>
            </form>
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
                  This Week
                </p>
                <h2 className="mt-1 text-2xl font-semibold tracking-tight">
                  Run History
                </h2>
              </div>

              <div
                className="rounded-full px-3 py-1 text-xs font-medium"
                style={{
                  backgroundColor: "var(--accent)",
                  color: "var(--muted)",
                }}
              >
                {totalRuns} runs
              </div>
            </div>

            <div className="space-y-3">
              {thisWeeksRuns.map((run) => (
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
                        <span>{run.time}</span>
                        <span>
                          {formatPace(calculatePace(run.time, run.distance))}
                        </span>
                        <span>{run.heartRate} bpm</span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleDelete(run.id)}
                      className="ui-button rounded-xl border px-3 py-2 text-sm transition"
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
              ))}

              {thisWeeksRuns.length === 0 && (
                <div
                  className="rounded-2xl border border-dashed p-8 text-center"
                  style={{
                    backgroundColor: "var(--card-soft)",
                    borderColor: "var(--border)",
                  }}
                >
                  <p className="text-sm font-medium">
                    No runs logged for this week yet
                  </p>
                  <p className="mt-1 text-sm" style={{ color: "var(--muted)" }}>
                    Add your next session on the left to get started.
                  </p>
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
