"use client";

import type { User } from "next-auth";
import { UserSignOutButton } from "@/components/UserSignOutButton";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarSeparator,
  MenubarShortcut,
  MenubarTrigger,
} from "@/components/ui/menubar";

import { useSession } from "next-auth/react";
import Link from "next/link";
import { Settings, User as UserIcon } from "lucide-react";

function UserAvatar({ user }: { user: User }) {
  return (
    <Menubar className="w-[48px] border-none shadow-none">
      <MenubarMenu>
        <MenubarTrigger className="rounded-full">
          <Avatar>
            <AvatarImage src={user?.image ?? undefined} />
            <AvatarFallback>{user?.name?.charAt(0)}</AvatarFallback>
          </Avatar>
        </MenubarTrigger>
        <MenubarContent>
          <MenubarItem asChild>
            <Link href="/settings" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              设置
            </Link>
          </MenubarItem>
          <MenubarItem asChild>
            <Link href="/profile" className="flex items-center gap-2">
              <UserIcon className="w-4 h-4" />
              个人资料
            </Link>
          </MenubarItem>
          <MenubarSeparator />
          <MenubarItem>
            <UserSignOutButton />
          </MenubarItem>
        </MenubarContent>
      </MenubarMenu>
    </Menubar>
  );
}

export default function UserAvatarClient() {
  const { data: session } = useSession();
  return session?.user ? <UserAvatar user={session.user} /> : null;
}
