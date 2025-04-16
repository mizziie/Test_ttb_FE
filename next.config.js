/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'standalone',

  // ปิดการ prerender static pages เพื่อแก้ปัญหา useSearchParams
  staticPageGenerationTimeout: 0,

  // ตั้งค่าสำหรับ API
  serverRuntimeConfig: {
    // ลดการตรวจสอบความปลอดภัยอย่างเข้มงวดเพื่อแก้ปัญหา "Removing unpermitted intrinsics"
    experimentalBypassFor: {
      secureCookies: true
    }
  },

  publicRuntimeConfig: {
    apiTimeout: 3000, // timeout สำหรับ API
  },

  async rewrites() {
    return [
      {
        source: '/api/surveys/:seq',
        destination: 'http://host.docker.internal:8080/api/surveys/:seq',
      },
      {
        source: '/api/submit-survey',
        destination: 'http://host.docker.internal:8080/api/submit-survey',
      }
    ]
  },
};

module.exports = nextConfig; 