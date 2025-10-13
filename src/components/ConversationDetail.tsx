"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Copy,
  MessageSquare,
  Bot,
  User,
  Calendar,
  CheckCircle,
  Loader2,
  Download
} from "lucide-react";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";

interface ConversationDetail {
  id: string;
  title: string;
  userInput: string;
  aiResponse: string;
  taskCount?: number;
  listName?: string;
  createdAt: string;
  updatedAt: string;
}

interface ConversationDetailProps {
  conversationId: string | null;
  isOpen: boolean;
  onClose: () => void;
  onBack: () => void;
}

export default function ConversationDetail({
  conversationId,
  isOpen,
  onClose,
  onBack
}: ConversationDetailProps) {
  const [conversation, setConversation] = useState<ConversationDetail | null>(null);
  const [loading, setLoading] = useState(false);

  // 获取对话详情
  const fetchConversationDetail = async () => {
    if (!conversationId) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/conversations/${conversationId}`);
      const data = await response.json();

      if (response.ok) {
        setConversation(data);
      } else {
        toast.error("获取对话详情失败");
        onClose();
      }
    } catch (error) {
      console.error("获取对话详情失败:", error);
      toast.error("获取对话详情失败");
      onClose();
    } finally {
      setLoading(false);
    }
  };

  // 复制对话内容
  const copyConversation = () => {
    if (!conversation) return;

    const content = `# ${conversation.title}\n\n## 用户输入\n${conversation.userInput}\n\n## AI回复\n${conversation.aiResponse}`;
    navigator.clipboard.writeText(content);
    toast.success("对话内容已复制到剪贴板");
  };

  // 导出对话
  const exportConversation = () => {
    if (!conversation) return;

    const content = `# ${conversation.title}\n\n**创建时间**: ${new Date(conversation.createdAt).toLocaleString('zh-CN')}\n\n## 用户输入\n${conversation.userInput}\n\n## AI回复\n${conversation.aiResponse}`;

    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${conversation.title}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast.success("对话已导出");
  };

  // 格式化时间
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  useEffect(() => {
    if (isOpen && conversationId) {
      fetchConversationDetail();
    }
  }, [isOpen, conversationId]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-2 sm:p-4 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="relative max-h-[85vh] sm:max-h-[80vh] w-full max-w-4xl overflow-hidden rounded-3xl bg-white shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-indigo-500 to-purple-500 p-6 flex-shrink-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <button
                    onClick={onBack}
                    className="rounded-full bg-white/20 p-2 text-white hover:bg-white/30 transition-colors"
                  >
                    <ArrowLeft className="h-5 w-5" />
                  </button>
                  <div className="rounded-xl bg-white/20 p-2">
                    <MessageSquare className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">对话详情</h3>
                    <p className="text-indigo-100">查看完整的对话内容</p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="rounded-full bg-white/20 p-2 text-white hover:bg-white/30 transition-colors"
                >
                  ×
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-6 w-6 animate-spin text-indigo-500" />
                  <span className="ml-2 text-gray-600">加载对话详情中...</span>
                </div>
              ) : conversation ? (
                <div className="space-y-6">
                  {/* 对话信息 */}
                  <div className="bg-gray-50 rounded-xl p-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-3">
                      <h4 className="text-lg font-semibold text-gray-900">
                        {conversation.title}
                      </h4>
                      <div className="flex flex-wrap items-center gap-2">
                        {conversation.taskCount && (
                          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-green-100 text-green-700 text-sm">
                            <CheckCircle className="h-4 w-4" />
                            {conversation.taskCount}个任务
                          </span>
                        )}
                        {conversation.listName && (
                          <span className="px-3 py-1 rounded-full bg-indigo-100 text-indigo-700 text-sm">
                            {conversation.listName}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {formatTime(conversation.createdAt)}
                      </div>
                    </div>
                  </div>

                  {/* 用户输入 */}
                  <div className="bg-blue-50 rounded-xl p-4 sm:p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="rounded-lg bg-blue-500 p-2">
                        <User className="h-5 w-5 text-white" />
                      </div>
                      <h5 className="font-semibold text-blue-800">用户输入</h5>
                    </div>
                    <div className="text-gray-700 leading-relaxed whitespace-pre-wrap break-words">
                      {conversation.userInput}
                    </div>
                  </div>

                  {/* AI回复 */}
                  <div className="bg-green-50 rounded-xl p-4 sm:p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="rounded-lg bg-green-500 p-2">
                        <Bot className="h-5 w-5 text-white" />
                      </div>
                      <h5 className="font-semibold text-green-800">AI回复</h5>
                    </div>
                    <div className="prose prose-sm max-w-none text-gray-700 break-words">
                      <ReactMarkdown>
                        {conversation.aiResponse}
                      </ReactMarkdown>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <h4 className="text-lg font-semibold text-gray-600 mb-2">
                    对话不存在
                  </h4>
                  <p className="text-gray-500">
                    该对话可能已被删除或不存在
                  </p>
                </div>
              )}
            </div>

            {/* Footer */}
            {conversation && (
              <div className="border-t bg-gray-50 p-6 flex-shrink-0">
                <div className="flex flex-col gap-4">
                  <div className="text-sm text-gray-600 mb-2">
                    最后更新: {formatTime(conversation.updatedAt)}
                  </div>
                  <div className="flex justify-center items-center gap-3">
                    <button
                      onClick={copyConversation}
                      className="flex items-center gap-2 px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors"
                    >
                      <Copy className="h-4 w-4" />
                      复制对话
                    </button>
                    <button
                      onClick={exportConversation}
                      className="flex items-center gap-2 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                    >
                      <Download className="h-4 w-4" />
                      导出对话
                    </button>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
