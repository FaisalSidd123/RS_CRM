import React from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { LandingPage } from '@/features/landing/LandingPage';
import { PortalSelectPage } from '@/features/auth/PortalSelectPage';
import { OwnerLoginPage } from '@/features/auth/OwnerLoginPage';
import { ManagerLoginPage } from '@/features/auth/ManagerLoginPage';
import { AgentLoginPage } from '@/features/auth/AgentLoginPage';
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
import { ProtectedRoute, PublicOnlyRoute } from '@/components/ProtectedRoute';

export const router = createBrowserRouter([
  // Public Marketing Landing Page
  {
    path: '/',
    element: <LandingPage />,
  },

  // 1. Portal Directory Page
  {
    path: '/login',
    element: (
      <PublicOnlyRoute>
        <PortalSelectPage />
      </PublicOnlyRoute>
    ),
  },

  // 2. Dedicated Owner Portal Login
  {
    path: '/login/owner',
    element: (
      <PublicOnlyRoute>
        <OwnerLoginPage />
      </PublicOnlyRoute>
    ),
  },

  // 3. Dedicated Manager Portal Login
  {
    path: '/login/manager',
    element: (
      <PublicOnlyRoute>
        <ManagerLoginPage />
      </PublicOnlyRoute>
    ),
  },

  // 4. Dedicated Agent Portal Login
  {
    path: '/login/agent',
    element: (
      <PublicOnlyRoute>
        <AgentLoginPage />
      </PublicOnlyRoute>
    ),
  },

  // Protected App Shell (Requires Authentication)
  {
    path: '/app',
    element: (
      <ProtectedRoute>
        <AppLayout />
      </ProtectedRoute>
    ),
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
      // Restricted to Owner and Manager
      {
        path: 'agents',
        element: (
          <ProtectedRoute requiredPermission="view_agents_page">
            <AgentsPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'commissions',
        element: <CommissionsPage />,
      },
      // Restricted to Owner and Manager
      {
        path: 'whatsapp',
        element: (
          <ProtectedRoute requiredPermission="view_whatsapp">
            <WhatsAppPage />
          </ProtectedRoute>
        ),
      },
      // Restricted to Owner only
      {
        path: 'activity',
        element: (
          <ProtectedRoute requiredPermission="view_activity_log">
            <ActivityPage />
          </ProtectedRoute>
        ),
      },
      // Restricted to Owner and Manager
      {
        path: 'settings',
        element: (
          <ProtectedRoute requiredPermission="view_settings">
            <SettingsPage />
          </ProtectedRoute>
        ),
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
