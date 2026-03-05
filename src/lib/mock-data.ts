
export type KeyStatus = 'active' | 'revoked' | 'expired' | 'blocked';

export interface AuthKey {
  id: string;
  key: string;
  status: KeyStatus;
  user: string;
  expiresAt: string;
  multiDevice: boolean;
  vpnAllowed: boolean;
  deviceLimit: number;
  hwid?: string;
  pcName?: string;
  lastLogin?: string;
}

export interface AccessLog {
  id: string;
  keyId: string;
  timestamp: string;
  ip: string;
  device: string;
  os: string;
  vpn: boolean;
  location: string;
  pcName: string;
}

export const MOCK_KEYS: AuthKey[] = [
  { id: '1', key: 'KG-8291-AABB', status: 'active', user: 'jdoe_dev', expiresAt: '2025-12-31', multiDevice: true, vpnAllowed: false, deviceLimit: 3, hwid: 'BFEBFBFF000906E3', pcName: 'DESKTOP-DEV', lastLogin: '2023-10-27T14:22:01Z' },
  { id: '2', key: 'KG-7712-CCDD', status: 'revoked', user: 'admin_test', expiresAt: '2024-05-20', multiDevice: false, vpnAllowed: true, deviceLimit: 1 },
  { id: '3', key: 'KG-0019-EEFF', status: 'active', user: 'guest_user', expiresAt: '2025-01-15', multiDevice: false, vpnAllowed: false, deviceLimit: 1, hwid: 'ABC-123-XYZ', pcName: 'GUEST-PC' },
  { id: '4', key: 'KG-BLOCK-9900', status: 'blocked', user: 'cheater_x', expiresAt: '2025-12-31', multiDevice: false, vpnAllowed: false, deviceLimit: 1, hwid: 'CRACKED-HWID' },
];

export const MOCK_LOGS: AccessLog[] = [
  { id: 'l1', keyId: '1', timestamp: '2023-10-27 14:22:01', ip: '192.168.1.1', device: 'Desktop', os: 'Windows 11', vpn: false, location: 'New York, US', pcName: 'DESKTOP-R90X' },
  { id: 'l2', keyId: '1', timestamp: '2023-10-27 12:05:44', ip: '104.28.19.1', device: 'iPhone 15', os: 'iOS 17', vpn: true, location: 'London, UK', pcName: 'My-iPhone' },
  { id: 'l3', keyId: '3', timestamp: '2023-10-26 09:15:22', ip: '45.122.3.91', device: 'MacBook Pro', os: 'macOS Sonoma', vpn: false, location: 'Berlin, DE', pcName: 'MACBOOK-AIR-M2' },
];
