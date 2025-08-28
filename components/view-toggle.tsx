"use client";

import { List, Grid3X3 } from "lucide-react";
import { useTaskStore } from "@/lib/store/tasks";

/**
 * View Toggle Component
 * Allows switching between list and cards view modes
 */
export function ViewToggle() {
  const viewMode = useTaskStore((state) => state.viewMode);
  const setViewMode = useTaskStore((state) => state.setViewMode);

  return (
    <div
      className="flex items-center space-x-1 bg-gray-100 rounded-lg p-1"
      role="tablist"
      aria-label="View mode"
    >
      <button
        onClick={() => setViewMode("list")}
        className={`
          inline-flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors focus-visible-ring
          ${
            viewMode === "list"
              ? "bg-white text-gray-900 shadow-sm"
              : "text-gray-600 hover:text-gray-900"
          }
        `}
        role="tab"
        aria-selected={viewMode === "list"}
        aria-label="List view"
        title="Switch to list view"
      >
        <List className="h-4 w-4 mr-2" aria-hidden="true" />
        List
      </button>
      <button
        onClick={() => setViewMode("cards")}
        className={`
          inline-flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors focus-visible-ring
          ${
            viewMode === "cards"
              ? "bg-white text-gray-900 shadow-sm"
              : "text-gray-600 hover:text-gray-900"
          }
        `}
        role="tab"
        aria-selected={viewMode === "cards"}
        aria-label="Cards view"
        title="Switch to cards view"
      >
        <Grid3X3 className="h-4 w-4 mr-2" aria-hidden="true" />
        Cards
      </button>
    </div>
  );
}
