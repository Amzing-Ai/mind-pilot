import { UserButton } from "@clerk/nextjs";
import ThemeToggle from "./ThemeToggle";

export default function Header() {
  return (
    <nav className="flex h-[60px] w-full items-center justify-between p-4">
      <h1>MindPilot —— 你的AI智慧清单管家</h1>
      <div className="flex items-center gap-2">
        <UserButton />
        <ThemeToggle />
      </div>
    </nav>
  );
}
