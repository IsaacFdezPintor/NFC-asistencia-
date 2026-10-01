/**
 * Control de Asistencia por Tarjetas NFC
 * Web App moderna para tabletas y dispositivos administradores
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Navbar } from './components/Navbar';
import { StatCounters } from './components/StatCounters';
import { NFCScannerCard } from './components/NFCScannerCard';
import { NFCSimulatorDrawer } from './components/NFCSimulatorDrawer';
import { TodayAttendanceTable } from './components/TodayAttendanceTable';
import { PersonsView } from './components/PersonsView';
import { PersonProfileModal } from './components/PersonProfileModal';
import { HistoryView } from './components/HistoryView';
import { CalendarView } from './components/CalendarView';
import { SettingsView } from './components/SettingsView';
import { KioskModeView } from './components/KioskModeView';

import { 
  Person, 
  AttendanceRecord, 
  AppSettings, 
  CurrentUser, 
  NFCScanState, 
  NFCReaderStatus 
} from './types';
import { storageService } from './services/storageService';
import { nfcService } from './services/nfcService';

export default function App() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'persons' | 'history' | 'calendar' | 'settings'>('dashboard');
  const [isKioskMode, setIsKioskMode] = useState<boolean>(false);
  
  // Data state
  const [currentUser, setCurrentUser] = useState<CurrentUser>(storageService.getCurrentUser());
  const [settings, setSettings] = useState<AppSettings>(storageService.getSettings());
  const [persons, setPersons] = useState<Person[]>(storageService.getPersons());
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>(storageService.getAttendanceRecords());
  const [todayAttendance, setTodayAttendance] = useState<AttendanceRecord[]>(storageService.getTodayAttendance());
  const [stats, setStats] = useState(storageService.getStatsToday());

  // NFC & Scanner state
  const [scanState, setScanState] = useState<NFCScanState>({ status: 'idle' });
  const [nfcStatus, setNfcStatus] = useState<NFCReaderStatus>(nfcService.getStatus());
  const [selectedPersonForProfile, setSelectedPersonForProfile] = useState<Person | null>(null);
  const [initialAssignUid, setInitialAssignUid] = useState<string | null>(null);

  // Synchronize and refresh local storage data
  const refreshData = useCallback(() => {
    setPersons(storageService.getPersons());
    setAttendanceRecords(storageService.getAttendanceRecords());
    setTodayAttendance(storageService.getTodayAttendance());
    setStats(storageService.getStatsToday());
    setSettings(storageService.getSettings());
    setCurrentUser(storageService.getCurrentUser());
  }, []);

  // Process an incoming NFC Card UID detection event
  const handleCardDetected = useCallback((uid: string) => {
    const status = nfcService.getStatus();
    if (!status.isConnected) {
      setScanState({
        status: 'error',
        errorMessage: 'El lector de NFC se encuentra desconectado.',
      });
      return;
    }

    const cleanUid = uid.trim().toUpperCase();
    const person = storageService.getPersonByNfcUid(cleanUid);

    // 1. Unrecognized Card
    if (!person) {
      if (settings.sound_enabled) nfcService.playFeedbackSound('warning');
      setScanState({
        status: 'unrecognized',
        nfcUid: cleanUid,
      });
      return;
    }

    // 2. Inactive Person
    if (!person.active) {
      if (settings.sound_enabled) nfcService.playFeedbackSound('error');
      setScanState({
        status: 'inactive',
        person,
        nfcUid: cleanUid,
      });
      return;
    }

    // 3. Duplicate check for today
    const duplicateCheck = storageService.checkDuplicate(person.id);
    if (duplicateCheck.isDuplicate) {
      if (settings.sound_enabled) nfcService.playFeedbackSound('warning');
      setScanState({
        status: 'duplicate',
        person,
        lastRecord: duplicateCheck.lastRecord,
        nfcUid: cleanUid,
      });
      return;
    }

    // 4. Valid check-in! Record attendance
    const result = storageService.recordAttendance(person);
    if (settings.sound_enabled) nfcService.playFeedbackSound('success');

    setScanState({
      status: 'success',
      person,
      record: result.record,
      nfcUid: cleanUid,
    });

    // Refresh today table and counters instantly
    refreshData();
  }, [settings.sound_enabled, refreshData]);

  // Connect and start NFC Reader listener on mount
  useEffect(() => {
    nfcService.startScanning().catch((e) => console.warn('Could not start Web NFC:', e));
    setNfcStatus(nfcService.getStatus());

    const unsubscribe = nfcService.onCardDetected((uid) => {
      handleCardDetected(uid);
    });

    return () => {
      unsubscribe();
      nfcService.stopScanning();
    };
  }, [handleCardDetected]);

  // Handle force register when duplicate was detected ("Registrar igualmente")
  const handleForceRegister = () => {
    if (!scanState.person) return;
    const result = storageService.recordAttendance(scanState.person, { force: true });
    if (settings.sound_enabled) nfcService.playFeedbackSound('success');

    setScanState({
      status: 'success',
      person: scanState.person,
      record: result.record,
      nfcUid: scanState.nfcUid,
    });

    refreshData();
  };

  // Switch to Persons tab to assign an unrecognized card
  const handleAssignUnrecognized = (uid: string) => {
    setInitialAssignUid(uid);
    setActiveTab('persons');
    setScanState({ status: 'idle' });
  };

  // Toggle NFC connection status
  const handleToggleNfcStatus = () => {
    setNfcStatus(nfcService.getStatus());
  };

  // Sound toggle
  const handleToggleSound = () => {
    const updated = storageService.updateSettings({
      sound_enabled: !settings.sound_enabled,
    });
    setSettings(updated);
  };

  // Role change
  const handleRoleChange = (role: 'admin' | 'operator') => {
    const updated = storageService.setCurrentUserRole(role);
    setCurrentUser(updated);
  };

  // Reset Demo Data
  const handleResetDemo = () => {
    storageService.resetToDefaultDemo();
    refreshData();
    setScanState({ status: 'idle' });
  };

  // Render Kiosk Mode View
  if (isKioskMode) {
    return (
      <KioskModeView
        settings={settings}
        nfcStatus={nfcStatus}
        scanState={scanState}
        onResetScanState={() => setScanState({ status: 'idle' })}
        onForceRegister={handleForceRegister}
        onExitKiosk={() => setIsKioskMode(false)}
        currentUser={currentUser}
        soundEnabled={settings.sound_enabled}
        onToggleSound={handleToggleSound}
        onTriggerCardTap={(uid) => nfcService.triggerCard(uid)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-900 selection:bg-indigo-500 selection:text-white">
      
      {/* Top Header Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentUser={currentUser}
        onRoleChange={handleRoleChange}
        onEnterKiosk={() => setIsKioskMode(true)}
        nfcStatus={nfcStatus}
        onToggleNfcStatus={handleToggleNfcStatus}
      />

      {/* Main Content Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        
        {/* TAB 1: DASHBOARD (PANEL PRINCIPAL) */}
        {activeTab === 'dashboard' && (
          <div className="animate-fade-in">
            {/* Top 4 Stat Counters */}
            <StatCounters
              presentesHoy={stats.presentesHoy}
              manana={stats.manana}
              tarde={stats.tarde}
              totalPersonas={stats.totalPersonas}
            />

            {/* Central NFC Card Reader */}
            <NFCScannerCard
              scanState={scanState}
              onReset={() => setScanState({ status: 'idle' })}
              onForceRegister={handleForceRegister}
              onAssignUnrecognized={handleAssignUnrecognized}
              currentUser={currentUser}
              soundEnabled={settings.sound_enabled}
              onToggleSound={handleToggleSound}
              autoResetSeconds={settings.auto_reset_seconds}
            />

            {/* Hardware NFC Simulator & Quick-Tap Test Drawer */}
            <NFCSimulatorDrawer
              persons={persons}
              onTriggerScan={(uid) => nfcService.triggerCard(uid)}
            />

            {/* Today's Attendance Table */}
            <TodayAttendanceTable
              records={todayAttendance}
              onSelectPerson={(personId) => {
                const found = storageService.getPersonById(personId);
                if (found) setSelectedPersonForProfile(found);
              }}
            />
          </div>
        )}

        {/* TAB 2: PERSONAS */}
        {activeTab === 'persons' && (
          <div className="animate-fade-in">
            <PersonsView
              persons={persons}
              onRefresh={refreshData}
              currentUser={currentUser}
              onSelectPerson={(personId) => {
                const found = storageService.getPersonById(personId);
                if (found) setSelectedPersonForProfile(found);
              }}
              initialAssignUid={initialAssignUid}
              onClearInitialAssignUid={() => setInitialAssignUid(null)}
            />
          </div>
        )}

        {/* TAB 3: HISTÓRICO */}
        {activeTab === 'history' && (
          <div className="animate-fade-in">
            <HistoryView
              records={attendanceRecords}
              persons={persons}
              onRefresh={refreshData}
              currentUser={currentUser}
              onSelectPerson={(personId) => {
                const found = storageService.getPersonById(personId);
                if (found) setSelectedPersonForProfile(found);
              }}
            />
          </div>
        )}

        {/* TAB 4: CALENDARIO */}
        {activeTab === 'calendar' && (
          <div className="animate-fade-in">
            <CalendarView
              records={attendanceRecords}
              persons={persons}
              onSelectPerson={(personId) => {
                const found = storageService.getPersonById(personId);
                if (found) setSelectedPersonForProfile(found);
              }}
            />
          </div>
        )}

        {/* TAB 5: CONFIGURACIÓN */}
        {activeTab === 'settings' && currentUser.role === 'admin' && (
          <div className="animate-fade-in">
            <SettingsView
              settings={settings}
              onUpdateSettings={(newSettings) => {
                storageService.updateSettings(newSettings);
                refreshData();
              }}
              onResetDemo={handleResetDemo}
              currentUser={currentUser}
            />
          </div>
        )}

      </main>

      {/* Person Profile Modal (Accessible from any view by clicking a person) */}
      {selectedPersonForProfile && (
        <PersonProfileModal
          person={selectedPersonForProfile}
          attendanceRecords={attendanceRecords}
          onClose={() => setSelectedPersonForProfile(null)}
        />
      )}

      {/* Minimalist Professional Footer */}
      <footer className="border-t border-slate-200 bg-white py-4 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-800">Control de Asistencia NFC</span>
            <span>·</span>
            <span>{settings.device_name}</span>
            <span>·</span>
            <span className="font-mono text-slate-400">{settings.device_location}</span>
          </div>
          <div>
            <span> Diseñado por Isaac Fernández Pintor </span>
          </div>
        </div>
      </footer>

    </div>
  );
}
