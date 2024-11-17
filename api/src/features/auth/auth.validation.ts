import { z } from "zod"

export const LoginSchema = z.object({
  email: z
    .string({ required_error: "Email é obrigatório" })
    .min(1, "Email é obrigatório")
    .email("Formato de email inválido"),
  password: z
    .string({ required_error: "Senha é obrigatória" })
    .min(1, "Senha é obrigatória"),
})

export const RegisterSchema = z.object({
  email: z
    .string({ required_error: "Email é obrigatório" })
    .min(1, "Email é obrigatório")
    .email("Formato de email inválido"),
  fullName: z
    .string({ required_error: "Nome completo é obrigatório" })
    .min(3, "Nome completo deve ter no mínimo 3 caracteres"),
  password: z
    .string({ required_error: "Senha é obrigatória" })
    .min(8, "Senha deve ter no mínimo 8 caracteres"),
})
