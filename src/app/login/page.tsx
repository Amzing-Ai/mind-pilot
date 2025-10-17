"use client";

import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

export default function Login() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);

  const callbackUrl = searchParams.get("callbackUrl") ?? "/";

  const trySignIn = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    // 客户端验证
    if (!email?.trim()) {
      toast.error("请输入邮箱地址");
      setLoading(false);
      return;
    }

    if (!email.includes("@") || !email.includes(".")) {
      toast.error("邮箱格式不正确");
      setLoading(false);
      return;
    }

    if (!password?.trim()) {
      toast.error("请输入密码");
      setLoading(false);
      return;
    }

    if (password.length < 8) {
      toast.error("密码长度不能少于8位");
      setLoading(false);
      return;
    }

    if (password.length > 32) {
      toast.error("密码长度不能超过32位");
      setLoading(false);
      return;
    }

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });
      if (result?.error) {
        // 显示具体的错误信息
        toast.error(result.error);
      } else {
        // 使用 window.location.href 确保完整的页面重载，包括中间件重新执行
        window.location.href = callbackUrl;
      }
    } catch (error) {
      console.error("登录错误:", error);
      toast.error("登录失败，请稍后重试");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        className="relative w-full max-w-md overflow-hidden rounded-2xl bg-white/60 p-8 shadow-2xl shadow-indigo-500/10 backdrop-blur-xl dark:bg-gray-800/60 dark:shadow-cyan-500/10"
      >
        {/* 背景光效 */}
        <div className="pointer-events-none absolute -top-24 -right-24 h-48 w-48 animate-pulse rounded-full bg-gradient-to-tr from-cyan-400 to-indigo-400 opacity-20 blur-3xl dark:from-cyan-300 dark:to-indigo-300" />

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="relative z-10"
        >
          {/* 标题和图标 - 常驻漂移 */}
          <motion.div
            className="mb-8 flex items-center gap-3"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }}
          >
            {/* <h1 className="text-2xl font-bold">Glad to see you!</h1> */}
            <Image
              className="animate-in fade-in duration-1500 dark:invert"
              src="/images/logo.png"
              alt="logo"
              width={180}
              height={40}
            />

            {/* 一直动来动去的容器 */}
            <motion.div
              animate={{
                x: [0, 3, -3, 0], // 水平漂移 3px
                y: [0, -2, 2, 0], // 垂直漂移 2px
                rotate: [0, 2, -2, 0], // 微旋转 2°
              }}
              transition={{
                duration: 4, // 4秒完成一个循环
                repeat: Infinity, // 无限循环
                ease: "easeInOut", // 平滑回弹
              }}
              whileHover={{ scale: 1.1, rotate: 10 }} // 鼠标悬停时放大+旋转
            >
              <Image
                src="/images/pen.png"
                alt="Welcome logo"
                width={50}
                height={50}
                className="object-contain drop-shadow-lg dark:invert"
              />
            </motion.div>
          </motion.div>

          <form onSubmit={trySignIn} className="space-y-5">
            {/* === Email === */}
            <motion.label
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="block"
            >
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                邮箱地址
              </span>
              <motion.input
                name="email"
                type="email"
                required
                placeholder="请输入您的邮箱地址"
                whileFocus={{ scale: 1.02 }}
                className="mt-1 w-full rounded-lg border border-gray-300 bg-white/70 px-3 py-2 text-gray-800 placeholder-gray-400 shadow-sm transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-400 focus:outline-none dark:border-gray-600 dark:bg-gray-700/70 dark:text-gray-100 dark:placeholder-gray-500"
              />
            </motion.label>

            {/* === Password === */}
            <motion.label
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="block"
            >
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                密码
              </span>
              <motion.input
                name="password"
                type="password"
                required
                placeholder="请输入您的密码（至少8位）"
                whileFocus={{ scale: 1.02 }}
                className="mt-1 w-full rounded-lg border border-gray-300 bg-white/70 px-3 py-2 text-gray-800 placeholder-gray-400 shadow-sm transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-400 focus:outline-none dark:border-gray-600 dark:bg-gray-700/70 dark:text-gray-100 dark:placeholder-gray-500"
              />
            </motion.label>

            {/* === Sign In 按钮 === */}
            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={loading}
              className={`relative w-full overflow-hidden rounded-xl py-2.5 text-white shadow-lg transition disabled:cursor-not-allowed disabled:opacity-70 ${
                loading
                  ? "bg-indigo-400"
                  : "bg-gradient-to-r from-indigo-500 to-cyan-500 hover:from-indigo-600 hover:to-cyan-600"
              }`}
            >
              <AnimatePresence mode="wait">
                {loading ? (
                  <motion.div
                    key="spinner"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center justify-center gap-2"
                  >
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    登录中...
                  </motion.div>
                ) : (
                  <motion.span
                    key="text"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    登录
                  </motion.span>
                )}
              </AnimatePresence>

              {/* 波纹光效 */}
              <motion.div
                className="absolute inset-0 bg-white/20"
                initial={{ x: "-100%" }}
                animate={{ x: "100%" }}
                transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
              />
            </motion.button>
          </form>
        </motion.div>
      </motion.div>
    </div>
  );
}
