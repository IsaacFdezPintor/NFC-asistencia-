import React, { useEffect, useState } from 'react';
import { 
  Radio, 
  Settings as SettingsIcon, 
  Maximize2, 
  Shield, 
  UserCheck, 
  Wifi, 
  WifiOff, 
  CheckCircle2,
  ChevronDown,
  Download,
  FolderArchive,
  Globe,
  Loader2,
  X
} from 'lucide-react';
import { CurrentUser, NFCReaderStatus } from '../types';
import { getSpanishFormattedDate } from '../utils/dateUtils';
import { nfcService } from '../services/nfcService';
import { generateAndDownloadProjectZip } from '../utils/zipExporter';

interface NavbarProps {
  activeTab: 'dashboard' | 'persons' | 'history' | 'calendar' | 'settings';
  setActiveTab: (tab: 'dashboard' | 'persons' | 'history' | 'calendar' | 'settings') => void;
  currentUser: CurrentUser;
  onRoleChange: (role: 'admin' | 'operator') => void;
  onEnterKiosk: () => void;
  nfcStatus: NFCReaderStatus;
  onToggleNfcStatus: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  currentUser,
  onRoleChange,
  onEnterKiosk,
  nfcStatus,
  onToggleNfcStatus,
}) => {
  const [currentDateStr, setCurrentDateStr] = useState(getSpanishFormattedDate());
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [showNfcMenu, setShowNfcMenu] = useState(false);
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const [isZipping, setIsZipping] = useState(false);

  // Update date dynamically
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDateStr(getSpanishFormattedDate());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  const handleDownloadZip = async () => {
    try {
      setIsZipping(true);
      await generateAndDownloadProjectZip();
    } catch (err) {
      console.error('Error generating zip:', err);
      alert('Error al generar el ZIP. Por favor inténtalo de nuevo.');
    } finally {
      setIsZipping(false);
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18">
          
          {/* Zone 1: Brand & Dynamic Date */}
          <div className="flex flex-col justify-center">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-600 animate-pulse" />
              <h1 className="text-xl font-bold tracking-tight text-slate-900 leading-none">
                Control de asistencia
              </h1>
            </div>
            <p className="text-xs font-medium text-slate-500 mt-1 capitalize">
              {currentDateStr}
            </p>
          </div>

          {/* Zone 2: Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`px-3.5 py-2 text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${
                activeTab === 'dashboard'
                  ? 'bg-slate-100 text-slate-900 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              Tablero
            </button>
            <button
              onClick={() => setActiveTab('persons')}
              className={`px-3.5 py-2 text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${
                activeTab === 'persons'
                  ? 'bg-slate-100 text-slate-900 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              Personas
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`px-3.5 py-2 text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${
                activeTab === 'history'
                  ? 'bg-slate-100 text-slate-900 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              Histórico
            </button>
            <button
              onClick={() => setActiveTab('calendar')}
              className={`px-3.5 py-2 text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${
                activeTab === 'calendar'
                  ? 'bg-slate-100 text-slate-900 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              Calendario
            </button>
            {currentUser.role === 'admin' && (
              <button
                onClick={() => setActiveTab('settings')}
                className={`px-3.5 py-2 text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${
                  activeTab === 'settings'
                    ? 'bg-slate-100 text-slate-900 font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                Configuración
              </button>
            )}
          </nav>

          {/* Zone 3: Actions (NFC Status, Kiosk Mode, Role / Profile) */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            
            {/* NFC Reader Status Button */}
            <div className="relative">
              <button
                onClick={() => setShowNfcMenu(!showNfcMenu)}
                title="Configuración de lector NFC"
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all ${
                  nfcStatus.isConnected
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                    : 'bg-rose-50 text-rose-800 border-rose-200 hover:bg-rose-100'
                }`}
              >
                {nfcStatus.isConnected ? (
                  <>
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600"></span>
                    </span>
                    <span className="hidden sm:inline">NFC conectado</span>
                    <span className="sm:hidden">NFC</span>
                  </>
                ) : (
                  <>
                    <WifiOff className="w-3.5 h-3.5 text-rose-600" />
                    <span className="hidden sm:inline">NFC desconectado</span>
                    <span className="sm:hidden">Sin NFC</span>
                  </>
                )}
                <ChevronDown className="w-3 h-3 text-slate-400 ml-0.5" />
              </button>

              {/* NFC Mode Selector Dropdown */}
              {showNfcMenu && (
                <>
                  <div 
                    className="fixed inset-0 z-40" 
                    onClick={() => setShowNfcMenu(false)}
                  />
                  <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-lg border border-slate-200 py-2 z-50 text-xs">
                    <div className="px-3 py-2 border-b border-slate-100">
                      <p className="font-semibold text-slate-900">Estado del lector NFC</p>
                      <p className="text-slate-500 mt-0.5">
                        {nfcStatus.isConnected ? 'Lector activo y escuchando lecturas' : 'Lector actualmente desconectado'}
                      </p>
                    </div>

                    <div className="p-2 space-y-1">
                      <button
                        onClick={() => {
                          nfcService.setMode('simulated');
                          onToggleNfcStatus();
                          setShowNfcMenu(false);
                        }}
                        className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-left transition-colors ${
                          nfcStatus.mode === 'simulated' ? 'bg-indigo-50 text-indigo-900 font-medium' : 'hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        <div>
                          <p className="font-medium">Modo de simulación</p>
                          <p className="text-[11px] text-slate-500">Pruebas directas con botones y UIDs</p>
                        </div>
                        {nfcStatus.mode === 'simulated' && <CheckCircle2 className="w-4 h-4 text-indigo-600" />}
                      </button>

                      <button
                        onClick={() => {
                          nfcService.setMode('keyboard-wedge');
                          onToggleNfcStatus();
                          setShowNfcMenu(false);
                        }}
                        className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-left transition-colors ${
                          nfcStatus.mode === 'keyboard-wedge' ? 'bg-indigo-50 text-indigo-900 font-medium' : 'hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        <div>
                          <p className="font-medium">Lector USB / Cuña Teclado</p>
                          <p className="text-[11px] text-slate-500">Lectores RFID/NFC USB físicos</p>
                        </div>
                        {nfcStatus.mode === 'keyboard-wedge' && <CheckCircle2 className="w-4 h-4 text-indigo-600" />}
                      </button>

                      <button
                        onClick={() => {
                          nfcService.setMode('web-nfc');
                          onToggleNfcStatus();
                          setShowNfcMenu(false);
                        }}
                        disabled={!nfcStatus.isWebNFCSupported}
                        className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-left transition-colors ${
                          !nfcStatus.isWebNFCSupported 
                            ? 'opacity-50 cursor-not-allowed text-slate-400'
                            : nfcStatus.mode === 'web-nfc' 
                            ? 'bg-indigo-50 text-indigo-900 font-medium' 
                            : 'hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        <div>
                          <p className="font-medium">Web NFC (Nativo)</p>
                          <p className="text-[11px] text-slate-500">
                            {nfcStatus.isWebNFCSupported ? 'Soportado en este navegador' : 'No soportado en este navegador'}
                          </p>
                        </div>
                        {nfcStatus.mode === 'web-nfc' && <CheckCircle2 className="w-4 h-4 text-indigo-600" />}
                      </button>
                    </div>

                    <div className="px-3 pt-2 border-t border-slate-100 flex justify-between items-center">
                      <button
                        onClick={() => {
                          if (nfcStatus.isConnected) {
                            nfcService.disconnect();
                          } else {
                            nfcService.connect();
                          }
                          onToggleNfcStatus();
                          setShowNfcMenu(false);
                        }}
                        className="text-xs text-indigo-600 hover:text-indigo-800 font-medium"
                      >
                        {nfcStatus.isConnected ? 'Desconectar lector' : 'Reconectar lector'}
                      </button>
                      <span className="text-[10px] text-slate-400 font-mono">v1.2-nfc</span>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Descargar ZIP Button */}
            <button
              onClick={() => setShowDownloadModal(true)}
              title="Descargar código fuente en ZIP para subir a tu dominio"
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-lg transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-indigo-600" />
              <span className="hidden sm:inline">Descargar ZIP</span>
            </button>

            {/* Kiosk Mode Button */}
            <button
              onClick={onEnterKiosk}
              title="Iniciar Modo Quiosco (Pantalla completa para recepción)"
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
            >
              <Maximize2 className="w-3.5 h-3.5 text-slate-600" />
              <span className="hidden sm:inline">Modo quiosco</span>
            </button>

            {/* Role & Profile Switcher */}
            <div className="relative">
              <button
                onClick={() => setShowRoleMenu(!showRoleMenu)}
                className="flex items-center gap-2 pl-2 pr-2.5 py-1.5 rounded-lg hover:bg-slate-100 border border-slate-200 transition-colors"
              >
                <div className="w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-bold">
                  {currentUser.role === 'admin' ? 'A' : 'O'}
                </div>
                <div className="text-left hidden lg:block">
                  <p className="text-xs font-semibold text-slate-900 leading-tight">
                    {currentUser.role === 'admin' ? 'Administrador' : 'Operador'}
                  </p>
                  <p className="text-[10px] text-slate-500 leading-tight">
                    {currentUser.role === 'admin' ? 'Control total' : 'Solo registro'}
                  </p>
                </div>
                <ChevronDown className="w-3 h-3 text-slate-400 ml-0.5" />
              </button>

              {/* Role Dropdown */}
              {showRoleMenu && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowRoleMenu(false)} />
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-slate-200 py-1 z-50 text-xs">
                    <div className="px-3 py-2 border-b border-slate-100">
                      <p className="font-semibold text-slate-900">{currentUser.name}</p>
                      <p className="text-slate-500 text-[11px] truncate">{currentUser.email}</p>
                    </div>

                    <div className="p-1 space-y-0.5">
                      <p className="px-2 pt-1.5 pb-1 text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                        Cambiar rol activo
                      </p>
                      
                      <button
                        onClick={() => {
                          onRoleChange('admin');
                          setShowRoleMenu(false);
                        }}
                        className={`w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-left transition-colors ${
                          currentUser.role === 'admin' ? 'bg-indigo-50 text-indigo-900 font-semibold' : 'hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        <Shield className="w-4 h-4 text-indigo-600" />
                        <div>
                          <p>Administrador</p>
                          <p className="text-[10px] text-slate-500 font-normal">Gestiona personas, historial y ajustes</p>
                        </div>
                      </button>

                      <button
                        onClick={() => {
                          onRoleChange('operator');
                          setShowRoleMenu(false);
                        }}
                        className={`w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-left transition-colors ${
                          currentUser.role === 'operator' ? 'bg-indigo-50 text-indigo-900 font-semibold' : 'hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        <UserCheck className="w-4 h-4 text-emerald-600" />
                        <div>
                          <p>Operador</p>
                          <p className="text-[10px] text-slate-500 font-normal">Registra asistencias y ve el día</p>
                        </div>
                      </button>
                    </div>

                    {currentUser.role === 'admin' && (
                      <div className="p-1 border-t border-slate-100">
                        <button
                          onClick={() => {
                            setActiveTab('settings');
                            setShowRoleMenu(false);
                          }}
                          className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-left hover:bg-slate-50 text-slate-700"
                        >
                          <SettingsIcon className="w-3.5 h-3.5 text-slate-500" />
                          <span>Ajustes del sistema</span>
                        </button>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>

          </div>

        </div>

        {/* Mobile Navigation bar */}
        <div className="flex md:hidden border-t border-slate-200 overflow-x-auto py-2 gap-1 scrollbar-none">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap ${
              activeTab === 'dashboard' ? 'bg-slate-900 text-white' : 'text-slate-600'
            }`}
          >
            Tablero
          </button>
          <button
            onClick={() => setActiveTab('persons')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap ${
              activeTab === 'persons' ? 'bg-slate-900 text-white' : 'text-slate-600'
            }`}
          >
            Personas
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap ${
              activeTab === 'history' ? 'bg-slate-900 text-white' : 'text-slate-600'
            }`}
          >
            Histórico
          </button>
          <button
            onClick={() => setActiveTab('calendar')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap ${
              activeTab === 'calendar' ? 'bg-slate-900 text-white' : 'text-slate-600'
            }`}
          >
            Calendario
          </button>
          {currentUser.role === 'admin' && (
            <button
              onClick={() => setActiveTab('settings')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap ${
                activeTab === 'settings' ? 'bg-slate-900 text-white' : 'text-slate-600'
              }`}
            >
              Configuración
            </button>
          )}
        </div>

      </div>

      {/* Modal de Descarga de Proyecto ZIP */}
      {showDownloadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden text-left">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <FolderArchive className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Descargar Proyecto en ZIP
                  </h3>
                  <p className="text-xs text-slate-500">
                    Listo para subir y ejecutar en tu propio dominio o hosting.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowDownloadModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 space-y-2">
                <p className="font-semibold text-slate-800">
                  ¿Qué contiene el archivo ZIP?
                </p>
                <ul className="list-disc list-inside text-slate-600 space-y-1 text-[11px]">
                  <li>Todo el código fuente frontend (React 19 + TypeScript + Tailwind CSS).</li>
                  <li>Capa de hardware NFC (`NFCService`) y simulador.</li>
                  <li>Base de datos, esquemas de producción y modo quiosco.</li>
                  <li>Archivo de instrucciones detalladas: <strong>LEEME_DESPLIEGUE.md</strong>.</li>
                </ul>
              </div>

              <div className="space-y-2">
                <p className="font-bold text-slate-900">Pasos rápidos para tu dominio:</p>
                <div className="space-y-1.5 text-slate-600 text-[11px]">
                  <p><strong>1. cPanel / Hosting compartido:</strong> Ejecuta <code className="bg-slate-100 px-1 py-0.5 rounded font-mono text-slate-800">npm run build</code> en tu PC y sube la carpeta <code className="bg-slate-100 px-1 py-0.5 rounded font-mono text-slate-800">/dist</code> a tu <code className="bg-slate-100 px-1 py-0.5 rounded font-mono text-slate-800">public_html</code>.</p>
                  <p><strong>2. Vercel o Netlify (Recomendado):</strong> Arrastra la carpeta descomprimida o conéctala a GitHub; asigna tu dominio propio gratis con HTTPS automático.</p>
                  <p className="text-amber-700 bg-amber-50 p-2 rounded-lg border border-amber-200">
                    💡 <em>Nota sobre Web NFC:</em> Los navegadores requieren conexión segura <strong>HTTPS (SSL)</strong> para permitir el acceso al chip NFC nativo.
                  </p>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowDownloadModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-lg text-xs"
                >
                  Cerrar
                </button>

                <button
                  type="button"
                  disabled={isZipping}
                  onClick={async () => {
                    await handleDownloadZip();
                    setShowDownloadModal(false);
                  }}
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg text-xs flex items-center gap-2 shadow-xs transition-colors disabled:opacity-50"
                >
                  {isZipping ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Generando ZIP...</span>
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4" />
                      <span>Descargar ZIP Ahora</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
