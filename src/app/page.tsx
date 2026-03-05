
"use client"

import * as React from "react"
import { Shield, Lock, Monitor, AlertCircle, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { LanguageSelector } from "@/components/language-selector"
import { useRouter } from "next/navigation"
import { useAuth, initializeFirebase } from "@/firebase"
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth"
import { doc, setDoc } from "firebase/firestore"

/**
 * Obfuscated credentials for source-level privacy.
 * identity: "iamroot" -> "iamroot@keyguard.io"
 * signature: "iloverkernelexploit"
 */
const _u = "aWFtcm9vdEBrZXlndWFyZC5pbw==";
const _p = "aWxvdmVya2VybmVsZXhwbG9pdA==";

export default function LoginPage() {
  const [username, setUsername] = React.useState("iamroot")
  const [password, setPassword] = React.useState("")
  const [isLoading, setIsLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  
  const router = useRouter()
  const auth = useAuth()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const vaultEmail = window.atob(_u)
      const vaultPass = window.atob(_p)
      const loginIdentity = username === "iamroot" ? vaultEmail : username

      try {
        // 1. Attempt standard login
        const userCredential = await signInWithEmailAndPassword(auth, loginIdentity, password)
        const user = userCredential.user
        
        // Ensure root user has the admin profile document for security rules
        if (loginIdentity === vaultEmail) {
          const { firestore } = initializeFirebase()
          const userRef = doc(firestore, "users", user.uid)
          // CRITICAL: We await this to ensure the record exists before we try to list keys
          await setDoc(userRef, {
            id: user.uid,
            username: "iamroot",
            email: vaultEmail,
            role: "admin",
            createdAt: new Date().toISOString()
          }, { merge: true })
        }
        
        router.push('/dashboard')
      } catch (signInErr: any) {
        // 2. Auto-provision root identity if not found
        if (
          (signInErr.code === 'auth/user-not-found' || signInErr.code === 'auth/invalid-credential') &&
          loginIdentity === vaultEmail &&
          password === vaultPass
        ) {
          const userCredential = await createUserWithEmailAndPassword(auth, vaultEmail, vaultPass)
          const user = userCredential.user
          
          const { firestore } = initializeFirebase()
          const userRef = doc(firestore, "users", user.uid)
          // Create the admin user profile document immediately
          await setDoc(userRef, {
            id: user.uid,
            username: "iamroot",
            email: vaultEmail,
            role: "admin",
            createdAt: new Date().toISOString()
          })
          
          router.push('/dashboard')
        } else {
          throw signInErr
        }
      }
    } catch (err: any) {
      console.error("Auth Error:", err)
      setError("Security clearance denied. Verify identity and signature.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-background to-background">
      <div className="absolute top-4 right-4 sm:top-8 sm:right-8">
        <LanguageSelector />
      </div>

      <div className="w-full max-w-md space-y-8 animate-in fade-in zoom-in duration-500">
        <div className="flex flex-col items-center space-y-2 text-center">
          <div className="rounded-full bg-primary/20 p-4 mb-4 shadow-[0_0_20px_rgba(var(--primary),0.3)]">
            <Shield className="h-10 w-10 text-primary" />
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-foreground font-headline">KeyGuard</h1>
          <p className="text-muted-foreground font-medium uppercase tracking-widest text-xs">Internal Security Portal</p>
        </div>

        <div className="rounded-lg border border-border/50 bg-card/50 text-card-foreground shadow-2xl backdrop-blur-sm overflow-hidden">
          <div className="p-6 space-y-1 bg-muted/20 border-b border-border/50">
            <h2 className="text-xl font-bold">Authorized Access Only</h2>
            <p className="text-xs text-muted-foreground">
              End-to-end transport encryption active. Node identity required.
            </p>
          </div>
          <form onSubmit={handleLogin}>
            <div className="p-6 pt-6 grid gap-4">
              {error && (
                <Alert variant="destructive" className="animate-in slide-in-from-top-2 border-destructive/20 bg-destructive/10">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Security Alert</AlertTitle>
                  <AlertDescription className="text-xs">
                    {error}
                  </AlertDescription>
                </Alert>
              )}
              <div className="grid gap-2">
                <Label htmlFor="username">Identity Node</Label>
                <div className="relative">
                  <Input 
                    id="username" 
                    type="text" 
                    placeholder="Enter root identity" 
                    className="pl-10 bg-background/50 h-11 border-border/50 focus:border-primary/50" 
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required 
                  />
                  <Monitor className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password">Security Signature</Label>
                <div className="relative">
                  <Input 
                    id="password" 
                    type="password" 
                    placeholder="••••••••••••••••"
                    className="pl-10 bg-background/50 h-11 border-border/50 focus:border-primary/50" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required 
                  />
                  <Lock className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
                </div>
              </div>
            </div>
            <div className="p-6 pt-0 flex flex-col gap-4">
              <Button type="submit" className="w-full h-12 text-base font-semibold shadow-lg shadow-primary/20 bg-primary hover:bg-primary/90 text-primary-foreground" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Verifying Integrity...
                  </>
                ) : "Access System Dashboard"}
              </Button>
              <div className="text-center text-[10px] text-muted-foreground uppercase tracking-widest opacity-40">
                AES-256 Transport • RSA-4096 Signature
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
