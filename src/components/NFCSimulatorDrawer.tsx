import React, { useState } from 'react';
import { CreditCard, Terminal, Send, ChevronUp, ChevronDown, Sparkles, Check, Info } from 'lucide-react';
import { Person } from '../types';
import { nfcService } from '../services/nfcService';

interface NFCSimulatorDrawerProps {
  persons: Person[];
  onTriggerScan: (uid: string) => void;
}

export const NFCSimulatorDrawer: React.FC<NFCSimulatorDrawerProps> = ({
  persons,
  onTriggerScan,
}) => {
  const [isOpen, setIsOpen] = useState(true);
  const [customUid, setCustomUid] = useState('');
  const [lastEmitted, setLastEmitted] = useState<string | null>(null);

  const handleSimulate = (uid: string) => {
    setLastEmitted(uid);
    onTriggerScan(uid);
    setTimeout(() => setLastEmitted(null), 1500);
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customUid.trim()) return;
    handleSimulate(customUid.trim());
    setCustomUid('');
  };

  return (
    <div className="bg-slate-900 text-white rounded-2xl p-4 sm:p-5 shadow-lg border border-slate-800 mb-8 transition-all">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
            <CreditCard className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              Simulador y Pasarela NFC de Prueba
              <span className="text-[10px] bg-indigo-500/30 text-indigo-300 font-mono px-2 py-0.5 rounded-full uppercase tracking-wider">
                Hardware & Testing
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              Pulsa sobre una tarjeta asignada o introduce un UID para simular el acercamiento físico al lector.
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          title={isOpen ? 'Minimizar panel' : 'Expandir panel'}
        >
          {isOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </button>
      </div>

      {isOpen && (
        <div className="mt-4 pt-4 border-t border-slate-800 animate-fade-in">
          {/* Quick-tap cards grid */}
          <div className="mb-3">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Tarjetas asignadas de demostración (Un clic = Acercar al lector):
            </span>
            <div className="mt-2 flex flex-wrap gap-2">
              {persons.map((p) => {
                const isRecent = lastEmitted === p.nfc_uid;
                return (
                  <button
                    key={p.id}
                    onClick={() => handleSimulate(p.nfc_uid)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium border transition-all ${
                      isRecent
                        ? 'bg-emerald-600 text-white border-emerald-400 scale-105 shadow-md shadow-emerald-900/50'
                        : p.active
                        ? 'bg-slate-800/90 hover:bg-slate-700/90 text-slate-200 border-slate-700 hover:border-slate-500'
                        : 'bg-rose-950/40 text-rose-300 border-rose-900/50 hover:bg-rose-900/50'
                    }`}
                  >
                    <span className="w-2 h-2 rounded-full bg-indigo-400" />
                    <span>{p.full_name}</span>
                    <span className="text-[10px] font-mono text-slate-400">
                      ({p.nfc_uid.slice(0, 8)}...)
                    </span>
                    {!p.active && (
                      <span className="text-[9px] bg-rose-900 text-rose-200 px-1 py-0.2 rounded font-bold">
                        Inactiva
                      </span>
                    )}
                  </button>
                );
              })}

              {/* Unknown Card button */}
              <button
                onClick={() => handleSimulate('04:99:88:77:66')}
                className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium bg-amber-950/30 text-amber-300 border border-amber-800/60 hover:bg-amber-900/40 transition-colors"
                title="Simular tarjeta NFC no registrada en la base de datos"
              >
                <span>⚠️ Tarjeta Nueva / Desconocida</span>
                <span className="text-[10px] font-mono opacity-80">(04:99:88:...)</span>
              </button>
            </div>
          </div>

          {/* Manual Hex UID input and USB wedge note */}
          <div className="mt-4 pt-3 border-t border-slate-800/80 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 text-xs">
            <form onSubmit={handleCustomSubmit} className="flex items-center gap-2 flex-1 max-w-md">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={customUid}
                  onChange={(e) => setCustomUid(e.target.value)}
                  placeholder="Introducir UID NFC (ej: 04:A2:7B:91:E2 o NFC-001)"
                  className="w-full bg-slate-800 text-white placeholder-slate-500 border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono focus:outline-none focus:border-indigo-500"
                />
              </div>
              <button
                type="submit"
                className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg text-xs flex items-center gap-1.5 transition-colors whitespace-nowrap"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Simular lectura</span>
              </button>
            </form>

            <div className="flex items-center gap-2 text-slate-400 text-[11px]">
              <Info className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
              <span>
                También soporta lectores <strong>USB RFID</strong> conectados por cable (cuña de teclado física).
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
