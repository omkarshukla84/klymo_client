import React, { Suspense } from 'react';
import EndClient from './EndClient';

export default function EndPage() {
  return (
    <Suspense fallback={null}>
      <EndClient />
    </Suspense>
  );
}
