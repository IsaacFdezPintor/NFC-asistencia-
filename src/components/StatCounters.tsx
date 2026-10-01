import React from 'react';
import { Users, Sun, Sunset, UserCheck } from 'lucide-react';

interface StatCountersProps {
  presentesHoy: number;
  manana: number;
  tarde: number;
  totalPersonas: number;
}

export const StatCounters: React.FC<StatCountersProps> = ({
  presentesHoy,
  manana,
  tarde,
  totalPersonas,
}) => {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
      
      {/* 1. Presentes hoy */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 shadow-xs transition-shadow hover:shadow-sm">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Presentes hoy
          </span>
          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <UserCheck className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 tabular-nums">
            {presentesHoy}
          </span>
          <span className="text-xs text-slate-500">
            de {totalPersonas} personas
          </span>
        </div>
        <div className="mt-3 w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
          <div 
            className="bg-emerald-500 h-1.5 rounded-full transition-all duration-500"
            style={{ width: `${totalPersonas > 0 ? Math.min(100, (presentesHoy / totalPersonas) * 100) : 0}%` }}
          />
        </div>
      </div>

      {/* 2. Mañana */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 shadow-xs transition-shadow hover:shadow-sm">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Turno Mañana
          </span>
          <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
            <Sun className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 tabular-nums">
            {manana}
          </span>
          <span className="text-xs text-slate-500">
            entradas registradas
          </span>
        </div>
        <p className="mt-3 text-[11px] text-slate-500 font-medium">
          Franja regular 06:00 – 14:00
        </p>
      </div>

      {/* 3. Tarde */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 shadow-xs transition-shadow hover:shadow-sm">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Turno Tarde
          </span>
          <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Sunset className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 tabular-nums">
            {tarde}
          </span>
          <span className="text-xs text-slate-500">
            entradas registradas
          </span>
        </div>
        <p className="mt-3 text-[11px] text-slate-500 font-medium">
          Franja regular 14:00 – 22:00
        </p>
      </div>

      {/* 4. Total de personas */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 shadow-xs transition-shadow hover:shadow-sm">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Total Personas
          </span>
          <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center">
            <Users className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 tabular-nums">
            {totalPersonas}
          </span>
          <span className="text-xs text-slate-500">
            usuarios en plantilla
          </span>
        </div>
        <p className="mt-3 text-[11px] text-slate-500 font-medium">
          Con tarjeta NFC activa
        </p>
      </div>

    </div>
  );
};
