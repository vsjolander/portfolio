/** @type {import('next').NextConfig} */

const nextConfig = {
  output: "export",
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  webpack: (config) => {
    config.module.rules.push({
      test: /\.glsl$/,
      use: ["raw-loader", "glslify-loader"],
    })
    return config
  },
}

export default nextConfig
