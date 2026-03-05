import requests
import subprocess
import platform
import uuid
import hashlib
import os
import socket

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
                gpus = [line.strip() for line in output.split('\n')[1:] if line.strip()]
                info["gpu"] = gpus[0] if gpus else "Unknown"
            except:
                info["gpu"] = "Unknown"
        
        return info
    except Exception as e:
        return {"error": str(e)}

def get_hwid():
    """Get unique hardware identifier based on stable hardware (CPU, Disk, GPU)"""
    import hashlib
    
    hardware_data = []
    
    if platform.system() == "Windows":
        try:
            # Primary: Motherboard UUID (most stable)
            cmd = "wmic csproduct get uuid"
            output = subprocess.check_output(cmd, shell=True).decode().split('\n')[1].strip()
            if output and output != "FFFFFFFF-FFFF-FFFF-FFFF-FFFFFFFFFFFF":
                return output
        except:
            pass
        
        try:
            # Fallback 1: Registry MachineGuid
            import winreg
            key = winreg.OpenKey(winreg.HKEY_LOCAL_MACHINE, 
                                 r"SOFTWARE\Microsoft\Cryptography")
            guid = winreg.QueryValueEx(key, "MachineGuid")[0]
            return guid
        except:
            pass
        
        # Fallback 2: Combine CPU + Disk Serial + GPU
        # DO NOT use MAC address or IP (they can change)
        try:
            # Get CPU Processor ID
            cmd = "wmic cpu get processorid"
            cpu_id = subprocess.check_output(cmd, shell=True).decode().split('\n')[1].strip()
            if cpu_id:
                hardware_data.append(f"CPU:{cpu_id}")
        except:
            pass
        
        try:
            # Get Disk Drive Serial Number
            cmd = "wmic diskdrive get serialnumber"
            output = subprocess.check_output(cmd, shell=True).decode()
            serials = [line.strip() for line in output.split('\n')[1:] if line.strip()]
            if serials:
                hardware_data.append(f"DISK:{serials[0]}")
        except:
            pass
        
        try:
            # Get GPU Device ID
            cmd = "wmic path win32_VideoController get PNPDeviceID"
            output = subprocess.check_output(cmd, shell=True).decode()
            devices = [line.strip() for line in output.split('\n')[1:] if line.strip()]
            if devices:
                hardware_data.append(f"GPU:{devices[0]}")
        except:
            pass
        
        # If we have hardware data, create a hash
        if hardware_data:
            combined = "|".join(hardware_data)
            return hashlib.sha256(combined.encode()).hexdigest()[:32].upper()
        
        # Last resort: use hostname (not ideal but better than MAC)
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
        
        # macOS - use IOPlatformUUID
        if platform.system() == "Darwin":
            try:
                cmd = "ioreg -rd1 -c IOPlatformExpertDevice | grep IOPlatformUUID"
                output = subprocess.check_output(cmd, shell=True).decode()
                uuid_val = output.split('"')[3]
                return uuid_val
            except:
                pass
        
        # Fallback: Combine CPU model + disk info (NOT network)
        try:
            # Get CPU info
            with open('/proc/cpuinfo', 'r') as f:
                for line in f:
                    if 'Serial' in line or 'processor' in line:
                        hardware_data.append(line.strip())
                        break
        except:
            pass
        
        try:
            # Get disk UUID
            cmd = "blkid"
            output = subprocess.check_output(cmd, shell=True).decode()
            if output:
                hardware_data.append(output.split()[0])
        except:
            pass
        
        if hardware_data:
            combined = "|".join(hardware_data)
            return hashlib.sha256(combined.encode()).hexdigest()[:32].upper()
        
        # Last resort
        return hashlib.sha256(platform.node().encode()).hexdigest()[:32].upper()

def verify_license(api_key):
    """Verify API key and bind to hardware"""
    url = "http://localhost:9002/api/keys/verify"
    
    hwid = get_hwid()
    device_info = get_extended_device_info()
    
    payload = {
        "keyValue": api_key,
        "hwid": hwid,
        "deviceName": device_info.get("hostname", "Unknown"),
        "deviceInfo": device_info
    }
    
    try:
        response = requests.post(url, json=payload, timeout=10)
        result = response.json()
        
        if result.get('valid'):
            print(f"[✓] License verified: {result.get('message')}")
            if result.get('daysRemaining'):
                days = result.get('daysRemaining')
                print(f"[i] Time remaining: {days} day{'s' if days != 1 else ''}")
            if result.get('boundDevices') and result.get('maxDevices'):
                print(f"[i] Device usage: {result.get('boundDevices')}/{result.get('maxDevices')} devices")
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
    API_KEY = "KG-3S8O-ND83"
    
    if verify_license(API_KEY):
        print("Access granted - Starting application...")
        # Your application code here
    else:
        print("Access denied - Exiting...")
        exit(1)