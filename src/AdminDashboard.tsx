"use client";

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from './supabaseClient';
import { useAuth } from '@/context/auth-context';
import { motion, AnimatePresence } from 'framer-motion';
import { gsap } from 'gsap';

interface UserStats {
  id: string;
  email: string;
  created_at: string;
  tier: string;
  total_chats: number;
  total_images: number;
  total_videos: number;
  total_web_searches: number;
  last_active: string;
  stripe_customer_id?: string;
}

interface ApiLog {
  id: string;
  user_id: string;
  email: string;
  endpoint: string;
  request_data: any;
  response_data: any;
  status_code: number;
  created_at: string;
}

interface SystemMetrics {
  total_users: number;
  active_today: number;
  total_revenue: number;
  free_users: number;
  pro_users: number;
  ultra_users: number;
  total_api_calls: number;
  avg_response_time: number;
}

const AdminDashboard = () => {
  const { user, session, loading } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'logs' | 'analytics' | 'control'>('overview');
  const [users, setUsers] = useState<UserStats[]>([]);
  const [apiLogs, setApiLogs] = useState<ApiLog[]>([]);
  const [systemMetrics, setSystemMetrics] = useState<SystemMetrics | null>(null);
  const [selectedUser, setSelectedUser] = useState<UserStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [logFilter, setLogFilter] = useState<'all' | 'errors' | 'success'>('all');
  const containerRef = useRef<HTMLDivElement>(null);

  // Check if user is admin - wait for auth to load
  useEffect(() => {
    console.log('AdminDashboard: Auth state -', { 
      loading, 
      user: user?.email, 
      session: !!session 
    });
    
    // Wait for auth to finish loading
    if (loading) {
      console.log('AdminDashboard: Auth still loading...');
      return;
    }
    
    // Check if logged in
    if (!session || !user) {
      console.log('AdminDashboard: No session, redirecting to /login');
      router.replace('/login');
      return;
    }
    
    // Check if admin
    if (user.email !== 'andregreengp@gmail.com') {
      console.log('AdminDashboard: Not admin (' + user.email + '), redirecting to /chat');
      router.replace('/chat');
      return;
    }
    
    console.log('AdminDashboard: ✅ Admin access confirmed for', user.email);
  }, [user, session, loading, router]);

  // Fetch system metrics
  const fetchSystemMetrics = async () => {
    try {
      // Get total users from public.users table
      const { count: totalUsers } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true });

      // Get subscription breakdown from users table
      const { data: users } = await supabase
        .from('users')
        .select('subscription_tier');

      const freeUsers = users?.filter(u => !u.subscription_tier || u.subscription_tier === 'free').length || 0;
      const proUsers = users?.filter(u => u.subscription_tier === 'pro').length || 0;
      const ultraUsers = 0; // Ultra tier if you add it later

      // Get API call count
      const { count: apiCalls } = await supabase
        .from('api_logs')
        .select('*', { count: 'exact', head: true });

      // Get active users today
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const { count: activeToday } = await supabase
        .from('api_logs')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', today.toISOString());

      setSystemMetrics({
        total_users: totalUsers || 0,
        active_today: activeToday || 0,
        total_revenue: (proUsers * 4.99 + ultraUsers * 19.99),
        free_users: freeUsers,
        pro_users: proUsers,
        ultra_users: ultraUsers,
        total_api_calls: apiCalls || 0,
        avg_response_time: 1.2, // Mock data - could calculate from logs
      });
    } catch (error) {
      console.error('Error fetching system metrics:', error);
    }
  };

  // Fetch all users with stats
  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase.rpc('get_admin_user_stats');
      
      if (error) {
        console.error('Error fetching users:', error);
        // Fallback: fetch basic user data from users table
        const { data: usersData } = await supabase
          .from('users')
          .select(`
            id,
            email,
            subscription_tier,
            stripe_customer_id,
            created_at
          `);
        
        const userStats = await Prvizualse.all((usersData || []).map(async (user) => {
          // Get aggregated usage stats
          const { data: chatUsage } = await supabase
            .from('usage_tracking')
            .select('count')
            .eq('user_id', user.id)
            .eq('usage_type', 'chat');
          
          const { data: imageUsage } = await supabase
            .from('usage_tracking')
            .select('count')
            .eq('user_id', user.id)
            .eq('usage_type', 'image_gen');
          
          const { data: videoUsage } = await supabase
            .from('usage_tracking')
            .select('count')
            .eq('user_id', user.id)
            .eq('usage_type', 'video_gen');

          const { data: lastActivity } = await supabase
            .from('usage_tracking')
            .select('created_at')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

          return {
            id: user.id,
            email: user.email || 'Unknown',
            created_at: user.created_at,
            tier: user.subscription_tier || 'free',
            total_chats: chatUsage?.reduce((sum, u) => sum + (u.count || 0), 0) || 0,
            total_images: imageUsage?.reduce((sum, u) => sum + (u.count || 0), 0) || 0,
            total_videos: videoUsage?.reduce((sum, u) => sum + (u.count || 0), 0) || 0,
            total_web_searches: 0, // Will be added once web_searches column is populated
            last_active: lastActivity?.created_at || user.created_at,
            stripe_customer_id: user.stripe_customer_id,
          };
        }));

        setUsers(userStats);
      } else {
        setUsers(data || []);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  // Fetch API logs
  const fetchApiLogs = async () => {
    try {
      const query = supabase
        .from('api_logs')
        .select(`
          id,
          user_id,
          endpoint,
          request_data,
          response_data,
          status_code,
          created_at
        `)
        .order('created_at', { ascending: false })
        .limit(100);

      if (logFilter === 'errors') {
        query.gte('status_code', 400);
      } else if (logFilter === 'success') {
        query.lt('status_code', 400);
      }

      const { data, error } = await query;

      if (!error && data) {
        // Fetch user emails
        const logsWithEmails = await Prvizualse.all(data.map(async (log) => {
          const { data: userData } = await supabase.auth.admin.getUserById(log.user_id);
          return {
            ...log,
            email: userData?.user?.email || 'Unknown',
          };
        }));

        setApiLogs(logsWithEmails);
      }
    } catch (error) {
      console.error('Error fetching API logs:', error);
    }
  };

  // Initial load
  useEffect(() => {
    const loadData = async () => {
      // Only load if user is confirmed admin
      if (!user || user.email !== 'andregreengp@gmail.com') {
        console.log('AdminDashboard: Skipping data load - not admin');
        return;
      }
      
      console.log('AdminDashboard: Loading admin data...');
      setIsLoading(true);
      await Prvizualse.all([
        fetchSystemMetrics(),
        fetchUsers(),
        fetchApiLogs(),
      ]);
      setIsLoading(false);
    };

    loadData();
  }, [logFilter, user]); // Add user as dependency

  // Auto-refresh every 30 seconds
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      fetchSystemMetrics();
      fetchApiLogs();
    }, 30000);

    return () => clearInterval(interval);
  }, [autoRefresh, logFilter]);

  // Entrance animation
  useEffect(() => {
    if (containerRef.current && !isLoading) {
      gsap.fromTo(
        containerRef.current.children,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.5, stagger: 0.1, ease: 'power2.out' }
      );
    }
  }, [isLoading, activeTab]);

  // Filter users based on search
  const filteredUsers = users.filter(u => 
    u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // User action handlers
  const handleUpgradeUser = async (userId: string, tier: 'pro' | 'ultra') => {
    try {
      // Update the users table directly
      await supabase
        .from('users')
        .update({
          subscription_tier: tier,
          subscription_status: 'active',
        })
        .eq('id', userId);

      alert(`User upgraded to ${tier.toUpperCase()} tier`);
      fetchUsers();
    } catch (error) {
      console.error('Error upgrading user:', error);
      alert('Failed to upgrade user');
    }
  };

  const handleResetUsage = async (userId: string) => {
    try {
      // Delete all usage records for this user to reset
      await supabase
        .from('usage_tracking')
        .delete()
        .eq('user_id', userId);

      alert('User usage reset successfully');
      fetchUsers();
    } catch (error) {
      console.error('Error resetting usage:', error);
      alert('Failed to reset usage');
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return;
    }

    try {
      await supabase.auth.admin.deleteUser(userId);
      alert('User deleted successfully');
      fetchUsers();
      setSelectedUser(null);
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('Failed to delete user');
    }
  };

  if (loading || isLoading) {
    return (
      <div className="admin-loading">
        <div className="loading-spinner"></div>
        <p>Loading Admin Dashboard...</p>
      </div>
    );
  }

  // Don't render anything if not admin (will redirect)
  if (!user || user.email !== 'andregreengp@gmail.com') {
    return null;
  }

  return (
    <div className="admin-dashboard" ref={containerRef}>
      {/* Header */}
      <div className="admin-header">
        <div className="header-left">
          <button className="back-btn" onClick={() => router.push('/chat')}>
            ← Back to App
          </button>
          <div className="admin-title">
            <h1>Admin Dashboard</h1>
            <span className="admin-badge">MASTER CONTROL</span>
          </div>
        </div>
        <div className="header-right">
          <div className="refresh-toggle">
            <input
              type="checkbox"
              id="auto-refresh"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
            />
            <label htmlFor="auto-refresh">Auto-refresh (30s)</label>
          </div>
          <button className="refresh-btn" onClick={() => {
            fetchSystemMetrics();
            fetchUsers();
            fetchApiLogs();
          }}>
            🔄 Refresh Now
          </button>
        </div>
      </div>

      {/* System Metrics Cards */}
      {systemMetrics && (
        <div className="metrics-grid">
          <motion.div className="metric-card" whileHover={{ scale: 1.02 }}>
            <div className="metric-icon">👥</div>
            <div className="metric-content">
              <div className="metric-label">Total Users</div>
              <div className="metric-value">{systemMetrics.total_users}</div>
              <div className="metric-breakdown">
                <span className="tier-badge free">{systemMetrics.free_users} Free</span>
                <span className="tier-badge pro">{systemMetrics.pro_users} Pro</span>
                <span className="tier-badge ultra">{systemMetrics.ultra_users} Ultra</span>
              </div>
            </div>
          </motion.div>

          <motion.div className="metric-card" whileHover={{ scale: 1.02 }}>
            <div className="metric-icon">⚡</div>
            <div className="metric-content">
              <div className="metric-label">Active Today</div>
              <div className="metric-value">{systemMetrics.active_today}</div>
              <div className="metric-detail">
                {systemMetrics.total_users > 0 
                  ? `${((systemMetrics.active_today / systemMetrics.total_users) * 100).toFixed(1)}% of total`
                  : '0%'
                }
              </div>
            </div>
          </motion.div>

          <motion.div className="metric-card revenue" whileHover={{ scale: 1.02 }}>
            <div className="metric-icon">💰</div>
            <div className="metric-content">
              <div className="metric-label">Monthly Revenue (Est.)</div>
              <div className="metric-value">${systemMetrics.total_revenue.toFixed(2)}</div>
              <div className="metric-detail">
                ${(systemMetrics.total_revenue * 12).toFixed(2)}/year
              </div>
            </div>
          </motion.div>

          <motion.div className="metric-card" whileHover={{ scale: 1.02 }}>
            <div className="metric-icon">📊</div>
            <div className="metric-content">
              <div className="metric-label">Total API Calls</div>
              <div className="metric-value">{systemMetrics.total_api_calls.toLocaleString()}</div>
              <div className="metric-detail">
                Avg: {systemMetrics.avg_response_time}s response
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="admin-tabs">
        <button
          className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          <span className="tab-icon">📊</span>
          Overview
        </button>
        <button
          className={`tab-btn ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => setActiveTab('users')}
        >
          <span className="tab-icon">👥</span>
          Users ({users.length})
        </button>
        <button
          className={`tab-btn ${activeTab === 'logs' ? 'active' : ''}`}
          onClick={() => setActiveTab('logs')}
        >
          <span className="tab-icon">📝</span>
          API Logs ({apiLogs.length})
        </button>
        <button
          className={`tab-btn ${activeTab === 'analytics' ? 'active' : ''}`}
          onClick={() => setActiveTab('analytics')}
        >
          <span className="tab-icon">📈</span>
          Analytics
        </button>
        <button
          className={`tab-btn ${activeTab === 'control' ? 'active' : ''}`}
          onClick={() => setActiveTab('control')}
        >
          <span className="tab-icon">⚙️</span>
          Control Panel
        </button>
      </div>

      {/* Tab Content */}
      <div className="admin-content">
        <AnimatePresence mode="wait">
          {activeTab === 'overview' && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="tab-content"
            >
              <h2>System Overview</h2>
              
              {/* Recent Activity */}
              <div className="section-card">
                <h3>Recent Activity (Last 10)</h3>
                <div className="activity-list">
                  {apiLogs.slice(0, 10).map((log) => (
                    <div key={log.id} className="activity-item">
                      <div className="activity-icon">
                        {log.status_code < 400 ? '✅' : '❌'}
                      </div>
                      <div className="activity-details">
                        <div className="activity-user">{log.email}</div>
                        <div className="activity-action">
                          {log.endpoint} • Status: {log.status_code}
                        </div>
                      </div>
                      <div className="activity-time">
                        {new Date(log.created_at).toLocaleTimeString()}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Top Users */}
              <div className="section-card">
                <h3>Top Users by Activity</h3>
                <div className="top-users-list">
                  {users
                    .sort((a, b) => 
                      (b.total_chats + b.total_images + b.total_videos + b.total_web_searches) -
                      (a.total_chats + a.total_images + a.total_videos + a.total_web_searches)
                    )
                    .slice(0, 5)
                    .map((user) => {
                      const totalActivity = user.total_chats + user.total_images + user.total_videos + user.total_web_searches;
                      return (
                        <div key={user.id} className="top-user-item">
                          <div className="user-info">
                            <div className="user-email">{user.email}</div>
                            <span className={`tier-badge ${user.tier}`}>{user.tier}</span>
                          </div>
                          <div className="user-activity">
                            <div className="activity-bar" style={{ width: `${(totalActivity / 100) * 100}%` }}></div>
                            <span className="activity-count">{totalActivity} actions</span>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'users' && (
            <motion.div
              key="users"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="tab-content"
            >
              <div className="content-header">
                <h2>User Management</h2>
                <input
                  type="text"
                  className="search-input"
                  placeholder="Search users by email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <div className="users-table-container">
                <table className="users-table">
                  <thead>
                    <tr>
                      <th>Email</th>
                      <th>Tier</th>
                      <th>Chats</th>
                      <th>Images</th>
                      <th>Videos</th>
                      <th>Web Tasks</th>
                      <th>Joined</th>
                      <th>Last Active</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((user) => (
                      <tr key={user.id} onClick={() => setSelectedUser(user)}>
                        <td className="email-cell">{user.email}</td>
                        <td>
                          <span className={`tier-badge ${user.tier}`}>{user.tier}</span>
                        </td>
                        <td>{user.total_chats}</td>
                        <td>{user.total_images}</td>
                        <td>{user.total_videos}</td>
                        <td>{user.total_web_searches}</td>
                        <td>{new Date(user.created_at).toLocaleDateString()}</td>
                        <td>{new Date(user.last_active).toLocaleDateString()}</td>
                        <td className="actions-cell">
                          <button className="action-btn" onClick={(e) => {
                            e.stopPropagation();
                            setSelectedUser(user);
                          }}>
                            Details
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}

          {activeTab === 'logs' && (
            <motion.div
              key="logs"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="tab-content"
            >
              <div className="content-header">
                <h2>API Logs</h2>
                <div className="log-filters">
                  <button
                    className={`filter-btn ${logFilter === 'all' ? 'active' : ''}`}
                    onClick={() => setLogFilter('all')}
                  >
                    All
                  </button>
                  <button
                    className={`filter-btn ${logFilter === 'success' ? 'active' : ''}`}
                    onClick={() => setLogFilter('success')}
                  >
                    Success
                  </button>
                  <button
                    className={`filter-btn ${logFilter === 'errors' ? 'active' : ''}`}
                    onClick={() => setLogFilter('errors')}
                  >
                    Errors
                  </button>
                </div>
              </div>

              <div className="logs-container">
                {apiLogs.map((log) => (
                  <div key={log.id} className={`log-item ${log.status_code >= 400 ? 'error' : 'success'}`}>
                    <div className="log-header">
                      <span className="log-status">{log.status_code}</span>
                      <span className="log-endpoint">{log.endpoint}</span>
                      <span className="log-user">{log.email}</span>
                      <span className="log-time">{new Date(log.created_at).toLocaleString()}</span>
                    </div>
                    <details className="log-details">
                      <summary>View Request/Response</summary>
                      <div className="log-data">
                        <div className="log-section">
                          <h4>Request:</h4>
                          <pre>{JSON.stringify(log.request_data, null, 2)}</pre>
                        </div>
                        <div className="log-section">
                          <h4>Response:</h4>
                          <pre>{JSON.stringify(log.response_data, null, 2)}</pre>
                        </div>
                      </div>
                    </details>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === 'analytics' && (
            <motion.div
              key="analytics"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="tab-content"
            >
              <h2>Analytics & Insights</h2>
              
              <div className="analytics-grid">
                <div className="analytics-card">
                  <h3>User Growth</h3>
                  <div className="chart-placeholder">
                    <div className="cvizualng-soon">Chart visualization cvizualng soon</div>
                  </div>
                </div>

                <div className="analytics-card">
                  <h3>Feature Usage</h3>
                  <div className="usage-breakdown">
                    <div className="usage-item">
                      <span className="usage-label">Chat Messages</span>
                      <div className="usage-bar-container">
                        <div className="usage-bar" style={{ width: '85%' }}></div>
                      </div>
                      <span className="usage-percent">85%</span>
                    </div>
                    <div className="usage-item">
                      <span className="usage-label">Image Generation</span>
                      <div className="usage-bar-container">
                        <div className="usage-bar" style={{ width: '60%' }}></div>
                      </div>
                      <span className="usage-percent">60%</span>
                    </div>
                    <div className="usage-item">
                      <span className="usage-label">Video Generation</span>
                      <div className="usage-bar-container">
                        <div className="usage-bar" style={{ width: '35%' }}></div>
                      </div>
                      <span className="usage-percent">35%</span>
                    </div>
                    <div className="usage-item">
                      <span className="usage-label">AI Web Tasks</span>
                      <div className="usage-bar-container">
                        <div className="usage-bar" style={{ width: '25%' }}></div>
                      </div>
                      <span className="usage-percent">25%</span>
                    </div>
                  </div>
                </div>

                <div className="analytics-card">
                  <h3>Conversion Funnel</h3>
                  <div className="funnel-chart">
                    <div className="funnel-stage">
                      <div className="funnel-bar" style={{ width: '100%' }}>
                        <span>Visitors: 100%</span>
                      </div>
                    </div>
                    <div className="funnel-stage">
                      <div className="funnel-bar" style={{ width: '70%' }}>
                        <span>Sign Ups: 70%</span>
                      </div>
                    </div>
                    <div className="funnel-stage">
                      <div className="funnel-bar" style={{ width: '30%' }}>
                        <span>Pro Users: 30%</span>
                      </div>
                    </div>
                    <div className="funnel-stage">
                      <div className="funnel-bar" style={{ width: '10%' }}>
                        <span>Ultra Users: 10%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'control' && (
            <motion.div
              key="control"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="tab-content"
            >
              <h2>System Control Panel</h2>
              
              <div className="control-grid">
                <div className="control-card">
                  <h3>🗄️ Database Management</h3>
                  <button className="control-btn">View Database Status</button>
                  <button className="control-btn">Run Maintenance</button>
                  <button className="control-btn">Export All Data</button>
                </div>

                <div className="control-card">
                  <h3>🔐 Security & Auth</h3>
                  <button className="control-btn">View Active Sessions</button>
                  <button className="control-btn">Revoke All Tokens</button>
                  <button className="control-btn">Security Audit Log</button>
                </div>

                <div className="control-card">
                  <h3>💳 Billing & Subscriptions</h3>
                  <button className="control-btn">Stripe Dashboard</button>
                  <button className="control-btn">Revenue Report</button>
                  <button className="control-btn">Failed Payments</button>
                </div>

                <div className="control-card">
                  <h3>🚨 System Alerts</h3>
                  <div className="alerts-list">
                    <div className="alert-item success">✅ All systems operational</div>
                    <div className="alert-item info">ℹ️ Database backup scheduled for tonight</div>
                  </div>
                </div>

                <div className="control-card danger">
                  <h3>⚠️ Danger Zone</h3>
                  <button className="control-btn danger">Reset All Usage Counters</button>
                  <button className="control-btn danger">Clear All Logs</button>
                  <button className="control-btn danger">Emergency Shutdown</button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* User Detail Modal */}
      <AnimatePresence>
        {selectedUser && (
          <motion.div
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedUser(null)}
          >
            <motion.div
              className="user-detail-modal"
              initial={{ scale: 0.9, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 50 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal-header">
                <h2>User Details</h2>
                <button className="close-btn" onClick={() => setSelectedUser(null)}>✕</button>
              </div>

              <div className="modal-body">
                <div className="detail-row">
                  <span className="detail-label">Email:</span>
                  <span className="detail-value">{selectedUser.email}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">User ID:</span>
                  <span className="detail-value code">{selectedUser.id}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Current Tier:</span>
                  <span className={`tier-badge ${selectedUser.tier}`}>{selectedUser.tier}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Stripe Customer ID:</span>
                  <span className="detail-value code">{selectedUser.stripe_customer_id || 'N/A'}</span>
                </div>

                <div className="usage-summary">
                  <h3>Usage Summary</h3>
                  <div className="usage-grid">
                    <div className="usage-stat">
                      <div className="stat-value">{selectedUser.total_chats}</div>
                      <div className="stat-label">Chats</div>
                    </div>
                    <div className="usage-stat">
                      <div className="stat-value">{selectedUser.total_images}</div>
                      <div className="stat-label">Images</div>
                    </div>
                    <div className="usage-stat">
                      <div className="stat-value">{selectedUser.total_videos}</div>
                      <div className="stat-label">Videos</div>
                    </div>
                    <div className="usage-stat">
                      <div className="stat-value">{selectedUser.total_web_searches}</div>
                      <div className="stat-label">Web Tasks</div>
                    </div>
                  </div>
                </div>

                <div className="modal-actions">
                  <h3>Admin Actions</h3>
                  <div className="action-buttons">
                    <button 
                      className="action-btn upgrade"
                      onClick={() => handleUpgradeUser(selectedUser.id, 'pro')}
                    >
                      Upgrade to Pro
                    </button>
                    <button 
                      className="action-btn upgrade"
                      onClick={() => handleUpgradeUser(selectedUser.id, 'ultra')}
                    >
                      Upgrade to Ultra
                    </button>
                    <button 
                      className="action-btn reset"
                      onClick={() => handleResetUsage(selectedUser.id)}
                    >
                      Reset Usage
                    </button>
                    <button 
                      className="action-btn delete"
                      onClick={() => handleDeleteUser(selectedUser.id)}
                    >
                      Delete User
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating particles */}
      <div className="admin-particles">
        {[...Array(10)].map((_, i) => (
          <div
            key={i}
            className="particle"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default AdminDashboard;
