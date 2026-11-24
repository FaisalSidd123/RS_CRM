import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ShieldCheck, UserCheck, Briefcase, ArrowRight, Lock } from 'lucide-react';

export const PortalSelectPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-xl text-center mb-8">
        <div className="inline-flex h-12 w-12 rounded-xl bg-emerald-700 text-white items-center justify-center font-bold text-xl shadow-md mb-3">
          P
        </div>
        <h2 className="font-heading text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
          PropertyOS <span className="text-emerald-700 font-normal">Pakistan</span>
        </h2>
        <p className="mt-2 text-sm text-slate-600">
          Select your dedicated portal to access your agency workspace
        </p>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-2xl space-y-4">
        {/* 1. Owner Portal Card */}
        <Card
          onClick={() => navigate('/login/owner')}
          className="border-slate-200 hover:border-emerald-600 hover:shadow-md transition-all cursor-pointer bg-white group rounded-[12px]"
        >
          <CardContent className="p-5 flex items-center justify-between">
            <div className="flex items-start gap-4">
              <div className="h-11 w-11 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center justify-center shrink-0 group-hover:bg-emerald-700 group-hover:text-white transition-colors">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-heading font-bold text-slate-900 text-base group-hover:text-emerald-700 transition-colors">
                    Agency Owner & Principal Portal
                  </h3>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 uppercase tracking-wider">
                    Full Access
                  </span>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed max-w-md">
                  P&L financial metrics, revenue, staff commissions, unassigned leads pool, and agency settings.
                </p>
              </div>
            </div>
            <div className="text-slate-400 group-hover:text-emerald-700 transition-transform group-hover:translate-x-1 shrink-0 ml-4">
              <ArrowRight className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        {/* 2. Manager Portal Card */}
        <Card
          onClick={() => navigate('/login/manager')}
          className="border-slate-200 hover:border-blue-600 hover:shadow-md transition-all cursor-pointer bg-white group rounded-[12px]"
        >
          <CardContent className="p-5 flex items-center justify-between">
            <div className="flex items-start gap-4">
              <div className="h-11 w-11 rounded-xl bg-blue-50 border border-blue-200 text-blue-800 flex items-center justify-center shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                <UserCheck className="h-5 w-5" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-heading font-bold text-slate-900 text-base group-hover:text-blue-700 transition-colors">
                    Branch Operations Manager Portal
                  </h3>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 uppercase tracking-wider">
                    Operations
                  </span>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed max-w-md">
                  WhatsApp lead ingestion, exclusive concurrency lock engine, follow-up schedules, and site visit allocation.
                </p>
              </div>
            </div>
            <div className="text-slate-400 group-hover:text-blue-700 transition-transform group-hover:translate-x-1 shrink-0 ml-4">
              <ArrowRight className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        {/* 3. Agent Portal Card */}
        <Card
          onClick={() => navigate('/login/agent')}
          className="border-slate-200 hover:border-amber-600 hover:shadow-md transition-all cursor-pointer bg-white group rounded-[12px]"
        >
          <CardContent className="p-5 flex items-center justify-between">
            <div className="flex items-start gap-4">
              <div className="h-11 w-11 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 flex items-center justify-center shrink-0 group-hover:bg-amber-600 group-hover:text-white transition-colors">
                <Briefcase className="h-5 w-5" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-heading font-bold text-slate-900 text-base group-hover:text-amber-700 transition-colors">
                    Field Advisor & Agent Portal
                  </h3>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 uppercase tracking-wider">
                    Field Execution
                  </span>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed max-w-md">
                  Assigned buyer visits, tour feedback logging, and closing deals across the Token to Transfer pipeline.
                </p>
              </div>
            </div>
            <div className="text-slate-400 group-hover:text-amber-700 transition-transform group-hover:translate-x-1 shrink-0 ml-4">
              <ArrowRight className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <div className="flex items-center justify-center gap-2 pt-4 text-xs text-slate-400">
          <Lock className="h-3.5 w-3.5" />
          <span>Strict Role-Based Access Control Active. Direct cross-portal entry is blocked.</span>
        </div>
      </div>
    </div>
  );
};
