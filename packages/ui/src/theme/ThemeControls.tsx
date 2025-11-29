'use client';

import { useTheme } from "./ThemeProvider";

export function ThemeControls() {
  const { mode, setMode, highContrast, toggleHighContrast, motion, setMotion } = useTheme();

  return (
    <div
      role="group"
      aria-label="Display preferences"
      className="theme-controls"
    >
      <button
        type="button"
        className={mode === "dark" ? "active" : ""}
        onClick={() => setMode("dark")}
      >
        Dark
      </button>
      <button
        type="button"
        className={mode === "light" ? "active" : ""}
        onClick={() => setMode("light")}
      >
        Light
      </button>
      <button type="button" className={highContrast ? "active" : ""} onClick={toggleHighContrast}>
        High Contrast
      </button>
      <button
        type="button"
        className={motion === "reduce" ? "active" : ""}
        onClick={() => setMotion(motion === "reduce" ? "system" : "reduce")}
      >
        {motion === "reduce" ? "Motion Off" : "Motion On"}
      </button>
    </div>
  );
}
