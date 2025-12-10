const phase = process.env.NEXT_PHASE;
const isProdBuild = phase === "phase-production-build";

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: isProdBuild ? "export" : undefined,
  trailingSlash: true,
};

export default nextConfig;
