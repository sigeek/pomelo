import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The API route reads prompts/*.md at runtime, so ship them with the function.
  outputFileTracingIncludes: { "/api/generate": ["./prompts/**"] },
};

export default nextConfig;
