/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
import "./src/env.js";

/** @type {import("next").NextConfig} */
const config = {
    // 把终端日志同时打到「浏览器控制台」
    serverExternalPackages: ['next-logger'],
    experimental: {
        // 其他实验性功能可以在这里添加
    }
};

export default config;
