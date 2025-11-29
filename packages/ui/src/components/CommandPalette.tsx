'use client';

import { useEffect, useMemo, type ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";

export type Command = {
  id: string;
  title: string;
  subtitle?: string;
  shortcut?: string;
  icon?: ReactNode;
  onSelect?: () => void;
  group?: string;
};

type CommandPaletteProps = {
  open: boolean;
  onOpenChange: (next: boolean) => void;
  commands: Command[];
  query: string;
  onQueryChange: (value: string) => void;
};

export function CommandPalette({ open, onOpenChange, commands, query, onQueryChange }: CommandPaletteProps) {
  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        onOpenChange(!open);
      }
      if (open && event.key === "Escape") {
        onOpenChange(false);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onOpenChange]);

  const filtered = useMemo(() => {
    const norm = query.trim().toLowerCase();
    return commands.filter((command) => {
      if (!norm) return true;
      return (
        command.title.toLowerCase().includes(norm) ||
        command.subtitle?.toLowerCase().includes(norm) ||
        command.group?.toLowerCase().includes(norm)
      );
    });
  }, [commands, query]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="command-palette"
          role="dialog"
          aria-modal="true"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
        >
          <motion.div
            className="command-palette__surface"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
          >
            <div className="command-palette__search">
              <span aria-hidden className="command-palette__caret">
                ❯
              </span>
              <input
                autoFocus
                placeholder="Ask NativeIQ or jump to a workflow"
                value={query}
                onChange={(event) => onQueryChange(event.target.value)}
              />
              <kbd className="command-palette__shortcut">esc</kbd>
            </div>
            <div className="command-palette__results" role="listbox">
              {filtered.length === 0 && <p className="command-palette__empty">No commands yet. Try another query.</p>}
              {filtered.map((command) => (
                <button
                  key={command.id}
                  role="option"
                  aria-selected="false"
                  className="command-palette__command"
                  onClick={() => {
                    command.onSelect?.();
                    onOpenChange(false);
                  }}
                >
                  {command.icon && <span className="command-palette__icon" aria-hidden>{command.icon}</span>}
                  <span className="command-palette__body">
                    <span className="command-palette__title">{command.title}</span>
                    {command.subtitle && <span className="command-palette__subtitle">{command.subtitle}</span>}
                  </span>
                  {command.shortcut && (
                    <span className="command-palette__keys">
                      {command.shortcut.split("+").map((key) => (
                        <kbd key={key}>{key}</kbd>
                      ))}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </motion.div>
          <button
            className="command-palette__backdrop"
            aria-label="Close command palette"
            onClick={() => onOpenChange(false)}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
