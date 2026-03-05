
"use client"

import * as React from "react"
import { Key, Users, Activity, ShieldCheck, Globe, Monitor, ShieldAlert, Loader2, ArrowUpRight } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { 
  useFirestore, 
  useCollection, 
  useUser, 
  useMemoFirebase 
} from "@/firebase"
import { collection, query, orderBy, limit } from "firebase/firestore"

// Helper for relative time (simple version for prototype)
const TimeAgo = ({ timestamp }: { timestamp: string }) => {
  const [text, setText] = React.useState("...")
  React.useEffect(() => {
    const update = () => {
      const now = new Date()
      const past = new Date(timestamp)
      const diff = now.getTime() - past.getTime()
      const minutes = Math.floor(diff / 60000)
      if (minutes < 1) setText("Just now")
      else if (minutes < 60) setText(`${minutes}m ago`)
      else if (minutes < 1440) setText(`${Math.floor(minutes/60)}h ago`)
      else setText(past.toLocaleDateString())
    }
    update()
    const interval = setInterval(update, 60000)
    return () => clearInterval(interval)
  }, [timestamp])
  return <span className="text-[10px] font-mono text-accent uppercase">{text}</span>
}

export default function OverviewPage() {
  const firestore = useFirestore()
  const { user } = useUser()

  // Queries
  const keysQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null
    return query(collection(firestore, "apiKeys"))
  }, [firestore, user])

  const logsQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null
    return query(collection(firestore, "accessLogs"), orderBy("timestamp", "desc"), limit(6))
  }, [firestore, user])

  const { data: keys, isLoading: keysLoading } = useCollection(keysQuery)
  const { data: logs, isLoading: logsLoading } = useCollection(logsQuery)

  const stats = React.useMemo(() => {
    const active = keys?.filter(k => k.isActive).length || 0
    const total = keys?.length || 0
    const uniqueHwids = new Set(keys?.filter(k => k.hwid).map(k => k.hwid)).size
    const recentLogs = logs?.length || 0
    
    return { active, total, uniqueHwids, recentLogs }
  }, [keys, logs])

  if (keysLoading || logsLoading) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-muted-foreground animate-pulse">Synchronizing Security Nodes...</p>
      </div>
    )
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight text-foreground font-headline">System Overview</h1>
        <p className="text-muted-foreground text-lg">Real-time health and security metrics for your authentication network.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-card border-border/50 hover:border-primary/50 transition-colors shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Active Licenses</CardTitle>
            <Key className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.active}</div>
            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
              <ShieldCheck className="h-3 w-3 text-accent" /> of {stats.total} issued keys
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border/50 hover:border-primary/50 transition-colors shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Unique Devices</CardTitle>
            <Users className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.uniqueHwids}</div>
            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
              <Globe className="h-3 w-3 text-accent" /> Bound HWID fingerprints
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border/50 hover:border-primary/50 transition-colors shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Recent Activity</CardTitle>
            <Activity className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.recentLogs}</div>
            <div className="mt-4 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Traffic Load</span>
                <span className="text-primary font-semibold">{stats.total > 0 ? Math.min(100, Math.round((stats.active / stats.total) * 100)) : 0}%</span>
              </div>
              <Progress value={stats.total > 0 ? (stats.active / stats.total) * 100 : 0} className="h-1 bg-muted" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border/50 hover:border-primary/50 transition-colors shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">System Status</CardTitle>
            <ShieldAlert className="h-5 w-5 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-accent">SECURE</div>
            <p className="text-xs text-muted-foreground mt-1">AI-Threat detection active</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2 border-border/50 bg-card/50 shadow-sm overflow-hidden">
          <CardHeader className="border-b border-border/30 bg-muted/10">
            <CardTitle className="text-lg">Recent Authentication Logs</CardTitle>
            <CardDescription>Live feed of access attempts across the network.</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-border/30">
              {logs && logs.length > 0 ? (
                logs.map((log) => (
                  <div key={log.id} className="flex items-center justify-between p-4 hover:bg-primary/5 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="bg-primary/10 p-2 rounded-lg border border-primary/20">
                        <Monitor className="h-5 w-5 text-primary" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold truncate">
                          {log.deviceName || "Unknown Device"} 
                          <span className="text-muted-foreground font-mono font-normal ml-2 text-xs">[{log.ipAddress}]</span>
                        </p>
                        <p className="text-xs text-muted-foreground uppercase tracking-tight">Event: {log.eventType?.replace('_', ' ')}</p>
                      </div>
                    </div>
                    <div className="text-right flex flex-col items-end gap-1">
                      <TimeAgo timestamp={log.timestamp} />
                      <span className={`text-[10px] border px-1.5 py-0.5 rounded font-bold ${log.status === 'success' ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'}`}>
                        {log.status?.toUpperCase() || "UNKNOWN"}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-12 text-center text-muted-foreground italic">
                  No authentication logs found in database.
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-card/50 shadow-sm">
          <CardHeader>
            <CardTitle>System Policies</CardTitle>
            <CardDescription>Global enforcement settings.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border/20">
              <div className="space-y-0.5">
                <p className="text-sm font-semibold">HWID Lock</p>
                <p className="text-[10px] text-muted-foreground uppercase">Keys restricted to original PC</p>
              </div>
              <div className="h-2 w-2 rounded-full bg-accent animate-pulse" />
            </div>
            
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border/20">
              <div className="space-y-0.5">
                <p className="text-sm font-semibold">API Integrity</p>
                <p className="text-[10px] text-muted-foreground uppercase">SHA-256 Request Validation</p>
              </div>
              <div className="h-2 w-2 rounded-full bg-accent animate-pulse" />
            </div>

            <div className="pt-4 border-t border-border/50">
              <p className="text-xs font-semibold text-muted-foreground uppercase mb-4 tracking-widest">Network Distribution</p>
              <div className="space-y-5">
                <div className="space-y-1.5">
                  <div className="flex justify-between text-[11px] font-bold uppercase">
                    <span className="flex items-center gap-1.5"><Monitor className="h-3 w-3" /> Windows Clients</span>
                    <span className="text-primary">84%</span>
                  </div>
                  <Progress value={84} className="h-1 bg-muted" />
                </div>
                <div className="space-y-1.5">
                  <div className="flex justify-between text-[11px] font-bold uppercase">
                    <span className="flex items-center gap-1.5"><Activity className="h-3 w-3" /> API Calls</span>
                    <span className="text-primary">12%</span>
                  </div>
                  <Progress value={12} className="h-1 bg-muted" />
                </div>
              </div>
            </div>
            
            <div className="pt-4 mt-2">
              <div className="rounded-xl bg-primary/5 border border-primary/10 p-4 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase text-primary">Service Status</span>
                  <span className="text-[10px] font-mono text-green-400">OPERATIONAL</span>
                </div>
                <p className="text-[10px] text-muted-foreground leading-relaxed">
                  All global edge nodes are reporting optimal latency. HWID verification service is running at 100% capacity.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
