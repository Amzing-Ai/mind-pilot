"use client";

import { useState, useEffect } from "react";

export default function TitleTyped() {
  return (
    <div className="hidden items-center text-sm tracking-wide text-gray-400 sm:inline-flex">
      —— 你的AI智慧清单管家
    </div>
  );
}

export function TitleTypedWelcome() {
  return (
    <div>
      伟大不是突然降临，而是每天把小事做完后，顺便发生。
    </div>
  );
}

export function TitleTypedDescription() {
  const [displayText, setDisplayText] = useState("");
  const fullText = "用一句话描述您的目标，AI将为您智能拆解成可执行的任务清单。";

  useEffect(() => {
    let index = 0;
    const timer = setInterval(() => {
      if (index < fullText.length) {
        setDisplayText(fullText.slice(0, index + 1));
        index++;
      } else {
        clearInterval(timer);
      }
    }, 50);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="text-lg text-white/70 leading-relaxed">
      {displayText}
    </div>
  );
}