import { LayoutDashboard, Users, Package, Layers, CreditCard, Gift, MessageSquareQuote, Network, Server, ClipboardList, Activity, History, Megaphone, LifeBuoy, Wallet, Link2 } from 'lucide-react';
export const adminNavigation = [
 { label: 'Overview', path: '/admin', icon: LayoutDashboard },
 { label: 'Users & wallets', path: '/admin/users', icon: Users },
 { label: 'Services', path: '/admin/services', icon: Layers },
 { label: 'Bundles', path: '/admin/bundles', icon: Package },
 { label: 'Provider accounts', path: '/admin/provider-accounts', icon: Server },
 { label: 'Service mapping', path: '/admin/service-provider-mapping', icon: Network },
 { label: 'Manual orders', path: '/admin/adsterra-orders', icon: ClipboardList },
 { label: 'Deposits', path: '/admin/deposits', icon: CreditCard },
 { label: 'Deposit bonus', path: '/admin/deposit-bonus', icon: Gift },
 { label: 'Referrals', path: '/admin/referrals', icon: Link2 },
 { label: 'Reviews', path: '/admin/reviews', icon: MessageSquareQuote },
 { label: 'Top-up plans', path: '/admin/topup-plan', icon: Wallet },
 { label: 'Live chat', path: '/admin/chat', icon: LifeBuoy },
 { label: 'Cron monitor', path: '/admin/cron-monitor', icon: Activity },
 { label: 'Audit log', path: '/admin/audit-log', icon: History },
 { label: 'Popup ads', path: '/admin/popup-ad', icon: Megaphone },
];
