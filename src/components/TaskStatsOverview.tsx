"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ClipboardList,
  Clock,
  Play,
  CheckCircle,
  TrendingUp,
  Plus
} from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";
import FloatingCreateListForm from "./FloatingCreateListForm";

interface TaskStats {
  total: number;
  pending: number;
  inProgress: number;
  completed: number;
}

interface TaskStatsOverviewProps {
  stats: TaskStats;
}

export default function TaskStatsOverview({ stats }: TaskStatsOverviewProps) {
  const [showCreateForm, setShowCreateForm] = useState(false);

  const statCards = [
    {
      title: "全部任务",
      value: stats.total,
      icon: ClipboardList,
      bgColor: "bg-gradient-to-br from-blue-500 to-blue-600",
      textColor: "text-white",
      iconColor: "text-white",
      iconBg: "bg-white/20"
    },
    {
      title: "待处理",
      value: stats.pending,
      icon: Clock,
      bgColor: "bg-orange-500",
      textColor: "text-white",
      iconColor: "text-orange-200",
      iconBg: "bg-orange-400"
    },
    {
      title: "进行中",
      value: stats.inProgress,
      icon: Play,
      bgColor: "bg-purple-500",
      textColor: "text-white",
      iconColor: "text-purple-200",
      iconBg: "bg-purple-400"
    },
    {
      title: "已完成",
      value: stats.completed,
      icon: CheckCircle,
      bgColor: "bg-green-500",
      textColor: "text-white",
      iconColor: "text-green-200",
      iconBg: "bg-green-400"
    }
  ];

  return (
    <div className="w-full">
      {/* Header Section */}
      <motion.div
        className="mb-6"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <motion.div
              className="p-2 bg-blue-100 rounded-full"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            >
              <TrendingUp className="w-5 h-5 text-blue-600" />
            </motion.div>
            <h1 className="text-2xl font-bold text-white">任务详情</h1>
          </div>

          {/* Create Button */}
          <Button
            onClick={() => setShowCreateForm(true)}
            size="sm"
            className="h-8 w-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 shadow-lg"
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>
        <p className="text-gray-300 text-sm">
          管理和跟踪您的所有任务进度
        </p>
      </motion.div>

      {/* Stats Grid - Compact Layout */}
      <motion.div
        className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 mb-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.6 }}
      >
        {statCards.map((stat, index) => {
          const IconComponent = stat.icon;
          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + index * 0.1, duration: 0.5 }}
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
            >
              <Card className={`${stat.bgColor} backdrop-blur-md bg-opacity-80 border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105`}>
                <CardContent className="px-2 py-1.5">
                  <div className="flex items-center gap-1.5">
                    <motion.div
                      className={`p-2 rounded-full ${stat.iconBg} shadow-sm`}
                      initial={{ rotate: -180, scale: 0 }}
                      animate={{ rotate: 0, scale: 1 }}
                      transition={{ delay: 0.5 + index * 0.1, duration: 0.6, type: "spring", stiffness: 200 }}
                    >
                      <IconComponent className={`w-5 h-5 ${stat.iconColor}`} />
                    </motion.div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-white opacity-90 truncate">
                        {stat.title}
                      </p>
                      <motion.p
                        className="text-lg font-bold text-white"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.6 + index * 0.1, type: "spring", stiffness: 200 }}
                      >
                        {stat.value}
                      </motion.p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Floating Create Form */}
      {showCreateForm && (
        <FloatingCreateListForm
          onClose={() => setShowCreateForm(false)}
        />
      )}
    </div>
  );
}
