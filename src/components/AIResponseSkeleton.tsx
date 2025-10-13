"use client";

import { motion } from "framer-motion";

export default function AIResponseSkeleton() {
  return (
    <div className="max-h-[70vh] overflow-y-auto p-6">
      {/* 任务统计骨架 */}
      <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200 animate-pulse">
        <div className="flex items-center gap-3 mb-3">
          <div className="rounded-lg bg-blue-200 p-2 w-8 h-8"></div>
          <div className="flex-1">
            <div className="h-6 bg-gray-200 rounded w-48 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-32"></div>
          </div>
        </div>

        {/* 任务列表骨架 */}
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-2">
              <div className="w-4 h-4 bg-gray-200 rounded"></div>
              <div className="flex-1 h-4 bg-gray-200 rounded"></div>
              <div className="w-12 h-4 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      </div>

      {/* AI建议和风险提示骨架 */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* AI建议骨架 */}
        <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200 animate-pulse">
          <div className="flex items-center gap-2 mb-3">
            <div className="rounded-lg bg-green-200 p-2 w-8 h-8"></div>
            <div className="h-5 bg-gray-200 rounded w-16"></div>
          </div>
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded w-full"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>

        {/* 风险提示骨架 */}
        <div className="p-4 bg-gradient-to-r from-orange-50 to-red-50 rounded-xl border border-orange-200 animate-pulse">
          <div className="flex items-center gap-2 mb-3">
            <div className="rounded-lg bg-orange-200 p-2 w-8 h-8"></div>
            <div className="h-5 bg-gray-200 rounded w-20"></div>
          </div>
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded w-full"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            <div className="h-4 bg-gray-200 rounded w-4/5"></div>
          </div>
        </div>
      </div>

      {/* 其他信息骨架 */}
      <div className="mt-4 p-4 bg-gray-50 rounded-xl border border-gray-200 animate-pulse">
        <div className="flex items-center gap-2 mb-3">
          <div className="rounded-lg bg-gray-200 p-2 w-8 h-8"></div>
          <div className="h-5 bg-gray-200 rounded w-20"></div>
        </div>
        <div className="space-y-3">
          <div className="h-4 bg-gray-200 rounded w-full"></div>
          <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          <div className="h-4 bg-gray-200 rounded w-4/5"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        </div>
      </div>
    </div>
  );
}
