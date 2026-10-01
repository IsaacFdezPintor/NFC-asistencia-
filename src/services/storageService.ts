import { AppSettings, AttendanceRecord, Device, Person, ShiftType, CurrentUser } from '../types';

const STORAGE_KEYS = {
  PERSONS: 'nfc_asistencia_persons_v1',
  ATTENDANCE: 'nfc_asistencia_records_v1',
  SETTINGS: 'nfc_asistencia_settings_v1',
  DEVICES: 'nfc_asistencia_devices_v1',
  CURRENT_USER: 'nfc_asistencia_user_v1',
};

const DEFAULT_SETTINGS: AppSettings = {
  morning_start: '06:00',
  morning_end: '14:00',
  afternoon_start: '14:00',
  afternoon_end: '22:00',
  duplicate_timeout_minutes: 5,
  timezone: 'Europe/Madrid',
  device_name: 'Recepción Principal',
  device_location: 'Edificio Central · Planta Baja',
  kiosk_pin: '1234',
  sound_enabled: true,
  auto_reset_seconds: 4,
};

const DEFAULT_DEVICES: Device[] = [
  {
    id: 'dev-001',
    name: 'Recepción Principal',
    location: 'Edificio Central · Planta Baja',
    active: true,
    created_at: new Date('2026-01-15T08:00:00Z').toISOString(),
  },
  {
    id: 'dev-002',
    name: 'Acceso Almacén / Logística',
    location: 'Nave Industrial B',
    active: true,
    created_at: new Date('2026-02-01T08:00:00Z').toISOString(),
  },
];

const INITIAL_PERSONS: Person[] = [
  {
    id: 'per-001',
    first_name: 'Isaac',
    last_name: 'García',
    full_name: 'Isaac García',
    photo_url: '',
    email: 'isaac.garcia@empresa.com',
    phone: '+34 611 223 344',
    internal_id: 'EMP-0101',
    nfc_uid: '04:A2:7B:91:E2',
    department: 'Dirección de Proyectos',
    active: true,
    created_at: '2026-01-10T09:00:00.000Z',
    updated_at: '2026-01-10T09:00:00.000Z',
  },
  {
    id: 'per-002',
    first_name: 'María',
    last_name: 'López',
    full_name: 'María López',
    photo_url: '',
    email: 'maria.lopez@empresa.com',
    phone: '+34 622 334 455',
    internal_id: 'EMP-0102',
    nfc_uid: '04:B3:8C:92:F3',
    department: 'Operaciones',
    active: true,
    created_at: '2026-01-12T09:00:00.000Z',
    updated_at: '2026-01-12T09:00:00.000Z',
  },
  {
    id: 'per-003',
    first_name: 'Carlos',
    last_name: 'Ruiz',
    full_name: 'Carlos Ruiz',
    photo_url: '',
    email: 'carlos.ruiz@empresa.com',
    phone: '+34 633 445 566',
    internal_id: 'EMP-0103',
    nfc_uid: '04:C4:9D:A3:04',
    department: 'Mantenimiento y Soporte',
    active: true,
    created_at: '2026-01-15T09:00:00.000Z',
    updated_at: '2026-01-15T09:00:00.000Z',
  },
  {
    id: 'per-004',
    first_name: 'Laura',
    last_name: 'Martín',
    full_name: 'Laura Martín',
    photo_url: '',
    email: 'laura.martin@empresa.com',
    phone: '+34 644 556 677',
    internal_id: 'EMP-0104',
    nfc_uid: '04:D5:AE:B4:15',
    department: 'Recursos Humanos',
    active: true,
    created_at: '2026-02-01T09:00:00.000Z',
    updated_at: '2026-02-01T09:00:00.000Z',
  },
  {
    id: 'per-005',
    first_name: 'Daniel',
    last_name: 'Sánchez',
    full_name: 'Daniel Sánchez',
    photo_url: '',
    email: 'daniel.sanchez@empresa.com',
    phone: '+34 655 667 788',
    internal_id: 'EMP-0105',
    nfc_uid: '04:E6:BF:C5:26',
    department: 'Desarrollo de Software',
    active: true,
    created_at: '2026-02-10T09:00:00.000Z',
    updated_at: '2026-02-10T09:00:00.000Z',
  },
  {
    id: 'per-006',
    first_name: 'Elena',
    last_name: 'Gómez',
    full_name: 'Elena Gómez',
    photo_url: '',
    email: 'elena.gomez@empresa.com',
    phone: '+34 666 778 899',
    internal_id: 'EMP-0106',
    nfc_uid: '04:F7:C0:D6:37',
    department: 'Administración',
    active: true,
    created_at: '2026-02-15T09:00:00.000Z',
    updated_at: '2026-02-15T09:00:00.000Z',
  },
  {
    id: 'per-007',
    first_name: 'Javier',
    last_name: 'Morales',
    full_name: 'Javier Morales',
    photo_url: '',
    email: 'javier.morales@empresa.com',
    phone: '+34 677 889 900',
    internal_id: 'EMP-0107',
    nfc_uid: '04:08:D1:E7:48',
    department: 'Logística',
    active: true,
    created_at: '2026-03-01T09:00:00.000Z',
    updated_at: '2026-03-01T09:00:00.000Z',
  },
  {
    id: 'per-008',
    first_name: 'Sofía',
    last_name: 'Romero',
    full_name: 'Sofía Romero',
    photo_url: '',
    email: 'sofia.romero@empresa.com',
    phone: '+34 688 990 011',
    internal_id: 'EMP-0108',
    nfc_uid: '04:19:E2:F8:59',
    department: 'Atención al Cliente',
    active: false, // Inactiva para probar estado
    created_at: '2026-03-10T09:00:00.000Z',
    updated_at: '2026-03-10T09:00:00.000Z',
  },
];

export function getTodayDateString(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function formatTimeHHMM(date: Date = new Date()): string {
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
}

export function formatTimeHHMMSS(date: Date = new Date()): string {
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  return `${hours}:${minutes}:${seconds}`;
}

function generateInitialAttendance(): AttendanceRecord[] {
  const today = getTodayDateString();
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
  const twoDaysAgo = new Date(Date.now() - 86400000 * 2).toISOString().split('T')[0];

  return [
    {
      id: 'att-demo-001',
      person_id: 'per-002',
      person_name: 'María López',
      nfc_uid: '04:B3:8C:92:F3',
      date: today,
      time: '09:15',
      shift: 'Mañana',
      type: 'Entrada',
      device_id: 'dev-001',
      device_name: 'Recepción Principal',
      created_at: `${today}T09:15:22.000Z`,
    },
    {
      id: 'att-demo-002',
      person_id: 'per-006',
      person_name: 'Elena Gómez',
      nfc_uid: '04:F7:C0:D6:37',
      date: today,
      time: '08:10',
      shift: 'Mañana',
      type: 'Entrada',
      device_id: 'dev-001',
      device_name: 'Recepción Principal',
      created_at: `${today}T08:10:04.000Z`,
    },
    {
      id: 'att-demo-003',
      person_id: 'per-004',
      person_name: 'Laura Martín',
      nfc_uid: '04:D5:AE:B4:15',
      date: today,
      time: '08:55',
      shift: 'Mañana',
      type: 'Entrada',
      device_id: 'dev-001',
      device_name: 'Recepción Principal',
      created_at: `${today}T08:55:12.000Z`,
    },
    // Yesterday records
    {
      id: 'att-demo-101',
      person_id: 'per-001',
      person_name: 'Isaac García',
      nfc_uid: '04:A2:7B:91:E2',
      date: yesterday,
      time: '08:40',
      shift: 'Mañana',
      type: 'Entrada',
      device_id: 'dev-001',
      device_name: 'Recepción Principal',
      created_at: `${yesterday}T08:40:00.000Z`,
    },
    {
      id: 'att-demo-102',
      person_id: 'per-003',
      person_name: 'Carlos Ruiz',
      nfc_uid: '04:C4:9D:A3:04',
      date: yesterday,
      time: '17:32',
      shift: 'Tarde',
      type: 'Entrada',
      device_id: 'dev-001',
      device_name: 'Recepción Principal',
      created_at: `${yesterday}T17:32:45.000Z`,
    },
    {
      id: 'att-demo-103',
      person_id: 'per-005',
      person_name: 'Daniel Sánchez',
      nfc_uid: '04:E6:BF:C5:26',
      date: yesterday,
      time: '09:02',
      shift: 'Mañana',
      type: 'Entrada',
      device_id: 'dev-001',
      device_name: 'Recepción Principal',
      created_at: `${yesterday}T09:02:11.000Z`,
    },
    // Two days ago
    {
      id: 'att-demo-201',
      person_id: 'per-001',
      person_name: 'Isaac García',
      nfc_uid: '04:A2:7B:91:E2',
      date: twoDaysAgo,
      time: '08:45',
      shift: 'Mañana',
      type: 'Entrada',
      device_id: 'dev-001',
      device_name: 'Recepción Principal',
      created_at: `${twoDaysAgo}T08:45:00.000Z`,
    },
    {
      id: 'att-demo-202',
      person_id: 'per-002',
      person_name: 'María López',
      nfc_uid: '04:B3:8C:92:F3',
      date: twoDaysAgo,
      time: '09:10',
      shift: 'Mañana',
      type: 'Entrada',
      device_id: 'dev-001',
      device_name: 'Recepción Principal',
      created_at: `${twoDaysAgo}T09:10:00.000Z`,
    },
  ];
}

class StorageService {
  private persons: Person[] = [];
  private attendance: AttendanceRecord[] = [];
  private settings: AppSettings = DEFAULT_SETTINGS;
  private devices: Device[] = DEFAULT_DEVICES;
  private currentUser: CurrentUser = {
    id: 'usr-admin-01',
    name: 'Isaac F.',
    email: 'isaacfdezpintor20@gmail.com',
    role: 'admin',
  };

  constructor() {
    this.init();
  }

  private init() {
    if (typeof window === 'undefined') return;

    try {
      const storedPersons = localStorage.getItem(STORAGE_KEYS.PERSONS);
      if (storedPersons) {
        this.persons = JSON.parse(storedPersons);
      } else {
        this.persons = INITIAL_PERSONS;
        this.savePersons();
      }

      const storedAttendance = localStorage.getItem(STORAGE_KEYS.ATTENDANCE);
      if (storedAttendance) {
        this.attendance = JSON.parse(storedAttendance);
      } else {
        this.attendance = generateInitialAttendance();
        this.saveAttendance();
      }

      const storedSettings = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (storedSettings) {
        this.settings = { ...DEFAULT_SETTINGS, ...JSON.parse(storedSettings) };
      } else {
        this.settings = DEFAULT_SETTINGS;
        this.saveSettings();
      }

      const storedDevices = localStorage.getItem(STORAGE_KEYS.DEVICES);
      if (storedDevices) {
        this.devices = JSON.parse(storedDevices);
      } else {
        this.devices = DEFAULT_DEVICES;
        this.saveDevices();
      }

      const storedUser = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
      if (storedUser) {
        this.currentUser = JSON.parse(storedUser);
      }
    } catch (e) {
      console.error('Error initializing storage service:', e);
      this.persons = INITIAL_PERSONS;
      this.attendance = generateInitialAttendance();
      this.settings = DEFAULT_SETTINGS;
      this.devices = DEFAULT_DEVICES;
    }
  }

  // --- Current User & Role ---
  public getCurrentUser(): CurrentUser {
    return this.currentUser;
  }

  public setCurrentUserRole(role: 'admin' | 'operator'): CurrentUser {
    this.currentUser = {
      ...this.currentUser,
      role,
      name: role === 'admin' ? 'Isaac F. (Admin)' : 'Operador Recepción',
      email: role === 'admin' ? 'isaacfdezpintor20@gmail.com' : 'operador@centro.es',
    };
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(this.currentUser));
    }
    return this.currentUser;
  }

  // --- Persons ---
  public getPersons(): Person[] {
    return [...this.persons];
  }

  public getPersonById(id: string): Person | undefined {
    return this.persons.find((p) => p.id === id);
  }

  public getPersonByNfcUid(uid: string): Person | undefined {
    const cleanUid = uid.trim().toUpperCase();
    return this.persons.find(
      (p) => p.nfc_uid.trim().toUpperCase() === cleanUid
    );
  }

  public isNfcUidAssigned(uid: string, excludePersonId?: string): { assigned: boolean; person?: Person } {
    const cleanUid = uid.trim().toUpperCase();
    const found = this.persons.find(
      (p) => p.nfc_uid.trim().toUpperCase() === cleanUid && p.id !== excludePersonId
    );
    return {
      assigned: !!found,
      person: found,
    };
  }

  public createPerson(data: Omit<Person, 'id' | 'full_name' | 'created_at' | 'updated_at'>): Person {
    const newPerson: Person = {
      ...data,
      id: 'per-' + Math.random().toString(36).substring(2, 9),
      full_name: `${data.first_name.trim()} ${data.last_name.trim()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    this.persons.unshift(newPerson);
    this.savePersons();
    return newPerson;
  }

  public updatePerson(id: string, updates: Partial<Person>): Person | null {
    const index = this.persons.findIndex((p) => p.id === id);
    if (index === -1) return null;

    const current = this.persons[index];
    const updated: Person = {
      ...current,
      ...updates,
      full_name:
        updates.first_name || updates.last_name
          ? `${(updates.first_name ?? current.first_name).trim()} ${(updates.last_name ?? current.last_name).trim()}`
          : current.full_name,
      updated_at: new Date().toISOString(),
    };

    this.persons[index] = updated;
    this.savePersons();
    return updated;
  }

  public deletePerson(id: string): boolean {
    const beforeLength = this.persons.length;
    this.persons = this.persons.filter((p) => p.id !== id);
    if (this.persons.length !== beforeLength) {
      this.savePersons();
      return true;
    }
    return false;
  }

  private savePersons() {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.PERSONS, JSON.stringify(this.persons));
    }
  }

  // --- Attendance ---
  public getAttendanceRecords(): AttendanceRecord[] {
    return [...this.attendance].sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  }

  public getTodayAttendance(): AttendanceRecord[] {
    const today = getTodayDateString();
    return this.attendance
      .filter((r) => r.date === today)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  public getAttendanceForDate(dateStr: string): AttendanceRecord[] {
    return this.attendance
      .filter((r) => r.date === dateStr)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  public getAttendanceForPerson(personId: string): AttendanceRecord[] {
    return this.attendance
      .filter((r) => r.person_id === personId)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  /**
   * Determine Shift automatically based on current HH:MM and settings
   */
  public calculateShift(timeStr: string = formatTimeHHMM()): ShiftType {
    const [h, m] = timeStr.split(':').map(Number);
    const totalMinutes = h * 60 + m;

    const [mStartH, mStartM] = this.settings.morning_start.split(':').map(Number);
    const morningStart = mStartH * 60 + mStartM;

    const [mEndH, mEndM] = this.settings.morning_end.split(':').map(Number);
    const morningEnd = mEndH * 60 + mEndM;

    const [aStartH, aStartM] = this.settings.afternoon_start.split(':').map(Number);
    const afternoonStart = aStartH * 60 + aStartM;

    const [aEndH, aEndM] = this.settings.afternoon_end.split(':').map(Number);
    const afternoonEnd = aEndH * 60 + aEndM;

    if (totalMinutes >= morningStart && totalMinutes < morningEnd) {
      return 'Mañana';
    } else if (totalMinutes >= afternoonStart && totalMinutes < afternoonEnd) {
      return 'Tarde';
    } else {
      return 'Noche';
    }
  }

  /**
   * Check if this person already has a recent attendance record today
   */
  public checkDuplicate(personId: string): { isDuplicate: boolean; lastRecord?: AttendanceRecord } {
    const today = getTodayDateString();
    const todayRecords = this.attendance
      .filter((r) => r.person_id === personId && r.date === today)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    if (todayRecords.length === 0) {
      return { isDuplicate: false };
    }

    const lastRecord = todayRecords[0];
    const recordTime = new Date(lastRecord.created_at).getTime();
    const now = Date.now();
    const diffMinutes = (now - recordTime) / (1000 * 60);

    // If within anti-duplicate timeout (or same day policy)
    if (diffMinutes < this.settings.duplicate_timeout_minutes || diffMinutes >= 0) {
      return {
        isDuplicate: true,
        lastRecord,
      };
    }

    return { isDuplicate: false };
  }

  /**
   * Create new attendance record
   */
  public recordAttendance(person: Person, options?: { force?: boolean }): { success: boolean; record: AttendanceRecord } {
    const now = new Date();
    const dateStr = getTodayDateString();
    const timeStr = formatTimeHHMM(now);
    const shift = this.calculateShift(timeStr);

    const newRecord: AttendanceRecord = {
      id: 'att-' + Math.random().toString(36).substring(2, 9),
      person_id: person.id,
      person_name: person.full_name,
      nfc_uid: person.nfc_uid,
      date: dateStr,
      time: timeStr,
      shift,
      type: 'Entrada',
      device_id: 'dev-001',
      device_name: this.settings.device_name,
      created_at: now.toISOString(),
    };

    this.attendance.unshift(newRecord);
    this.saveAttendance();

    return { success: true, record: newRecord };
  }

  public deleteAttendance(id: string): boolean {
    const prev = this.attendance.length;
    this.attendance = this.attendance.filter((r) => r.id !== id);
    if (this.attendance.length !== prev) {
      this.saveAttendance();
      return true;
    }
    return false;
  }

  private saveAttendance() {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.ATTENDANCE, JSON.stringify(this.attendance));
    }
  }

  // --- Statistics ---
  public getStatsToday() {
    const today = getTodayDateString();
    const todayRecords = this.attendance.filter((r) => r.date === today);

    // Unique persons present today
    const uniquePersonsToday = new Set(todayRecords.map((r) => r.person_id)).size;
    const morningCount = todayRecords.filter((r) => r.shift === 'Mañana').length;
    const afternoonCount = todayRecords.filter((r) => r.shift === 'Tarde').length;
    const totalPersons = this.persons.filter((p) => p.active).length;

    return {
      presentesHoy: uniquePersonsToday,
      manana: morningCount,
      tarde: afternoonCount,
      totalPersonas: totalPersons,
    };
  }

  // --- Settings ---
  public getSettings(): AppSettings {
    return { ...this.settings };
  }

  public updateSettings(newSettings: Partial<AppSettings>): AppSettings {
    this.settings = { ...this.settings, ...newSettings };
    this.saveSettings();
    return { ...this.settings };
  }

  private saveSettings() {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(this.settings));
    }
  }

  // --- Devices ---
  public getDevices(): Device[] {
    return [...this.devices];
  }

  private saveDevices() {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.DEVICES, JSON.stringify(this.devices));
    }
  }

  // --- Reset demo data ---
  public resetToDefaultDemo(): void {
    this.persons = INITIAL_PERSONS;
    this.attendance = generateInitialAttendance();
    this.settings = DEFAULT_SETTINGS;
    this.devices = DEFAULT_DEVICES;
    this.savePersons();
    this.saveAttendance();
    this.saveSettings();
    this.saveDevices();
  }

  // --- Export CSV ---
  public exportCsv(records?: AttendanceRecord[]): void {
    const dataToExport = records || this.getAttendanceRecords();

    const headers = [
      'ID Registro',
      'ID Persona',
      'Nombre y Apellidos',
      'UID NFC',
      'Fecha',
      'Hora',
      'Franja Horaria',
      'Tipo',
      'Dispositivo',
      'Fecha Exacta Creación (ISO)',
    ];

    const rows = dataToExport.map((r) => [
      `"${r.id}"`,
      `"${r.person_id}"`,
      `"${r.person_name}"`,
      `"${r.nfc_uid}"`,
      `"${r.date}"`,
      `"${r.time}"`,
      `"${r.shift}"`,
      `"${r.type}"`,
      `"${r.device_name}"`,
      `"${r.created_at}"`,
    ]);

    const csvContent = '\uFEFF' + [headers.join(';'), ...rows.map((row) => row.join(';'))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `asistencias_nfc_${getTodayDateString()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}

export const storageService = new StorageService();
