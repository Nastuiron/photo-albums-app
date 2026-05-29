import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/current-user';
import DashboardClient from '../../features/albums/components/DashboardClient';

export default async function DashboardPage() {
  const user = await getCurrentUser();
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3001';

  if (!user) {
    redirect('/login');
  }

  return <DashboardClient user={user} appUrl={appUrl} />;
}
