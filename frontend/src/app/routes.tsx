import React from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { LandingPage } from '@/features/landing/LandingPage';
import { LoginPage } from '@/features/auth/LoginPage';
import { AppLayout } from '@/app/AppLayout';
import { DashboardPage } from '@/features/dashboard/DashboardPage';
import { LeadsPage } from '@/features/leads/LeadsPage';
import { PropertiesPage } from '@/features/properties/PropertiesPage';
import { ClientsPage } from '@/features/clients/ClientsPage';
import { DealsPage } from '@/features/deals/DealsPage';
import { VisitsPage } from '@/features/visits/VisitsPage';
import { TasksPage } from '@/features/tasks/TasksPage';
import { AgentsPage } from '@/features/agents/AgentsPage';
import { CommissionsPage } from '@/features/commissions/CommissionsPage';
import { WhatsAppPage } from '@/features/whatsapp/WhatsAppPage';
import { ActivityPage } from '@/features/activity/ActivityPage';
import { SettingsPage } from '@/features/settings/SettingsPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <LandingPage />,
  },
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/app',
    element: <AppLayout />,
    children: [
      {
        index: true,
        element: <Navigate to="/app/dashboard" replace />,
      },
      {
        path: 'dashboard',
        element: <DashboardPage />,
      },
      {
        path: 'leads',
        element: <LeadsPage />,
      },
      {
        path: 'properties',
        element: <PropertiesPage />,
      },
      {
        path: 'clients',
        element: <ClientsPage />,
      },
      {
        path: 'deals',
        element: <DealsPage />,
      },
      {
        path: 'visits',
        element: <VisitsPage />,
      },
      {
        path: 'tasks',
        element: <TasksPage />,
      },
      {
        path: 'agents',
        element: <AgentsPage />,
      },
      {
        path: 'commissions',
        element: <CommissionsPage />,
      },
      {
        path: 'whatsapp',
        element: <WhatsAppPage />,
      },
      {
        path: 'activity',
        element: <ActivityPage />,
      },
      {
        path: 'settings',
        element: <SettingsPage />,
      },
      {
        path: '*',
        element: <Navigate to="/app/dashboard" replace />,
      },
    ],
  },
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
]);

