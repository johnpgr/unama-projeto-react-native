import type { ClassValue } from "clsx"
import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export const mergeClasses = (...inputs: ClassValue[]) => twMerge(clsx(inputs))
