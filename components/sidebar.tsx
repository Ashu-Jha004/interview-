"use client";

import { useEffect, useRef, useCallback } from "react";
import {
  Home,
  CheckSquare,
  Clock,
  Users,
  BarChart3,
  Settings,
  Archive,
  ChevronRight,
} from "lucide-react";
import { useTaskStore } from "@/lib/store/tasks";

const sidebarItems = [
  {
    icon: Home,
    label: "Dashboard",
    active: true,
    count: null,
    description: "Overview and stats",
  },
  {
    icon: CheckSquare,
    label: "All Tasks",
    active: false,
    count: null,
    description: "Complete task list",
  },
  {
    icon: Clock,
    label: "Due Today",
    active: false,
    count: null,
    description: "Tasks due today",
  },
  {
    icon: Users,
    label: "Team Tasks",
    active: false,
    count: null,
    description: "Collaborative tasks",
  },
  {
    icon: BarChart3,
    label: "Analytics",
    active: false,
    count: null,
    description: "Performance metrics",
  },
  {
    icon: Archive,
    label: "Archive",
    active: false,
    count: null,
    description: "Completed tasks",
  },
  {
    icon: Settings,
    label: "Settings",
    active: false,
    count: null,
    description: "App preferences",
  },
];

export function Sidebar() {
  const sidebarRef = useRef<HTMLElement>(null);
  const firstButtonRef = useRef<HTMLButtonElement>(null);
  const navigationRef = useRef<HTMLDivElement>(null);

  const sidebarOpen = useTaskStore((state) => state.sidebarOpen);
  const toggleSidebar = useTaskStore((state) => state.toggleSidebar);
  const taskStats = useTaskStore((state) => state.taskStats);

  // Focus management for mobile sidebar - NO scroll locking
  useEffect(() => {
    if (sidebarOpen && window.innerWidth < 1024) {
      const timer = setTimeout(() => {
        firstButtonRef.current?.focus();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [sidebarOpen]);

  // Handle keyboard navigation - NO scroll locking
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Escape" && window.innerWidth < 1024) {
        toggleSidebar();
      }
    },
    [toggleSidebar]
  );

  // Update item counts based on stats
  const enhancedItems = sidebarItems.map((item) => {
    let count = null;
    if (item.label === "Due Today") count = taskStats.dueToday;
    if (item.label === "All Tasks") count = taskStats.total;
    return { ...item, count };
  });

  return (
    <aside
      ref={sidebarRef}
      id="sidebar"
      className="w-64 bg-white border-r border-gray-200 shadow-lg lg:shadow-none
                 h-screen lg:h-[calc(100vh-4rem)] flex flex-col"
      onKeyDown={handleKeyDown}
      aria-label="Main navigation"
    >
      {/* Sidebar Header - Fixed */}
      <div className="flex-none p-4 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Navigation</h2>
            <p className="text-sm text-gray-600 mt-1">Manage your tasks</p>
          </div>
          <button
            onClick={toggleSidebar}
            className="lg:opacity-0 lg:hover:opacity-100 p-1 text-gray-400 hover:text-gray-600 rounded transition-all duration-200"
            aria-label="Toggle sidebar"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Sidebar Menu - Scrollable with mobile touch support */}
      <nav
        ref={navigationRef}
        className="flex-1 overflow-y-auto overflow-x-hidden p-4 mobile-scroll"
        aria-label="Sidebar navigation"
        style={{ WebkitOverflowScrolling: "touch" }}
      >
        <ul className="space-y-1" role="list">
          {enhancedItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <li key={item.label} role="none">
                <button
                  ref={index === 0 ? firstButtonRef : undefined}
                  className={`
                    group w-full flex items-center justify-between px-3 py-3 rounded-lg text-left transition-all duration-200
                    focus-visible-ring
                    ${
                      item.active
                        ? "bg-blue-50 text-blue-700 border border-blue-200 shadow-sm"
                        : "text-gray-700 hover:bg-gray-50 hover:text-gray-900 border border-transparent hover:border-gray-200"
                    }
                  `}
                  aria-current={item.active ? "page" : undefined}
                  aria-describedby={`${item.label
                    .toLowerCase()
                    .replace(/\s+/g, "-")}-desc`}
                  title={item.description}
                >
                  <div className="flex items-center space-x-3 min-w-0">
                    <Icon
                      className={`
                      h-5 w-5 flex-shrink-0 transition-colors
                      ${
                        item.active
                          ? "text-blue-600"
                          : "text-gray-500 group-hover:text-gray-700"
                      }
                    `}
                    />
                    <span className="font-medium truncate">{item.label}</span>
                  </div>

                  <div className="flex items-center space-x-2 flex-shrink-0">
                    {item.count !== null && (
                      <span
                        className={`
                        inline-flex items-center justify-center min-w-[1.25rem] h-5 px-1.5 text-xs font-medium rounded-full
                        ${
                          item.active
                            ? "bg-blue-100 text-blue-700"
                            : "bg-gray-100 text-gray-600 group-hover:bg-gray-200"
                        }
                      `}
                      >
                        {item.count}
                      </span>
                    )}
                    <ChevronRight
                      className={`
                      h-4 w-4 transition-transform duration-200 
                      ${
                        item.active
                          ? "text-blue-600 rotate-90"
                          : "text-gray-400 group-hover:text-gray-600"
                      }
                    `}
                    />
                  </div>
                </button>
                <span
                  id={`${item.label.toLowerCase().replace(/\s+/g, "-")}-desc`}
                  className="sr-only"
                >
                  {item.description}
                </span>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Quick Stats Section - Fixed */}
      <div className="flex-none p-4 border-t border-gray-200 bg-gray-50">
        <h3 className="text-sm font-semibold text-gray-900 mb-2">
          Quick Stats
        </h3>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="text-center p-2 bg-white rounded border">
            <div className="font-bold text-lg text-blue-600">
              {taskStats.pending}
            </div>
            <div className="text-gray-600 text-xs">Pending</div>
          </div>
          <div className="text-center p-2 bg-white rounded border">
            <div className="font-bold text-lg text-red-600">
              {taskStats.overdue}
            </div>
            <div className="text-gray-600 text-xs">Overdue</div>
          </div>
        </div>
      </div>

      {/* Sidebar Footer - Fixed */}
      <div className="flex-none p-4 border-t border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
            <span className="text-sm font-medium text-blue-600">TM</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              Task Manager
            </p>
            <p className="text-xs text-gray-500">v1.0.0</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
  