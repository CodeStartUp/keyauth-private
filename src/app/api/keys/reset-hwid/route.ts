import { NextResponse } from 'next/server';
import { getServerFirebase } from '@/firebase/server';
import { doc, getDocs, collection, query, where, updateDoc, addDoc, limit } from 'firebase/firestore';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { keyValue } = body;
    
    const { firestore } = getServerFirebase();

    if (!keyValue) {
      return NextResponse.json({ 
        success: false,
        message: "Key required",
        debug: "'keyValue' field is required"
      }, { status: 400 });
    }

    // Check global HWID reset settings
    let globalAllowReset = true;
    let resetMode = 'all'; // 'all', 'whitelist', 'none'
    let whitelistedUsers: string[] = [];

    try {
      const settingsRef = collection(firestore, 'settings');
      const settingsQuery = query(settingsRef, where('type', '==', 'webdemo'));
      const settingsSnapshot = await getDocs(settingsQuery);
      
      if (!settingsSnapshot.empty) {
        const settings = settingsSnapshot.docs[0].data();
        globalAllowReset = settings.allowHwidReset !== false;
        resetMode = settings.hwidResetMode || 'all';
        whitelistedUsers = settings.hwidResetUsers || [];
      }
    } catch (error) {
      // If we can't read settings, default to allow (fail open)
      console.log('Settings read error, defaulting to allow reset:', error);
    }

    // Check if HWID reset is globally disabled
    if (!globalAllowReset || resetMode === 'none') {
      await addDoc(collection(firestore, 'accessLogs'), {
        timestamp: new Date().toISOString(),
        eventType: "reset_hwid_denied",
        keyValue: keyValue,
        ipAddress: request.headers.get('x-forwarded-for')?.split(',')[0] || "127.0.0.1",
        status: "denied",
        reason: "HWID reset is disabled by administrator"
      });

      return NextResponse.json({ 
        success: false,
        message: "HWID reset not allowed",
        debug: "HWID reset functionality has been disabled by the system administrator. Please contact support."
      }, { status: 403 });
    }

    // Locate License Key
    const keysRef = collection(firestore, 'apiKeys');
    const q = query(keysRef, where("keyValue", "==", keyValue), limit(1));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return NextResponse.json({ 
        success: false,
        message: "License key not found"
      }, { status: 404 });
    }

    const keyDoc = querySnapshot.docs[0];
    const keyData = keyDoc.data();
    const keyRef = doc(firestore, 'apiKeys', keyDoc.id);

    // Check whitelist mode
    if (resetMode === 'whitelist') {
      const isWhitelisted = whitelistedUsers.includes(keyValue) || 
                           (keyData.userEmail && whitelistedUsers.includes(keyData.userEmail));
      
      if (!isWhitelisted) {
        await addDoc(collection(firestore, 'accessLogs'), {
          timestamp: new Date().toISOString(),
          eventType: "reset_hwid_denied",
          apiKeyId: keyDoc.id,
          keyValue: keyValue,
          ipAddress: request.headers.get('x-forwarded-for')?.split(',')[0] || "127.0.0.1",
          status: "denied",
          reason: "User not whitelisted for HWID reset"
        });

        return NextResponse.json({ 
          success: false,
          message: "HWID reset not allowed",
          debug: "Your account is not authorized for HWID reset. Contact administrator for permission."
        }, { status: 403 });
      }
    }

    // Check if user reset is allowed for this license (per-license setting)
    if (keyData.allowUserResetHwid === false) {
      await addDoc(collection(firestore, 'accessLogs'), {
        timestamp: new Date().toISOString(),
        eventType: "reset_hwid_denied",
        apiKeyId: keyDoc.id,
        ipAddress: request.headers.get('x-forwarded-for')?.split(',')[0] || "127.0.0.1",
        status: "denied",
        reason: "User HWID reset not allowed for this license"
      });

      return NextResponse.json({ 
        success: false,
        message: "HWID reset not allowed",
        debug: "This license does not allow user-initiated HWID resets. Contact administrator."
      }, { status: 403 });
    }

    // Check 24-hour cooldown
    if (keyData.lastHwidResetAt) {
      const lastResetTime = new Date(keyData.lastHwidResetAt);
      const now = new Date();
      const hoursSinceLastReset = (now.getTime() - lastResetTime.getTime()) / (1000 * 60 * 60);
      
      if (hoursSinceLastReset < 24) {
        const hoursRemaining = Math.ceil(24 - hoursSinceLastReset);
        
        await addDoc(collection(firestore, 'accessLogs'), {
          timestamp: new Date().toISOString(),
          eventType: "reset_hwid_cooldown",
          apiKeyId: keyDoc.id,
          ipAddress: request.headers.get('x-forwarded-for')?.split(',')[0] || "127.0.0.1",
          status: "denied",
          reason: `24-hour cooldown active: ${hoursRemaining} hours remaining`
        });

        return NextResponse.json({ 
          success: false,
          message: "HWID reset cooldown active",
          debug: `You can reset HWID again in ${hoursRemaining} hour${hoursRemaining !== 1 ? 's' : ''}`,
          hoursRemaining: hoursRemaining,
          nextResetAvailable: new Date(lastResetTime.getTime() + (24 * 60 * 60 * 1000)).toISOString()
        }, { status: 429 });
      }
    }

    // Perform HWID reset
    await updateDoc(keyRef, {
      hwid: "",
      hwidList: [],
      deviceList: [],
      boundDevices: 0,
      deviceName: "",
      pcName: "",
      lastHwidResetAt: new Date().toISOString()
    });

    // Log successful reset
    await addDoc(collection(firestore, 'accessLogs'), {
      timestamp: new Date().toISOString(),
      eventType: "reset_hwid_success",
      apiKeyId: keyDoc.id,
      ipAddress: request.headers.get('x-forwarded-for')?.split(',')[0] || "127.0.0.1",
      status: "success",
      reason: "User-initiated HWID reset"
    });

    return NextResponse.json({
      success: true,
      message: "HWID reset successfully",
      debug: "All device bindings have been cleared. You can now bind to new devices.",
      nextResetAvailable: new Date(Date.now() + (24 * 60 * 60 * 1000)).toISOString()
    });

  } catch (error: any) {
    console.error("HWID Reset Error:", error);
    return NextResponse.json({ 
      success: false,
      message: "Internal server error",
      debug: error.message
    }, { status: 500 });
  }
}
