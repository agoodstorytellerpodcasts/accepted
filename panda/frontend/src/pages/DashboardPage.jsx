import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const DashboardPage = () => {
  const [sites, setSites] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const { token, logout, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSites = async () => {
      try {
        const response = await fetch('/api/user/sites', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (response.ok) {
          const data = await response.json();
          setSites(data);
        } else {
          setError('Failed to load sites');
        }
      } catch (err) {
        setError('An error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    if (token) {
      fetchSites();
    } else {
      navigate('/login');
    }
  }, [token, navigate]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link to="/" className="text-2xl font-black tracking-tighter text-brand-slate">
                PANDA<span className="text-brand-green">.</span>
              </Link>
              <div className="hidden sm:ml-10 sm:flex sm:space-x-8">
                <span className="border-brand-green text-slate-900 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-bold">
                  My Sites
                </span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-slate-500 font-medium">{user?.email}</span>
              <button
                onClick={handleLogout}
                className="text-sm font-bold text-slate-700 hover:text-brand-green transition-colors"
              >
                Log out
              </button>
              <Link
                to="/builder"
                className="ml-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-bold rounded-md shadow-sm text-white bg-brand-green hover:bg-brand-green-dark transition-colors"
              >
                Create New Site
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="md:flex md:items-center md:justify-between mb-8">
          <div className="flex-1 min-w-0">
            <h2 className="text-3xl font-extrabold leading-7 text-slate-900 sm:text-4xl sm:truncate">
              Welcome back, Builder
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              You have {sites.length} site{sites.length !== 1 ? 's' : ''} in your portfolio.
            </p>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-green"></div>
          </div>
        ) : error ? (
          <div className="bg-red-50 p-4 rounded-md text-red-700 text-sm">{error}</div>
        ) : sites.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {sites.map((site) => (
              <div key={site.id} className="bg-white overflow-hidden shadow rounded-xl border border-slate-100 hover:shadow-md transition-shadow">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-brand-green/10 text-brand-green uppercase tracking-wider">
                      {site.industry}
                    </span>
                    <span className="text-xs text-slate-400">
                      {new Date(site.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2 truncate">
                    {site.business_name}
                  </h3>
                  <p className="text-slate-500 text-sm line-clamp-2 mb-6 h-10">
                    {site.description}
                  </p>
                  <div className="flex items-center gap-4">
                    <a
                      href={`/sites/${site.id}/index.html`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 text-center py-2 px-4 border border-brand-slate rounded-md text-sm font-bold text-brand-slate hover:bg-slate-50 transition-colors"
                    >
                      View Site
                    </a>
                    <Link
                      to={`/preview/${site.id}`}
                      className="flex-1 text-center py-2 px-4 bg-brand-slate rounded-md text-sm font-bold text-white hover:bg-slate-800 transition-colors"
                    >
                      Settings
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-2xl border-2 border-dashed border-slate-200">
            <div className="text-6xl mb-4">🎨</div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">No sites yet</h3>
            <p className="text-slate-500 mb-8">Ready to build your first professional website?</p>
            <Link
              to="/builder"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-bold rounded-xl shadow-sm text-white bg-brand-green hover:bg-brand-green-dark transition-colors"
            >
              Start Building
            </Link>
          </div>
        )}
      </main>
    </div>
  );
};

export default DashboardPage;
