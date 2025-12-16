'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Wifi,
  WifiOff,
  QrCode,
  RefreshCw,
  Settings,
  Power,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Smartphone,
  Copy,
  Check,
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { useWhatsAppInstance, useQRCode, useDisconnectInstance } from '@/hooks/use-whatsapp'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

export function ConnectionPanel() {
  const { data: instance, isLoading } = useWhatsAppInstance()
  const { data: qrData, refetch: refetchQR } = useQRCode(
    instance?.instanceName || '',
    instance?.status === 'close' || instance?.status === 'connecting'
  )
  const disconnectMutation = useDisconnectInstance()
  const [showQR, setShowQR] = useState(false)
  const [copied, setCopied] = useState(false)

  const handleDisconnect = async () => {
    if (!instance) return
    try {
      await disconnectMutation.mutateAsync(instance.instanceName)
      toast.success('WhatsApp disconnected')
    } catch {
      toast.error('Failed to disconnect')
    }
  }

  const copyPairingCode = () => {
    if (qrData?.pairingCode) {
      navigator.clipboard.writeText(qrData.pairingCode)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
      toast.success('Pairing code copied')
    }
  }

  const getStatusConfig = (status?: string) => {
    switch (status) {
      case 'open':
        return {
          label: 'Connected',
          color: 'bg-green-500',
          textColor: 'text-green-600',
          bgColor: 'bg-green-50 dark:bg-green-950',
          icon: CheckCircle2,
        }
      case 'connecting':
        return {
          label: 'Connecting',
          color: 'bg-yellow-500',
          textColor: 'text-yellow-600',
          bgColor: 'bg-yellow-50 dark:bg-yellow-950',
          icon: Loader2,
        }
      default:
        return {
          label: 'Disconnected',
          color: 'bg-red-500',
          textColor: 'text-red-600',
          bgColor: 'bg-red-50 dark:bg-red-950',
          icon: AlertCircle,
        }
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className='flex items-center justify-center py-10'>
          <Loader2 className='h-8 w-8 animate-spin text-muted-foreground' />
        </CardContent>
      </Card>
    )
  }

  const statusConfig = getStatusConfig(instance?.status)
  const StatusIcon = statusConfig.icon

  return (
    <Card>
      <CardHeader className='pb-3'>
        <div className='flex items-center justify-between'>
          <div>
            <CardTitle className='flex items-center gap-2'>
              <Smartphone className='h-5 w-5' />
              WhatsApp Connection
            </CardTitle>
            <CardDescription>Manage your WhatsApp Business connection</CardDescription>
          </div>
          <Badge
            variant='outline'
            className={cn('gap-1', statusConfig.bgColor, statusConfig.textColor)}
          >
            <span className={cn('h-2 w-2 rounded-full', statusConfig.color)} />
            {statusConfig.label}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
          {/* Profile Info */}
          <div className='flex items-center gap-4'>
            <Avatar className='h-16 w-16'>
              <AvatarImage src={instance?.profilePicUrl} />
              <AvatarFallback className='text-lg'>
                {instance?.profileName?.charAt(0) || 'W'}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className='font-semibold'>{instance?.profileName || 'Not connected'}</h3>
              <p className='text-sm text-muted-foreground'>
                {instance?.number || 'Scan QR code to connect'}
              </p>
              <p className='text-xs text-muted-foreground'>
                Instance: {instance?.instanceName}
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className='flex gap-2'>
            {instance?.status === 'open' ? (
              <>
                <Button variant='outline' size='sm'>
                  <Settings className='mr-2 h-4 w-4' />
                  Settings
                </Button>
                <Button
                  variant='destructive'
                  size='sm'
                  onClick={handleDisconnect}
                  disabled={disconnectMutation.isPending}
                >
                  {disconnectMutation.isPending ? (
                    <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                  ) : (
                    <Power className='mr-2 h-4 w-4' />
                  )}
                  Disconnect
                </Button>
              </>
            ) : (
              <Dialog open={showQR} onOpenChange={setShowQR}>
                <DialogTrigger asChild>
                  <Button>
                    <QrCode className='mr-2 h-4 w-4' />
                    Connect WhatsApp
                  </Button>
                </DialogTrigger>
                <DialogContent className='sm:max-w-md'>
                  <DialogHeader>
                    <DialogTitle>Connect WhatsApp</DialogTitle>
                    <DialogDescription>
                      Scan this QR code with your WhatsApp to connect
                    </DialogDescription>
                  </DialogHeader>
                  <div className='flex flex-col items-center gap-4 py-4'>
                    {/* QR Code */}
                    <motion.div
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className='rounded-lg border bg-white p-4'
                    >
                      {qrData?.base64 ? (
                        <img
                          src={qrData.base64}
                          alt='WhatsApp QR Code'
                          className='h-64 w-64'
                        />
                      ) : (
                        <div className='flex h-64 w-64 items-center justify-center'>
                          <Loader2 className='h-8 w-8 animate-spin' />
                        </div>
                      )}
                    </motion.div>

                    {/* Pairing Code */}
                    {qrData?.pairingCode && (
                      <div className='flex flex-col items-center gap-2'>
                        <p className='text-sm text-muted-foreground'>
                          Or use pairing code:
                        </p>
                        <div className='flex items-center gap-2'>
                          <code className='rounded-md bg-muted px-3 py-2 text-lg font-mono font-semibold'>
                            {qrData.pairingCode}
                          </code>
                          <Button
                            variant='ghost'
                            size='icon'
                            onClick={copyPairingCode}
                          >
                            {copied ? (
                              <Check className='h-4 w-4 text-green-500' />
                            ) : (
                              <Copy className='h-4 w-4' />
                            )}
                          </Button>
                        </div>
                      </div>
                    )}

                    <Button
                      variant='outline'
                      onClick={() => refetchQR()}
                      className='mt-2'
                    >
                      <RefreshCw className='mr-2 h-4 w-4' />
                      Refresh QR Code
                    </Button>

                    <div className='text-center text-sm text-muted-foreground'>
                      <p>1. Open WhatsApp on your phone</p>
                      <p>2. Go to Settings → Linked Devices</p>
                      <p>3. Tap &quot;Link a Device&quot;</p>
                      <p>4. Scan this QR code</p>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </div>

        {/* Connection Stats */}
        {instance?.status === 'open' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className='mt-4 grid grid-cols-2 gap-4 rounded-lg bg-muted/50 p-4 sm:grid-cols-4'
          >
            <div className='text-center'>
              <p className='text-2xl font-bold text-green-600'>Online</p>
              <p className='text-xs text-muted-foreground'>Status</p>
            </div>
            <div className='text-center'>
              <p className='text-2xl font-bold'>5</p>
              <p className='text-xs text-muted-foreground'>Unread</p>
            </div>
            <div className='text-center'>
              <p className='text-2xl font-bold'>2m ago</p>
              <p className='text-xs text-muted-foreground'>Last Message</p>
            </div>
            <div className='text-center'>
              <p className='text-2xl font-bold'>156</p>
              <p className='text-xs text-muted-foreground'>Today&apos;s Messages</p>
            </div>
          </motion.div>
        )}
      </CardContent>
    </Card>
  )
}
