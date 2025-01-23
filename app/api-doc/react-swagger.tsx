// "use client";

// import { useEffect, useState } from "react";
// import dynamic from "next/dynamic";
// import "swagger-ui-react/swagger-ui.css";
// import { OpenAPIV3 } from "openapi-types";

// const SwaggerUI = dynamic(() => import("swagger-ui-react"), {
//   ssr: false,
//   loading: () => <div>Loading API documentation...</div>,
// });

// type Props = {
//   spec: OpenAPIV3.Document;
// };

// function ReactSwagger({ spec }: Props) {
//   const [mounted, setMounted] = useState(false);

//   useEffect(() => {
//     setMounted(true);
//   }, []);

//   if (!mounted) {
//     return <div>Loading API documentation...</div>;
//   }

//   return (
//     <div className="swagger-wrapper">
//       <SwaggerUI spec={spec} />
//     </div>
//   );
// }

// export default ReactSwagger;

export default function ReactSwagger() {
  return <div>Hello World</div>;
}
