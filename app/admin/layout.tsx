import { getServerSession } from "next-auth/next";
import AdminShell from "./AdminShell";
import './admin.css';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession();

  if (!session) {
    return <>{children}</>;
  }

  const userName = session.user?.name || 'Admin';

  return (
    <AdminShell userName={userName}>
      {children}
    </AdminShell>
  );
}
