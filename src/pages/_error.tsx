import React from 'react';
import { NextPage } from 'next';
import Image from 'next/image';
import Link from 'next/link';

interface ErrorProps {
  statusCode?: number;
}

const Error: NextPage<ErrorProps> = ({ statusCode }) => {
  return (
    <div className="flex flex-col w-full min-h-screen p-6">
      <div className="flex flex-col mb-6">
        <div className="w-full flex justify-start mb-4">
          <Image src="/images/logo-default.png" alt="TTB Logo" width={84} height={42} priority />
        </div>
      </div>
      
      <div className="flex-grow flex flex-col items-center justify-center">
        <h2 className="text-xl font-bold mb-4">
          {statusCode ? `เกิดข้อผิดพลาด: ${statusCode}` : 'เกิดข้อผิดพลาดที่ไม่คาดคิด'}
        </h2>
        <p className="text-center mb-6">
          ขออภัยในความไม่สะดวก กรุณาลองใหม่อีกครั้งในภายหลัง
        </p>
        {/* <Link href="/" className="bg-blue-500 text-white font-bold py-2 px-4 rounded w-full max-w-md text-center">
          กลับสู่หน้าหลัก
        </Link> */}
      </div>
    </div>
  );
};

Error.getInitialProps = ({ res, err }) => {
  const statusCode = res ? res.statusCode : err ? err.statusCode : 404;
  return { statusCode };
};

export default Error; 