import { Navigate, useRoutes } from 'react-router-dom'
import { GuestRoute } from './auth/GuestRoute'
import { ProtectedRoute } from './auth/ProtectedRoute'
import { AppShell } from './components/layout/AppShell'
import { DashboardPage } from './pages/DashboardPage'
import { ContactsPage } from './pages/audience/ContactsPage'
import { ContactDetailPage } from './pages/audience/ContactDetailPage'
import { SegmentsPage } from './pages/audience/SegmentsPage'
import { TagsPage } from './pages/audience/TagsPage'
import { ImportsPage } from './pages/audience/ImportsPage'
import { ExportsPage } from './pages/audience/ExportsPage'
import { CampaignsPage } from './pages/campaigns/CampaignsPage'
import { CampaignWizardPage } from './pages/campaigns/CampaignWizardPage'
import { CampaignDetailPage } from './pages/campaigns/CampaignDetailPage'
import { AutomationsPage } from './pages/automation/AutomationsPage'
import { AutomationTemplatesPage } from './pages/automation/AutomationTemplatesPage'
import { AutomationEditorPage } from './pages/automation/AutomationEditorPage'
import { FormsPage } from './pages/forms/FormsPage'
import { FormEditorPage } from './pages/forms/FormEditorPage'
import { AnalyticsPage } from './pages/insights/AnalyticsPage'
import { LiveActivityPage } from './pages/insights/LiveActivityPage'
import { ImageLibraryPage } from './pages/resources/ImageLibraryPage'
import { BrandAssetsPage } from './pages/resources/BrandAssetsPage'
import { EmailTemplatesPage } from './pages/resources/EmailTemplatesPage'
import { EmailTemplateEditorPage } from './pages/resources/EmailTemplateEditorPage'
import { StoreSettingsPage } from './pages/settings/StoreSettingsPage'
import { StorefrontIntegrationPage } from './pages/settings/StorefrontIntegrationPage'
import { ChannelSettingsPage } from './pages/settings/ChannelSettingsPage'
import { AccountSettingsPage } from './pages/settings/AccountSettingsPage'
import { LoginPage } from './pages/auth/LoginPage'
import { RegisterPage } from './pages/auth/RegisterPage'

export function AppRoutes() {
  return useRoutes([
    {
      path: '/login',
      element: (
        <GuestRoute>
          <LoginPage />
        </GuestRoute>
      ),
    },
    {
      path: '/register',
      element: (
        <GuestRoute>
          <RegisterPage />
        </GuestRoute>
      ),
    },
    {
      path: '/',
      element: (
        <ProtectedRoute>
          <AppShell />
        </ProtectedRoute>
      ),
      children: [
        { index: true, element: <DashboardPage /> },

        { path: 'campaigns', element: <CampaignsPage /> },
        { path: 'campaigns/new/:channel', element: <CampaignWizardPage /> },
        { path: 'campaigns/:campaignId/edit', element: <CampaignWizardPage /> },
        { path: 'campaigns/:campaignId', element: <CampaignDetailPage /> },

        { path: 'automation', element: <AutomationsPage /> },
        { path: 'automation/templates', element: <AutomationTemplatesPage /> },
        { path: 'automation/new', element: <AutomationEditorPage /> },
        { path: 'automation/:automationId', element: <AutomationEditorPage /> },

        { path: 'forms', element: <FormsPage /> },
        { path: 'forms/new', element: <FormEditorPage /> },
        { path: 'forms/:formId', element: <FormEditorPage /> },

        { path: 'audience/contacts', element: <ContactsPage /> },
        { path: 'audience/contacts/:contactId', element: <ContactDetailPage /> },
        { path: 'audience/segments', element: <SegmentsPage /> },
        { path: 'audience/tags', element: <TagsPage /> },
        { path: 'audience/imports', element: <ImportsPage /> },
        { path: 'audience/exports', element: <ExportsPage /> },

        { path: 'insights/analytics', element: <AnalyticsPage /> },
        { path: 'insights/live', element: <LiveActivityPage /> },

        { path: 'resources/images', element: <ImageLibraryPage /> },
        { path: 'resources/templates', element: <EmailTemplatesPage /> },
        { path: 'resources/templates/:templateId', element: <EmailTemplateEditorPage /> },
        { path: 'resources/brand', element: <BrandAssetsPage /> },

        { path: 'settings/store', element: <StoreSettingsPage /> },
        { path: 'settings/storefront', element: <StorefrontIntegrationPage /> },
        { path: 'settings/channels', element: <ChannelSettingsPage /> },
        { path: 'settings/account', element: <AccountSettingsPage /> },

        { path: '*', element: <Navigate to="/" replace /> },
      ],
    },
  ])
}
