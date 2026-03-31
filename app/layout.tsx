"use client";

import "./globals.css";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

function linkClass(href: string, pathname: string) {
  return `px-3 py-2 rounded-xl text-sm font-medium transition ${
    pathname === href ? "" : ""
  }`;
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  useEffect(() => {
    const savedTheme = localStorage.getItem("runsmart-theme");

    if (savedTheme) {
      document.documentElement.setAttribute("data-theme", savedTheme);
    }
  }, []);
  return (
    <html lang="en">
      <body>
        {/* NAVBAR */}
        <nav
          className="border-b"
          style={{
            backgroundColor: "var(--card)",
            borderColor: "var(--border)",
          }}
        >
          <div className="mx-auto flex max-w-6xl items-center gap-2 px-4 py-3">
            <Link
              href="/"
              className={linkClass("/", pathname)}
              style={{
                backgroundColor:
                  pathname === "/" ? "var(--primary)" : "transparent",
                color:
                  pathname === "/"
                    ? "var(--primary-foreground)"
                    : "var(--muted)",
              }}
            >
              Dashboard
            </Link>

            <Link
              href="/runs"
              className={linkClass("/runs", pathname)}
              style={{
                backgroundColor:
                  pathname === "/runs" ? "var(--primary)" : "transparent",
                color:
                  pathname === "/runs"
                    ? "var(--primary-foreground)"
                    : "var(--muted)",
              }}
            >
              All Runs
            </Link>

            <Link
              href="/planned"
              className={linkClass("/planned", pathname)}
              style={{
                backgroundColor:
                  pathname === "/planned" ? "var(--primary)" : "transparent",
                color:
                  pathname === "/planned"
                    ? "var(--primary-foreground)"
                    : "var(--muted)",
              }}
            >
              Planned
            </Link>

            <Link
              href="/settings"
              className={linkClass("/settings", pathname)}
              style={{
                backgroundColor:
                  pathname === "/settings" ? "var(--primary)" : "transparent",
                color:
                  pathname === "/settings"
                    ? "var(--primary-foreground)"
                    : "var(--muted)",
              }}
            >
              Settings
            </Link>
          </div>
        </nav>

        {/* PAGE CONTENT */}
        <main>{children}</main>
      </body>
    </html>
  );
}
