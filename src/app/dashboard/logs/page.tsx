
"use client"

import * as React from "react"
import { Activity, Search, Filter, Monitor, ShieldAlert, ShieldCheck, Download, Calendar, Loader2, Info, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { 
  useFirestore, 
  useCollection, 
  useUser, 
  useMemoFirebase 
} from "@/firebase"
import { collection, query, orderBy, limit } from "firebase/firestore"

// Helper for relative time (simple version for prototype)
const FormattedTime = ({ timestamp }: { timestamp: string }) => {
  const [formatted, setFormatted] = React.useState("...")
  React.useEffect(() => {
    setFormatted(new Date(timestamp).toLocaleString())
  }, [timestamp])
  return <span className="font-mono text-[11px] text-muted-foreground">{formatted}</span>
}

export default function LogsPage() {
  const firestore = useFirestore()
  const { user } = useUser()
  const [search, setSearch] = React.useState("")
  const [selectedLog, setSelectedLog] = React.useState<any>(null)
  const [isMetadataOpen, setIsMetadataOpen] = React.useState(false)

  const logsQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null
    return query(collection(firestore, "accessLogs"), orderBy("timestamp", "desc"), limit(50))
  }, [firestore, user])

  const { data: logs, isLoading } = useCollection(logsQuery)

  const filteredLogs = React.useMemo(() => {
    if (!logs) return []
    return logs.filter(log => 
      log.ipAddress?.toLowerCase().includes(search.toLowerCase()) || 
      log.deviceName?.toLowerCase().includes(search.toLowerCase()) ||
      log.apiKeyId?.toLowerCase().includes(search.toLowerCase())
    )
  }, [logs, search])

  const stats = React.useMemo(() => {
    if (!logs) return { total: 0, failed: 0, uniqueIps: 0 }
    const total = logs.length
    const failed = logs.filter(l => l.status !== 'success').length
    const uniqueIps = new Set(logs.map(l => l.ipAddress)).size
    return { total, failed, uniqueIps }
  }, [logs])

  return (
    <div className="space-y-8 animate-in slide-in-from-bottom-2 duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight text-foreground font-headline">Access Logs</h1>
          <p className="text-muted-foreground">Comprehensive audit trail of all authentication attempts.</p>
        </div>
        <div className="flex items-center gap-2">
           <Button variant="outline" className="gap-2 border-border/50 bg-card hover:bg-muted text-xs h-9">
            <Download className="h-4 w-4" /> Export Audit
          </Button>
          <Button variant="outline" className="gap-2 border-border/50 bg-card hover:bg-muted text-xs h-9">
            <Calendar className="h-4 w-4" /> All Time
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-4">
        <Card className="bg-card border-border/50 shadow-sm">
          <CardHeader className="p-4 pb-0">
            <CardTitle className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Total Events</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-2">
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border/50 shadow-sm">
          <CardHeader className="p-4 pb-0">
            <CardTitle className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Access Denied</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-2">
            <div className="text-2xl font-bold text-red-400">{stats.failed}</div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border/50 shadow-sm">
          <CardHeader className="p-4 pb-0">
            <CardTitle className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Source IPs</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-2">
            <div className="text-2xl font-bold text-accent">{stats.uniqueIps}</div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border/50 shadow-sm">
          <CardHeader className="p-4 pb-0">
            <CardTitle className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">System Load</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-2">
            <div className="text-2xl font-bold">NOMINAL</div>
          </CardContent>
        </Card>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search by IP, Client Name, or License ID..." 
            className="pl-10 h-10 bg-card border-border/50" 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Button variant="outline" size="icon" className="h-10 w-10 bg-card border-border/50">
          <Filter className="h-4 w-4" />
        </Button>
      </div>

      <div className="rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden shadow-sm">
        <Table>
          <TableHeader className="bg-muted/30">
            <TableRow>
              <TableHead className="w-[180px]">Timestamp</TableHead>
              <TableHead>Client Identity</TableHead>
              <TableHead>Source Context</TableHead>
              <TableHead>Auth Status</TableHead>
              <TableHead>Security</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="h-48 text-center">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <span className="text-sm text-muted-foreground uppercase tracking-widest font-bold">Retrieving Audit Trail...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : filteredLogs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-48 text-center text-muted-foreground italic">
                  No access records found in current filtered view.
                </TableCell>
              </TableRow>
            ) : (
              filteredLogs.map((log) => (
                <TableRow key={log.id} className="hover:bg-primary/5 transition-colors group">
                  <TableCell>
                    <FormattedTime timestamp={log.timestamp} />
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-semibold text-sm">{log.deviceName || "Unknown PC"}</span>
                      <span className="text-[10px] text-muted-foreground font-mono uppercase truncate max-w-[150px]">{log.apiKeyId}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="text-xs font-mono text-primary">{log.ipAddress}</span>
                      <span className="text-[10px] text-muted-foreground uppercase">Method: {log.eventType?.replace('_', ' ')}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {log.status === 'success' ? (
                      <Badge variant="outline" className="bg-green-500/10 text-green-400 border-green-500/20 px-2 py-0 text-[10px] font-bold">AUTHORIZED</Badge>
                    ) : (
                      <Badge variant="outline" className="bg-red-500/10 text-red-400 border-red-500/20 px-2 py-0 text-[10px] font-bold">DENIED</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    {log.status === 'success' ? (
                      <div className="flex items-center gap-1.5 text-accent">
                        <ShieldCheck className="h-3.5 w-3.5" />
                        <span className="text-[10px] font-bold uppercase">Verified HWID</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 text-red-400">
                        <ShieldAlert className="h-3.5 w-3.5" />
                        <span className="text-[10px] font-bold uppercase">Auth Breach</span>
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-8 px-2 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => {
                        setSelectedLog(log)
                        setIsMetadataOpen(true)
                      }}
                    >
                      <Info className="h-3.5 w-3.5 mr-1" /> Metadata
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Metadata Dialog */}
      <Dialog open={isMetadataOpen} onOpenChange={setIsMetadataOpen}>
        <DialogContent className="max-w-[95vw] h-[95vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle className="text-2xl font-bold">Access Log Metadata</DialogTitle>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsMetadataOpen(false)}
                className="h-8 w-8"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </DialogHeader>

          {selectedLog && (
            <div className="space-y-6 mt-4">
              {/* Basic Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-semibold uppercase text-muted-foreground">Request Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-xs text-muted-foreground">Timestamp</span>
                      <p className="font-mono text-sm">{new Date(selectedLog.timestamp).toLocaleString()}</p>
                    </div>
                    <div>
                      <span className="text-xs text-muted-foreground">Event Type</span>
                      <p className="font-mono text-sm capitalize">{selectedLog.eventType?.replace('_', ' ')}</p>
                    </div>
                    <div>
                      <span className="text-xs text-muted-foreground">Status</span>
                      <Badge variant={selectedLog.status === 'success' ? 'default' : 'destructive'} className="mt-1">
                        {selectedLog.status?.toUpperCase()}
                      </Badge>
                    </div>
                    <div>
                      <span className="text-xs text-muted-foreground">Access Mode</span>
                      <p className="font-mono text-sm">{selectedLog.webBased ? 'Web-Based' : 'Hardware-Based'}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* License & Device Binding */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-semibold uppercase text-muted-foreground">License & Device Binding</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-xs text-muted-foreground">API Key ID</span>
                      <p className="font-mono text-sm break-all">{selectedLog.apiKeyId}</p>
                    </div>
                    <div>
                      <span className="text-xs text-muted-foreground">Device Name</span>
                      <p className="font-mono text-sm">{selectedLog.deviceName || 'Unknown'}</p>
                    </div>
                    <div className="col-span-2">
                      <span className="text-xs text-muted-foreground">Hardware ID / Session Identifier</span>
                      <p className="font-mono text-xs break-all bg-muted p-2 rounded mt-1">{selectedLog.hwid}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Network Context */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-semibold uppercase text-muted-foreground">Network Context</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-xs text-muted-foreground">Source IP Address</span>
                      <p className="font-mono text-sm">{selectedLog.ipAddress}</p>
                    </div>
                    {selectedLog.deviceInfo?.macAddress && (
                      <div>
                        <span className="text-xs text-muted-foreground">MAC Address</span>
                        <p className="font-mono text-sm">{selectedLog.deviceInfo.macAddress}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Device Information - Only show if deviceInfo exists */}
              {selectedLog.deviceInfo && Object.keys(selectedLog.deviceInfo).length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm font-semibold uppercase text-muted-foreground">Device Hardware & System</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-2 gap-4">
                      {selectedLog.deviceInfo.os && (
                        <div>
                          <span className="text-xs text-muted-foreground">Operating System</span>
                          <p className="font-mono text-sm">{selectedLog.deviceInfo.os}</p>
                        </div>
                      )}
                      {selectedLog.deviceInfo.osVersion && (
                        <div>
                          <span className="text-xs text-muted-foreground">OS Version</span>
                          <p className="font-mono text-sm">{selectedLog.deviceInfo.osVersion}</p>
                        </div>
                      )}
                      {selectedLog.deviceInfo.osRelease && (
                        <div>
                          <span className="text-xs text-muted-foreground">OS Release</span>
                          <p className="font-mono text-sm">{selectedLog.deviceInfo.osRelease}</p>
                        </div>
                      )}
                      {selectedLog.deviceInfo.hostname && (
                        <div>
                          <span className="text-xs text-muted-foreground">Hostname</span>
                          <p className="font-mono text-sm">{selectedLog.deviceInfo.hostname}</p>
                        </div>
                      )}
                      {selectedLog.deviceInfo.architecture && (
                        <div>
                          <span className="text-xs text-muted-foreground">Architecture</span>
                          <p className="font-mono text-sm">{selectedLog.deviceInfo.architecture}</p>
                        </div>
                      )}
                      {selectedLog.deviceInfo.processor && (
                        <div>
                          <span className="text-xs text-muted-foreground">Processor</span>
                          <p className="font-mono text-sm">{selectedLog.deviceInfo.processor}</p>
                        </div>
                      )}
                      {selectedLog.deviceInfo.cpuCores && (
                        <div>
                          <span className="text-xs text-muted-foreground">CPU Cores</span>
                          <p className="font-mono text-sm">{selectedLog.deviceInfo.cpuCores}</p>
                        </div>
                      )}
                      {selectedLog.deviceInfo.ram && (
                        <div>
                          <span className="text-xs text-muted-foreground">RAM</span>
                          <p className="font-mono text-sm">{selectedLog.deviceInfo.ram}</p>
                        </div>
                      )}
                      {selectedLog.deviceInfo.gpu && (
                        <div>
                          <span className="text-xs text-muted-foreground">GPU</span>
                          <p className="font-mono text-sm">{selectedLog.deviceInfo.gpu}</p>
                        </div>
                      )}
                      {selectedLog.deviceInfo.diskSize && (
                        <div>
                          <span className="text-xs text-muted-foreground">Disk Size</span>
                          <p className="font-mono text-sm">{selectedLog.deviceInfo.diskSize}</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Raw JSON for debugging */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-semibold uppercase text-muted-foreground">Raw JSON Data</CardTitle>
                </CardHeader>
                <CardContent>
                  <pre className="text-xs font-mono bg-muted p-4 rounded overflow-auto max-h-96">
                    {JSON.stringify(selectedLog, null, 2)}
                  </pre>
                </CardContent>
              </Card>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
