import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from '@/components/ui/toast';
import {
  Users2,
  Building2,
  Briefcase,
  CalendarDays,
  BadgePercent,
  MessageCircle,
  ShieldAlert,
  History,
  CheckCircle2,
  ChevronDown,
  ArrowRight,
  Lock,
  EyeOff,
  UserX,
  FileCheck,
  TrendingUp,
  Sparkles,
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const handleBookDemo = () => {
    toast.success('Thank you! Our Karachi onboarding team will contact you on WhatsApp within 15 minutes.');
  };

  const faqs = [
    {
      q: 'Is my agency client and owner data secure?',
      a: 'Yes, 100%. PropertyOS uses strict role-based access control. Field agents cannot export contacts or access owner telephone numbers without generating an immutable audit log entry for the agency owner.',
    },
    {
      q: 'Can field agents see the owner phone numbers?',
      a: 'No. By default, owner phone numbers are masked as "0300-12•••••" for agents. If an agent clicks "Request access", the number is temporarily revealed, an activity alert is sent to the owner, and the timestamp and IP are logged.',
    },
    {
      q: 'Does PropertyOS work smoothly on mobile devices?',
      a: 'Yes, the entire CRM is fully responsive. On mobile smartphones, tables automatically convert into stacked cards, and the full navigation collapses into an intuitive mobile drawer.',
    },
    {
      q: 'Can I import my existing client records and properties from Excel?',
      a: 'Yes. Our Pakistani onboarding team provides free spreadsheet migration from Excel or CSV files. All your historical leads, inventory listings, and client contacts are imported with zero downtime.',
    },
    {
      q: 'Does WhatsApp automation cost extra?',
      a: 'The PropertyOS software integration is included in the Agency Pro plan. WhatsApp Meta Business Cloud API message charges are billed directly by Meta based on local Pakistani conversation rates (~PKR 1.2 per conversation).',
    },
    {
      q: 'Can I cancel or upgrade my agency subscription anytime?',
      a: 'Yes, there are no long-term lock-in contracts. You can upgrade, downgrade, or cancel your subscription at the end of any billing month with one click.',
    },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A] flex flex-col font-sans">
      {/* 1. Navbar */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-emerald-700 text-white flex items-center justify-center font-bold text-base shadow-sm">
              P
            </div>
            <div className="flex items-center gap-2">
              <span className="font-heading font-bold text-slate-900 text-lg">PropertyOS</span>
              <span className="text-[10px] uppercase tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold px-1.5 py-0.5 rounded">
                Pakistan
              </span>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-xs font-semibold text-slate-600">
            <a href="#features" className="hover:text-emerald-700 transition-colors">Features</a>
            <a href="#security" className="hover:text-emerald-700 transition-colors">Data Security</a>
            <a href="#how-it-works" className="hover:text-emerald-700 transition-colors">How it works</a>
            <a href="#pricing" className="hover:text-emerald-700 transition-colors">Pricing</a>
            <a href="#faq" className="hover:text-emerald-700 transition-colors">FAQ</a>
          </nav>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/login')}
              className="text-xs font-semibold"
            >
              Login
            </Button>
            <Button
              size="sm"
              onClick={handleBookDemo}
              className="text-xs font-semibold bg-emerald-700 hover:bg-emerald-800"
            >
              Book a Demo
            </Button>
          </div>
        </div>
      </header>

      {/* 2. Hero Section */}
      <section className="py-16 md:py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column */}
          <div className="lg:col-span-6 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
              <Sparkles className="h-3.5 w-3.5 text-emerald-700" />
              Built Specifically for Pakistani Real Estate Agencies
            </div>

            <h1 className="font-heading text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900 leading-[1.15]">
              One system to manage your <span className="text-emerald-700">entire real estate agency.</span>
            </h1>

            <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-xl">
              Leads, properties, agents, site visits, deals and commissions in one place. Built for agencies in
              <strong> Karachi, Lahore and Islamabad</strong> dealing with DHA, Bahria Town, and Clifton inventory.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Button
                size="lg"
                onClick={() => navigate('/login')}
                className="bg-emerald-700 hover:bg-emerald-800 text-sm font-semibold h-11 px-6 shadow-sm gap-2"
              >
                View Live Demo
                <ArrowRight className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={handleBookDemo}
                className="text-sm font-semibold h-11 px-6 border-slate-300"
              >
                Book Agency Presentation
              </Button>
            </div>

            <div className="flex items-center gap-6 pt-3 text-xs text-slate-500 font-medium">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" /> No credit card required
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" /> 14-day free trial
              </span>
            </div>
          </div>

          {/* Right Column: Scaled-down Interactive Owner Dashboard Mockup */}
          <div className="lg:col-span-6">
            <div className="rounded-[12px] border border-slate-200 bg-white shadow-xl overflow-hidden p-4 space-y-3 pointer-events-none select-none text-[10px]">
              {/* Header Bar */}
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="h-6 w-6 rounded bg-emerald-700 text-white flex items-center justify-center font-bold text-[10px]">P</div>
                  <div>
                    <span className="font-bold text-slate-900">Good evening, Imran Qureshi</span>
                    <span className="text-slate-400 block text-[9px]">Crescent Realty • DHA Phase 6</span>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 font-bold border border-emerald-200">
                  Owner View
                </span>
              </div>

              {/* Row 1 KPI Mock */}
              <div className="grid grid-cols-4 gap-2">
                <div className="p-2 rounded bg-slate-50 border border-slate-100">
                  <span className="text-slate-400 block">New Leads</span>
                  <span className="font-bold text-slate-900 text-xs">120</span>
                </div>
                <div className="p-2 rounded bg-slate-50 border border-slate-100">
                  <span className="text-slate-400 block">Active Buyers</span>
                  <span className="font-bold text-slate-900 text-xs">80</span>
                </div>
                <div className="p-2 rounded bg-slate-50 border border-slate-100">
                  <span className="text-slate-400 block">Tours Today</span>
                  <span className="font-bold text-slate-900 text-xs">4 Visits</span>
                </div>
                <div className="p-2 rounded bg-slate-50 border border-slate-100">
                  <span className="text-slate-400 block">Deals Won</span>
                  <span className="font-bold text-emerald-700 text-xs">12 Closed</span>
                </div>
              </div>

              {/* Row 2 Financials Mock */}
              <div className="grid grid-cols-2 gap-2">
                <div className="p-2 rounded bg-emerald-50/50 border border-emerald-200">
                  <span className="text-slate-500 block">Agency Commission Earned</span>
                  <span className="font-bold text-emerald-800 text-sm">6.2 Crore PKR</span>
                </div>
                <div className="p-2 rounded bg-slate-50 border border-slate-100">
                  <span className="text-slate-500 block">Locked Split Protection</span>
                  <span className="font-bold text-slate-800 text-xs">1% Buyer + 1% Seller</span>
                </div>
              </div>

              {/* Leaderboard Mock */}
              <div className="p-2.5 rounded bg-white border border-slate-200 space-y-1">
                <div className="flex justify-between font-bold text-slate-700 text-[10px]">
                  <span>Agent Leaderboard</span>
                  <span>Volume Closed</span>
                </div>
                <div className="flex justify-between text-slate-600 pt-1">
                  <span>1. Ayesha Khan (Top Performer)</span>
                  <span className="font-bold text-emerald-700">18.5 Crore</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>2. Bilal Ahmed</span>
                  <span className="font-bold text-slate-800">12.0 Crore</span>
                </div>
                <div className="flex justify-between text-red-600">
                  <span>3. Usman Tariq</span>
                  <span className="font-bold">9 Overdue Follow-ups ⚠️</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Trust Strip */}
      <section className="py-6 bg-slate-100/60 border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-3">
          <p className="text-xs uppercase font-semibold text-slate-500 tracking-wider">
            Built for agencies working in DHA, Bahria Town, Clifton, Gulberg, F-7 & Diplomatic Enclave
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
            {['Zameen.com Leads', 'Facebook Ads', 'Instagram Inquiries', 'WhatsApp Business', 'Office Walk-ins', 'Overseas Referrals'].map((tag) => (
              <span
                key={tag}
                className="px-3 py-1 rounded-full text-xs font-medium bg-white text-slate-700 border border-slate-200 shadow-2xs"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* 4. Problem Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
          <h2 className="font-heading text-2xl sm:text-3xl font-bold text-slate-900">
            Why Pakistani real estate agencies lose revenue every month
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Traditional agencies still operate on personal WhatsApp chats and lost paper diaries.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <Card className="p-5 border-slate-200 bg-white space-y-2">
            <div className="h-9 w-9 rounded-lg bg-red-50 text-red-600 flex items-center justify-center font-bold text-sm">
              01
            </div>
            <h3 className="font-heading font-semibold text-sm text-slate-900">Leads lost in WhatsApp chats</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              When expensive Zameen and Meta leads hit field agents' private phones, 40% are never logged or followed up.
            </p>
          </Card>

          <Card className="p-5 border-slate-200 bg-white space-y-2">
            <div className="h-9 w-9 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center font-bold text-sm">
              02
            </div>
            <h3 className="font-heading font-semibold text-sm text-slate-900">Agents leave and take clients</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Brokers abruptly resign and take valuable buyer and seller relationships with them to start competing agencies.
            </p>
          </Card>

          <Card className="p-5 border-slate-200 bg-white space-y-2">
            <div className="h-9 w-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-sm">
              03
            </div>
            <h3 className="font-heading font-semibold text-sm text-slate-900">Commission disputes at month end</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Disagreements over buyer vs seller commission cuts and referral splits cause bitter internal fights.
            </p>
          </Card>

          <Card className="p-5 border-slate-200 bg-white space-y-2">
            <div className="h-9 w-9 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center font-bold text-sm">
              04
            </div>
            <h3 className="font-heading font-semibold text-sm text-slate-900">No visibility into field agents</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Agency owners have zero insight into who actually conducted site visits versus who has overdue follow-ups.
            </p>
          </Card>
        </div>
      </section>

      {/* 5. Features Grid */}
      <section id="features" className="py-16 bg-white border-y border-slate-200 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <h2 className="font-heading text-2xl sm:text-3xl font-bold text-slate-900">
              Complete Agency Operating System
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Everything your team needs to close high-value transactions with corporate rigor.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: Users2, title: 'Centralized Lead Capture', desc: 'Sync inquiries from Zameen, Facebook, and WhatsApp with instant duplicate phone alerts.' },
              { icon: Building2, title: 'Verified Property Inventory', desc: 'Catalog houses, apartments, and plots with legal document status (NOC, Allotment, Transfer).' },
              { icon: Briefcase, title: 'Pakistani Deals Pipeline', desc: 'Manage Bayana tokens, agreement signing, and transfer milestones with locked splits.' },
              { icon: CalendarDays, title: 'Site Visits & Fleet Pickup', desc: 'Schedule buyer viewing tours with driver pickup requests and 1-hour agent conflict warnings.' },
              { icon: BadgePercent, title: 'Commission Split Ledger', desc: 'Automated 1% buyer + 1% seller calculations with agent payouts and operational P&L.' },
              { icon: MessageCircle, title: 'WhatsApp Business API', desc: 'Automate greeting messages, 2-hour visit reminders, and Bayana payment notices.' },
              { icon: ShieldAlert, title: 'Agent Exit Reassignment', desc: 'Deactivate departing brokers with 1-click and reassign their entire pipeline instantly.' },
              { icon: History, title: 'Owner Activity Audit Trail', desc: 'Monitors contact views, data exports, and suspicious bulk phone access in real time.' },
              { icon: TrendingUp, title: 'Executive Owner Dashboard', desc: 'Revenue vs overhead expenses charts, agent leaderboard, and overdue follow-up alerts.' },
            ].map((f, i) => {
              const Icon = f.icon;
              return (
                <div key={i} className="p-5 rounded-[10px] border border-slate-200 bg-slate-50/50 space-y-2 hover:bg-white hover:shadow-sm transition-all">
                  <div className="h-9 w-9 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="font-heading font-semibold text-sm text-slate-900">{f.title}</h3>
                  <p className="text-xs text-slate-500 leading-relaxed">{f.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 6. "Your Data Stays Yours" Section (Core Selling Point) */}
      <section id="security" className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="rounded-[16px] bg-emerald-900 text-white p-8 md:p-12 space-y-8">
          <div className="max-w-2xl space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-300">
              Agency IP Protection
            </span>
            <h2 className="font-heading text-2xl sm:text-3xl font-extrabold tracking-tight">
              Your data stays yours. Never lose relationships when an agent leaves.
            </h2>
            <p className="text-xs sm:text-sm text-emerald-100 leading-relaxed">
              We built PropertyOS specifically to solve the biggest vulnerability in Pakistani real estate: brokers walking
              away with agency listings and private client phone books.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t border-emerald-800 text-xs">
            <div className="space-y-2">
              <div className="flex items-center gap-2 font-bold text-sm text-emerald-200">
                <EyeOff className="h-4 w-4" /> Masked Owner Contacts
              </div>
              <p className="text-emerald-100/80 leading-relaxed">
                Field agents see property owners as <code>0300-12•••••</code>. Any reveal request is logged to the owner’s
                audit log with timestamp and device IP.
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 font-bold text-sm text-emerald-200">
                <UserX className="h-4 w-4" /> 1-Click Portfolio Reassignment
              </div>
              <p className="text-emerald-100/80 leading-relaxed">
                When an agent is deactivated, all their active leads, clients, and open deals are transferred to another agent in
                seconds.
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 font-bold text-sm text-emerald-200">
                <Lock className="h-4 w-4" /> Locked Commission Splits
              </div>
              <p className="text-emerald-100/80 leading-relaxed">
                Commission agreements are locked at deal creation. No retrospective disputes over agent share or referral cuts at
                closing.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 7. How It Works */}
      <section id="how-it-works" className="py-16 bg-white border-y border-slate-200 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center max-w-xl mx-auto space-y-2">
            <h2 className="font-heading text-2xl sm:text-3xl font-bold text-slate-900">
              Get running in 3 simple steps
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              No technical setup. Full onboarding assistance in Urdu or English.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-2.5 text-center sm:text-left">
              <div className="h-10 w-10 rounded-xl bg-emerald-50 text-emerald-800 font-bold flex items-center justify-center text-base border border-emerald-200">
                1
              </div>
              <h3 className="font-heading font-semibold text-sm text-slate-900">Add your agency team</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Invite your managers and field agents. Assign roles so agents only see their assigned leads.
              </p>
            </div>

            <div className="space-y-2.5 text-center sm:text-left">
              <div className="h-10 w-10 rounded-xl bg-emerald-50 text-emerald-800 font-bold flex items-center justify-center text-base border border-emerald-200">
                2
              </div>
              <h3 className="font-heading font-semibold text-sm text-slate-900">Capture every inquiry</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Log inquiries from Zameen, Meta ads, or phone calls. Duplicate detection catches repeated numbers immediately.
              </p>
            </div>

            <div className="space-y-2.5 text-center sm:text-left">
              <div className="h-10 w-10 rounded-xl bg-emerald-50 text-emerald-800 font-bold flex items-center justify-center text-base border border-emerald-200">
                3
              </div>
              <h3 className="font-heading font-semibold text-sm text-slate-900">Track deals to commission</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Move deals from Bayana to Transfer. Automated commission ledgers compute agent payouts and net profit.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 8. Pricing Section */}
      <section id="pricing" className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="text-center max-w-xl mx-auto space-y-2 mb-12">
          <h2 className="font-heading text-2xl sm:text-3xl font-bold text-slate-900">
            Simple, transparent agency pricing
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Billed in Pakistani Rupees (PKR). 14-day free trial. No setup fee.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Starter Plan */}
          <Card className="p-6 border-slate-200 bg-white flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div>
                <h3 className="font-heading font-bold text-lg text-slate-900">Starter</h3>
                <p className="text-xs text-slate-500">For boutique agencies & partners</p>
              </div>

              <div>
                <span className="font-heading text-3xl font-extrabold text-slate-900">PKR 4,999</span>
                <span className="text-xs text-slate-500"> / month</span>
              </div>

              <ul className="space-y-2 text-xs text-slate-600">
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-600" /> Up to 3 agent accounts</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-600" /> Lead capture & duplicate detection</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-600" /> Property inventory catalog</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-600" /> Site visits calendar</li>
              </ul>
            </div>

            <Button variant="outline" onClick={() => navigate('/login')} className="w-full text-xs">
              Start Free Trial
            </Button>
          </Card>

          {/* Growth Plan (Highlighted) */}
          <Card className="p-6 border-2 border-emerald-600 bg-white flex flex-col justify-between space-y-6 shadow-md relative">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-emerald-600 text-white text-[10px] font-bold uppercase tracking-wider px-3 py-0.5 rounded-full">
              Most Popular
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="font-heading font-bold text-lg text-slate-900">Growth</h3>
                <p className="text-xs text-slate-500">For growing commercial & residential agencies</p>
              </div>

              <div>
                <span className="font-heading text-3xl font-extrabold text-slate-900">PKR 12,999</span>
                <span className="text-xs text-slate-500"> / month</span>
              </div>

              <ul className="space-y-2 text-xs text-slate-600">
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-600" /> Up to 15 agent accounts</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-600" /> Everything in Starter</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-600" /> Deals & Bayana token pipeline</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-600" /> Locked commission splits & ledger</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-600" /> Agent performance leaderboard</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-600" /> 1-Click portfolio exit reassignment</li>
              </ul>
            </div>

            <Button onClick={() => navigate('/login')} className="w-full text-xs bg-emerald-700 hover:bg-emerald-800">
              Start 14-Day Free Trial
            </Button>
          </Card>

          {/* Agency Pro Plan */}
          <Card className="p-6 border-slate-200 bg-white flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div>
                <h3 className="font-heading font-bold text-lg text-slate-900">Agency Pro</h3>
                <p className="text-xs text-slate-500">For large market leaders with multiple branches</p>
              </div>

              <div>
                <span className="font-heading text-3xl font-extrabold text-slate-900">PKR 24,999</span>
                <span className="text-xs text-slate-500"> / month</span>
              </div>

              <ul className="space-y-2 text-xs text-slate-600">
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-600" /> Unlimited agents & branches</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-600" /> Everything in Growth</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-600" /> WhatsApp automation rules & templates</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-600" /> Priority telephone & WhatsApp support</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-600" /> Custom legal documents branding</li>
              </ul>
            </div>

            <Button variant="outline" onClick={handleBookDemo} className="w-full text-xs">
              Contact Sales
            </Button>
          </Card>
        </div>
      </section>

      {/* 9. FAQ Accordion */}
      <section id="faq" className="py-16 bg-white border-t border-slate-200 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto space-y-8">
          <div className="text-center space-y-2">
            <h2 className="font-heading text-2xl sm:text-3xl font-bold text-slate-900">
              Frequently Asked Questions
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Everything agency directors ask about data security and setup
            </p>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <div
                key={i}
                className="rounded-[10px] border border-slate-200 bg-slate-50/50 overflow-hidden text-xs"
              >
                <button
                  onClick={() => setOpenFaqIndex(openFaqIndex === i ? null : i)}
                  className="w-full p-4 text-left font-semibold text-slate-900 flex items-center justify-between gap-4 hover:bg-slate-100/50 transition-colors"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    className={`h-4 w-4 shrink-0 text-slate-500 transition-transform ${
                      openFaqIndex === i ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                {openFaqIndex === i && (
                  <div className="p-4 pt-0 text-slate-600 leading-relaxed border-t border-slate-100/60 bg-white">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 10. Final CTA Band & Footer */}
      <section className="py-16 bg-emerald-800 text-white px-4 text-center">
        <div className="max-w-2xl mx-auto space-y-5">
          <h2 className="font-heading text-2xl sm:text-3xl font-bold">
            Ready to organize your agency?
          </h2>
          <p className="text-xs sm:text-sm text-emerald-100">
            Join premier real estate agencies across Karachi, Lahore and Islamabad who trust PropertyOS.
          </p>
          <div className="flex justify-center gap-3 pt-2">
            <Button
              size="lg"
              onClick={() => navigate('/login')}
              className="bg-white text-emerald-900 hover:bg-slate-100 text-sm font-semibold h-11 px-6 shadow-sm"
            >
              Test Live Interactive Demo
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={handleBookDemo}
              className="border-emerald-500 text-white hover:bg-emerald-700 text-sm font-semibold h-11 px-6"
            >
              Schedule Meeting
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-12 px-4 sm:px-6 lg:px-8 border-t border-slate-800 text-xs">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-emerald-700 text-white flex items-center justify-center font-bold text-sm">
              P
            </div>
            <div>
              <span className="font-heading font-bold text-white text-sm">PropertyOS Pakistan</span>
              <p className="text-[11px] text-slate-500">One system to manage your entire real estate agency.</p>
            </div>
          </div>

          <div className="flex flex-wrap justify-center gap-6 text-[11px]">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
            <a href="#security" className="hover:text-white transition-colors">Security</a>
            <a href="#faq" className="hover:text-white transition-colors">Support</a>
            <span className="text-slate-600">•</span>
            <span className="text-emerald-400 font-semibold">contact@propertyos.pk</span>
            <span className="font-mono text-slate-400">+92 (021) 3584-1290</span>
          </div>

          <div className="text-[11px] text-slate-500 text-center md:text-right">
            <span>Made with pride in Pakistan 🇵🇰</span>
            <div className="text-[10px] text-slate-600">© 2026 PropertyOS Inc. All rights reserved.</div>
          </div>
        </div>
      </footer>
    </div>
  );
};

