"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { LineMdIconRemove } from "@/lib/iconify";
import { toast } from "sonner";
import { type List } from "@prisma/client";
import { deleteList } from "@/actions/list";
import CreateTaskModal from "@/components/CreateTaskModal";

interface Props {
  checkList: List;
}

export default function CheckListFooter({ checkList }: Props) {
  const { id, createdAt } = checkList;

  const deleteCheckList = async () => {
    try {
      await deleteList(id);
      toast.success("清单删除成功");
    } catch {
      toast.error("清单删除失败，请稍后重试");
    }
  };

  return (
    <>
      <Separator />
      <footer className="mt-3 flex h-[30px] w-full items-center justify-between text-sm text-white">
        <p>创建于 {createdAt.toLocaleDateString("zh-CN")}</p>
        <div>
          <CreateTaskModal checkList={checkList} />
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button size={"icon"} variant={"ghost"}>
                <LineMdIconRemove style={{ width: 24, height: 24 }} />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>确定要删除吗？</AlertDialogTitle>
                <AlertDialogDescription>该操作无法撤回</AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>取消</AlertDialogCancel>
                <AlertDialogAction onClick={deleteCheckList}>
                  确定
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </footer>
    </>
  );
}
