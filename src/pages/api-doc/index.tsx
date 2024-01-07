import type { GetStaticProps, InferGetStaticPropsType } from "next";
import dynamic from "next/dynamic";
import "swagger-ui-react/swagger-ui.css";
import { openApiDocument } from "~/server/api/openapi";

function sanitiseSpec(spec: typeof openApiDocument): typeof openApiDocument {
  return JSON.parse(JSON.stringify(spec)) as typeof openApiDocument;
}
const SwaggerUI = dynamic(import("swagger-ui-react"), { ssr: false });

function ApiDoc({ spec }: InferGetStaticPropsType<typeof getStaticProps>) {
  return <SwaggerUI spec={spec} />;
}

export const getStaticProps: GetStaticProps<{
  spec: typeof openApiDocument;
}> = async () => {
  const sanitisedSpec = sanitiseSpec(openApiDocument);

  return {
    props: {
      spec: sanitisedSpec,
    },
  };
};

export default ApiDoc;
