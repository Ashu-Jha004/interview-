"use client";

import { Plus, Search, Filter, CheckCircle2 } from "lucide-react";

interface EmptyStateProps {
  type: "no-tasks" | "no-search-results" | "no-filter-results" | "all-complete";
  searchQuery?: string;
  hasFilters?: boolean;
  onCreateTask?: () => void;
  onClearFilters?: () => void;
  onClearSearch?: () => void;
}

/**
 * Enhanced Empty State Component
 * Provides contextual empty states with actionable CTAs
 */
export function EmptyState({
  type,
  searchQuery,
  hasFilters,
  onCreateTask,
  onClearFilters,
  onClearSearch,
}: EmptyStateProps) {
  const configs = {
    "no-tasks": {
      icon: Plus,
      title: "No tasks yet",
      description:
        "Get started by creating your first task. Stay organized and track your progress.",
      primaryAction: {
        label: "Create Task",
        onClick: onCreateTask,
        variant: "primary" as const,
      },
    },
    "no-search-results": {
      icon: Search,
      title: `No results for "${searchQuery}"`,
      description: "Try adjusting your search terms or browse all tasks.",
      primaryAction: {
        label: "Clear Search",
        onClick: onClearSearch,
        variant: "secondary" as const,
      },
      secondaryAction: {
        label: "Create Task",
        onClick: onCreateTask,
        variant: "primary" as const,
      },
    },
    "no-filter-results": {
      icon: Filter,
      title: "No tasks match your filters",
      description: "Try different filter options or create a new task.",
      primaryAction: {
        label: "Clear Filters",
        onClick: onClearFilters,
        variant: "secondary" as const,
      },
      secondaryAction: {
        label: "Create Task",
        onClick: onCreateTask,
        variant: "primary" as const,
      },
    },
    "all-complete": {
      icon: CheckCircle2,
      title: "All tasks completed! 🎉",
      description:
        "Great job! You've completed all your tasks. Ready to add more?",
      primaryAction: {
        label: "Create Task",
        onClick: onCreateTask,
        variant: "primary" as const,
      },
    },
  };

  const config = configs[type];
  const Icon = config.icon;

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
      <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-6">
        <Icon className="h-8 w-8 text-gray-400" aria-hidden="true" />
      </div>

      <h3 className="text-xl font-semibold text-gray-900 mb-3">
        {config.title}
      </h3>

      <p className="text-gray-600 mb-8 max-w-md mx-auto leading-relaxed">
        {config.description}
      </p>

      <div className="flex flex-col sm:flex-row gap-3 items-center justify-center">
        {config.primaryAction && (
          <button
            onClick={config.primaryAction.onClick}
            className={`
              inline-flex items-center px-6 py-3 text-sm font-medium rounded-lg focus-visible-ring transition-colors
              ${
                config.primaryAction.variant === "primary"
                  ? "bg-blue-600 text-white hover:bg-blue-700"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }
            `}
          >
            <Icon className="h-4 w-4 mr-2" aria-hidden="true" />
            {config.primaryAction.label}
          </button>
        )}

        {config.secondaryAction && (
          <button
            onClick={config.secondaryAction.onClick}
            className={`
              inline-flex items-center px-6 py-3 text-sm font-medium rounded-lg focus-visible-ring transition-colors
              ${
                config.secondaryAction.variant === "primary"
                  ? "bg-blue-600 text-white hover:bg-blue-700"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }
            `}
          >
            <Plus className="h-4 w-4 mr-2" aria-hidden="true" />
            {config.secondaryAction.label}
          </button>
        )}
      </div>
    </div>
  );
}
