'use client';

import dynamic from 'next/dynamic';
import 'swagger-ui-react/swagger-ui.css';

// Dynamic import to avoid SSR issues
const SwaggerUI = dynamic(() => import('swagger-ui-react'), { ssr: false });

export default function DocsPage() {
  return (
    <div className="min-h-screen bg-white">
      <SwaggerUI url="/api/swagger.json" />
    </div>
  );
}
