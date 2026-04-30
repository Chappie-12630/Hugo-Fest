/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      "firebasestorage.googleapis.com",
      "images.unsplash.com",
      "api.qrserver.com",
    ],
  },
};

export default nextConfig;
