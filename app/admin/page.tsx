import prisma from "../../lib/prisma";
import Link from "next/link";

export default async function AdminDashboard() {
  const [categoryCount, projectCount] = await Promise.all([
    prisma.category.count(),
    prisma.project.count(),
  ]);

  const recentProjects = await prisma.project.findMany({
    take: 6,
    orderBy: { id: 'desc' },
    include: { category: { include: { servicePage: true } }, media: true },
  });

  return (
    <>
      <div className="pageHeader">
        <div>
          <div className="pageTitle">Dashboard Overview</div>
          <div className="pageSubtitle">Welcome back — here's what's happening on your site.</div>
        </div>
        <Link href="/admin/projects" className="btnPrimary">+ New Project</Link>
      </div>

      <div className="statsGrid">
        <div className="statCard">
          <span className="statCardIcon">◈</span>
          <div className="statCardValue">{projectCount}</div>
          <div className="statCardLabel">Total Projects</div>
          <div className="statCardDelta">↑ Published globally</div>
        </div>
        <div className="statCard">
          <span className="statCardIcon">▤</span>
          <div className="statCardValue">{categoryCount}</div>
          <div className="statCardLabel">Categories</div>
          <div className="statCardDelta">Across 6 disciplines</div>
        </div>
        <div className="statCard">
          <span className="statCardIcon">⬡</span>
          <div className="statCardValue">6</div>
          <div className="statCardLabel">Disciplines</div>
          <div className="statCardDelta">Active service pages</div>
        </div>
        <div className="statCard">
          <span className="statCardIcon">◉</span>
          <div className="statCardValue">Live</div>
          <div className="statCardLabel">Site Status</div>
          <div className="statCardDelta" style={{ color: 'var(--adm-green)' }}>● Online</div>
        </div>
      </div>

      <div className="card" style={{ marginBottom: '24px' }}>
        <div className="cardHeader"><div className="cardTitle">Quick Actions</div></div>
        <div className="cardBody" style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <Link href="/admin/projects"   className="btnPrimary">+ Add Project</Link>
          <Link href="/admin/categories" className="btnGhost">+ Add Category</Link>
          <a href="/" target="_blank" rel="noopener noreferrer" className="btnGhost">↗ View Site</a>
        </div>
      </div>

      <div className="card">
        <div className="cardHeader">
          <div className="cardTitle">Recent Projects</div>
          <Link href="/admin/projects" className="btnGhost" style={{ padding: '7px 14px', fontSize: '0.8rem' }}>
            View All →
          </Link>
        </div>
        <div className="tableWrap">
          {recentProjects.length === 0 ? (
            <div className="emptyState">
              <div className="emptyStateIcon">◈</div>
              <div className="emptyStateText">No projects yet. Add your first project to get started.</div>
            </div>
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th>Thumbnail</th>
                  <th>Title</th>
                  <th>Category</th>
                  <th>Service Page</th>
                </tr>
              </thead>
              <tbody>
                {recentProjects.map(p => (
                  <tr key={p.id}>
                    <td>
                      {p.media && p.media.length > 0 ? (
                        p.media[0].type === 'IMAGE' ? (
                          <img src={p.media[0].url} alt={p.title} className="thumbCell" />
                        ) : (
                          <video src={p.media[0].url} className="thumbCell" muted />
                        )
                      ) : (
                        <div className="thumbPlaceholder">◈</div>
                      )}
                    </td>
                    <td style={{ fontWeight: 600 }}>{p.title}</td>
                    <td><span className="badge badgeBlue">{p.category.name}</span></td>
                    <td><span className="badge badgeGreen">{p.category.servicePage?.title}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </>
  );
}
