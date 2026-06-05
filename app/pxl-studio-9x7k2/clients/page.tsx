import prisma from '@/lib/prisma';
import ClientsManager from "./ClientsManager";

export default async function ClientsPage() {
  const clients = await prisma.prominentClient.findMany({
    orderBy: { order: "asc" },
  });

  return (
    <>
      <div className="pageHeader">
        <div>
          <div className="pageTitle">Prominent Clients</div>
          <div className="pageSubtitle">
            Manage your featured clients. These will appear in the homepage footer section with their logos.
          </div>
        </div>
        <span className="badge badgeBlue">{clients.length} Clients</span>
      </div>
      <ClientsManager initialClients={clients} />
    </>
  );
}
