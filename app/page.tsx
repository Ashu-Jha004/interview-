"use client";

import { useEffect, useState, useCallback } from "react";
import { Navbar } from "@/components/navbar";
import { Sidebar } from "@/components/sidebar";
import { StatsCards } from "@/components/stats-cards";
import { TaskControls } from "@/components/task-controls";
import { TaskList } from "@/components/task-list";
import { TaskCards } from "@/components/task-cards";
import { SearchDialog } from "@/components/search-dialog";
import { useTaskStore } from "@/lib/store/tasks";
import type { Task } from "@/types/task";

export default function HomePage() {
  const [mounted, setMounted] = useState(false);
  const [searchDialogOpen, setSearchDialogOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const viewMode = useTaskStore((state) => state.viewMode);
  const sidebarOpen = useTaskStore((state) => state.sidebarOpen);
  const toggleSidebar = useTaskStore((state) => state.toggleSidebar);
  const setSearchQuery = useTaskStore((state) => state.setSearchQuery);

  // Global keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchDialogOpen(true);
      }

      if (e.key === "Escape" && sidebarOpen && window.innerWidth < 1024) {
        toggleSidebar();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [sidebarOpen, toggleSidebar]);

  const handleOverlayClick = useCallback(() => {
    toggleSidebar();
  }, [toggleSidebar]);

  const handleSearchTaskSelect = useCallback(
    (task: Task) => {
      setSearchQuery(task.title);
    },
    [setSearchQuery]
  );

  if (!mounted) {
    return (
      <div className="min-h-screen bg-background">
        <div className="h-16 bg-card border-b animate-pulse"></div>
        <div className="animate-pulse p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-card rounded-lg"></div>
            ))}
          </div>
          <div className="h-96 bg-card rounded-lg"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Navbar - Fixed */}
      <header className="sticky top-0 z-50">
        <Navbar />
      </header>

      {/* Main Layout */}
      <div className="flex">
        {/* Desktop Sidebar - Conditional */}
        {sidebarOpen && (
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <div className="sticky top-16 h-[calc(100vh-4rem)]">
              <Sidebar />
            </div>
          </aside>
        )}

        {/* Main Content - Always Scrollable */}
        <main className="flex-1 min-w-0">
          <div className="p-4 lg:p-6">
            <StatsCards />
          </div>

          <div className="px-4 lg:px-6 pb-8">
            <div className="mb-4">
              <TaskControls />
            </div>

            <div>{viewMode === "list" ? <TaskList /> : <TaskCards />}</div>
          </div>
        </main>
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-40">
          {/* Backdrop with Tailwind backdrop-blur */}
          <div
            className="absolute inset-0 bg-black/20 backdrop-blur-sm"
            onClick={handleOverlayClick}
          />

          {/* Sidebar */}
          <div className="absolute left-0 top-0 bottom-0 w-64">
            <Sidebar />
          </div>
        </div>
      )}

      {/* Search Dialog */}
      <SearchDialog
        isOpen={searchDialogOpen}
        onClose={() => setSearchDialogOpen(false)}
        onTaskSelect={handleSearchTaskSelect}
      />
    </div>
  );
}
