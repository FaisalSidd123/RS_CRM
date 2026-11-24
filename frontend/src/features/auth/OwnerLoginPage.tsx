import React, { useState } from 'react';
import { useNavigate, NavLink } from 'react-router-dom';
import { useAuthStore } from '@/store/useAuthStore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from '@/components/ui/toast';
import { ShieldCheck, ArrowRight, Loader2, ArrowLeft, Lock } from 'lucide-react';

export const OwnerLoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuthStore();
  const [email, setEmail] = useState('imran@propertyos.pk');
  const [password, setPassword] = useState('admin123');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const res = await login(email, password);
    setIsLoading(false);

    if (!res.success) {
      toast.error(res.message, 'Owner Sign-in Failed');
      return;
    }

    // Strict Owner Portal Role Guard
    const currentUser = useAuthStore.getState().currentUser;
    if (currentUser?.role !== 'Owner') {
      useAuthStore.getState().logout();
      toast.error(
        `Access Denied: ${currentUser?.name} is registered as an ${currentUser?.role}. You cannot access the Owner Portal with non-owner credentials.`,
        'Owner Portal Restricted'
      );
      return;
    }

    toast.success(`Welcome to the Owner Portal, ${currentUser.name}!`);
    navigate('/app/dashboard');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md mb-6">
        <NavLink
          to="/login"
          className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-emerald-700 font-medium mb-4 transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Portal Selection
        </NavLink>

        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-emerald-700 text-white flex items-center justify-center font-bold text-lg shadow-sm">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <div>
            <h2 className="font-heading text-xl font-bold text-slate-900">
              Agency Owner <span className="text-emerald-700">Portal</span>
            </h2>
            <p className="text-xs text-slate-500">Sign in to access agency P&L, commissions, and staff</p>
          </div>
        </div>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Card className="rounded-[12px] border-slate-200 shadow-md bg-white">
          <CardHeader className="space-y-1 pb-3">
            <CardTitle className="text-base font-semibold">Owner Authentication</CardTitle>
            <CardDescription className="text-xs">
              Enter verified owner credentials or use the principal demo account
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            <form onSubmit={handleLogin} className="space-y-3.5">
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-700">Owner Email</label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="imran@propertyos.pk"
                  required
                />
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium text-slate-700">Password</label>
                  <span className="text-[11px] text-slate-400">Default: admin123</span>
                </div>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-10 font-semibold bg-emerald-700 hover:bg-emerald-800 text-white flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Verifying Owner Identity...
                  </>
                ) : (
                  <>
                    Sign In to Owner Portal <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </Button>
            </form>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 flex items-start gap-2 text-xs text-slate-500">
              <Lock className="h-3.5 w-3.5 text-emerald-700 shrink-0 mt-0.5" />
              <span>Only accounts with the <strong>Owner</strong> role are authorized to access this portal.</span>
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <NavLink to="/login/manager" className="hover:text-blue-700 hover:underline">
                Manager Login →
              </NavLink>
              <NavLink to="/login/agent" className="hover:text-amber-700 hover:underline">
                Agent Login →
              </NavLink>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
