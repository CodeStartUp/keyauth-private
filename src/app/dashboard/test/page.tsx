"use client"

import * as React from "react"
import { Play, Copy, RefreshCw, CheckCircle2, XCircle, Loader2, Info, Monitor, Clock, HardDrive } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "@/hooks/use-toast"

export default function TestPage() {
  const [apiKey, setApiKey] = React.useState("")
  const [apiUrl, setApiUrl] = React.useState("")
  const [resetApiUrl, setResetApiUrl] = React.useState("")
  const [hwid, setHwid] = React.useState("")
  const [deviceName, setDeviceName] = React.useState("")
  const [isLoading, setIsLoading] = React.useState(false)
  const [isResetting, setIsResetting] = React.useState(false)
  const [response, setResponse] = React.useState<any>(null)
  const [resetResponse, setResetResponse] = React.useState<any>(null)
  const [deviceInfo, setDeviceInfo] = React.useState<any>(null)
  const [testMode, setTestMode] = React.useState<"html" | "nodejs">("html")

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      let origin = window.location.origin
      if (origin.includes('cloudworkstations.dev')) {
        const parts = origin.split('.cluster')
        if (parts.length > 1) {
          const domain = parts[0].split('://')[1]
          const protocol = origin.split('://')[0]
          const domainParts = domain.split('-')
          let newDomain = ""
          if (/^\d+$/.test(domainParts[0])) {
            newDomain = `9002-${domainParts.slice(1).join('-')}`
          } else {
            newDomain = `9002-${domain}`
          }
          origin = `${protocol}://${newDomain}.cluster${parts[1]}`
        }
      }
      setApiUrl(`${origin}/api/keys/verify`)
      setResetApiUrl(`${origin}/api/keys/reset-hwid`)
      setDeviceName(navigator.userAgent.includes('Windows') ? 'Windows-PC' : 'Browser-Client')
    }
  }, [])

  // Generate browser fingerprint as HWID
  const generateHWID = async () => {
    try {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      if (ctx) {
        ctx.textBaseline = 'top'
        ctx.font = '14px Arial'
        ctx.fillText('Browser Fingerprint', 2, 2)
      }
      const canvasData = canvas.toDataURL()
      
      const fingerprint = `${navigator.userAgent}-${navigator.language}-${screen.width}x${screen.height}-${new Date().getTimezoneOffset()}-${canvasData.substring(0, 100)}`
      
      const encoder = new TextEncoder()
      const data = encoder.encode(fingerprint)
      const hashBuffer = await crypto.subtle.digest('SHA-256', data)
      const hashArray = Array.from(new Uint8Array(hashBuffer))
      const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
      
      return hashHex.substring(0, 32).toUpperCase()
    } catch (e) {
      return 'BROWSER-' + Math.random().toString(36).substring(2, 15).toUpperCase()
    }
  }

  const initializeTest = async () => {
    const generatedHwid = await generateHWID()
    setHwid(generatedHwid)
    
    // Collect device info
    const info = {
      os: navigator.platform,
      userAgent: navigator.userAgent,
      language: navigator.language,
      screenResolution: `${screen.width}x${screen.height}`,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      cpuCores: navigator.hardwareConcurrency || 'Unknown',
      memory: (navigator as any).deviceMemory ? `${(navigator as any).deviceMemory} GB` : 'Unknown'
    }
    setDeviceInfo(info)
  }

  React.useEffect(() => {
    initializeTest()
  }, [])

  const testVerify = async () => {
    if (!apiKey || !hwid) {
      toast({
        title: "Missing Information",
        description: "Please enter an API key",
        variant: "destructive"
      })
      return
    }

    setIsLoading(true)
    setResponse(null)

    try {
      const res = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          keyValue: apiKey,
          hwid: hwid,
          deviceName: deviceName,
          deviceInfo: deviceInfo
        })
      })

      const data = await res.json()
      setResponse({
        status: res.status,
        data: data,
        timestamp: new Date().toISOString()
      })

      if (data.valid) {
        toast({
          title: "✓ Verification Successful",
          description: "License verified successfully"
        })
      } else {
        toast({
          title: "✗ Verification Failed",
          description: data.message || "Unknown error",
          variant: "destructive"
        })
      }
    } catch (error: any) {
      setResponse({
        status: 0,
        data: {
          valid: false,
          message: error.message || "Connection error",
          error: "Failed to connect to API"
        },
        timestamp: new Date().toISOString()
      })
      toast({
        title: "Connection Error",
        description: error.message || "Failed to connect to API",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const resetHWID = async () => {
    const newHwid = await generateHWID()
    setHwid(newHwid)
    setResponse(null)
    toast({
      title: "HWID Regenerated",
      description: "A new hardware ID has been generated"
    })
  }

  const requestHWIDReset = async () => {
    if (!apiKey) {
      toast({
        title: "Missing API Key",
        description: "Please enter your API key first",
        variant: "destructive"
      })
      return
    }

    setIsResetting(true)
    setResetResponse(null)

    try {
      const res = await fetch(resetApiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          keyValue: apiKey
        })
      })

      const data = await res.json()
      setResetResponse({
        status: res.status,
        data: data,
        timestamp: new Date().toISOString()
      })

      if (data.success) {
        toast({
          title: "✓ HWID Reset Successful",
          description: data.message || "Hardware bindings cleared"
        })
        // Regenerate HWID after successful reset
        const newHwid = await generateHWID()
        setHwid(newHwid)
      } else {
        toast({
          title: "✗ Reset Failed",
          description: data.message || "Unknown error",
          variant: "destructive"
        })
      }
    } catch (error: any) {
      setResetResponse({
        status: 0,
        data: {
          success: false,
          message: error.message || "Connection error"
        },
        timestamp: new Date().toISOString()
      })
      toast({
        title: "Connection Error",
        description: error.message || "Failed to connect to API",
        variant: "destructive"
      })
    } finally {
      setIsResetting(false)
    }
  }

  const copyToClipboard = (text: string) => {
    <div className="space-y-8 animate-in slide-in-from-bottom-2 duration-500">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight text-foreground font-headline">API Test & Playground</h1>
          <p className="text-muted-foreground">Test your license verification system in real-time</p>
        </div>
        <Tabs value={testMode} onValueChange={(v) => setTestMode(v as "html" | "nodejs")} className="w-auto">
          <TabsList>
            <TabsTrigger value="html">HTML/Browser</TabsTrigger>
            <TabsTrigger value="nodejs">Node.js</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Section */}
        <div className="space-y-6">
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Play className="h-5 w-5 text-primary" />
                Test Configuration
              </CardTitle>
              <CardDescription>Configure your test parameters</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="apiKey">API Key / License Key</Label>
                <div className="flex gap-2">
                  <Input
                    id="apiKey"
                    placeholder="KG-XXXX-XXXX"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    className="font-mono"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="hwid">Hardware ID (HWID)</Label>
                <div className="flex gap-2">
                  <Input
                    id="hwid"
                    value={hwid}
                    onChange={(e) => setHwid(e.target.value)}
                    className="font-mono text-xs"
                    readOnly
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={resetHWID}
                    title="Regenerate HWID"
                  >
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Browser fingerprint-based hardware ID
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="deviceName">Device Name</Label>
                <Input
                  id="deviceName"
                  value={deviceName}
                  onChange={(e) => setDeviceName(e.target.value)}
                  placeholder="My Computer"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="apiUrl">API Endpoint</Label>
                <Input
                  id="apiUrl"
                  value={apiUrl}
                  onChange={(e) => setApiUrl(e.target.value)}
                  className="font-mono text-xs"
                />
              </div>

              <div className="space-y-2">
                <Button
                  onClick={testVerify}
                  disabled={isLoading || !apiKey}
                  className="w-full h-11"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    <>
                      <Play className="mr-2 h-4 w-4" />
                      Test Verification
                    </>
                  )}
                </Button>

                <Button
                  onClick={requestHWIDReset}
                  disabled={isResetting || !apiKey}
                  variant="outline"
                  className="w-full h-11"
                >
                  {isResetting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Resetting...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Reset HWID (24h Cooldown)
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Device Info Card */}
          {deviceInfo && (
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Monitor className="h-5 w-5 text-primary" />
                  Device Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Platform:</span>
                    <span className="font-mono">{deviceInfo.os}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Screen:</span>
                    <span className="font-mono">{deviceInfo.screenResolution}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">CPU Cores:</span>
                    <span className="font-mono">{deviceInfo.cpuCores}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Memory:</span>
                    <span className="font-mono">{deviceInfo.memory}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Timezone:</span>
                    <span className="font-mono text-xs">{deviceInfo.timezone}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Language:</span>
                    <span className="font-mono">{deviceInfo.language}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Response Section */}
        <div className="space-y-6">
          {response ? (
            <>
              <Card className={`border-2 ${response.data.valid ? 'border-green-500/50 bg-green-500/5' : 'border-red-500/50 bg-red-500/5'}`}>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      {response.data.valid ? (
                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-500" />
                      )}
                      Verification Result
                    </span>
                    <Badge variant={response.data.valid ? "default" : "destructive"}>
                      {response.data.valid ? "VALID" : "INVALID"}
                    </Badge>
                  </CardTitle>
                  <CardDescription>
                    Status: {response.status} • {new Date(response.timestamp).toLocaleTimeString()}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Alert variant={response.data.valid ? "default" : "destructive"}>
                    <Info className="h-4 w-4" />
                    <AlertTitle>Message</AlertTitle>
                    <AlertDescription className="font-mono text-xs">
                      {response.data.message}
                    </AlertDescription>
                  </Alert>

                  {response.data.valid && (
                    <div className="space-y-3">
                      {response.data.daysRemaining && (
                        <div className="flex items-center justify-between p-3 rounded-lg bg-muted">
                          <span className="text-sm flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            Time Remaining
                          </span>
                          <span className="font-bold text-lg">
                            {response.data.daysRemaining} day{response.data.daysRemaining !== 1 ? 's' : ''}
                          </span>
                        </div>
                      )}

                      {response.data.boundDevices !== undefined && (
                        <div className="flex items-center justify-between p-3 rounded-lg bg-muted">
                          <span className="text-sm flex items-center gap-2">
                            <HardDrive className="h-4 w-4" />
                            Device Usage
                          </span>
                          <span className="font-mono">
                            {response.data.boundDevices} / {response.data.maxDevices}
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  {response.data.debug && (
                    <Alert>
                      <Info className="h-4 w-4" />
                      <AlertTitle>Debug Info</AlertTitle>
                      <AlertDescription className="text-xs">
                        {response.data.debug}
                      </AlertDescription>
                    </Alert>
                  )}

                  <Tabs defaultValue="formatted" className="w-full">
                    <TabsList className="w-full">
                      <TabsTrigger value="formatted" className="flex-1">Formatted</TabsTrigger>
                      <TabsTrigger value="raw" className="flex-1">Raw JSON</TabsTrigger>
                    </TabsList>
                    <TabsContent value="formatted" className="space-y-2">
                      <div className="rounded-lg border border-border bg-muted/30 p-4">
                        {Object.entries(response.data).map(([key, value]) => (
                          <div key={key} className="flex justify-between py-1 border-b border-border/30 last:border-0">
                            <span className="text-xs text-muted-foreground font-semibold">{key}:</span>
                            <span className="text-xs font-mono">{typeof value === 'object' ? JSON.stringify(value) : String(value)}</span>
                          </div>
                        ))}
                      </div>
                    </TabsContent>
                    <TabsContent value="raw">
                      <div className="relative">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="absolute top-2 right-2 z-10"
                          onClick={() => copyToClipboard(JSON.stringify(response.data, null, 2))}
                        >
                          <Copy className="h-3 w-3 mr-1" />
                          Copy
                        </Button>
                        <pre className="text-xs font-mono bg-muted p-4 rounded-lg overflow-auto max-h-96 border border-border">
                          {JSON.stringify(response.data, null, 2)}
                        </pre>
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </>
          ) : (
            <Card className="border-border/50 border-dashed">
              <CardContent className="flex flex-col items-center justify-center h-96 text-center">
                <Info className="h-12 w-12 text-muted-foreground mb-4 opacity-50" />
                <h3 className="text-lg font-semibold mb-2">No Test Results Yet</h3>
                <p className="text-sm text-muted-foreground max-w-md">
                  Enter your API key and click "Test Verification" to see the response from your license verification system.
                </p>
              </CardContent>
            </Card>
          )}

          {/* Reset HWID Response */}
          {resetResponse && (
            <Card className={`border-2 ${resetResponse.data.success ? 'border-blue-500/50 bg-blue-500/5' : 'border-orange-500/50 bg-orange-500/5'}`}>
              <CardHeader>
                <CardTitle className="text-lg flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <RefreshCw className={`h-5 w-5 ${resetResponse.data.success ? 'text-blue-500' : 'text-orange-500'}`} />
                    HWID Reset Response
                  </span>
                  <Badge variant={resetResponse.data.success ? "default" : "destructive"}>
                    {resetResponse.data.success ? "SUCCESS" : "FAILED"}
                  </Badge>
                </CardTitle>
                <CardDescription>
                  Status: {resetResponse.status} • {new Date(resetResponse.timestamp).toLocaleTimeString()}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Alert variant={resetResponse.data.success ? "default" : "destructive"}>
                  <Info className="h-4 w-4" />
                  <AlertTitle>Message</AlertTitle>
                  <AlertDescription className="font-mono text-xs">
                    {resetResponse.data.message}
                  </AlertDescription>
                </Alert>

                {resetResponse.data.hoursRemaining && (
                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted">
                    <span className="text-sm flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      Cooldown Remaining
                    </span>
                    <span className="font-bold text-lg">
                      {resetResponse.data.hoursRemaining} hour{resetResponse.data.hoursRemaining !== 1 ? 's' : ''}
                    </span>
                  </div>
                )}

                {resetResponse.data.nextResetAvailable && (
                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted">
                    <span className="text-sm">Next Reset Available</span>
                    <span className="font-mono text-xs">
                      {new Date(resetResponse.data.nextResetAvailable).toLocaleString()}
                    </span>
                  </div>
                )}

                {resetResponse.data.debug && (
                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertTitle>Debug Info</AlertTitle>
                    <AlertDescription className="text-xs">
                      {resetResponse.data.debug}
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* API Documentation Card */}
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="text-lg">Quick API Reference</CardTitle>
          <CardDescription>How to integrate with your application</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="curl" className="w-full">
            <TabsList>
              <TabsTrigger value="curl">cURL</TabsTrigger>
              <TabsTrigger value="javascript">JavaScript</TabsTrigger>
              <TabsTrigger value="python">Python</TabsTrigger>
            </TabsList>
            
            <TabsContent value="curl">
              <div className="relative">
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute top-2 right-2 z-10"
                  onClick={() => copyToClipboard(`curl -X POST ${apiUrl} \\\n  -H "Content-Type: application/json" \\\n  -d '{"keyValue": "${apiKey || 'YOUR-API-KEY'}", "hwid": "${hwid}", "deviceName": "${deviceName}"}'`)}
                >
                  <Copy className="h-3 w-3 mr-1" />
                  Copy
                </Button>
                <pre className="text-xs font-mono bg-muted p-4 rounded-lg overflow-auto border border-border">
{`curl -X POST ${apiUrl} \\
  -H "Content-Type: application/json" \\
  -d '{
    "keyValue": "${apiKey || 'YOUR-API-KEY'}",
    "hwid": "${hwid}",
    "deviceName": "${deviceName}"
  }'`}
                </pre>
              </div>
            </TabsContent>
            
            <TabsContent value="javascript">
              <div className="relative">
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute top-2 right-2 z-10"
                  onClick={() => copyToClipboard(`const response = await fetch('${apiUrl}', {\n  method: 'POST',\n  headers: { 'Content-Type': 'application/json' },\n  body: JSON.stringify({\n    keyValue: '${apiKey || 'YOUR-API-KEY'}',\n    hwid: '${hwid}',\n    deviceName: '${deviceName}'\n  })\n});\nconst data = await response.json();`)}
                >
                  <Copy className="h-3 w-3 mr-1" />
                  Copy
                </Button>
                <pre className="text-xs font-mono bg-muted p-4 rounded-lg overflow-auto border border-border">
{`const response = await fetch('${apiUrl}', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    keyValue: '${apiKey || 'YOUR-API-KEY'}',
    hwid: '${hwid}',
    deviceName: '${deviceName}'
  })
});
const data = await response.json();
console.log(data.valid ? '✓ Valid' : '✗ Invalid');`}
                </pre>
              </div>
            </TabsContent>
            
            <TabsContent value="python">
              <div className="relative">
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute top-2 right-2 z-10"
                  onClick={() => copyToClipboard(`import requests\n\nresponse = requests.post('${apiUrl}', json={\n    'keyValue': '${apiKey || 'YOUR-API-KEY'}',\n    'hwid': '${hwid}',\n    'deviceName': '${deviceName}'\n})\ndata = response.json()\nprint('✓ Valid' if data['valid'] else '✗ Invalid')`)}
                >
                  <Copy className="h-3 w-3 mr-1" />
                  Copy
                </Button>
                <pre className="text-xs font-mono bg-muted p-4 rounded-lg overflow-auto border border-border">
{`import requests

response = requests.post('${apiUrl}', json={
    'keyValue': '${apiKey || 'YOUR-API-KEY'}',
    'hwid': '${hwid}',
    'deviceName': '${deviceName}'
})
data = response.json()
print('✓ Valid' if data['valid'] else '✗ Invalid')`}
                </pre>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  
}
