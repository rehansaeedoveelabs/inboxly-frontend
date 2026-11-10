import { Navigate, useRoutes } from 'react-router-dom'
import { AppShell } from './components/layout/AppShell'
import { DashboardPage } from './pages/DashboardPage'
import { PlaceholderPage } from './pages/PlaceholderPage'

function page(title, description, stage) {
  return <PlaceholderPage title={title} description={description} stage={stage} />
}

export function AppRoutes() {
  return useRoutes([
    {
      path: '/',
      element: <AppShell />,
      children: [
        { index: true, element: <DashboardPage /> },
        {
          path: 'campaigns',
          element: page(
            'Campaigns',
            'Create and manage email and SMS campaigns.',
            'Stage 3',
          ),
        },
        {
          path: 'automation',
          element: page(
            'Automation',
            'Build triggered workflows on a visual canvas.',
            'Stage 3',
          ),
        },
        {
          path: 'forms',
          element: page(
            'Forms',
            'Design popup and embedded signup forms.',
            'Stage 3',
          ),
        },
        {
          path: 'audience/contacts',
          element: page(
            'Contacts',
            'Search, filter and inspect your audience.',
            'Stage 3',
          ),
        },
        {
          path: 'audience/segments',
          element: page('Segments', 'Group contacts with reusable rules.', 'Stage 3'),
        },
        {
          path: 'audience/tags',
          element: page('Tags', 'Organize contacts with lightweight labels.', 'Stage 3'),
        },
        {
          path: 'audience/imports',
          element: page('Imports', 'Bring contacts into Inboxly.', 'Stage 3'),
        },
        {
          path: 'audience/exports',
          element: page('Exports', 'Export contact lists for offline use.', 'Stage 3'),
        },
        {
          path: 'insights/analytics',
          element: page(
            'Analytics',
            'Campaign, automation and channel performance.',
            'Stage 4',
          ),
        },
        {
          path: 'insights/live',
          element: page(
            'Live activity',
            'Monitor recent storefront and engagement events.',
            'Stage 4',
          ),
        },
        {
          path: 'resources/images',
          element: page(
            'Image library',
            'Manage creative assets for campaigns and forms.',
            'Stage 4',
          ),
        },
        {
          path: 'resources/brand',
          element: page(
            'Brand assets',
            'Logo, colors, typography and social links.',
            'Stage 4',
          ),
        },
        {
          path: 'settings/store',
          element: page(
            'Store settings',
            'Store profile and sync preferences (prototype).',
            'Stage 4',
          ),
        },
        {
          path: 'settings/storefront',
          element: page(
            'Storefront integration',
            'Mock Shopify App Embed connection status.',
            'Stage 4',
          ),
        },
        {
          path: 'settings/channels',
          element: page(
            'Channel settings',
            'Email, SMS and web push channel configuration.',
            'Stage 4',
          ),
        },
        {
          path: 'settings/account',
          element: page(
            'Account settings',
            'Users, preferences and workspace options.',
            'Stage 4',
          ),
        },
        { path: '*', element: <Navigate to="/" replace /> },
      ],
    },
  ])
}
