import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { settingsService } from '../services/settingsService';
import { 
  User, 
  CreditCard, 
  Key, 
  Link as LinkIcon,
  CheckCircle,
  Plus,
  Trash2,
  Download,
  Loader2,
} from 'lucide-react';
import { clsx } from 'clsx';

const TABS = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'subscription', label: 'Subscription', icon: CheckCircle },
  { id: 'billing', label: 'Billing & Invoices', icon: CreditCard },
  { id: 'integrations', label: 'Connected Accounts', icon: LinkIcon },
  { id: 'security', label: 'API & Security', icon: Key },
];

export default function Settings() {
  const [activeTab, setActiveTab] = useState('profile');

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Account Settings</h1>
        <p className="text-gray-500 mt-1">Manage your profile, subscription, and platform connections.</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar Nav */}
        <aside className="lg:w-64 shrink-0">
          <nav className="flex flex-row lg:flex-col gap-1 overflow-x-auto lg:overflow-visible p-1 bg-gray-50 rounded-xl lg:bg-transparent">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={clsx(
                    "flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-all whitespace-nowrap",
                    activeTab === tab.id
                      ? "bg-white lg:bg-blue-50 text-blue-600 shadow-sm lg:shadow-none"
                      : "text-gray-500 hover:text-gray-900 hover:bg-gray-100"
                  )}
                >
                  <Icon size={18} />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </aside>

        {/* Content Area */}
        <div className="flex-1 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden min-h-[500px]">
          <div className="p-8">
            {activeTab === 'profile' && <ProfileSection />}
            {activeTab === 'subscription' && <SubscriptionSection />}
            {activeTab === 'billing' && <BillingSection />}
            {activeTab === 'integrations' && <IntegrationsSection />}
            {activeTab === 'security' && <SecuritySection />}
          </div>
        </div>
      </div>
    </div>
  );
}

function ProfileSection() {
  const { data: profile, isLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: settingsService.getProfile,
  });

  if (isLoading) return <LoaderSpinner />;

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-bold text-gray-900">Personal Information</h3>
        <p className="text-sm text-gray-500">Update your photo and personal details here.</p>
      </div>

      <form className="space-y-6">
        <div className="flex items-center gap-6">
          <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center text-gray-400">
            <User size={40} />
          </div>
          <button type="button" className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-bold hover:bg-gray-50">
            Change Avatar
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700">Full Name</label>
            <input 
              type="text" 
              defaultValue={profile?.full_name}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700">Email Address</label>
            <input 
              type="email" 
              defaultValue={profile?.email}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-500 outline-none"
              disabled
            />
          </div>
        </div>

        <div className="pt-4 border-t border-gray-50 flex justify-end">
          <button className="px-6 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700">
            Save Changes
          </button>
        </div>
      </form>
    </div>
  );
}

function SubscriptionSection() {
  const { data: plans, isLoading } = useQuery({
    queryKey: ['plans'],
    queryFn: settingsService.getPlans,
  });

  if (isLoading) return <LoaderSpinner />;

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-bold text-gray-900">Your Subscription</h3>
        <p className="text-sm text-gray-500">Manage your plan and usage limits.</p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {plans?.map((plan) => (
          <div key={plan.id} className={clsx(
            "p-6 rounded-xl border-2 flex flex-col md:flex-row justify-between items-center gap-6",
            plan.current ? "border-blue-600 bg-blue-50/30" : "border-gray-100"
          )}>
            <div>
              <div className="flex items-center gap-3">
                <h4 className="font-bold text-gray-900">{plan.name}</h4>
                {plan.current && (
                  <span className="px-2 py-0.5 bg-blue-600 text-white text-[10px] font-bold uppercase rounded">Current Plan</span>
                )}
              </div>
              <p className="text-sm text-gray-500 mt-1">${plan.price}/{plan.interval}</p>
            </div>
            <div className="flex gap-3">
              {!plan.current && (
                <button className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-bold hover:bg-gray-50">
                  Switch Plan
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function BillingSection() {
  const { data: invoices, isLoading } = useQuery({
    queryKey: ['invoices'],
    queryFn: settingsService.getInvoices,
  });

  if (isLoading) return <LoaderSpinner />;

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-bold text-gray-900">Billing History</h3>
        <p className="text-sm text-gray-500">View and download your past invoices.</p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-gray-50 text-xs font-bold text-gray-500 uppercase">
              <th className="px-4 py-3">Invoice ID</th>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Amount</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {invoices?.map((invoice) => (
              <tr key={invoice.id} className="text-sm">
                <td className="px-4 py-4 font-medium text-gray-900">{invoice.id}</td>
                <td className="px-4 py-4 text-gray-500">{new Date(invoice.created_at).toLocaleDateString()}</td>
                <td className="px-4 py-4 text-gray-900">${(Number(invoice.amount)).toFixed(2)}</td>
                <td className="px-4 py-4">
                  <span className={clsx(
                    "px-2 py-1 rounded-full text-[10px] font-bold uppercase",
                    invoice.status === 'paid' ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
                  )}>
                    {invoice.status}
                  </span>
                </td>
                <td className="px-4 py-4 text-right">
                  <button className="p-2 text-gray-400 hover:text-blue-600 transition-colors">
                    <Download size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function IntegrationsSection() {
  // Uses dashboard stats for simplicity in this view
  const platforms = [
    { name: 'Instagram', handle: '@shop_active', connected: true },
    { name: 'TikTok', handle: '@shop_active', connected: true },
    { name: 'YouTube', handle: 'Shop Active Official', connected: true },
    { name: 'X (Twitter)', handle: '', connected: false },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-bold text-gray-900">Connected Accounts</h3>
        <p className="text-sm text-gray-500">Manage connections to your social media platforms.</p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {platforms.map((p) => (
          <div key={p.name} className="p-4 rounded-xl border border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-gray-50 flex items-center justify-center text-gray-500">
                <LinkIcon size={20} />
              </div>
              <div>
                <h4 className="font-bold text-gray-900">{p.name}</h4>
                <p className="text-xs text-gray-500">{p.connected ? p.handle : 'Not connected'}</p>
              </div>
            </div>
            <button className={clsx(
              "px-4 py-1.5 rounded-lg text-xs font-bold transition-colors",
              p.connected ? "text-red-600 hover:bg-red-50" : "bg-blue-600 text-white hover:bg-blue-700"
            )}>
              {p.connected ? 'Disconnect' : 'Connect'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function SecuritySection() {
  const queryClient = useQueryClient();
  const { data: keys, isLoading } = useQuery({
    queryKey: ['api-keys'],
    queryFn: settingsService.getApiKeys,
  });

  const createMutation = useMutation({
    mutationFn: () => settingsService.createApiKey('New Key'),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['api-keys'] }),
  });

  const revokeMutation = useMutation({
    mutationFn: (id: string) => settingsService.revokeApiKey(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['api-keys'] }),
  });

  if (isLoading) return <LoaderSpinner />;

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-bold text-gray-900">API Keys</h3>
        <p className="text-sm text-gray-500">Manage your keys for programmatic access to OmniReach.</p>
      </div>

      <div className="space-y-4">
        {keys?.map((key) => (
          <div key={key.id} className="p-4 rounded-xl border border-gray-100 flex items-center justify-between bg-gray-50/30">
            <div className="flex items-center gap-4">
              <Key size={20} className="text-gray-400" />
              <div>
                <h4 className="font-bold text-gray-900">{key.name}</h4>
                <p className="text-xs font-mono text-gray-500">{key.key_prefix}********************</p>
              </div>
            </div>
            <button 
              onClick={() => revokeMutation.mutate(key.id)}
              className="p-2 text-gray-400 hover:text-red-600 transition-colors"
            >
              <Trash2 size={18} />
            </button>
          </div>
        ))}
        
        <button 
          onClick={() => createMutation.mutate()}
          disabled={createMutation.isPending}
          className="w-full py-3 border-2 border-dashed border-gray-200 rounded-xl text-sm font-bold text-gray-500 hover:border-blue-300 hover:text-blue-600 flex items-center justify-center gap-2 transition-all"
        >
          {createMutation.isPending ? <Loader2 size={18} className="animate-spin" /> : <Plus size={18} />}
          Create New API Key
        </button>
      </div>
    </div>
  );
}

function LoaderSpinner() {
  return (
    <div className="flex items-center justify-center py-24">
      <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
    </div>
  );
}
