import { z } from "zod";
import {
  ProductSchema,
  ProductsResponseSchema,
  ProductResponseSchema,
  ErrorResponseSchema,
  RegisterRequestSchema,
  RegisterResponseSchema,
  LoginRequestSchema,
  LoginResponseSchema,
  LogoutResponseSchema,
  HealthResponseSchema
} from "@/lib/zodSchemas";
import { OpenAPIRegistry, OpenApiGeneratorV3, extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
extendZodWithOpenApi(z);

const registry = new OpenAPIRegistry();

// Product schemas
registry.register("Product", ProductSchema);
registry.register("ProductsResponse", ProductsResponseSchema);
registry.register("ProductResponse", ProductResponseSchema);
registry.register("ErrorResponse", ErrorResponseSchema);
registry.register("RegisterRequest", RegisterRequestSchema);
registry.register("RegisterResponse", RegisterResponseSchema);
registry.register("LoginRequest", LoginRequestSchema);
registry.register("LoginResponse", LoginResponseSchema);
registry.register("LogoutResponse", LogoutResponseSchema);
registry.register("HealthResponse", HealthResponseSchema);

// API paths
registry.registerPath({
  method: "post",
  path: "/api/auth/register",
  requestBody: {
    content: {
      "application/json": {
        schema: RegisterRequestSchema,
      },
    },
  },
  responses: {
    200: {
      description: "Registrazione avvenuta",
      content: {
        "application/json": {
          schema: RegisterResponseSchema,
        },
      },
    },
    400: {
      description: "Errore validazione",
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
        },
      },
    },
    500: {
      description: "Errore server",
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
        },
      },
    },
  },
  tags: ["Auth"],
  summary: "Registrazione utente",
});

registry.registerPath({
  method: "post",
  path: "/api/auth/login",
  requestBody: {
    content: {
      "application/json": {
        schema: LoginRequestSchema,
      },
    },
  },
  responses: {
    200: {
      description: "Login avvenuto",
      content: {
        "application/json": {
          schema: LoginResponseSchema,
        },
      },
    },
    401: {
      description: "Credenziali non valide",
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
        },
      },
    },
    500: {
      description: "Errore server",
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
        },
      },
    },
  },
  tags: ["Auth"],
  summary: "Login utente",
});

registry.registerPath({
  method: "post",
  path: "/api/auth/logout",
  responses: {
    200: {
      description: "Logout avvenuto",
      content: {
        "application/json": {
          schema: LogoutResponseSchema,
        },
      },
    },
    500: {
      description: "Errore server",
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
        },
      },
    },
  },
  tags: ["Auth"],
  summary: "Logout utente",
});

registry.registerPath({
  method: "get",
  path: "/api/health",
  responses: {
    200: {
      description: "Stato server",
      content: {
        "application/json": {
          schema: HealthResponseSchema,
        },
      },
    },
  },
  tags: ["Health"],
  summary: "Health check API",
});

registry.registerPath({
  method: "get",
  path: "/api/products",
  responses: {
    200: {
      description: "Lista prodotti",
      content: {
        "application/json": {
          schema: ProductsResponseSchema,
        },
      },
    },
    500: {
      description: "Errore server",
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
        },
      },
    },
  },
  tags: ["Products"],
  summary: "Ottieni tutti i prodotti",
});

registry.registerPath({
  method: "get",
  path: "/api/products/{id}",
  requestParams: {
    path: z.object({ id: z.string() }),
  },
  responses: {
    200: {
      description: "Dettaglio prodotto",
      content: {
        "application/json": {
          schema: ProductResponseSchema,
        },
      },
    },
    404: {
      description: "Prodotto non trovato",
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
        },
      },
    },
    500: {
      description: "Errore server",
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
        },
      },
    },
  },
  tags: ["Products"],
  summary: "Ottieni un prodotto per ID",
});

const generator = new OpenApiGeneratorV3(registry.definitions);

export const openApiDoc = generator.generateDocument({
  openapi: "3.0.0",
  info: {
    title: "Backoffice Ecommerce API",
    version: "1.0.0",
  },
  paths: registry.paths,
});
