"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Clock,
  Play,
  CheckCircle,
  Pause,
  X,
  Calendar,
  Tag
} from "lucide-react";
import { useState } from "react";
import { updateTaskStatus } from "@/actions/taskDashboard";
import { toast } from "sonner";
import dayjs from "dayjs";

interface TaskCardProps {
  task: {
    id: number;
    content: string;
    status: string;
    priority: string;
    expiresAt: Date | null;
    createdAt: Date;
    userId: string;
    done: boolean;
    startTime: Date | null;
    ListId: number;
    list: {
      name: string;
      color: string;
    };
  };
  onStatusUpdate?: (taskId: number, newStatus: string) => void;
}

const statusConfig = {
  pending: {
    label: "待处理",
    icon: Clock,
    color: "bg-orange-500",
    textColor: "text-orange-100",
    iconColor: "text-orange-200"
  },
  in_progress: {
    label: "进行中",
    icon: Play,
    color: "bg-purple-500",
    textColor: "text-purple-100",
    iconColor: "text-purple-200"
  },
  completed: {
    label: "已完成",
    icon: CheckCircle,
    color: "bg-green-500",
    textColor: "text-green-100",
    iconColor: "text-green-200"
  },
  paused: {
    label: "暂停",
    icon: Pause,
    color: "bg-yellow-500",
    textColor: "text-yellow-100",
    iconColor: "text-yellow-200"
  },
  cancelled: {
    label: "取消",
    icon: X,
    color: "bg-red-500",
    textColor: "text-red-100",
    iconColor: "text-red-200"
  }
};

const priorityConfig = {
  urgent: { label: "紧急", color: "bg-red-500" },
  high: { label: "高", color: "bg-orange-500" },
  medium: { label: "中", color: "bg-blue-500" },
  low: { label: "低", color: "bg-gray-500" }
};

export default function TaskCard({ task, onStatusUpdate }: TaskCardProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [progress, setProgress] = useState(
    task.status === 'completed' ? 100 :
    task.status === 'in_progress' ? 65 :
    task.status === 'paused' ? 30 : 0
  );

  // 当任务状态更新时，自动更新进度条
  const updateProgress = (status: string) => {
    switch (status) {
      case 'completed':
        setProgress(100);
        break;
      case 'in_progress':
        setProgress(65);
        break;
      case 'paused':
        setProgress(30);
        break;
      case 'pending':
        setProgress(0);
        break;
      default:
        setProgress(0);
    }
  };

  const statusInfo = statusConfig[task.status as keyof typeof statusConfig] || statusConfig.pending;
  const priorityInfo = priorityConfig[task.priority as keyof typeof priorityConfig] || priorityConfig.medium;
  const StatusIcon = statusInfo.icon;

  const handleStatusUpdate = async (newStatus: string) => {
    setIsUpdating(true);
    try {
      await updateTaskStatus(task.id, newStatus);

      // 立即更新本地进度条
      updateProgress(newStatus);

      toast.success(`任务状态已更新为${statusConfig[newStatus as keyof typeof statusConfig]?.label}`);

      // 通知父组件状态已更新
      onStatusUpdate?.(task.id, newStatus);
    } catch (error) {
      toast.error("更新任务状态失败");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleProgressChange = (newProgress: number) => {
    setProgress(newProgress);
    // 这里可以调用API更新进度
  };

  const isOverdue = task.expiresAt && new Date() > task.expiresAt;
  const daysUntilExpiry = task.expiresAt ? dayjs(task.expiresAt).diff(dayjs(), 'day') : null;

  return (
    <Card className="bg-white/10 backdrop-blur-lg border border-white/30 shadow-xl hover:shadow-2xl transition-all duration-300 hover:bg-white/20 hover:border-white/50 hover:backdrop-blur-xl">
      <CardContent className="px-3 py-2">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className={`p-1.5 rounded-full ${statusInfo.color}`}>
              <StatusIcon className={`w-4 h-4 ${statusInfo.iconColor}`} />
            </div>
            <Badge
              variant="secondary"
              className={`${statusInfo.color} ${statusInfo.textColor} border-0 backdrop-blur-sm bg-opacity-80`}
            >
              {statusInfo.label}
            </Badge>
          </div>
          <Badge
            variant="outline"
            className={`${priorityInfo.color} text-white border-0 backdrop-blur-sm bg-opacity-80`}
          >
            {priorityInfo.label}
          </Badge>
        </div>

        {/* Task Content */}
        <div className="mb-4">
          <h3 className="text-white font-medium text-sm mb-2 line-clamp-2">
            {task.content}
          </h3>

          {/* Progress Bar */}
          <div className="mb-3">
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs text-gray-300">进度</span>
              <span className="text-xs text-gray-300">{progress}%</span>
            </div>
            <Progress
              value={progress}
              className="h-2 bg-gray-600/50"
            />
          </div>

          {/* Due Date */}
          {task.expiresAt && (
            <div className="flex items-center gap-2 mb-3">
              <Calendar className="w-4 h-4 text-gray-400" />
              <span className={`text-xs ${
                isOverdue ? 'text-red-400' :
                daysUntilExpiry !== null && daysUntilExpiry <= 1 ? 'text-orange-400' :
                'text-gray-300'
              }`}>
                {dayjs(task.expiresAt).format("YYYY-MM-DD")}
                {isOverdue && " (已过期)"}
                {daysUntilExpiry !== null && daysUntilExpiry <= 1 && !isOverdue && " (即将到期)"}
              </span>
            </div>
          )}

          {/* Tags - Hidden for now */}
          {/* <div className="flex items-center gap-2 mb-3">
            <Tag className="w-4 h-4 text-gray-400" />
            <div className="flex gap-1">
              <Badge variant="outline" className="text-xs px-2 py-0.5 border-gray-600 text-gray-300">
                工作
              </Badge>
              <Badge variant="outline" className="text-xs px-2 py-0.5 border-gray-600 text-gray-300">
                报告
              </Badge>
            </div>
          </div> */}
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          {task.status !== 'completed' && (
            <Button
              size="sm"
              variant="outline"
              className="flex-1 text-xs border-white/40 text-white backdrop-blur-sm bg-white/10 hover:bg-white/20 hover:border-white/60 hover:backdrop-blur-md transition-all duration-300"
              onClick={() => handleStatusUpdate('completed')}
              disabled={isUpdating}
            >
              <CheckCircle className="w-3 h-3 mr-1" />
              完成
            </Button>
          )}

          {task.status === 'pending' && (
            <Button
              size="sm"
              variant="outline"
              className="flex-1 text-xs border-white/40 text-white backdrop-blur-sm bg-white/10 hover:bg-white/20 hover:border-white/60 hover:backdrop-blur-md transition-all duration-300"
              onClick={() => handleStatusUpdate('in_progress')}
              disabled={isUpdating}
            >
              <Play className="w-3 h-3 mr-1" />
              开始
            </Button>
          )}

          {task.status === 'in_progress' && (
            <Button
              size="sm"
              variant="outline"
              className="flex-1 text-xs border-white/40 text-white backdrop-blur-sm bg-white/10 hover:bg-white/20 hover:border-white/60 hover:backdrop-blur-md transition-all duration-300"
              onClick={() => handleStatusUpdate('paused')}
              disabled={isUpdating}
            >
              <Pause className="w-3 h-3 mr-1" />
              暂停
            </Button>
          )}

          {task.status === 'paused' && (
            <Button
              size="sm"
              variant="outline"
              className="flex-1 text-xs border-white/40 text-white backdrop-blur-sm bg-white/10 hover:bg-white/20 hover:border-white/60 hover:backdrop-blur-md transition-all duration-300"
              onClick={() => handleStatusUpdate('in_progress')}
              disabled={isUpdating}
            >
              <Play className="w-3 h-3 mr-1" />
              继续
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
