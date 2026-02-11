import { z } from "zod";
import { OpenAPIRegistry, OpenApiGeneratorV3 } from "@asteasolutions/zod-to-openapi";

const registry = new OpenAPIRegistry();

export const ProductSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  price: z.number(),
  discount: z.number().nullable().optional(),
  discountPct: z.number().nullable().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});
registry.register("Product", ProductSchema);

export const ProductsResponseSchema = z.object({
  products: z.array(ProductSchema)
});
registry.register("ProductsResponse", ProductsResponseSchema);

export const ProductResponseSchema = z.object({
  product: ProductSchema
});
registry.register("ProductResponse", ProductResponseSchema);

export const ErrorResponseSchema = z.object({
  error: z.string()
});
registry.register("ErrorResponse", ErrorResponseSchema);

const generator = new OpenApiGeneratorV3(registry.definitions);

export const openApiDoc = generator.generateDocument({
  info: {
    title: "Backoffice Ecommerce API",
    version: "1.0.0",
  },
  paths: {}, // You can add paths here
});
