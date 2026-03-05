"use client"

import * as React from "react"
import { 
  Settings, 
  Shield, 
  Bell, 
  Lock, 
  Globe, 
  Database, 
  Cpu,
  Save,
  AlertTriangle,
  Trash2,
  Plus,
  X,
  TestTube,
  Users,
  ExternalLink
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "@/hooks/use-toast"
import { Badge } from "@/components/ui/badge"

export default function SettingsPage() {
  const [blockVpn, setBlockVpn] = React.useState(true)
  const [regionLocking, setRegionLocking] = React.useState(false)
  
  // Country Management
  const [countries, setCountries] = React.useState<string[]>(['US', 'CA', 'GB', 'DE', 'FR'])
  const [countryMode, setCountryMode] = React.useState<'whitelist' | 'blacklist'>('whitelist')
  const [newCountry, setNewCountry] = React.useState('')
  
  // IP Whitelist
  const [ipWhitelist, setIpWhitelist] = React.useState<string[]>(['192.168.1.0/24', '10.0.0.0/8'])
  const [newIpWhitelist, setNewIpWhitelist] = React.useState('')
  
  // IP Blocklist
  const [ipBlocklist, setIpBlocklist] = React.useState<string[]>(['203.0.113.0/24'])
  const [newIpBlocklist, setNewIpBlocklist] = React.useState('')

  // Web Demo Settings
  const [webDemoEnabled, setWebDemoEnabled] = React.useState(false)
  const [allowHwidReset, setAllowHwidReset] = React.useState(true)
  const [hwidResetMode, setHwidResetMode] = React.useState<'all' | 'whitelist' | 'none'>('all')
  const [hwidResetUsers, setHwidResetUsers] = React.useState<string[]>([])
  const [newHwidResetUser, setNewHwidResetUser] = React.useState('')

  const demoUrl = typeof window !== 'undefined' ? `${window.location.origin}/demo` : '/demo'

  const addHwidResetUser = () => {
    if (newHwidResetUser.trim()) {
      setHwidResetUsers([...hwidResetUsers, newHwidResetUser])
      setNewHwidResetUser('')
      toast({
        title: "User Added",
        description: `${newHwidResetUser} can now reset HWID`,
      })
    }
  }

  const removeHwidResetUser = (user: string) => {
    setHwidResetUsers(hwidResetUsers.filter(u => u !== user))
  }

  const addCountry = () => {
    if (newCountry.trim() && newCountry.length === 2) {
      setCountries([...countries, newCountry.toUpperCase()])
      setNewCountry('')
      toast({
        title: "Country Added",
        description: `${newCountry.toUpperCase()} has been added to the ${countryMode} list.`,
      })
    } else {
      toast({
        title: "Invalid Country Code",
        description: "Please enter a valid 2-letter country code (e.g., US, GB, DE)",
        variant: "destructive"
      })
    }
  }

  const removeCountry = (code: string) => {
    setCountries(countries.filter(c => c !== code))
  }

  const addIpWhitelist = () => {
    if (newIpWhitelist.trim()) {
      setIpWhitelist([...ipWhitelist, newIpWhitelist])
      setNewIpWhitelist('')
      toast({
        title: "IP Whitelisted",
        description: `${newIpWhitelist} has been added to the whitelist.`,
      })
    }
  }

  const removeIpWhitelist = (ip: string) => {
    setIpWhitelist(ipWhitelist.filter(i => i !== ip))
  }

  const addIpBlocklist = () => {
    if (newIpBlocklist.trim()) {
      setIpBlocklist([...ipBlocklist, newIpBlocklist])
      setNewIpBlocklist('')
      toast({
        title: "IP Blocked",
        description: `${newIpBlocklist} has been added to the blocklist.`,
      })
    }
  }

  const removeIpBlocklist = (ip: string) => {
    setIpBlocklist(ipBlocklist.filter(i => i !== ip))
  }

  const handleSave = () => {
    toast({
      title: "Settings Saved",
      description: "Global security policies have been updated successfully.",
    })
  }

  return (
    <div className="space-y-8 animate-in slide-in-from-bottom-2 duration-500">
      <div className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight text-foreground font-headline">System Settings</h1>
        <p className="text-muted-foreground">Configure global security parameters and network infrastructure.</p>
      </div>

      <Tabs defaultValue="security" className="w-full">
        <TabsList className="bg-muted/50 border border-border/50 p-1 mb-8">
          <TabsTrigger value="security" className="gap-2">
            <Lock className="h-4 w-4" /> Security
          </TabsTrigger>
          <TabsTrigger value="network" className="gap-2">
            <Globe className="h-4 w-4" /> Network
          </TabsTrigger>
          <TabsTrigger value="webdemo" className="gap-2">
            <TestTube className="h-4 w-4" /> Web Demo
          </TabsTrigger>
          <TabsTrigger value="alerts" className="gap-2">
            <Bell className="h-4 w-4" /> Alerts
          </TabsTrigger>
        </TabsList>

        <TabsContent value="security" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="bg-card border-border/50 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-primary" /> HWID Policies
                </CardTitle>
                <CardDescription>Configure how hardware locking is enforced.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Strict HWID Matching</Label>
                    <p className="text-xs text-muted-foreground">Reject any discrepancy in machine fingerprint.</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Auto-Revoke on Breach</Label>
                    <p className="text-xs text-muted-foreground">Instantly block keys if HWID mismatch is detected.</p>
                  </div>
                  <Switch />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border-border/50 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Cpu className="h-5 w-5 text-primary" /> Encryption Node
                </CardTitle>
                <CardDescription>Manage RSA and AES signature parameters.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Master RSA-4096 Public Key</Label>
                  <Input readOnly value="rsa_pub_key_sha256_deadbeef..." className="font-mono text-xs bg-muted/30" />
                </div>
                <Button variant="outline" size="sm" className="w-full">Rotate Encryption Keys</Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="network" className="space-y-6">
          <Card className="bg-card border-border/50 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5 text-primary" /> Edge Distribution
              </CardTitle>
              <CardDescription>Control global API availability and firewall settings.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Block VPN Access</Label>
                  <p className="text-xs text-muted-foreground">Detect and block known data center and VPN IP ranges.</p>
                </div>
                <Switch checked={blockVpn} onCheckedChange={setBlockVpn} />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Region Locking</Label>
                  <p className="text-xs text-muted-foreground">Restrict license authentication to specific countries.</p>
                </div>
                <Switch checked={regionLocking} onCheckedChange={setRegionLocking} />
              </div>
            </CardContent>
          </Card>

          {regionLocking && (
            <Card className="bg-card border-border/50 shadow-sm border-amber-200/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5 text-amber-600" /> Country Management
                </CardTitle>
                <CardDescription>Control which countries can access your licenses.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Mode</Label>
                  <div className="flex gap-2">
                    <Button 
                      variant={countryMode === 'whitelist' ? 'default' : 'outline'} 
                      onClick={() => setCountryMode('whitelist')}
                      className="flex-1"
                    >
                      Whitelist (Allow only)
                    </Button>
                    <Button 
                      variant={countryMode === 'blacklist' ? 'default' : 'outline'} 
                      onClick={() => setCountryMode('blacklist')}
                      className="flex-1"
                    >
                      Blacklist (Block)
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Add Country Code (2-letter, e.g., US, GB, DE)</Label>
                  <div className="flex gap-2">
                    <Input 
                      placeholder="Country code (US, CA, GB...)" 
                      maxLength={2}
                      value={newCountry}
                      onChange={(e) => setNewCountry(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && addCountry()}
                    />
                    <Button onClick={addCountry} size="sm">
                      <Plus className="h-4 w-4" /> Add
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Active Countries ({countries.length})</Label>
                  <div className="flex flex-wrap gap-2 p-3 bg-muted/30 rounded-lg min-h-10">
                    {countries.length > 0 ? (
                      countries.map(code => (
                        <Badge key={code} variant="secondary" className="cursor-pointer hover:bg-destructive hover:text-destructive-foreground transition-colors" onClick={() => removeCountry(code)}>
                          {code}
                          <X className="h-3 w-3 ml-1" />
                        </Badge>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground">No countries configured</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <Card className="bg-card border-border/50 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-green-600" /> IP Whitelist
              </CardTitle>
              <CardDescription>Allow access only from specific IP addresses or ranges.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Add IP Address or CIDR Range</Label>
                <div className="flex gap-2">
                  <Input 
                    placeholder="192.168.1.0/24 or 203.0.113.42" 
                    value={newIpWhitelist}
                    onChange={(e) => setNewIpWhitelist(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addIpWhitelist()}
                  />
                  <Button onClick={addIpWhitelist} size="sm">
                    <Plus className="h-4 w-4" /> Add
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Whitelisted IPs ({ipWhitelist.length})</Label>
                <div className="space-y-1 p-3 bg-muted/30 rounded-lg max-h-48 overflow-y-auto">
                  {ipWhitelist.length > 0 ? (
                    ipWhitelist.map(ip => (
                      <div key={ip} className="flex items-center justify-between bg-background p-2 rounded border border-border/50 text-sm">
                        <code className="text-xs">{ip}</code>
                        <button 
                          onClick={() => removeIpWhitelist(ip)}
                          className="text-destructive hover:bg-destructive/10 p-1 rounded transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">No IPs whitelisted - all access allowed</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border/50 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-red-600" /> IP Blocklist
              </CardTitle>
              <CardDescription>Prevent access from specific IP addresses or ranges.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Add IP Address or CIDR Range to Block</Label>
                <div className="flex gap-2">
                  <Input 
                    placeholder="198.51.100.0/24 or 192.0.2.1" 
                    value={newIpBlocklist}
                    onChange={(e) => setNewIpBlocklist(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addIpBlocklist()}
                  />
                  <Button onClick={addIpBlocklist} size="sm" variant="destructive">
                    <Plus className="h-4 w-4" /> Block
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Blocked IPs ({ipBlocklist.length})</Label>
                <div className="space-y-1 p-3 bg-destructive/5 rounded-lg max-h-48 overflow-y-auto border border-destructive/20">
                  {ipBlocklist.length > 0 ? (
                    ipBlocklist.map(ip => (
                      <div key={ip} className="flex items-center justify-between bg-background p-2 rounded border border-destructive/20 text-sm">
                        <code className="text-xs">{ip}</code>
                        <button 
                          onClick={() => removeIpBlocklist(ip)}
                          className="text-destructive hover:bg-destructive/10 p-1 rounded transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">No IPs blocked - all access blocked by other rules</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="webdemo" className="space-y-6">
          <Card className="bg-card border-border/50 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TestTube className="h-5 w-5 text-primary" /> Web Demo Portal
              </CardTitle>
              <CardDescription>Enable public demo page for testing license verification</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Enable Web Demo</Label>
                  <p className="text-xs text-muted-foreground">Allow users to test license verification via public demo page</p>
                </div>
                <Switch checked={webDemoEnabled} onCheckedChange={setWebDemoEnabled} />
              </div>

              {webDemoEnabled && (
                <div className="bg-blue-500/10 border border-blue-500/50 rounded-lg p-4">
                  <div className="flex items-start gap-2">
                    <ExternalLink className="h-5 w-5 text-blue-400 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-blue-300">Demo URL</p>
                      <a 
                        href={demoUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-xs text-blue-400 hover:underline break-all"
                      >
                        {demoUrl}
                      </a>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        navigator.clipboard.writeText(demoUrl)
                        toast({ title: "Copied!", description: "Demo URL copied to clipboard" })
                      }}
                    >
                      Copy
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="bg-card border-border/50 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-orange-600" /> HWID Reset Settings
              </CardTitle>
              <CardDescription>Control user-initiated HWID resets (24-hour cooldown enforced)</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Allow HWID Reset</Label>
                  <p className="text-xs text-muted-foreground">Enable users to reset device bindings</p>
                </div>
                <Switch checked={allowHwidReset} onCheckedChange={setAllowHwidReset} />
              </div>

              {allowHwidReset && (
                <>
                  <div className="space-y-2">
                    <Label>Reset Permission Mode</Label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                      <Button 
                        variant={hwidResetMode === 'all' ? 'default' : 'outline'} 
                        onClick={() => setHwidResetMode('all')}
                        className="w-full"
                      >
                        All Users
                      </Button>
                      <Button 
                        variant={hwidResetMode === 'whitelist' ? 'default' : 'outline'} 
                        onClick={() => setHwidResetMode('whitelist')}
                        className="w-full"
                      >
                        Whitelist Only
                      </Button>
                      <Button 
                        variant={hwidResetMode === 'none' ? 'default' : 'outline'} 
                        onClick={() => setHwidResetMode('none')}
                        className="w-full"
                      >
                        Blocked
                      </Button>
                    </div>
                  </div>

                  {hwidResetMode === 'whitelist' && (
                    <div className="space-y-2">
                      <Label>Whitelisted Users (Email or License Key)</Label>
                      <div className="flex gap-2">
                        <Input 
                          placeholder="user@example.com or KG-XXXX-XXXX" 
                          value={newHwidResetUser}
                          onChange={(e) => setNewHwidResetUser(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && addHwidResetUser()}
                        />
                        <Button onClick={addHwidResetUser} size="sm">
                          <Plus className="h-4 w-4" /> Add
                        </Button>
                      </div>

                      <div className="space-y-1 p-3 bg-muted/30 rounded-lg max-h-48 overflow-y-auto">
                        {hwidResetUsers.length > 0 ? (
                          hwidResetUsers.map(user => (
                            <div key={user} className="flex items-center justify-between bg-background p-2 rounded border border-border/50 text-sm">
                              <span className="text-xs">{user}</span>
                              <button 
                                onClick={() => removeHwidResetUser(user)}
                                className="text-destructive hover:bg-destructive/10 p-1 rounded transition-colors"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          ))
                        ) : (
                          <p className="text-sm text-muted-foreground">No users whitelisted - add users above</p>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="bg-amber-500/10 border border-amber-500/50 rounded-lg p-4">
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="h-5 w-5 text-amber-400 mt-0.5" />
                      <div>
                        <p className="text-sm font-semibold text-amber-300">24-Hour Cooldown</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Users can only reset HWID once every 24 hours. This cooldown is enforced automatically and cannot be bypassed.
                        </p>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-6">
          <Card className="bg-card border-border/50 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-primary" /> System Notifications
              </CardTitle>
              <CardDescription>Configure automated alerts for security events.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>HWID Mismatch Alerts</Label>
                  <p className="text-xs text-muted-foreground">Notify admins when a locked key is used on a new PC.</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>License Expiry Warning</Label>
                  <p className="text-xs text-muted-foreground">Alert when a client license is 7 days from expiring.</p>
                </div>
                <Switch defaultChecked />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex items-center justify-end gap-4 pt-4 border-t border-border/50">
        <Button variant="outline">Reset to Defaults</Button>
        <Button onClick={handleSave} className="bg-primary text-primary-foreground">
          <Save className="mr-2 h-4 w-4" /> Save Global Configuration
        </Button>
      </div>

      <Card className="border-destructive/20 bg-destructive/5 overflow-hidden">
        <div className="p-4 bg-destructive/10 flex items-center gap-3">
          <AlertTriangle className="h-5 w-5 text-destructive" />
          <span className="font-bold text-sm text-destructive uppercase tracking-widest">Danger Zone</span>
        </div>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <h4 className="font-bold">Purge System Audit Logs</h4>
              <p className="text-sm text-muted-foreground">This will permanently delete all access and security logs. This cannot be undone.</p>
            </div>
            <Button variant="destructive">Purge Audit Trail</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
