"use client";

import { useChat } from "@ai-sdk/react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bot, Send, Sparkles, Zap, CheckCircle, Lightbulb, Rocket, Target, Clock, TrendingUp, Users, Edit3, Loader2, Plus, Trash2, Flame, Save, ArrowLeft } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { parseTasksFromAIResponse, validateParsedTasks, extractListNameFromAIResponse, extractAISuggestions, extractRiskWarnings, extractAdditionalContent, type ParsedTask } from "@/lib/taskParser";
import { createListAndTasks } from "@/actions/createListAndTasks";
import { toast } from "sonner";
import { TitleTypedDescription } from "@/components/fun-component/Title-typed";
import ConversationHistory from "@/components/ConversationHistory";
import ConversationDetail from "@/components/ConversationDetail";
import { getTodayOverview } from "@/actions/todayOverview";

export default function Chat() {
  const [input, setInput] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [isCreatingTasks, setIsCreatingTasks] = useState(false);
  const [parsedTasks, setParsedTasks] = useState<ParsedTask[]>([]);
  const [extractedListName, setExtractedListName] = useState<string>("");
  const [aiSuggestions, setAiSuggestions] = useState<string>("");
  const [riskWarnings, setRiskWarnings] = useState<string>("");
  const [additionalContent, setAdditionalContent] = useState<string>("");
  const [clickedAction, setClickedAction] = useState<number | null>(null);
  const [taskGenerationMode, setTaskGenerationMode] = useState<'detailed' | 'concise'>('detailed');
  const [showConversationHistory, setShowConversationHistory] = useState(false);
  const [showConversationDetail, setShowConversationDetail] = useState(false);
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [isAIStreaming, setIsAIStreaming] = useState(false);
  const [isWaitingForAI, setIsWaitingForAI] = useState(false);
  const [waitingMessage, setWaitingMessage] = useState("AI正在思考中...");
  const [recentConversations, setRecentConversations] = useState<Array<{
    id: string;
    title: string;
    userInput: string;
    taskCount?: number;
    listName?: string;
    createdAt: string;
  }>>([]);
  const [todayOverview, setTodayOverview] = useState({
    completedToday: 0,
    inProgress: 0,
    pending: 0,
    createdToday: 0,
    completionRate: 0
  });
  const { messages, sendMessage } = useChat();

  // 自动调整textarea高度
  const adjustTextareaHeight = (textarea: HTMLTextAreaElement) => {
    textarea.style.height = 'auto';
    textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
  };

  // 监听input变化，自动调整高度
  useEffect(() => {
    const textarea = document.querySelector('textarea[placeholder*="试试说"]');
    if (textarea instanceof HTMLTextAreaElement) {
      adjustTextareaHeight(textarea);
    }
  }, [input]);

  // 监听消息变化，当有新的AI回复时显示模态框并解析任务
  useEffect(() => {
    if (messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      if (lastMessage && lastMessage.role === "assistant") {
        // 检查AI回复是否还在流式传输中
        const messageContent = lastMessage.parts ?
          lastMessage.parts.map(part => part.type === 'text' ? part.text : '').join('') :
          '';

        // 如果消息内容为空或很短，说明还在流式传输中
        if (!messageContent || messageContent.length < 100) {
          setIsAIStreaming(true);
          return;
        }

        // 检查是否包含任务相关的关键词，确保是完整的回复
        const hasTaskKeywords = messageContent.includes('任务') ||
                               messageContent.includes('清单') ||
                               messageContent.includes('步骤') ||
                               messageContent.includes('计划');

        if (!hasTaskKeywords) {
          setIsAIStreaming(true);
          return;
        }

        // AI回复完成，停止流式状态和等待状态
        setIsAIStreaming(false);
        setIsWaitingForAI(false);

        // 解析AI回复中的任务
        if (messageContent) {
          const tasks = parseTasksFromAIResponse(messageContent);
          const listName = extractListNameFromAIResponse(messageContent);
          const suggestions = extractAISuggestions(messageContent);
          const risks = extractRiskWarnings(messageContent);
          const additional = extractAdditionalContent(messageContent);
          console.log("提取的清单名称:", listName);
          setParsedTasks(tasks);
          setExtractedListName(listName || "AI生成任务");
          setAiSuggestions(suggestions);
          setRiskWarnings(risks);
          setAdditionalContent(additional);

          // 只有在解析到任务后才显示模态框，并添加小延迟确保内容稳定
          if (tasks.length > 0) {
            setTimeout(() => {
              setShowModal(true);
            }, 300); // 300ms延迟，确保AI回复完全稳定
          }
        }
      } else if (lastMessage && lastMessage.role === "user") {
        // 用户发送消息时开始等待AI回复
        setIsWaitingForAI(true);
        setIsAIStreaming(false);
        setShowModal(false);
        setWaitingMessage("AI正在思考中...");
      }
    }
  }, [messages]);

  // 管理等待消息的定时更新
  useEffect(() => {
    if (!isWaitingForAI) return;

    const waitingMessages = [
      "AI正在思考中...",
      "正在分析您的需求...",
      "正在生成任务清单...",
      "即将为您呈现结果..."
    ];

    let messageIndex = 0;
    const messageInterval = setInterval(() => {
      messageIndex = (messageIndex + 1) % waitingMessages.length;
      setWaitingMessage(waitingMessages[messageIndex] ?? "AI正在思考中...");
    }, 2000);

    return () => clearInterval(messageInterval);
  }, [isWaitingForAI]);

  // 获取最近3条对话
  const fetchRecentConversations = async () => {
    try {
      const response = await fetch('/api/conversations?page=1&limit=3');
      const data = await response.json();
      if (data.conversations) {
        setRecentConversations(data.conversations as Array<{
          id: string;
          title: string;
          userInput: string;
          taskCount?: number;
          listName?: string;
          createdAt: string;
        }>);
      }
    } catch (error) {
      console.error('获取最近对话失败:', error);
    }
  };

  // 获取今日概览数据
  const fetchTodayOverview = async () => {
    try {
      const overviewResult = await getTodayOverview();
      if (overviewResult.success && overviewResult.data) {
        setTodayOverview(overviewResult.data);
      }
    } catch (error) {
      console.error('获取今日概览失败:', error);
    }
  };

  // 组件挂载时获取数据
  useEffect(() => {
    void fetchRecentConversations();
    void fetchTodayOverview();
  }, []);

  // 格式化时间显示
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      // 根据任务生成模式添加提示词
      const modePrompt = taskGenerationMode === 'detailed'
        ? '请生成更多更细致的任务，将目标拆解为具体的执行步骤。'
        : '请生成更少更关键的任务，专注于核心要点。';

      const enhancedInput = `${input}\n\n${modePrompt}`;
      void sendMessage({ text: enhancedInput });
      setInput("");
    }
  };

  // 处理任务创建
  const handleQuickAction = (template: string, index: number) => {
    setInput(template);
    setClickedAction(index);

    // 显示成功提示
    toast.success("模板已填入，请根据您的需求修改后发送！", {
      duration: 2000,
      position: "top-center",
    });

    // 显示点击反馈
    setTimeout(() => {
      setClickedAction(null);
    }, 1000);

    // 自动聚焦到输入框并调整高度
    setTimeout(() => {
      const textareaElement = document.querySelector('textarea[placeholder*="试试说"]');
      if (textareaElement instanceof HTMLTextAreaElement) {
        textareaElement.focus();
        textareaElement.setSelectionRange(template.length, template.length);
        adjustTextareaHeight(textareaElement);
      }
    }, 100);
  };

  // 保存对话到数据库
  const saveConversation = async () => {
    if (messages.length === 0) return;

    const lastMessage = messages[messages.length - 1];
    if (lastMessage && lastMessage.role === "assistant") {
      // 找到最后一个用户消息
      const userMessage = messages.filter(msg => msg.role === "user").pop();
      console.log('找到的用户消息:', userMessage);

      const userInput = (userMessage as { content?: string; parts?: Array<{ type: string; text: string }> })?.content ??
        (userMessage as { content?: string; parts?: Array<{ type: string; text: string }> })?.parts?.map((part: { type: string; text: string }) =>
          part.type === 'text' ? part.text : ''
        ).join('') ?? input;

      console.log('提取的用户输入:', userInput);

      const aiResponse = lastMessage.parts ?
        lastMessage.parts.map(part => part.type === 'text' ? part.text : '').join('') : '';

      // 生成对话标题（从用户输入中提取前20个字符）
      const title = userInput.length > 20 ? userInput.substring(0, 20) + '...' : userInput;

      console.log('生成的标题:', title);

      // 确保所有必要字段都有值
      if (!title || !userInput || !aiResponse) {
        console.error('保存对话失败: 缺少必要字段', { title, userInput, aiResponse });
        return;
      }

      try {
        const response = await fetch('/api/conversations', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            title,
            userInput,
            aiResponse,
            taskCount: parsedTasks.length,
            listName: extractedListName || null,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          console.error('保存对话失败:', errorData);
          return;
        }

             console.log('对话保存成功');
             // 保存成功后刷新最近对话列表
             void fetchRecentConversations();
           } catch (error) {
             console.error('保存对话失败:', error);
           }
         }
       };

  const handleCreateTasks = async () => {
    console.log("开始创建任务，解析出的任务:", parsedTasks);

    if (parsedTasks.length === 0) {
      console.log("没有找到可创建的任务");
      toast.error("没有找到可创建的任务");
      return;
    }

    // 验证任务
    const validation = validateParsedTasks(parsedTasks);
    if (!validation.valid) {
      console.log("任务验证失败:", validation.errors);
      toast.error(`任务验证失败: ${validation.errors.join(", ")}`);
      return;
    }

    console.log("开始创建任务，设置loading状态");
    setIsCreatingTasks(true);

    try {
      // 总是创建新的清单
      console.log("创建新清单和任务:", extractedListName);

      const result = await createListAndTasks({
        listName: extractedListName || "AI生成任务",
        listColor: "#3B82F6", // 蓝色
        tasks: parsedTasks,
      });

      if (result.success) {
        toast.success(`成功创建清单"${extractedListName}"和${result.taskCount}个任务！`);

        // 保存对话到数据库
        await saveConversation();

        setShowModal(false);
        setParsedTasks([]);
        setExtractedListName("");
      } else {
        toast.error("创建清单和任务失败，请稍后重试");
      }
    } catch (error) {
      console.error("创建任务失败:", error);
      toast.error(`创建任务失败: ${error instanceof Error ? error.message : '未知错误'}`);
    } finally {
      setIsCreatingTasks(false);
    }
  };

  // 手动修改任务状态
  const [showManualEdit, setShowManualEdit] = useState(false);
  const [editableTasks, setEditableTasks] = useState<Array<{
    id: string;
    content: string;
    priority: string;
    estimatedHours?: number;
    startTime?: Date;
    expiresAt?: Date;
    status: string;
  }>>([]);
  const [editableListName, setEditableListName] = useState("");

  // 打开手动修改模态框
  const handleManualEdit = () => {
    const tasks = parsedTasks.map((task, index) => ({
      id: `task-${Date.now()}-${index}-${Math.random().toString(36).substr(2, 9)}`,
      content: task.content,
      priority: task.priority,
      estimatedHours: task.estimatedHours,
      startTime: task.startTime,
      expiresAt: task.expiresAt,
      status: task.status
    }));

    console.log("当前extractedListName:", extractedListName);
    const listName = extractedListName || "AI生成任务";
    console.log("设置的清单名称:", listName);

    setEditableTasks(tasks);
    setEditableListName(listName);
    setShowManualEdit(true);
  };

  // 手动修改任务相关函数
  const updateEditableTask = (id: string, field: string, value: string | number | Date | undefined) => {
    setEditableTasks(prev => prev.map(task =>
      task.id === id ? { ...task, [field]: value } : task
    ));
  };

  const addEditableTask = () => {
    const newTask = {
      id: `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      content: "",
      priority: "medium",
      estimatedHours: undefined,
      startTime: new Date(),
      expiresAt: undefined,
      status: "pending"
    };
    setEditableTasks(prev => [...prev, newTask]);
  };

  const deleteEditableTask = (id: string) => {
    setEditableTasks(prev => prev.filter(task => task.id !== id));
  };

  const calculateExpiresAt = (estimatedHours: number) => {
    const now = new Date();
    return new Date(now.getTime() + estimatedHours * 60 * 60 * 1000);
  };

  const handleTimeChange = (id: string, hours: number) => {
    const now = new Date();
    updateEditableTask(id, "estimatedHours", hours);
    updateEditableTask(id, "startTime", now);
    updateEditableTask(id, "expiresAt", calculateExpiresAt(hours));
  };

  // 从手动修改模态框创建任务
  const handleCreateFromManualEdit = async () => {
    setIsCreatingTasks(true);
    try {
      const formattedTasks: ParsedTask[] = editableTasks.map(task => ({
        content: task.content,
        priority: task.priority as "low" | "medium" | "high" | "urgent",
        estimatedHours: task.estimatedHours ?? 1,
        startTime: task.startTime,
        expiresAt: task.expiresAt ?? (task.estimatedHours ? calculateExpiresAt(task.estimatedHours) : calculateExpiresAt(1)),
        status: task.status as "pending" | "in_progress" | "completed" | "paused" | "cancelled"
      }));

      const result = await createListAndTasks({
        listName: editableListName || "手动编辑任务",
        listColor: "#3B82F6",
        tasks: formattedTasks,
      });

      if (result.success) {
        const listName = result.listName ?? editableListName ?? "手动编辑任务";
        toast.success(`成功创建清单"${listName}"和${result.taskCount}个任务！`);
        setShowManualEdit(false);
        setShowModal(false);
        setParsedTasks([]);
        setExtractedListName("");
        setEditableTasks([]);
        setEditableListName("");
      } else {
        toast.error("创建清单和任务失败，请稍后重试");
      }
    } catch (error) {
      console.error("创建清单和任务失败:", error);
      toast.error("创建清单和任务失败，请稍后重试");
    } finally {
      setIsCreatingTasks(false);
    }
  };

  const quickActions = [
    {
      icon: Lightbulb,
      label: "创意项目",
      description: "从想法到执行",
      color: "from-orange-500 to-yellow-500",
      template: "我有一个创意想法，想要开发一个[具体项目]，请帮我制定完整的开发计划，包括技术选型、开发阶段、时间安排和资源需求。"
    },
    {
      icon: Rocket,
      label: "学习计划",
      description: "技能提升路径",
      color: "from-pink-500 to-purple-500",
      template: "我想学习[具体技能/技术]，请帮我制定一个3个月的学习计划，包括学习路径、资源推荐、实践项目和里程碑。"
    },
    {
      icon: Target,
      label: "目标管理",
      description: "SMART目标设定",
      color: "from-green-500 to-emerald-500",
      template: "我想在[时间期限]内达成[具体目标]，请帮我制定详细的行动计划，包括关键步骤、时间节点、所需资源和风险应对。"
    },
    {
      icon: Clock,
      label: "时间管理",
      description: "高效时间规划",
      color: "from-blue-500 to-cyan-500",
      template: "我每天有[具体时间]可以用于[具体活动]，请帮我制定一个高效的时间管理方案，包括时间分配、优先级排序和效率提升技巧。"
    },
    {
      icon: TrendingUp,
      label: "效率提升",
      description: "工作流程优化",
      color: "from-indigo-500 to-blue-500",
      template: "我在[具体工作/学习]中效率不高，请帮我分析问题并制定效率提升方案，包括工作方法、工具推荐和习惯养成。"
    },
    {
      icon: Users,
      label: "团队协作",
      description: "团队项目管理",
      color: "from-red-500 to-orange-500",
      template: "我们团队要完成[具体项目]，请帮我制定团队协作计划，包括任务分工、沟通机制、进度跟踪和团队建设。"
    },
  ];

  const latestMessage = messages[messages.length - 1];

  return (
    <div className="h-full w-full bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 overflow-y-auto">
      <div className="w-full min-h-full">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 p-4 text-center"
        >
          <div className="mb-4 flex items-center justify-center gap-3">
            <div className="rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-500 p-3">
              <Bot className="h-8 w-8 text-white" />
            </div>
            <div className="text-left">
              <h1 className="text-2xl font-bold text-white">智慧助手 AI</h1>
              <p className="text-indigo-200">AI 助手</p>
            </div>
          </div>
          <div className="mx-auto max-w-2xl">
            <TitleTypedDescription />
          </div>
        </motion.div>

        {/* Feature Tags */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8 px-4"
        >
          <div className="flex flex-wrap justify-center gap-8 text-center">
            {[
              { icon: Sparkles, text: "AI 智能分析", description: "深度理解需求" },
              { icon: Zap, text: "秒速响应", description: "即时生成方案" },
              { icon: CheckCircle, text: "步骤清晰", description: "可执行计划" },
          ].map((feature, index) => (
              <motion.div
              key={`feature-${index}-${feature.text || 'empty'}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + index * 0.1 }}
                className="flex flex-col items-center gap-2 group"
            >
                <div className="flex items-center gap-2 text-white/90 group-hover:text-white transition-colors duration-200">
                  <feature.icon className="h-5 w-5 text-indigo-300 group-hover:text-indigo-200 transition-colors duration-200" />
                  <span className="text-sm font-medium">{feature.text}</span>
            </div>
                <span className="text-xs text-white/60 group-hover:text-white/80 transition-colors duration-200">
                  {feature.description}
                </span>
              </motion.div>
          ))}
          </div>
        </motion.div>

        {/* Input Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-8 px-4"
        >
          {/* 任务生成模式选择 */}
          <div className="mb-4 flex justify-center">
            <div className="flex rounded-xl bg-white/10 p-1 backdrop-blur">
              <button
                type="button"
                onClick={() => setTaskGenerationMode('detailed')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  taskGenerationMode === 'detailed'
                    ? 'bg-white/20 text-white shadow-lg'
                    : 'text-white/70 hover:text-white hover:bg-white/10'
                }`}
              >
                生成更多更细致的任务
              </button>
              <button
                type="button"
                onClick={() => setTaskGenerationMode('concise')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  taskGenerationMode === 'concise'
                    ? 'bg-white/20 text-white shadow-lg'
                    : 'text-white/70 hover:text-white hover:bg-white/10'
                }`}
              >
                生成更少更关键的任务
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="relative">
            <div className="relative">
              <textarea
                value={input}
                onChange={(e) => {
                  setInput(e.target.value);
                  adjustTextareaHeight(e.target);
                }}
                placeholder="试试说：帮我制定一个完整的产品发布计划..."
                className="w-full min-h-[56px] max-h-[200px] rounded-2xl border border-white/20 bg-white/10 px-6 py-4 pr-16 text-sm text-white placeholder-white/60 backdrop-blur focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-400/50 resize-none overflow-hidden transition-all duration-200"
                disabled={false}
                rows={1}
                style={{
                  height: 'auto',
                  minHeight: '56px',
                  maxHeight: '200px'
                }}
              />
              <motion.button
                type="submit"
                disabled={!input.trim()}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="absolute right-2 bottom-2 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 p-3 text-white disabled:opacity-50 transition-all duration-200"
              >
                <Send className="h-5 w-5" />
              </motion.button>
            </div>
          </form>
        </motion.div>

        {/* Quick Start Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mb-8 px-4"
        >
          <motion.div
            className="mb-6 flex items-center justify-center"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.8 }}
          >
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
            <motion.span
              className="px-4 text-white/60 font-medium"
              whileHover={{ scale: 1.1 }}
              transition={{ duration: 0.2 }}
            >
              ✨ 快速开始
            </motion.span>
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
          </motion.div>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
            {quickActions.map((action, index) => (
              <motion.button
                key={`quick-action-${index}-${action.template.slice(0, 10) || 'empty'}`}
                onClick={() => handleQuickAction(action.template, index)}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}
                whileHover={{
                  scale: 1.05,
                  y: -8,
                  transition: { duration: 0.2 }
                }}
                whileTap={{ scale: 0.95 }}
                className={`group relative overflow-hidden rounded-2xl p-6 text-center backdrop-blur transition-all duration-300 hover:shadow-xl hover:shadow-white/10 ${
                  clickedAction === index
                    ? 'bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-400/50'
                    : 'bg-white/10 hover:bg-white/20'
                }`}
              >
                {/* 背景光效 */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent"
                  initial={{ x: "-100%" }}
                  whileHover={{ x: "100%" }}
                  transition={{ duration: 0.6 }}
                />

                {/* 图标容器 */}
                <motion.div
                  className={`mx-auto mb-3 rounded-2xl bg-gradient-to-r ${action.color} p-5 relative z-10 shadow-xl group-hover:shadow-2xl transition-all duration-300`}
                  whileHover={{ rotate: 3, scale: 1.05 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="flex items-center justify-center">
                    <action.icon className="h-8 w-8 text-white" />
                  </div>

                  {/* 渐变光效 */}
                  <motion.div
                    className="absolute inset-0 rounded-2xl bg-gradient-to-r from-white/0 via-white/10 to-white/0"
                    initial={{ x: "-100%" }}
                    whileHover={{ x: "100%" }}
                    transition={{ duration: 0.6 }}
                  />
                </motion.div>

                {/* 标签和描述 */}
                <div className="relative z-10">
                  <p className="text-sm font-semibold text-white group-hover:text-white/90 mb-1">
                    {action.label}
                  </p>
                  <p className="text-xs text-white/70 group-hover:text-white/80">
                    {action.description}
                  </p>
                </div>

                {/* 悬停时的脉冲效果 */}
                <motion.div
                  className="absolute inset-0 rounded-2xl border border-white/20"
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.2 }}
                />

                {/* 点击成功效果 */}
                {clickedAction === index && (
                  <motion.div
                    className="absolute inset-0 flex items-center justify-center z-50"
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <motion.div
                      className="rounded-full bg-green-500/90 p-3 shadow-lg"
                      animate={{
                        scale: [1, 1.3, 1],
                        rotate: [0, 15, 0]
                      }}
                      transition={{
                        duration: 0.8,
                        repeat: 1
                      }}
                    >
                      <CheckCircle className="h-8 w-8 text-white" />
                    </motion.div>
                  </motion.div>
                )}
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Stats Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="px-4 lg:px-8 grid gap-6 lg:grid-cols-2"
        >
          {/* Today's Overview */}
          <div className="rounded-2xl bg-white/10 p-6 backdrop-blur">
            <div className="mb-4 flex items-center gap-2">
              <div className="rounded-lg bg-gradient-to-r from-indigo-500 to-purple-500 p-2">
                <TrendingUp className="h-5 w-5 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-white">今日概览</h3>
            </div>
            <div className="space-y-3">
              {[
                { label: "已完成", count: `${todayOverview.completedToday}个`, icon: CheckCircle, color: "text-green-400" },
                { label: "进行中", count: `${todayOverview.inProgress}个`, icon: Zap, color: "text-yellow-400" },
                { label: "待处理", count: `${todayOverview.pending}个`, icon: Clock, color: "text-orange-400" },
              ].map((item, index) => (
                <div key={`stats-${index}-${item.label || 'empty'}`} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <item.icon className={`h-4 w-4 ${item.color}`} />
                    <span className="text-white/80">{item.label}</span>
                  </div>
                  <span className="text-white font-medium">{item.count}</span>
                </div>
              ))}
            </div>
            <div className="mt-4">
              <div className="mb-2 flex justify-between text-sm">
                <span className="text-white/80">总体完成率</span>
                <span className="text-white">{todayOverview.completionRate}%</span>
              </div>
              <div className="h-2 rounded-full bg-white/20">
                <div
                  className="h-2 rounded-full bg-gradient-to-r from-green-400 to-emerald-500 transition-all duration-500"
                  style={{ width: `${todayOverview.completionRate}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Recent Conversations */}
          <div className="rounded-2xl bg-white/10 p-6 backdrop-blur">
            <div className="mb-4 flex items-center gap-2">
              <div className="rounded-lg bg-gradient-to-r from-pink-500 to-purple-500 p-2">
                <Bot className="h-5 w-5 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-white">最近对话</h3>
            </div>
            <div className="space-y-3">
              {recentConversations.length > 0 ? (
                recentConversations.map((conversation) => (
                  <div
                    key={conversation.id}
                    className="group cursor-pointer rounded-lg p-3 transition-colors hover:bg-white/10"
                    onClick={() => {
                      setSelectedConversationId(conversation.id);
                      setShowConversationDetail(true);
                    }}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium text-white group-hover:text-indigo-300 truncate">
                          {conversation.title}
                        </h4>
                        <p className="text-xs text-white/60 line-clamp-2 mt-1">
                          {conversation.userInput}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <p className="text-xs text-white/40">{formatTime(conversation.createdAt)}</p>
                          {conversation.taskCount && (
                            <span className="text-xs text-green-300">
                              {conversation.taskCount}个任务
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex-shrink-0">
                        <div className="w-2 h-2 rounded-full bg-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-4">
                  <p className="text-sm text-white/60">暂无对话记录</p>
                  <p className="text-xs text-white/40 mt-1">开始与AI助手对话来创建记录</p>
                </div>
              )}
            </div>
            <button
              onClick={() => setShowConversationHistory(true)}
              className="mt-4 text-sm text-indigo-300 hover:text-indigo-200"
            >
              查看全部对话历史 →
            </button>
          </div>
        </motion.div>
      </div>

      {/* AI回复等待提示 */}
      <AnimatePresence>
        {isWaitingForAI && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="fixed inset-0 flex items-center justify-center z-40 bg-black/20 backdrop-blur-sm"
          >
            <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-gray-200/50 p-6 max-w-sm mx-4">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center shadow-lg">
                    <Bot className="w-5 h-5 text-white" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full animate-pulse shadow-sm"></div>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-800">{waitingMessage}</p>
                  <p className="text-xs text-gray-500 mt-1">请稍候，正在为您生成任务清单</p>
                </div>
              </div>
              <div className="mt-4 flex items-center justify-center gap-2">
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }}></div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating AI Response Modal - 只有在AI回复完全生成且解析到任务后才显示 */}
      <AnimatePresence>
        {showModal && !isAIStreaming && parsedTasks.length > 0 && latestMessage && latestMessage.role === "assistant" && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: 20 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="relative max-h-[80vh] w-full max-w-2xl overflow-hidden rounded-3xl bg-white shadow-2xl flex flex-col"
            >
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-indigo-500 to-purple-500 p-6">
                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-white/20 p-2">
                    <Bot className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">智慧助手回复</h3>
                    <p className="text-indigo-100">AI 智能分析完成</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="absolute right-4 top-4 rounded-full bg-white/20 p-2 text-white hover:bg-white/30 transition-colors"
                >
                  ×
                </button>
              </div>

              {/* Modal Content */}
              <div className="flex-1 overflow-y-auto p-6">
                {/* 只有在AI回复完全生成后才显示内容，避免闪烁 */}
                {!isAIStreaming && parsedTasks.length > 0 && (
                  <>
                    {/* 任务统计卡片 */}
                {parsedTasks.length > 0 && (
                  <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="rounded-lg bg-blue-500 p-2">
                        <span className="text-white text-lg">📋</span>
                      </div>
                      <div>
                        <h4 className="font-bold text-blue-800 text-lg">已为您总结 {parsedTasks.length} 个任务</h4>
                        {extractedListName && (
                          <p className="text-blue-600 text-sm">清单: {extractedListName}</p>
                        )}
                      </div>
                    </div>

                    {/* 任务列表 - 显示全部任务 */}
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {parsedTasks.map((task, index) => (
                        <div key={`task-preview-${index}`} className="flex items-center gap-2 text-sm">
                          <span className="text-blue-600 font-medium text-xs min-w-[20px]">
                            {index + 1}.
                          </span>
                          <span className="text-gray-700 text-xs leading-tight flex-1">
                            {task.content}
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            task.priority === 'urgent' ? 'bg-red-100 text-red-700' :
                            task.priority === 'high' ? 'bg-orange-100 text-orange-700' :
                            task.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-green-100 text-green-700'
                          }`}>
                            {task.priority === 'urgent' ? '紧急' :
                             task.priority === 'high' ? '高' :
                             task.priority === 'medium' ? '中' : '低'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* AI建议和风险提示 */}
                <div className="grid gap-4 md:grid-cols-2">
                  {/* AI建议 */}
                  {aiSuggestions && (
                    <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="rounded-lg bg-green-500 p-2">
                          <Lightbulb className="h-4 w-4 text-white" />
                        </div>
                        <h5 className="font-semibold text-green-800">AI建议</h5>
                      </div>
                      <div className="text-sm text-green-700 leading-relaxed">
                        {aiSuggestions}
                      </div>
                    </div>
                  )}

                  {/* 风险提示 */}
                  {riskWarnings && (
                    <div className="p-4 bg-gradient-to-r from-orange-50 to-red-50 rounded-xl border border-orange-200">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="rounded-lg bg-orange-500 p-2">
                          <span className="text-white text-sm">⚠️</span>
                        </div>
                        <h5 className="font-semibold text-orange-800">可能风险</h5>
                      </div>
                      <div className="text-sm text-orange-700 leading-relaxed">
                        {riskWarnings}
                      </div>
                    </div>
                  )}
                </div>

                {/* 显示其他内容 */}
                {additionalContent && (
                  <div className="mt-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="rounded-lg bg-gray-500 p-2">
                        <span className="text-white text-sm">📄</span>
                      </div>
                      <h5 className="font-semibold text-gray-800">其他信息</h5>
                    </div>
                    <div className="modal-content prose prose-sm max-w-none text-gray-700">
                      <ReactMarkdown>
                        {additionalContent}
                      </ReactMarkdown>
                    </div>
                  </div>
                )}
                  </>
                )}
              </div>

              {/* Modal Footer - 固定在底部 */}
              <div className="border-t bg-gray-50 p-4 sm:p-6 flex-shrink-0">

                <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4">
                  <motion.button
                    whileHover={{ scale: isCreatingTasks ? 1 : 1.05, y: isCreatingTasks ? 0 : -2 }}
                    whileTap={{ scale: isCreatingTasks ? 1 : 0.95 }}
                    onClick={handleCreateTasks}
                    disabled={isCreatingTasks || parsedTasks.length === 0}
                    className={`flex items-center justify-center gap-2 rounded-xl px-4 sm:px-6 py-3 text-white font-medium shadow-lg transition-all duration-200 w-full sm:w-auto ${
                      isCreatingTasks || parsedTasks.length === 0
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600'
                    }`}
                  >
                    {isCreatingTasks ? (
                      <>
                        <Loader2 className="h-4 w-4 sm:h-5 sm:w-5 animate-spin" />
                        <span className="text-sm sm:text-base">创建中...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5" />
                        <span className="text-sm sm:text-base">
                          {extractedListName ? `创建清单和任务 (${parsedTasks.length})` : `创建任务 (${parsedTasks.length})`}
                        </span>
                      </>
                    )}
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleManualEdit}
                    className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-gray-500 to-gray-600 px-4 sm:px-6 py-3 text-white font-medium shadow-lg hover:from-gray-600 hover:to-gray-700 transition-all duration-200 w-full sm:w-auto"
                  >
                    <Edit3 className="h-4 w-4 sm:h-5 sm:w-5" />
                    <span className="text-sm sm:text-base">手动修改任务</span>
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 手动修改模态框 */}
        <AnimatePresence>
          {showManualEdit && (
            <motion.div
              key="manual-edit-modal"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
            >
            <motion.div
              initial={{ scale: 0.8, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: 20 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="relative max-h-[90vh] w-full max-w-4xl overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 shadow-2xl"
            >
              {/* Header */}
              <div className="border-b border-white/10 bg-white/5 backdrop-blur p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-2xl font-bold text-white">手动修改任务</h3>
                    <p className="text-white/70">编辑任务详情，调整优先级和时间</p>
                  </div>
                  <button
                    onClick={() => setShowManualEdit(false)}
                    className="rounded-full bg-white/10 p-2 text-white hover:bg-white/20 transition-colors"
                  >
                    ×
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="max-h-[60vh] overflow-y-auto p-6">
                {/* List Name */}
                <div className="mb-6">
                  <label className="block text-white/80 text-sm font-medium mb-2">清单名称</label>
                  <input
                    type="text"
                    value={editableListName || ""}
                    onChange={(e) => setEditableListName(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-white/20 bg-white/10 text-white placeholder-white/60 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-400/50 transition-all duration-200"
                    placeholder="输入清单名称"
                  />
                </div>

                {/* Tasks */}
                <div className="space-y-4">
                  {editableTasks.map((task, index) => {
                    const taskKey = task.id && task.id.trim() !== ''
                      ? `editable-task-${task.id}-${index}`
                      : `editable-task-new-${index}-${Math.random().toString(36).substr(2, 9)}`;
                    return (
                    <motion.div
                      key={taskKey}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-white/10 rounded-xl p-4 border border-white/15"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="text-white font-medium">任务 {index + 1}</h4>
                        <button
                          onClick={() => deleteEditableTask(task.id)}
                          className="text-white/60 hover:text-red-400 transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-white/80 text-sm font-medium mb-2">任务内容</label>
                          <textarea
                            value={task.content}
                            onChange={(e) => updateEditableTask(task.id, "content", e.target.value)}
                            className="w-full px-4 py-3 rounded-xl border border-white/20 bg-white/10 text-white placeholder-white/60 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-400/50 transition-all duration-200 resize-none"
                            rows={3}
                          />
                        </div>

                        <div>
                          <label className="block text-white/80 text-sm font-medium mb-2">优先级</label>
                          <select
                            value={task.priority}
                            onChange={(e) => updateEditableTask(task.id, "priority", e.target.value)}
                            className="w-full px-4 py-3 rounded-xl border border-white/20 bg-white/10 text-white focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-400/50 transition-all duration-200"
                            style={{ colorScheme: 'dark' }}
                          >
                            <option value="low" className="bg-gray-800 text-white">🔥 低</option>
                            <option value="medium" className="bg-gray-800 text-white">🔥🔥 中</option>
                            <option value="high" className="bg-gray-800 text-white">🔥🔥🔥 高</option>
                            <option value="urgent" className="bg-gray-800 text-white">🔥🔥🔥🔥 紧急</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-white/80 text-sm font-medium mb-2">预估时间（小时）</label>
                          <input
                            type="text"
                            value={task.estimatedHours ?? ""}
                            onChange={(e) => {
                              const value = e.target.value;
                              if (value === "") {
                                updateEditableTask(task.id, "estimatedHours", undefined);
                                updateEditableTask(task.id, "expiresAt", undefined);
                              } else {
                                const hours = parseFloat(value);
                                if (!isNaN(hours) && hours > 0) {
                                  handleTimeChange(task.id, hours);
                                }
                              }
                            }}
                            placeholder="输入小时数"
                            className="w-full px-4 py-3 rounded-xl border border-white/20 bg-white/10 text-white placeholder-white/60 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-400/50 transition-all duration-200"
                          />
                        </div>

                        <div>
                          <label className="block text-white/80 text-sm font-medium mb-2">状态</label>
                          <select
                            value={task.status}
                            onChange={(e) => updateEditableTask(task.id, "status", e.target.value)}
                            className="w-full px-4 py-3 rounded-xl border border-white/20 bg-white/10 text-white focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-400/50 transition-all duration-200"
                            style={{ colorScheme: 'dark' }}
                          >
                            <option value="pending" className="bg-gray-800 text-white">待处理</option>
                            <option value="in_progress" className="bg-gray-800 text-white">进行中</option>
                            <option value="completed" className="bg-gray-800 text-white">已完成</option>
                            <option value="paused" className="bg-gray-800 text-white">已暂停</option>
                            <option value="cancelled" className="bg-gray-800 text-white">已取消</option>
                          </select>
                        </div>
                      </div>

                      {/* 时间信息 */}
                      {task.estimatedHours && (
                        <div className="mt-4 p-4 bg-white/5 rounded-xl">
                          <div className="flex flex-col gap-2 text-sm text-white/70 sm:flex-row sm:gap-4">
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4" />
                              <span>开始时间: {task.startTime?.toLocaleString('zh-CN', {
                                year: 'numeric',
                                month: '2-digit',
                                day: '2-digit',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Flame className="h-4 w-4" />
                              <span>截止时间: {task.expiresAt?.toLocaleString('zh-CN', {
                                year: 'numeric',
                                month: '2-digit',
                                day: '2-digit',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </motion.div>
                    );
                  })}
                </div>

                {/* Add Task Button */}
                <motion.button
                  onClick={addEditableTask}
                  className="w-full mt-6 py-4 rounded-xl border-2 border-dashed border-white/30 text-white/70 hover:border-white/50 hover:text-white transition-all duration-200 flex items-center justify-center gap-2"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Plus className="h-5 w-5" />
                  添加新任务
                </motion.button>
              </div>

              {/* Footer */}
              <div className="border-t border-white/10 bg-white/5 backdrop-blur p-6">
                <div className="flex flex-col sm:flex-row gap-4">
                  <motion.button
                    onClick={() => setShowManualEdit(false)}
                    className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-white/10 text-white hover:bg-white/20 transition-all duration-200 w-full sm:w-auto"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <ArrowLeft className="h-4 w-4" />
                    返回
                  </motion.button>

                  <motion.button
                    onClick={handleCreateFromManualEdit}
                    disabled={isCreatingTasks}
                    className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 w-full sm:w-auto"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {isCreatingTasks ? (
                      <>
                        <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>创建中...</span>
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4" />
                        <span>创建清单</span>
                      </>
                    )}
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 对话历史模态框 */}
      <ConversationHistory
        isOpen={showConversationHistory}
        onClose={() => setShowConversationHistory(false)}
        onSelectConversation={(conversation) => {
          setSelectedConversationId(conversation.id);
          setShowConversationHistory(false);
          setShowConversationDetail(true);
        }}
      />

      {/* 对话详情模态框 */}
      <ConversationDetail
        conversationId={selectedConversationId}
        isOpen={showConversationDetail}
        onClose={() => {
          setShowConversationDetail(false);
          setSelectedConversationId(null);
        }}
        onBack={() => {
          setShowConversationDetail(false);
          setShowConversationHistory(true);
        }}
      />
    </div>
  );
}
