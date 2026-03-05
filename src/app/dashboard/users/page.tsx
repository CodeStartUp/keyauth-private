"use client"

import * as React from "react"
import { 
  Users, 
  UserPlus, 
  Search, 
  Shield, 
  ShieldCheck, 
  MoreVertical, 
  Mail, 
  Calendar,
  Trash2,
  Loader2,
  UserCog
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/hooks/use-toast"
import { 
  useFirestore, 
  useCollection, 
  useUser, 
  useMemoFirebase,
  deleteDocumentNonBlocking,
  updateDocumentNonBlocking
} from "@/firebase"
import { collection, query, orderBy, doc } from "firebase/firestore"

const FormattedDate = ({ dateString }: { dateString?: string | null }) => {
  const [formatted, setFormatted] = React.useState<string>("...")
  React.useEffect(() => {
    if (dateString) {
      setFormatted(new Date(dateString).toLocaleDateString())
    } else {
      setFormatted("Unknown")
    }
  }, [dateString])
  return <span>{formatted}</span>
}

export default function UsersPage() {
  const firestore = useFirestore()
  const { user: currentUser } = useUser()
  const [search, setSearch] = React.useState("")

  const usersQuery = useMemoFirebase(() => {
    if (!firestore) return null
    return query(collection(firestore, "users"), orderBy("createdAt", "desc"))
  }, [firestore])

  const { data: users, isLoading } = useCollection(usersQuery)

  const filteredUsers = React.useMemo(() => {
    if (!users) return []
    return users.filter(u => 
      u.username?.toLowerCase().includes(search.toLowerCase()) || 
      u.email?.toLowerCase().includes(search.toLowerCase())
    )
  }, [users, search])

  const handleDeleteUser = (id: string) => {
    if (!firestore || id === currentUser?.uid) {
      toast({
        variant: "destructive",
        title: "Action Denied",
        description: "You cannot delete your own administrative account.",
      })
      return
    }
    const docRef = doc(firestore, "users", id)
    deleteDocumentNonBlocking(docRef)
    toast({
      title: "User Removed",
      description: "Administrative access has been revoked.",
    })
  }

  const handleUpdateRole = (id: string, newRole: string) => {
    if (!firestore) return
    const docRef = doc(firestore, "users", id)
    updateDocumentNonBlocking(docRef, { role: newRole })
    toast({
      title: "Role Updated",
      description: `User is now assigned as ${newRole}.`,
    })
  }

  return (
    <div className="space-y-8 animate-in slide-in-from-bottom-2 duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight text-foreground font-headline">Team Access</h1>
          <p className="text-muted-foreground">Manage administrative personnel and system permissions.</p>
        </div>
        <Button className="h-11 px-6 shadow-lg shadow-primary/20 bg-primary hover:bg-primary/90">
          <UserPlus className="mr-2 h-5 w-5" /> Invite Member
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
        <Input 
          placeholder="Search by name or email..." 
          className="pl-10 h-11 bg-card border-border/50"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden shadow-sm">
        <Table>
          <TableHeader className="bg-muted/30">
            <TableRow>
              <TableHead>Administrator</TableHead>
              <TableHead>Email Address</TableHead>
              <TableHead>System Role</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="h-32 text-center">
                  <div className="flex flex-col items-center gap-2">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                    <span className="text-muted-foreground">Synchronizing identity nodes...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : filteredUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
                  No administrative users found.
                </TableCell>
              </TableRow>
            ) : (
              filteredUsers.map((u) => (
                <TableRow key={u.id} className="group hover:bg-primary/5 transition-colors">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20">
                        <UserCog className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-semibold">{u.username}</span>
                        {u.id === currentUser?.uid && (
                          <span className="text-[10px] text-accent font-bold uppercase tracking-widest">Active Session</span>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Mail className="h-4 w-4" />
                      {u.email}
                    </div>
                  </TableCell>
                  <TableCell>
                    {u.role === 'admin' ? (
                      <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 rounded-full flex items-center gap-1.5 w-fit">
                        <ShieldCheck className="h-3 w-3" /> Root Admin
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="bg-muted text-muted-foreground border-border rounded-full flex items-center gap-1.5 w-fit">
                        <Shield className="h-3 w-3" /> Viewer
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Calendar className="h-3.5 w-3.5" />
                      <FormattedDate dateString={u.createdAt} />
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Edit Permissions</DialogTitle>
                          <DialogDescription>
                            Adjust access levels for {u.username}.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                          <div className="grid gap-2">
                            <Label>Access Role</Label>
                            <Select 
                              defaultValue={u.role} 
                              onValueChange={(val) => handleUpdateRole(u.id, val)}
                              disabled={u.id === currentUser?.uid}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select role" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="admin">Root Administrator</SelectItem>
                                <SelectItem value="viewer">Audit Viewer</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <DialogFooter className="flex justify-between sm:justify-between items-center w-full">
                          <Button 
                            variant="destructive" 
                            size="sm"
                            disabled={u.id === currentUser?.uid}
                            onClick={() => handleDeleteUser(u.id)}
                          >
                            <Trash2 className="h-4 w-4 mr-2" /> Revoke Access
                          </Button>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm">Close</Button>
                          </DialogTrigger>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
