/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
import "./src/env.js";

/** @type {import("next").NextConfig} */
const config = {
    experimental: {
        // 把终端日志同时打到「浏览器控制台」
        serverComponentsExternalPackages: ['next-logger']
    }
};

export default config;
