import { UserButton } from "@clerk/nextjs";
import ThemeToggle from "./ThemeToggle";
import TitleTyped from "./fun-component/Title-typed";

export default function Header() {
  return (
    <nav className="flex h-[60px] w-full items-center justify-between p-4">
      <h1 className="flex flex-col gap-1 sm:block">
        MindPilot <TitleTyped />
      </h1>
      <div className="flex items-center gap-2">
        <UserButton />
        <ThemeToggle />
      </div>
    </nav>
  );
}
