"use client"

import * as React from "react"
import { Code2, Copy, Check, Terminal, FileCode, Globe, Smartphone, Server, Info } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

const API_ENDPOINT = "http://localhost:9002/api/keys/verify"

const CodeBlock = ({ code, language }: { code: string; language: string }) => {
  const [copied, setCopied] = React.useState(false)

  const copyToClipboard = () => {
    navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="relative">
      <div className="absolute top-3 right-3 flex items-center gap-2">
        <Badge variant="secondary" className="text-xs font-mono">{language}</Badge>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={copyToClipboard}
        >
          {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
        </Button>
      </div>
      <pre className="bg-muted/50 p-4 rounded-lg overflow-x-auto border border-border/50">
        <code className="text-sm font-mono text-foreground">{code}</code>
      </pre>
    </div>
  )
}

export default function IntegratePage() {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight text-foreground font-headline">Integration Guide</h1>
        <p className="text-muted-foreground text-lg">
          Complete implementation examples for all platforms and programming languages.
        </p>
      </div>

      <Alert className="border-primary/50 bg-primary/5">
        <Code2 className="h-4 w-4" />
        <AlertTitle>API Endpoint</AlertTitle>
        <AlertDescription className="font-mono text-sm mt-2">
          POST {API_ENDPOINT}
        </AlertDescription>
      </Alert>

      <Tabs defaultValue="python" className="w-full">
        <TabsList className="grid w-full grid-cols-4 lg:grid-cols-12 h-auto gap-2 bg-transparent">
          <TabsTrigger value="python" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <FileCode className="h-4 w-4 mr-2" /> Python
          </TabsTrigger>
          <TabsTrigger value="nodejs" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Server className="h-4 w-4 mr-2" /> Node.js
          </TabsTrigger>
          <TabsTrigger value="csharp" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Code2 className="h-4 w-4 mr-2" /> C#
          </TabsTrigger>
          <TabsTrigger value="cpp" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Code2 className="h-4 w-4 mr-2" /> C++
          </TabsTrigger>
          <TabsTrigger value="rust" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Code2 className="h-4 w-4 mr-2" /> Rust
          </TabsTrigger>
          <TabsTrigger value="java" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <FileCode className="h-4 w-4 mr-2" /> Java
          </TabsTrigger>
          <TabsTrigger value="php" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Globe className="h-4 w-4 mr-2" /> PHP
          </TabsTrigger>
          <TabsTrigger value="go" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Server className="h-4 w-4 mr-2" /> Go
          </TabsTrigger>
          <TabsTrigger value="lua" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Code2 className="h-4 w-4 mr-2" /> Lua
          </TabsTrigger>
          <TabsTrigger value="html" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Globe className="h-4 w-4 mr-2" /> HTML
          </TabsTrigger>
          <TabsTrigger value="curl" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Terminal className="h-4 w-4 mr-2" /> cURL
          </TabsTrigger>
          <TabsTrigger value="powershell" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Terminal className="h-4 w-4 mr-2" /> PowerShell
          </TabsTrigger>
        </TabsList>

        {/* Python */}
        <TabsContent value="python" className="space-y-4 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileCode className="h-5 w-5 text-primary" />
                Python Implementation
              </CardTitle>
              <CardDescription>Using requests library for API key verification</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="text-sm font-semibold mb-3">Installation</h3>
                <CodeBlock 
                  language="bash"
                  code={`pip install requests`}
                />
              </div>
              <Alert className="border-primary/50 bg-primary/5">
                <Info className="h-4 w-4" />
                <AlertTitle>Stable Hardware Identification</AlertTitle>
                <AlertDescription className="text-sm mt-2">
                  Our HWID uses <strong>CPU, Disk Serial, and GPU</strong> - NOT MAC address or IP address which can change easily. This ensures licenses stay bound even if you change network adapters or WiFi.
                </AlertDescription>
              </Alert>
              <div>
                <h3 className="text-sm font-semibold mb-3">Basic Usage</h3>
                <CodeBlock 
                  language="python"
                  code={`import requests
import subprocess
import platform

def get_hwid():
    """Get unique hardware identifier based on stable hardware (CPU, Disk, GPU) - not MAC/IP"""
    import hashlib
    
    hardware_data = []
    
    if platform.system() == "Windows":
        try:
            # Primary: Motherboard UUID (most stable)
            cmd = "wmic csproduct get uuid"
            output = subprocess.check_output(cmd, shell=True).decode().split('\\\\n')[1].strip()
            if output and output != "FFFFFFFF-FFFF-FFFF-FFFF-FFFFFFFFFFFF":
                return output
        except:
            pass
        
        try:
            # Fallback 1: Registry MachineGuid
            import winreg
            key = winreg.OpenKey(winreg.HKEY_LOCAL_MACHINE, 
                                 r"SOFTWARE\\\\Microsoft\\\\Cryptography")
            guid = winreg.QueryValueEx(key, "MachineGuid")[0]
            return guid
        except:
            pass
        
        # Fallback 2: Combine CPU + Disk + GPU (stable hardware)
        try:
            cmd = "wmic cpu get processorid"
            cpu_id = subprocess.check_output(cmd, shell=True).decode().split('\\\\n')[1].strip()
            if cpu_id:
                hardware_data.append(f"CPU:{cpu_id}")
        except:
            pass
        
        try:
            cmd = "wmic diskdrive get serialnumber"
            output = subprocess.check_output(cmd, shell=True).decode()
            serials = [line.strip() for line in output.split('\\\\n')[1:] if line.strip()]
            if serials:
                hardware_data.append(f"DISK:{serials[0]}")
        except:
            pass
        
        if hardware_data:
            combined = "|".join(hardware_data)
            return hashlib.sha256(combined.encode()).hexdigest()[:32].upper()
        
        return hashlib.sha256(platform.node().encode()).hexdigest()[:32].upper()
        
    else:
        # Linux/Mac - use machine-id (very stable)
        try:
            with open('/etc/machine-id', 'r') as f:
                return f.read().strip()
        except:
            try:
                with open('/var/lib/dbus/machine-id', 'r') as f:
                    return f.read().strip()
            except:
                pass
        
        # macOS - IOPlatformUUID
        if platform.system() == "Darwin":
            try:
                cmd = "ioreg -rd1 -c IOPlatformExpertDevice | grep IOPlatformUUID"
                output = subprocess.check_output(cmd, shell=True).decode()
                return output.split('"')[3]
            except:
                pass
        
        return hashlib.sha256(platform.node().encode()).hexdigest()[:32].upper()

def verify_license(api_key):
    """Verify API key and bind to hardware"""
    url = "${API_ENDPOINT}"
    
    payload = {
        "keyValue": api_key,
        "hwid": get_hwid(),
        "deviceName": platform.node()
    }
    
    try:
        response = requests.post(url, json=payload, timeout=10)
        result = response.json()
        
        if result.get('valid'):
            print(f"[✓] License verified: {result.get('message')}")
            return True
        else:
            print(f"[✗] License invalid: {result.get('message')}")
            if result.get('debug'):
                print(f"[!] Troubleshooting: {result.get('debug')}")
            return False
            
    except requests.exceptions.RequestException as e:
        print(f"[✗] Connection error: {str(e)}")
        return False

# Usage
if __name__ == "__main__":
    API_KEY = "YOUR_API_KEY_HERE"
    
    if verify_license(API_KEY):
        print("Access granted - Starting application...")
        # Your application code here
    else:
        print("Access denied - Exiting...")
        exit(1)`}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Node.js */}
        <TabsContent value="nodejs" className="space-y-4 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Server className="h-5 w-5 text-primary" />
                Node.js Implementation
              </CardTitle>
              <CardDescription>Using axios for API key verification</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="text-sm font-semibold mb-3">Installation</h3>
                <CodeBlock 
                  language="bash"
                  code={`npm install axios node-machine-id`}
                />
              </div>
              <div>
                <h3 className="text-sm font-semibold mb-3">Implementation</h3>
                <CodeBlock 
                  language="javascript"
                  code={`const axios = require('axios');
const { machineIdSync } = require('node-machine-id');
const os = require('os');

async function verifyLicense(apiKey) {
    const url = '${API_ENDPOINT}';
    
    const payload = {
        keyValue: apiKey,
        hwid: machineIdSync(),
        deviceName: os.hostname()
    };
    
    try {
        const response = await axios.post(url, payload, {
            timeout: 10000,
            headers: { 'Content-Type': 'application/json' }
        });
        
        const result = response.data;
        
        if (result.valid) {
            console.log(\`[✓] License verified: \${result.message}\`);
            return true;
        } else {
            console.log(\`[✗] License invalid: \${result.message}\`);
            if (result.debug) {
                console.log(\`[!] Troubleshooting: \${result.debug}\`);
            }
            return false;
        }
    } catch (error) {
        console.error(\`[✗] Connection error: \${error.message}\`);
        return false;
    }
}

// Usage
const API_KEY = 'YOUR_API_KEY_HERE';

verifyLicense(API_KEY).then(isValid => {
    if (isValid) {
        console.log('Access granted - Starting application...');
        // Your application code here
    } else {
        console.log('Access denied - Exiting...');
        process.exit(1);
    }
});`}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* C# */}
        <TabsContent value="csharp" className="space-y-4 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Code2 className="h-5 w-5 text-primary" />
                C# / .NET Implementation
              </CardTitle>
              <CardDescription>Using HttpClient for API key verification</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="text-sm font-semibold mb-3">Installation</h3>
                <CodeBlock 
                  language="bash"
                  code={`dotnet add package Newtonsoft.Json`}
                />
              </div>
              <div>
                <h3 className="text-sm font-semibold mb-3">Implementation</h3>
                <CodeBlock 
                  language="csharp"
                  code={`using System;
using System.Net.Http;
using System.Text;
using System.Threading.Tasks;
using System.Management;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;

public class LicenseVerifier
{
    private static readonly string API_ENDPOINT = "${API_ENDPOINT}";
    
    public static string GetHWID()
    {
        try
        {
            ManagementObjectSearcher searcher = 
                new ManagementObjectSearcher("SELECT UUID FROM Win32_ComputerSystemProduct");
            
            foreach (ManagementObject obj in searcher.Get())
            {
                return obj["UUID"].ToString();
            }
        }
        catch
        {
            // Fallback to processor ID
            ManagementObjectSearcher cpuSearcher = 
                new ManagementObjectSearcher("SELECT ProcessorId FROM Win32_Processor");
            
            foreach (ManagementObject obj in cpuSearcher.Get())
            {
                return obj["ProcessorId"].ToString();
            }
        }
        return "UNKNOWN";
    }
    
    public static async Task<bool> VerifyLicense(string apiKey)
    {
        using (HttpClient client = new HttpClient())
        {
            client.Timeout = TimeSpan.FromSeconds(10);
            
            var payload = new
            {
                keyValue = apiKey,
                hwid = GetHWID(),
                deviceName = Environment.MachineName
            };
            
            var json = JsonConvert.SerializeObject(payload);
            var content = new StringContent(json, Encoding.UTF8, "application/json");
            
            try
            {
                HttpResponseMessage response = await client.PostAsync(API_ENDPOINT, content);
                string responseBody = await response.Content.ReadAsStringAsync();
                JObject result = JObject.Parse(responseBody);
                
                bool isValid = result["valid"]?.Value<bool>() ?? false;
                
                if (isValid)
                {
                    Console.WriteLine($"[✓] License verified: {result["message"]}");
                    return true;
                }
                else
                {
                    Console.WriteLine($"[✗] License invalid: {result["message"]}");
                    if (result["debug"] != null)
                    {
                        Console.WriteLine($"[!] Troubleshooting: {result["debug"]}");
                    }
                    return false;
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[✗] Connection error: {ex.Message}");
                return false;
            }
        }
    }
    
    public static async Task Main(string[] args)
    {
        string apiKey = "YOUR_API_KEY_HERE";
        
        if (await VerifyLicense(apiKey))
        {
            Console.WriteLine("Access granted - Starting application...");
            // Your application code here
        }
        else
        {
            Console.WriteLine("Access denied - Exiting...");
            Environment.Exit(1);
        }
    }
}`}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Java */}
        <TabsContent value="java" className="space-y-4 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileCode className="h-5 w-5 text-primary" />
                Java Implementation
              </CardTitle>
              <CardDescription>Using HttpClient for API key verification</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="text-sm font-semibold mb-3">Maven Dependency</h3>
                <CodeBlock 
                  language="xml"
                  code={`<dependency>
    <groupId>com.google.code.gson</groupId>
    <artifactId>gson</artifactId>
    <version>2.10.1</version>
</dependency>`}
                />
              </div>
              <div>
                <h3 className="text-sm font-semibold mb-3">Implementation</h3>
                <CodeBlock 
                  language="java"
                  code={`import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.io.BufferedReader;
import java.io.InputStreamReader;
import com.google.gson.Gson;
import com.google.gson.JsonObject;

public class LicenseVerifier {
    private static final String API_ENDPOINT = "${API_ENDPOINT}";
    
    public static String getHWID() {
        try {
            String os = System.getProperty("os.name").toLowerCase();
            Process process;
            
            if (os.contains("win")) {
                process = Runtime.getRuntime().exec("wmic csproduct get uuid");
            } else {
                process = Runtime.getRuntime().exec("cat /etc/machine-id");
            }
            
            BufferedReader reader = new BufferedReader(
                new InputStreamReader(process.getInputStream())
            );
            
            String line;
            StringBuilder output = new StringBuilder();
            while ((line = reader.readLine()) != null) {
                output.append(line.trim());
            }
            
            return output.toString().replaceAll("UUID", "").trim();
        } catch (Exception e) {
            return "UNKNOWN";
        }
    }
    
    public static boolean verifyLicense(String apiKey) {
        try {
            HttpClient client = HttpClient.newHttpClient();
            Gson gson = new Gson();
            
            JsonObject payload = new JsonObject();
            payload.addProperty("keyValue", apiKey);
            payload.addProperty("hwid", getHWID());
            payload.addProperty("deviceName", 
                java.net.InetAddress.getLocalHost().getHostName());
            
            HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(API_ENDPOINT))
                .header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(gson.toJson(payload)))
                .build();
            
            HttpResponse<String> response = client.send(
                request, 
                HttpResponse.BodyHandlers.ofString()
            );
            
            JsonObject result = gson.fromJson(response.body(), JsonObject.class);
            boolean isValid = result.get("valid").getAsBoolean();
            
            if (isValid) {
                System.out.println("[✓] License verified: " + 
                    result.get("message").getAsString());
                return true;
            } else {
                System.out.println("[✗] License invalid: " + 
                    result.get("message").getAsString());
                if (result.has("debug")) {
                    System.out.println("[!] Troubleshooting: " + 
                        result.get("debug").getAsString());
                }
                return false;
            }
        } catch (Exception e) {
            System.out.println("[✗] Connection error: " + e.getMessage());
            return false;
        }
    }
    
    public static void main(String[] args) {
        String apiKey = "YOUR_API_KEY_HERE";
        
        if (verifyLicense(apiKey)) {
            System.out.println("Access granted - Starting application...");
            // Your application code here
        } else {
            System.out.println("Access denied - Exiting...");
            System.exit(1);
        }
    }
}`}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* PHP */}
        <TabsContent value="php" className="space-y-4 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5 text-primary" />
                PHP Implementation
              </CardTitle>
              <CardDescription>Using cURL for API key verification</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert className="border-primary/50 bg-primary/5">
                <Info className="h-4 w-4" />
                <AlertTitle>Tip for PHP/Web Apps</AlertTitle>
                <AlertDescription className="text-sm mt-2">
                  Enable "Web-Based Access" on your license to skip hardware binding. The API will track by IP address instead, perfect for shared hosting or cloud environments.
                </AlertDescription>
              </Alert>
              <div>
                <h3 className="text-sm font-semibold mb-3">Implementation</h3>
                <CodeBlock 
                  language="php"
                  code={`<?php

function getHWID() {
    if (strtoupper(substr(PHP_OS, 0, 3)) === 'WIN') {
        // Windows
        $output = shell_exec('wmic csproduct get uuid');
        $lines = explode("\\n", trim($output));
        return trim($lines[1]);
    } else {
        // Linux
        return trim(file_get_contents('/etc/machine-id'));
    }
}

function verifyLicense($apiKey) {
    $url = '${API_ENDPOINT}';
    
    $payload = json_encode([
        'keyValue' => $apiKey,
        'hwid' => getHWID(),
        'deviceName' => gethostname()
    ]);
    
    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, $payload);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_TIMEOUT, 10);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Content-Type: application/json',
        'Content-Length: ' . strlen($payload)
    ]);
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    
    if (curl_errno($ch)) {
        echo "[✗] Connection error: " . curl_error($ch) . "\\n";
        curl_close($ch);
        return false;
    }
    
    curl_close($ch);
    
    $result = json_decode($response, true);
    
    if ($result['valid']) {
        echo "[✓] License verified: " . $result['message'] . "\\n";
        return true;
    } else {
        echo "[✗] License invalid: " . $result['message'] . "\\n";
        if (isset($result['debug'])) {
            echo "[!] Troubleshooting: " . $result['debug'] . "\\n";
        }
        return false;
    }
}

// Usage
$apiKey = 'YOUR_API_KEY_HERE';

if (verifyLicense($apiKey)) {
    echo "Access granted - Starting application...\\n";
    // Your application code here
} else {
    echo "Access denied - Exiting...\\n";
    exit(1);
}

?>`}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Go */}
        <TabsContent value="go" className="space-y-4 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Server className="h-5 w-5 text-primary" />
                Go Implementation
              </CardTitle>
              <CardDescription>Using net/http for API key verification</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="text-sm font-semibold mb-3">Implementation</h3>
                <CodeBlock 
                  language="go"
                  code={`package main

import (
    "bytes"
    "encoding/json"
    "fmt"
    "io/ioutil"
    "net/http"
    "os"
    "os/exec"
    "runtime"
    "strings"
    "time"
)

const API_ENDPOINT = "${API_ENDPOINT}"

type VerifyRequest struct {
    KeyValue   string \`json:"keyValue"\`
    HWID       string \`json:"hwid"\`
    DeviceName string \`json:"deviceName"\`
}

type VerifyResponse struct {
    Valid   bool   \`json:"valid"\`
    Message string \`json:"message"\`
    Debug   string \`json:"debug,omitempty"\`
}

func getHWID() string {
    var cmd *exec.Cmd
    
    if runtime.GOOS == "windows" {
        cmd = exec.Command("wmic", "csproduct", "get", "uuid")
    } else {
        cmd = exec.Command("cat", "/etc/machine-id")
    }
    
    output, err := cmd.Output()
    if err != nil {
        return "UNKNOWN"
    }
    
    lines := strings.Split(string(output), "\\n")
    if len(lines) > 1 {
        return strings.TrimSpace(lines[1])
    }
    
    return strings.TrimSpace(string(output))
}

func verifyLicense(apiKey string) bool {
    hostname, _ := os.Hostname()
    
    payload := VerifyRequest{
        KeyValue:   apiKey,
        HWID:       getHWID(),
        DeviceName: hostname,
    }
    
    jsonData, err := json.Marshal(payload)
    if err != nil {
        fmt.Printf("[✗] Error encoding request: %v\\n", err)
        return false
    }
    
    client := &http.Client{
        Timeout: 10 * time.Second,
    }
    
    resp, err := client.Post(
        API_ENDPOINT,
        "application/json",
        bytes.NewBuffer(jsonData),
    )
    
    if err != nil {
        fmt.Printf("[✗] Connection error: %v\\n", err)
        return false
    }
    defer resp.Body.Close()
    
    body, err := ioutil.ReadAll(resp.Body)
    if err != nil {
        fmt.Printf("[✗] Error reading response: %v\\n", err)
        return false
    }
    
    var result VerifyResponse
    err = json.Unmarshal(body, &result)
    if err != nil {
        fmt.Printf("[✗] Error parsing response: %v\\n", err)
        return false
    }
    
    if result.Valid {
        fmt.Printf("[✓] License verified: %s\\n", result.Message)
        return true
    } else {
        fmt.Printf("[✗] License invalid: %s\\n", result.Message)
        if result.Debug != "" {
            fmt.Printf("[!] Troubleshooting: %s\\n", result.Debug)
        }
        return false
    }
}

func main() {
    apiKey := "YOUR_API_KEY_HERE"
    
    if verifyLicense(apiKey) {
        fmt.Println("Access granted - Starting application...")
        // Your application code here
    } else {
        fmt.Println("Access denied - Exiting...")
        os.Exit(1)
    }
}`}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* HTML/JavaScript */}
        <TabsContent value="html" className="space-y-4 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5 text-primary" />
                HTML/JavaScript Implementation
              </CardTitle>
              <CardDescription>Browser-based license verification with Fetch API</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert className="border-primary/50 bg-primary/5">
                <Info className="h-4 w-4" />
                <AlertTitle>Web-Based Access Mode</AlertTitle>
                <AlertDescription className="text-sm mt-2">
                  <strong>Enable "Web-Based Access"</strong> when creating a license for browsers/PHP. This mode uses IP + User-Agent instead of strict hardware binding, allowing the same PC to access from different browsers while still respecting device limits.
                </AlertDescription>
              </Alert>
              <div>
                <h3 className="text-sm font-semibold mb-3">Complete HTML Page</h3>
                <CodeBlock 
                  language="html"
                  code={`<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>License Verification</title>
    <style>
        body {
            font-family: 'Segoe UI', Arial, sans-serif;
            max-width: 600px;
            margin: 50px auto;
            padding: 20px;
            background: #1a1a2e;
            color: #eee;
        }
        .container {
            background: #16213e;
            padding: 30px;
            border-radius: 10px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.3);
        }
        h1 { color: #4ecca3; margin-top: 0; }
        input {
            width: 100%;
            padding: 12px;
            margin: 10px 0;
            border: 2px solid #0f3460;
            border-radius: 5px;
            background: #0f3460;
            color: #fff;
            font-size: 14px;
            font-family: monospace;
        }
        button {
            width: 100%;
            padding: 12px;
            background: #4ecca3;
            color: #000;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            font-weight: bold;
            font-size: 16px;
            margin-top: 10px;
        }
        button:hover { background: #45b393; }
        button:disabled {
            background: #666;
            cursor: not-allowed;
        }
        .result {
            margin-top: 20px;
            padding: 15px;
            border-radius: 5px;
            display: none;
        }
        .success {
            background: rgba(78, 204, 163, 0.2);
            border: 1px solid #4ecca3;
            color: #4ecca3;
        }
        .error {
            background: rgba(231, 76, 60, 0.2);
            border: 1px solid #e74c3c;
            color: #e74c3c;
        }
        .info {
            margin-top: 10px;
            font-size: 14px;
            opacity: 0.8;
        }
        .hwid-display {
            font-family: monospace;
            font-size: 12px;
            padding: 10px;
            background: #0f3460;
            border-radius: 5px;
            margin-top: 10px;
            word-break: break-all;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🔒 License Verification</h1>
        <label for="apiKey">Enter Your License Key:</label>
        <input 
            type="text" 
            id="apiKey" 
            placeholder="YOUR-API-KEY-HERE"
            autocomplete="off"
        >
        <button id="verifyBtn" onclick="verifyLicense()">Verify License</button>
        
        <div id="result" class="result"></div>
        
        <div class="info">
            <strong>Your Hardware ID:</strong>
            <div class="hwid-display" id="hwidDisplay">Calculating...</div>
        </div>
    </div>

    <script>
        const API_ENDPOINT = '${API_ENDPOINT}';
        
        // Generate browser fingerprint as HWID
        async function getHWID() {
            const fingerprint = [
                navigator.userAgent,
                navigator.language,
                screen.width + 'x' + screen.height,
                screen.colorDepth,
                new Date().getTimezoneOffset(),
                navigator.hardwareConcurrency || 'unknown',
                navigator.deviceMemory || 'unknown',
                navigator.platform
            ].join('|');
            
            const encoder = new TextEncoder();
            const data = encoder.encode(fingerprint);
            const hashBuffer = await crypto.subtle.digest('SHA-256', data);
            const hashArray = Array.from(new Uint8Array(hashBuffer));
            const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
            
            return hashHex.substring(0, 32).toUpperCase();
        }
        
        // Get device name
        function getDeviceName() {
            const ua = navigator.userAgent;
            let browser = 'Unknown', os = 'Unknown';
            
            if (ua.indexOf('Firefox') > -1) browser = 'Firefox';
            else if (ua.indexOf('Chrome') > -1) browser = 'Chrome';
            else if (ua.indexOf('Safari') > -1) browser = 'Safari';
            else if (ua.indexOf('Edge') > -1) browser = 'Edge';
            
            if (ua.indexOf('Win') > -1) os = 'Windows';
            else if (ua.indexOf('Mac') > -1) os = 'macOS';
            else if (ua.indexOf('Linux') > -1) os = 'Linux';
            else if (ua.indexOf('Android') > -1) os = 'Android';
            
            return \`\${browser} on \${os}\`;
        }
        
        // Display HWID on load
        (async () => {
            document.getElementById('hwidDisplay').textContent = await getHWID();
        })();
        
        // Verify license
        async function verifyLicense() {
            const apiKey = document.getElementById('apiKey').value.trim();
            const resultDiv = document.getElementById('result');
            const verifyBtn = document.getElementById('verifyBtn');
            
            if (!apiKey) {
                showResult('Please enter a license key', 'error');
                return;
            }
            
            verifyBtn.disabled = true;
            verifyBtn.textContent = 'Verifying...';
            resultDiv.style.display = 'none';
            
            try {
                const payload = {
                    keyValue: apiKey,
                    hwid: await getHWID(),
                    deviceName: getDeviceName(),
                    deviceInfo: {
                        browser: navigator.userAgent,
                        platform: navigator.platform,
                        language: navigator.language,
                        screen: \`\${screen.width}x\${screen.height}\`,
                        cores: navigator.hardwareConcurrency || 'unknown'
                    }
                };
                
                const response = await fetch(API_ENDPOINT, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
                
                const result = await response.json();
                
                if (result.valid) {
                    let msg = \`✓ \${result.message}\`;
                    if (result.daysRemaining) msg += \`<br><small>Days left: \${result.daysRemaining}</small>\`;
                    showResult(msg, 'success');
                } else {
                    showResult(\`✗ \${result.message}\`, 'error');
                }
                
            } catch (error) {
                showResult(\`✗ Connection error: \${error.message}\`, 'error');
            } finally {
                verifyBtn.disabled = false;
                verifyBtn.textContent = 'Verify License';
            }
        }
        
        function showResult(message, type) {
            const div = document.getElementById('result');
            div.innerHTML = message;
            div.className = 'result ' + type;
            div.style.display = 'block';
        }
        
        document.getElementById('apiKey').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') verifyLicense();
        });
    </script>
</body>
</html>`}
                />
              </div>
              
              <div>
                <h3 className="text-sm font-semibold mb-3">Vanilla JavaScript (for existing pages)</h3>
                <p className="text-xs text-muted-foreground mb-3">
                  <strong>Note:</strong> If you enabled "Web-Based Access" on your license, you can omit the <code className="text-primary">hwid</code> field entirely. The API will track by IP + User-Agent automatically.
                </p>
                <CodeBlock 
                  language="javascript"
                  code={`// Generate browser fingerprint as HWID (optional for web-based licenses)
async function getHWID() {
    const fingerprint = [
        navigator.userAgent,
        navigator.language,
        screen.width + 'x' + screen.height,
        screen.colorDepth,
        new Date().getTimezoneOffset(),
        navigator.hardwareConcurrency || 'unknown',
        navigator.platform
    ].join('|');
    
    const encoder = new TextEncoder();
    const data = encoder.encode(fingerprint);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    
    return hashHex.substring(0, 32).toUpperCase();
}

// Verify license
async function verifyLicense(apiKey) {
    const hwid = await getHWID();
    const deviceName = navigator.userAgent.split('(')[1]?.split(';')[0] || 'Browser';
    
    const payload = {
        keyValue: apiKey,
        hwid: hwid,
        deviceName: deviceName
    };
    
    try {
        const response = await fetch('${API_ENDPOINT}', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        
        const result = await response.json();
        
        if (result.valid) {
            console.log('✓ License verified:', result.message);
            return true;
        } else {
            console.error('✗ License invalid:', result.message);
            return false;
        }
    } catch (error) {
        console.error('✗ Connection error:', error);
        return false;
    }
}

// Usage
const API_KEY = 'YOUR_API_KEY_HERE';

verifyLicense(API_KEY).then(isValid => {
    if (isValid) {
        console.log('Access granted - Loading application...');
        // Your application code here
    } else {
        console.log('Access denied');
        document.body.innerHTML = '<h1>License verification failed</h1>';
    }
});`}
                />
              </div>
              
              <div>
                <h3 className="text-sm font-semibold mb-3">Simplified (Web-Based Licenses Only)</h3>
                <p className="text-xs text-muted-foreground mb-3">
                  For licenses with "Web-Based Access" enabled, no HWID required:
                </p>
                <CodeBlock 
                  language="javascript"
                  code={`async function verifyLicense(apiKey) {
    const payload = {
        keyValue: apiKey,
        // No hwid needed - API uses IP + User-Agent automatically
        deviceName: navigator.userAgent.split('(')[1]?.split(';')[0] || 'Browser'
    };
    
    try {
        const response = await fetch('${API_ENDPOINT}', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        
        const result = await response.json();
        return result.valid;
    } catch (error) {
        console.error('Connection error:', error);
        return false;
    }
}

// Usage
verifyLicense('YOUR_API_KEY_HERE').then(valid => {
    if (valid) {
        console.log('Access granted');
    } else {
        console.log('Access denied');
    }
});`}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* cURL */}
        <TabsContent value="curl" className="space-y-4 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Terminal className="h-5 w-5 text-primary" />
                cURL / Bash Implementation
              </CardTitle>
              <CardDescription>Direct API testing with cURL</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="text-sm font-semibold mb-3">Basic Request</h3>
                <CodeBlock 
                  language="bash"
                  code={`curl -X POST ${API_ENDPOINT} \\
  -H "Content-Type: application/json" \\
  -d '{
    "keyValue": "YOUR_API_KEY_HERE",
    "hwid": "HARDWARE_ID",
    "deviceName": "MyDevice"
  }'`}
                />
              </div>
              <div>
                <h3 className="text-sm font-semibold mb-3">Complete Bash Script</h3>
                <CodeBlock 
                  language="bash"
                  code={`#!/bin/bash

API_ENDPOINT="${API_ENDPOINT}"
API_KEY="YOUR_API_KEY_HERE"

# Get HWID (Linux/Mac)
if [[ "$OSTYPE" == "linux-gnu"* ]]; then
    HWID=$(cat /etc/machine-id)
elif [[ "$OSTYPE" == "darwin"* ]]; then
    HWID=$(ioreg -rd1 -c IOPlatformExpertDevice | awk '/IOPlatformUUID/ { gsub(/"/, "", $3); print $3 }')
else
    HWID="UNKNOWN"
fi

DEVICE_NAME=$(hostname)

# Make API request
RESPONSE=$(curl -s -X POST "$API_ENDPOINT" \\
  -H "Content-Type: application/json" \\
  -d "{
    \\"keyValue\\": \\"$API_KEY\\",
    \\"hwid\\": \\"$HWID\\",
    \\"deviceName\\": \\"$DEVICE_NAME\\"
  }")

# Parse response
VALID=$(echo "$RESPONSE" | grep -o '"valid":[^,]*' | grep -o '[^:]*$')
MESSAGE=$(echo "$RESPONSE" | grep -o '"message":"[^"]*"' | cut -d'"' -f4)

if [[ "$VALID" == *"true"* ]]; then
    echo "[✓] License verified: $MESSAGE"
    echo "Access granted - Starting application..."
    # Your application code here
    exit 0
else
    echo "[✗] License invalid: $MESSAGE"
    echo "Access denied - Exiting..."
    exit 1
fi`}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* C++ */}
        <TabsContent value="cpp" className="space-y-4 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Code2 className="h-5 w-5 text-primary" />
                C++ Implementation
              </CardTitle>
              <CardDescription>Using libcurl for API key verification with alternative HWID methods</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="text-sm font-semibold mb-3">Installation</h3>
                <CodeBlock 
                  language="bash"
                  code={`# Ubuntu/Debian
sudo apt-get install libcurl4-openssl-dev libjsoncpp-dev

# Windows (vcpkg)
vcpkg install curl jsoncpp`}
                />
              </div>
              <div>
                <h3 className="text-sm font-semibold mb-3">Implementation</h3>
                <CodeBlock 
                  language="cpp"
                  code={`#include <iostream>
#include <curl/curl.h>
#include <json/json.h>
#include <fstream>
#include <sstream>
#include <cstdlib>

#ifdef _WIN32
#include <windows.h>
#include <intrin.h>
#pragma comment(lib, "rpcrt4.lib")
#else
#include <unistd.h>
#include <sys/socket.h>
#include <netinet/in.h>
#include <net/if.h>
#include <sys/ioctl.h>
#endif

std::string getHWID() {
#ifdef _WIN32
    // Try registry MachineGuid first (WMIC alternative)
    HKEY hKey;
    if (RegOpenKeyExA(HKEY_LOCAL_MACHINE, 
                      "SOFTWARE\\\\Microsoft\\\\Cryptography",
                      0, KEY_READ, &hKey) == ERROR_SUCCESS) {
        char buffer[256];
        DWORD size = sizeof(buffer);
        if (RegQueryValueExA(hKey, "MachineGuid", NULL, NULL, 
                            (LPBYTE)buffer, &size) == ERROR_SUCCESS) {
            RegCloseKey(hKey);
            return std::string(buffer);
        }
        RegCloseKey(hKey);
    }
    
    // Fallback: CPU ID + Volume Serial
    int cpuInfo[4];
    __cpuid(cpuInfo, 1);
    char hwid[64];
    sprintf(hwid, "%08X%08X", cpuInfo[3], cpuInfo[0]);
    return std::string(hwid);
#else
    // Linux: Try machine-id
    std::ifstream machineId("/etc/machine-id");
    if (machineId.is_open()) {
        std::string id;
        std::getline(machineId, id);
        machineId.close();
        return id;
    }
    
    // Fallback: /var/lib/dbus/machine-id
    std::ifstream dbusId("/var/lib/dbus/machine-id");
    if (dbusId.is_open()) {
        std::string id;
        std::getline(dbusId, id);
        dbusId.close();
        return id;
    }
    
    return "unknown-hwid";
#endif
}

static size_t WriteCallback(void* contents, size_t size, size_t nmemb, void* userp) {
    ((std::string*)userp)->append((char*)contents, size * nmemb);
    return size * nmemb;
}

bool verifyLicense(const std::string& apiKey) {
    CURL* curl = curl_easy_init();
    if (!curl) return false;
    
    std::string hwid = getHWID();
    char hostname[256];
    gethostname(hostname, sizeof(hostname));
    
    Json::Value payload;
    payload["keyValue"] = apiKey;
    payload["hwid"] = hwid;
    payload["deviceName"] = std::string(hostname);
    
    Json::StreamWriterBuilder writer;
    std::string jsonPayload = Json::writeString(writer, payload);
    
    std::string response;
    struct curl_slist* headers = NULL;
    headers = curl_slist_append(headers, "Content-Type: application/json");
    
    curl_easy_setopt(curl, CURLOPT_URL, "${API_ENDPOINT}");
    curl_easy_setopt(curl, CURLOPT_POSTFIELDS, jsonPayload.c_str());
    curl_easy_setopt(curl, CURLOPT_HTTPHEADER, headers);
    curl_easy_setopt(curl, CURLOPT_WRITEFUNCTION, WriteCallback);
    curl_easy_setopt(curl, CURLOPT_WRITEDATA, &response);
    curl_easy_setopt(curl, CURLOPT_TIMEOUT, 10L);
    
    CURLcode res = curl_easy_perform(curl);
    curl_slist_free_all(headers);
    curl_easy_cleanup(curl);
    
    if (res != CURLE_OK) {
        std::cerr << "[✗] Connection error: " << curl_easy_strerror(res) << std::endl;
        return false;
    }
    
    Json::CharReaderBuilder reader;
    Json::Value result;
    std::string errs;
    std::istringstream stream(response);
    
    if (Json::parseFromStream(reader, stream, &result, &errs)) {
        if (result["valid"].asBool()) {
            std::cout << "[✓] License verified: " << result["message"].asString() << std::endl;
            return true;
        } else {
            std::cout << "[✗] License invalid: " << result["message"].asString() << std::endl;
            return false;
        }
    }
    
    return false;
}

int main() {
    const std::string API_KEY = "YOUR_API_KEY_HERE";
    
    if (verifyLicense(API_KEY)) {
        std::cout << "Access granted - Starting application..." << std::endl;
        // Your application code here
        return 0;
    } else {
        std::cout << "Access denied - Exiting..." << std::endl;
        return 1;
    }
}`}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Rust */}
        <TabsContent value="rust" className="space-y-4 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Code2 className="h-5 w-5 text-primary" />
                Rust Implementation
              </CardTitle>
              <CardDescription>Using reqwest for API key verification with cross-platform HWID</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="text-sm font-semibold mb-3">Add Dependencies (Cargo.toml)</h3>
                <CodeBlock 
                  language="toml"
                  code={`[dependencies]
reqwest = { version = "0.11", features = ["json", "blocking"] }
serde = { version = "1.0", features = ["derive"] }
serde_json = "1.0"
machine-uid = "0.3"
hostname = "0.3"
tokio = { version = "1", features = ["full"] }`}
                />
              </div>
              <div>
                <h3 className="text-sm font-semibold mb-3">Implementation</h3>
                <CodeBlock 
                  language="rust"
                  code={`use reqwest;
use serde::{Deserialize, Serialize};
use std::process;

#[derive(Serialize)]
struct VerifyRequest {
    #[serde(rename = "keyValue")]
    key_value: String,
    hwid: String,
    #[serde(rename = "deviceName")]
    device_name: String,
}

#[derive(Deserialize)]
struct VerifyResponse {
    valid: bool,
    message: String,
    debug: Option<String>,
}

fn get_hwid() -> String {
    // Try multiple methods for HWID
    
    // Method 1: machine-uid crate (cross-platform)
    if let Ok(uid) = machine_uid::get() {
        return uid;
    }
    
    // Method 2: Windows - Read registry MachineGuid
    #[cfg(target_os = "windows")]
    {
        use std::process::Command;
        
        // Try PowerShell registry read (WMIC alternative)
        if let Ok(output) = Command::new("powershell")
            .args(&[
                "-Command",
                "(Get-ItemProperty -Path 'HKLM:\\\\SOFTWARE\\\\Microsoft\\\\Cryptography').MachineGuid"
            ])
            .output()
        {
            if let Ok(result) = String::from_utf8(output.stdout) {
                let trimmed = result.trim();
                if !trimmed.is_empty() {
                    return trimmed.to_string();
                }
            }
        }
    }
    
    // Method 3: Linux - Read machine-id
    #[cfg(target_os = "linux")]
    {
        use std::fs;
        
        if let Ok(id) = fs::read_to_string("/etc/machine-id") {
            return id.trim().to_string();
        }
        
        if let Ok(id) = fs::read_to_string("/var/lib/dbus/machine-id") {
            return id.trim().to_string();
        }
    }
    
    // Method 4: macOS - Use IOPlatformUUID
    #[cfg(target_os = "macos")]
    {
        use std::process::Command;
        
        if let Ok(output) = Command::new("ioreg")
            .args(&["-rd1", "-c", "IOPlatformExpertDevice"])
            .output()
        {
            if let Ok(result) = String::from_utf8(output.stdout) {
                // Parse UUID from output
                if let Some(uuid_line) = result.lines().find(|l| l.contains("IOPlatformUUID")) {
                    if let Some(uuid) = uuid_line.split('"').nth(1) {
                        return uuid.to_string();
                    }
                }
            }
        }
    }
    
    // Fallback: Use hostname as identifier (not recommended for production)
    hostname::get()
        .ok()
        .and_then(|h| h.into_string().ok())
        .unwrap_or_else(|| "unknown-hwid".to_string())
}

#[tokio::main]
async fn main() {
    let api_key = "YOUR_API_KEY_HERE";
    
    if verify_license(api_key).await {
        println!("Access granted - Starting application...");
        // Your application code here
    } else {
        println!("Access denied - Exiting...");
        process::exit(1);
    }
}

async fn verify_license(api_key: &str) -> bool {
    let hwid = get_hwid();
    let device_name = hostname::get()
        .ok()
        .and_then(|h| h.into_string().ok())
        .unwrap_or_else(|| "unknown".to_string());
    
    let payload = VerifyRequest {
        key_value: api_key.to_string(),
        hwid,
        device_name,
    };
    
    let client = reqwest::Client::new();
    
    match client
        .post("${API_ENDPOINT}")
        .json(&payload)
        .timeout(std::time::Duration::from_secs(10))
        .send()
        .await
    {
        Ok(response) => match response.json::<VerifyResponse>().await {
            Ok(result) => {
                if result.valid {
                    println!("[✓] License verified: {}", result.message);
                    true
                } else {
                    println!("[✗] License invalid: {}", result.message);
                    if let Some(debug) = result.debug {
                        println!("[!] Troubleshooting: {}", debug);
                    }
                    false
                }
            }
            Err(e) => {
                eprintln!("[✗] Failed to parse response: {}", e);
                false
            }
        },
        Err(e) => {
            eprintln!("[✗] Connection error: {}", e);
            false
        }
    }
}`}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Lua */}
        <TabsContent value="lua" className="space-y-4 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Code2 className="h-5 w-5 text-primary" />
                Lua Implementation
              </CardTitle>
              <CardDescription>Using LuaSocket and cjson for API key verification</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="text-sm font-semibold mb-3">Installation</h3>
                <CodeBlock 
                  language="bash"
                  code={`# Using LuaRocks
luarocks install luasocket
luarocks install lua-cjson
luarocks install luasec  # For HTTPS support`}
                />
              </div>
              <div>
                <h3 className="text-sm font-semibold mb-3">Implementation</h3>
                <CodeBlock 
                  language="lua"
                  code={`local http = require("socket.http")
local ltn12 = require("ltn12")
local json = require("cjson")

local API_ENDPOINT = "${API_ENDPOINT}"
local API_KEY = "YOUR_API_KEY_HERE"

local function get_hwid()
    local is_windows = package.config:sub(1,1) == '\\\\'
    
    if is_windows then
        -- Try registry MachineGuid (WMIC alternative)
        local handle = io.popen('reg query "HKLM\\\\SOFTWARE\\\\Microsoft\\\\Cryptography" /v MachineGuid 2>nul')
        if handle then
            local result = handle:read("*a")
            handle:close()
            local guid = result:match("MachineGuid%s+REG_SZ%s+([A-F0-9%-]+)")
            if guid then
                return guid
            end
        end
        
        -- Fallback: Try WMI (if available)
        handle = io.popen('wmic csproduct get uuid 2>nul')
        if handle then
            local result = handle:read("*a")
            handle:close()
            for line in result:gmatch("[^\\r\\n]+") do
                line = line:match("^%s*(.-)%s*$") -- trim
                if line ~= "UUID" and line ~= "" then
                    return line
                end
            end
        end
        
        -- Fallback: Computer name
        handle = io.popen('echo %COMPUTERNAME%')
        if handle then
            local name = handle:read("*l")
            handle:close()
            return name or "unknown-hwid"
        end
    else
        -- Linux/Mac: Try machine-id
        local files = {
            "/etc/machine-id",
            "/var/lib/dbus/machine-id"
        }
        
        for _, filepath in ipairs(files) do
            local file = io.open(filepath, "r")
            if file then
                local id = file:read("*l")
                file:close()
                if id then
                    return id
                end
            end
        end
        
        -- Fallback: hostname
        local handle = io.popen('hostname')
        if handle then
            local name = handle:read("*l")
            handle:close()
            return name or "unknown-hwid"
        end
    end
    
    return "unknown-hwid"
end

local function get_device_name()
    local is_windows = package.config:sub(1,1) == '\\\\'
    local cmd = is_windows and 'echo %COMPUTERNAME%' or 'hostname'
    local handle = io.popen(cmd)
    if handle then
        local name = handle:read("*l")
        handle:close()
        return name or "unknown"
    end
    return "unknown"
end

local function verify_license(api_key)
    local hwid = get_hwid()
    local device_name = get_device_name()
    
    local payload = json.encode({
        keyValue = api_key,
        hwid = hwid,
        deviceName = device_name
    })
    
    local response_body = {}
    
    local res, code, response_headers = http.request{
        url = API_ENDPOINT,
        method = "POST",
        headers = {
            ["Content-Type"] = "application/json",
            ["Content-Length"] = tostring(#payload)
        },
        source = ltn12.source.string(payload),
        sink = ltn12.sink.table(response_body)
    }
    
    if not res then
        print("[✗] Connection error: " .. tostring(code))
        return false
    end
    
    if code ~= 200 then
        print("[✗] HTTP error: " .. tostring(code))
        return false
    end
    
    local response_text = table.concat(response_body)
    local ok, result = pcall(json.decode, response_text)
    
    if not ok then
        print("[✗] Failed to parse response")
        return false
    end
    
    if result.valid then
        print("[✓] License verified: " .. result.message)
        return true
    else
        print("[✗] License invalid: " .. result.message)
        if result.debug then
            print("[!] Troubleshooting: " .. result.debug)
        end
        return false
    end
end

-- Usage
if verify_license(API_KEY) then
    print("Access granted - Starting application...")
    -- Your application code here
else
    print("Access denied - Exiting...")
    os.exit(1)
end`}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* PowerShell */}
        <TabsContent value="powershell" className="space-y-4 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Terminal className="h-5 w-5 text-primary" />
                PowerShell Implementation
              </CardTitle>
              <CardDescription>Windows PowerShell script for API key verification</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="text-sm font-semibold mb-3">Implementation</h3>
                <CodeBlock 
                  language="powershell"
                  code={`$API_ENDPOINT = "${API_ENDPOINT}"
$API_KEY = "YOUR_API_KEY_HERE"

function Get-HWID {
    # Try multiple methods (WMIC alternatives)
    
    # Method 1: Registry MachineGuid (most reliable, no WMIC needed)
    try {
        $guid = (Get-ItemProperty -Path 'HKLM:\\SOFTWARE\\Microsoft\\Cryptography').MachineGuid
        if ($guid) {
            return $guid
        }
    } catch { }
    
    # Method 2: WMI (if available)
    try {
        $uuid = (Get-WmiObject -Class Win32_ComputerSystemProduct).UUID
        if ($uuid -and $uuid -ne "FFFFFFFF-FFFF-FFFF-FFFF-FFFFFFFFFFFF") {
            return $uuid
        }
    } catch { }
    
    # Method 3: CIM (modern alternative to WMI)
    try {
        $uuid = (Get-CimInstance -ClassName Win32_ComputerSystemProduct).UUID
        if ($uuid) {
            return $uuid
        }
    } catch { }
    
    # Method 4: Processor ID
    try {
        $processorId = (Get-WmiObject -Class Win32_Processor).ProcessorId
        if ($processorId) {
            return $processorId
        }
    } catch { }
    
    # Fallback: Computer name + User
    return "$env:COMPUTERNAME-$env:USERNAME"
}

function Verify-License {
    param (
        [string]$ApiKey
    )
    
    $hwid = Get-HWID
    $deviceName = $env:COMPUTERNAME
    
    $payload = @{
        keyValue = $ApiKey
        hwid = $hwid
        deviceName = $deviceName
    } | ConvertTo-Json
    
    try {
        $response = Invoke-RestMethod -Uri $API_ENDPOINT \\
                                      -Method Post \\
                                      -Body $payload \\
                                      -ContentType "application/json" \\
                                      -TimeoutSec 10
        
        if ($response.valid) {
            Write-Host "[✓] License verified: $($response.message)" -ForegroundColor Green
            return $true
        } else {
            Write-Host "[✗] License invalid: $($response.message)" -ForegroundColor Red
            if ($response.debug) {
                Write-Host "[!] Troubleshooting: $($response.debug)" -ForegroundColor Yellow
            }
            return $false
        }
    } catch {
        Write-Host "[✗] Connection error: $($_.Exception.Message)" -ForegroundColor Red
        return $false
    }
}

# Usage
if (Verify-License -ApiKey $API_KEY) {
    Write-Host "Access granted - Starting application..." -ForegroundColor Green
    # Your application code here
} else {
    Write-Host "Access denied - Exiting..." -ForegroundColor Red
    exit 1
}`}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Card className="border-primary/20">
        <CardHeader>
          <CardTitle>API Response Format</CardTitle>
          <CardDescription>Understanding the verification response</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="text-sm font-semibold mb-3">Success Response</h3>
            <CodeBlock 
              language="json"
              code={`{
  "valid": true,
  "message": "License verified successfully",
  "apiKeyId": "abc123xyz",
  "expiresAt": "2026-12-31T23:59:59.999Z"
}`}
            />
          </div>
          <div>
            <h3 className="text-sm font-semibold mb-3">Error Response</h3>
            <CodeBlock 
              language="json"
              code={`{
  "valid": false,
  "message": "Invalid or expired API key",
  "debug": "Additional troubleshooting information"
}`}
            />
          </div>
        </CardContent>
      </Card>

      <Alert>
        <Code2 className="h-4 w-4" />
        <AlertTitle>Need Help?</AlertTitle>
        <AlertDescription>
          Check the <strong>Logs</strong> page to see real-time verification attempts and debug any integration issues.
        </AlertDescription>
      </Alert>
    </div>
  )
}
