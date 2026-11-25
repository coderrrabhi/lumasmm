import { TELEGRAM_CHANNEL_URL, TELEGRAM_SUPPORT_URL } from '@/lib/contacts';
import { LumaBrand } from '@/components/LumaBrand';
import { Button } from '@/components/ui/button';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Wallet, Settings, LifeBuoy, Shield, LogOut, Rocket, Sparkles, X, Code2, Send, Layers, ShoppingCart, History, ArrowUpRight, Gift, MessageSquareQuote } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useCurrency } from '@/hooks/useCurrency';
import { isAdsOrderSection } from '@/lib/platform-options';

interface SidebarProps { onClose?: () => void; }
const groups = [
  { label: 'Workspace', items: [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
    { icon: ShoppingCart, label: 'Single Order', path: '/single-order' },
    { icon: History, label: 'Single Order History', path: '/orders' },
    { icon: Rocket, label: 'Full Engagement', path: '/engagement-order' },
    { icon: Layers, label: 'Mass Order', path: '/engagement-order?mode=mass' },
    { icon: Sparkles, label: 'Engagement Orders', path: '/engagement-orders' },
  ]},
  { label: 'Account', items: [
    { icon: Wallet, label: 'Wallet', path: '/wallet' },
    { icon: Gift, label: 'My Referrals', path: '/referrals' },
    { icon: MessageSquareQuote, label: 'Reviews', path: '/reviews' },
    { icon: Code2, label: 'API Access', path: '/api-access' },
    { icon: LifeBuoy, label: 'Support', path: '/support' },
    { icon: Settings, label: 'Settings', path: '/settings' },
  ]},
];

export function Sidebar({ onClose }: SidebarProps) {
  const location = useLocation();
  const { isAdmin, signOut, wallet, profile } = useAuth();
  const { formatPrice, currency } = useCurrency();
  const inAdmin = location.pathname.startsWith('/admin');
  const active = (path: string) => {
    if (path.startsWith('/engagement-order') && !path.startsWith('/engagement-orders')) {
      if (location.pathname !== '/engagement-order' || isAdsOrderSection(location.search)) return false;
      return path.includes('mode=mass') === location.search.includes('mode=mass');
    }
    return location.pathname === path;
  };
  return (
    <div className="member-sidebar luma-sidebar h-full w-full flex flex-col overflow-hidden">
      <div className="luma-sidebar-brand">
        <Link to="/dashboard" onClick={onClose}><LumaBrand /></Link>
        <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close navigation menu" className="lg:hidden"><X className="h-5 w-5" /></Button>
      </div>
      {profile && <div className="luma-sidebar-account">
        <div className="luma-sidebar-person">
          <span className="luma-avatar">{profile.full_name?.[0]?.toUpperCase() || profile.email?.[0]?.toUpperCase() || 'U'}</span>
          <div className="min-w-0"><p className="truncate font-semibold">{profile.full_name || 'User'}</p><p className="luma-person-email truncate">{profile.email}</p></div>
        </div>
        <div className="luma-sidebar-wallet">
          <div className="flex items-center justify-between gap-2"><span className="luma-wallet-caption">Wallet balance</span><span className="luma-wallet-currency">{currency}</span></div>
          <div className="flex items-center justify-between gap-3 mt-2"><strong className="luma-wallet-value">{formatPrice(wallet?.balance || 0)}</strong><Button asChild size="sm"><Link to="/wallet" onClick={onClose}><Wallet className="h-4 w-4" />Add Funds</Link></Button></div>
        </div>
      </div>}
      <nav className="luma-sidebar-links flex-1 overflow-y-auto" aria-label="Workspace">
        <div className="luma-sidebar-group">
          <p className="luma-nav-caption">Menu</p>
          {groups.flatMap(group => group.items).map(item => <Button key={item.path} variant="ghost" asChild className={`luma-sidebar-link ${active(item.path) ? 'is-current' : ''}`}><Link to={item.path} onClick={onClose} aria-label={item.label} title={item.label} aria-current={active(item.path) ? 'page' : undefined}><item.icon className="h-[18px] w-[18px]" aria-hidden="true" /><span>{item.label}</span>{active(item.path) && <span className="luma-active-mark" />}</Link></Button>)}
        </div>
        {isAdmin && <div className="luma-sidebar-group luma-admin-navigation">
          <p className="luma-nav-caption">Admin</p>
          <Button variant="ghost" asChild className={`luma-sidebar-link ${inAdmin ? 'is-current' : ''}`}><Link to="/admin" onClick={onClose} aria-label="Admin Panel" title="Admin Panel" aria-current={inAdmin ? 'page' : undefined}><Shield className="h-[18px] w-[18px]" aria-hidden="true" /><span>Admin Panel</span></Link></Button>
        </div>}
      </nav>
      <div className="luma-sidebar-footer">
        <Button variant="ghost" asChild className="luma-telegram"><a href={TELEGRAM_CHANNEL_URL} target="_blank" rel="noopener noreferrer"><Send className="h-5 w-5" /><span>Join Telegram</span><ArrowUpRight className="h-4 w-4" /></a></Button>
        <Button variant="ghost" asChild className="luma-telegram"><a href={TELEGRAM_SUPPORT_URL} target="_blank" rel="noopener noreferrer"><LifeBuoy className="h-5 w-5" /><span>Telegram Support</span><ArrowUpRight className="h-4 w-4" /></a></Button>
        <Button variant="ghost" onClick={() => signOut()} className="luma-signout"><LogOut className="h-4 w-4" /><span>Sign out</span></Button>
      </div>
    </div>
  );
}
