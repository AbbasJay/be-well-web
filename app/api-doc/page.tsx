// // import { getApiDocs } from "@/lib/swagger";
import ReactSwagger from "./react-swagger";
// // import { OpenAPIV3 } from "openapi-types";

// export default async function IndexPage() {
//   const spec = await getApiDocs();
//   return (
//     <section className="container">
//       {/* <ReactSwagger spec={spec as OpenAPIV3.Document} /> */}
//     </section>
//   );
// }

export default function IndexPage() {
  return (
    <section className="container py-8">
      <h1 className="text-2xl font-bold mb-6">API Documentation</h1>
      <ReactSwagger />
    </section>
  );
}
