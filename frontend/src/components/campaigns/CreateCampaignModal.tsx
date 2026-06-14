import React, { useState } from 'react';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { campaignService, type CampaignType } from '../../services/campaignService';
import { socialAccountService } from '../../services/socialAccountService';
import { X, Loader2, Users, Megaphone, Camera, Music2, Play, Send } from 'lucide-react';

const PLATFORM_ICONS: Record<string, React.ElementType> = {
  instagram: Camera, tiktok: Music2, youtube: Play, x: Send, facebook: Users
};

const PLATFORM_COLORS: Record<string, string> = {
  instagram: 'bg-pink-100 text-pink-700 border-pink-200',
  tiktok: 'bg-purple-100 text-purple-700 border-purple-200',
  youtube: 'bg-red-100 text-red-700 border-red-200',
  x: 'bg-gray-100 text-gray-700 border-gray-200',
  facebook: 'bg-blue-100 text-blue-700 border-blue-200',
};

interface CreateCampaignModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const campaignObjectives = [
  { value: 'follower_boost', label: '📈 Boost Social Following', desc: 'Grow real followers on selected platforms' },
  { value: 'engagement', label: '❤️ Engagement Campaign', desc: 'Increase likes, comments, and shares' },
  { value: 'website_traffic', label: '🌐 Advertise Website', desc: 'Drive targeted traffic to your website' },
  { value: 'content_promotion', label: '📢 Promote Content', desc: 'Boost a specific post or video' },
  { value: 'search_visibility', label: '🔍 Search Visibility', desc: 'Appear in Google & browser searches' },
];

export default function CreateCampaignModal({ isOpen, onClose }: CreateCampaignModalProps) {
  const queryClient = useQueryClient();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    type: 'follower_boost' as CampaignType,
    budget: 100,
    selectedPlatforms: [] as string[],
    targetUrl: '',
    content: '',
  });

  const { data: socialAccounts } = useQuery({
    queryKey: ['social-accounts'],
    queryFn: socialAccountService.list,
  });

  const mutation = useMutation({
    mutationFn: campaignService.createCampaign,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
      onClose();
      setStep(1);
      setFormData({ name: '', type: 'follower_boost', budget: 100, selectedPlatforms: [], targetUrl: '', content: '' });
    },
  });

  if (!isOpen) return null;

  const togglePlatform = (platform: string) => {
    setFormData(prev => ({
      ...prev,
      selectedPlatforms: prev.selectedPlatforms.includes(platform)
        ? prev.selectedPlatforms.filter(p => p !== platform)
        : [...prev.selectedPlatforms, platform]
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate({
      ...formData,
      target_parameters: {
        platforms: formData.selectedPlatforms,
        targetUrl: formData.targetUrl || undefined,
      }
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-100 sticky top-0 bg-white z-10">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Create New Campaign</h2>
            <p className="text-sm text-gray-500">Step {step} of 3</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Step indicators */}
        <div className="flex gap-2 px-6 py-3 bg-gray-50 border-b border-gray-100">
          {[1, 2, 3].map(s => (
            <div key={s} className={`flex-1 h-2 rounded-full ${step >= s ? 'bg-blue-600' : 'bg-gray-200'}`} />
          ))}
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Step 1: Basic Info */}
          {step === 1 && (
            <>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-3">Campaign Objective</label>
                <div className="grid grid-cols-1 gap-3">
                  {campaignObjectives.map(obj => (
                    <button
                      key={obj.value}
                      type="button"
                      onClick={() => setFormData({ ...formData, type: obj.value as CampaignType })}
                      className={`text-left px-4 py-3 rounded-xl border-2 transition-all ${
                        formData.type === obj.value
                          ? 'border-blue-500 bg-blue-50 shadow-sm'
                          : 'border-gray-100 hover:border-gray-300'
                      }`}
                    >
                      <p className="font-bold text-gray-900">{obj.label}</p>
                      <p className="text-sm text-gray-500">{obj.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Campaign Name</label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  placeholder="e.g. Summer Brand Awareness"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
            </>
          )}

          {/* Step 2: Platforms & Targeting */}
          {step === 2 && (
            <>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-3">Select Social Platforms</label>
                <p className="text-xs text-gray-500 mb-4">Choose where you want this campaign to run</p>
                
                {(!socialAccounts || (socialAccounts as any).length === 0) ? (
                  <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-xl">
                    <Users className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">No social accounts connected yet.</p>
                    <p className="text-xs text-gray-400 mt-1">Connect accounts in Settings first.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {(socialAccounts as any[]).map((account: any) => {
                      const Icon = PLATFORM_ICONS[account.platform] || Megaphone;
                      const isSelected = formData.selectedPlatforms.includes(account.platform);
                      return (
                        <button
                          key={account.id}
                          type="button"
                          onClick={() => togglePlatform(account.platform)}
                          className={`flex items-center gap-3 px-4 py-3 rounded-xl border-2 transition-all ${
                            isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-100 hover:border-gray-300'
                          }`}
                        >
                          <div className={`p-2 rounded-lg ${PLATFORM_COLORS[account.platform] || 'bg-gray-100'}`}>
                            <Icon className="w-5 h-5" />
                          </div>
                          <div className="text-left flex-1">
                            <p className="font-bold text-sm text-gray-900 capitalize">{account.platform}</p>
                            <p className="text-xs text-gray-500">@{account.platform_username}</p>
                          </div>
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                            isSelected ? 'border-blue-600 bg-blue-600' : 'border-gray-300'
                          }`}>
                            {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {(formData.type === 'website_traffic' || formData.type === 'content_promotion') && (
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    {formData.type === 'website_traffic' ? 'Website URL' : 'Content URL'}
                  </label>
                  <input
                    type="url"
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    placeholder={formData.type === 'website_traffic' ? 'https://yourwebsite.com' : 'https://instagram.com/p/...'}
                    value={formData.targetUrl}
                    onChange={(e) => setFormData({ ...formData, targetUrl: e.target.value })}
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Post Content (optional)</label>
                <textarea
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
                  rows={3}
                  placeholder="Write the message or caption for your campaign..."
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                />
              </div>
            </>
          )}

          {/* Step 3: Budget & Review */}
          {step === 3 && (
            <>
              <div className="bg-blue-50 p-4 rounded-xl">
                <p className="text-sm font-bold text-blue-800">Campaign Summary</p>
                <div className="mt-3 space-y-2 text-sm">
                  <p><span className="text-gray-500">Name:</span> <span className="font-bold">{formData.name}</span></p>
                  <p><span className="text-gray-500">Objective:</span> <span className="font-bold">{campaignObjectives.find(o => o.value === formData.type)?.label}</span></p>
                  <p><span className="text-gray-500">Platforms:</span> <span className="font-bold">{formData.selectedPlatforms.join(', ') || 'None selected'}</span></p>
                  {formData.targetUrl && <p><span className="text-gray-500">Target:</span> <span className="font-bold text-blue-600">{formData.targetUrl}</span></p>}
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Budget ($)</label>
                <input
                  type="number"
                  min="10"
                  step="10"
                  required
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  value={formData.budget}
                  onChange={(e) => setFormData({ ...formData, budget: parseInt(e.target.value) })}
                />
                <p className="text-xs text-gray-400 mt-1">Minimum $10. Higher budgets get prioritized delivery.</p>
              </div>

              {mutation.isError && (
                <p className="text-sm text-red-600 font-medium">Failed to create campaign. Please try again.</p>
              )}
            </>
          )}

          {/* Navigation buttons */}
          <div className="flex gap-3 pt-4">
            {step > 1 ? (
              <button
                type="button"
                onClick={() => setStep(step - 1)}
                className="px-6 py-2 border border-gray-200 text-gray-700 font-bold rounded-lg hover:bg-gray-50"
              >
                Back
              </button>
            ) : (
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2 border border-gray-200 text-gray-700 font-bold rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
            )}

            {step < 3 ? (
              <button
                type="button"
                onClick={() => setStep(step + 1)}
                disabled={step === 1 && !formData.name}
                className="flex-1 px-4 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                Next
              </button>
            ) : (
              <button
                type="submit"
                disabled={mutation.isPending}
                className="flex-1 px-4 py-2 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {mutation.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <>🚀 Launch Campaign</>}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
