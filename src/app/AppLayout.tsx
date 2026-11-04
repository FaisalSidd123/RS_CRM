import React, { useState, useMemo } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Users2,
  Building2,
  Contact2,
  Briefcase,
  CalendarDays,
  CheckSquare,
  ShieldAlert,
  BadgePercent,
  MessageCircle,
  History,
  Settings,
  Search,
  Bell,
  Menu,
  X,
  ChevronDown,
  LogOut,
  Building,
  ExternalLink,
  Info,
} from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import { useAppStore } from '@/store/useAppStore';
import { can } from '@/lib/permissions';
import { UserRole } from '@/types';
import { AgentAvatar } from '@/components/AgentAvatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from '@/components/ui/toast';
import { cn } from '@/lib/utils';

export const AppLayout: React.FC = () => {
  const { currentUser, switchRole, switchUserById } = useAuthStore();
  const { notifications, markNotificationAsRead, markAllNotificationsAsRead, leads, properties, clients, agencyProfile } = useAppStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [bannerDismissed, setBannerDismissed] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  const unreadNotifs = notifications.filter((n) => !n.read);

  // Global search matching
  const searchResults = useMemo(() => {
    if (!searchQuery.trim() || searchQuery.length < 2) return null;
    const q = searchQuery.toLowerCase().trim();

    const matchedLeads = leads
      .filter((l) => l.name.toLowerCase().includes(q) || l.phone.includes(q))
      .slice(0, 3);

    const matchedProperties = properties
      .filter(
        (p) =>
          p.propertyCode.toLowerCase().includes(q) ||
          p.title.toLowerCase().includes(q) ||
          p.area.toLowerCase().includes(q)
      )
      .slice(0, 3);

    const matchedClients = clients
      .filter((c) => c.name.toLowerCase().includes(q) || c.phone.includes(q))
      .slice(0, 3);

    return { matchedLeads, matchedProperties, matchedClients };
  }, [searchQuery, leads, properties, clients]);

  // Navigation Items
  const navItems = [
    { label: 'Dashboard', icon: LayoutDashboard, path: '/app/dashboard', visible: true },
    { label: 'Leads', icon: Users2, path: '/app/leads', visible: true },
    { label: 'Properties', icon: Building2, path: '/app/properties', visible: true },
    { label: 'Clients', icon: Contact2, path: '/app/clients', visible: true },
    { label: 'Deals', icon: Briefcase, path: '/app/deals', visible: true },
    { label: 'Site Visits', icon: CalendarDays, path: '/app/visits', visible: true },
    { label: 'Tasks', icon: CheckSquare, path: '/app/tasks', visible: true },
    { label: 'Agents', icon: ShieldAlert, path: '/app/agents', visible: can(currentUser?.role, 'view_agents_page') },
    { label: 'Commissions', icon: BadgePercent, path: '/app/commissions', visible: can(currentUser?.role, 'view_agency_commissions') || currentUser?.role === 'Agent' },
    { label: 'WhatsApp', icon: MessageCircle, path: '/app/whatsapp', visible: can(currentUser?.role, 'view_whatsapp') },
    { label: 'Activity Log', icon: History, path: '/app/activity', visible: can(currentUser?.role, 'view_activity_log') },
    { label: 'Settings', icon: Settings, path: '/app/settings', visible: can(currentUser?.role, 'view_settings') },
  ];

  const handleRoleSwitch = (role: UserRole) => {
    switchRole(role);
    toast.info(`Switched active view to ${role} role. Permissions & views updated.`);
  };

  const handleLogout = () => {
    navigate('/login');
    toast.info('Logged out of PropertyOS.');
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col">
      {/* Thin Dismissible Demo Banner */}
      {!bannerDismissed && (
        <div className="bg-emerald-800 text-white px-4 py-1.5 text-xs flex items-center justify-between font-medium">
          <div className="flex items-center gap-2 mx-auto">
            <span className="bg-emerald-600/60 uppercase tracking-wider text-[10px] px-1.5 py-0.5 rounded font-semibold">Demo Mode</span>
            <span>All CRM data is simulated in Pakistan context (Karachi, Lahore, Islamabad). Changes persist in localStorage.</span>
          </div>
          <button
            onClick={() => setBannerDismissed(true)}
            className="hover:opacity-80 p-0.5"
            title="Dismiss banner"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* Top Header */}
      <header className="sticky top-0 z-30 h-14 bg-white border-b border-slate-200 px-4 md:px-6 flex items-center justify-between gap-4">
        {/* Left: Mobile menu toggle + Logo branding */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="p-1.5 text-slate-600 hover:text-slate-900 md:hidden rounded-md hover:bg-slate-100"
          >
            <Menu className="h-5 w-5" />
          </button>

          <NavLink to="/app/dashboard" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-emerald-700 text-white flex items-center justify-center font-bold text-sm shadow-xs">
              P
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="font-heading font-bold text-slate-900 text-base leading-tight">PropertyOS</span>
                <span className="text-[10px] uppercase tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-200 font-semibold px-1 rounded">PK</span>
              </div>
              <span className="text-[10px] text-slate-400 leading-none hidden sm:inline">{agencyProfile.name}</span>
            </div>
          </NavLink>
        </div>

        {/* Center: Global Search Bar */}
        <div className="flex-1 max-w-md hidden sm:block relative">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              type="text"
              placeholder="Search leads, clients, PK-DHA-0142..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setSearchOpen(true);
              }}
              onFocus={() => setSearchOpen(true)}
              className="pl-9 h-8 text-xs bg-slate-50 border-slate-200 focus:bg-white"
            />
          </div>

          {/* Quick Search Dropdown Results */}
          {searchOpen && searchResults && (
            <div className="absolute top-10 left-0 right-0 bg-white border border-slate-200 rounded-lg shadow-xl p-3 z-50 text-xs space-y-3">
              <div className="flex items-center justify-between pb-1 border-b border-slate-100">
                <span className="font-semibold text-slate-500 uppercase tracking-wider text-[10px]">Search Results</span>
                <button onClick={() => setSearchOpen(false)} className="text-slate-400 hover:text-slate-600">
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>

              {searchResults.matchedLeads.length > 0 && (
                <div>
                  <p className="font-medium text-slate-400 text-[10px] mb-1">LEADS</p>
                  {searchResults.matchedLeads.map((l) => (
                    <div
                      key={l.id}
                      onClick={() => {
                        navigate('/app/leads');
                        setSearchOpen(false);
                      }}
                      className="p-1.5 hover:bg-slate-50 rounded cursor-pointer flex items-center justify-between"
                    >
                      <span className="font-medium text-slate-800">{l.name}</span>
                      <span className="text-slate-400 font-mono">{l.phone}</span>
                    </div>
                  ))}
                </div>
              )}

              {searchResults.matchedProperties.length > 0 && (
                <div>
                  <p className="font-medium text-slate-400 text-[10px] mb-1">PROPERTIES</p>
                  {searchResults.matchedProperties.map((p) => (
                    <div
                      key={p.id}
                      onClick={() => {
                        navigate('/app/properties');
                        setSearchOpen(false);
                      }}
                      className="p-1.5 hover:bg-slate-50 rounded cursor-pointer flex items-center justify-between"
                    >
                      <span className="font-medium text-slate-800">{p.propertyCode} - {p.title}</span>
                      <span className="text-emerald-700 font-semibold">{p.area}</span>
                    </div>
                  ))}
                </div>
              )}

              {searchResults.matchedClients.length > 0 && (
                <div>
                  <p className="font-medium text-slate-400 text-[10px] mb-1">CLIENTS</p>
                  {searchResults.matchedClients.map((c) => (
                    <div
                      key={c.id}
                      onClick={() => {
                        navigate('/app/clients');
                        setSearchOpen(false);
                      }}
                      className="p-1.5 hover:bg-slate-50 rounded cursor-pointer flex items-center justify-between"
                    >
                      <span className="font-medium text-slate-800">{c.name}</span>
                      <span className="text-slate-500">{c.types.join(', ')}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right: Notifications + Role Badge + User Menu */}
        <div className="flex items-center gap-3">
          {/* Notifications Bell */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="relative p-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors">
                <Bell className="h-4 w-4" />
                {unreadNotifs.length > 0 && (
                  <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                  </span>
                )}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80 p-2">
              <div className="flex items-center justify-between px-2 py-1.5 border-b border-slate-100">
                <span className="font-semibold text-xs text-slate-900">Notifications</span>
                {unreadNotifs.length > 0 && (
                  <button
                    onClick={markAllNotificationsAsRead}
                    className="text-[11px] text-emerald-700 hover:underline font-medium"
                  >
                    Mark all read
                  </button>
                )}
              </div>
              <div className="max-h-72 overflow-y-auto space-y-1 py-1">
                {notifications.slice(0, 5).map((n) => (
                  <div
                    key={n.id}
                    onClick={() => {
                      markNotificationAsRead(n.id);
                      if (n.link) navigate(n.link);
                    }}
                    className={cn(
                      'p-2 rounded-md cursor-pointer text-xs space-y-0.5 transition-colors',
                      n.read ? 'bg-white hover:bg-slate-50' : 'bg-emerald-50/50 hover:bg-emerald-50 font-medium'
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-slate-900 font-semibold">{n.title}</span>
                      <span className="text-[10px] text-slate-400">{n.timestamp ? 'recent' : ''}</span>
                    </div>
                    <p className="text-[11px] text-slate-600 line-clamp-2">{n.message}</p>
                  </div>
                ))}
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Role Badge */}
          <div className="hidden sm:inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-600"></span>
            {currentUser?.role}
          </div>

          {/* User Avatar Menu with Switch Role */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2 p-1 rounded-lg hover:bg-slate-100 transition-colors focus:outline-none">
                <AgentAvatar name={currentUser?.name || 'User'} avatarText={currentUser?.avatar} size="sm" />
                <span className="text-xs font-medium text-slate-800 hidden md:inline">{currentUser?.name}</span>
                <ChevronDown className="h-3.5 w-3.5 text-slate-400 hidden md:inline" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 p-1.5">
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-xs font-semibold text-slate-900 leading-none">{currentUser?.name}</p>
                  <p className="text-[11px] text-slate-500 leading-none">{currentUser?.email}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuLabel className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                Demo Quick Switch Role
              </DropdownMenuLabel>
              <DropdownMenuItem onClick={() => handleRoleSwitch('Owner')} className={cn(currentUser?.role === 'Owner' && 'bg-slate-100 font-semibold')}>
                Owner (Imran Qureshi)
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleRoleSwitch('Manager')} className={cn(currentUser?.role === 'Manager' && 'bg-slate-100 font-semibold')}>
                Manager (Sana Malik)
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleRoleSwitch('Agent')} className={cn(currentUser?.role === 'Agent' && 'bg-slate-100 font-semibold')}>
                Agent (Bilal Ahmed)
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-red-600 focus:text-red-700">
                <LogOut className="h-3.5 w-3.5 mr-2" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* Main Body with Sidebar */}
      <div className="flex-1 flex overflow-hidden">
        {/* Desktop Sidebar */}
        <aside className="hidden md:flex w-56 flex-col border-r border-slate-200 bg-white shrink-0 py-4 px-3 justify-between">
          <nav className="space-y-1">
            {navItems
              .filter((item) => item.visible)
              .map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname.startsWith(item.path);

                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className={cn(
                      'flex items-center gap-2.5 px-3 py-2 rounded-[8px] text-xs font-medium transition-colors',
                      isActive
                        ? 'bg-emerald-50 text-emerald-800 font-semibold'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    )}
                  >
                    <Icon className={cn('h-4 w-4', isActive ? 'text-emerald-700' : 'text-slate-400')} />
                    <span>{item.label}</span>
                  </NavLink>
                );
              })}
          </nav>

          {/* Bottom agency summary badge */}
          <div className="pt-4 border-t border-slate-100 px-2 space-y-1">
            <div className="text-[11px] font-semibold text-slate-800">{agencyProfile.name}</div>
            <div className="text-[10px] text-slate-400">DHA Phase 6, Karachi</div>
            <NavLink
              to="/"
              target="_blank"
              className="inline-flex items-center gap-1 text-[11px] text-emerald-700 hover:underline pt-1 font-medium"
            >
              Marketing Website <ExternalLink className="h-2.5 w-2.5" />
            </NavLink>
          </div>
        </aside>

        {/* Mobile Sidebar Sheet */}
        <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
          <SheetContent side="left" className="w-64 p-4 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                <div className="h-8 w-8 rounded-lg bg-emerald-700 text-white flex items-center justify-center font-bold text-sm">
                  P
                </div>
                <div>
                  <h2 className="font-heading font-bold text-sm text-slate-900">PropertyOS</h2>
                  <p className="text-[10px] text-slate-400">{agencyProfile.name}</p>
                </div>
              </div>

              <nav className="space-y-1">
                {navItems
                  .filter((item) => item.visible)
                  .map((item) => {
                    const Icon = item.icon;
                    const isActive = location.pathname.startsWith(item.path);

                    return (
                      <NavLink
                        key={item.path}
                        to={item.path}
                        onClick={() => setMobileMenuOpen(false)}
                        className={cn(
                          'flex items-center gap-2.5 px-3 py-2 rounded-[8px] text-xs font-medium transition-colors',
                          isActive
                            ? 'bg-emerald-50 text-emerald-800 font-semibold'
                            : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                        )}
                      >
                        <Icon className={cn('h-4 w-4', isActive ? 'text-emerald-700' : 'text-slate-400')} />
                        <span>{item.label}</span>
                      </NavLink>
                    );
                  })}
              </nav>
            </div>

            <div className="pt-4 border-t border-slate-100">
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="w-full justify-start text-xs text-red-600"
              >
                <LogOut className="h-3.5 w-3.5 mr-2" />
                Logout
              </Button>
            </div>
          </SheetContent>
        </Sheet>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

