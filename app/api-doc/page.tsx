import { getApiDocs } from "@/lib/swagger";
import ReactSwagger from "./react-swagger";
import { OpenAPIV3 } from "openapi-types";
import { Suspense } from "react";

export default async function IndexPage() {
  const spec = await getApiDocs();

  return (
    <section className="container">
      <Suspense fallback={<div>Loading API documentation...</div>}>
        <ReactSwagger spec={spec as OpenAPIV3.Document} />
      </Suspense>
    </section>
  );
}
