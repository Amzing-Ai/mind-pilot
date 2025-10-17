"use client";

import {
  User, Bell, Palette, Globe, Shield, HelpCircle, LogOut, ChevronRight,
  Camera, Upload, Sparkles, Languages, Brain
} from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { useSession } from 'next-auth/react';

export default function SettingsPage() {
  const { data: session } = useSession();
  const [avatarUrl, setAvatarUrl] = useState(session?.user?.image || 'https://api.dicebear.com/7.x/avataaars/svg?seed=user');
  const [selectedLanguage, setSelectedLanguage] = useState('zh-CN');
  const [selectedModel, setSelectedModel] = useState('gpt-4');
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  const handleAvatarUpload = () => {
    // 模拟文件上传
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e: Event) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          setAvatarUrl(e.target?.result as string);
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  };

  const languages = [
    { value: 'zh-CN', label: '简体中文', flag: '🇨🇳' },
    { value: 'zh-TW', label: '繁體中文', flag: '🇹🇼' },
    { value: 'en-US', label: 'English', flag: '🇺🇸' },
    { value: 'ja-JP', label: '日本語', flag: '🇯🇵' },
    { value: 'ko-KR', label: '한국어', flag: '🇰🇷' },
  ];

  const aiModels = [
    {
      value: 'gpt-4',
      label: 'GPT-4 Turbo',
      description: '最强大的模型，适合复杂任务',
      badge: '推荐',
      badgeColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30'
    },
    {
      value: 'gpt-3.5',
      label: 'GPT-3.5 Turbo',
      description: '快速响应，适合日常任务',
      badge: '快速',
      badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
    },
    {
      value: 'claude-3',
      label: 'Claude 3 Opus',
      description: '擅长长文本和分析',
      badge: '专业',
      badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/30'
    },
    {
      value: 'gemini-pro',
      label: 'Gemini Pro',
      description: 'Google最新模型',
      badge: '新',
      badgeColor: 'bg-orange-500/20 text-orange-300 border-orange-500/30'
    },
  ];

  const settingsGroups = [
    {
      title: '应用设置',
      items: [
        {
          icon: Bell,
          label: '通知提醒',
          description: '设置任务提醒和通知',
          action: 'toggle' as const,
          value: notificationsEnabled,
          onChange: setNotificationsEnabled,
        },
        {
          icon: Palette,
          label: '主题外观',
          description: '选择您喜欢的界面风格',
          action: 'navigate' as const,
        },
      ],
    },
    {
      title: '其他',
      items: [
        {
          icon: Shield,
          label: '隐私与安全',
          description: '管理您的隐私设置',
          action: 'navigate' as const,
        },
        {
          icon: HelpCircle,
          label: '帮助中心',
          description: '获取使用帮助和支持',
          action: 'navigate' as const,
        },
        {
          icon: LogOut,
          label: '退出登录',
          description: '安全退出当前账户',
          action: 'navigate' as const,
          danger: true,
        },
      ],
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 overflow-auto">
      <motion.div
        className="max-w-4xl mx-auto px-4 md:px-6 py-8 space-y-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >

        {/* User Profile Card with Avatar Upload */}
        <motion.div
          className="relative overflow-hidden rounded-3xl group"
          variants={itemVariants}
        >
          <div className="absolute inset-0 bg-white/10 backdrop-blur-xl border border-white/20" />
          <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-cyan-400/20 to-transparent rounded-full blur-3xl" />

          <div className="relative p-6">
            <div className="flex flex-col md:flex-row md:items-center gap-6">
              {/* Avatar Upload Section */}
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Avatar className="w-20 h-20 border-2 border-white/30 shadow-lg">
                    <AvatarImage src={avatarUrl} />
                    <AvatarFallback className="bg-gradient-to-br from-cyan-400 to-blue-500 text-white">用户</AvatarFallback>
                  </Avatar>
                  <motion.button
                    onClick={handleAvatarUpload}
                    className="absolute -bottom-2 -right-2 w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg border-2 border-white/30 group/btn"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Camera className="w-5 h-5 text-white" />
                  </motion.button>
                </div>

                <div className="flex-1">
                  <h3 className="text-white text-lg font-semibold mb-1">智慧任务用户</h3>
                  <p className="text-white/60 text-sm mb-2">{session?.user?.email || 'user@example.com'}</p>
                  <Button
                    onClick={handleAvatarUpload}
                    variant="outline"
                    size="sm"
                    className="bg-white/10 border-white/20 text-white hover:bg-white/20 transition-all"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    上传头像
                  </Button>
                </div>
              </div>

              {/* Edit Profile Button */}
              <motion.button
                className="px-5 py-2.5 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-600 text-white rounded-full hover:shadow-2xl hover:shadow-blue-500/50 transition-all whitespace-nowrap"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                编辑资料
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div
          className="grid grid-cols-3 gap-3 md:gap-4"
          variants={itemVariants}
        >
          {[
            { label: '总任务', value: '128', gradient: 'from-cyan-400 to-blue-500' },
            { label: '完成率', value: '89%', gradient: 'from-purple-400 to-pink-500' },
            { label: '使用天数', value: '45', gradient: 'from-emerald-400 to-emerald-600' },
          ].map((stat, index) => (
            <motion.div
              key={index}
              className="group relative overflow-hidden rounded-2xl transition-all duration-300"
              whileHover={{ scale: 1.05 }}
              variants={itemVariants}
            >
              <div className="absolute inset-0 bg-white/10 backdrop-blur-xl border border-white/20" />
              <div className={`absolute top-0 right-0 w-20 h-20 bg-gradient-to-br ${stat.gradient} opacity-20 rounded-full blur-2xl group-hover:opacity-30 transition-opacity`} />

              <div className="relative p-4 text-center">
                <div className={`text-white mb-1 bg-gradient-to-r ${stat.gradient} bg-clip-text text-transparent text-2xl font-bold`}>
                  {stat.value}
                </div>
                <p className="text-white/60 text-sm">{stat.label}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Language Settings */}
        <motion.div
          className="space-y-4"
          variants={itemVariants}
        >
          <h3 className="text-white/70 px-2 text-lg font-semibold">语言设置</h3>
          <div className="relative overflow-hidden rounded-3xl">
            <div className="absolute inset-0 bg-white/10 backdrop-blur-xl border border-white/20" />
            <div className="absolute top-0 left-0 w-40 h-40 bg-gradient-to-br from-blue-400/20 to-transparent rounded-full blur-3xl" />

            <div className="relative p-6 space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center shrink-0">
                  <Languages className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <Label className="text-white mb-2 block text-base font-medium">显示语言</Label>
                  <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                    <SelectTrigger className="bg-white/10 border-white/20 text-white hover:bg-white/20 focus:ring-cyan-500">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-black/90 backdrop-blur-xl border-white/20">
                      {languages.map((lang) => (
                        <SelectItem
                          key={lang.value}
                          value={lang.value}
                          className="text-white hover:bg-white/10 focus:bg-white/20 focus:text-white"
                        >
                          <span className="flex items-center gap-2">
                            <span>{lang.flag}</span>
                            <span>{lang.label}</span>
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <p className="text-white/50 text-sm pl-16">
                选择您偏好的界面语言
              </p>
            </div>
          </div>
        </motion.div>

        {/* AI Model Selection */}
        <motion.div
          className="space-y-4"
          variants={itemVariants}
        >
          <h3 className="text-white/70 px-2 text-lg font-semibold">AI 模型选择</h3>
          <div className="relative overflow-hidden rounded-3xl">
            <div className="absolute inset-0 bg-white/10 backdrop-blur-xl border border-white/20" />
            <div className="absolute bottom-0 right-0 w-60 h-60 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full blur-3xl" />

            <div className="relative p-6">
              <div className="flex items-start gap-4 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-400 via-pink-500 to-rose-500 flex items-center justify-center shrink-0">
                  <Brain className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h4 className="text-white text-lg font-semibold mb-1">智能助手模型</h4>
                  <p className="text-white/60 text-sm">选择适合您需求的AI大模型</p>
                </div>
              </div>

              <div className="space-y-3">
                {aiModels.map((model, index) => (
                  <motion.button
                    key={model.value}
                    onClick={() => setSelectedModel(model.value)}
                    className={`w-full p-4 rounded-2xl border-2 transition-all duration-300 text-left ${
                      selectedModel === model.value
                        ? 'bg-gradient-to-r from-purple-500/30 to-pink-500/30 border-purple-400/50'
                        : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
                    }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h5 className="text-white font-medium">{model.label}</h5>
                          <span className={`px-2 py-0.5 rounded-full text-xs border ${model.badgeColor}`}>
                            {model.badge}
                          </span>
                        </div>
                        <p className="text-white/60 text-sm">{model.description}</p>
                      </div>
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
                        selectedModel === model.value
                          ? 'border-purple-400 bg-purple-400'
                          : 'border-white/30'
                      }`}>
                        {selectedModel === model.value && (
                          <motion.div
                            className="w-2.5 h-2.5 rounded-full bg-white"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", stiffness: 500, damping: 30 }}
                          />
                        )}
                      </div>
                    </div>
                  </motion.button>
                ))}
              </div>

              <motion.div
                className="mt-6 p-4 rounded-2xl bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <div className="flex items-start gap-3">
                  <Sparkles className="w-5 h-5 text-purple-400 shrink-0 mt-0.5" />
                  <div>
                    <h5 className="text-white text-sm mb-1 font-medium">智能提示</h5>
                    <p className="text-white/60 text-xs">
                      不同的模型适用于不同场景，您可以随时切换以获得最佳体验
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* Settings Groups */}
        {settingsGroups.map((group, groupIndex) => (
          <motion.div
            key={groupIndex}
            className="space-y-4"
            variants={itemVariants}
          >
            <h3 className="text-white/70 px-2 text-lg font-semibold">{group.title}</h3>
            <div className="relative overflow-hidden rounded-3xl">
              <div className="absolute inset-0 bg-white/10 backdrop-blur-xl border border-white/20" />

              <div className="relative">
                {group.items.map((item, itemIndex) => {
                  const Icon = item.icon;
                  const isDanger = 'danger' in item && item.danger;
                  const isToggle = item.action === 'toggle';

                  return (
                    <div key={itemIndex}>
                      {itemIndex > 0 && <Separator className="bg-white/10" />}
                      <motion.div
                        className={`w-full flex items-center gap-4 p-5 transition-all ${
                          isDanger
                            ? 'hover:bg-red-500/10'
                            : 'hover:bg-white/10'
                        }`}
                        whileHover={{ x: 5 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <div
                          className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                            isDanger
                              ? 'bg-red-500/20 border border-red-500/30'
                              : 'bg-gradient-to-br from-white/20 to-white/10 border border-white/20'
                          } backdrop-blur-sm`}
                        >
                          <Icon
                            className={`w-6 h-6 ${
                              isDanger ? 'text-red-400' : 'text-white'
                            }`}
                          />
                        </div>
                        <div className="flex-1 text-left">
                          <h4 className={`mb-1 font-medium ${isDanger ? 'text-red-400' : 'text-white'}`}>
                            {item.label}
                          </h4>
                          <p className="text-white/60 text-sm">{item.description}</p>
                        </div>
                        {isToggle ? (
                          <Switch
                            checked={'value' in item ? item.value : false}
                            onCheckedChange={'onChange' in item ? item.onChange : undefined}
                            className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-cyan-500 data-[state=checked]:to-blue-500 shrink-0"
                          />
                        ) : (
                          <ChevronRight
                            className={`w-5 h-5 shrink-0 ${
                              isDanger ? 'text-red-400/60' : 'text-white/40'
                            }`}
                          />
                        )}
                      </motion.div>
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        ))}

        {/* App Info */}
        <motion.div
          className="relative overflow-hidden rounded-3xl"
          variants={itemVariants}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-xl border border-white/20" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-32 h-32 bg-gradient-to-br from-cyan-400/20 to-purple-400/20 rounded-full blur-3xl" />
          </div>

          <div className="relative p-8 text-center">
            <motion.div
              className="relative inline-block mb-4"
              whileHover={{ scale: 1.1, rotate: 5 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-400 to-purple-600 rounded-2xl blur-lg opacity-50" />
              <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-400 via-blue-500 to-purple-600 flex items-center justify-center shadow-2xl">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
            </motion.div>
            <h4 className="text-white text-xl font-bold mb-2">智慧任务 AI助手</h4>
            <p className="text-white/60 text-sm mb-1">版本 1.0.0</p>
            <p className="text-white/40 text-sm">© 2025 All rights reserved</p>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
