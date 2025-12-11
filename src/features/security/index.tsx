'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import { toast } from 'sonner'
import {
  Activity,
  AlertTriangle,
  Ban,
  Database,
  FileWarning,
  Key,
  Lock,
  MapPin,
  RefreshCw,
  Save,
  Server,
  Shield,
  ShieldAlert,
  UserCheck,
  UserX,
  Wifi,
  XCircle,
} from 'lucide-react'

import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

interface AdminSession {
  id: string
  adminName: string
  role: string
  device: string
  browser: string
  location: string
  ip: string
  lastActive: Date
  status: 'active' | 'idle' | 'expired'
}

interface SecurityEvent {
  id: string
  type: 'login' | 'failed_login' | 'permission_change' | 'data_export' | 'settings_change' | 'suspicious_activity'
  severity: 'low' | 'medium' | 'high' | 'critical'
  description: string
  user: string
  ip: string
  timestamp: Date
}

interface BlacklistedIP {
  id: string
  ip: string
  reason: string
  addedBy: string
  addedAt: Date
  type: 'temporary' | 'permanent'
  expiresAt?: Date
}

export function Security() {
  const [loading, setLoading] = useState(false)

  // Admin security settings
  const [securitySettings, setSecuritySettings] = useState({
    enforceStrongPasswords: true,
    passwordExpiryDays: 90,
    maxLoginAttempts: 5,
    lockoutDuration: 30,
    requireMFA: true,
    sessionTimeout: 30,
    ipWhitelisting: false,
    geoBlocking: false,
    suspiciousActivityDetection: true,
    dataEncryption: true,
    auditLogging: true,
    apiSecurityHeaders: true,
    rateLimiting: true,
    ddosProtection: true,
  })

  // Access control settings
  const [accessControl, setAccessControl] = useState({
    roleBasedAccess: true,
    minimumAdminLevel: 'manager',
    dataExportApproval: true,
    sensitiveDataMasking: true,
    readOnlyMode: false,
    maintenanceBypass: ['super_admin'],
  })

  // Mock admin sessions
  const [adminSessions] = useState<AdminSession[]>([
    {
      id: '1',
      adminName: 'John Admin',
      role: 'Super Admin',
      device: 'MacBook Pro',
      browser: 'Chrome 120.0',
      location: 'San Francisco, CA',
      ip: '192.168.1.100',
      lastActive: new Date(),
      status: 'active',
    },
    {
      id: '2',
      adminName: 'Sarah Manager',
      role: 'Manager',
      device: 'Windows Desktop',
      browser: 'Edge 120.0',
      location: 'New York, NY',
      ip: '192.168.1.101',
      lastActive: new Date(Date.now() - 15 * 60 * 1000),
      status: 'idle',
    },
    {
      id: '3',
      adminName: 'Mike Support',
      role: 'Support',
      device: 'iPad Pro',
      browser: 'Safari',
      location: 'Chicago, IL',
      ip: '192.168.1.102',
      lastActive: new Date(Date.now() - 2 * 60 * 60 * 1000),
      status: 'expired',
    },
  ])

  // Mock security events
  const [securityEvents] = useState<SecurityEvent[]>([
    {
      id: '1',
      type: 'login',
      severity: 'low',
      description: 'Admin login successful',
      user: 'john.admin@zervtek.com',
      ip: '192.168.1.100',
      timestamp: new Date(),
    },
    {
      id: '2',
      type: 'failed_login',
      severity: 'medium',
      description: 'Failed login attempt - incorrect password',
      user: 'unknown@example.com',
      ip: '203.0.113.42',
      timestamp: new Date(Date.now() - 30 * 60 * 1000),
    },
    {
      id: '3',
      type: 'permission_change',
      severity: 'high',
      description: 'Admin permissions elevated to Super Admin',
      user: 'sarah.manager@zervtek.com',
      ip: '192.168.1.101',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
    },
    {
      id: '4',
      type: 'data_export',
      severity: 'medium',
      description: 'Bulk user data exported (5000 records)',
      user: 'mike.support@zervtek.com',
      ip: '192.168.1.102',
      timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000),
    },
    {
      id: '5',
      type: 'suspicious_activity',
      severity: 'critical',
      description: 'Multiple failed login attempts from unknown location',
      user: 'system',
      ip: '198.51.100.14',
      timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000),
    },
  ])

  // Mock blacklisted IPs
  const [blacklistedIPs, setBlacklistedIPs] = useState<BlacklistedIP[]>([
    {
      id: '1',
      ip: '198.51.100.14',
      reason: 'Brute force attack attempt',
      addedBy: 'System',
      addedAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
      type: 'permanent',
    },
    {
      id: '2',
      ip: '203.0.113.0/24',
      reason: 'Suspicious activity from IP range',
      addedBy: 'john.admin',
      addedAt: new Date(Date.now() - 48 * 60 * 60 * 1000),
      type: 'temporary',
      expiresAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
    },
  ])

  const [newBlockedIP, setNewBlockedIP] = useState({
    ip: '',
    reason: '',
    type: 'temporary' as 'temporary' | 'permanent',
    duration: '24',
  })

  const handleSaveSecuritySettings = async () => {
    setLoading(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 1000))
      toast.success('Security settings updated successfully!')
    } catch {
      toast.error('Failed to update security settings')
    } finally {
      setLoading(false)
    }
  }

  const handleSaveAccessControl = async () => {
    setLoading(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 1000))
      toast.success('Access control settings updated!')
    } catch {
      toast.error('Failed to update access control')
    } finally {
      setLoading(false)
    }
  }

  const handleTerminateSession = async (sessionId: string) => {
    setLoading(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 500))
      toast.success('Session terminated successfully')
    } catch {
      toast.error('Failed to terminate session')
    } finally {
      setLoading(false)
    }
  }

  const handleBlockIP = async () => {
    if (!newBlockedIP.ip || !newBlockedIP.reason) {
      toast.error('Please provide IP address and reason')
      return
    }

    setLoading(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 500))
      const newIP: BlacklistedIP = {
        id: Date.now().toString(),
        ip: newBlockedIP.ip,
        reason: newBlockedIP.reason,
        addedBy: 'current.admin',
        addedAt: new Date(),
        type: newBlockedIP.type,
        expiresAt: newBlockedIP.type === 'temporary'
          ? new Date(Date.now() + parseInt(newBlockedIP.duration) * 60 * 60 * 1000)
          : undefined,
      }
      setBlacklistedIPs([...blacklistedIPs, newIP])
      setNewBlockedIP({ ip: '', reason: '', type: 'temporary', duration: '24' })
      toast.success('IP address blocked successfully')
    } catch {
      toast.error('Failed to block IP address')
    } finally {
      setLoading(false)
    }
  }

  const handleUnblockIP = async (id: string) => {
    setLoading(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 500))
      setBlacklistedIPs(blacklistedIPs.filter(ip => ip.id !== id))
      toast.success('IP address unblocked')
    } catch {
      toast.error('Failed to unblock IP address')
    } finally {
      setLoading(false)
    }
  }

  const getSeverityColor = (severity: SecurityEvent['severity']) => {
    switch (severity) {
      case 'low': return 'text-green-600 bg-green-100'
      case 'medium': return 'text-yellow-600 bg-yellow-100'
      case 'high': return 'text-slate-700 bg-slate-100'
      case 'critical': return 'text-red-600 bg-red-100'
    }
  }

  const getStatusColor = (status: AdminSession['status']) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'idle': return 'bg-yellow-100 text-yellow-800'
      case 'expired': return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <>
      <Header fixed>
        <Search className='md:w-auto flex-1' />
        <div className='ms-auto flex items-center space-x-4'>
          <ThemeSwitch />
          <ProfileDropdown />
        </div>
      </Header>

      <Main className='flex flex-1 flex-col gap-4 sm:gap-6'>
        <div className='flex flex-wrap items-center justify-between gap-2'>
          <div>
            <h1 className='text-2xl font-bold tracking-tight sm:text-3xl'>Security Center</h1>
            <p className='text-muted-foreground'>System security configuration and monitoring</p>
          </div>
          <Badge variant='outline' className='px-3 py-1'>
            <Shield className='mr-2 h-3 w-3' />
            Protection Level: High
          </Badge>
        </div>

        {/* Security Overview Alert */}
        <Alert>
          <ShieldAlert className='h-4 w-4' />
          <AlertTitle>Security Status</AlertTitle>
          <AlertDescription>
            System security is operational. Last security scan: {format(new Date(), 'PPp')}
          </AlertDescription>
        </Alert>

        {/* Core Security Settings */}
        <Card>
          <CardHeader>
            <div className='flex items-center gap-2'>
              <Shield className='h-5 w-5' />
              <CardTitle>Security Configuration</CardTitle>
            </div>
            <CardDescription>
              Core security settings for the platform
            </CardDescription>
          </CardHeader>
          <CardContent className='space-y-6'>
            <div className='grid gap-4 md:grid-cols-2'>
              <div className='space-y-2'>
                <Label htmlFor='passwordExpiry'>Password Expiry (days)</Label>
                <Input
                  id='passwordExpiry'
                  type='number'
                  value={securitySettings.passwordExpiryDays}
                  onChange={(e) => setSecuritySettings({ ...securitySettings, passwordExpiryDays: parseInt(e.target.value) })}
                />
              </div>
              <div className='space-y-2'>
                <Label htmlFor='maxLoginAttempts'>Max Login Attempts</Label>
                <Input
                  id='maxLoginAttempts'
                  type='number'
                  value={securitySettings.maxLoginAttempts}
                  onChange={(e) => setSecuritySettings({ ...securitySettings, maxLoginAttempts: parseInt(e.target.value) })}
                />
              </div>
              <div className='space-y-2'>
                <Label htmlFor='lockoutDuration'>Lockout Duration (minutes)</Label>
                <Input
                  id='lockoutDuration'
                  type='number'
                  value={securitySettings.lockoutDuration}
                  onChange={(e) => setSecuritySettings({ ...securitySettings, lockoutDuration: parseInt(e.target.value) })}
                />
              </div>
              <div className='space-y-2'>
                <Label htmlFor='sessionTimeout'>Session Timeout (minutes)</Label>
                <Input
                  id='sessionTimeout'
                  type='number'
                  value={securitySettings.sessionTimeout}
                  onChange={(e) => setSecuritySettings({ ...securitySettings, sessionTimeout: parseInt(e.target.value) })}
                />
              </div>
            </div>

            <Separator />

            <div className='space-y-4'>
              <h4 className='text-sm font-medium'>Security Features</h4>
              <div className='grid gap-3 md:grid-cols-2'>
                <div className='flex items-center justify-between'>
                  <div className='space-y-0.5'>
                    <Label className='flex items-center gap-2'>
                      <Lock className='h-4 w-4' />
                      Enforce Strong Passwords
                    </Label>
                    <p className='text-xs text-muted-foreground'>Require complex passwords</p>
                  </div>
                  <Switch
                    checked={securitySettings.enforceStrongPasswords}
                    onCheckedChange={(checked) =>
                      setSecuritySettings({ ...securitySettings, enforceStrongPasswords: checked })
                    }
                  />
                </div>

                <div className='flex items-center justify-between'>
                  <div className='space-y-0.5'>
                    <Label className='flex items-center gap-2'>
                      <Key className='h-4 w-4' />
                      Require MFA
                    </Label>
                    <p className='text-xs text-muted-foreground'>Multi-factor authentication for all admins</p>
                  </div>
                  <Switch
                    checked={securitySettings.requireMFA}
                    onCheckedChange={(checked) =>
                      setSecuritySettings({ ...securitySettings, requireMFA: checked })
                    }
                  />
                </div>

                <div className='flex items-center justify-between'>
                  <div className='space-y-0.5'>
                    <Label className='flex items-center gap-2'>
                      <Wifi className='h-4 w-4' />
                      IP Whitelisting
                    </Label>
                    <p className='text-xs text-muted-foreground'>Restrict access to specific IPs</p>
                  </div>
                  <Switch
                    checked={securitySettings.ipWhitelisting}
                    onCheckedChange={(checked) =>
                      setSecuritySettings({ ...securitySettings, ipWhitelisting: checked })
                    }
                  />
                </div>

                <div className='flex items-center justify-between'>
                  <div className='space-y-0.5'>
                    <Label className='flex items-center gap-2'>
                      <Activity className='h-4 w-4' />
                      Suspicious Activity Detection
                    </Label>
                    <p className='text-xs text-muted-foreground'>AI-powered threat detection</p>
                  </div>
                  <Switch
                    checked={securitySettings.suspiciousActivityDetection}
                    onCheckedChange={(checked) =>
                      setSecuritySettings({ ...securitySettings, suspiciousActivityDetection: checked })
                    }
                  />
                </div>

                <div className='flex items-center justify-between'>
                  <div className='space-y-0.5'>
                    <Label className='flex items-center gap-2'>
                      <Database className='h-4 w-4' />
                      Data Encryption
                    </Label>
                    <p className='text-xs text-muted-foreground'>Encrypt sensitive data at rest</p>
                  </div>
                  <Switch
                    checked={securitySettings.dataEncryption}
                    onCheckedChange={(checked) =>
                      setSecuritySettings({ ...securitySettings, dataEncryption: checked })
                    }
                  />
                </div>

                <div className='flex items-center justify-between'>
                  <div className='space-y-0.5'>
                    <Label className='flex items-center gap-2'>
                      <FileWarning className='h-4 w-4' />
                      Audit Logging
                    </Label>
                    <p className='text-xs text-muted-foreground'>Log all administrative actions</p>
                  </div>
                  <Switch
                    checked={securitySettings.auditLogging}
                    onCheckedChange={(checked) =>
                      setSecuritySettings({ ...securitySettings, auditLogging: checked })
                    }
                  />
                </div>

                <div className='flex items-center justify-between'>
                  <div className='space-y-0.5'>
                    <Label className='flex items-center gap-2'>
                      <Server className='h-4 w-4' />
                      Rate Limiting
                    </Label>
                    <p className='text-xs text-muted-foreground'>Prevent API abuse</p>
                  </div>
                  <Switch
                    checked={securitySettings.rateLimiting}
                    onCheckedChange={(checked) =>
                      setSecuritySettings({ ...securitySettings, rateLimiting: checked })
                    }
                  />
                </div>

                <div className='flex items-center justify-between'>
                  <div className='space-y-0.5'>
                    <Label>DDoS Protection</Label>
                    <p className='text-xs text-muted-foreground'>Advanced DDoS mitigation</p>
                  </div>
                  <Switch
                    checked={securitySettings.ddosProtection}
                    onCheckedChange={(checked) =>
                      setSecuritySettings({ ...securitySettings, ddosProtection: checked })
                    }
                  />
                </div>
              </div>
            </div>

            <div className='flex justify-end'>
              <Button onClick={handleSaveSecuritySettings} disabled={loading}>
                {loading && <RefreshCw className='mr-2 h-4 w-4 animate-spin' />}
                <Save className='mr-2 h-4 w-4' />
                Save Security Settings
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Access Control */}
        <Card>
          <CardHeader>
            <div className='flex items-center gap-2'>
              <UserCheck className='h-5 w-5' />
              <CardTitle>Access Control</CardTitle>
            </div>
            <CardDescription>
              Admin access and permission settings
            </CardDescription>
          </CardHeader>
          <CardContent className='space-y-6'>
            <div className='grid gap-4 md:grid-cols-2'>
              <div className='space-y-2'>
                <Label htmlFor='minimumAdminLevel'>Minimum Admin Level</Label>
                <Select value={accessControl.minimumAdminLevel} onValueChange={(value) => setAccessControl({ ...accessControl, minimumAdminLevel: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='support'>Support</SelectItem>
                    <SelectItem value='manager'>Manager</SelectItem>
                    <SelectItem value='admin'>Admin</SelectItem>
                    <SelectItem value='super_admin'>Super Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className='space-y-3'>
              <div className='flex items-center justify-between'>
                <div className='space-y-0.5'>
                  <Label>Role-Based Access Control</Label>
                  <p className='text-xs text-muted-foreground'>Enforce role-based permissions</p>
                </div>
                <Switch
                  checked={accessControl.roleBasedAccess}
                  onCheckedChange={(checked) =>
                    setAccessControl({ ...accessControl, roleBasedAccess: checked })
                  }
                />
              </div>

              <div className='flex items-center justify-between'>
                <div className='space-y-0.5'>
                  <Label>Data Export Approval</Label>
                  <p className='text-xs text-muted-foreground'>Require approval for bulk exports</p>
                </div>
                <Switch
                  checked={accessControl.dataExportApproval}
                  onCheckedChange={(checked) =>
                    setAccessControl({ ...accessControl, dataExportApproval: checked })
                  }
                />
              </div>

              <div className='flex items-center justify-between'>
                <div className='space-y-0.5'>
                  <Label>Sensitive Data Masking</Label>
                  <p className='text-xs text-muted-foreground'>Mask PII in lower admin levels</p>
                </div>
                <Switch
                  checked={accessControl.sensitiveDataMasking}
                  onCheckedChange={(checked) =>
                    setAccessControl({ ...accessControl, sensitiveDataMasking: checked })
                  }
                />
              </div>
            </div>

            <div className='flex justify-end'>
              <Button onClick={handleSaveAccessControl} disabled={loading}>
                {loading && <RefreshCw className='mr-2 h-4 w-4 animate-spin' />}
                <Save className='mr-2 h-4 w-4' />
                Save Access Control
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Active Admin Sessions */}
        <Card>
          <CardHeader>
            <div className='flex items-center gap-2'>
              <Activity className='h-5 w-5' />
              <CardTitle>Active Admin Sessions</CardTitle>
            </div>
            <CardDescription>
              Monitor and manage active administrator sessions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Admin</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Device/Browser</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last Active</TableHead>
                  <TableHead className='text-right'>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {adminSessions.map((session) => (
                  <TableRow key={session.id}>
                    <TableCell className='font-medium'>{session.adminName}</TableCell>
                    <TableCell>
                      <Badge variant='outline'>{session.role}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className='text-sm'>
                        <p>{session.device}</p>
                        <p className='text-muted-foreground'>{session.browser}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className='flex items-center gap-1 text-sm'>
                        <MapPin className='h-3 w-3' />
                        {session.location}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(session.status)} variant='outline'>
                        {session.status}
                      </Badge>
                    </TableCell>
                    <TableCell className='text-sm'>
                      {format(session.lastActive, 'PPp')}
                    </TableCell>
                    <TableCell className='text-right'>
                      {session.status !== 'expired' && (
                        <Button
                          variant='ghost'
                          size='sm'
                          onClick={() => handleTerminateSession(session.id)}
                          disabled={loading}
                        >
                          <UserX className='h-4 w-4' />
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Security Events */}
        <Card>
          <CardHeader>
            <div className='flex items-center gap-2'>
              <AlertTriangle className='h-5 w-5' />
              <CardTitle>Security Events</CardTitle>
            </div>
            <CardDescription>
              Recent security events and alerts
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Severity</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>User/IP</TableHead>
                  <TableHead>Timestamp</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {securityEvents.map((event) => (
                  <TableRow key={event.id}>
                    <TableCell>
                      <Badge className={getSeverityColor(event.severity)} variant='outline'>
                        {event.severity.toUpperCase()}
                      </Badge>
                    </TableCell>
                    <TableCell className='capitalize'>
                      {event.type.replace('_', ' ')}
                    </TableCell>
                    <TableCell>{event.description}</TableCell>
                    <TableCell>
                      <div className='text-sm'>
                        <p>{event.user}</p>
                        <p className='text-muted-foreground'>{event.ip}</p>
                      </div>
                    </TableCell>
                    <TableCell className='text-sm'>
                      {format(event.timestamp, 'PPp')}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* IP Blacklist Management */}
        <Card>
          <CardHeader>
            <div className='flex items-center gap-2'>
              <Ban className='h-5 w-5' />
              <CardTitle>IP Blacklist</CardTitle>
            </div>
            <CardDescription>
              Manage blocked IP addresses and ranges
            </CardDescription>
          </CardHeader>
          <CardContent className='space-y-6'>
            {/* Add New IP Block */}
            <div className='space-y-4 p-4 border rounded-lg bg-muted/50'>
              <h4 className='text-sm font-medium'>Block New IP Address</h4>
              <div className='grid gap-4 md:grid-cols-2'>
                <div className='space-y-2'>
                  <Label htmlFor='blockIP'>IP Address or Range</Label>
                  <Input
                    id='blockIP'
                    placeholder='e.g., 192.168.1.1 or 192.168.1.0/24'
                    value={newBlockedIP.ip}
                    onChange={(e) => setNewBlockedIP({ ...newBlockedIP, ip: e.target.value })}
                  />
                </div>
                <div className='space-y-2'>
                  <Label htmlFor='blockReason'>Reason</Label>
                  <Input
                    id='blockReason'
                    placeholder='Reason for blocking'
                    value={newBlockedIP.reason}
                    onChange={(e) => setNewBlockedIP({ ...newBlockedIP, reason: e.target.value })}
                  />
                </div>
                <div className='space-y-2'>
                  <Label htmlFor='blockType'>Block Type</Label>
                  <Select value={newBlockedIP.type} onValueChange={(value: 'temporary' | 'permanent') => setNewBlockedIP({ ...newBlockedIP, type: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='temporary'>Temporary</SelectItem>
                      <SelectItem value='permanent'>Permanent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {newBlockedIP.type === 'temporary' && (
                  <div className='space-y-2'>
                    <Label htmlFor='blockDuration'>Duration (hours)</Label>
                    <Input
                      id='blockDuration'
                      type='number'
                      value={newBlockedIP.duration}
                      onChange={(e) => setNewBlockedIP({ ...newBlockedIP, duration: e.target.value })}
                    />
                  </div>
                )}
              </div>
              <Button onClick={handleBlockIP} disabled={loading}>
                <Ban className='mr-2 h-4 w-4' />
                Block IP Address
              </Button>
            </div>

            {/* Blacklisted IPs Table */}
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>IP Address</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Added By</TableHead>
                  <TableHead>Added At</TableHead>
                  <TableHead>Expires</TableHead>
                  <TableHead className='text-right'>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {blacklistedIPs.map((ip) => (
                  <TableRow key={ip.id}>
                    <TableCell className='font-mono'>{ip.ip}</TableCell>
                    <TableCell>{ip.reason}</TableCell>
                    <TableCell>
                      <Badge variant={ip.type === 'permanent' ? 'destructive' : 'secondary'}>
                        {ip.type}
                      </Badge>
                    </TableCell>
                    <TableCell>{ip.addedBy}</TableCell>
                    <TableCell className='text-sm'>
                      {format(ip.addedAt, 'PPp')}
                    </TableCell>
                    <TableCell className='text-sm'>
                      {ip.expiresAt ? format(ip.expiresAt, 'PPp') : '-'}
                    </TableCell>
                    <TableCell className='text-right'>
                      <Button
                        variant='ghost'
                        size='sm'
                        onClick={() => handleUnblockIP(ip.id)}
                        disabled={loading}
                      >
                        <XCircle className='h-4 w-4' />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </Main>
    </>
  )
}
