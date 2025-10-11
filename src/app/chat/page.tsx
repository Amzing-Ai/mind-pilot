"use client";

import { useChat } from "@ai-sdk/react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bot, Send, Sparkles, Zap, CheckCircle, Lightbulb, Rocket, Target, Clock, TrendingUp, Users, Edit3, Loader2, Plus, Trash2, Flame, Save, ArrowLeft } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { parseTasksFromAIResponse, validateParsedTasks, extractListNameFromAIResponse, type ParsedTask } from "@/lib/taskParser";
import { createListAndTasks } from "@/actions/createListAndTasks";
import { toast } from "sonner";
import { TitleTypedDescription } from "@/components/fun-component/Title-typed";

export default function Chat() {
  const [input, setInput] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [isCreatingTasks, setIsCreatingTasks] = useState(false);
  const [parsedTasks, setParsedTasks] = useState<ParsedTask[]>([]);
  const [extractedListName, setExtractedListName] = useState<string>("");
  const [clickedAction, setClickedAction] = useState<number | null>(null);
  const [taskGenerationMode, setTaskGenerationMode] = useState<'detailed' | 'concise'>('detailed');
  const { messages, sendMessage } = useChat();

  // 自动调整textarea高度
  const adjustTextareaHeight = (textarea: HTMLTextAreaElement) => {
    textarea.style.height = 'auto';
    textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
  };

  // 监听input变化，自动调整高度
  useEffect(() => {
    const textarea = document.querySelector('textarea[placeholder*="试试说"]')!;
    adjustTextareaHeight(textarea);
  }, [input]);

  // 监听消息变化，当有新的AI回复时显示模态框并解析任务
  useEffect(() => {
    if (messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      if (lastMessage && lastMessage.role === "assistant") {
        setShowModal(true);

        // 解析AI回复中的任务
        const messageContent = lastMessage.parts ?
          lastMessage.parts.map(part => part.type === 'text' ? part.text : '').join('') :
          '';

        if (messageContent) {
          const tasks = parseTasksFromAIResponse(messageContent);
          const listName = extractListNameFromAIResponse(messageContent);
          console.log("提取的清单名称:", listName);
          setParsedTasks(tasks);
          setExtractedListName(listName || "AI生成任务");
        }
      }
    }
  }, [messages]);

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
      const textareaElement = document.querySelector('textarea[placeholder*="试试说"]')!;
      textareaElement.focus();
      textareaElement.setSelectionRange(template.length, template.length);
      adjustTextareaHeight(textareaElement);
    }, 100);
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
                { label: "已完成", count: "5个", icon: CheckCircle, color: "text-green-400" },
                { label: "进行中", count: "2个", icon: Zap, color: "text-yellow-400" },
                { label: "待处理", count: "3个", icon: Clock, color: "text-orange-400" },
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
                <span className="text-white/80">今日完成率</span>
                <span className="text-white">50%</span>
              </div>
              <div className="h-2 rounded-full bg-white/20">
                <div className="h-2 w-1/2 rounded-full bg-gradient-to-r from-green-400 to-emerald-500"></div>
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
              {[
                { title: "产品发布计划", desc: "制定完整的产品发布时间表和营销策略...", time: "2小时前" },
                { title: "团队培训方案", desc: "设计为期一周的新员工入职培训计划...", time: "昨天" },
                { title: "季度OKR规划", desc: "制定Q4季度的目标和关键结果...", time: "3天前" },
              ].map((conversation, index) => (
                <div key={`conversation-${index}-${conversation.title.slice(0, 10) || 'empty'}`} className="group cursor-pointer rounded-lg p-3 transition-colors hover:bg-white/10">
                  <h4 className="text-sm font-medium text-white group-hover:text-indigo-300">{conversation.title}</h4>
                  <p className="text-xs text-white/60">{conversation.desc}</p>
                  <p className="text-xs text-white/40">{conversation.time}</p>
                </div>
              ))}
            </div>
            <button className="mt-4 text-sm text-indigo-300 hover:text-indigo-200">
              查看全部对话历史 →
            </button>
          </div>
        </motion.div>
      </div>

      {/* Floating AI Response Modal */}
      <AnimatePresence>
        {showModal && latestMessage && latestMessage.role === "assistant" && (
          <motion.div
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
              className="relative max-h-[80vh] w-full max-w-2xl overflow-hidden rounded-3xl bg-white shadow-2xl"
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
              <div className="max-h-80 overflow-y-auto p-6">
                <div className="modal-content prose prose-sm max-w-none text-black prose-headings:text-black prose-p:text-black prose-strong:text-black prose-ul:text-black prose-li:text-black prose-h3:text-lg prose-h3:font-semibold prose-h3:text-black prose-h3:mb-2 prose-h3:mt-4 prose-p:mb-2 prose-strong:font-semibold prose-a:text-black prose-code:text-black prose-pre:text-black [&>*]:text-black [&>*]:!text-black [&_*]:text-black [&_*]:!text-black">
                  <ReactMarkdown>
                    {latestMessage.parts ?
                      latestMessage.parts.map(part => part.type === 'text' ? part.text : '').join('') :
                      'No content available'
                    }
                  </ReactMarkdown>
                </div>

                {/* 任务预览 - 移到内容区域内部 */}
                {parsedTasks.length > 0 && (
                  <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <h4 className="font-semibold text-blue-800 mb-3 flex items-center gap-2">
                      <span className="text-lg">📋</span>
                      发现 {parsedTasks.length} 个任务
                    </h4>
                    {extractedListName && (
                      <div className="mb-3 p-2 bg-blue-100 rounded text-sm text-blue-700">
                        <span className="font-medium">清单名称:</span> {extractedListName}
                      </div>
                    )}
                    <div className="space-y-2">
                      {parsedTasks.map((task, index) => (
                        <div key={`parsed-task-${index}-${task.content.slice(0, 20) || 'empty'}`} className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 text-sm">
                          <div className="flex items-center gap-2">
                            <span className="text-blue-600 font-medium text-xs">
                              {index + 1}.
                            </span>
                            <span className="text-gray-700 text-xs leading-tight">{task.content}</span>
                          </div>
                          <span className={`px-2 py-1 rounded text-xs w-fit ${
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
              </div>

              {/* Modal Footer */}
              <div className="border-t bg-gray-50 p-4 sm:p-6">

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
    </div>
  );
}
