"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./ui/form";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarDays } from "lucide-react";
import { LineMdIconAdd } from "@/lib/iconify";

import { type List } from "@prisma/client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import dayjs from "dayjs";
import {
  createTaskZodSchema,
  type createTaskZodSchemaType,
} from "@/schema/createTask";
import { zodResolver } from "@hookform/resolvers/zod";

import { ListMap } from "@/lib/const";
import { cn } from "@/lib/utils";
import { createTask } from "@/actions/task";

interface Props {
  checkList: List;
}

export default function CreateTaskModal({ checkList }: Props) {
  const { id, name, color } = checkList;

  const [open, setOpen] = useState(false);

  const form = useForm<createTaskZodSchemaType>({
    resolver: zodResolver(createTaskZodSchema),
    defaultValues: {
      content: "",
      todoId: id,
      status: "pending" as const,
      priority: "medium" as const,
    },
  });

  const onOpenChange = (open: boolean) => {
    form.reset();
    setOpen(open);
  };

  const onSubmit = async (data: createTaskZodSchemaType) => {
    try {
      await createTask(data);
      toast.success("已添加");
      onOpenChange(false);
    } catch {
      toast.error("添加失败，请稍后重试");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button size={"icon"} variant={"ghost"}>
          <LineMdIconAdd style={{ width: 24, height: 24 }} />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>添加任务</DialogTitle>
          <DialogDescription>任务将添加到 「{name}」 清单</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <Form {...form}>
            <form
              className="flex flex-col space-y-4"
              onSubmit={form.handleSubmit(onSubmit)}
            >
              <FormField
                control={form.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>任务内容：</FormLabel>
                    <FormControl>
                      <Input className="col-span-3" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="expiresAt"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>截止日期：</FormLabel>
                    <FormControl>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !field.value && "text-muted-foreground",
                            )}
                          >
                            <CalendarDays className="mr-2 h-4 w-4" />
                            {field.value &&
                              dayjs(field.value).format("YYYY/MM/DD")}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent>
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </form>
          </Form>
        </div>
        <DialogFooter>
          <Button
            disabled={form.formState.isSubmitting}
            className={cn(
              "w-full text-white dark:text-white",
              ListMap.get(color),
            )}
            onClick={form.handleSubmit(onSubmit)}
          >
            确认
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
