import React, { useState } from 'react';
import { 
  Clock, 
  Shield, 
  Laptop, 
  Globe, 
  Save, 
  RotateCcw, 
  CheckCircle2, 
  Database,
  Lock,
  Volume2,
  AlertTriangle,
  Download,
  Loader2
} from 'lucide-react';
import { AppSettings, CurrentUser } from '../types';
import { storageService } from '../services/storageService';
import { generateAndDownloadProjectZip } from '../utils/zipExporter';

interface SettingsViewProps {
  settings: AppSettings;
  onUpdateSettings: (newSettings: Partial<AppSettings>) => void;
  onResetDemo: () => void;
  currentUser: CurrentUser;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  settings,
  onUpdateSettings,
  onResetDemo,
  currentUser,
}) => {
  const [formData, setFormData] = useState<AppSettings>({ ...settings });
  const [savedNotice, setSavedNotice] = useState(false);
  const [showDbSchemaModal, setShowDbSchemaModal] = useState(false);
  const [isZipping, setIsZipping] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateSettings(formData);
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 3000);
  };

  const handleDownloadZip = async () => {
    try {
      setIsZipping(true);
      await generateAndDownloadProjectZip();
    } catch (e) {
      console.error(e);
      alert('Error generando archivo ZIP');
    } finally {
      setIsZipping(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Configuración del Sistema
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Ajusta las franjas horarias, el filtro anti-duplicado y los parámetros del terminal.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            type="button"
            disabled={isZipping}
            onClick={handleDownloadZip}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors disabled:opacity-50"
            title="Descargar paquete ZIP completo para subir a tu hosting o dominio"
          >
            {isZipping ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            <span>{isZipping ? 'Generando...' : 'Descargar ZIP'}</span>
          </button>

          <button
            onClick={() => setShowDbSchemaModal(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors"
          >
            <Database className="w-4 h-4 text-indigo-600" />
            <span>Esquema SQL</span>
          </button>
        </div>
      </div>

      {savedNotice && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-semibold flex items-center gap-2 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>¡Configuración guardada correctamente en el sistema!</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Card 1: Franjas Horarias */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Franjas Horarias</h3>
              <p className="text-[11px] text-slate-500">
                El sistema asignará el turno de entrada automáticamente según la hora de detección de la tarjeta NFC.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            {/* Mañana */}
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-800">Turno de Mañana</span>
                <span className="text-[10px] bg-amber-100 text-amber-800 font-semibold px-2 py-0.5 rounded-full">
                  Diurno
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] text-slate-500 font-medium mb-1">Hora Inicio</label>
                  <input
                    type="time"
                    value={formData.morning_start}
                    onChange={(e) => setFormData({ ...formData, morning_start: e.target.value })}
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg font-mono text-slate-900 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-500 font-medium mb-1">Hora Fin</label>
                  <input
                    type="time"
                    value={formData.morning_end}
                    onChange={(e) => setFormData({ ...formData, morning_end: e.target.value })}
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg font-mono text-slate-900 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>
              <p className="text-[10px] text-slate-400">Por defecto: 06:00 a 14:00</p>
            </div>

            {/* Tarde */}
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-800">Turno de Tarde</span>
                <span className="text-[10px] bg-indigo-100 text-indigo-800 font-semibold px-2 py-0.5 rounded-full">
                  Vespertino
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] text-slate-500 font-medium mb-1">Hora Inicio</label>
                  <input
                    type="time"
                    value={formData.afternoon_start}
                    onChange={(e) => setFormData({ ...formData, afternoon_start: e.target.value })}
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg font-mono text-slate-900 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-500 font-medium mb-1">Hora Fin</label>
                  <input
                    type="time"
                    value={formData.afternoon_end}
                    onChange={(e) => setFormData({ ...formData, afternoon_end: e.target.value })}
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg font-mono text-slate-900 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>
              <p className="text-[10px] text-slate-400">Por defecto: 14:00 a 22:00</p>
            </div>
          </div>
        </div>

        {/* Card 2: Lógica Anti-duplicado & Prevención de Errores */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Prevención de Duplicados Accidentales</h3>
              <p className="text-[11px] text-slate-500">
                Evita que una persona registre múltiples asistencias si apoya o pasa la tarjeta NFC dos veces seguidas.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Ventana anti-duplicado (minutos)
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min="1"
                  max="60"
                  step="1"
                  value={formData.duplicate_timeout_minutes}
                  onChange={(e) => setFormData({ ...formData, duplicate_timeout_minutes: Number(e.target.value) })}
                  className="flex-1 accent-indigo-600"
                />
                <span className="font-mono font-bold text-slate-900 bg-slate-100 px-3 py-1 rounded-lg border border-slate-200 tabular-nums">
                  {formData.duplicate_timeout_minutes} min
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1.5">
                Si la misma tarjeta se lee dentro de este periodo o en el mismo día, se mostrará la pantalla de advertencia requiriendo confirmación.
              </p>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Tiempo de confirmación en pantalla (segundos)
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min="2"
                  max="10"
                  step="1"
                  value={formData.auto_reset_seconds}
                  onChange={(e) => setFormData({ ...formData, auto_reset_seconds: Number(e.target.value) })}
                  className="flex-1 accent-indigo-600"
                />
                <span className="font-mono font-bold text-slate-900 bg-slate-100 px-3 py-1 rounded-lg border border-slate-200 tabular-nums">
                  {formData.auto_reset_seconds} seg
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1.5">
                Segundos que se muestra "¡Asistencia registrada!" antes de volver a "Acerca una tarjeta NFC".
              </p>
            </div>
          </div>
        </div>

        {/* Card 3: Dispositivo y Entorno */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Laptop className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Dispositivo y Quiosco</h3>
              <p className="text-[11px] text-slate-500">
                Identificación de la tableta o terminal físico ubicado en la recepción.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Nombre del dispositivo</label>
              <input
                type="text"
                value={formData.device_name}
                onChange={(e) => setFormData({ ...formData, device_name: e.target.value })}
                placeholder="Recepción Principal"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-indigo-500 focus:bg-white"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Ubicación física</label>
              <input
                type="text"
                value={formData.device_location}
                onChange={(e) => setFormData({ ...formData, device_location: e.target.value })}
                placeholder="Edificio Central · Planta Baja"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-indigo-500 focus:bg-white"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Zona Horaria</label>
              <select
                value={formData.timezone}
                onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-indigo-500"
              >
                <option value="Europe/Madrid">Europa / Madrid (UTC+1/+2)</option>
                <option value="Atlantic/Canary">Islas Canarias (UTC+0/+1)</option>
                <option value="UTC">Tiempo Universal Coordinado (UTC)</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">PIN de Salida de Modo Quiosco</label>
              <input
                type="password"
                maxLength={6}
                value={formData.kiosk_pin}
                onChange={(e) => setFormData({ ...formData, kiosk_pin: e.target.value })}
                placeholder="1234"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-mono tracking-widest focus:outline-none focus:border-indigo-500 focus:bg-white"
              />
              <p className="text-[10px] text-slate-400 mt-1">Código de seguridad para que el público no salga del quiosco.</p>
            </div>
          </div>
        </div>

        {/* Action Save bar */}
        <div className="flex items-center justify-between pt-2">
          <button
            type="button"
            onClick={() => {
              if (confirm('¿Restablecer todos los datos a la demostración inicial (personas demo y registros de ejemplo)?')) {
                onResetDemo();
              }
            }}
            className="px-4 py-2.5 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl transition-colors flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Restablecer datos demo</span>
          </button>

          <button
            type="submit"
            className="px-6 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-colors flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            <span>Guardar cambios</span>
          </button>
        </div>

      </form>

      {/* Production SQL Schema Modal */}
      {showDbSchemaModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-slate-900 text-slate-200 rounded-2xl shadow-2xl border border-slate-800 max-w-3xl w-full max-h-[85vh] flex flex-col overflow-hidden">
            <div className="p-5 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-white text-base flex items-center gap-2">
                  <Database className="w-4 h-4 text-indigo-400" />
                  Estructura de Base de Datos y RLS (PostgreSQL / Supabase)
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Esquema relacional optimizado con claves foráneas, índices de alta velocidad y políticas RLS.
                </p>
              </div>
              <button
                onClick={() => setShowDbSchemaModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-4 text-xs font-mono">
              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 overflow-x-auto text-[11px] text-slate-300 leading-relaxed">
{`-- 1. TABLA USUARIOS DE GESTIÓN (Auth / Roles)
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  role TEXT CHECK (role IN ('admin', 'operator')) NOT NULL DEFAULT 'operator',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. TABLA PERSONAS / EMPLEADOS (Con identificador NFC único)
CREATE TABLE people (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  photo_url TEXT,
  email TEXT,
  phone TEXT,
  internal_id TEXT UNIQUE NOT NULL,
  nfc_uid TEXT UNIQUE NOT NULL, -- Clave rápida para detección
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. TABLA ASISTENCIAS / FICHAJES
CREATE TABLE attendance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  person_id UUID NOT NULL REFERENCES people(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  time TIME NOT NULL,
  shift TEXT NOT NULL CHECK (shift IN ('Mañana', 'Tarde', 'Noche')),
  type TEXT NOT NULL DEFAULT 'Entrada',
  device_id UUID REFERENCES devices(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. ÍNDICES DE ALTA VELOCIDAD PARA LECTURA NFC INSTANTÁNEA
CREATE INDEX idx_people_nfc_uid ON people(nfc_uid);
CREATE INDEX idx_attendance_date ON attendance(date);
CREATE INDEX idx_attendance_person_date ON attendance(person_id, date);

-- 5. ROW LEVEL SECURITY (RLS)
ALTER TABLE people ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;`}
              </div>
            </div>

            <div className="p-4 border-t border-slate-800 bg-slate-950 flex justify-end">
              <button
                onClick={() => setShowDbSchemaModal(false)}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg text-xs"
              >
                Cerrar esquema
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
