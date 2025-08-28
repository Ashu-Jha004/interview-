import type { Task } from "@/types/task";
import { AlertTriangle, Clock, CheckCircle } from "lucide-react";

/**
 * Get status information with icon and styling
 */
export const getStatusInfo = (task: Task) => {
  const now = new Date();
  const isTaskOverdue =
    task.dueDate && new Date(task.dueDate) < now && task.status !== "completed";

  if (isTaskOverdue) {
    return {
      status: "overdue" as const,
      label: "Overdue",
      color: "bg-red-100 text-red-800 border-red-200",
      icon: AlertTriangle,
    };
  }

  const statusMap = {
    pending: {
      label: "Pending",
      color: "bg-blue-100 text-blue-800 border-blue-200",
      icon: Clock,
    },
    in_progress: {
      label: "In Progress",
      color: "bg-yellow-100 text-yellow-800 border-yellow-200",
      icon: Clock,
    },
    completed: {
      label: "Completed",
      color: "bg-green-100 text-green-800 border-green-200",
      icon: CheckCircle,
    },
  };

  return {
    status: task.status,
    ...statusMap[task.status],
  };
};

/**
 * Get priority information with styling
 */
export const getPriorityInfo = (priority: Task["priority"]) => {
  const priorityMap = {
    urgent: {
      label: "Urgent",
      color: "text-red-600",
      bgColor: "bg-red-50",
      borderColor: "border-red-200",
      accent: "border-l-red-500",
    },
    high: {
      label: "High",
      color: "text-orange-600",
      bgColor: "bg-orange-50",
      borderColor: "border-orange-200",
      accent: "border-l-orange-500",
    },
    medium: {
      label: "Medium",
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200",
      accent: "border-l-blue-500",
    },
    low: {
      label: "Low",
      color: "text-gray-600",
      bgColor: "bg-gray-50",
      borderColor: "border-gray-200",
      accent: "border-l-gray-400",
    },
  };
  return priorityMap[priority];
};

/**
 * Format a date string for display
 */
export const formatDate = (dateString?: string): string => {
  if (!dateString) return "No due date";

  const date = new Date(dateString);
  const now = new Date();
  const diffTime = date.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Due today";
  if (diffDays === 1) return "Due tomorrow";
  if (diffDays === -1) return "Due yesterday";
  if (diffDays < 0) return `${Math.abs(diffDays)} days overdue`;
  if (diffDays <= 7) return `Due in ${diffDays} days`;

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
  });
};
