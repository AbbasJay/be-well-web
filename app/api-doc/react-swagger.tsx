"use client";

import dynamic from "next/dynamic";
import "swagger-ui-react/swagger-ui.css";
import { OpenAPIV3 } from "openapi-types";

const SwaggerUI = dynamic(() => import("swagger-ui-react"), {
  ssr: false,
  loading: () => <div>Loading API documentation...</div>,
});

type Props = {
  spec: OpenAPIV3.Document;
};

function ReactSwagger({ spec }: Props) {
  return (
    <div className="swagger-wrapper">
      <SwaggerUI spec={spec} />
    </div>
  );
}

export default ReactSwagger;
