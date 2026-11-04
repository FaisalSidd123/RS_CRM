import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/useAuthStore';
import { INITIAL_USERS } from '@/data/users';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from '@/components/ui/toast';
import { ShieldCheck, UserCheck, Briefcase, Lock, ArrowRight, Check } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { switchUserById, switchRole } = useAuthStore();
  const [email, setEmail] = useState('imran@crescentrealty.pk');
  const [password, setPassword] = useState('demo1234');
  const [selectedRole, setSelectedRole] = useState<'Owner' | 'Manager' | 'Agent'>('Owner');

  const handleRoleQuickSelect = (role: 'Owner' | 'Manager' | 'Agent', userId: string, userEmail: string) => {
    setSelectedRole(role);
    setEmail(userEmail);
    switchUserById(userId);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    switchRole(selectedRole);
    toast.success(`Welcome to PropertyOS Pakistan! Logged in as ${selectedRole}.`);
    navigate('/app/dashboard');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center mb-6">
        <div className="inline-flex h-12 w-12 rounded-xl bg-emerald-700 text-white items-center justify-center font-bold text-xl shadow-md mb-3">
          P
        </div>
        <h2 className="font-heading text-2xl font-bold tracking-tight text-slate-900">
          PropertyOS <span className="text-emerald-700 font-normal text-lg">Pakistan</span>
        </h2>
        <p className="mt-1 text-xs sm:text-sm text-slate-500">
          One system to manage your entire real estate agency.
        </p>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md px-4">
        <Card className="rounded-[12px] border-slate-200 shadow-md bg-white">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-lg">Sign in to your agency portal</CardTitle>
            <CardDescription>
              Select a demo profile or enter your credentials below
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-5">
            {/* Quick Role Switcher Buttons */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Instant Demo Access — Choose Persona
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => handleRoleQuickSelect('Owner', 'usr-1', 'imran@crescentrealty.pk')}
                  className={`flex flex-col items-center justify-center p-2.5 rounded-lg border text-xs transition-all ${
                    selectedRole === 'Owner'
                      ? 'border-emerald-600 bg-emerald-50/80 text-emerald-900 font-semibold ring-1 ring-emerald-600'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                  }`}
                >
                  <ShieldCheck className="h-4 w-4 mb-1 text-emerald-700" />
                  <span>Owner</span>
                  <span className="text-[10px] text-slate-400 font-normal">Imran Q.</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleRoleQuickSelect('Manager', 'usr-2', 'sana@crescentrealty.pk')}
                  className={`flex flex-col items-center justify-center p-2.5 rounded-lg border text-xs transition-all ${
                    selectedRole === 'Manager'
                      ? 'border-emerald-600 bg-emerald-50/80 text-emerald-900 font-semibold ring-1 ring-emerald-600'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                  }`}
                >
                  <UserCheck className="h-4 w-4 mb-1 text-blue-600" />
                  <span>Manager</span>
                  <span className="text-[10px] text-slate-400 font-normal">Sana M.</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleRoleQuickSelect('Agent', 'usr-4', 'bilal@crescentrealty.pk')}
                  className={`flex flex-col items-center justify-center p-2.5 rounded-lg border text-xs transition-all ${
                    selectedRole === 'Agent'
                      ? 'border-emerald-600 bg-emerald-50/80 text-emerald-900 font-semibold ring-1 ring-emerald-600'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                  }`}
                >
                  <Briefcase className="h-4 w-4 mb-1 text-amber-600" />
                  <span>Agent</span>
                  <span className="text-[10px] text-slate-400 font-normal">Bilal A.</span>
                </button>
              </div>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-700">Email address</label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium text-slate-700">Password</label>
                  <span className="text-[11px] text-slate-400">demo1234</span>
                </div>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <Button type="submit" className="w-full h-10 font-semibold flex items-center justify-center gap-2">
                Sign In as {selectedRole}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </form>

            <div className="rounded-lg bg-slate-50 p-3 text-xs text-slate-500 space-y-1 border border-slate-100">
              <div className="flex items-center gap-1.5 font-semibold text-slate-700">
                <Lock className="h-3.5 w-3.5 text-emerald-700" />
                Enterprise Security Demonstration
              </div>
              <p className="text-[11px] leading-relaxed">
                Notice how switching to <strong>Agent</strong> hides financials, commissions, and masks owner telephone numbers automatically.
              </p>
            </div>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-slate-400 mt-6">
          PropertyOS Pakistan © 2026. Made for agencies in Karachi, Lahore & Islamabad.
        </p>
      </div>
    </div>
  );
};

