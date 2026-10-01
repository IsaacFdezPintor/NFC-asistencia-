export type ShiftType = 'Mañana' | 'Tarde' | 'Noche';
export type RecordType = 'Entrada' | 'Salida';
export type UserRole = 'admin' | 'operator';

export interface Person {
  id: string;
  first_name: string;
  last_name: string;
  full_name: string;
  photo_url?: string;
  email?: string;
  phone?: string;
  internal_id: string;
  nfc_uid: string;
  active: boolean;
  department?: string;
  created_at: string;
  updated_at: string;
}

export interface AttendanceRecord {
  id: string;
  person_id: string;
  person_name: string;
  nfc_uid: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM:SS
  shift: ShiftType;
  type: RecordType;
  device_id: string;
  device_name: string;
  created_at: string; // ISO string
}

export interface Device {
  id: string;
  name: string;
  location: string;
  active: boolean;
  created_at: string;
}

export interface AppSettings {
  morning_start: string; // '06:00'
  morning_end: string;   // '14:00'
  afternoon_start: string; // '14:00'
  afternoon_end: string;   // '22:00'
  duplicate_timeout_minutes: number; // default 5
  timezone: string; // 'Europe/Madrid'
  device_name: string; // 'Recepción Principal'
  device_location: string; // 'Entrada Principal'
  kiosk_pin: string; // '1234'
  sound_enabled: boolean;
  auto_reset_seconds: number; // 4 seconds
}

export interface CurrentUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

export interface NFCScanState {
  status: 'idle' | 'scanning' | 'success' | 'duplicate' | 'unrecognized' | 'inactive' | 'error';
  person?: Person | null;
  record?: AttendanceRecord | null;
  lastRecord?: AttendanceRecord | null;
  nfcUid?: string;
  errorMessage?: string;
  timestamp?: string;
}

export interface NFCReaderStatus {
  isWebNFCSupported: boolean;
  isConnected: boolean;
  isScanning: boolean;
  mode: 'web-nfc' | 'keyboard-wedge' | 'simulated';
  error: string | null;
}
