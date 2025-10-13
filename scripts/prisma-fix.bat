@echo off
echo 修复Prisma权限问题...

REM 停止所有Node.js进程
taskkill /f /im node.exe 2>nul

REM 等待进程完全停止
timeout /t 2 /nobreak >nul

REM 清理Prisma客户端缓存
if exist "node_modules\.pnpm\@prisma+client@6.16.1_prism_165b0be88f810880210521a44004df9c\node_modules\.prisma\client" (
    rmdir /s /q "node_modules\.pnpm\@prisma+client@6.16.1_prism_165b0be88f810880210521a44004df9c\node_modules\.prisma\client"
)

REM 重新生成Prisma客户端
echo 重新生成Prisma客户端...
npx prisma generate

REM 启动开发服务器
echo 启动开发服务器...
npm run dev

echo 修复完成！
pause
