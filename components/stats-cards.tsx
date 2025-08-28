"use client";

import { useEffect, useState } from "react";
import { Clock, AlertTriangle, Calendar, TrendingUp } from "lucide-react";
import { useTaskStore } from "@/lib/store/tasks";

export function StatsCards() {
  const [mounted, setMounted] = useState(false);

  // Use stable selector - access computed taskStats directly
  const taskStats = useTaskStore((state) => state.taskStats);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    // SSR-safe loading state
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="bg-white rounded-lg border border-gray-200 p-4 animate-pulse"
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="h-4 w-16 bg-gray-200 rounded mb-2"></div>
                <div className="h-8 w-8 bg-gray-200 rounded"></div>
              </div>
              <div className="h-12 w-12 bg-gray-100 rounded-lg"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  const stats = [
    {
      title: "Pending",
      value: taskStats.pending,
      icon: Clock,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200",
    },
    {
      title: "Overdue",
      value: taskStats.overdue,
      icon: AlertTriangle,
      color: "text-red-600",
      bgColor: "bg-red-50",
      borderColor: "border-red-200",
    },
    {
      title: "Due Today",
      value: taskStats.dueToday,
      icon: Calendar,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
      borderColor: "border-orange-200",
    },
    {
      title: "Approaching Breach",
      value: taskStats.approachingBreach,
      icon: TrendingUp,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      borderColor: "border-purple-200",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <div
            key={stat.title}
            className={`
              bg-white rounded-lg border-2 p-4 transition-all hover:shadow-md
              ${stat.borderColor}
            `}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  {stat.title}
                </p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
              <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                <Icon className={`h-6 w-6 ${stat.color}`} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
