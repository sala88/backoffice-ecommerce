// Auth schemas
export const RegisterRequestSchema = z.object({
  email: z.string().email({ message: "Email non valida" }),
  password: z.string().min(6, { message: "Password deve essere almeno 6 caratteri" }),
});

export const RegisterResponseSchema = z.object({
  ok: z.boolean(),
});

export const LoginRequestSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export const LoginResponseSchema = z.object({
  ok: z.boolean(),
});

export const LogoutResponseSchema = z.object({
  message: z.string(),
});

export const ErrorResponseSchema = z.object({
  error: z.string(),
});
import { z } from "zod";

export const ProductSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  price: z.number(),
  discountPct: z.number().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const PaginatedProductsSchema = z.object({
  products: z.array(ProductSchema),
  page: z.number(),
  pageSize: z.number(),
  total: z.number(),
  totalPages: z.number(),
});

export const ProductInputSchema = z.object({
  name: z.string(),
  description: z.string(),
  price: z.number(),
  discountPct: z.number().nullable().optional(),
});
