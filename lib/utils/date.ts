/**
 * Date utility functions for task management
 */

/**
 * Format a date string for display with relative timing
 */
export const formatDate = (dateString?: string): string => {
  if (!dateString) return "No due date";

  const date = new Date(dateString);
  const now = new Date();
  const diffTime = date.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  // Handle relative dates
  if (diffDays === 0) return "Due today";
  if (diffDays === 1) return "Due tomorrow";
  if (diffDays === -1) return "Due yesterday";
  if (diffDays < 0) return `${Math.abs(diffDays)} days overdue`;
  if (diffDays <= 7) return `Due in ${diffDays} days`;

  // Format absolute dates
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
  });
};

/**
 * Check if a date is today
 */
export const isToday = (dateString: string): boolean => {
  const today = new Date();
  const date = new Date(dateString);
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
};

/**
 * Check if a task is overdue
 */
export const isOverdue = (task: {
  dueDate?: string;
  status: string;
}): boolean => {
  if (!task.dueDate || task.status === "completed") return false;
  return new Date(task.dueDate) < new Date();
};

/**
 * Check if a task is approaching breach (due within 48 hours)
 */
export const isApproachingBreach = (task: {
  dueDate?: string;
  status: string;
}): boolean => {
  if (!task.dueDate || task.status === "completed") return false;
  const now = new Date();
  const dueDate = new Date(task.dueDate);
  const hoursUntilDue = (dueDate.getTime() - now.getTime()) / (1000 * 60 * 60);
  return hoursUntilDue > 0 && hoursUntilDue <= 48;
};
