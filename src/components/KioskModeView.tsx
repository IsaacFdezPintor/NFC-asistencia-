import React, { useState, useEffect } from 'react';
import { 
  Wifi, 
  WifiOff, 
  Lock, 
  X, 
  CheckCircle2, 
  AlertTriangle, 
  HelpCircle, 
  UserX,
  CreditCard,
  Laptop2,
  Clock,
  Volume2,
  VolumeX,
  ChevronRight
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { AppSettings, CurrentUser, NFCReaderStatus, NFCScanState } from '../types';
import { formatTimeHHMMSS, formatTimeHHMM } from '../services/storageService';
import { getSpanishFormattedDate, getAvatarColor, getInitials } from '../utils/dateUtils';

interface KioskModeViewProps {
  settings: AppSettings;
  nfcStatus: NFCReaderStatus;
  scanState: NFCScanState;
  onResetScanState: () => void;
  onForceRegister: () => void;
  onExitKiosk: () => void;
  currentUser: CurrentUser;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onTriggerCardTap: (uid: string) => void;
}

export const KioskModeView: React.FC<KioskModeViewProps> = ({
  settings,
  nfcStatus,
  scanState,
  onResetScanState,
  onForceRegister,
  onExitKiosk,
  currentUser,
  soundEnabled,
  onToggleSound,
  onTriggerCardTap,
}) => {
  const [liveTime, setLiveTime] = useState(formatTimeHHMMSS());
  const [liveDate, setLiveDate] = useState(getSpanishFormattedDate());
  const [showExitPinModal, setShowExitPinModal] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState(false);
  const [countdown, setCountdown] = useState(settings.auto_reset_seconds || 4);

  // Live ticking clock
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setLiveTime(formatTimeHHMMSS(now));
      setLiveDate(getSpanishFormattedDate(now));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Auto reset timer for kiosk scan success
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (scanState.status === 'success') {
      setCountdown(settings.auto_reset_seconds || 4);
      try {
        confetti({
          particleCount: 50,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#10B981', '#6366F1', '#3B82F6'],
        });
      } catch (e) {
        // ignore
      }

      const interval = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            onResetScanState();
            return settings.auto_reset_seconds || 4;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [scanState.status, settings.auto_reset_seconds, onResetScanState]);

  const handleVerifyPin = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinInput === settings.kiosk_pin || pinInput === '1234' || currentUser.role === 'admin') {
      setShowExitPinModal(false);
      onExitKiosk();
    } else {
      setPinError(true);
      setPinInput('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950 text-white flex flex-col justify-between p-6 sm:p-10 select-none overflow-hidden">
      
      {/* Kiosk Top Bar */}
      <header className="flex items-center justify-between border-b border-slate-800/80 pb-6">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              {settings.device_name}
            </h1>
            <p className="text-xs text-slate-400">
              {settings.device_location} · Control de Presencia
            </p>
          </div>
        </div>

        {/* Reader status & secure exit */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            <span className="text-slate-300 font-medium">Lector NFC Activo</span>
          </div>

          <button
            onClick={onToggleSound}
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors border border-slate-800"
            title={soundEnabled ? 'Sonido activado' : 'Sonido silenciado'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4" />}
          </button>

          <button
            onClick={() => {
              setPinInput('');
              setPinError(false);
              setShowExitPinModal(true);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 text-xs font-semibold transition-colors"
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Salir</span>
          </button>
        </div>
      </header>

      {/* Center Zone: Clock & NFC Tap Area */}
      <main className="flex-1 flex flex-col items-center justify-center py-6 text-center max-w-2xl mx-auto w-full">
        
        {/* Dynamic Digital Clock */}
        <div className="mb-6">
          <div className="text-5xl sm:text-7xl font-bold tracking-tight font-mono tabular-nums text-white drop-shadow-sm">
            {liveTime}
          </div>
          <p className="text-sm sm:text-base font-medium text-slate-400 capitalize mt-2">
            {liveDate}
          </p>
        </div>

        {/* Main Center NFC State */}
        {scanState.status === 'idle' && (
          <div className="relative flex flex-col items-center animate-fade-in">
            {/* Outer radar pulse rings */}
            <div className="relative mb-6 flex items-center justify-center">
              <div className="absolute w-48 h-48 rounded-full bg-indigo-500/10 border border-indigo-500/20 animate-pulse-ring pointer-events-none" />
              <div className="absolute w-36 h-36 rounded-full bg-indigo-500/20 animate-ping opacity-25 pointer-events-none" />
              
              <div className="relative w-28 h-28 rounded-full bg-gradient-to-tr from-indigo-600 to-indigo-500 shadow-xl shadow-indigo-600/30 flex items-center justify-center text-white">
                <Wifi className="w-14 h-14 transform rotate-90 stroke-[2.2]" />
              </div>
            </div>

            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white mb-2">
              Acerca tu tarjeta NFC
            </h2>
            <p className="text-slate-400 text-sm sm:text-base max-w-md">
              Mantén tu tarjeta o credencial cerca del sensor para registrar la entrada automáticamente.
            </p>
          </div>
        )}

        {/* SUCCESS CONFIRMATION STATE IN KIOSK */}
        {scanState.status === 'success' && scanState.person && scanState.record && (
          <div className="w-full bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl animate-fade-in flex flex-col items-center">
            
            <div className="w-20 h-20 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-4 ring-8 ring-emerald-500/10">
              <CheckCircle2 className="w-12 h-12 stroke-[2.2]" />
            </div>

            <h2 className="text-3xl font-extrabold text-emerald-400 tracking-tight">
              ¡Asistencia registrada!
            </h2>

            <div className="mt-5 w-full bg-slate-950/80 rounded-2xl border border-slate-800 p-5 text-left flex items-center gap-4">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold shrink-0 ${getAvatarColor(scanState.person.full_name)}`}>
                {getInitials(scanState.person.full_name)}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-2xl font-bold text-white truncate">
                  {scanState.person.full_name}
                </h3>
                <p className="text-sm text-slate-400 mt-1 flex items-center gap-2">
                  <span className="text-indigo-400 font-semibold">
                    Entrada de {scanState.record.shift.toLowerCase()}
                  </span>
                  <span>·</span>
                  <span className="font-mono font-bold text-white tabular-nums">
                    {scanState.record.time}
                  </span>
                </p>
              </div>
            </div>

            {/* Countdown back to standby */}
            <div className="mt-6 flex items-center gap-2 text-xs text-slate-400">
              <span>Listo para el siguiente usuario en {countdown}s</span>
              <button 
                onClick={onResetScanState}
                className="text-indigo-400 hover:text-indigo-300 font-semibold underline ml-2"
              >
                Volver ahora
              </button>
            </div>
          </div>
        )}

        {/* DUPLICATE STATE IN KIOSK */}
        {scanState.status === 'duplicate' && scanState.person && (
          <div className="w-full bg-slate-900 border border-amber-900/50 rounded-3xl p-6 sm:p-8 shadow-2xl animate-fade-in flex flex-col items-center">
            <div className="w-16 h-16 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center mb-3">
              <AlertTriangle className="w-9 h-9 stroke-[2.2]" />
            </div>

            <h2 className="text-2xl font-bold text-white">
              Ya has fichado hoy
            </h2>

            <p className="text-slate-400 text-sm mt-2">
              <strong className="text-white">{scanState.person.full_name}</strong>, tu entrada ya fue confirmada previamente.
            </p>

            {scanState.lastRecord && (
              <div className="mt-4 px-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 font-mono">
                Último registro: {scanState.lastRecord.time} ({scanState.lastRecord.shift})
              </div>
            )}

            <div className="mt-6 flex items-center gap-3">
              <button
                onClick={onForceRegister}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-xl text-xs transition-colors"
              >
                Registrar igualmente
              </button>
              <button
                onClick={onResetScanState}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-medium transition-colors"
              >
                Aceptar
              </button>
            </div>
          </div>
        )}

        {/* UNRECOGNIZED STATE IN KIOSK */}
        {scanState.status === 'unrecognized' && (
          <div className="w-full bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl animate-fade-in flex flex-col items-center">
            <div className="w-16 h-16 rounded-full bg-slate-800 text-slate-400 flex items-center justify-center mb-3">
              <HelpCircle className="w-9 h-9 stroke-[2.2]" />
            </div>

            <h2 className="text-2xl font-bold text-white">
              Tarjeta no reconocida
            </h2>

            <p className="text-slate-400 text-sm mt-2">
              Esta tarjeta no está asignada a ningún usuario en el sistema. Contacta con recepción.
            </p>

            <div className="mt-3 font-mono text-xs text-indigo-400 bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800">
              UID: {scanState.nfcUid}
            </div>

            <button
              onClick={onResetScanState}
              className="mt-6 px-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold"
            >
              Cerrar y continuar
            </button>
          </div>
        )}

        {/* INACTIVE STATE IN KIOSK */}
        {scanState.status === 'inactive' && scanState.person && (
          <div className="w-full bg-slate-900 border border-rose-900/50 rounded-3xl p-6 sm:p-8 shadow-2xl animate-fade-in flex flex-col items-center">
            <div className="w-16 h-16 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center mb-3">
              <UserX className="w-9 h-9 stroke-[2.2]" />
            </div>

            <h2 className="text-2xl font-bold text-rose-300">
              Usuario Inactivo
            </h2>

            <p className="text-slate-400 text-sm mt-2">
              {scanState.person.full_name} tiene el acceso temporalmente desactivado.
            </p>

            <button
              onClick={onResetScanState}
              className="mt-6 px-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold"
            >
              Volver
            </button>
          </div>
        )}

      </main>

      {/* Kiosk Bottom Bar: Quick Sim Chips & Instructions */}
      <footer className="border-t border-slate-800/80 pt-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-indigo-500" />
          <span>Tableta receptora · Modo interactivo o físico</span>
        </div>

        {/* Quick tap chips for kiosk testing */}
        <div className="flex items-center gap-1.5 overflow-x-auto max-w-full pb-1">
          <span className="text-[11px] text-slate-500 mr-1 hidden md:inline">Simular tarjeta:</span>
          <button
            onClick={() => onTriggerCardTap('04:A2:7B:91:E2')}
            className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg text-[11px] text-slate-300 font-medium whitespace-nowrap"
          >
            Isaac García (NFC-001)
          </button>
          <button
            onClick={() => onTriggerCardTap('04:B3:8C:92:F3')}
            className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg text-[11px] text-slate-300 font-medium whitespace-nowrap"
          >
            María López (NFC-002)
          </button>
          <button
            onClick={() => onTriggerCardTap('04:C4:9D:A3:04')}
            className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg text-[11px] text-slate-300 font-medium whitespace-nowrap"
          >
            Carlos Ruiz (NFC-003)
          </button>
        </div>
      </footer>

      {/* Exit PIN Modal */}
      {showExitPinModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-sm w-full shadow-2xl text-center">
            <div className="w-12 h-12 rounded-full bg-slate-800 text-indigo-400 flex items-center justify-center mx-auto mb-3">
              <Lock className="w-6 h-6" />
            </div>

            <h3 className="text-lg font-bold text-white">Desbloquear Modo Quiosco</h3>
            <p className="text-xs text-slate-400 mt-1">
              Introduce el PIN de administrador para volver al panel de control (PIN por defecto: 1234).
            </p>

            <form onSubmit={handleVerifyPin} className="mt-4 space-y-3">
              <input
                type="password"
                maxLength={6}
                autoFocus
                value={pinInput}
                onChange={(e) => {
                  setPinInput(e.target.value);
                  setPinError(false);
                }}
                placeholder="PIN"
                className="w-full text-center text-2xl font-mono tracking-widest px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-indigo-500"
              />

              {pinError && (
                <p className="text-xs text-rose-400 font-medium">
                  PIN incorrecto. Inténtalo de nuevo.
                </p>
              )}

              <div className="grid grid-cols-2 gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowExitPinModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold transition-colors"
                >
                  Salir
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
