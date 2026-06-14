import AnalyticsDashboard from '../components/analytics/AnalyticsDashboard';

export default function Analytics() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Advanced Analytics</h1>
          <p className="text-gray-500 mt-1">Deep dive into your performance across all connected platforms.</p>
        </div>
      </div>

      <AnalyticsDashboard />
    </div>
  );
}
