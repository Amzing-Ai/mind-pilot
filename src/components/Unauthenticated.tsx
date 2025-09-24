"use client";

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";
import { signIn } from "@/auth";

export default function UnauthenticatedPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-gray-50 to-gray-100 p-4">
      <Card className="w-full max-w-sm border border-gray-200 shadow-md">
        <CardHeader className="flex flex-col items-center space-y-2 text-center">
          <div className="rounded-full bg-red-100 p-3">
            <AlertCircle className="h-6 w-6 text-red-600" />
          </div>
          <CardTitle className="text-xl font-semibold">未登录</CardTitle>
        </CardHeader>

        <CardContent className="text-center text-gray-600">
          <p className="text-sm">
            您需要先登录才能访问此页面的内容。 请点击下面的按钮登录系统。
          </p>
        </CardContent>

        <CardFooter className="flex justify-center">
          <Button className="w-full sm:w-auto">登录账号</Button>
        </CardFooter>
      </Card>
    </div>
  );
}
