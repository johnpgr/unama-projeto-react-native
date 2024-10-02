"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.signUpSchema = exports.signInSchema = void 0;
var zod_1 = require("zod");
exports.signInSchema = zod_1.z.object({
    email: zod_1.z
        .string({ required_error: "Preencha esse campo." })
        .min(1, "Preencha esse campo.")
        .email("Email invalido"),
    password: zod_1.z
        .string({ required_error: "Preencha esse campo." })
        .min(1, "Preencha esse campo."),
});
exports.signUpSchema = zod_1.z.object({
    email: zod_1.z
        .string({ required_error: "Preencha esse campo." })
        .min(1, "Preencha esse campo.")
        .email("Email invalido"),
    fullName: zod_1.z
        .string({ required_error: "Preencha esse campo." })
        .min(3, "O Nome de usuário deve conter no minimo 3 caracteres."),
    password: zod_1.z
        .string({ required_error: "Preencha esse campo" })
        .min(8, "Senha de usuário precisa conter no mínimo 8 caracteres."),
});
