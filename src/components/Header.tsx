import ThemeToggle from "./ThemeToggle";
import HeaderTitle from "./HeaderTitle";
import UserButton from "./UserButton";

export default function Header() {
  return (
    <nav className="flex h-[60px] w-full items-center justify-between p-4">
      {/* <HeaderTitle /> */}
      <div className="flex items-center gap-2">
        <UserButton />
        <ThemeToggle />
      </div>
    </nav>
  );
}
