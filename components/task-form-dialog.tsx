"use client";

import React, { useEffect, useRef, useState } from "react";
import { X, Calendar, User, Flag, Save, AlertCircle } from "lucide-react";
import { useTaskStore } from "@/lib/store/tasks";
import { CreateTaskSchema, UpdateTaskSchema } from "@/lib/schemas/task";
import type { Task, TaskStatus, TaskPriority } from "@/types/task";
import { z } from "zod";

interface TaskFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  task?: Task; // If provided, edit mode; if not, create mode
}

type FormData = {
  title: string;
  description: string;
  dueDate: string; // YYYY-MM-DD (date input)
  status: TaskStatus;
  priority: TaskPriority;
  customer: string;
};

type FormErrors = Partial<Record<keyof FormData, string>>;

const statusOptions: { value: TaskStatus; label: string }[] = [
  { value: "pending", label: "Pending" },
  { value: "in_progress", label: "In Progress" },
  { value: "completed", label: "Completed" },
];

const priorityOptions: { value: TaskPriority; label: string }[] = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
  { value: "urgent", label: "Urgent" },
];

export function TaskFormDialog({ isOpen, onClose, task }: TaskFormDialogProps) {
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const titleInputRef = useRef<HTMLInputElement | null>(null);

  const { addTask, updateTask } = useTaskStore();

  const [formData, setFormData] = useState<FormData>({
    title: "",
    description: "",
    dueDate: "",
    status: "pending",
    priority: "medium",
    customer: "",
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isEditMode = Boolean(task);

  // Initialize form data when dialog opens
  useEffect(() => {
    if (isOpen) {
      if (task) {
        // Edit mode - populate with existing task data
        setFormData({
          title: task.title,
          description: task.description || "",
          dueDate: task.dueDate ? task.dueDate.split("T")[0] : "",
          status: task.status,
          priority: task.priority,
          customer: task.customer || "",
        });
      } else {
        // Create mode - reset to defaults
        setFormData({
          title: "",
          description: "",
          dueDate: "",
          status: "pending",
          priority: "medium",
          customer: "",
        });
      }
      setErrors({});
      setIsSubmitting(false);

      // Focus title input after a brief delay
      setTimeout(() => {
        titleInputRef.current?.focus();
      }, 100);
    }
  }, [isOpen, task]);

  // Handle ESC key to close
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  // Prevent body scroll when dialog is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  // More flexible typing: accept any value (selects give string), then cast.
  const handleInputChange = (field: keyof FormData, value: unknown) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value as FormData[typeof field],
    }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const schema = isEditMode ? UpdateTaskSchema : CreateTaskSchema;

    const dataToValidate = {
      ...formData,
      dueDate: formData.dueDate
        ? new Date(formData.dueDate).toISOString()
        : undefined,
      ...(isEditMode && { id: task!.id }),
    };

    try {
      schema.parse(dataToValidate);
      setErrors({});
      return true;
    } catch (error) {
      // Proper zod handling: use .issues and typed ZodIssue
      if (error instanceof z.ZodError) {
        const newErrors: FormErrors = {};
        error.issues.forEach((issue: z.ZodIssue) => {
          const field = issue.path[0] as keyof FormData;
          if (field) {
            newErrors[field] = issue.message;
          }
        });
        setErrors(newErrors);
      } else {
        console.error("Unexpected validation error:", error);
      }
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const submitData = {
        ...formData,
        dueDate: formData.dueDate
          ? new Date(formData.dueDate).toISOString()
          : undefined,
      };

      if (isEditMode && task) {
        updateTask({
          id: task.id,
          ...submitData,
        } as Task);
      } else {
        addTask(submitData as FormData);
      }

      onClose();
    } catch (error) {
      console.error("Failed to save task:", error);
      // Real app: show toast or inline error
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm transition-opacity duration-200"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="dialog-title"
    >
      <div
        ref={dialogRef}
        // responsive widths + simple scale/opacity transition for open state
        className="bg-white rounded-lg shadow-xl w-full max-w-md sm:max-w-md md:max-w-lg lg:max-w-xl max-h-[90vh] overflow-y-auto transform transition-all duration-200 ease-out scale-100 opacity-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 id="dialog-title" className="text-lg font-semibold text-gray-900">
            {isEditMode ? "Edit Task" : "Create New Task"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-2 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500"
            aria-label="Close dialog"
            title="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Title */}
          <div>
            <label
              htmlFor="title"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Title *
            </label>
            <input
              ref={titleInputRef}
              id="title"
              type="text"
              value={formData.title}
              onChange={(e) => handleInputChange("title", e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg transition-shadow duration-150 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.title ? "border-red-300" : "border-gray-300"
              }`}
              placeholder="Enter task title..."
              aria-describedby={errors.title ? "title-error" : undefined}
            />
            {errors.title && (
              <p
                id="title-error"
                className="mt-1 text-sm text-red-600 flex items-center"
              >
                <AlertCircle className="h-4 w-4 mr-1" />
                {errors.title}
              </p>
            )}
          </div>

          {/* Description */}
          <div>
            <label
              htmlFor="description"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Description
            </label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg transition-shadow duration-150 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Add a description..."
            />
          </div>

          {/* Customer */}
          <div>
            <label
              htmlFor="customer"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Customer
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                id="customer"
                type="text"
                value={formData.customer}
                onChange={(e) => handleInputChange("customer", e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg transition-shadow duration-150 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter customer name..."
              />
            </div>
          </div>

          {/* Due Date */}
          <div>
            <label
              htmlFor="dueDate"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Due Date
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                id="dueDate"
                type="date"
                value={formData.dueDate}
                onChange={(e) => handleInputChange("dueDate", e.target.value)}
                className={`w-full pl-10 pr-3 py-2 border rounded-lg transition-shadow duration-150 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.dueDate ? "border-red-300" : "border-gray-300"
                }`}
                aria-describedby={errors.dueDate ? "dueDate-error" : undefined}
              />
            </div>
            {errors.dueDate && (
              <p
                id="dueDate-error"
                className="mt-1 text-sm text-red-600 flex items-center"
              >
                <AlertCircle className="h-4 w-4 mr-1" />
                {errors.dueDate}
              </p>
            )}
          </div>

          {/* Status and Priority Row */}
          <div className="grid grid-cols-2 gap-4">
            {/* Status */}
            <div>
              <label
                htmlFor="status"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Status
              </label>
              <select
                id="status"
                value={formData.status}
                onChange={(e) =>
                  handleInputChange("status", e.target.value as TaskStatus)
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg transition-shadow duration-150 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {statusOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Priority */}
            <div>
              <label
                htmlFor="priority"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Priority
              </label>
              <div className="relative">
                <Flag className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <select
                  id="priority"
                  value={formData.priority}
                  onChange={(e) =>
                    handleInputChange(
                      "priority",
                      e.target.value as TaskPriority
                    )
                  }
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg transition-shadow duration-150 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none"
                >
                  {priorityOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  {isEditMode ? "Update Task" : "Create Task"}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
