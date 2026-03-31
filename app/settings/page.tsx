"use client";

import { useEffect, useState } from "react";

type ThemeName = "stone" | "sage" | "rose" | "sky" | "clay";

type UserProfile = {
  name: string;
  age: string;
  focusPhrase: string;
};

const themes: {
  name: ThemeName;
  label: string;
  description: string;
  preview: string[];
}[] = [
  {
    name: "stone",
    label: "Stone",
    description: "Clean, minimal grey",
    preview: ["#f5f5f4", "#1c1917", "#e7e5e4"],
  },
  {
    name: "sage",
    label: "Sage",
    description: "Soft muted green",
    preview: ["#f2f5f1", "#5f7a65", "#dce8db"],
  },
  {
    name: "rose",
    label: "Rose",
    description: "Soft pastel pink",
    preview: ["#fbf4f6", "#b67c8e", "#f2dde4"],
  },
  {
    name: "sky",
    label: "Sky",
    description: "Soft pastel blue",
    preview: ["#f3f7fb", "#6b91b5", "#dde8f3"],
  },
  {
    name: "clay",
    label: "Clay",
    description: "Muted dusty red",
    preview: ["#f8f3f1", "#b07a67", "#eadbd4"],
  },
];

export default function SettingsPage() {
  const [theme, setTheme] = useState<ThemeName>("stone");

  const [profile, setProfile] = useState<UserProfile>({
    name: "",
    age: "",
    focusPhrase: "Consistency over perfection",
  });

  const [draftProfile, setDraftProfile] = useState<UserProfile>({
    name: "",
    age: "",
    focusPhrase: "Consistency over perfection",
  });

  const [saveState, setSaveState] = useState<"idle" | "saved">("idle");

  useEffect(() => {
    const savedTheme = localStorage.getItem(
      "runsmart-theme",
    ) as ThemeName | null;
    const savedProfile = localStorage.getItem("runsmart-profile");

    if (savedTheme) {
      setTheme(savedTheme);
    }

    if (savedProfile) {
      const parsedProfile = JSON.parse(savedProfile);
      setProfile(parsedProfile);
      setDraftProfile(parsedProfile);
    }
  }, []);

  function applyTheme(themeName: ThemeName) {
    setTheme(themeName);
    localStorage.setItem("runsmart-theme", themeName);
    document.documentElement.setAttribute("data-theme", themeName);
  }

  function handleDraftChange(field: keyof UserProfile, value: string) {
    setDraftProfile((prev) => ({
      ...prev,
      [field]: value,
    }));
    setSaveState("idle");
  }

  function handleSaveProfile() {
    setProfile(draftProfile);
    localStorage.setItem("runsmart-profile", JSON.stringify(draftProfile));
    setSaveState("saved");

    setTimeout(() => {
      setSaveState("idle");
    }, 1800);
  }

  const hasChanges =
    profile.name !== draftProfile.name ||
    profile.age !== draftProfile.age ||
    profile.focusPhrase !== draftProfile.focusPhrase;

  return (
    <main className="min-h-screen px-4 py-8 md:px-6 md:py-10">
      <div className="mx-auto max-w-5xl">
        <div className="mb-10">
          <p
            className="mb-3 text-xs font-medium uppercase tracking-[0.24em]"
            style={{ color: "var(--muted)" }}
          >
            RunSmart OS
          </p>
          <h1 className="text-4xl font-semibold tracking-tight md:text-5xl">
            Settings
          </h1>
          <p
            className="mt-3 text-sm leading-6"
            style={{ color: "var(--muted)" }}
          >
            Personalise your dashboard, motivation, and app appearance.
          </p>
        </div>

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
                Profile
              </p>
              <h2 className="mt-1 text-2xl font-semibold tracking-tight">
                Personal Details
              </h2>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium">Name</label>
                <input
                  placeholder="Chris"
                  value={draftProfile.name}
                  onChange={(e) => handleDraftChange("name", e.target.value)}
                  className="ui-input rounded-2xl border px-4 py-3 outline-none transition"
                  style={{
                    backgroundColor: "var(--card-soft)",
                    borderColor: "var(--border)",
                  }}
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">Age</label>
                <input
                  placeholder="30"
                  value={draftProfile.age}
                  onChange={(e) => handleDraftChange("age", e.target.value)}
                  className="ui-input rounded-2xl border px-4 py-3 outline-none transition"
                  style={{
                    backgroundColor: "var(--card-soft)",
                    borderColor: "var(--border)",
                  }}
                />
              </div>
            </div>
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
                Motivation
              </p>
              <h2 className="mt-1 text-2xl font-semibold tracking-tight">
                Focus Phrase
              </h2>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                Your dashboard motivator
              </label>
              <input
                placeholder="Consistency over perfection"
                value={draftProfile.focusPhrase}
                onChange={(e) =>
                  handleDraftChange("focusPhrase", e.target.value)
                }
                className="ui-input rounded-2xl border px-4 py-3 outline-none transition"
                style={{
                  backgroundColor: "var(--card-soft)",
                  borderColor: "var(--border)",
                }}
              />
              <p className="mt-2 text-sm" style={{ color: "var(--muted)" }}>
                This will appear on your Dashboard as your personal focus line.
              </p>
            </div>

            <div className="mt-6 flex items-center gap-3">
              <button
                onClick={handleSaveProfile}
                disabled={!hasChanges}
                className="ui-button rounded-2xl px-4 py-3 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-50"
                style={{
                  backgroundColor: "var(--primary)",
                  color: "var(--primary-foreground)",
                }}
              >
                {saveState === "saved" ? "Saved" : "Save Changes"}
              </button>

              {hasChanges && saveState !== "saved" && (
                <p className="text-sm" style={{ color: "var(--muted)" }}>
                  Unsaved changes
                </p>
              )}
            </div>
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
                Appearance
              </p>
              <h2 className="mt-1 text-2xl font-semibold tracking-tight">
                Theme Palette
              </h2>
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {themes.map((item) => {
                const isActive = theme === item.name;

                return (
                  <button
                    key={item.name}
                    onClick={() => applyTheme(item.name)}
                    className="ui-button rounded-3xl border p-4 text-left transition sm:p-5"
                    style={{
                      backgroundColor: "var(--card-soft)",
                      borderColor: isActive
                        ? "var(--primary)"
                        : "var(--border)",
                      boxShadow: isActive ? "0 0 0 1px var(--primary)" : "none",
                    }}
                  >
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                      <div className="min-w-0">
                        <div className="mb-3 flex items-center gap-2">
                          {item.preview.map((color) => (
                            <span
                              key={color}
                              className="h-5 w-5 rounded-full border"
                              style={{
                                backgroundColor: color,
                                borderColor: "rgba(0,0,0,0.08)",
                              }}
                            />
                          ))}
                        </div>

                        <div className="md:flex md:items-center md:gap-3">
                          <p className="text-base font-semibold">
                            {item.label}
                          </p>
                          <p
                            className="mt-1 text-sm md:mt-0"
                            style={{ color: "var(--muted)" }}
                          >
                            {item.description}
                          </p>
                        </div>
                      </div>

                      {isActive && (
                        <span
                          className="inline-flex w-fit shrink-0 rounded-full px-3 py-1 text-xs font-medium"
                          style={{
                            backgroundColor: "var(--primary)",
                            color: "var(--primary-foreground)",
                          }}
                        >
                          Active
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
