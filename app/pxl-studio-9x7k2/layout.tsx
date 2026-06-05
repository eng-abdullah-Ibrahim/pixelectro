import { getServerSession } from "next-auth/next";
import { authOptions } from "../api/auth/[...nextauth]/route";
import AdminShell from "./AdminShell";
import './admin.css';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);

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
