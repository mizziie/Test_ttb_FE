'use client';

import React, { Suspense, useState } from 'react';
import SurveyContent from './SurveyClient';
import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

function SurveyWithDynamicSeq() {
  const searchParams = useSearchParams();
  const seq = searchParams?.get('seq') || '00001';
  
  return <SurveyContent seq={seq} />;
}

export default function SurveyPage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-between p-6 max-w-md mx-auto">
      <Suspense fallback={<div className="text-center">กำลังโหลด...</div>}>
        <SurveyWithDynamicSeq />
      </Suspense>
    </main>
  );
} 
