import { LumaBrand } from '@/components/LumaBrand';
import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Menu, ShoppingCart, History, Rocket, Wallet, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sidebar } from './Sidebar';
const items = [
  { to: '/single-order', label: 'Single', icon: ShoppingCart },
  { to: '/orders', label: 'History', icon: History },
  { to: '/engagement-order', label: 'Engagement', icon: Rocket },
  { to: '/wallet', label: 'Wallet', icon: Wallet },
  { to: '/settings', label: 'Settings', icon: Settings },
];
export function MobileBottomNav() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const pageTitles: Record<string, string> = { '/dashboard': 'Dashboard', '/single-order': 'Single Order', '/orders': 'Order History', '/engagement-order': 'Engagement', '/engagement-orders': 'Engagement Orders', '/wallet': 'Wallet', '/settings': 'Settings', '/support': 'Support', '/api-access': 'API Access' };
  const title = location.pathname.startsWith('/admin') ? 'Admin' : pageTitles[location.pathname] || 'Workspace';
  return <>
    <header className="fixed top-0 left-0 right-0 z-40 lg:hidden">
      <div className="member-mobile-header luma-mobile-topbar">
        <LumaBrand />
        <div className="flex items-center gap-3"><span className="luma-mobile-page-title">{title}</span><Button variant="ghost" size="icon" onClick={() => setSidebarOpen(true)} aria-label="Open navigation menu"><Menu className="h-5 w-5" /></Button></div>
      </div>
    </header>
    <nav className="member-bottom-nav luma-mobile-nav" aria-label="Primary"><div className="member-bottom-nav-inner">
      {items.map(({ to, label, icon: Icon }) => <NavLink key={to} to={to} className={({ isActive }) => `member-bottom-nav-item ${isActive ? 'is-active' : ''}`}><span className="member-bottom-nav-icon"><Icon className="h-5 w-5" strokeWidth={1.8} /></span><span className="member-bottom-nav-label">{label}</span></NavLink>)}
    </div></nav>
    {sidebarOpen && <>
      <div className="fixed inset-0 bg-foreground/30 z-50 lg:hidden " onClick={() => setSidebarOpen(false)} />
      <div role="dialog" aria-label="Navigation menu" className="fixed inset-y-0 left-0 z-50 w-[85vw] max-w-[320px] lg:hidden"><Sidebar onClose={() => setSidebarOpen(false)} /></div>
    </>}
  </>;
}
