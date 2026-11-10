import {
  Activity,
  BarChart3,
  Cable,
  Contact,
  Download,
  FormInput,
  Image,
  LayoutDashboard,
  Mail,
  Palette,
  Settings,
  Store,
  Tags,
  Upload,
  Users,
  Workflow,
  Zap,
} from 'lucide-react'

export const navGroups = [
  {
    id: 'overview',
    label: 'Overview',
    items: [
      { id: 'dashboard', label: 'Dashboard', to: '/', icon: LayoutDashboard },
    ],
  },
  {
    id: 'marketing',
    label: 'Marketing',
    items: [
      { id: 'campaigns', label: 'Campaigns', to: '/campaigns', icon: Mail },
      { id: 'automation', label: 'Automation', to: '/automation', icon: Workflow },
      { id: 'forms', label: 'Forms', to: '/forms', icon: FormInput },
    ],
  },
  {
    id: 'audience',
    label: 'Audience',
    items: [
      { id: 'contacts', label: 'Contacts', to: '/audience/contacts', icon: Contact },
      { id: 'segments', label: 'Segments', to: '/audience/segments', icon: Users },
      { id: 'tags', label: 'Tags', to: '/audience/tags', icon: Tags },
      { id: 'imports', label: 'Imports', to: '/audience/imports', icon: Upload },
      { id: 'exports', label: 'Exports', to: '/audience/exports', icon: Download },
    ],
  },
  {
    id: 'insights',
    label: 'Insights',
    items: [
      { id: 'analytics', label: 'Analytics', to: '/insights/analytics', icon: BarChart3 },
      { id: 'live', label: 'Live activity', to: '/insights/live', icon: Activity },
    ],
  },
  {
    id: 'resources',
    label: 'Resources',
    items: [
      { id: 'images', label: 'Image library', to: '/resources/images', icon: Image },
      { id: 'brand', label: 'Brand assets', to: '/resources/brand', icon: Palette },
    ],
  },
  {
    id: 'configuration',
    label: 'Configuration',
    items: [
      { id: 'store', label: 'Store settings', to: '/settings/store', icon: Store },
      {
        id: 'storefront',
        label: 'Storefront integration',
        to: '/settings/storefront',
        icon: Cable,
      },
      { id: 'channels', label: 'Channel settings', to: '/settings/channels', icon: Zap },
      { id: 'account', label: 'Account settings', to: '/settings/account', icon: Settings },
    ],
  },
]
