/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: {
    // Lint is run explicitly with `npm run lint`; it should not block deployments.
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
