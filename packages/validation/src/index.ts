import { z } from "zod"

export const signInSchema = z.object({
  email: z
    .string({ required_error: "Preencha esse campo." })
    .min(1, "Preencha esse campo.")
    .email("Email invalido"),
  password: z
    .string({ required_error: "Preencha esse campo." })
    .min(1, "Preencha esse campo."),
})

export const signUpSchema = z.object({
  email: z
    .string({ required_error: "Preencha esse campo." })
    .min(1, "Preencha esse campo.")
    .email("Email invalido"),
  fullName: z
    .string({ required_error: "Preencha esse campo." })
    .min(3, "O Nome de usuário deve conter no minimo 3 caracteres."),
  password: z
    .string({ required_error: "Preencha esse campo" })
    .min(8, "Senha de usuário precisa conter no mínimo 8 caracteres."),
})
