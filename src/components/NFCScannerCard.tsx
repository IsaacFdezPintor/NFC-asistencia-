import React, { useEffect, useState } from 'react';
import { 
  Wifi, 
  CheckCircle2, 
  AlertTriangle, 
  HelpCircle, 
  UserX, 
  ArrowRight, 
  Sparkles,
  RefreshCw,
  Clock,
  Calendar,
  Volume2,
  VolumeX,
  Plus
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { NFCScanState, CurrentUser } from '../types';
import { getAvatarColor, getInitials, getShortSpanishDate } from '../utils/dateUtils';

interface NFCScannerCardProps {
  scanState: NFCScanState;
  onReset: () => void;
  onForceRegister: () => void;
  onAssignUnrecognized: (uid: string) => void;
  currentUser: CurrentUser;
  soundEnabled: boolean;
  onToggleSound: () => void;
  autoResetSeconds: number;
}

export const NFCScannerCard: React.FC<NFCScannerCardProps> = ({
  scanState,
  onReset,
  onForceRegister,
  onAssignUnrecognized,
  currentUser,
  soundEnabled,
  onToggleSound,
  autoResetSeconds = 4,
}) => {
  const [countdown, setCountdown] = useState(autoResetSeconds);

  // Auto-reset timer for success state
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (scanState.status === 'success') {
      setCountdown(autoResetSeconds);
      
      // Trigger a light confetti pop for celebration
      try {
        confetti({
          particleCount: 40,
          spread: 60,
          origin: { y: 0.6 },
          colors: ['#10B981', '#6366F1', '#3B82F6'],
          disableForReducedMotion: true,
        });
      } catch (e) {
        // ignore
      }

      const interval = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            onReset();
            return autoResetSeconds;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [scanState.status, autoResetSeconds, onReset]);

  return (
    <div className="relative overflow-hidden rounded-2xl bg-white border border-slate-200/80 shadow-sm transition-all p-6 sm:p-8 lg:p-10 mb-8 text-center min-h-[380px] flex flex-col justify-center items-center">
      
      {/* Top right subtle sound toggle */}
      <div className="absolute top-4 right-4 flex items-center gap-2">
        <button
          onClick={onToggleSound}
          title={soundEnabled ? 'Sonido activado' : 'Sonido silenciado'}
          className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
        >
          {soundEnabled ? (
            <Volume2 className="w-4 h-4 text-emerald-600" />
          ) : (
            <VolumeX className="w-4 h-4 text-slate-400" />
          )}
        </button>
      </div>

      {/* STATE 1: IDLE / WAITING FOR NFC */}
      {scanState.status === 'idle' && (
        <div className="flex flex-col items-center max-w-md mx-auto my-auto animate-fade-in">
          
          {/* Animated NFC Contactless Target */}
          <div className="relative mb-6 flex items-center justify-center">
            {/* Outer animated radar pulse ring */}
            <div className="absolute w-36 h-36 rounded-full bg-indigo-50 border border-indigo-100 animate-pulse-ring pointer-events-none" />
            <div className="absolute w-28 h-28 rounded-full bg-indigo-100/60 animate-ping opacity-25 pointer-events-none" />
            
            {/* Main Center Button Target */}
            <div className="relative w-24 h-24 rounded-full bg-gradient-to-tr from-indigo-600 to-indigo-500 shadow-md shadow-indigo-500/20 flex items-center justify-center text-white transition-transform hover:scale-105">
              <Wifi className="w-12 h-12 transform rotate-90 stroke-[2.2]" />
            </div>
          </div>

          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 mb-2">
            Acerca una tarjeta NFC
          </h2>
          <p className="text-slate-500 text-sm sm:text-base max-w-sm">
            El sistema registrará automáticamente la asistencia de la persona al aproximar la tarjeta o pegatina.
          </p>

          <div className="mt-6 flex items-center gap-2 text-xs text-slate-400 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Lector en espera continua</span>
            <span>·</span>
            <span>Detección automática de turno</span>
          </div>
        </div>
      )}

      {/* STATE 2: SCANNING / PROCESSING */}
      {scanState.status === 'scanning' && (
        <div className="flex flex-col items-center max-w-md mx-auto my-auto">
          <div className="w-20 h-20 rounded-full border-4 border-indigo-200 border-t-indigo-600 animate-spin mb-4" />
          <h2 className="text-xl font-bold text-slate-900">Leyendo tarjeta NFC...</h2>
          <p className="text-slate-500 text-sm mt-1">Identificando usuario en el sistema</p>
        </div>
      )}

      {/* STATE 3: SUCCESS CONFIRMATION */}
      {scanState.status === 'success' && scanState.person && scanState.record && (
        <div className="flex flex-col items-center max-w-lg mx-auto my-auto animate-fade-in">
          
          {/* Success icon banner */}
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mb-4 ring-8 ring-emerald-50">
            <CheckCircle2 className="w-10 h-10 stroke-[2.2]" />
          </div>

          <h2 className="text-2xl sm:text-3xl font-bold text-emerald-800 tracking-tight">
            ¡Asistencia registrada!
          </h2>

          {/* Person details card */}
          <div className="mt-5 w-full bg-slate-50 rounded-xl border border-slate-200/90 p-5 shadow-xs text-left">
            <div className="flex items-center gap-4">
              <div className={`w-14 h-14 rounded-full flex items-center justify-center font-bold text-lg shadow-xs ${getAvatarColor(scanState.person.full_name)}`}>
                {getInitials(scanState.person.full_name)}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-xl font-bold text-slate-900 truncate">
                  {scanState.person.full_name}
                </h3>
                <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
                  <span>ID: {scanState.person.internal_id}</span>
                  <span>·</span>
                  <span className="font-mono text-[11px] text-slate-600 bg-white px-1.5 py-0.5 rounded border border-slate-200">
                    {scanState.person.nfc_uid}
                  </span>
                </p>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-slate-200 grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-slate-400 font-medium">Turno asignado</span>
                <p className="font-semibold text-slate-900 text-sm mt-0.5 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-indigo-600" />
                  Entrada de {scanState.record.shift.toLowerCase()}
                </p>
              </div>
              <div>
                <span className="text-slate-400 font-medium">Hora exacta</span>
                <p className="font-bold text-slate-900 text-sm mt-0.5 font-mono tabular-nums">
                  {scanState.record.time}
                </p>
              </div>
            </div>
          </div>

          {/* Auto-reset progress bar */}
          <div className="mt-6 w-full max-w-xs flex flex-col items-center gap-2">
            <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
              <div 
                className="bg-emerald-600 h-1.5 rounded-full transition-all duration-1000 ease-linear"
                style={{ width: `${(countdown / autoResetSeconds) * 100}%` }}
              />
            </div>
            <div className="flex items-center justify-between w-full text-xs text-slate-500">
              <span>Volviendo al lector en {countdown}s</span>
              <button 
                onClick={onReset}
                className="text-indigo-600 hover:text-indigo-800 font-semibold"
              >
                Volver ahora
              </button>
            </div>
          </div>

        </div>
      )}

      {/* STATE 4: DUPLICATE RECORD DETECTED */}
      {scanState.status === 'duplicate' && scanState.person && (
        <div className="flex flex-col items-center max-w-md mx-auto my-auto animate-fade-in">
          
          <div className="w-16 h-16 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mb-4 ring-8 ring-amber-50">
            <AlertTriangle className="w-9 h-9 stroke-[2.2]" />
          </div>

          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
            Asistencia ya registrada hoy
          </h2>

          <p className="text-slate-600 text-sm mt-2 text-center">
            <strong className="text-slate-900">{scanState.person.full_name}</strong> ya tiene un registro de asistencia confirmado para el día de hoy.
          </p>

          {scanState.lastRecord && (
            <div className="mt-4 bg-amber-50/70 border border-amber-200 rounded-xl p-3.5 w-full text-xs text-amber-900 flex items-center justify-between">
              <div>
                <p className="font-medium">Último registro:</p>
                <p className="font-bold text-sm font-mono tabular-nums mt-0.5">
                  {scanState.lastRecord.time} ({scanState.lastRecord.shift})
                </p>
              </div>
              <div className="text-right">
                <p className="text-amber-800">Dispositivo:</p>
                <p className="font-medium text-amber-950 mt-0.5">{scanState.lastRecord.device_name}</p>
              </div>
            </div>
          )}

          <div className="mt-6 flex flex-col sm:flex-row items-center gap-2.5 w-full">
            <button
              onClick={onForceRegister}
              className="w-full sm:flex-1 px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-sm font-semibold transition-colors shadow-xs"
            >
              Registrar igualmente
            </button>
            <button
              onClick={onReset}
              className="w-full sm:flex-1 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-medium transition-colors"
            >
              Aceptar y volver
            </button>
          </div>
          
          <p className="text-[11px] text-slate-400 mt-3">
            Evita duplicidades accidentales si la persona acerca su tarjeta dos veces seguidas.
          </p>
        </div>
      )}

      {/* STATE 5: UNRECOGNIZED CARD */}
      {scanState.status === 'unrecognized' && (
        <div className="flex flex-col items-center max-w-md mx-auto my-auto animate-fade-in">
          
          <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center mb-4 ring-8 ring-slate-50">
            <HelpCircle className="w-9 h-9 stroke-[2.2]" />
          </div>

          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
            Tarjeta no reconocida
          </h2>

          <p className="text-slate-600 text-sm mt-2">
            Esta tarjeta NFC no está asociada a ninguna persona en el sistema.
          </p>

          <div className="mt-3 px-3 py-1.5 bg-slate-100 rounded-lg border border-slate-200 font-mono text-xs font-semibold text-slate-800">
            UID: {scanState.nfcUid || 'DESCONOCIDO'}
          </div>

          <div className="mt-6 flex flex-col sm:flex-row items-center gap-2.5 w-full">
            {currentUser.role === 'admin' ? (
              <button
                onClick={() => onAssignUnrecognized(scanState.nfcUid || '')}
                className="w-full sm:flex-1 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-semibold transition-colors flex items-center justify-center gap-2 shadow-xs"
              >
                <Plus className="w-4 h-4" />
                Asignar tarjeta
              </button>
            ) : (
              <p className="text-xs text-rose-600 font-medium">
                Solo administradores pueden vincular nuevas tarjetas.
              </p>
            )}
            <button
              onClick={onReset}
              className="w-full sm:flex-1 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-medium transition-colors"
            >
              Cerrar y continuar
            </button>
          </div>
        </div>
      )}

      {/* STATE 6: INACTIVE USER */}
      {scanState.status === 'inactive' && scanState.person && (
        <div className="flex flex-col items-center max-w-md mx-auto my-auto animate-fade-in">
          
          <div className="w-16 h-16 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mb-4 ring-8 ring-rose-50">
            <UserX className="w-9 h-9 stroke-[2.2]" />
          </div>

          <h2 className="text-2xl font-bold text-rose-900 tracking-tight">
            Usuario inactivo
          </h2>

          <p className="text-slate-600 text-sm mt-2 text-center">
            <strong className="text-slate-900">{scanState.person.full_name}</strong> se encuentra actualmente desactivado/a en la plantilla.
          </p>

          <p className="text-xs text-rose-700 font-medium mt-1">
            Esta persona no puede registrar la asistencia sin previa reactivación por parte de un administrador.
          </p>

          <div className="mt-6">
            <button
              onClick={onReset}
              className="px-6 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-medium transition-colors"
            >
              Volver al escáner
            </button>
          </div>
        </div>
      )}

      {/* STATE 7: GENERIC ERROR OR DISCONNECTED */}
      {scanState.status === 'error' && (
        <div className="flex flex-col items-center max-w-md mx-auto my-auto animate-fade-in">
          
          <div className="w-16 h-16 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mb-4">
            <AlertTriangle className="w-9 h-9 stroke-[2.2]" />
          </div>

          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
            Error en el lector NFC
          </h2>

          <p className="text-slate-600 text-sm mt-2">
            {scanState.errorMessage || 'No se ha podido procesar la tarjeta NFC.'}
          </p>

          <div className="mt-6">
            <button
              onClick={onReset}
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Reintentar
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
