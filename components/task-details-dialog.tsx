"use client";

import { useState, useCallback } from "react";
import {
  Calendar,
  User,
  Flag,
  CheckCircle,
  Edit3,
  Trash2,
  FileText,
  Plus,
} from "lucide-react";
import { useTaskStore } from "@/lib/store/tasks";
import { TaskFormDialog } from "./task-form-dialog";
import { ConfirmDialog } from "./confirm-dialog";
import { ModalBase } from "./modal-base";
import {
  formatDate,
  getStatusInfo,
  getPriorityInfo,
} from "@/lib/utils/task-helpers";
import type { Task } from "@/types/task";

interface TaskDetailsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  task: Task | null;
}

export function TaskDetailsDialog({
  isOpen,
  onClose,
  task,
}: TaskDetailsDialogProps) {
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const { toggleTaskStatus, deleteTask } = useTaskStore();

  const handleEdit = useCallback(() => {
    setEditDialogOpen(true);
  }, []);

  const handleDelete = useCallback(() => {
    setDeleteDialogOpen(true);
  }, []);

  const handleConfirmDelete = useCallback(() => {
    if (task) {
      deleteTask(task.id);
      onClose();
    }
  }, [task, deleteTask, onClose]);

  const handleToggleStatus = useCallback(() => {
    if (task) {
      toggleTaskStatus(task.id);
    }
    onClose();
  }, [task, toggleTaskStatus]);

  if (!task) return null;

  const statusInfo = getStatusInfo(task);
  const priorityInfo = getPriorityInfo(task.priority);
  const StatusIcon = statusInfo.icon;

  const createdDate = new Date(task.createdAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const updatedDate = new Date(task.updatedAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const footer = (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
      <button
        onClick={handleToggleStatus}
        className={`
          inline-flex items-center justify-center px-4 py-2 rounded-lg font-medium transition-colors focus-visible-ring
          ${
            task.status === "completed"
              ? "bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
              : "bg-green-100 text-green-800 hover:bg-green-200"
          }
        `}
      >
        <CheckCircle className="h-4 w-4 mr-2" />
        {task.status === "completed" ? "Mark as Pending" : "Mark as Completed"}
      </button>

      <div className="flex items-center gap-3">
        <button
          onClick={handleEdit}
          className="inline-flex items-center justify-center px-4 py-2 bg-blue-100 text-blue-800 rounded-lg hover:bg-blue-200 font-medium transition-colors focus-visible-ring"
        >
          <Edit3 className="h-4 w-4 mr-2" />
          Edit Task
        </button>
        <button
          onClick={handleDelete}
          className="inline-flex items-center justify-center px-4 py-2 bg-red-100 text-red-800 rounded-lg hover:bg-red-200 font-medium transition-colors focus-visible-ring"
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Delete
        </button>
      </div>
    </div>
  );

  return (
    <>
      <ModalBase
        isOpen={isOpen}
        onClose={onClose}
        title={task.title}
        size="lg"
        footer={footer}
      >
        {/* Status and Priority Badges */}
        <div className="flex flex-wrap items-center gap-3 mb-6">
          <div
            className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium ${priorityInfo.bgColor} ${priorityInfo.color}`}
          >
            <Flag className="h-4 w-4 mr-2" />
            {priorityInfo.label} Priority
          </div>
          <div
            className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium border-2 ${statusInfo.color}`}
          >
            <StatusIcon className="h-4 w-4 mr-2" />
            {statusInfo.label}
          </div>
        </div>

        {/* Description */}
        {task.description && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-card-foreground mb-3 flex items-center">
              <FileText className="h-5 w-5 mr-2 text-muted-foreground" />
              Description
            </h3>
            <div className="bg-muted rounded-lg p-4">
              <p className="text-card-foreground leading-relaxed whitespace-pre-wrap">
                {task.description}
              </p>
            </div>
          </div>
        )}

        {/* Key Information Grid */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-card-foreground mb-4">
            Task Information
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Customer */}
            <div className="bg-muted rounded-lg p-4">
              <div className="flex items-center mb-2">
                <User className="h-5 w-5 text-muted-foreground mr-2" />
                <span className="text-sm font-medium text-muted-foreground">
                  Customer
                </span>
              </div>
              <p className="text-card-foreground font-medium">
                {task.customer || "No customer assigned"}
              </p>
            </div>

            {/* Due Date */}
            <div className="bg-muted rounded-lg p-4">
              <div className="flex items-center mb-2">
                <Calendar className="h-5 w-5 text-muted-foreground mr-2" />
                <span className="text-sm font-medium text-muted-foreground">
                  Due Date
                </span>
              </div>
              <p
                className={`font-medium ${
                  task.dueDate && statusInfo.status === "overdue"
                    ? "text-red-600"
                    : "text-card-foreground"
                }`}
              >
                {formatDate(task.dueDate)}
              </p>
            </div>

            {/* Status */}
            <div className="bg-muted rounded-lg p-4">
              <div className="flex items-center mb-2">
                <StatusIcon className="h-5 w-5 text-muted-foreground mr-2" />
                <span className="text-sm font-medium text-muted-foreground">
                  Status
                </span>
              </div>
              <p className="text-card-foreground font-medium">
                {statusInfo.label}
              </p>
            </div>

            {/* Priority */}
            <div className="bg-muted rounded-lg p-4">
              <div className="flex items-center mb-2">
                <Flag className="h-5 w-5 text-muted-foreground mr-2" />
                <span className="text-sm font-medium text-muted-foreground">
                  Priority
                </span>
              </div>
              <p className={`font-medium ${priorityInfo.color}`}>
                {priorityInfo.label}
              </p>
            </div>
          </div>
        </div>

        {/* Timeline */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-card-foreground mb-4">
            Timeline
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2 border-b border-border">
              <div className="flex items-center">
                <Plus className="h-4 w-4 text-green-600 mr-3" />
                <span className="text-sm font-medium text-muted-foreground">
                  Created
                </span>
              </div>
              <span className="text-sm text-card-foreground">
                {createdDate}
              </span>
            </div>

            <div className="flex items-center justify-between py-2">
              <div className="flex items-center">
                <Edit3 className="h-4 w-4 text-blue-600 mr-3" />
                <span className="text-sm font-medium text-muted-foreground">
                  Last Updated
                </span>
              </div>
              <span className="text-sm text-card-foreground">
                {updatedDate}
              </span>
            </div>
          </div>
        </div>

        {/* Task ID */}
        <div className="bg-muted rounded-lg p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">
              Task ID
            </span>
            <code className="text-sm font-mono text-card-foreground bg-background px-2 py-1 rounded border">
              {task.id}
            </code>
          </div>
        </div>
      </ModalBase>

      {/* Edit Dialog */}
      <TaskFormDialog
        isOpen={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        task={task}
      />

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Task"
        message={`Are you sure you want to delete "${task.title}"? This action cannot be undone.`}
        confirmText="Delete Task"
        variant="danger"
      />
    </>
  );
}
