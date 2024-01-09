import { generateOpenApiDocument } from "trpc-openapi";
import { appRouter } from "./root";
import { env } from "~/env";

export const openApiDocument = generateOpenApiDocument(appRouter, {
  title: "WortHafen API",
  version: "1.0.0",
  baseUrl: `${env.OWN_SERVER_URL}/api`,
  securitySchemes: {},
});
