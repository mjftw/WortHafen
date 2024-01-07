import { generateOpenApiDocument } from "trpc-openapi";
import { appRouter } from "./root";

export const openApiDocument = generateOpenApiDocument(appRouter, {
  title: "WortHafen API",
  version: "1.0.0",
  baseUrl: "/api",
});
