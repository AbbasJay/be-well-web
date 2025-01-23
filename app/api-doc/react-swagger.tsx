"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import "swagger-ui-react/swagger-ui.css";
import { OpenAPIV3 } from "openapi-types";

const SwaggerUI = dynamic(() => import("swagger-ui-react"), {
  ssr: false,
  loading: () => <div>Loading API documentation...</div>,
});

export default function ReactSwagger() {
  const [spec, setSpec] = useState<OpenAPIV3.Document | null>(null);

  useEffect(() => {
    const fetchSpec = async () => {
      const response = await fetch("/api/docs");
      const data = await response.json();
      setSpec(data);
    };
    fetchSpec();
  }, []);

  if (!spec) {
    return <div>Loading API documentation...</div>;
  }

  return (
    <div className="swagger-wrapper">
      <SwaggerUI spec={spec} />
    </div>
  );
}
