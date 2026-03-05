"use client"

import * as React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "@/hooks/use-toast"
import { Code, Key, RefreshCw, CheckCircle2, XCircle, Clock, Database } from "lucide-react"

export default function DemoPage() {
  const [step, setStep] = React.useState<'language' | 'test'>('language')
  const [language, setLanguage] = React.useState<'nextjs' | 'html'>('nextjs')
  const [licenseKey, setLicenseKey] = React.useState('')
  const [loading, setLoading] = React.useState(false)
  const [verifyResult, setVerifyResult] = React.useState<any>(null)
  const [metadata, setMetadata] = React.useState<any>(null)
  const [logs, setLogs] = React.useState<any[]>([])
  const [resetLoading, setResetLoading] = React.useState(false)

  const handleLanguageSelect = (lang: 'nextjs' | 'html') => {
    setLanguage(lang)
    setStep('test')
  }

  const handleVerifyLicense = async () => {
    if (!licenseKey.trim()) {
      toast({
        title: "Error",
        description: "Please enter a license key",
        variant: "destructive"
      })
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/keys/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          keyValue: licenseKey,
          hwid: 'DEMO-' + Math.random().toString(36).substring(7).toUpperCase(),
          deviceName: 'Demo Test Device'
        })
      })

      const result = await response.json()
      setVerifyResult(result)
      
      if (result.valid) {
        toast({
          title: "✓ License Valid",
          description: result.message
        })
        // Fetch metadata and logs
        fetchMetadata()
      } else {
        toast({
          title: "✗ License Invalid",
          description: result.message,
          variant: "destructive"
        })
      }
    } catch (error) {
      toast({
        title: "Connection Error",
        description: "Failed to verify license",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchMetadata = () => {
    // Simulated metadata - in real implementation, fetch from API
    setMetadata({
      keyValue: licenseKey,
      boundDevices: 1,
      maxDevices: 1,
      isActive: true,
      expiresAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
      createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
    })

    // Simulated logs
    setLogs([
      {
        timestamp: new Date().toISOString(),
        eventType: 'auth_success',
        status: 'success',
        deviceName: 'Demo Test Device'
      },
      {
        timestamp: new Date(Date.now() - 60000).toISOString(),
        eventType: 'auth_success',
        status: 'success',
        deviceName: 'Demo Test Device'
      }
    ])
  }

  const handleResetHWID = async () => {
    setResetLoading(true)
    try {
      const response = await fetch('/api/keys/reset-hwid', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ keyValue: licenseKey })
      })

      const result = await response.json()
      
      if (result.success) {
        toast({
          title: "✓ HWID Reset Successful",
          description: result.message
        })
        setVerifyResult(null)
        setMetadata(null)
      } else {
        toast({
          title: "✗ Reset Failed",
          description: result.message || result.debug,
          variant: "destructive"
        })
      }
    } catch (error) {
      toast({
        title: "Connection Error",
        description: "Failed to reset HWID",
        variant: "destructive"
      })
    } finally {
      setResetLoading(false)
    }
  }

  if (step === 'language') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl bg-slate-800/50 border-slate-700 backdrop-blur">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold text-white">KeyGuard Demo</CardTitle>
            <CardDescription className="text-slate-300">
              Test license verification in your preferred language
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                onClick={() => handleLanguageSelect('nextjs')}
                className="p-6 bg-slate-700/50 hover:bg-slate-700 border-2 border-slate-600 hover:border-blue-500 rounded-lg transition-all group cursor-pointer"
              >
                <Code className="w-12 h-12 text-blue-400 mx-auto mb-3 group-hover:scale-110 transition-transform" />
                <h3 className="text-xl font-bold text-white mb-2">Next.js Example</h3>
                <p className="text-sm text-slate-400">Server-side and client-side verification</p>
              </button>

              <button
                onClick={() => handleLanguageSelect('html')}
                className="p-6 bg-slate-700/50 hover:bg-slate-700 border-2 border-slate-600 hover:border-orange-500 rounded-lg transition-all group cursor-pointer"
              >
                <Code className="w-12 h-12 text-orange-400 mx-auto mb-3 group-hover:scale-110 transition-transform" />
                <h3 className="text-xl font-bold text-white mb-2">HTML/JavaScript</h3>
                <p className="text-sm text-slate-400">Pure client-side implementation</p>
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
      <div className="max-w-6xl mx-auto space-y-6 py-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">KeyGuard Demo - {language === 'nextjs' ? 'Next.js' : 'HTML'}</h1>
            <p className="text-slate-400">Test license verification and management</p>
          </div>
          <Button variant="outline" onClick={() => setStep('language')} className="border-slate-600 text-slate-300">
            Change Language
          </Button>
        </div>

        <Card className="bg-slate-800/50 border-slate-700 backdrop-blur">
          <CardHeader>
            <CardTitle className="text-white">Current License Key</CardTitle>
            <CardDescription className="text-slate-400">Full key is shown below without truncation</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-3 md:flex-row md:items-center">
              <div className="w-full rounded-md border border-slate-600 bg-slate-900/50 p-3">
                <p className="font-mono text-sm text-white break-all">
                  {licenseKey || "No key entered yet"}
                </p>
              </div>
              <Button
                variant="outline"
                className="border-slate-600 text-slate-300"
                disabled={!licenseKey}
                onClick={() => {
                  navigator.clipboard.writeText(licenseKey)
                  toast({ title: "Copied", description: "Full license key copied" })
                }}
              >
                Copy Key
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* License Verification */}
          <Card className="bg-slate-800/50 border-slate-700 backdrop-blur">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Key className="h-5 w-5 text-blue-400" /> License Verification
              </CardTitle>
              <CardDescription className="text-slate-400">Enter your license key to test</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="text-slate-300">License Key</Label>
                <Input 
                  placeholder="KG-XXXX-XXXX"
                  value={licenseKey}
                  onChange={(e) => setLicenseKey(e.target.value)}
                  className="bg-slate-900/50 border-slate-600 text-white"
                />
              </div>
              <Button 
                onClick={handleVerifyLicense} 
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                {loading ? "Verifying..." : "Verify License"}
              </Button>

              {verifyResult && (
                <div className={`p-4 rounded-lg border ${verifyResult.valid ? 'bg-green-500/10 border-green-500/50' : 'bg-red-500/10 border-red-500/50'}`}>
                  <div className="flex items-center gap-2 mb-2">
                    {verifyResult.valid ? (
                      <CheckCircle2 className="h-5 w-5 text-green-400" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-400" />
                    )}
                    <span className="font-bold text-white">{verifyResult.message}</span>
                  </div>
                  {verifyResult.debug && (
                    <p className="text-sm text-slate-400">{verifyResult.debug}</p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* HWID Reset */}
          <Card className="bg-slate-800/50 border-slate-700 backdrop-blur">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <RefreshCw className="h-5 w-5 text-orange-400" /> HWID Reset
              </CardTitle>
              <CardDescription className="text-slate-400">Reset device binding (once per 24 hours)</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-amber-500/10 border border-amber-500/50 rounded-lg p-4">
                <div className="flex items-start gap-2">
                  <Clock className="h-5 w-5 text-amber-400 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-amber-300">24-Hour Cooldown</p>
                    <p className="text-xs text-slate-400 mt-1">You can only reset HWID once every 24 hours</p>
                  </div>
                </div>
              </div>
              <Button 
                onClick={handleResetHWID}
                disabled={!licenseKey || resetLoading}
                variant="destructive"
                className="w-full"
              >
                {resetLoading ? "Resetting..." : "Reset HWID"}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Metadata & Logs */}
        {metadata && (
          <Card className="bg-slate-800/50 border-slate-700 backdrop-blur">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Database className="h-5 w-5 text-purple-400" /> License Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="metadata">
                <TabsList className="bg-slate-900/50">
                  <TabsTrigger value="metadata">Metadata</TabsTrigger>
                  <TabsTrigger value="logs">Access Logs</TabsTrigger>
                </TabsList>
                
                <TabsContent value="metadata" className="space-y-2 pt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-slate-400">License Key</p>
                      <p className="text-sm font-mono text-white">{metadata.keyValue}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400">Status</p>
                      <Badge variant={metadata.isActive ? "default" : "destructive"}>
                        {metadata.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400">Devices</p>
                      <p className="text-sm text-white">{metadata.boundDevices} / {metadata.maxDevices}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400">Expires</p>
                      <p className="text-sm text-white">{new Date(metadata.expiresAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="logs" className="pt-4">
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {logs.map((log, i) => (
                      <div key={i} className="bg-slate-900/50 p-3 rounded border border-slate-700">
                        <div className="flex items-center justify-between mb-1">
                          <Badge variant={log.status === 'success' ? 'default' : 'destructive'}>
                            {log.eventType}
                          </Badge>
                          <span className="text-xs text-slate-400">
                            {new Date(log.timestamp).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-sm text-slate-300">{log.deviceName}</p>
                      </div>
                    ))}
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        )}

        {/* Code Example */}
        <Card className="bg-slate-800/50 border-slate-700 backdrop-blur">
          <CardHeader>
            <CardTitle className="text-white">
              {language === 'nextjs' ? 'Next.js' : 'HTML'} Implementation Example
            </CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="bg-slate-900 p-4 rounded-lg overflow-x-auto text-xs text-slate-300 border border-slate-700">
              <code>
                {language === 'nextjs' ? `// Next.js Server Action or API Route
async function verifyLicense(keyValue: string) {
  const response = await fetch('${typeof window !== 'undefined' ? window.location.origin : ''}/api/keys/verify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      keyValue: keyValue,
      hwid: 'YOUR-HARDWARE-ID',
      deviceName: 'Device Name'
    })
  });
  
  const result = await response.json();
  return result.valid;
}` : `<!-- HTML/JavaScript Implementation -->
<script>
async function verifyLicense(keyValue) {
  const response = await fetch('${typeof window !== 'undefined' ? window.location.origin : ''}/api/keys/verify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      keyValue: keyValue,
      hwid: 'YOUR-HARDWARE-ID',
      deviceName: 'Device Name'
    })
  });
  
  const result = await response.json();
  return result.valid;
}
</script>`}
              </code>
            </pre>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
