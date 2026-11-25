import { ReactNode, useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { PanelLeftClose, PanelLeftOpen, ChevronRight, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LumaBrand } from '@/components/LumaBrand';
import { useAuth } from '@/hooks/useAuth';
import { Sidebar } from './Sidebar';
import { adminNavigation } from './admin-navigation';
import { MobileBottomNav } from './MobileBottomNav';
import { PopupAdDialog } from '@/components/PopupAdDialog';
import '@/styles/member-experience.css';

interface DashboardLayoutProps { children: ReactNode; }
export function DashboardLayout({ children }: DashboardLayoutProps) {
 const { user, isLoading, isAdmin, profile } = useAuth();
 const navigate = useNavigate();
 const location = useLocation();
 const [collapsed, setCollapsed] = useState(false);
 const inAdmin = location.pathname.startsWith('/admin');
 const adminPage = adminNavigation.find(item => item.path === location.pathname);
 useEffect(() => { if (!isLoading && !user) navigate('/auth'); }, [user, isLoading, navigate]);
 return <div className={`member-shell luma-smart-shell ${collapsed ? 'luma-nav-collapsed' : ''} ${inAdmin ? 'luma-admin-shell' : ''}`}>
  <aside className="luma-desktop-sidebar"><Sidebar /></aside>
  <MobileBottomNav />
  <main className="member-content luma-smart-content">
   <header className="luma-desktop-masthead">
    <Button variant="ghost" size="icon" onClick={() => setCollapsed(value => !value)} aria-label={collapsed ? 'Expand navigation' : 'Collapse navigation'} title={collapsed ? 'Expand navigation' : 'Collapse navigation'}>{collapsed ? <PanelLeftOpen className="h-5 w-5" /> : <PanelLeftClose className="h-5 w-5" />}</Button>
    {collapsed ? <Link to="/dashboard"><LumaBrand /></Link> : <nav className="luma-breadcrumb" aria-label="Breadcrumb"><Link to={inAdmin ? '/admin' : '/dashboard'}>{inAdmin ? 'Administration' : 'Workspace'}</Link>{adminPage && <><ChevronRight className="h-4 w-4" /><span>{adminPage.label}</span></>}</nav>}
    <div className="luma-top-account"><span className="luma-avatar">{profile?.full_name?.[0]?.toUpperCase() || 'U'}</span><span>{profile?.full_name || 'My account'}</span>{isAdmin && !inAdmin && <Button asChild variant="outline" size="sm"><Link to="/admin"><Shield className="h-4 w-4" />Admin</Link></Button>}</div>
   </header>
   <div className="luma-page-gutter"><div className="member-page">
    {isAdmin && inAdmin && <nav aria-label="Administration" className="mb-6 flex flex-wrap gap-2 border-b border-border pb-4">
     {adminNavigation.map(item => <Button key={item.path} asChild variant={location.pathname === item.path ? 'default' : 'outline'} size="sm" className="min-h-11"><Link to={item.path} aria-current={location.pathname === item.path ? 'page' : undefined}><item.icon className="h-4 w-4" aria-hidden="true" />{item.label}</Link></Button>)}
    </nav>}
    {children}</div></div>
  </main>
  <PopupAdDialog />
 </div>;
}
