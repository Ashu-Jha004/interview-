"use client";

import { useState, useCallback, useEffect } from "react";
import {
  Search,
  Menu,
  Bell,
  Phone,
  Settings,
  HelpCircle,
  User,
  X,
} from "lucide-react";
import { useTaskStore } from "@/lib/store/tasks";
import { SearchDialog } from "./search-dialog";
import type { Task } from "@/types/task";

export function Navbar() {
  const [searchDialogOpen, setSearchDialogOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const searchQuery = useTaskStore((state) => state.searchQuery);
  const sidebarOpen = useTaskStore((state) => state.sidebarOpen);
  const toggleSidebar = useTaskStore((state) => state.toggleSidebar);
  const setSearchQuery = useTaskStore((state) => state.setSearchQuery);

  // Track screen size for responsive behavior
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 1024);
    };

    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  const handleToggleSidebar = useCallback(() => {
    toggleSidebar();
  }, [toggleSidebar]);

  const handleOpenSearch = useCallback(() => {
    setSearchDialogOpen(true);
  }, []);

  const handleCloseSearch = useCallback(() => {
    setSearchDialogOpen(false);
  }, []);

  const handleTaskSelect = useCallback(
    (task: Task) => {
      setSearchQuery(task.title);
    },
    [setSearchQuery]
  );

  const handleClearSearch = useCallback(() => {
    setSearchQuery("");
  }, [setSearchQuery]);

  const getMenuIcon = () => {
    if (isMobile && sidebarOpen) {
      return X;
    }
    return Menu;
  };

  const MenuIcon = getMenuIcon();

  return (
    <>
      <nav className="bg-white border-b border-gray-200 px-4 lg:px-6 py-3 relative">
        <div className="flex items-center justify-between">
          {/* Left Section */}
          <div className="flex items-center space-x-4">
            <button
              onClick={handleToggleSidebar}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg focus-visible-ring transition-colors"
              aria-label={sidebarOpen ? "Close sidebar" : "Open sidebar"}
              aria-expanded={sidebarOpen}
              aria-controls="sidebar"
              title={sidebarOpen ? "Close sidebar" : "Open sidebar"}
            >
              <MenuIcon className="h-5 w-5" />
            </button>

            {/* DEXKOR Logo and Branding */}
            <div className="flex items-center cursor-pointer select-none">
              {/* Logo Icon - Custom D with dots design */}
              <div className="flex items-center justify-center w-8 h-8 bg-blue-600 rounded-lg mr-3">
                <div className="relative">
                  {/* Main D shape */}
                  <div className="w-5 h-5 border-2 border-white rounded-r-full border-l-0 flex items-center justify-end pr-1">
                    {/* Three dots */}
                    <div className="flex flex-col space-y-0.5">
                      <div className="w-0.5 h-0.5 bg-white rounded-full"></div>
                      <div className="w-0.5 h-0.5 bg-white rounded-full"></div>
                      <div className="w-0.5 h-0.5 bg-white rounded-full"></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* DEXKOR Text */}
              <h1 className="text-blue-700 font-bold text-xl tracking-wide hidden sm:block">
                <span className="font-extrabold">DEXKOR</span>
              </h1>
            </div>
          </div>

          {/* Center Section - Search Trigger */}
          <div className="flex-1 max-w-lg mx-4">
            <button
              onClick={handleOpenSearch}
              className={`
                w-full flex items-center px-4 py-2.5 text-left rounded-lg border transition-all
                focus-visible-ring group
                ${
                  searchQuery
                    ? "border-blue-200 bg-blue-50 text-blue-900"
                    : "border-gray-300 bg-white text-gray-500 hover:bg-gray-50 hover:border-gray-400"
                }
              `}
              aria-label="Open search dialog"
            >
              <Search
                className={`
                h-4 w-4 mr-3 transition-colors
                ${
                  searchQuery
                    ? "text-blue-600"
                    : "text-gray-400 group-hover:text-gray-600"
                }
              `}
              />

              <span
                className={`
                flex-1 text-sm transition-colors
                ${searchQuery ? "text-blue-900 font-medium" : "text-gray-500"}
              `}
              >
                {searchQuery || "Search tasks, customers..."}
              </span>

              {/* Search indicator/shortcut */}
              <div className="hidden sm:flex items-center space-x-1">
                {searchQuery ? (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleClearSearch();
                    }}
                    className="p-1 text-blue-600 hover:text-blue-800 rounded focus-visible-ring"
                    aria-label="Clear search"
                  >
                    <X className="h-3 w-3" />
                  </button>
                ) : (
                  <kbd className="px-2 py-1 text-xs text-gray-400 bg-gray-100 border border-gray-200 rounded">
                    ⌘K
                  </kbd>
                )}
              </div>
            </button>

            {/* Active search indicator for mobile */}
            {searchQuery && (
              <div className="sm:hidden mt-1 flex items-center justify-between text-xs">
                <span className="text-blue-600 font-medium">
                  Active search: "
                  {searchQuery.length > 20
                    ? searchQuery.substring(0, 20) + "..."
                    : searchQuery}
                  "
                </span>
                <button
                  onClick={handleClearSearch}
                  className="text-blue-600 hover:text-blue-800 p-1 rounded focus-visible-ring"
                  aria-label="Clear search"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            )}
          </div>

          {/* Right Section */}
          <div className="flex items-center space-x-1">
            {[
              { icon: Bell, label: "Notifications", badge: true },
              { icon: Phone, label: "Phone" },
              { icon: Settings, label: "Settings" },
              { icon: HelpCircle, label: "Help" },
              { icon: User, label: "User menu" },
            ].map(({ icon: Icon, label, badge }) => (
              <button
                key={label}
                className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg focus-visible-ring transition-colors"
                aria-label={label}
              >
                <Icon className="h-5 w-5" />
                {badge && (
                  <span
                    className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full animate-pulse"
                    aria-hidden="true"
                  />
                )}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Search Dialog */}
      <SearchDialog
        isOpen={searchDialogOpen}
        onClose={handleCloseSearch}
        onTaskSelect={handleTaskSelect}
      />
    </>
  );
}
