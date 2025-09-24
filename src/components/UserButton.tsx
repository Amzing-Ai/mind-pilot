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
          <MenubarItem>
            New Tab <MenubarShortcut>⌘T</MenubarShortcut>
          </MenubarItem>
          <MenubarItem>New Window</MenubarItem>
          <MenubarSeparator />
          <MenubarItem>Share</MenubarItem>
          <MenubarSeparator />
          <MenubarItem>Print</MenubarItem>
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
