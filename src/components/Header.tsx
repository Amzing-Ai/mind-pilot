import { UserButton } from "@clerk/nextjs";
import ThemeToggle from "./ThemeToggle";
import TitleTyped from "./fun-component/Title-typed";
import Image from "next/image";

export default function Header() {
  return (
    <nav className="flex h-[60px] w-full items-center justify-between p-4">
      <h1 className="flex justify-center gap-1">
        <Image
          className="animate-in fade-in duration-1500"
          src="/images/logo.png"
          alt="logo"
          width={180}
          height={40}
        />
        <TitleTyped />
      </h1>
      <div className="flex items-center gap-2">
        <UserButton />
        <ThemeToggle />
      </div>
    </nav>
  );
}
