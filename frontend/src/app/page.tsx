import MainLayout from '@/components/main-layout';

// Force dynamic rendering for Docker builds
export const dynamic = 'force-dynamic';

export default function Home() {
  return <MainLayout />;
}
