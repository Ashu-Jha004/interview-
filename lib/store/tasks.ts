"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  Task,
  TaskStats,
  SortOption,
  ViewMode,
  TaskStatus,
  TaskPriority,
} from "@/types/task";
import { CreateTaskInput, UpdateTaskInput } from "@/lib/schemas/task";

// Mock data (keeping same as before)
const mockTasks: Task[] = [
  {
    id: "1",
    title: "Review Q3 Performance Report",
    description:
      "Analyze quarterly metrics and prepare presentation for board meeting",
    dueDate: "2025-08-29T10:00:00Z",
    status: "pending",
    priority: "high",
    customer: "Acme Corp",
    createdAt: "2025-08-25T09:00:00Z",
    updatedAt: "2025-08-25T09:00:00Z",
  },
  {
    id: "2",
    title: "Update customer onboarding flow",
    description: "Implement new UX improvements based on user feedback",
    dueDate: "2025-08-28T17:00:00Z",
    status: "in_progress",
    priority: "urgent",
    customer: "TechFlow Solutions",
    createdAt: "2025-08-20T14:30:00Z",
    updatedAt: "2025-08-27T11:15:00Z",
  },
  {
    id: "3",
    title: "Database backup verification",
    description: "Ensure all backup procedures are working correctly",
    dueDate: "2025-08-27T08:00:00Z",
    status: "overdue",
    priority: "urgent",
    createdAt: "2025-08-22T16:45:00Z",
    updatedAt: "2025-08-22T16:45:00Z",
  },
  {
    id: "4",
    title: "Client proposal draft",
    description: "Prepare initial proposal for new enterprise client",
    dueDate: "2025-09-05T12:00:00Z",
    status: "pending",
    priority: "medium",
    customer: "Global Industries Ltd",
    createdAt: "2025-08-26T13:20:00Z",
    updatedAt: "2025-08-26T13:20:00Z",
  },
  {
    id: "5",
    title: "Security audit completion",
    description: "Finalize security assessment and documentation",
    dueDate: "2025-08-30T16:00:00Z",
    status: "in_progress",
    priority: "high",
    createdAt: "2025-08-23T10:15:00Z",
    updatedAt: "2025-08-28T09:30:00Z",
  },
];

// Utility functions (moved outside store to prevent recreating)
const isToday = (dateString: string): boolean => {
  const today = new Date();
  const date = new Date(dateString);
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
};

const isOverdue = (task: Task): boolean => {
  if (!task.dueDate || task.status === "completed") return false;
  return new Date(task.dueDate) < new Date();
};

const isApproachingBreach = (task: Task): boolean => {
  if (!task.dueDate || task.status === "completed") return false;
  const now = new Date();
  const dueDate = new Date(task.dueDate);
  const hoursUntilDue = (dueDate.getTime() - now.getTime()) / (1000 * 60 * 60);
  return hoursUntilDue > 0 && hoursUntilDue <= 48;
};

interface TaskStore {
  // State
  tasks: Task[];
  searchQuery: string;
  sortBy: SortOption;
  filterStatus: TaskStatus[];
  filterPriority: TaskPriority[];
  viewMode: ViewMode;
  sidebarOpen: boolean;

  // Computed state (memoized)
  filteredTasks: Task[];
  taskStats: TaskStats;

  // Actions
  addTask: (input: CreateTaskInput) => void;
  updateTask: (input: UpdateTaskInput) => void;
  deleteTask: (id: string) => void;
  toggleTaskStatus: (id: string) => void;
  setSearchQuery: (query: string) => void;
  setSortBy: (sort: SortOption) => void;
  setFilterStatus: (statuses: TaskStatus[]) => void;
  setFilterPriority: (priorities: TaskPriority[]) => void;
  clearFilters: () => void;
  setViewMode: (mode: ViewMode) => void;
  toggleSidebar: () => void;

  // Internal method to recalculate computed values
  _recompute: () => void;
}

// Compute filtered tasks
const computeFilteredTasks = (
  tasks: Task[],
  searchQuery: string,
  sortBy: SortOption,
  filterStatus: TaskStatus[],
  filterPriority: TaskPriority[]
): Task[] => {
  let filtered = tasks.filter((task) => {
    // Search filter
    const searchMatch =
      !searchQuery ||
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.customer?.toLowerCase().includes(searchQuery.toLowerCase());

    // Status filter
    const statusMatch =
      filterStatus.length === 0 ||
      filterStatus.includes(isOverdue(task) ? "overdue" : task.status);

    // Priority filter
    const priorityMatch =
      filterPriority.length === 0 || filterPriority.includes(task.priority);

    return searchMatch && statusMatch && priorityMatch;
  });

  // Sorting
  filtered.sort((a, b) => {
    switch (sortBy) {
      case "priority": {
        const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 };
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      }
      case "status": {
        const statusOrder = {
          overdue: 0,
          in_progress: 1,
          pending: 2,
          completed: 3,
        };
        const aStatus = isOverdue(a) ? "overdue" : a.status;
        const bStatus = isOverdue(b) ? "overdue" : b.status;
        return (
          statusOrder[aStatus as keyof typeof statusOrder] -
          statusOrder[bStatus as keyof typeof statusOrder]
        );
      }
      case "dueDate":
        if (!a.dueDate && !b.dueDate) return 0;
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      case "customer":
        return (a.customer || "").localeCompare(b.customer || "");
      case "createdAt":
        return (
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      default:
        return 0;
    }
  });

  return filtered;
};

// Compute task stats
const computeTaskStats = (tasks: Task[]): TaskStats => {
  return {
    pending: tasks.filter((t) => t.status === "pending").length,
    overdue: tasks.filter((t) => isOverdue(t)).length,
    dueToday: tasks.filter(
      (t) => t.dueDate && isToday(t.dueDate) && t.status !== "completed"
    ).length,
    approachingBreach: tasks.filter((t) => isApproachingBreach(t)).length,
    total: tasks.length,
  };
};

export const useTaskStore = create<TaskStore>()(
  persist(
    (set, get) => ({
      // Initial State
      tasks: mockTasks,
      searchQuery: "",
      sortBy: "dueDate",
      filterStatus: [],
      filterPriority: [],
      viewMode: "list",
      sidebarOpen: false,

      // Computed state (initialized)
      filteredTasks: computeFilteredTasks(mockTasks, "", "dueDate", [], []),
      taskStats: computeTaskStats(mockTasks),

      // Internal recompute method
      _recompute: () => {
        const state = get();
        const filteredTasks = computeFilteredTasks(
          state.tasks,
          state.searchQuery,
          state.sortBy,
          state.filterStatus,
          state.filterPriority
        );
        const taskStats = computeTaskStats(state.tasks);

        set({ filteredTasks, taskStats });
      },

      // Actions
      addTask: (input) => {
        const now = new Date().toISOString();
        const newTask: Task = {
          ...input,
          id: crypto.randomUUID(),
          status: input.status || "pending",
          priority: input.priority || "medium",
          createdAt: now,
          updatedAt: now,
          dueDate: input.dueDate || undefined,
        };
        set((state) => ({ tasks: [...state.tasks, newTask] }));
        get()._recompute();
      },

      updateTask: (input) => {
        const now = new Date().toISOString();
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === input.id ? { ...task, ...input, updatedAt: now } : task
          ),
        }));
        get()._recompute();
      },

      deleteTask: (id) => {
        set((state) => ({
          tasks: state.tasks.filter((task) => task.id !== id),
        }));
        get()._recompute();
      },

      toggleTaskStatus: (id) => {
        const task = get().tasks.find((t) => t.id === id);
        if (!task) return;

        const newStatus: TaskStatus =
          task.status === "completed"
            ? "pending"
            : task.status === "pending"
            ? "in_progress"
            : task.status === "in_progress"
            ? "completed"
            : "pending";

        get().updateTask({ id, status: newStatus });
      },

      setSearchQuery: (query) => {
        set({ searchQuery: query });
        get()._recompute();
      },

      setSortBy: (sort) => {
        set({ sortBy: sort });
        get()._recompute();
      },

      setFilterStatus: (statuses) => {
        set({ filterStatus: statuses });
        get()._recompute();
      },

      setFilterPriority: (priorities) => {
        set({ filterPriority: priorities });
        get()._recompute();
      },

      clearFilters: () => {
        set({ filterStatus: [], filterPriority: [], searchQuery: "" });
        get()._recompute();
      },

      setViewMode: (mode) => set({ viewMode: mode }),
      toggleSidebar: () =>
        set((state) => ({ sidebarOpen: !state.sidebarOpen })),
    }),
    {
      name: "task-store",
      partialize: (state) => ({
        tasks: state.tasks,
        viewMode: state.viewMode,
        sidebarOpen: state.sidebarOpen,
      }),
      onRehydrateStorage: () => (state) => {
        // Recompute derived state after hydration
        state?._recompute();
      },
    }
  )
);
