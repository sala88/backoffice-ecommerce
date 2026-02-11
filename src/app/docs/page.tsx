'use client';

import dynamic from 'next/dynamic';
import { openApiDoc } from '../../lib/openapi';

const SwaggerUI = dynamic(() => import('swagger-ui-react'), { ssr: false });
import 'swagger-ui-react/swagger-ui.css';

export default function DocsPage() {
  return (
    <div className="min-h-screen bg-white p-8">
      <h1 className="text-2xl font-bold mb-4">OpenAPI Docs (Swagger UI)</h1>
      <div className="mb-8">
        <SwaggerUI spec={openApiDoc} />
      </div>
    </div>
  );
}
