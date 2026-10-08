/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      { source: "/account/profile", destination: "/setup?step=0", permanent: false },
      { source: "/account/strengths", destination: "/setup?step=4", permanent: false },
    ];
  },
};

export default nextConfig;
