"use client";

import TitleTyped from "./fun-component/Title-typed";
import Image from "next/image";

export default function HeaderTitle() {
  return (
    <h1 className="flex justify-center gap-1">
      <Image
        className="animate-in fade-in duration-1500 dark:invert"
        src="/images/logo.png"
        alt="logo"
        width={180}
        height={40}
      />
      <TitleTyped />
    </h1>
  );
}
