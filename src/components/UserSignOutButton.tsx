"use client";

import { signOut } from "next-auth/react";

export function UserSignOutButton({ className }: { className?: string }) {
  return (
    <button className={className} onClick={() => signOut()}>
      Sign Out
    </button>
  );
}
