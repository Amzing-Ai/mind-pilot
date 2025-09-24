import { Suspense } from "react";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { auth } from "@/auth";
import CreateListModal from "@/components/createListModal";
import { CheckLists } from "@/components/CheckLists";
import { TitleTypedWelcome } from "@/components/fun-component/Title-typed";
import { redirect } from "next/navigation";

async function Welcome() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  return (
    <Card className="w-full sm:col-span-2" x-chunk="dashboard-05-chunk-0">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">欢迎 {session.user.name}</CardTitle>
        <CardDescription className="max-w-lg leading-relaxed text-balance">
          <TitleTypedWelcome />
        </CardDescription>
      </CardHeader>
      <CardFooter>
        <CreateListModal />
      </CardFooter>
    </Card>
  );
}

function WelcomeFallback() {
  return <Skeleton className="h-[180px] w-full" />;
}

export default function HomePage() {
  return (
    <main className="flex w-full flex-col items-center px-4">
      <Suspense fallback={<WelcomeFallback />}>
        <Welcome />
      </Suspense>
      <Suspense fallback={<WelcomeFallback />}>
        <CheckLists />
      </Suspense>
    </main>
  );
}
