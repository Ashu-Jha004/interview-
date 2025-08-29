"use client";

import { useState } from "react";
import {
  MoreHorizontal,
  Edit3,
  Trash2,
  CheckCircle,
  User,
  Flag,
  Clock,
  ArrowUpRight,
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

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
  onToggleStatus: (task: Task) => void;
  onViewDetails: (task: Task) => void;
}

function TaskCard({
  task,
  onEdit,
  onDelete,
  onToggleStatus,
  onViewDetails,
}: TaskCardProps) {
  const [actionMenuOpen, setActionMenuOpen] = useState(false);
  const statusInfo = getStatusInfo(task);
  const priorityInfo = getPriorityInfo(task.priority);
  const StatusIcon = statusInfo.icon;

  const handleCardClick = (e: React.MouseEvent) => {
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
      className="group bg-white hover:bg-gray-50 border border-gray-200 hover:border-gray-300 rounded-2xl p-5 cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
      onClick={handleCardClick}
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
      {/* Card Header */}
      <div className="flex items-start justify-between mb-4">
        <div
          className={`w-12 h-12 rounded-xl ${priorityInfo.bgColor} ${priorityInfo.color} flex items-center justify-center flex-shrink-0`}
        >
          <Flag className="h-6 w-6" />
        </div>

        <div className="flex items-center space-x-2 action-menu">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleStatus(task);
            }}
            className={`
              p-2 rounded-lg transition-all focus-visible-ring
              ${
                task.status === "completed"
                  ? "text-green-600 bg-green-50 hover:bg-green-100"
                  : "text-gray-400 hover:text-green-600 hover:bg-green-50"
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
              className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 focus-visible-ring transition-all"
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

      {/* Task Content */}
      <div className="space-y-3">
        {/* Title */}
        <h3 className="text-lg font-semibold text-gray-900 leading-tight group-hover:text-blue-600 transition-colors">
          {task.title}
          <ArrowUpRight className="inline-block ml-2 h-4 w-4 opacity-0 group-hover:opacity-100 transition-all" />
        </h3>

        {/* Description */}
        {task.description && (
          <p className="text-sm text-gray-600 line-clamp-3 leading-relaxed">
            {task.description}
          </p>
        )}

        {/* Customer */}
        {task.customer && (
          <div className="flex items-center text-sm text-gray-600">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
              <User className="h-4 w-4 text-blue-600" />
            </div>
            <span className="font-medium truncate">{task.customer}</span>
          </div>
        )}
      </div>

      {/* Card Footer */}
      <div className="flex items-center justify-between pt-4 mt-4 border-t border-gray-100">
        <div className="flex items-center space-x-3">
          {/* Status Badge */}
          <div
            className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium ${statusInfo.color}`}
          >
            <StatusIcon className="h-3 w-3 mr-1.5" />
            {statusInfo.label}
          </div>
        </div>

        {/* Due Date */}
        <div className="flex items-center text-xs text-gray-500">
          <Clock className="h-3 w-3 mr-1.5" />
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
    </div>
  );
}

export function TaskCards() {
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
      {/* Scrollable Task Cards Container */}
      <div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 overflow-y-auto pb-6"
        style={{
          WebkitOverflowScrolling: "touch",
          overscrollBehavior: "contain",
        }}
      >
        {filteredTasks.map((task) => (
          <TaskCard
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
