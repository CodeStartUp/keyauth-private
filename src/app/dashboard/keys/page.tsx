"use client"

import * as React from "react"
import { 
  Key, 
  Plus, 
  Search, 
  MoreVertical, 
  Copy, 
  Trash2, 
  ShieldCheck, 
  ShieldX,
  Cpu,
  Monitor,
  Code2,
  Lock,
  Loader2,
  Calendar as CalendarIcon,
  AlertCircle,
  ExternalLink,
  Terminal,
  Info,
  HardDrive,
  Globe,
  RefreshCw,
  Clock,
  ShieldBan
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { toast } from "@/hooks/use-toast"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { 
  useFirestore, 
  useCollection, 
  useUser, 
  useMemoFirebase,
  updateDocumentNonBlocking,
  deleteDocumentNonBlocking,
  addDocumentNonBlocking
} from "@/firebase"
import { collection, query, orderBy, doc } from "firebase/firestore"

const SafeDate = ({ dateString, fallback = "Never" }: { dateString?: string | null, fallback?: string }) => {
  const [formatted, setFormatted] = React.useState<string>("...")
  React.useEffect(() => {
    if (dateString) {
      setFormatted(new Date(dateString).toLocaleString())
    } else {
      setFormatted(fallback)
    }
  }, [dateString, fallback])
  return <span>{formatted}</span>
}

const TimeRemaining = ({ expiresAt }: { expiresAt: string }) => {
  const [display, setDisplay] = React.useState<React.ReactNode>(null)
  
  React.useEffect(() => {
    const calculateTime = () => {
      try {
        const now = new Date()
        const expiry = new Date(expiresAt)
        const diffMs = expiry.getTime() - now.getTime()
        const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24))
        
        if (diffDays < 0) {
          setDisplay(<span className="text-red-400">Expired</span>)
        } else if (diffDays === 0) {
          setDisplay(<span className="text-orange-400">Expires Today</span>)
        } else if (diffDays <= 7) {
          setDisplay(<span className="text-orange-400">{diffDays} day{diffDays !== 1 ? 's' : ''} left</span>)
        } else if (diffDays <= 30) {
          setDisplay(<span className="text-yellow-400">{diffDays} days left</span>)
        } else {
          setDisplay(<span className="text-green-400">{diffDays} days left</span>)
        }
      } catch (error) {
        setDisplay(<span className="text-muted-foreground">Invalid date</span>)
      }
    }
    
    calculateTime()
    // Update every minute
    const interval = setInterval(calculateTime, 60000)
    return () => clearInterval(interval)
  }, [expiresAt])
  
  return <>{display}</>
}

const DeviceInfo = React.memo(({ hwid, deviceData, onCopy }: { 
  hwid: string, 
  deviceData: any, 
  onCopy: (text: string) => void 
}) => {
  const hasExtendedInfo = deviceData && Object.keys(deviceData).length > 3
  
  return (
    <div className="bg-background/50 p-3 rounded-lg border border-border/30">
      <div className="flex items-center justify-between mb-2">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-mono break-all font-semibold text-primary">{hwid}</p>
          <p className="text-xs text-muted-foreground mt-1">
            {deviceData?.deviceName || deviceData?.hostname || "Unknown Device"}
          </p>
        </div>
        <Button variant="ghost" size="sm" className="h-7 ml-2" onClick={() => onCopy(hwid)}>
          <Copy className="h-3 w-3" />
        </Button>
      </div>
      
      {hasExtendedInfo && (
        <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-border/30 text-xs">
          {deviceData.os && (
            <div>
              <span className="text-muted-foreground">OS:</span>
              <span className="ml-1 font-semibold">{deviceData.os} {deviceData.osRelease}</span>
            </div>
          )}
          {deviceData.processor && (
            <div>
              <span className="text-muted-foreground">CPU:</span>
              <span className="ml-1 font-mono text-[10px]">{deviceData.processor.substring(0, 20)}...</span>
            </div>
          )}
          {deviceData.cpuCores && (
            <div>
              <span className="text-muted-foreground">Cores:</span>
              <span className="ml-1 font-semibold">{deviceData.cpuCores}</span>
            </div>
          )}
          {deviceData.ram && (
            <div>
              <span className="text-muted-foreground">RAM:</span>
              <span className="ml-1 font-semibold">{deviceData.ram}</span>
            </div>
          )}
          {deviceData.gpu && (
            <div className="col-span-2">
              <span className="text-muted-foreground">GPU:</span>
              <span className="ml-1 font-mono text-[10px]">{deviceData.gpu}</span>
            </div>
          )}
          {deviceData.diskSize && (
            <div>
              <span className="text-muted-foreground">Disk:</span>
              <span className="ml-1 font-semibold">{deviceData.diskSize}</span>
            </div>
          )}
          {deviceData.ipAddress && (
            <div>
              <span className="text-muted-foreground">IP:</span>
              <span className="ml-1 font-mono text-[10px]">{deviceData.ipAddress}</span>
            </div>
          )}
          {deviceData.macAddress && (
            <div>
              <span className="text-muted-foreground">MAC:</span>
              <span className="ml-1 font-mono text-[10px]">{deviceData.macAddress}</span>
            </div>
          )}
          {deviceData.architecture && (
            <div>
              <span className="text-muted-foreground">Arch:</span>
              <span className="ml-1 font-semibold">{deviceData.architecture}</span>
            </div>
          )}
          {deviceData.boundAt && (
            <div>
              <span className="text-muted-foreground">Bound:</span>
              <span className="ml-1 text-[10px]">{new Date(deviceData.boundAt).toLocaleDateString()}</span>
            </div>
          )}
        </div>
      )}
    </div>
  )
})

DeviceInfo.displayName = 'DeviceInfo'

export default function KeysPage() {
  const firestore = useFirestore()
  const { user, isUserLoading } = useUser()
  const [search, setSearch] = React.useState("")
  const [isCreating, setIsCreating] = React.useState(false)
  const [apiUrl, setApiUrl] = React.useState("")
  const [selectedKeyMetadata, setSelectedKeyMetadata] = React.useState<any>(null)
  const [selectedKeyForDate, setSelectedKeyForDate] = React.useState<any>(null)
  const [dateAdjustDays, setDateAdjustDays] = React.useState<number>(0)

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
    }
  }, [])

  const keysQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null
    return query(collection(firestore, "apiKeys"), orderBy("createdAt", "desc"))
  }, [firestore, user])

  const { data: keys, isLoading: isCollectionLoading } = useCollection(keysQuery)

  const isLoading = isUserLoading || isCollectionLoading

  const filteredKeys = React.useMemo(() => {
    if (!keys) return []
    return keys.filter(k => 
      k.keyValue?.toLowerCase().includes(search.toLowerCase()) || 
      k.name?.toLowerCase().includes(search.toLowerCase()) || 
      k.hwid?.toLowerCase().includes(search.toLowerCase())
    )
  }, [keys, search])

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: "Copied",
      description: "Text copied to your clipboard.",
    })
  }

  const handleDelete = (id: string) => {
    if (!firestore) return
    const docRef = doc(firestore, "apiKeys", id)
    deleteDocumentNonBlocking(docRef)
    toast({
      title: "Key Deleted",
      description: "The authentication key has been removed.",
    })
  }

  const toggleBlock = (id: string, currentStatus: boolean) => {
    if (!firestore) return
    const docRef = doc(firestore, "apiKeys", id)
    updateDocumentNonBlocking(docRef, { isActive: !currentStatus })
    toast({
      title: "Status Updated",
      description: `Key is now ${!currentStatus ? 'active' : 'inactive'}.`,
    })
  }

  const handleResetHWID = (id: string, keyValue: string) => {
    if (!firestore) return
    const docRef = doc(firestore, "apiKeys", id)
    updateDocumentNonBlocking(docRef, { 
      hwid: "",
      hwidList: [],
      deviceList: [],
      boundDevices: 0,
      deviceName: "",
      pcName: "",
      lastHwidResetAt: new Date().toISOString()
    })
    toast({
      title: "HWID Reset",
      description: `All device bindings have been removed from ${keyValue}. It can now be bound to new devices.`,
    })
  }

  const handleAdjustDate = () => {
    if (!firestore || !selectedKeyForDate || dateAdjustDays === 0) return
    
    const currentExpiry = selectedKeyForDate.expiresAt ? new Date(selectedKeyForDate.expiresAt) : new Date()
    const newExpiry = new Date(currentExpiry)
    newExpiry.setDate(newExpiry.getDate() + dateAdjustDays)
    
    const docRef = doc(firestore, "apiKeys", selectedKeyForDate.id)
    updateDocumentNonBlocking(docRef, { expiresAt: newExpiry.toISOString() })
    
    toast({
      title: "Date Adjusted",
      description: `License expiration ${dateAdjustDays > 0 ? 'extended' : 'reduced'} by ${Math.abs(dateAdjustDays)} days.`,
    })
    
    setSelectedKeyForDate(null)
    setDateAdjustDays(0)
  }

  const handleCreateKey = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!firestore || !user) return
    
    setIsCreating(true)
    const formData = new FormData(e.currentTarget)
    const name = formData.get("name") as string
    const expiry = formData.get("expiresAt") as string
    const durationDays = parseInt(formData.get("durationDays") as string) || 0
    const maxDevices = parseInt(formData.get("maxDevices") as string) || 1
    const allowMultipleDevices = formData.get("allowMultipleDevices") === "on"
    const allowWebAccess = formData.get("allowWebAccess") === "on"
    const blockVpnAccess = formData.get("blockVpnAccess") === "on"
    const allowUserResetHwid = formData.get("allowUserResetHwid") === "on"
    
    const generatedKey = `KG-${Math.random().toString(36).substring(2, 6).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`
    
    // Calculate expiration based on either date or duration
    let expirationDate = null
    if (expiry) {
      expirationDate = new Date(expiry).toISOString()
    } else if (durationDays > 0) {
      const exp = new Date()
      exp.setDate(exp.getDate() + durationDays)
      expirationDate = exp.toISOString()
    }
    
    const newKey = {
      name,
      keyValue: generatedKey,
      isActive: true,
      createdAt: new Date().toISOString(),
      expiresAt: expirationDate,
      durationDays: durationDays,
      creatorUserId: user.uid,
      allowMultipleDevices: allowMultipleDevices,
      maxDevices: maxDevices,
      boundDevices: 0,
      allowWebAccess: allowWebAccess,
      blockVpnAccess: blockVpnAccess,
      allowUserResetHwid: allowUserResetHwid,
      lastHwidResetAt: null,
      lastUsedAt: null,
      hwid: "",
      pcName: "",
      deviceName: "",
      hwidList: [],
      deviceList: [] // Will contain extended device info
    }

    addDocumentNonBlocking(collection(firestore, "apiKeys"), newKey)
    setIsCreating(false)
    const duration = durationDays > 0 ? ` (${durationDays} days)` : ""
    toast({
      title: "Key Generated",
      description: `New key ${generatedKey} created with ${maxDevices} device${maxDevices > 1 ? 's' : ''} allowed${duration}.`,
    })
  }

  const pythonSnippet = `import urllib.request
import urllib.error
import json
import socket
import platform
import uuid
import sys
import hashlib
import os
import subprocess

def get_extended_device_info():
    """Capture comprehensive device information."""
    try:
        info = {
            "os": platform.system(),
            "osVersion": platform.version(),
            "osRelease": platform.release(),
            "hostname": socket.gethostname(),
            "architecture": platform.machine(),
            "processor": platform.processor(),
            "cpuCores": os.cpu_count() or 0,
            "macAddress": ':'.join(['{:02x}'.format((uuid.getnode() >> elements) & 0xff) 
                                     for elements in range(0,2*6,2)][::-1]),
        }
        
        # Get IP address
        try:
            s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
            s.connect(("8.8.8.8", 80))
            info["ipAddress"] = s.getsockname()[0]
            s.close()
        except:
            info["ipAddress"] = "Unknown"
        
        # Get disk info (Windows)
        if platform.system() == "Windows":
            try:
                output = subprocess.check_output("wmic diskdrive get size", shell=True).decode()
                sizes = [int(s) for s in output.split() if s.isdigit()]
                info["diskSize"] = f"{sum(sizes) // (1024**3)} GB" if sizes else "Unknown"
            except:
                info["diskSize"] = "Unknown"
            
            # Get RAM info
            try:
                output = subprocess.check_output("wmic computersystem get totalphysicalmemory", shell=True).decode()
                sizes = [int(s) for s in output.split() if s.isdigit()]
                if sizes:
                    info["ram"] = f"{sizes[0] // (1024**3)} GB"
            except:
                info["ram"] = "Unknown"
            
            # Get GPU info
            try:
                output = subprocess.check_output("wmic path win32_VideoController get name", shell=True).decode()
                gpus = [line.strip() for line in output.split('\\n')[1:] if line.strip()]
                info["gpu"] = gpus[0] if gpus else "Unknown"
            except:
                info["gpu"] = "Unknown"
        
        return info
    except Exception as e:
        return {"error": str(e)}

def get_hwid():
    """Generates a unique hardware fingerprint."""
    try:
        system_info = [
            platform.node(),
            platform.machine(),
            platform.processor(),
            platform.system(),
            str(uuid.getnode()),
        ]
        raw_id = ":".join(system_info).encode('utf-8')
        return hashlib.sha256(raw_id).hexdigest()[:32].upper()
    except Exception:
        return hashlib.md5(str(uuid.getnode()).encode()).hexdigest().upper()

def verify_license(license_key):
    hwid = get_hwid()
    device_info = get_extended_device_info()
    
    payload = {
        "keyValue": license_key,
        "hwid": hwid,
        "deviceName": device_info.get("hostname", "Unknown"),
        "deviceInfo": device_info
    }
    
    data = json.dumps(payload).encode('utf-8')
    url = "${apiUrl}"
    
    print(f"[*] Target Node: {url}")
    
    req = urllib.request.Request(
        url, 
        data=data, 
        headers={'Content-Type': 'application/json'},
        method='POST'
    )
    
    try:
        with urllib.request.urlopen(req, timeout=15) as response:
            res_body = response.read().decode('utf-8')
            return json.loads(res_body)
    except urllib.error.HTTPError as e:
        if e.code in [401, 302, 301]:
            return {
                "status": "error", 
                "message": "Access Blocked by Firewall (401/302)", 
                "debug": "Port 9002 must be set to 'Public' in Workstation Settings."
            }
        try:
            return json.loads(e.read().decode('utf-8'))
        except:
            return {"status": "error", "message": f"Server error: {e.code}"}
    except Exception as e:
        return {"status": "error", "message": str(e)}

if __name__ == "__main__":
    print("--- KeyGuard Professional Integration (No-Dependencies) ---")
    key = input("Enter License Key: ").strip()
    if not key:
        print("[-] Error: License key required.")
        sys.exit(1)
        
    result = verify_license(key)
    print(f"Result Status: {result.get('status', 'unknown').upper()}")
    print(f"Message: {result.get('message', 'No response from server')}")
    
    if result.get('status') == 'success':
        print(f"[+] PC Registered: {result.get('pcName')}")
        print(f"[+] Expiration: {result.get('expiresAt')}")
    elif result.get('debug'):
        print(f"[!] Troubleshooting: {result.get('debug')}")
`;

  return (
    <div className="space-y-8 animate-in slide-in-from-bottom-2 duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight text-foreground font-headline">License Management</h1>
          <p className="text-muted-foreground">Manage hardware-locked licenses on Port 9002.</p>
        </div>
        <div className="flex gap-2">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" className="h-11 border-primary/20 hover:bg-primary/5">
                <Code2 className="mr-2 h-5 w-5" /> Client Code
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[850px]">
              <DialogHeader>
                <DialogTitle>Python Integration (Zero Dependencies)</DialogTitle>
                <DialogDescription>
                  This script uses Python's built-in `urllib` and `json` libraries. No `pip install` required.
                </DialogDescription>
              </DialogHeader>
              
              <Alert className="bg-blue-500/10 border-blue-500/20 text-blue-400">
                <Terminal className="h-4 w-4" />
                <AlertTitle>Verify Connection</AlertTitle>
                <AlertDescription className="text-[10px] font-mono mt-2">
                  <p className="mb-1">Test your node with this command:</p>
                  <code className="bg-black/40 p-1 rounded">curl {apiUrl}</code>
                  <p className="mt-2 text-amber-400">If you get a 302 redirect, Port 9002 is PRIVATE. Set it to PUBLIC in Workstation Settings.</p>
                </AlertDescription>
              </Alert>

              <div className="relative mt-4">
                <Button className="absolute top-2 right-2 z-10" size="sm" onClick={() => copyToClipboard(pythonSnippet)}>
                  <Copy className="h-4 w-4 mr-2" /> Copy Python
                </Button>
                <pre className="p-4 rounded-lg bg-black/80 text-emerald-400 font-mono text-[10px] overflow-x-auto border border-border/50 max-h-[350px]">
                  {pythonSnippet}
                </pre>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog>
            <DialogTrigger asChild>
              <Button className="h-11 px-6 shadow-lg shadow-primary/20 bg-primary hover:bg-primary/90">
                <Plus className="mr-2 h-5 w-5" /> Issue Key
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold">New License</DialogTitle>
                <DialogDescription>
                  Configure license settings and device limits.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateKey}>
                <div className="grid gap-6 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="name">Client Name</Label>
                    <Input id="name" name="name" placeholder="John Doe" required />
                  </div>
                  
                  <div className="rounded-lg border border-primary/20 bg-primary/5 p-4 space-y-4">
                    <div className="grid gap-2">
                      <Label htmlFor="durationDays" className="flex items-center gap-2">
                        <CalendarIcon className="h-4 w-4" />
                        License Duration (Days)
                      </Label>
                      <Input 
                        id="durationDays" 
                        name="durationDays" 
                        type="number" 
                        min="0" 
                        max="3650"
                        placeholder="30"
                        className="font-mono"
                      />
                      <p className="text-xs text-muted-foreground">
                        Days until expiration (0 = Lifetime, 30 = 1 month trial)
                      </p>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="expiresAt">Or Set Specific Date</Label>
                      <Input id="expiresAt" name="expiresAt" type="date" />
                      <p className="text-xs text-muted-foreground">
                        Leave both empty for lifetime license
                      </p>
                    </div>
                  </div>
                  
                  <div className="rounded-lg border border-border/50 bg-muted/30 p-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="allowMultipleDevices" className="text-sm font-medium">
                          Multiple Devices
                        </Label>
                        <p className="text-xs text-muted-foreground">
                          Allow this key to be used on multiple PCs
                        </p>
                      </div>
                      <Switch id="allowMultipleDevices" name="allowMultipleDevices" />
                    </div>
                    
                    <div className="grid gap-2">
                      <Label htmlFor="maxDevices" className="flex items-center gap-2">
                        <Monitor className="h-4 w-4" />
                        Maximum Devices/HWIDs
                      </Label>
                      <Input 
                        id="maxDevices" 
                        name="maxDevices" 
                        type="number" 
                        min="1" 
                        max="100"
                        defaultValue="1"
                        placeholder="1"
                        className="font-mono"
                      />
                      <p className="text-xs text-muted-foreground">
                        How many different hardware IDs can use this license (1-100)
                      </p>
                    </div>
                    
                    <div className="flex items-center justify-between pt-3 border-t border-border/50">
                      <div className="space-y-0.5">
                        <Label htmlFor="allowWebAccess" className="text-sm font-medium flex items-center gap-2">
                          <Globe className="h-4 w-4" />
                          Web-Based Access
                        </Label>
                        <p className="text-xs text-muted-foreground">
                          For browsers/PHP - uses session tracking instead of strict HWID
                        </p>
                      </div>
                      <Switch id="allowWebAccess" name="allowWebAccess" />
                    </div>
                    
                    <div className="flex items-center justify-between pt-3 border-t border-border/50">
                      <div className="space-y-0.5">
                        <Label htmlFor="blockVpnAccess" className="text-sm font-medium flex items-center gap-2">
                          <ShieldBan className="h-4 w-4 text-orange-500" />
                          Block VPN Access
                        </Label>
                        <p className="text-xs text-muted-foreground">
                          Deny verification requests from VPN/proxy connections
                        </p>
                      </div>
                      <Switch id="blockVpnAccess" name="blockVpnAccess" />
                    </div>
                    
                    <div className="flex items-center justify-between pt-3 border-t border-border/50">
                      <div className="space-y-0.5">
                        <Label htmlFor="allowUserResetHwid" className="text-sm font-medium flex items-center gap-2">
                          <RefreshCw className="h-4 w-4 text-blue-500" />
                          Allow User Reset HWID
                        </Label>
                        <p className="text-xs text-muted-foreground">
                          Users can reset hardware binding once every 24 hours
                        </p>
                      </div>
                      <Switch id="allowUserResetHwid" name="allowUserResetHwid" />
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit" className="w-full h-11" disabled={isCreating}>
                    {isCreating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Generate License"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
        <Input 
          placeholder="Filter licenses..." 
          className="pl-10 h-11 bg-card border-border/50"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden shadow-sm">
        <Table>
          <TableHeader className="bg-muted/30">
            <TableRow>
              <TableHead>Key Value</TableHead>
              <TableHead>Client</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Expiration</TableHead>
              <TableHead>Last Active</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                  <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2 text-primary" />
                  Fetching Security Data...
                </TableCell>
              </TableRow>
            ) : filteredKeys.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                  No licenses found.
                </TableCell>
              </TableRow>
            ) : (
              filteredKeys.map((k) => (
                <TableRow key={k.id} className="group hover:bg-primary/5 transition-colors">
                  <TableCell className="font-mono text-xs font-bold">
                    <div className="flex items-center gap-2">
                      <Key className="h-3.5 w-3.5 text-primary" />
                      {k.keyValue}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium">{k.name}</span>
                      <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                        <Monitor className="h-3 w-3" /> {k.deviceName || k.pcName || 'Pending HWID'}
                      </span>
                      {k.maxDevices && k.maxDevices > 1 && (
                        <span className="text-[9px] text-primary font-mono mt-0.5">
                          {k.boundDevices || 0}/{k.maxDevices} devices
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {k.isActive ? (
                      <Badge variant="outline" className="bg-green-500/10 text-green-400 border-green-500/20 px-2 py-0 text-[10px]">ACTIVE</Badge>
                    ) : (
                      <Badge variant="outline" className="bg-red-500/10 text-red-400 border-red-500/20 px-2 py-0 text-[10px]">LOCKED</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    <SafeDate dateString={k.expiresAt} fallback="Lifetime" />
                  </TableCell>
                  <TableCell className="text-xs font-mono text-muted-foreground">
                    <SafeDate dateString={k.lastUsedAt} />
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setSelectedKeyMetadata(k)} className="gap-2 cursor-pointer">
                          <Info className="h-4 w-4" /> View Metadata
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => copyToClipboard(k.keyValue)} className="gap-2 cursor-pointer">
                          <Copy className="h-4 w-4" /> Copy Key
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => toggleBlock(k.id, k.isActive)} className="gap-2 cursor-pointer">
                          {k.isActive ? <Lock className="h-4 w-4" /> : <ShieldCheck className="h-4 w-4" />}
                          {k.isActive ? 'Block Key' : 'Unlock Key'}
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleResetHWID(k.id, k.keyValue)} 
                          className="gap-2 cursor-pointer text-orange-500"
                          disabled={!k.hwid && (!k.hwidList || k.hwidList.length === 0)}
                        >
                          <RefreshCw className="h-4 w-4" /> Reset HWID
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => {
                            setSelectedKeyForDate(k)
                            setDateAdjustDays(0)
                          }} 
                          className="gap-2 cursor-pointer text-blue-500"
                        >
                          <Clock className="h-4 w-4" /> Adjust Date
                        </DropdownMenuItem>
                        <DropdownMenuItem className="gap-2 text-destructive cursor-pointer" onClick={() => handleDelete(k.id)}>
                          <Trash2 className="h-4 w-4" /> Revoke
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Metadata Dialog */}
      <Dialog open={!!selectedKeyMetadata} onOpenChange={(open) => !open && setSelectedKeyMetadata(null)}>
        <DialogContent className="max-w-[95vw] w-full h-[95vh] max-h-[95vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-2xl">
              <HardDrive className="h-6 w-6 text-primary" />
              Hardware & Metadata
            </DialogTitle>
            <DialogDescription>
              Complete licensing information and hardware binding details
            </DialogDescription>
          </DialogHeader>
          
          {selectedKeyMetadata && (
            <div className="space-y-4 py-4" key={selectedKeyMetadata.id}>
              {/* License Key */}
              <div className="rounded-lg border border-border/50 bg-card p-4">
                <div className="flex items-center justify-between mb-2">
                  <Label className="text-xs text-muted-foreground uppercase tracking-wider">License Key</Label>
                  <Button variant="ghost" size="sm" className="h-7" onClick={() => copyToClipboard(selectedKeyMetadata.keyValue)}>
                    <Copy className="h-3 w-3 mr-1" /> Copy
                  </Button>
                </div>
                <p className="font-mono text-sm font-bold text-primary">{selectedKeyMetadata.keyValue}</p>
              </div>

              {/* Client Information */}
              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-lg border border-border/50 bg-muted/30 p-4">
                  <Label className="text-xs text-muted-foreground uppercase tracking-wider">Client Name</Label>
                  <p className="text-sm font-semibold mt-1">{selectedKeyMetadata.name || "Not specified"}</p>
                </div>
                <div className="rounded-lg border border-border/50 bg-muted/30 p-4">
                  <Label className="text-xs text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                    <Monitor className="h-3 w-3" /> Device Name
                  </Label>
                  <p className="text-sm font-semibold mt-1 font-mono">{selectedKeyMetadata.deviceName || selectedKeyMetadata.pcName || "Not bound yet"}</p>
                </div>
              </div>

              {/* Hardware ID with Extended Info */}
              <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
                <Label className="text-xs text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                  <Cpu className="h-3 w-3" /> Hardware & Device Information
                </Label>
                <div className="mt-2 space-y-3">
                  {selectedKeyMetadata.hwidList && selectedKeyMetadata.hwidList.length > 0 ? (
                    selectedKeyMetadata.hwidList.map((hwid: string, index: number) => (
                      <DeviceInfo
                        key={`${hwid}-${index}`}
                        hwid={hwid}
                        deviceData={selectedKeyMetadata.deviceList?.[index] || {}}
                        onCopy={copyToClipboard}
                      />
                    ))
                  ) : (
                    <p className="text-sm font-mono text-muted-foreground italic">
                      Pending first verification
                    </p>
                  )}
                </div>
              </div>

              {/* Status and Time */}
              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-lg border border-border/50 bg-muted/30 p-4">
                  <Label className="text-xs text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                    <ShieldCheck className="h-3 w-3" /> Status
                  </Label>
                  <div className="mt-2">
                    {selectedKeyMetadata.isActive ? (
                      <Badge className="bg-green-500/10 text-green-400 border-green-500/20">
                        <ShieldCheck className="h-3 w-3 mr-1" /> ACTIVE
                      </Badge>
                    ) : (
                      <Badge variant="destructive" className="bg-red-500/10 text-red-400 border-red-500/20">
                        <ShieldX className="h-3 w-3 mr-1" /> BLOCKED
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="rounded-lg border border-border/50 bg-muted/30 p-4">
                  <Label className="text-xs text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                    <CalendarIcon className="h-3 w-3" /> Time Remaining
                  </Label>
                  <div className="mt-2">
                    {selectedKeyMetadata.expiresAt ? (
                      <div>
                        <p className="text-sm font-semibold">
                          <TimeRemaining expiresAt={selectedKeyMetadata.expiresAt} />
                        </p>
                        <p className="text-[10px] text-muted-foreground mt-1">
                          Expires: <SafeDate dateString={selectedKeyMetadata.expiresAt} />
                        </p>
                      </div>
                    ) : (
                      <p className="text-sm font-semibold text-green-400">Lifetime License</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Timestamps */}
              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-lg border border-border/50 bg-muted/30 p-4">
                  <Label className="text-xs text-muted-foreground uppercase tracking-wider">Created At</Label>
                  <p className="text-xs font-mono mt-1 text-muted-foreground">
                    <SafeDate dateString={selectedKeyMetadata.createdAt} />
                  </p>
                </div>
                <div className="rounded-lg border border-border/50 bg-muted/30 p-4">
                  <Label className="text-xs text-muted-foreground uppercase tracking-wider">Last Used At</Label>
                  <p className="text-xs font-mono mt-1 text-muted-foreground">
                    <SafeDate dateString={selectedKeyMetadata.lastUsedAt} fallback="Never used" />
                  </p>
                </div>
              </div>

              {/* Additional Settings */}
              <div className="rounded-lg border border-border/50 bg-card p-4">
                <Label className="text-xs text-muted-foreground uppercase tracking-wider mb-3 block">Security Settings</Label>
                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Multiple Devices</span>
                    <Badge variant="outline" className="text-[10px]">
                      {selectedKeyMetadata.allowMultipleDevices ? "Allowed" : "Single Device"}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground flex items-center gap-1">
                      <Monitor className="h-3 w-3" /> Device Limit
                    </span>
                    <Badge variant="outline" className="text-[10px] font-mono">
                      {selectedKeyMetadata.boundDevices || 0} / {selectedKeyMetadata.maxDevices || 1}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">VPN Access</span>
                    <Badge variant="outline" className="text-[10px]">
                      {selectedKeyMetadata.blockVpnAccess ? "Blocked" : "Allowed"}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">User Reset HWID</span>
                    <Badge variant="outline" className="text-[10px]">
                      {selectedKeyMetadata.allowUserResetHwid ? "Allowed" : "Disabled"}
                    </Badge>
                  </div>
                  {selectedKeyMetadata.lastHwidResetAt && (
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Last HWID Reset</span>
                      <span className="font-mono text-[10px]">{new Date(selectedKeyMetadata.lastHwidResetAt).toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Creator ID</span>
                    <span className="font-mono text-[10px]">{selectedKeyMetadata.creatorUserId?.slice(0, 8)}...</span>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedKeyMetadata(null)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Date Adjustment Dialog */}
      <Dialog open={!!selectedKeyForDate} onOpenChange={(open) => !open && setSelectedKeyForDate(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              Adjust License Expiration
            </DialogTitle>
            <DialogDescription>
              Extend or reduce the expiration date for {selectedKeyForDate?.keyValue}
            </DialogDescription>
          </DialogHeader>
          
          {selectedKeyForDate && (
            <div className="space-y-4 py-4">
              <div className="rounded-lg border border-border/50 bg-muted/30 p-4">
                <Label className="text-xs text-muted-foreground">Current Expiration</Label>
                <p className="text-sm font-medium mt-1">
                  <SafeDate dateString={selectedKeyForDate.expiresAt} fallback="No expiration set" />
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="adjustDays">Adjust by (days)</Label>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setDateAdjustDays(Math.max(dateAdjustDays - 7, -365))}
                  >
                    -7
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setDateAdjustDays(Math.max(dateAdjustDays - 1, -365))}
                  >
                    -1
                  </Button>
                  <Input
                    id="adjustDays"
                    type="number"
                    value={dateAdjustDays}
                    onChange={(e) => setDateAdjustDays(parseInt(e.target.value) || 0)}
                    className="text-center font-mono"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setDateAdjustDays(Math.min(dateAdjustDays + 1, 365))}
                  >
                    +1
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setDateAdjustDays(Math.min(dateAdjustDays + 7, 365))}
                  >
                    +7
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Positive values extend, negative values reduce the expiration date
                </p>
              </div>

              {dateAdjustDays !== 0 && (
                <div className="rounded-lg border border-blue-500/20 bg-blue-500/10 p-4">
                  <Label className="text-xs text-blue-400">New Expiration Date</Label>
                  <p className="text-sm font-medium mt-1">
                    {(() => {
                      const current = selectedKeyForDate.expiresAt ? new Date(selectedKeyForDate.expiresAt) : new Date()
                      const newDate = new Date(current)
                      newDate.setDate(newDate.getDate() + dateAdjustDays)
                      return newDate.toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })
                    })()}
                  </p>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setSelectedKeyForDate(null)
              setDateAdjustDays(0)
            }}>
              Cancel
            </Button>
            <Button 
              onClick={handleAdjustDate}
              disabled={dateAdjustDays === 0}
            >
              Apply Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
