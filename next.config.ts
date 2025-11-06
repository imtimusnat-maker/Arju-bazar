import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'ik.imagekit.io',
        port: '',
        pathname: '/**',
      },
    ],
  },
  env: {
    NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY: 'public_c4ZeIR2RUTeVp4nR4SoIF3R8f1w=',
    IMAGEKIT_PRIVATE_KEY: 'private_zgQlXrn5R1TAAo0jgoELO/NfvyI=',
    NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT: 'https://ik.imagekit.io/yajy2sbsw',
    SMS_API_KEY: 'Y8PBw4FT3qsThMnazaiA',
    SMS_SENDER_ID: '8809617626745',
  }
};

export default nextConfig;
