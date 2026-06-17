import { z } from "zod";

export const RegisterSchema = z.object({
  username: z
    .string()
    .min(2, "用户名至少 2 个字符")
    .max(20, "用户名最多 20 个字符")
    .regex(/^[a-zA-Z0-9_一-龥]+$/, "用户名只能包含中英文、数字和下划线"),
  email: z.string().email("请输入有效的邮箱地址"),
  password: z
    .string()
    .min(6, "密码至少 6 个字符")
    .max(100, "密码最多 100 个字符")
    .regex(/[a-zA-Z]/, "密码需包含至少一个字母")
    .regex(/[0-9]/, "密码需包含至少一个数字"),
  tagIds: z.array(z.string()).max(5, "最多选择 5 个兴趣标签").optional(),
  code: z.string().length(6, "验证码为 6 位数字").optional(),
});

export const LoginSchema = z.object({
  username: z
    .string()
    .min(2, "用户名至少 2 个字符")
    .max(20, "用户名最多 20 个字符"),
  password: z.string().min(1, "请输入密码"),
});

export const PostSchema = z.object({
  title: z
    .string()
    .min(1, "标题不能为空")
    .max(200, "标题最多 200 个字符"),
  content: z.string().min(1, "内容不能为空"),
  tagIds: z.array(z.string()).max(5, "最多选择 5 个标签"),
  boardId: z.string().optional(),
});

export const CommentSchema = z.object({
  content: z
    .string()
    .min(1, "评论不能为空")
    .max(2000, "评论最多 2000 个字符"),
});

export const MessageSchema = z.object({
  content: z
    .string()
    .min(1, "消息不能为空")
    .max(5000, "消息最多 5000 个字符"),
});

export type RegisterInput = z.infer<typeof RegisterSchema>;
export type LoginInput = z.infer<typeof LoginSchema>;
export type PostInput = z.infer<typeof PostSchema>;
export type CommentInput = z.infer<typeof CommentSchema>;
