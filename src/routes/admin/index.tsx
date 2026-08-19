import { createFileRoute, Link, redirect } from '@tanstack/react-router';
import { getSession } from '@/lib/auth.functions';

export const Route = createFileRoute('/admin')({
  beforeLoad: async () => {
    const session = await getSession();
    if (!session.user || !['owner', 'admin', 'developer'].includes(session.role || '')) {
      throw redirect({ to: '/auth' });
    }
    return { session };
  },
  component: AdminLayout,
});

function AdminLayout() {
  return (
    <div className="min-h-screen bg-[#020617] text-white flex">
      {/* Sidebar */}
      <aside className="w-64 border-r border-white/10 p-6 flex flex-col gap-8">
        <div className="text-2xl font-black italic tracking-tighter text-neon-cyan">
          AMBITION <span className="text-white">OS</span>
        </div>
        
        <nav className="flex flex-col gap-2">
          <Link to="/admin" className="p-4 rounded-xl bg-white/5 border border-white/10 hover:border-neon-cyan transition-all font-bold uppercase text-xs tracking-widest">
            Dashboard
          </Link>
          <Link to="/admin/inquiries" className="p-4 rounded-xl hover:bg-white/5 border border-transparent hover:border-white/10 transition-all font-bold uppercase text-xs tracking-widest">
            Inquiries
          </Link>
          <Link to="/admin/quotes" className="p-4 rounded-xl hover:bg-white/5 border border-transparent hover:border-white/10 transition-all font-bold uppercase text-xs tracking-widest">
            Custom Orders
          </Link>
          <Link to="/admin/tracking" className="p-4 rounded-xl hover:bg-white/5 border border-transparent hover:border-white/10 transition-all font-bold uppercase text-xs tracking-widest">
            Geolocation
          </Link>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-12">
        <header className="mb-12 flex justify-between items-center">
          <h1 className="text-4xl font-black uppercase italic tracking-tighter">Command Center</h1>
          <div className="flex items-center gap-4">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-neon-lime bg-neon-lime/10 px-3 py-1 rounded-full border border-neon-lime/20">
              Developer Active
            </span>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <StatCard title="Total Orders" value="12" change="+20%" />
          <StatCard title="Active Inquiries" value="45" change="+5%" />
          <StatCard title="Global Reach" value="28" subtitle="Countries" />
        </div>

        <div className="bg-white/[0.02] border border-white/5 rounded-[2rem] p-8">
          <h2 className="text-xl font-black uppercase italic mb-6">Recent Activity</h2>
          <div className="space-y-4">
             <ActivityItem user="John Doe" action="Submitted quote" time="2h ago" />
             <ActivityItem user="System" action="Order AS-9X2L processed" time="5h ago" />
             <ActivityItem user="Admin" action="Updated site settings" time="1d ago" />
          </div>
        </div>
      </main>
    </div>
  );
}

function StatCard({ title, value, change, subtitle }: any) {
  return (
    <div className="bg-white/[0.02] border border-white/5 p-8 rounded-[2rem] relative overflow-hidden group hover:border-neon-cyan/50 transition-all">
      <div className="absolute top-0 right-0 w-32 h-32 bg-neon-cyan/5 blur-[50px] -z-10 group-hover:bg-neon-cyan/10 transition-all" />
      <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground mb-4">{title}</p>
      <div className="flex items-end gap-3">
        <h3 className="text-5xl font-black italic tracking-tighter">{value}</h3>
        {change && <span className="text-neon-lime text-xs font-bold mb-2">{change}</span>}
        {subtitle && <span className="text-muted-foreground text-xs font-bold mb-2 uppercase tracking-widest">{subtitle}</span>}
      </div>
    </div>
  );
}

function ActivityItem({ user, action, time }: any) {
  return (
    <div className="flex items-center justify-between p-4 border-b border-white/5 last:border-0">
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10" />
        <div>
          <p className="text-sm font-bold">{user}</p>
          <p className="text-xs text-muted-foreground">{action}</p>
        </div>
      </div>
      <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{time}</span>
    </div>
  );
}
