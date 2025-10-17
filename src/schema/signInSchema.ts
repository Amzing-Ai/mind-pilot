import { object, string, ZodError } from "zod"

export const signInSchema = object({
    email: string({ required_error: "请输入邮箱地址" })
        .min(1, "请输入邮箱地址")
        .email("邮箱格式不正确"),
    password: string({ required_error: "请输入密码" })
        .min(1, "请输入密码")
        .min(8, "密码长度不能少于8位")
        .max(32, "密码长度不能超过32位"),
})

export { ZodError }