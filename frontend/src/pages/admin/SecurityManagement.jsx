import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  ShieldCheckIcon,
  KeyIcon,
  EyeIcon,
  EyeSlashIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  UserIcon,
  ComputerDesktopIcon,
  DevicePhoneMobileIcon,
  GlobeAltIcon,
  LockClosedIcon,
  ShieldExclamationIcon,
  CogIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';
import { collection, getDocs, query, orderBy, where, updateDoc, doc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { useFirebaseAuth } from '../../hooks/useFirebaseAuth';
import Button from '../../components/common/Button';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Card from '../../components/common/Card';

const SecurityManagement = () => {
  const { user } = useFirebaseAuth();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [securityData, setSecurityData] = useState({
    loginAttempts: [],
    activeSessions: [],
    securitySettings: {},
    auditLogs: [],
    threats: [],
    backups: []
  });

  useEffect(() => {
    loadSecurityData();
  }, []);

  const loadSecurityData = async () => {
    try {
      setLoading(true);
      console.log('🔒 Loading security data...');

      // Load login attempts (from users collection)
      const usersSnapshot = await getDocs(collection(db, 'users'));
      const users = usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      // Generate mock security data based on real users
      const loginAttempts = generateLoginAttempts(users);
      const activeSessions = generateActiveSessions(users);
      const auditLogs = generateAuditLogs(users);
      const threats = generateThreats();
      const backups = generateBackups();

      // Security settings
      const securitySettings = {
        twoFactorEnabled: false,
        passwordPolicy: {
          minLength: 8,
          requireUppercase: true,
          requireNumbers: true,
          requireSymbols: false,
          maxAge: 90
        },
        sessionTimeout: 30,
        maxLoginAttempts: 5,
        ipWhitelist: [],
        emailNotifications: true,
        auditLogging: true
      };

      setSecurityData({
        loginAttempts,
        activeSessions,
        securitySettings,
        auditLogs,
        threats,
        backups
      });

      console.log('✅ Security data loaded');
    } catch (error) {
      console.error('❌ Error loading security data:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateLoginAttempts = (users) => {
    const attempts = [];
    const statuses = ['success', 'failed', 'blocked'];
    const devices = ['Desktop', 'Mobile', 'Tablet'];
    const browsers = ['Chrome', 'Firefox', 'Safari', 'Edge'];
    const locations = ['Cairo, Egypt', 'Alexandria, Egypt', 'Giza, Egypt', 'Unknown'];

    users.slice(0, 10).forEach((user, index) => {
      for (let i = 0; i < Math.floor(Math.random() * 5) + 1; i++) {
        const date = new Date();
        date.setHours(date.getHours() - Math.floor(Math.random() * 72));
        
        attempts.push({
          id: `attempt-${index}-${i}`,
          userId: user.id,
          userEmail: user.email,
          userName: `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Unknown',
          status: statuses[Math.floor(Math.random() * statuses.length)],
          ipAddress: `192.168.1.${Math.floor(Math.random() * 255)}`,
          device: devices[Math.floor(Math.random() * devices.length)],
          browser: browsers[Math.floor(Math.random() * browsers.length)],
          location: locations[Math.floor(Math.random() * locations.length)],
          timestamp: date,
          userAgent: `Mozilla/5.0 (${devices[Math.floor(Math.random() * devices.length)]})`,
        });
      }
    });

    return attempts.sort((a, b) => b.timestamp - a.timestamp);
  };

  const generateActiveSessions = (users) => {
    const sessions = [];
    const devices = ['Desktop', 'Mobile', 'Tablet'];
    const browsers = ['Chrome', 'Firefox', 'Safari', 'Edge'];
    const locations = ['Cairo, Egypt', 'Alexandria, Egypt', 'Giza, Egypt'];

    users.slice(0, 5).forEach((user, index) => {
      const sessionStart = new Date();
      sessionStart.setHours(sessionStart.getHours() - Math.floor(Math.random() * 24));
      
      sessions.push({
        id: `session-${index}`,
        userId: user.id,
        userEmail: user.email,
        userName: `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Unknown',
        ipAddress: `192.168.1.${Math.floor(Math.random() * 255)}`,
        device: devices[Math.floor(Math.random() * devices.length)],
        browser: browsers[Math.floor(Math.random() * browsers.length)],
        location: locations[Math.floor(Math.random() * locations.length)],
        startTime: sessionStart,
        lastActivity: new Date(),
        isCurrentSession: index === 0 && user.email === user?.email,
      });
    });

    return sessions.sort((a, b) => b.lastActivity - a.lastActivity);
  };

  const generateAuditLogs = (users) => {
    const logs = [];
    const actions = [
      'User Login', 'User Logout', 'Password Changed', 'Profile Updated',
      'Trip Created', 'Hotel Added', 'Booking Made', 'Review Posted',
      'Admin Action', 'Settings Changed', 'Data Export', 'Security Alert'
    ];

    users.slice(0, 8).forEach((user, index) => {
      for (let i = 0; i < Math.floor(Math.random() * 3) + 1; i++) {
        const date = new Date();
        date.setHours(date.getHours() - Math.floor(Math.random() * 48));
        
        logs.push({
          id: `log-${index}-${i}`,
          userId: user.id,
          userEmail: user.email,
          userName: `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Unknown',
          action: actions[Math.floor(Math.random() * actions.length)],
          details: 'Action performed successfully',
          ipAddress: `192.168.1.${Math.floor(Math.random() * 255)}`,
          timestamp: date,
          severity: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)],
        });
      }
    });

    return logs.sort((a, b) => b.timestamp - a.timestamp);
  };

  const generateThreats = () => {
    return [
      {
        id: 'threat-1',
        type: 'Brute Force Attack',
        severity: 'high',
        status: 'blocked',
        ipAddress: '192.168.1.100',
        attempts: 15,
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
        description: 'Multiple failed login attempts detected'
      },
      {
        id: 'threat-2',
        type: 'Suspicious Activity',
        severity: 'medium',
        status: 'monitoring',
        ipAddress: '192.168.1.200',
        attempts: 5,
        timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000),
        description: 'Unusual access pattern detected'
      }
    ];
  };

  const generateBackups = () => {
    return [
      {
        id: 'backup-1',
        type: 'Full Backup',
        status: 'completed',
        size: '2.5 GB',
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
        location: 'Firebase Storage'
      },
      {
        id: 'backup-2',
        type: 'Incremental Backup',
        status: 'completed',
        size: '150 MB',
        timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000),
        location: 'Firebase Storage'
      }
    ];
  };

  const formatTimestamp = (timestamp) => {
    return timestamp.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status) => {
    const badges = {
      success: 'bg-green-100 text-green-800',
      failed: 'bg-red-100 text-red-800',
      blocked: 'bg-red-100 text-red-800',
      completed: 'bg-green-100 text-green-800',
      monitoring: 'bg-yellow-100 text-yellow-800',
      active: 'bg-blue-100 text-blue-800'
    };

    return badges[status] || 'bg-gray-100 text-gray-800';
  };

  const getSeverityBadge = (severity) => {
    const badges = {
      low: 'bg-green-100 text-green-800',
      medium: 'bg-yellow-100 text-yellow-800',
      high: 'bg-red-100 text-red-800'
    };

    return badges[severity] || 'bg-gray-100 text-gray-800';
  };

  const getDeviceIcon = (device) => {
    switch (device.toLowerCase()) {
      case 'mobile':
        return DevicePhoneMobileIcon;
      case 'tablet':
        return DevicePhoneMobileIcon;
      default:
        return ComputerDesktopIcon;
    }
  };

  const tabs = [
    { id: 'overview', name: 'Security Overview', icon: ShieldCheckIcon },
    { id: 'logins', name: 'Login Attempts', icon: KeyIcon },
    { id: 'sessions', name: 'Active Sessions', icon: UserIcon },
    { id: 'audit', name: 'Audit Logs', icon: ClockIcon },
    { id: 'threats', name: 'Threat Detection', icon: ShieldExclamationIcon },
    { id: 'settings', name: 'Security Settings', icon: CogIcon },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="large" text="Loading security data..." />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Security Management</h1>
          <p className="text-gray-600">Monitor and manage system security, user access, and threats</p>
        </div>
        <div className="flex space-x-3">
          <Button
            variant="outline"
            onClick={loadSecurityData}
            className="flex items-center"
          >
            <ArrowPathIcon className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button className="bg-red-600 hover:bg-red-700">
            <ShieldExclamationIcon className="h-4 w-4 mr-2" />
            Security Alert
          </Button>
        </div>
      </div>

      {/* Security Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          {
            title: 'Active Sessions',
            value: securityData.activeSessions.length,
            icon: UserIcon,
            color: 'blue',
            change: '+2 from yesterday'
          },
          {
            title: 'Failed Logins (24h)',
            value: securityData.loginAttempts.filter(a => 
              a.status === 'failed' && 
              a.timestamp > new Date(Date.now() - 24 * 60 * 60 * 1000)
            ).length,
            icon: ExclamationTriangleIcon,
            color: 'red',
            change: '-5 from yesterday'
          },
          {
            title: 'Security Threats',
            value: securityData.threats.length,
            icon: ShieldExclamationIcon,
            color: 'orange',
            change: 'All blocked'
          },
          {
            title: 'Last Backup',
            value: '12h ago',
            icon: CheckCircleIcon,
            color: 'green',
            change: 'Automated'
          }
        ].map((stat, index) => {
          const IconComponent = stat.icon;
          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">{stat.title}</p>
                    <p className={`text-2xl font-bold text-${stat.color}-600`}>{stat.value}</p>
                    <p className="text-xs text-gray-500 mt-1">{stat.change}</p>
                  </div>
                  <div className={`p-3 bg-${stat.color}-100 rounded-lg`}>
                    <IconComponent className={`h-6 w-6 text-${stat.color}-600`} />
                  </div>
                </div>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => {
            const IconComponent = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <IconComponent className="h-4 w-4 mr-2" />
                {tab.name}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Security Events */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Security Events</h3>
              <div className="space-y-3">
                {securityData.auditLogs.slice(0, 5).map((log) => (
                  <div key={log.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{log.action}</p>
                      <p className="text-xs text-gray-500">{log.userEmail} • {formatTimestamp(log.timestamp)}</p>
                    </div>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getSeverityBadge(log.severity)}`}>
                      {log.severity}
                    </span>
                  </div>
                ))}
              </div>
            </Card>

            {/* System Health */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">System Health</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Two-Factor Authentication</span>
                  <span className="flex items-center text-sm text-red-600">
                    <XCircleIcon className="h-4 w-4 mr-1" />
                    Disabled
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Password Policy</span>
                  <span className="flex items-center text-sm text-green-600">
                    <CheckCircleIcon className="h-4 w-4 mr-1" />
                    Active
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Audit Logging</span>
                  <span className="flex items-center text-sm text-green-600">
                    <CheckCircleIcon className="h-4 w-4 mr-1" />
                    Enabled
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Backup Status</span>
                  <span className="flex items-center text-sm text-green-600">
                    <CheckCircleIcon className="h-4 w-4 mr-1" />
                    Up to date
                  </span>
                </div>
              </div>
            </Card>
          </div>
        )}

        {activeTab === 'logins' && (
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Login Attempts</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Device</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {securityData.loginAttempts.slice(0, 10).map((attempt) => {
                    const DeviceIcon = getDeviceIcon(attempt.device);
                    return (
                      <tr key={attempt.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{attempt.userName}</div>
                            <div className="text-sm text-gray-500">{attempt.userEmail}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadge(attempt.status)}`}>
                            {attempt.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <DeviceIcon className="h-4 w-4 text-gray-400 mr-2" />
                            <span className="text-sm text-gray-900">{attempt.device}</span>
                          </div>
                          <div className="text-sm text-gray-500">{attempt.browser}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{attempt.location}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatTimestamp(attempt.timestamp)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {activeTab === 'sessions' && (
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Active Sessions</h3>
            <div className="space-y-4">
              {securityData.activeSessions.map((session) => {
                const DeviceIcon = getDeviceIcon(session.device);
                return (
                  <div key={session.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <DeviceIcon className="h-8 w-8 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">{session.userName}</p>
                        <p className="text-sm text-gray-500">{session.userEmail}</p>
                        <p className="text-xs text-gray-400">{session.device} • {session.browser} • {session.location}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-900">Last active: {formatTimestamp(session.lastActivity)}</p>
                      <p className="text-xs text-gray-500">Started: {formatTimestamp(session.startTime)}</p>
                      {session.isCurrentSession && (
                        <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800 mt-1">
                          Current Session
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        )}

        {activeTab === 'threats' && (
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Threat Detection</h3>
            <div className="space-y-4">
              {securityData.threats.map((threat) => (
                <div key={threat.id} className="flex items-center justify-between p-4 border border-red-200 bg-red-50 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <ShieldExclamationIcon className="h-8 w-8 text-red-500" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{threat.type}</p>
                      <p className="text-sm text-gray-600">{threat.description}</p>
                      <p className="text-xs text-gray-500">IP: {threat.ipAddress} • {threat.attempts} attempts</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getSeverityBadge(threat.severity)}`}>
                      {threat.severity}
                    </span>
                    <p className="text-xs text-gray-500 mt-1">{formatTimestamp(threat.timestamp)}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {activeTab === 'settings' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Authentication Settings</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">Two-Factor Authentication</p>
                    <p className="text-xs text-gray-500">Add an extra layer of security</p>
                  </div>
                  <Button variant="outline" size="small">Enable</Button>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">Session Timeout</p>
                    <p className="text-xs text-gray-500">Auto logout after inactivity</p>
                  </div>
                  <select className="text-sm border border-gray-300 rounded-md px-2 py-1">
                    <option>30 minutes</option>
                    <option>1 hour</option>
                    <option>2 hours</option>
                    <option>Never</option>
                  </select>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">Max Login Attempts</p>
                    <p className="text-xs text-gray-500">Block after failed attempts</p>
                  </div>
                  <input
                    type="number"
                    defaultValue={5}
                    className="w-16 text-sm border border-gray-300 rounded-md px-2 py-1"
                  />
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Password Policy</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Minimum Length</span>
                  <input
                    type="number"
                    defaultValue={8}
                    className="w-16 text-sm border border-gray-300 rounded-md px-2 py-1"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Require Uppercase</span>
                  <input type="checkbox" defaultChecked className="rounded" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Require Numbers</span>
                  <input type="checkbox" defaultChecked className="rounded" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Require Symbols</span>
                  <input type="checkbox" className="rounded" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Password Expiry (days)</span>
                  <input
                    type="number"
                    defaultValue={90}
                    className="w-16 text-sm border border-gray-300 rounded-md px-2 py-1"
                  />
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default SecurityManagement;
