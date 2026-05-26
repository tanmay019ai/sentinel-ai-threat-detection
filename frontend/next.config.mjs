import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  turbopack: {
    // Pin the Turbopack root to the frontend app directory.
    root: __dirname,
  },
};

export default nextConfig;
