"use client";

import { useState } from "react";
import {
  MoreHorizontal,
  Edit3,
  Trash2,
  CheckCircle,
  User,
  Calendar,
  Flag,
} from "lucide-react";
import { useTaskStore } from "@/lib/store/tasks";
import { TaskFormDialog } from "./task-form-dialog";
import { ConfirmDialog } from "./confirm-dialog";
import { TaskDetailsDialog } from "./task-details-dialog";
import { EmptyState } from "./empty-state";
import {
  formatDate,
  getStatusInfo,
  getPriorityInfo,
} from "@/lib/utils/task-helpers";
import type { Task } from "@/types/task";

interface TaskRowProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
  onToggleStatus: (task: Task) => void;
  onViewDetails: (task: Task) => void;
}

function TaskRow({
  task,
  onEdit,
  onDelete,
  onToggleStatus,
  onViewDetails,
}: TaskRowProps) {
  const [actionMenuOpen, setActionMenuOpen] = useState(false);
  const statusInfo = getStatusInfo(task);
  const priorityInfo = getPriorityInfo(task.priority);
  const StatusIcon = statusInfo.icon;

  const handleRowClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (
      target.closest("button") ||
      target.closest('[role="menu"]') ||
      target.closest(".action-menu")
    ) {
      return;
    }
    onViewDetails(task);
  };

  return (
    <div
      className="group bg-white hover:bg-gray-50 border border-gray-200 hover:border-gray-300 rounded-xl p-4 sm:p-5 cursor-pointer transition-all duration-200 hover:shadow-md"
      onClick={handleRowClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onViewDetails(task);
        }
      }}
      aria-label={`View details for task: ${task.title}`}
    >
      {/* Mobile-First Layout */}
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0 pr-3">
          {/* Task Title */}
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2 leading-tight">
            {task.title}
          </h3>

          {/* Task Description */}
          {task.description && (
            <p className="text-sm text-gray-600 mb-3 line-clamp-2 leading-relaxed">
              {task.description}
            </p>
          )}

          {/* Task Meta Information */}
          <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm">
            {/* Customer */}
            {task.customer && (
              <div className="flex items-center text-gray-500">
                <User className="h-4 w-4 mr-1.5 flex-shrink-0" />
                <span className="font-medium truncate max-w-[120px]">
                  {task.customer}
                </span>
              </div>
            )}

            {/* Due Date */}
            <div className="flex items-center text-gray-500">
              <Calendar className="h-4 w-4 mr-1.5 flex-shrink-0" />
              <span
                className={`font-medium ${
                  task.dueDate && statusInfo.status === "overdue"
                    ? "text-red-600"
                    : ""
                }`}
              >
                {formatDate(task.dueDate)}
              </span>
            </div>
          </div>

          {/* Priority and Status Badges */}
          <div className="flex flex-wrap items-center gap-2 mt-3">
            <div
              className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${priorityInfo.bgColor} ${priorityInfo.color}`}
            >
              <Flag className="h-3 w-3 mr-1.5" />
              {priorityInfo.label}
            </div>

            <div
              className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border-2 ${statusInfo.color}`}
            >
              <StatusIcon className="h-3 w-3 mr-1.5" />
              {statusInfo.label}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col items-end space-y-2 action-menu">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleStatus(task);
            }}
            className={`
              p-2.5 rounded-lg transition-all focus-visible-ring
              ${
                task.status === "completed"
                  ? "text-green-600 bg-green-50 hover:bg-green-100 border border-green-200"
                  : "text-gray-400 hover:text-green-600 hover:bg-green-50 border border-gray-200 hover:border-green-200"
              }
            `}
            title={
              task.status === "completed"
                ? "Mark as pending"
                : "Mark as completed"
            }
          >
            <CheckCircle className="h-5 w-5" />
          </button>

          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setActionMenuOpen(!actionMenuOpen);
              }}
              className="p-2.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 border border-gray-200 hover:border-gray-300 focus-visible-ring transition-all"
              aria-label="Task actions"
            >
              <MoreHorizontal className="h-5 w-5" />
            </button>

            {actionMenuOpen && (
              <div className="absolute right-0 top-full mt-2 w-40 bg-white border border-gray-200 rounded-xl shadow-lg z-20 overflow-hidden">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(task);
                    setActionMenuOpen(false);
                  }}
                  className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 flex items-center transition-colors"
                >
                  <Edit3 className="h-4 w-4 mr-3" />
                  Edit Task
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(task);
                    setActionMenuOpen(false);
                  }}
                  className="w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50 flex items-center transition-colors"
                >
                  <Trash2 className="h-4 w-4 mr-3" />
                  Delete Task
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export function TaskList() {
  const filteredTasks = useTaskStore((state) => state.filteredTasks);
  const searchQuery = useTaskStore((state) => state.searchQuery);
  const filterStatus = useTaskStore((state) => state.filterStatus);
  const filterPriority = useTaskStore((state) => state.filterPriority);
  const clearFilters = useTaskStore((state) => state.clearFilters);
  const setSearchQuery = useTaskStore((state) => state.setSearchQuery);
  const { toggleTaskStatus, deleteTask } = useTaskStore();

  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [taskDetailsOpen, setTaskDetailsOpen] = useState<Task | null>(null);

  const hasFilters = filterStatus.length > 0 || filterPriority.length > 0;
  const hasSearchQuery = searchQuery.trim().length > 0;

  const handleEdit = (task: Task) => setEditingTask(task);
  const handleDelete = (task: Task) => setTaskToDelete(task);
  const handleConfirmDelete = () => {
    if (taskToDelete) deleteTask(taskToDelete.id);
  };
  const handleToggleStatus = (task: Task) => toggleTaskStatus(task.id);
  const handleViewDetails = (task: Task) => setTaskDetailsOpen(task);
  const handleClearSearch = () => setSearchQuery("");
  const handleCreateTask = () => setCreateDialogOpen(true);

  const getEmptyStateType = () => {
    if (hasSearchQuery) return "no-search-results";
    if (hasFilters) return "no-filter-results";
    return "no-tasks";
  };

  if (filteredTasks.length === 0) {
    return (
      <>
        <EmptyState
          type={getEmptyStateType()}
          searchQuery={searchQuery}
          hasFilters={hasFilters}
          onCreateTask={handleCreateTask}
          onClearFilters={clearFilters}
          onClearSearch={handleClearSearch}
        />

        <TaskFormDialog
          isOpen={createDialogOpen}
          onClose={() => setCreateDialogOpen(false)}
        />
      </>
    );
  }

  return (
    <>
      {/* Scrollable Task List Container */}
      <div
        className="space-y-4 overflow-y-auto"
        style={{
          WebkitOverflowScrolling: "touch",
          overscrollBehavior: "contain",
        }}
      >
        {filteredTasks.map((task) => (
          <TaskRow
            key={task.id}
            task={task}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onToggleStatus={handleToggleStatus}
            onViewDetails={handleViewDetails}
          />
        ))}
      </div>

      {/* Dialogs */}
      <TaskDetailsDialog
        isOpen={!!taskDetailsOpen}
        onClose={() => setTaskDetailsOpen(null)}
        task={taskDetailsOpen}
      />

      <TaskFormDialog
        isOpen={!!editingTask}
        onClose={() => setEditingTask(null)}
        task={editingTask || undefined}
      />

      <ConfirmDialog
        isOpen={!!taskToDelete}
        onClose={() => setTaskToDelete(null)}
        onConfirm={handleConfirmDelete}
        title="Delete Task"
        message={`Are you sure you want to delete "${taskToDelete?.title}"? This action cannot be undone.`}
        confirmText="Delete Task"
        variant="danger"
      />
    </>
  );
}
