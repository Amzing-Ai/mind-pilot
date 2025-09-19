"use client";

import { ReactTyped } from "react-typed";

export default function TitleTyped() {
  return (
    <ReactTyped
      className="hidden items-center text-sm tracking-wide text-gray-400 sm:inline-flex"
      strings={["—— 你的AI智慧清单管家"]}
      typeSpeed={40}
      cursorChar=""
    />
  );
}

export function TitleTypedWelcome() {
  return (
    <ReactTyped
      strings={["伟大不是突然降临，而是每天把小事做完后，顺便发生。"]}
      typeSpeed={50}
    />
  );
}
