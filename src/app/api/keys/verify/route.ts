import { NextResponse } from 'next/server';
import { getServerFirebase } from '@/firebase/server';
import { doc, getDocs, collection, query, where, updateDoc, addDoc, limit } from 'firebase/firestore';

// Helper: Check if IP is in CIDR range
function isIpInCidr(ip: string, cidr: string): boolean {
  try {
    if (cidr.includes('/')) {
      const [network, maskStr] = cidr.split('/');
      const mask = parseInt(maskStr, 10);
      const ipNum = ipToNumber(ip); 
      const networkNum = ipToNumber(network);
      const maskNum = ~(Math.pow(2, 32 - mask) - 1);
      return (ipNum & maskNum) === (networkNum & maskNum);
    } else {
      return ip === cidr;
    }
  } catch {
    return false;
  }
}

// Helper: Convert IP to number
function ipToNumber(ip: string): number {
  const parts = ip.split('.');
  return parts.reduce((acc, part, i) => acc + (parseInt(part, 10) << (8 * (3 - i))), 0);
}

// Helper: Check IP against whitelist/blocklist
async function checkIpRestrictions(ipAddress: string): Promise<{ allowed: boolean; reason?: string }> {
  try {
    const { firestore } = getServerFirebase();
    const settingsRef = collection(firestore, 'settings');
    const q = query(settingsRef, where('type', '==', 'network'));
    const settingsDoc = await getDocs(q);
    
    if (settingsDoc.empty) {
      return { allowed: true };
    }

    const settings = settingsDoc.docs[0].data();
    const ipWhitelist = settings.ipWhitelist || [];
    const ipBlocklist = settings.ipBlocklist || [];

    // Check blocklist first
    for (const blockedIp of ipBlocklist) {
      if (isIpInCidr(ipAddress, blockedIp)) {
        return { allowed: false, reason: 'IP address is blocked' };
      }
    }

    // If whitelist exists, check it
    if (ipWhitelist.length > 0) {
      let isWhitelisted = false;
      for (const whitelistedIp of ipWhitelist) {
        if (isIpInCidr(ipAddress, whitelistedIp)) {
          isWhitelisted = true;
          break;
        }
      }
      if (!isWhitelisted) {
        return { allowed: false, reason: 'IP address is not whitelisted' };
      }
    }

    return { allowed: true };
  } catch (error) {
    return { allowed: true }; // Fail open if there's an error
  }
}

// Helper: Check country restrictions
async function checkCountryRestrictions(countryCode: string): Promise<{ allowed: boolean; reason?: string }> {
  try {
    const { firestore } = getServerFirebase();
    const settingsRef = collection(firestore, 'settings');
    const q = query(settingsRef, where('type', '==', 'network'));
    const settingsDoc = await getDocs(q);
    
    if (settingsDoc.empty) {
      return { allowed: true };
    }

    const settings = settingsDoc.docs[0].data();
    const regionLocking = settings.regionLocking || false;
    const countryList = settings.countryList || [];
    const countryMode = settings.countryMode || 'whitelist';

    if (!regionLocking || countryCode === 'XX' || !countryCode) {
      return { allowed: true };
    }

    if (countryMode === 'whitelist') {
      const allowed = countryList.includes(countryCode);
      return { 
        allowed, 
        reason: allowed ? undefined : `Country ${countryCode} is not whitelisted`
      };
    } else {
      const blocked = countryList.includes(countryCode);
      return { 
        allowed: !blocked, 
        reason: blocked ? `Country ${countryCode} is blocked` : undefined
      };
    }
  } catch (error) {
    return { allowed: true }; // Fail open if there's an error
  }
}

// VPN/Proxy Detection
async function isVpnOrProxy(request: Request): Promise<boolean> {
  const headers = request.headers;
  const ipAddress = headers.get('x-forwarded-for')?.split(',')[0].trim() || 
                    headers.get('x-real-ip') || 
                    headers.get('cf-connecting-ip') || 
                    '127.0.0.1';
  
  // WHITELIST: Always allow localhost and private networks (no VPN detection)
  const isLocalhost = ipAddress === '127.0.0.1' || 
                      ipAddress === 'localhost' ||
                      ipAddress.startsWith('127.') ||
                      ipAddress.startsWith('192.168.') || 
                      ipAddress.startsWith('10.') || 
                      ipAddress.startsWith('172.16.') ||
                      ipAddress.startsWith('172.17.') ||
                      ipAddress.startsWith('172.18.') ||
                      ipAddress.startsWith('172.19.') ||
                      ipAddress.startsWith('172.20.') ||
                      ipAddress.startsWith('172.21.') ||
                      ipAddress.startsWith('172.22.') ||
                      ipAddress.startsWith('172.23.') ||
                      ipAddress.startsWith('172.24.') ||
                      ipAddress.startsWith('172.25.') ||
                      ipAddress.startsWith('172.26.') ||
                      ipAddress.startsWith('172.27.') ||
                      ipAddress.startsWith('172.28.') ||
                      ipAddress.startsWith('172.29.') ||
                      ipAddress.startsWith('172.30.') ||
                      ipAddress.startsWith('172.31.');
  if (isLocalhost) {
    return false; // Localhost is always trusted, never a VPN
  }
  
  // 1. Cloudflare WARP Detection (strict)
  if (headers.get('cf-warp-tag-id') || headers.get('cf-device-id')) {
    return true; // Cloudflare WARP detected - BLOCK
  }
  
  // 2. Cloudflare TOR/Unknown Country (strict)
  const cfRay = headers.get('cf-ray');
  const cfVisitor = headers.get('cf-visitor');
  if (cfRay && cfVisitor) {
    const cfIpCountry = headers.get('cf-ipcountry');
    if (cfIpCountry === 'T1' || cfIpCountry === 'XX') {
      return true; // Tor or unknown country - BLOCK
    }
  }
  
  // 3. Multiple proxies in chain (strict indicator of VPN)
  const forwardedFor = headers.get('x-forwarded-for');
  if (forwardedFor && forwardedFor.split(',').length > 3) {
    return true; // Suspicious proxy chain - BLOCK
  }
  
  // 4. Proxy Authorization (direct VPN indicator)
  if (headers.get('proxy-authorization')) {
    return true; // Proxy auth header present - BLOCK
  }
  
  // 5. Tor exit node detection
  if (headers.get('x-tor-exit-node') || ipAddress.includes('.onion')) {
    return true; // Tor detected - BLOCK
  }
  
  // 6. VPN-specific headers (strict)
  const vpnSpecificHeaders = [
    'x-vpn-client',
    'x-proxy-id',
    'x-anonymizer',
    'x-bluecoat-via'
  ];
  
  for (const header of vpnSpecificHeaders) {
    if (headers.get(header)) {
      return true; // VPN header detected - BLOCK
    }
  }
  
  // 7. Known VPN provider user-agent signatures
  const knownVpnPatterns = [
    'nordvpn', 'expressvpn',
    'privatevpn', 'surfshark', 'protonvpn',
    'cyberghost', 'avast-vpn'
  ];
  
  const userAgent = headers.get('user-agent')?.toLowerCase() || '';
  for (const pattern of knownVpnPatterns) {
    if (userAgent.includes(pattern)) {
      return true; // Known VPN client detected - BLOCK
    }
  }
  
  return false; // No VPN detected - ALLOW
}

export async function GET() {
  return NextResponse.json({ 
    status: "active", 
    message: "KeyGuard Security Node is operational on Port 9002.",
    instructions: "To verify a license, send a POST request with { 'keyValue': '...', 'hwid': '...', 'deviceName': '...' }",
    environment: "Cloud Workstations",
    recommended_port: 9002
  });
}

export async function POST(request: Request) {
  try {
    let body;
    try {
      body = await request.json();
    } catch (e) {
      return NextResponse.json({ 
        valid: false,
        message: "Invalid JSON body",
        debug: "Request body must be valid JSON"
      }, { status: 400 });
    }

    // Support both 'key' and 'keyValue' for backward compatibility
    const { key, keyValue, hwid, pcName, deviceName, deviceInfo } = body;
    const keyToVerify = keyValue || key;
    const device = deviceName || pcName || "Unknown Device";
    const extendedInfo = deviceInfo || {};
    
    const { firestore } = getServerFirebase();

    if (!keyToVerify) {
      return NextResponse.json({ 
        valid: false,
        message: "Key required",
        debug: "'keyValue' field is required in request body"
      }, { status: 400 });
    }

    // HWID is optional for web-based licenses (will be checked later)

    // 1. Locate License Key (Limit 1 for security rule compliance)
    const keysRef = collection(firestore, 'apiKeys');
    const q = query(keysRef, where("keyValue", "==", keyToVerify), limit(1));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return NextResponse.json({ 
        valid: false,
        message: "License key not found",
        debug: "The provided API key does not exist in the database"
      }, { status: 200 });
    }

    const keyDoc = querySnapshot.docs[0];
    const keyData = keyDoc.data();
    const keyRef = doc(firestore, 'apiKeys', keyDoc.id);

    // 2. Validate Active Status
    if (!keyData.isActive) {
      return NextResponse.json({ 
        valid: false,
        message: "License suspended",
        debug: "This license has been deactivated by an administrator"
      }, { status: 200 });
    }

    // 3. Expiration Check with Time Remaining Calculation
    if (keyData.expiresAt) {
      const expiryDate = new Date(keyData.expiresAt);
      const now = new Date();
      
      if (now > expiryDate) {
        return NextResponse.json({ 
          valid: false,
          message: "License expired",
          debug: `License expired on ${expiryDate.toLocaleDateString()}`,
          expiresAt: keyData.expiresAt,
          timeRemaining: 0
        }, { status: 200 });
      }
      
      // Calculate time remaining in days
      const timeRemainingMs = expiryDate.getTime() - now.getTime();
      const daysRemaining = Math.ceil(timeRemainingMs / (1000 * 60 * 60 * 24));
      
      // Include time remaining in response for valid licenses
      if (daysRemaining <= 7) {
        // Warning for licenses expiring soon
        console.log(`License ${keyToVerify} expires in ${daysRemaining} days`);
      }
    }

    // 3.5. VPN/Proxy Detection
    const blockVpnAccess = keyData.blockVpnAccess || false;
    if (blockVpnAccess && await isVpnOrProxy(request)) {
      await addDoc(collection(firestore, 'accessLogs'), {
        timestamp: new Date().toISOString(),
        eventType: "vpn_blocked",
        apiKeyId: keyDoc.id,
        ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || "127.0.0.1",
        deviceName: device,
        hwid: hwid || "unknown",
        deviceInfo: extendedInfo,
        status: "denied",
        reason: "VPN/Proxy connection detected"
      });
      
      return NextResponse.json({ 
        valid: false,
        message: "VPN/Proxy connection detected",
        debug: "This license does not allow connections from VPN or proxy services"
      }, { status: 200 });
    }

    // 3.6. IP Restrictions Check
    const ipAddress = request.headers.get('x-forwarded-for')?.split(',')[0].trim() || 
                      request.headers.get('x-real-ip') || 
                      '127.0.0.1';
    const ipCheck = await checkIpRestrictions(ipAddress);
    if (!ipCheck.allowed) {
      await addDoc(collection(firestore, 'accessLogs'), {
        timestamp: new Date().toISOString(),
        eventType: "ip_restriction_blocked",
        apiKeyId: keyDoc.id,
        ipAddress: ipAddress,
        deviceName: device,
        hwid: hwid || "unknown",
        deviceInfo: extendedInfo,
        status: "denied",
        reason: ipCheck.reason || "IP restriction violation"
      });
      
      return NextResponse.json({ 
        valid: false,
        message: "Access denied",
        debug: ipCheck.reason || "Your IP address is not allowed to access this resource"
      }, { status: 200 });
    }

    // 3.7. Country Restrictions Check
    const countryCode = request.headers.get('cf-ipcountry') || 'XX';
    const countryCheck = await checkCountryRestrictions(countryCode);
    if (!countryCheck.allowed) {
      await addDoc(collection(firestore, 'accessLogs'), {
        timestamp: new Date().toISOString(),
        eventType: "country_restricted",
        apiKeyId: keyDoc.id,
        ipAddress: ipAddress,
        deviceName: device,
        hwid: hwid || "unknown",
        countryCode: countryCode,
        deviceInfo: extendedInfo,
        status: "denied",
        reason: countryCheck.reason || "Country restriction violation"
      });
      
      return NextResponse.json({ 
        valid: false,
        message: "Access denied",
        debug: countryCheck.reason || "Your country is not allowed to access this resource"
      }, { status: 200 });
    }

    // 4. HWID Binding Logic with Web-Based Access Support
    const allowWebAccess = keyData.allowWebAccess || false;
    const allowMultiple = keyData.allowMultipleDevices || false;
    const maxDevices = keyData.maxDevices || 1;
    const hwidList = keyData.hwidList || [];
    const deviceList = keyData.deviceList || [];
    
    // For web-based access, use IP + User-Agent as identifier if no HWID provided
    let identifierToUse = hwid;
    if (allowWebAccess && (!hwid || hwid === "")) {
      const userAgent = request.headers.get('user-agent') || 'unknown';
      const ipAddress = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || '127.0.0.1';
      identifierToUse = `web-${ipAddress.split(',')[0]}-${userAgent.substring(0, 50)}`;
    } else if (!hwid || hwid === "") {
      // Strict mode: HWID required for non-web licenses
      return NextResponse.json({ 
        valid: false,
        message: "HWID required",
        debug: "Hardware ID is required for this license type. Enable 'Web-Based Access' for browser/PHP usage."
      }, { status: 400 });
    }
    
    // Check if this identifier is already in the list
    const hwidIndex = hwidList.indexOf(identifierToUse);
    const isNewDevice = hwidIndex === -1;
    
    if (!keyData.hwid || keyData.hwid === "") {
      // First time binding: Save identifier and extended device info
      const deviceEntry = {
        hwid: identifierToUse,
        deviceName: device,
        boundAt: new Date().toISOString(),
        webBased: allowWebAccess,
        ...extendedInfo
      };
      
      await updateDoc(keyRef, {
        hwid: identifierToUse,
        deviceName: device,
        hwidList: [identifierToUse],
        deviceList: [deviceEntry],
        boundDevices: 1,
        lastUsedAt: new Date().toISOString()
      });
    } else if (hwidList.includes(identifierToUse)) {
      // Device already bound - allow access and update last used
      await updateDoc(keyRef, {
        lastUsedAt: new Date().toISOString()
      });
    } else if (!allowMultiple) {
      // Single device mode - identifier mismatch
      await addDoc(collection(firestore, 'accessLogs'), {
        timestamp: new Date().toISOString(),
        eventType: allowWebAccess ? "session_mismatch" : "hwid_mismatch",
        apiKeyId: keyDoc.id,
        ipAddress: request.headers.get('x-forwarded-for') || "127.0.0.1",
        deviceName: device,
        hwid: identifierToUse,
        deviceInfo: extendedInfo,
        status: "denied"
      });
      return NextResponse.json({ 
        valid: false,
        message: allowWebAccess ? "Session mismatch: License locked to another browser/session" : "Hardware mismatch: License locked to another device",
        debug: allowWebAccess ? "This license is bound to a different browser session" : "This license is bound to a different hardware ID and does not allow multiple devices"
      }, { status: 200 });
    } else if (hwidList.length >= maxDevices) {
      // Multiple devices allowed but limit reached
      await addDoc(collection(firestore, 'accessLogs'), {
        timestamp: new Date().toISOString(),
        eventType: "device_limit_reached",
        apiKeyId: keyDoc.id,
        ipAddress: request.headers.get('x-forwarded-for') || "127.0.0.1",
        deviceName: device,
        hwid: identifierToUse,
        deviceInfo: extendedInfo,
        status: "denied"
      });
      return NextResponse.json({ 
        valid: false,
        message: allowWebAccess ? "Session limit reached" : "Device limit reached",
        debug: `This license is already bound to ${maxDevices} ${allowWebAccess ? 'session(s)' : 'device(s)'}. Maximum limit reached.`
      }, { status: 200 });
    } else {
      // Multiple devices allowed and under limit - bind new device with extended info
      const deviceEntry = {
        hwid: identifierToUse,
        deviceName: device,
        boundAt: new Date().toISOString(),
        webBased: allowWebAccess,
        ...extendedInfo
      };
      
      const updatedHwidList = [...hwidList, identifierToUse];
      const updatedDeviceList = [...deviceList, deviceEntry];
      
      await updateDoc(keyRef, {
        hwidList: updatedHwidList,
        deviceList: updatedDeviceList,
        boundDevices: updatedHwidList.length,
        lastUsedAt: new Date().toISOString()
      });
    }

    // 5. Success Tracking
    await addDoc(collection(firestore, 'accessLogs'), {
      timestamp: new Date().toISOString(),
      eventType: "auth_success",
      apiKeyId: keyDoc.id,
      ipAddress: request.headers.get('x-forwarded-for') || "127.0.0.1",
      deviceName: device,
      hwid: identifierToUse,
      deviceInfo: extendedInfo,
      webBased: allowWebAccess,
      status: "success"
    });
    
    await updateDoc(keyRef, {
      lastUsedAt: new Date().toISOString()
    });

    // Calculate time remaining
    let timeRemaining = null;
    let daysRemaining = null;
    if (keyData.expiresAt) {
      const expiryDate = new Date(keyData.expiresAt);
      const now = new Date();
      const timeRemainingMs = expiryDate.getTime() - now.getTime();
      daysRemaining = Math.ceil(timeRemainingMs / (1000 * 60 * 60 * 24));
      timeRemaining = {
        days: daysRemaining,
        hours: Math.ceil(timeRemainingMs / (1000 * 60 * 60)),
        expiresAt: keyData.expiresAt
      };
    }

    return NextResponse.json({
      valid: true,
      message: "License verified successfully",
      apiKeyId: keyDoc.id,
      deviceName: device,
      expiresAt: keyData.expiresAt || null,
      timeRemaining: timeRemaining,
      daysRemaining: daysRemaining,
      boundDevices: keyData.boundDevices || 1,
      maxDevices: keyData.maxDevices || 1
    });

  } catch (error: any) {
    console.error("API CRITICAL FAILURE:", error);
    return NextResponse.json({ 
      valid: false,
      message: "Internal Server Failure",
      debug: error.message 
    }, { status: 500 });
  }
}
