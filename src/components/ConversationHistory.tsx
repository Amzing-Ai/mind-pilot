"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageSquare,
  Clock,
  Copy,
  Trash2,
  ChevronRight,
  Search,
  CheckCircle,
  Loader2
} from "lucide-react";
import { toast } from "sonner";

interface Conversation {
  id: string;
  title: string;
  userInput: string;
  taskCount?: number;
  listName?: string;
  createdAt: string;
  updatedAt: string;
}

interface ConversationHistoryProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectConversation: (conversation: Conversation) => void;
}

export default function ConversationHistory({
  isOpen,
  onClose,
  onSelectConversation
}: ConversationHistoryProps) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredConversations, setFilteredConversations] = useState<Conversation[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // 获取对话历史
  const fetchConversations = async (pageNum = 1, reset = false) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/conversations?page=${pageNum}&limit=10`);
      const data = await response.json();

      if (response.ok) {
        if (reset) {
          setConversations(data.conversations as Conversation[]);
        } else {
          setConversations(prev => [...prev, ...(data.conversations as Conversation[])]);
        }
        setHasMore(data.pagination.page < data.pagination.totalPages);
      } else {
        toast.error("获取对话历史失败");
      }
    } catch (error) {
      console.error("获取对话历史失败:", error);
      toast.error("获取对话历史失败");
    } finally {
      setLoading(false);
    }
  };

  // 删除对话
  const deleteConversation = async (id: string) => {
    try {
      const response = await fetch(`/api/conversations/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setConversations(prev => prev.filter(conv => conv.id !== id));
        setFilteredConversations(prev => prev.filter(conv => conv.id !== id));
        toast.success("对话已删除");
      } else {
        toast.error("删除对话失败");
      }
    } catch (error) {
      console.error("删除对话失败:", error);
      toast.error("删除对话失败");
    }
  };

  // 复制对话内容
  const copyConversation = async (conversation: Conversation) => {
    try {
      const content = `标题: ${conversation.title}\n\n用户输入: ${conversation.userInput}`;
      await navigator.clipboard.writeText(content);
      toast.success("对话内容已复制到剪贴板");
    } catch (error) {
      console.error("复制失败:", error);
      toast.error("复制失败");
    }
  };

  // 搜索过滤
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredConversations(conversations);
    } else {
      const filtered = conversations.filter(conv =>
        conv.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        conv.userInput.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredConversations(filtered);
    }
  }, [conversations, searchTerm]);

  // 初始加载
  useEffect(() => {
    if (isOpen) {
      void fetchConversations(1, true);
      setPage(1);
    }
  }, [isOpen]);

  // 加载更多
  const loadMore = () => {
    if (!loading && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      void fetchConversations(nextPage, false);
    }
  };

  // 格式化时间
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

    if (diffInHours < 1) {
      return "刚刚";
    } else if (diffInHours < 24) {
      return `${diffInHours}小时前`;
    } else if (diffInHours < 48) {
      return "昨天";
    } else {
      return date.toLocaleDateString("zh-CN");
    }
  };

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
                  <div className="rounded-xl bg-white/20 p-2">
                    <MessageSquare className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">对话历史</h3>
                    <p className="text-indigo-100">查看和管理您的AI对话记录</p>
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

            {/* Search Bar */}
            <div className="p-6 border-b bg-gray-50 flex-shrink-0">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="搜索对话标题或内容..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 bg-white focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-400/50 transition-all duration-200"
                />
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6">
              {loading && conversations.length === 0 ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-6 w-6 animate-spin text-indigo-500" />
                  <span className="ml-2 text-gray-600">加载对话历史中...</span>
                </div>
              ) : filteredConversations.length === 0 ? (
                <div className="text-center py-12">
                  <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <h4 className="text-lg font-semibold text-gray-600 mb-2">
                    {searchTerm ? "未找到匹配的对话" : "暂无对话记录"}
                  </h4>
                  <p className="text-gray-500">
                    {searchTerm ? "尝试使用其他关键词搜索" : "开始与AI助手对话来创建记录"}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredConversations.map((conversation, index) => (
                    <motion.div
                      key={conversation.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="group bg-white rounded-xl border border-gray-200 hover:border-indigo-300 hover:shadow-lg transition-all duration-200 p-4 sm:p-5"
                    >
                      {/* 顶部：标题和任务数量 */}
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-gray-900 text-base sm:text-lg flex-1 min-w-0 pr-3 truncate">
                          {conversation.title}
                        </h4>
                        {conversation.taskCount && (
                          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-green-100 text-green-700 text-sm font-medium flex-shrink-0">
                            <CheckCircle className="h-4 w-4" />
                            {conversation.taskCount}个任务
                          </span>
                        )}
                      </div>

                      {/* 清单名称 */}
                      {conversation.listName && (
                        <div className="mb-3">
                          <div className="flex items-center gap-2">
                            <span className="w-2 h-2 bg-indigo-500 rounded-full flex-shrink-0"></span>
                            <span className="text-sm text-gray-600 truncate">{conversation.listName}</span>
                          </div>
                        </div>
                      )}

                      {/* 中间：内容预览 */}
                      <div className="mb-4">
                        <p className="text-gray-600 text-sm leading-relaxed line-clamp-3">
                          {conversation.userInput}
                        </p>
                      </div>

                      {/* 底部：时间和操作按钮 */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <Clock className="h-3 w-3" />
                          {formatTime(conversation.createdAt)}
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => copyConversation(conversation)}
                            className="p-2 text-gray-400 hover:text-indigo-500 hover:bg-indigo-50 rounded-lg transition-colors"
                            title="复制对话"
                          >
                            <Copy className="h-4 w-4" />
                          </button>

                          <button
                            onClick={() => onSelectConversation(conversation)}
                            className="p-2 text-gray-400 hover:text-indigo-500 hover:bg-indigo-50 rounded-lg transition-colors"
                            title="查看详情"
                          >
                            <ChevronRight className="h-4 w-4" />
                          </button>

                          <button
                            onClick={() => deleteConversation(conversation.id)}
                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                            title="删除对话"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}

                  {/* Load More Button */}
                  {hasMore && (
                    <div className="text-center pt-4">
                      <button
                        onClick={loadMore}
                        disabled={loading}
                        className="px-6 py-3 bg-indigo-500 text-white rounded-xl hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        {loading ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin inline mr-2" />
                            加载中...
                          </>
                        ) : (
                          "加载更多"
                        )}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
