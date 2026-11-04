import React, { useState } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { WhatsAppTemplate } from '@/types';
import { PageHeader } from '@/components/PageHeader';
import { StatusBadge } from '@/components/StatusBadge';
import { DataTable, Column } from '@/components/DataTable';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { toast } from '@/components/ui/toast';
import { formatDate, formatTime } from '@/lib/format';
import {
  MessageCircle,
  Zap,
  CheckCircle2,
  Clock,
  Send,
  CheckCheck,
  Check,
  Languages,
} from 'lucide-react';

export const WhatsAppPage: React.FC = () => {
  const {
    whatsappRules,
    whatsappTemplates,
    whatsappLogs,
    toggleWhatsAppRule,
    addWhatsAppLog,
  } = useAppStore();

  const [activeTab, setActiveTab] = useState<'rules' | 'templates' | 'logs'>('rules');
  const [selectedTemplate, setSelectedTemplate] = useState<WhatsAppTemplate>(whatsappTemplates[0]);

  const handleSendTest = (template: WhatsAppTemplate) => {
    addWhatsAppLog('Tariq Mansoor', '0300-9281726', template.name);
    toast.success(
      `Test message queued: "${template.name}" simulated via WhatsApp Business Cloud API.`,
      'WhatsApp Dispatched'
    );
  };

  const logColumns: Column<any>[] = [
    {
      key: 'recipientName',
      header: 'Recipient',
      render: (log) => (
        <div className="space-y-0.5 text-xs">
          <span className="font-semibold text-slate-900 block">{log.recipientName}</span>
          <span className="text-slate-400 font-mono text-[11px]">{log.recipientPhone}</span>
        </div>
      ),
    },
    {
      key: 'templateName',
      header: 'Template Used',
      render: (log) => <span className="text-xs text-slate-800 font-medium">{log.templateName}</span>,
    },
    {
      key: 'sentAt',
      header: 'Dispatched At',
      sortable: true,
      render: (log) => (
        <span className="text-xs text-slate-500">
          {formatDate(log.sentAt)} ({formatTime(log.sentAt)})
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Delivery Status',
      render: (log) => {
        const isRead = log.status === 'Read';
        const isDelivered = log.status === 'Delivered';
        const isFailed = log.status === 'Failed';

        return (
          <div className="flex items-center gap-1.5 text-xs">
            {isRead && <CheckCheck className="h-4 w-4 text-emerald-600" />}
            {isDelivered && <CheckCheck className="h-4 w-4 text-slate-400" />}
            {!isRead && !isDelivered && !isFailed && <Check className="h-4 w-4 text-slate-400" />}
            <span
              className={`font-semibold ${
                isRead
                  ? 'text-emerald-700'
                  : isFailed
                  ? 'text-red-600 font-bold'
                  : 'text-slate-600'
              }`}
            >
              {log.status}
            </span>
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="WhatsApp Automation"
        description="Powered by WhatsApp Business API (simulated in demo). Send automated instant lead greetings, site visit reminders, and Bayana payment notices."
        actions={
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg text-xs font-semibold">
              <span className="h-2 w-2 rounded-full bg-emerald-600 animate-pulse" />
              Meta Cloud API Connected
            </span>
          </div>
        }
      />

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(val: any) => setActiveTab(val)}>
        <TabsList className="grid grid-cols-3 w-full sm:w-[420px]">
          <TabsTrigger value="rules">
            Automation Rules ({whatsappRules.length})
          </TabsTrigger>
          <TabsTrigger value="templates">
            Templates ({whatsappTemplates.length})
          </TabsTrigger>
          <TabsTrigger value="logs">
            Dispatch Logs ({whatsappLogs.length})
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: Automation Rules */}
        <TabsContent value="rules" className="pt-4 space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {whatsappRules.map((rule) => (
              <Card key={rule.id} className="p-4 flex flex-col justify-between space-y-3">
                <div className="space-y-1.5">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700">
                        <Zap className="h-4 w-4" />
                      </div>
                      <h4 className="font-heading font-semibold text-xs sm:text-sm text-slate-900">
                        {rule.name}
                      </h4>
                    </div>

                    {/* Toggle Switch */}
                    <button
                      onClick={() => {
                        toggleWhatsAppRule(rule.id);
                        toast.info(`Toggled "${rule.name}" ${!rule.enabled ? 'ON' : 'OFF'}.`);
                      }}
                      className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        rule.enabled ? 'bg-emerald-600' : 'bg-slate-200'
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                          rule.enabled ? 'translate-x-4' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>

                  <p className="text-xs text-slate-500 leading-relaxed">{rule.description}</p>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[11px] text-slate-400">
                  <span className="font-mono text-slate-500">Trigger: {rule.trigger}</span>
                  <span className={`font-semibold ${rule.enabled ? 'text-emerald-700' : 'text-slate-400'}`}>
                    {rule.enabled ? 'Active Automation' : 'Paused'}
                  </span>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Tab 2: Template Library with WhatsApp Chat Bubble Preview */}
        <TabsContent value="templates" className="pt-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Template List */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                Approved Templates
              </h4>
              {whatsappTemplates.map((tpl) => (
                <div
                  key={tpl.id}
                  onClick={() => setSelectedTemplate(tpl)}
                  className={`p-3 rounded-lg border text-xs cursor-pointer transition-all space-y-1 ${
                    selectedTemplate.id === tpl.id
                      ? 'border-emerald-600 bg-emerald-50/50 shadow-2xs font-semibold'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-slate-900">{tpl.name}</span>
                    <span className="text-[10px] text-slate-400 font-normal">{tpl.language}</span>
                  </div>
                  <div className="flex items-center gap-1.5 pt-0.5">
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-100 text-slate-600">
                      {tpl.category}
                    </span>
                    <StatusBadge status={tpl.status} />
                  </div>
                </div>
              ))}
            </div>

            {/* Live WhatsApp Bubble Preview */}
            <div className="md:col-span-2 space-y-4">
              <Card className="overflow-hidden border-slate-300">
                {/* WhatsApp Chat Header */}
                <div className="bg-[#075E54] text-white p-3 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="h-8 w-8 rounded-full bg-white/20 flex items-center justify-center font-bold text-xs">
                      CR
                    </div>
                    <div>
                      <div className="font-semibold text-xs">Crescent Realty (Official)</div>
                      <div className="text-[10px] text-emerald-100 flex items-center gap-1">
                        <CheckCircle2 className="h-3 w-3 text-emerald-300 inline" /> Verified Business Account
                      </div>
                    </div>
                  </div>

                  <Button
                    size="sm"
                    onClick={() => handleSendTest(selectedTemplate)}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs h-7 gap-1"
                  >
                    <Send className="h-3 w-3" />
                    Send Test
                  </Button>
                </div>

                {/* WhatsApp Chat Body Wallpaper */}
                <div className="bg-[#EFEAE2] p-6 min-h-[260px] flex flex-col justify-end">
                  <div className="max-w-md bg-white rounded-lg p-3.5 shadow-sm text-xs text-slate-900 space-y-2 relative border border-[#e2ded5]">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                        <Languages className="h-3 w-3" />
                        {selectedTemplate.language} Template
                      </div>
                      <p className="leading-relaxed text-slate-800 whitespace-pre-line">
                        {selectedTemplate.body}
                      </p>
                    </div>

                    <div className="flex items-center justify-end gap-1 text-[10px] text-slate-400 pt-1">
                      <span>4:30 PM</span>
                      <CheckCheck className="h-3.5 w-3.5 text-blue-500" />
                    </div>
                  </div>
                </div>
              </Card>

              {/* Explanatory Callout */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-600 space-y-1">
                <span className="font-bold text-slate-800">Dynamic Variable Substitution:</span>
                <p className="text-[11px] leading-relaxed">
                  Variables such as <code>{`{{client_name}}`}</code>, <code>{`{{property_title}}`}</code>, and{' '}
                  <code>{`{{visit_time}}`}</code> are automatically merged from live CRM records at the moment of trigger.
                </p>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Tab 3: Dispatch Logs */}
        <TabsContent value="logs" className="pt-4">
          <DataTable
            data={whatsappLogs}
            columns={logColumns}
            searchPlaceholder="Search message logs..."
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

