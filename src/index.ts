import { serve } from "@hono/node-server";
import { swaggerUI } from "@hono/swagger-ui";
import { z, createRoute, OpenAPIHono } from "@hono/zod-openapi";
import { uuidv7 } from "uuidv7";

const UserParamsSchema = z.object({
  id: z
    .string()
    .min(3)
    .openapi({
      param: {
        name: "id",
        in: "path",
      },
      example: "1212121",
    }),
});

const UserBodySchema = z.object({
  name: z.string().openapi({
    example: "John Doe",
  }),
  age: z.number().openapi({
    example: 42,
  }),
});

const UserSchema = z
  .object({
    id: z.string().openapi({
      example: "123",
    }),
    name: z.string().openapi({
      example: "John Doe",
    }),
    age: z.number().openapi({
      example: 42,
    }),
  })
  .openapi("User");

const getUserRoute = createRoute({
  method: "get",
  path: "/users/{id}",
  request: {
    params: UserParamsSchema,
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: UserSchema,
        },
      },
      description: "Retrieve the user",
    },
  },
});

const createUserRoute = createRoute({
  method: "post",
  path: "/users",
  request: {
    body: {
      content: { "application/json": { schema: UserBodySchema } },
    },
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: UserSchema,
        },
      },
      description: "Retrieve the user",
    },
  },
});

const app = new OpenAPIHono();

app.openapi(createUserRoute, (c) => {
  const { age, name } = c.req.valid("json");
  return c.json(
    {
      id: uuidv7(),
      age,
      name,
    },
    200
  );
});

app.openapi(getUserRoute, (c) => {
  const { id } = c.req.valid("param");
  return c.json(
    {
      id,
      age: 20,
      name: "Ultra-man",
    },
    200
  );
});

// The OpenAPI documentation will be available at /doc
app.doc("/doc", {
  openapi: "3.0.0",
  info: {
    version: "1.0.0",
    title: "My API",
  },
});

app.get(
  "/ui",
  swaggerUI({
    url: "/doc",
  })
);

const port = 3000;
console.log(`Server is running on http://localhost:${port}`);

serve({
  fetch: app.fetch,
  port,
});
