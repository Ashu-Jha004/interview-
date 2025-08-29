"use client";

import { Plus, Search, Filter, CheckCircle2 } from "lucide-react";

interface ActionConfig {
  label: string;
  onClick?: () => void;
  variant: "primary" | "secondary";
  icon?: React.ElementType;
}

interface EmptyStateConfig {
  icon: React.ElementType;
  title: string;
  description: string;
  primaryAction?: ActionConfig;
  secondaryAction?: ActionConfig;
}

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
  onCreateTask,
  onClearFilters,
  onClearSearch,
}: EmptyStateProps) {
  const configs: Record<string, EmptyStateConfig> = {
    "no-tasks": {
      icon: Plus,
      title: "No tasks yet",
      description:
        "Get started by creating your first task. Stay organized and track your progress.",
      primaryAction: {
        label: "Create Task",
        onClick: onCreateTask,
        variant: "primary",
        icon: Plus,
      },
    },
    "no-search-results": {
      icon: Search,
      title: `No results for "${searchQuery}"`,
      description: "Try adjusting your search terms or browse all tasks.",
      primaryAction: {
        label: "Clear Search",
        onClick: onClearSearch,
        variant: "secondary",
        icon: XIcon,
      },
      secondaryAction: {
        label: "Create Task",
        onClick: onCreateTask,
        variant: "primary",
        icon: Plus,
      },
    },
    "no-filter-results": {
      icon: Filter,
      title: "No tasks match your filters",
      description: "Try different filter options or create a new task.",
      primaryAction: {
        label: "Clear Filters",
        onClick: onClearFilters,
        variant: "secondary",
        icon: XIcon,
      },
      secondaryAction: {
        label: "Create Task",
        onClick: onCreateTask,
        variant: "primary",
        icon: Plus,
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
        variant: "primary",
        icon: Plus,
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
        {config.primaryAction && config.primaryAction.onClick && (
          <button
            onClick={config.primaryAction.onClick}
            className={`inline-flex items-center px-6 py-3 text-sm font-medium rounded-lg focus-visible-ring transition-colors ${
              config.primaryAction.variant === "primary"
                ? "bg-blue-600 text-white hover:bg-blue-700"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            {config.primaryAction.icon && (
              <config.primaryAction.icon
                className="h-4 w-4 mr-2"
                aria-hidden="true"
              />
            )}
            {config.primaryAction.label}
          </button>
        )}

        {config.secondaryAction && config.secondaryAction.onClick && (
          <button
            onClick={config.secondaryAction.onClick}
            className={`inline-flex items-center px-6 py-3 text-sm font-medium rounded-lg focus-visible-ring transition-colors ${
              config.secondaryAction.variant === "primary"
                ? "bg-blue-600 text-white hover:bg-blue-700"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            {config.secondaryAction.icon && (
              <config.secondaryAction.icon
                className="h-4 w-4 mr-2"
                aria-hidden="true"
              />
            )}
            {config.secondaryAction.label}
          </button>
        )}
      </div>
    </div>
  );
}

// Additional icons for action buttons
function XIcon(props: React.ComponentProps<"svg">) {
  return (
    <svg
      {...props}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}
