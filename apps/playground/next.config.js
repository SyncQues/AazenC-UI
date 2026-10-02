/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@aazenc/ui", "@aazenc/themes", "@aazenc/utils"],
  experimental: {
    optimizePackageImports: ["@aazenc/ui", "@aazenc/themes", "@aazenc/utils"],
  },
  async redirects() {
    return [
      {
        source: "/docs",
        destination: "/getting-started",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
