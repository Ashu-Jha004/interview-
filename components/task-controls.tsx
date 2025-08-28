"use client";

import { useState, useRef, useEffect } from "react";
import {
  ChevronDown,
  Filter,
  X,
  SortAsc,
  List,
  Grid3X3,
  Plus,
  Check,
} from "lucide-react";
import { useTaskStore } from "@/lib/store/tasks";
import { TaskFormDialog } from "./task-form-dialog";
import type { SortOption, TaskStatus, TaskPriority } from "@/types/task";

const sortOptions: { value: SortOption; label: string; description: string }[] =
  [
    { value: "priority", label: "Priority", description: "Urgent → Low" },
    { value: "status", label: "Status", description: "Overdue → Completed" },
    { value: "dueDate", label: "Due Date", description: "Soonest first" },
    { value: "customer", label: "Customer", description: "A → Z" },
    { value: "createdAt", label: "Created", description: "Newest first" },
  ];

const statusOptions: { value: TaskStatus; label: string; color: string }[] = [
  { value: "pending", label: "Pending", color: "text-blue-600" },
  { value: "in_progress", label: "In Progress", color: "text-yellow-600" },
  { value: "completed", label: "Completed", color: "text-green-600" },
  { value: "overdue", label: "Overdue", color: "text-red-600" },
];

const priorityOptions: { value: TaskPriority; label: string; color: string }[] =
  [
    { value: "urgent", label: "Urgent", color: "text-red-600" },
    { value: "high", label: "High", color: "text-orange-600" },
    { value: "medium", label: "Medium", color: "text-blue-600" },
    { value: "low", label: "Low", color: "text-gray-600" },
  ];

interface DropdownProps {
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
  label: string;
  triggerRef: React.RefObject<HTMLButtonElement>;
}

function Dropdown({
  isOpen,
  onToggle,
  children,
  label,
  triggerRef,
}: DropdownProps) {
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(event.target as Node)
      ) {
        onToggle();
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape" && isOpen) {
        onToggle();
        triggerRef.current?.focus();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleEscape);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, onToggle, triggerRef]);

  if (!isOpen) return null;

  return (
    <div
      ref={dropdownRef}
      className="absolute top-full left-0 mt-2 w-56 bg-white border border-gray-200 rounded-lg shadow-lg z-50"
      role="menu"
      aria-label={label}
    >
      {children}
    </div>
  );
}

export function TaskControls() {
  const [sortDropdownOpen, setSortDropdownOpen] = useState(false);
  const [statusDropdownOpen, setStatusDropdownOpen] = useState(false);
  const [priorityDropdownOpen, setPriorityDropdownOpen] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  const sortTriggerRef = useRef<HTMLButtonElement>(null);
  const statusTriggerRef = useRef<HTMLButtonElement>(null);
  const priorityTriggerRef = useRef<HTMLButtonElement>(null);

  // Fixed: Properly access store values
  const sortBy = useTaskStore((state) => state.sortBy);
  const filterStatus = useTaskStore((state) => state.filterStatus);
  const filterPriority = useTaskStore((state) => state.filterPriority);
  const viewMode = useTaskStore((state) => state.viewMode);
  const filteredTasks = useTaskStore((state) => state.filteredTasks);

  const setSortBy = useTaskStore((state) => state.setSortBy);
  const setFilterStatus = useTaskStore((state) => state.setFilterStatus);
  const setFilterPriority = useTaskStore((state) => state.setFilterPriority);
  const clearFilters = useTaskStore((state) => state.clearFilters);
  const setViewMode = useTaskStore((state) => state.setViewMode);

  const hasActiveFilters = filterStatus.length > 0 || filterPriority.length > 0;

  const handleSortSelect = (sort: SortOption) => {
    setSortBy(sort);
    setSortDropdownOpen(false);
  };

  const handleStatusToggle = (status: TaskStatus) => {
    const newStatuses = filterStatus.includes(status)
      ? filterStatus.filter((s) => s !== status)
      : [...filterStatus, status];
    setFilterStatus(newStatuses);
  };

  const handlePriorityToggle = (priority: TaskPriority) => {
    const newPriorities = filterPriority.includes(priority)
      ? filterPriority.filter((p) => p !== priority)
      : [...filterPriority, priority];
    setFilterPriority(newPriorities);
  };

  return (
    <>
      <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
        {/* Header */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <h2 className="text-lg font-semibold text-gray-900">Tasks</h2>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
              {filteredTasks.length}{" "}
              {filteredTasks.length === 1 ? "task" : "tasks"}
            </span>
          </div>

          <button
            onClick={() => setShowCreateDialog(true)}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 focus-visible-ring transition-colors"
            aria-label="Add new task"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Task
          </button>
        </div>

        {/* Controls */}
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
          {/* Left Side - Filters and Sort */}
          <div className="flex flex-wrap gap-3 items-center">
            {/* Sort Dropdown */}
            <div className="relative">
              <button
                ref={sortTriggerRef}
                onClick={() => setSortDropdownOpen(!sortDropdownOpen)}
                className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus-visible-ring"
                aria-expanded={sortDropdownOpen}
                aria-haspopup="menu"
              >
                <SortAsc className="h-4 w-4 mr-2" />
                Sort: {sortOptions.find((opt) => opt.value === sortBy)?.label}
                <ChevronDown className="h-4 w-4 ml-2" />
              </button>

              <Dropdown
                isOpen={sortDropdownOpen}
                onToggle={() => setSortDropdownOpen(false)}
                label="Sort options"
                triggerRef={sortTriggerRef}
              >
                <div className="p-2">
                  <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide px-3 py-2">
                    Sort By
                  </div>
                  {sortOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => handleSortSelect(option.value)}
                      className={`
                        w-full text-left px-3 py-2 rounded-md text-sm transition-colors
                        ${
                          sortBy === option.value
                            ? "bg-blue-50 text-blue-700 font-medium"
                            : "text-gray-700 hover:bg-gray-50"
                        }
                      `}
                    >
                      <div className="font-medium">{option.label}</div>
                      <div className="text-xs text-gray-500">
                        {option.description}
                      </div>
                    </button>
                  ))}
                </div>
              </Dropdown>
            </div>

            {/* Status Filter */}
            <div className="relative">
              <button
                ref={statusTriggerRef}
                onClick={() => setStatusDropdownOpen(!statusDropdownOpen)}
                className={`
                  inline-flex items-center px-3 py-2 text-sm font-medium rounded-lg border focus-visible-ring
                  ${
                    filterStatus.length > 0
                      ? "bg-blue-50 text-blue-700 border-blue-200"
                      : "text-gray-700 bg-white border-gray-300 hover:bg-gray-50"
                  }
                `}
                aria-expanded={statusDropdownOpen}
                aria-haspopup="menu"
              >
                <Filter className="h-4 w-4 mr-2" />
                Status
                {filterStatus.length > 0 && (
                  <span className="ml-1 bg-blue-600 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                    {filterStatus.length}
                  </span>
                )}
                <ChevronDown className="h-4 w-4 ml-2" />
              </button>

              <Dropdown
                isOpen={statusDropdownOpen}
                onToggle={() => setStatusDropdownOpen(false)}
                label="Status filters"
                triggerRef={statusTriggerRef}
              >
                <div className="p-2">
                  <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide px-3 py-2">
                    Filter by Status
                  </div>
                  {statusOptions.map((option) => (
                    <label
                      key={option.value}
                      className="flex items-center px-3 py-2 rounded-md text-sm hover:bg-gray-50 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={filterStatus.includes(option.value)}
                        onChange={() => handleStatusToggle(option.value)}
                        className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className={`ml-3 ${option.color} font-medium`}>
                        {option.label}
                      </span>
                      {filterStatus.includes(option.value) && (
                        <Check className="h-4 w-4 ml-auto text-blue-600" />
                      )}
                    </label>
                  ))}
                </div>
              </Dropdown>
            </div>

            {/* Priority Filter */}
            <div className="relative">
              <button
                ref={priorityTriggerRef}
                onClick={() => setPriorityDropdownOpen(!priorityDropdownOpen)}
                className={`
                  inline-flex items-center px-3 py-2 text-sm font-medium rounded-lg border focus-visible-ring
                  ${
                    filterPriority.length > 0
                      ? "bg-purple-50 text-purple-700 border-purple-200"
                      : "text-gray-700 bg-white border-gray-300 hover:bg-gray-50"
                  }
                `}
                aria-expanded={priorityDropdownOpen}
                aria-haspopup="menu"
              >
                <Filter className="h-4 w-4 mr-2" />
                Priority
                {filterPriority.length > 0 && (
                  <span className="ml-1 bg-purple-600 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                    {filterPriority.length}
                  </span>
                )}
                <ChevronDown className="h-4 w-4 ml-2" />
              </button>

              <Dropdown
                isOpen={priorityDropdownOpen}
                onToggle={() => setPriorityDropdownOpen(false)}
                label="Priority filters"
                triggerRef={priorityTriggerRef}
              >
                <div className="p-2">
                  <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide px-3 py-2">
                    Filter by Priority
                  </div>
                  {priorityOptions.map((option) => (
                    <label
                      key={option.value}
                      className="flex items-center px-3 py-2 rounded-md text-sm hover:bg-gray-50 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={filterPriority.includes(option.value)}
                        onChange={() => handlePriorityToggle(option.value)}
                        className="h-4 w-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                      />
                      <span className={`ml-3 ${option.color} font-medium`}>
                        {option.label}
                      </span>
                      {filterPriority.includes(option.value) && (
                        <Check className="h-4 w-4 ml-auto text-purple-600" />
                      )}
                    </label>
                  ))}
                </div>
              </Dropdown>
            </div>

            {/* Clear Filters Button */}
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 focus-visible-ring transition-colors"
                aria-label="Clear all filters"
              >
                <X className="h-4 w-4 mr-2" />
                Clear Filters
              </button>
            )}
          </div>

          {/* Right Side - View Toggle */}
          <div className="flex items-center space-x-1 bg-gray-100 rounded-lg p-1">
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
              aria-label="List view"
              aria-pressed={viewMode === "list"}
            >
              <List className="h-4 w-4 mr-2" />
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
              aria-label="Cards view"
              aria-pressed={viewMode === "cards"}
            >
              <Grid3X3 className="h-4 w-4 mr-2" />
              Cards
            </button>
          </div>
        </div>

        {/* Active Filters Summary */}
        {hasActiveFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex flex-wrap gap-2 items-center">
              <span className="text-sm text-gray-600">Active filters:</span>
              {filterStatus.map((status) => (
                <span
                  key={status}
                  className="inline-flex items-center px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full"
                >
                  {statusOptions.find((opt) => opt.value === status)?.label}
                  <button
                    onClick={() => handleStatusToggle(status)}
                    className="ml-1 text-blue-600 hover:text-blue-800"
                    aria-label={`Remove ${status} filter`}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
              {filterPriority.map((priority) => (
                <span
                  key={priority}
                  className="inline-flex items-center px-2 py-1 text-xs font-medium bg-purple-100 text-purple-800 rounded-full"
                >
                  {priorityOptions.find((opt) => opt.value === priority)?.label}
                  <button
                    onClick={() => handlePriorityToggle(priority)}
                    className="ml-1 text-purple-600 hover:text-purple-800"
                    aria-label={`Remove ${priority} filter`}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Create Task Dialog */}
      <TaskFormDialog
        isOpen={showCreateDialog}
        onClose={() => setShowCreateDialog(false)}
      />
    </>
  );
}
