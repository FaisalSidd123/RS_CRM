import React, { useState } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { useAppStore } from '@/store/useAppStore';
import { PageHeader } from '@/components/PageHeader';
import { AgentAvatar } from '@/components/AgentAvatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { toast } from '@/components/ui/toast';
import { PERMISSIONS_MATRIX } from '@/lib/permissions';
import {
  Building2,
  Users2,
  ShieldCheck,
  Percent,
  CreditCard,
  RotateCcw,
  Check,
  X,
  AlertTriangle,
} from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const { currentUser } = useAuthStore();
  const { agencyProfile, updateAgencyProfile, users, resetDemoData } = useAppStore();

  const [activeTab, setActiveTab] = useState<'profile' | 'users' | 'permissions' | 'defaults' | 'subscription'>('profile');
  const [agencyName, setAgencyName] = useState(agencyProfile.name);
  const [city, setCity] = useState(agencyProfile.city);
  const [address, setAddress] = useState(agencyProfile.address);
  const [phone, setPhone] = useState(agencyProfile.phone);
  const [email, setEmail] = useState(agencyProfile.email);

  // Defaults
  const [buyerCommission, setBuyerCommission] = useState(agencyProfile.defaultBuyerCommission);
  const [sellerCommission, setSellerCommission] = useState(agencyProfile.defaultSellerCommission);
  const [agentShare, setAgentShare] = useState(agencyProfile.defaultAgentShare);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateAgencyProfile({
      name: agencyName,
      city,
      address,
      phone,
      email,
    });
    toast.success('Agency profile updated successfully.');
  };

  const handleSaveDefaults = (e: React.FormEvent) => {
    e.preventDefault();
    updateAgencyProfile({
      defaultBuyerCommission: Number(buyerCommission),
      defaultSellerCommission: Number(sellerCommission),
      defaultAgentShare: Number(agentShare),
    });
    toast.success('Agency commission defaults saved.');
  };

  const handleResetDemo = () => {
    if (window.confirm('Reset all demo CRM data back to initial seed? All custom edits will be re-initialized.')) {
      resetDemoData();
      toast.success('Demo CRM data successfully reset to fresh seed.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title="Agency Settings & Configuration"
        description="Manage Crescent Realty agency profile, team member roles, default commission rules, and subscription."
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleResetDemo}
              className="gap-1.5 text-xs text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Reset Demo Data
            </Button>
          </div>
        }
      />

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(val: any) => setActiveTab(val)}>
        <TabsList className="grid grid-cols-5 w-full sm:w-[620px]">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="users">Team & Roles</TabsTrigger>
          <TabsTrigger value="permissions">Permissions</TabsTrigger>
          <TabsTrigger value="defaults">Defaults</TabsTrigger>
          <TabsTrigger value="subscription">Subscription</TabsTrigger>
        </TabsList>

        {/* Tab 1: Profile */}
        <TabsContent value="profile" className="pt-4">
          <Card className="max-w-2xl">
            <CardHeader>
              <CardTitle>Agency Business Profile</CardTitle>
              <CardDescription>Branding displayed on customer brochures and WhatsApp communications</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
                <div className="space-y-1">
                  <label className="font-medium text-slate-700">Agency Legal Name</label>
                  <Input value={agencyName} onChange={(e) => setAgencyName(e.target.value)} />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-medium text-slate-700">Head Office City</label>
                    <Input value={city} onChange={(e) => setCity(e.target.value)} />
                  </div>
                  <div className="space-y-1">
                    <label className="font-medium text-slate-700">Official Phone Numbers</label>
                    <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-medium text-slate-700">Office Physical Address</label>
                  <Input value={address} onChange={(e) => setAddress(e.target.value)} />
                </div>

                <div className="space-y-1">
                  <label className="font-medium text-slate-700">Official Inquiries Email</label>
                  <Input value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>

                <Button type="submit" size="sm">
                  Save Agency Profile
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 2: Users & Roles */}
        <TabsContent value="users" className="pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Agency Team Members & Assigned Roles</CardTitle>
              <CardDescription>
                Assign Owner, Manager, or Field Agent privileges
              </CardDescription>
            </CardHeader>
            <CardContent>
              <table className="w-full text-xs text-left">
                <thead className="text-[11px] uppercase tracking-wider text-slate-500 border-b pb-2">
                  <tr>
                    <th className="py-2">Name</th>
                    <th className="py-2">Email</th>
                    <th className="py-2">Phone</th>
                    <th className="py-2">Current Role</th>
                    <th className="py-2">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {users.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-50">
                      <td className="py-2.5">
                        <div className="flex items-center gap-2">
                          <AgentAvatar name={u.name} avatarText={u.avatar} size="sm" />
                          <span className="font-semibold text-slate-900">{u.name}</span>
                        </div>
                      </td>
                      <td className="py-2.5 text-slate-600">{u.email}</td>
                      <td className="py-2.5 font-mono text-slate-600">{u.phone}</td>
                      <td className="py-2.5">
                        <span className="font-semibold text-slate-800">{u.role}</span>
                      </td>
                      <td className="py-2.5">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            u.active ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'
                          }`}
                        >
                          {u.active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 3: Permissions Matrix (Read-only display for demo) */}
        <TabsContent value="permissions" className="pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Security Role Permissions Matrix</CardTitle>
              <CardDescription>
                Strict role-based access control (RBAC). Agent data isolation prevents departing brokers from stealing agency relationships.
              </CardDescription>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="text-[11px] uppercase tracking-wider text-slate-500 border-b pb-2">
                  <tr>
                    <th className="py-2.5">Feature / Capability</th>
                    <th className="py-2.5 text-center">Owner (Imran)</th>
                    <th className="py-2.5 text-center">Manager (Sana)</th>
                    <th className="py-2.5 text-center">Agent (Bilal / Ayesha)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {Object.entries(PERMISSIONS_MATRIX).map(([key, perm]) => (
                    <tr key={key} className="hover:bg-slate-50">
                      <td className="py-2 text-slate-800 font-medium">{perm.label}</td>
                      <td className="py-2 text-center">
                        {perm.roles.includes('Owner') ? (
                          <Check className="h-4 w-4 text-emerald-600 mx-auto" />
                        ) : (
                          <X className="h-4 w-4 text-slate-300 mx-auto" />
                        )}
                      </td>
                      <td className="py-2 text-center">
                        {perm.roles.includes('Manager') ? (
                          <Check className="h-4 w-4 text-emerald-600 mx-auto" />
                        ) : (
                          <X className="h-4 w-4 text-slate-300 mx-auto" />
                        )}
                      </td>
                      <td className="py-2 text-center">
                        {perm.roles.includes('Agent') ? (
                          <Check className="h-4 w-4 text-emerald-600 mx-auto" />
                        ) : (
                          <X className="h-4 w-4 text-slate-300 mx-auto" />
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 4: Defaults */}
        <TabsContent value="defaults" className="pt-4">
          <Card className="max-w-xl">
            <CardHeader>
              <CardTitle>Commission & Transaction Defaults</CardTitle>
              <CardDescription>Standard Pakistani agency brokerage splits applied at deal creation</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSaveDefaults} className="space-y-4 text-xs">
                <div className="space-y-1">
                  <label className="font-medium text-slate-700">Default Buyer Side Brokerage %</label>
                  <Input
                    type="number"
                    step="0.25"
                    value={buyerCommission}
                    onChange={(e) => setBuyerCommission(Number(e.target.value))}
                  />
                  <span className="text-[10px] text-slate-400">Standard market rate in DHA & Clifton: 1.0%</span>
                </div>

                <div className="space-y-1">
                  <label className="font-medium text-slate-700">Default Seller Side Brokerage %</label>
                  <Input
                    type="number"
                    step="0.25"
                    value={sellerCommission}
                    onChange={(e) => setSellerCommission(Number(e.target.value))}
                  />
                  <span className="text-[10px] text-slate-400">Standard market rate in DHA & Clifton: 1.0%</span>
                </div>

                <div className="space-y-1">
                  <label className="font-medium text-slate-700">Default Selling Agent Share %</label>
                  <Input
                    type="number"
                    step="5"
                    value={agentShare}
                    onChange={(e) => setAgentShare(Number(e.target.value))}
                  />
                  <span className="text-[10px] text-slate-400">Standard agent incentive cut: 40.0%</span>
                </div>

                <Button type="submit" size="sm">
                  Save Commission Defaults
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 5: Subscription */}
        <TabsContent value="subscription" className="pt-4">
          <Card className="max-w-xl">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Current Plan: Growth Plan</CardTitle>
                  <CardDescription>PKR 12,999 / month • Billed monthly</CardDescription>
                </div>
                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                  Active Subscription
                </span>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 text-xs">
              <div className="p-3 bg-slate-50 border rounded-lg space-y-2">
                <div className="flex justify-between text-slate-600">
                  <span>Agent Seat Usage:</span>
                  <span className="font-bold text-slate-900">8 of 15 Agents used</span>
                </div>
                <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-600 rounded-full" style={{ width: `${(8 / 15) * 100}%` }} />
                </div>
              </div>

              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Next Renewal Date:</span>
                <span className="font-semibold text-slate-800">01 Dec 2026</span>
              </div>

              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Payment Method:</span>
                <span className="font-mono text-slate-800">HBL Corporate Debit (ending 4190)</span>
              </div>

              <Button variant="outline" size="sm" onClick={() => toast.info('Billing portal opens in new tab.')}>
                Upgrade to Agency Pro (PKR 24,999/mo)
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

