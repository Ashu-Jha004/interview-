"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  Search,
  X,
  Clock,
  User,
  Flag,
  Calendar,
  CheckCircle,
  History,
  Zap,
} from "lucide-react";
import { useTaskStore } from "@/lib/store/tasks";
import { TaskDetailsDialog } from "./task-details-dialog";
import { ModalBase } from "./modal-base";
import {
  formatDate,
  getStatusInfo,
  getPriorityInfo,
} from "@/lib/utils/task-helpers";
import type { Task } from "@/types/task";

interface SearchDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onTaskSelect?: (task: Task) => void;
}

const RECENT_SEARCHES_KEY = "taskManager_recentSearches";
const MAX_RECENT_SEARCHES = 5;

export function SearchDialog({ isOpen, onClose }: SearchDialogProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Task[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [taskDetailsOpen, setTaskDetailsOpen] = useState<Task | null>(null);

  const searchInputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  const tasks = useTaskStore((state) => state.tasks);
  const setStoreSearchQuery = useTaskStore((state) => state.setSearchQuery);
  const toggleTaskStatus = useTaskStore((state) => state.toggleTaskStatus);

  // Load recent searches when dialog opens
  useEffect(() => {
    if (isOpen) {
      const saved = localStorage.getItem(RECENT_SEARCHES_KEY);
      if (saved) {
        try {
          setRecentSearches(JSON.parse(saved));
        } catch (e) {
          setRecentSearches([]);
          console.error("Failed to parse recent searches from localStorage", e);
        }
      }

      // Reset state when opening
      setSearchQuery("");
      setSearchResults([]);
      setSelectedIndex(-1);

      // Focus input after modal animation
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 150);
    }
  }, [isOpen]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          const maxIndex = searchQuery.trim()
            ? searchResults.length - 1
            : recentSearches.length - 1;
          setSelectedIndex((prev) => (prev < maxIndex ? prev + 1 : prev));
          break;
        case "ArrowUp":
          e.preventDefault();
          setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
          break;
        case "Enter":
          e.preventDefault();
          if (searchQuery.trim()) {
            if (selectedIndex >= 0 && searchResults[selectedIndex]) {
              handleTaskSelect(searchResults[selectedIndex]);
            } else {
              handleSearchSubmit();
            }
          } else if (selectedIndex >= 0 && recentSearches[selectedIndex]) {
            setSearchQuery(recentSearches[selectedIndex]);
          }
          break;
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, selectedIndex, searchResults, searchQuery, recentSearches]);

  // Search functionality with debouncing
  const performSearch = useCallback(
    (query: string) => {
      if (!query.trim()) {
        setSearchResults([]);
        setIsSearching(false);
        return;
      }

      setIsSearching(true);

      const searchTerms = query
        .toLowerCase()
        .split(" ")
        .filter((term) => term.length > 0);

      const results = tasks
        .map((task) => {
          let score = 0;
          searchTerms.forEach((term) => {
            if (task.title.toLowerCase().includes(term)) score += 10;
            if (task.description?.toLowerCase().includes(term)) score += 5;
            if (task.customer?.toLowerCase().includes(term)) score += 7;
          });
          return score > 0 ? { task, score } : null;
        })
        .filter(
          (result): result is NonNullable<typeof result> => result !== null
        )
        .sort((a, b) => b.score - a.score)
        .slice(0, 8)
        .map((result) => result.task);

      setSearchResults(results);
      setIsSearching(false);
    },
    [tasks]
  );

  useEffect(() => {
    const searchTimeout = setTimeout(() => {
      performSearch(searchQuery);
    }, 200);

    return () => clearTimeout(searchTimeout);
  }, [searchQuery, performSearch]);

  // Auto-scroll selected item
  useEffect(() => {
    if (selectedIndex >= 0 && resultsRef.current) {
      const selectedElement = resultsRef.current.children[
        selectedIndex
      ] as HTMLElement;
      selectedElement?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, [selectedIndex]);

  const saveRecentSearch = useCallback(
    (query: string) => {
      if (!query.trim()) return;

      const updated = [
        query,
        ...recentSearches.filter((s) => s !== query),
      ].slice(0, MAX_RECENT_SEARCHES);
      setRecentSearches(updated);
      localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
    },
    [recentSearches]
  );

  const handleTaskSelect = useCallback(
    (task: Task) => {
      saveRecentSearch(searchQuery);
      setTaskDetailsOpen(task);
    },
    [searchQuery, saveRecentSearch]
  );

  const handleTaskDetailsClose = useCallback(() => {
    setTaskDetailsOpen(null);
  }, []);

  const handleSearchSubmit = useCallback(() => {
    saveRecentSearch(searchQuery);
    setStoreSearchQuery(searchQuery);
    onClose();
  }, [searchQuery, setStoreSearchQuery, onClose, saveRecentSearch]);

  const handleRecentSearchClick = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  const handleQuickToggle = useCallback(
    (e: React.MouseEvent, taskId: string) => {
      e.stopPropagation();
      toggleTaskStatus(taskId);
    },
    [toggleTaskStatus]
  );

  const clearRecentSearches = useCallback(() => {
    setRecentSearches([]);
    localStorage.removeItem(RECENT_SEARCHES_KEY);
  }, []);

  const highlightText = useCallback((text: string, query: string) => {
    if (!query.trim()) return text;

    const searchTerms = query
      .toLowerCase()
      .split(" ")
      .filter((term) => term.length > 0);
    let highlightedText = text;

    searchTerms.forEach((term) => {
      const regex = new RegExp(`(${term})`, "gi");
      highlightedText = highlightedText.replace(
        regex,
        '<mark class="bg-yellow-200 text-yellow-900 rounded px-0.5">$1</mark>'
      );
    });

    return highlightedText;
  }, []);

  const footer = searchQuery.trim() ? (
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-4 text-xs text-muted-foreground">
        <span className="flex items-center">
          <kbd className="px-1.5 py-0.5 bg-muted border border-border rounded text-xs">
            ↑↓
          </kbd>
          <span className="ml-1">Navigate</span>
        </span>
        <span className="flex items-center">
          <kbd className="px-1.5 py-0.5 bg-muted border border-border rounded text-xs">
            ↵
          </kbd>
          <span className="ml-1">View Details</span>
        </span>
        <span className="flex items-center">
          <kbd className="px-1.5 py-0.5 bg-muted border border-border rounded text-xs">
            ESC
          </kbd>
          <span className="ml-1">Close</span>
        </span>
      </div>
      <button
        onClick={handleSearchSubmit}
        className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 focus-visible-ring transition-colors text-sm font-medium flex items-center"
      >
        <Search className="h-4 w-4 mr-2" />
        Search All
      </button>
    </div>
  ) : null;

  return (
    <>
      <ModalBase
        isOpen={isOpen}
        onClose={onClose}
        size="xl"
        showCloseButton={false}
        footer={footer}
        className="mt-12 sm:mt-16"
      >
        {/* Search Header */}
        <div className="flex items-center mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tasks, customers, descriptions..."
              className="w-full pl-12 pr-4 py-4 text-lg border-none outline-none bg-muted rounded-xl focus:bg-background focus:ring-2 focus:ring-ring transition-all placeholder:text-muted-foreground"
              aria-label="Search tasks"
            />
            {isSearching && (
              <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary border-t-transparent"></div>
              </div>
            )}
          </div>
          <button
            onClick={onClose}
            className="ml-4 p-2.5 text-muted-foreground hover:text-card-foreground hover:bg-muted rounded-xl focus-visible-ring transition-colors"
            aria-label="Close search"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Search Content */}
        {searchQuery.trim() ? (
          <div>
            {searchResults.length > 0 ? (
              <>
                <div className="text-sm text-muted-foreground px-3 py-2 flex items-center mb-4">
                  <Zap className="h-4 w-4 mr-2 text-green-500" />
                  {searchResults.length} task
                  {searchResults.length === 1 ? "" : "s"} found
                </div>
                <div
                  ref={resultsRef}
                  className="space-y-2 max-h-80 overflow-y-auto"
                  role="listbox"
                  aria-label="Search results"
                >
                  {searchResults.map((task, index) => (
                    <SearchResult
                      key={task.id}
                      task={task}
                      isSelected={index === selectedIndex}
                      searchQuery={searchQuery}
                      highlightText={highlightText}
                      onClick={() => handleTaskSelect(task)}
                      onQuickToggle={(e) => handleQuickToggle(e, task.id)}
                    />
                  ))}
                </div>
              </>
            ) : !isSearching ? (
              <div className="text-center py-12 text-muted-foreground">
                <Search className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
                <p className="text-lg font-medium text-card-foreground">
                  No tasks found
                </p>
                <p className="text-sm mt-2">
                  Try different keywords or check spelling
                </p>
              </div>
            ) : null}
          </div>
        ) : (
          <div>
            {recentSearches.length > 0 ? (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-medium text-card-foreground flex items-center">
                    <History className="h-4 w-4 mr-2" />
                    Recent Searches
                  </h3>
                  <button
                    onClick={clearRecentSearches}
                    className="text-xs text-muted-foreground hover:text-card-foreground focus-visible-ring rounded px-2 py-1"
                  >
                    Clear
                  </button>
                </div>
                <div
                  ref={resultsRef}
                  className="space-y-1 max-h-80 overflow-y-auto"
                >
                  {recentSearches.map((query, index) => (
                    <button
                      key={index}
                      onClick={() => handleRecentSearchClick(query)}
                      className={`
                        w-full text-left p-3 rounded-lg border-2 border-transparent transition-all
                        ${
                          index === selectedIndex
                            ? "bg-muted border-border"
                            : "hover:bg-muted/50"
                        }
                      `}
                    >
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 text-muted-foreground mr-3 flex-shrink-0" />
                        <span className="text-card-foreground truncate">
                          {query}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-16 text-muted-foreground">
                <Search className="mx-auto h-16 w-16 text-muted-foreground/30 mb-4" />
                <p className="text-xl font-medium text-card-foreground">
                  Search Tasks
                </p>
                <p className="text-sm mt-2 max-w-md mx-auto leading-relaxed">
                  Start typing to find tasks by title, description, or customer.
                  Click on any result to view details.
                </p>
              </div>
            )}
          </div>
        )}
      </ModalBase>

      {/* Task Details Dialog */}
      <TaskDetailsDialog
        isOpen={!!taskDetailsOpen}
        onClose={handleTaskDetailsClose}
        task={taskDetailsOpen}
      />
    </>
  );
}

interface SearchResultProps {
  task: Task;
  isSelected: boolean;
  searchQuery: string;
  highlightText: (text: string, query: string) => string;
  onClick: () => void;
  onQuickToggle: (e: React.MouseEvent) => void;
}

function SearchResult({
  task,
  isSelected,
  searchQuery,
  highlightText,
  onClick,
  onQuickToggle,
}: SearchResultProps) {
  const statusInfo = getStatusInfo(task);
  const priorityInfo = getPriorityInfo(task.priority);
  const StatusIcon = statusInfo.icon;

  return (
    <div
      className={`
        p-4 rounded-xl cursor-pointer transition-all border-2 
        ${
          isSelected
            ? "bg-muted border-border shadow-sm"
            : "hover:bg-muted/50 border-transparent"
        }
      `}
      onClick={onClick}
      role="option"
      aria-selected={isSelected}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0 pr-4">
          <h4
            className="font-semibold text-card-foreground mb-1 leading-snug"
            dangerouslySetInnerHTML={{
              __html: highlightText(task.title, searchQuery),
            }}
          />

          {task.description && (
            <p
              className="text-sm text-muted-foreground mb-3 line-clamp-2 leading-relaxed"
              dangerouslySetInnerHTML={{
                __html: highlightText(task.description, searchQuery),
              }}
            />
          )}

          <div className="flex items-center flex-wrap gap-3 text-xs">
            {task.customer && (
              <span className="flex items-center text-muted-foreground">
                <User className="h-3 w-3 mr-1.5" />
                <span
                  dangerouslySetInnerHTML={{
                    __html: highlightText(task.customer, searchQuery),
                  }}
                />
              </span>
            )}
            <span className="flex items-center text-muted-foreground">
              <Calendar className="h-3 w-3 mr-1.5" />
              {formatDate(task.dueDate)}
            </span>
          </div>
        </div>

        <div className="flex flex-col items-end space-y-2">
          <button
            onClick={onQuickToggle}
            className={`
              p-1.5 rounded-full transition-colors focus-visible-ring
              ${
                task.status === "completed"
                  ? "text-green-600 bg-green-100 hover:bg-green-200"
                  : "text-muted-foreground hover:text-green-600 hover:bg-green-50"
              }
            `}
            title={
              task.status === "completed"
                ? "Mark as pending"
                : "Mark as completed"
            }
            aria-label="Toggle task status"
          >
            <CheckCircle className="h-4 w-4" />
          </button>

          <div className="flex flex-col items-end space-y-1">
            <div
              className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${priorityInfo.bgColor} ${priorityInfo.color}`}
            >
              <Flag className="h-3 w-3 mr-1" />
              {priorityInfo.label}
            </div>
            <div
              className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${statusInfo.color}`}
            >
              <StatusIcon className="h-3 w-3 mr-1" />
              {statusInfo.label}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
