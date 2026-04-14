'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

interface QBAccount {
  country: string;
  currency: string;
  label: string;
  isConnected: boolean;
  realmId?: string;
  connectedAt?: string;
  flag: string;
}

interface QBStatus {
  isConnected: boolean;
  realmId?: string;
  connectedAt?: string;
  customerId?: string;
  vendorId?: string;
  tokenExpiresAt?: string;
  customerSyncedAt?: string;
  vendorSyncedAt?: string;
  accounts?: QBAccount[];
}

// Countries will be loaded from database

interface SyncStatus {
  totalInvoices: number;
  syncedInvoices: number;
  syncPercentage: number;
  lastSyncTime?: string;
  qbConnected: boolean;
}

function QuickBooksDashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [mounted, setMounted] = useState(false);
  const [qbStatus, setQBStatus] = useState<QBStatus | null>(null);
  const [syncStatus, setSyncStatus] = useState<SyncStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [customerSyncing, setCustomerSyncing] = useState(false);
  const [qbCountries, setQbCountries] = useState<any[]>([]);
  const [showAddCountry, setShowAddCountry] = useState(false);
  const [newCountry, setNewCountry] = useState({
    country: '', label: '', currency: '', flag: '', sortOrder: 99
  });
  const [addingCountry, setAddingCountry] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch countries from database
  const fetchCountries = async () => {
    try {
      const res = await fetch('/api/quickbooks/countries');
      const data = await res.json();
      if (data.success) {
        setQbCountries(data.countries || []);
      }
    } catch (err) {
      console.error('Failed to fetch countries:', err);
    }
  };

  useEffect(() => {
    if (mounted) {
      fetchCountries();
      fetchStatuses();
    }
  }, [mounted, searchParams?.get('status')]); // Re-fetch when we get a ?status=connected redirect

  const fetchStatuses = async () => {
    try {
      setLoading(true);
      
      // 1. Fetch connection status directly from our database status route
      const statusRes = await fetch('/api/quickbooks/status');
      if (statusRes.ok) {
        const statusData = await statusRes.json();
        setQBStatus(statusData);
        
        // 2. Only fetch sync statuses if actually connected
        if (statusData.isConnected) {
          try {
            // Fetch customer/user sync status
            const customerSyncRes = await fetch('/api/quickbooks/customers/sync');
            if (customerSyncRes.ok) {
              const customerData = await customerSyncRes.json();
              if (customerData && customerData.syncStatus) {
                console.log('[Dashboard] Customer sync status:', customerData.syncStatus);
              }
            } else {
              console.log('[Dashboard] Customer sync status fetch failed:', customerSyncRes.status);
            }

            // Fetch payment sync status
            const paymentSyncRes = await fetch('/api/quickbooks/sync');
            if (paymentSyncRes.ok) {
              const paymentData = await paymentSyncRes.json();
              if (paymentData && paymentData.syncStatus) {
                setSyncStatus(paymentData.syncStatus);
                console.log('[Dashboard] Payment sync status:', paymentData.syncStatus);
              }
            } else {
              console.log('[Dashboard] Payment sync status fetch failed:', paymentSyncRes.status);
            }
          } catch(e) {
            console.error("Error fetching sync stats:", e);
          }
        }
      }

      setError(null);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'Failed to fetch status');
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = (country: string, currency: string) => {
    window.location.href = `/api/quickbooks/auth?action=connect&country=${country}&currency=${currency}`;
  };

  const handleDisconnect = async (countryParam?: string) => {
    try {
      const res = await fetch('/api/quickbooks/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'disconnect', country: countryParam }),
      });

      if (res.ok) {
        alert('QB disconnected successfully');
        fetchStatuses();
      } else {
        alert('Failed to disconnect');
      }
    } catch (err) {
      alert('Error disconnecting');
    }
  };

  const handleSyncCustomers = async () => {
    try {
      setCustomerSyncing(true);
      const res = await fetch('/api/quickbooks/customers/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      const data = await res.json();

      if (res.ok) {
        alert(`✅ Sync completed!\n\nClients: ${data.results.clientsCreated} created, ${data.results.clientsFailed} failed\nTransporters: ${data.results.transportersCreated} created, ${data.results.transportersFailed} failed`);
        fetchStatuses();
      } else {
        alert(`❌ Sync failed: ${data.error}`);
      }
    } catch (err) {
      alert('Error syncing customers');
    } finally {
      setCustomerSyncing(false);
    }
  };

  const handleSyncPayments = async () => {
    try {
      setSyncing(true);
      const res = await fetch('/api/quickbooks/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      const data = await res.json();

      if (res.ok) {
        alert(`✅ Sync completed!\n\nUpdated: ${data.results.updated}\nFailed: ${data.results.failed}`);
        fetchStatuses();
      } else {
        alert(`❌ Sync failed: ${data.error}`);
      }
    } catch (err) {
      alert('Error syncing payments');
    } finally {
      setSyncing(false);
    }
  };

  // Add country handler
  const handleAddCountry = async () => {
    if (!newCountry.country || !newCountry.label || !newCountry.currency || !newCountry.flag) {
      alert('All fields are required');
      return;
    }
    setAddingCountry(true);
    try {
      const res = await fetch('/api/quickbooks/countries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCountry),
      });
      const data = await res.json();
      if (data.success) {
        setQbCountries(prev => [...prev, data.country]);
        setShowAddCountry(false);
        setNewCountry({ country: '', label: '', currency: '', flag: '', sortOrder: 99 });
        alert('✅ Country added successfully!');
      } else {
        alert(data.error || 'Failed to add country');
      }
    } catch (err) {
      alert('Error adding country');
      console.error(err);
    } finally {
      setAddingCountry(false);
    }
  };

  // Remove country handler
  const handleRemoveCountry = async (country: string) => {
    if (!confirm(`Remove ${country} from QB countries list?`)) return;
    try {
      const res = await fetch('/api/quickbooks/countries', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ country }),
      });
      if (res.ok) {
        setQbCountries(prev => prev.filter(c => c.country !== country));
        alert('✅ Country removed successfully!');
      } else {
        alert('Failed to remove country');
      }
    } catch (err) {
      alert('Error removing country');
      console.error(err);
    }
  };

  if (!mounted) {
    return (
      <div className="p-8 w-full max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-4 flex items-center text-gray-900">
          <span className="text-3xl mr-3">📊</span> QuickBooks Management
        </h1>
        <div className="text-center py-8 text-gray-600">Loading QuickBooks Dashboard...</div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-8 w-full max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-4 flex items-center text-gray-900">
          <span className="text-3xl mr-3">📊</span> QuickBooks Management
        </h1>
        <div className="text-center py-8 text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="p-8 w-full max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-8 text-gray-900 flex items-center">
        <span className="text-3xl mr-3">📊</span> QuickBooks Management
      </h1>

      {error && (
        <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg shadow-sm">
          {error}
        </div>
      )}

      {/* QB Connection Status */}
      <div className="mb-8 p-6 bg-white border border-gray-200 rounded-xl shadow-sm">
        <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center border-b pb-3">
          <span className="text-2xl mr-2">🔌</span>
          Connection Status
        </h2>

        <div className="space-y-4">
          {qbCountries.map(qb => {
            const account = qbStatus?.accounts?.find(a => a.country === qb.country);
            const isConnected = account?.isConnected;
            return (
              <div key={qb.country} className={`border rounded-lg p-4 flex items-center justify-between ${isConnected ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`}>
                <div className="flex items-center gap-4">
                  <div className="text-3xl">{qb.flag}</div>
                  <div>
                    <p className="font-bold text-lg text-gray-900">{qb.label}</p>
                    <p className="text-sm font-medium text-gray-600">Currency: {qb.currency}</p>
                    {isConnected && (
                      <div className="mt-2 space-y-1">
                        <p className="text-xs font-semibold text-green-700">
                          ✅ Connected - Realm: {account?.realmId}
                        </p>
                        {account?.connectedAt && (
                          <p className="text-xs text-green-600">
                            Connected: {new Date(account.connectedAt).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex flex-col gap-2 items-end">
                  {isConnected ? (
                    <button
                      onClick={() => handleDisconnect(qb.country)}
                      className="px-5 py-2.5 bg-red-500 text-white rounded-lg hover:bg-red-600 shadow-sm font-semibold transition-colors flex items-center"
                    >
                      <span className="mr-2">🔓</span> Disconnect
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={() => handleConnect(qb.country, qb.currency)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-bold shadow-sm transition-colors flex items-center"
                      >
                        <span className="mr-2">🔗</span> Connect {qb.currency}
                      </button>
                      <button
                        onClick={() => handleRemoveCountry(qb.country)}
                        className="px-2 py-1 text-xs text-gray-400 hover:text-red-500 transition"
                      >
                        Remove
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}

          {/* Add New Country Card */}
          <div
            onClick={() => setShowAddCountry(true)}
            className="border-2 border-dashed border-gray-300 rounded-lg p-4 flex items-center justify-center cursor-pointer hover:border-blue-600 hover:bg-blue-50 transition"
          >
            <div className="text-center">
              <p className="text-2xl mb-1">➕</p>
              <p className="text-sm font-medium text-gray-600">Add Country</p>
              <p className="text-xs text-gray-400">Connect a new QB account</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Customer Sync */}
        <div className="p-6 bg-white border border-gray-200 rounded-xl shadow-sm">
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center border-b pb-3">
            <span className="text-2xl mr-2">👥</span>
            Customer & Vendor Sync
          </h2>

          <p className="text-gray-700 mb-6 min-h-[50px]">
            Sync your clients (Customers) and transporters (Vendors) from FleetXChange to QuickBooks.
          </p>

          <button
            onClick={handleSyncCustomers}
            disabled={customerSyncing || !qbStatus?.isConnected}
            className={`w-full px-6 py-3 rounded-lg font-bold shadow-sm flex items-center justify-center transition-colors ${
              customerSyncing || !qbStatus?.isConnected
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed border border-gray-300'
                : 'bg-green-600 text-white hover:bg-green-700'
            }`}
          >
            {customerSyncing ? (
              <span className="flex items-center"><span className="animate-spin mr-2">⏳</span> Syncing Users...</span>
            ) : (
              <span className="flex items-center"><span className="mr-2">🔄</span> Sync All Users</span>
            )}
          </button>

          {qbStatus?.customerId && (
            <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded text-sm text-green-800 font-medium">
              ✅ You're synced as QB Customer: {qbStatus.customerId}
            </div>
          )}
        </div>

        {/* Sync Settings / Payment Setup Dummy */}
        <div className="p-6 bg-blue-50 border border-blue-100 rounded-xl shadow-sm">
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center border-b border-blue-200 pb-3">
            <span className="text-2xl mr-2">⏰</span>
            Auto-Sync Schedule
          </h2>
          <ul className="space-y-3 text-gray-700">
            <li className="flex items-start">
              <span className="text-green-500 mr-2">✅</span> 
              <span>Payments sync automatically every <strong>1 hour</strong></span>
            </li>
            <li className="flex items-start">
              <span className="text-green-500 mr-2">✅</span> 
              <span>First sync runs 5 minutes after app start</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-500 mr-2">✅</span> 
              <span>Failed syncs are logged and retried</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-500 mr-2">✅</span> 
              <span>Manual syncs can be triggered anytime</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Add Country Modal */}
      {showAddCountry && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Add New Country</h3>
            
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-700">Country Code *</label>
                <input
                  type="text"
                  placeholder="e.g. NG"
                  maxLength={3}
                  value={newCountry.country}
                  onChange={e => setNewCountry({...newCountry, country: e.target.value.toUpperCase()})}
                  className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg text-sm uppercase text-black"
                />
                <p className="text-xs text-gray-400 mt-1">2-3 letter ISO country code</p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">Country Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Nigeria"
                  value={newCountry.label}
                  onChange={e => setNewCountry({...newCountry, label: e.target.value})}
                  className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-black"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">Currency Code *</label>
                <input
                  type="text"
                  placeholder="e.g. NGN"
                  maxLength={3}
                  value={newCountry.currency}
                  onChange={e => setNewCountry({...newCountry, currency: e.target.value.toUpperCase()})}
                  className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg text-sm uppercase text-black"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">Flag Emoji *</label>
                <input
                  type="text"
                  placeholder="e.g. 🇳🇬"
                  value={newCountry.flag}
                  onChange={e => setNewCountry({...newCountry, flag: e.target.value})}
                  className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-black"
                />
                <p className="text-xs text-gray-400 mt-1">
                  Get flag emoji from: emojipedia.org
                </p>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowAddCountry(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 text-sm hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleAddCountry}
                disabled={addingCountry}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
              >
                {addingCountry ? 'Adding...' : 'Add Country'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function QuickBooksPage() {
  return (
    <Suspense fallback={
      <div className="p-8 w-full max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-4 flex items-center text-gray-900">
          <span className="text-3xl mr-3">📊</span> QuickBooks Management
        </h1>
        <div className="text-center py-8 text-gray-600">Loading QuickBooks Dashboard...</div>
      </div>
    }>
      <QuickBooksDashboardContent />
    </Suspense>
  );
}
