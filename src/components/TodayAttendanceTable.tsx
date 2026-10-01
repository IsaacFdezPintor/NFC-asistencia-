import React, { useState } from 'react';
import { Search, Clock, User, Eye, Sun, Sunset, Moon, Laptop2 } from 'lucide-react';
import { AttendanceRecord } from '../types';
import { getAvatarColor, getInitials } from '../utils/dateUtils';

interface TodayAttendanceTableProps {
  records: AttendanceRecord[];
  onSelectPerson: (personId: string) => void;
}

export const TodayAttendanceTable: React.FC<TodayAttendanceTableProps> = ({
  records,
  onSelectPerson,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredRecords = records.filter((r) =>
    r.person_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.nfc_uid.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
      {/* Table Header with Search */}
      <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
            ASISTENCIA DE HOY
          </h2>
          <span className="text-xs font-semibold text-slate-500 font-mono bg-slate-100 px-2 py-0.5 rounded-full tabular-nums">
            {records.length} {records.length === 1 ? 'registro' : 'registros'}
          </span>
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por nombre o NFC..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:bg-white transition-colors"
          />
        </div>
      </div>

      {/* Content */}
      {filteredRecords.length === 0 ? (
        <div className="p-12 text-center text-slate-500">
          <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
            <Clock className="w-6 h-6" />
          </div>
          <p className="font-medium text-slate-700">No hay registros de asistencia para mostrar</p>
          <p className="text-xs text-slate-400 mt-1">
            {searchQuery
              ? 'No coincide ninguna persona con el filtro de búsqueda.'
              : 'Acerca una tarjeta NFC en el lector superior para registrar el primer ingreso de hoy.'}
          </p>
        </div>
      ) : (
        <>
          {/* Desktop & Tablet Table */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/75 border-b border-slate-200/80 text-slate-500 font-semibold uppercase tracking-wider">
                  <th className="py-3 px-4">Persona</th>
                  <th className="py-3 px-4">Hora</th>
                  <th className="py-3 px-4">Franja</th>
                  <th className="py-3 px-4">Estado</th>
                  <th className="py-3 px-4">Dispositivo</th>
                  <th className="py-3 px-4 text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredRecords.map((record) => (
                  <tr 
                    key={record.id}
                    className="hover:bg-slate-50/80 transition-colors group"
                  >
                    {/* Persona */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${getAvatarColor(record.person_name)}`}>
                          {getInitials(record.person_name)}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors">
                            {record.person_name}
                          </p>
                          <p className="text-[11px] text-slate-400 font-mono">
                            NFC: {record.nfc_uid}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Hora */}
                    <td className="py-3 px-4">
                      <span className="font-mono text-xs font-semibold text-slate-800 tabular-nums">
                        {record.time}
                      </span>
                    </td>

                    {/* Franja */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5">
                        {record.shift === 'Mañana' ? (
                          <Sun className="w-3.5 h-3.5 text-amber-500" />
                        ) : record.shift === 'Tarde' ? (
                          <Sunset className="w-3.5 h-3.5 text-indigo-500" />
                        ) : (
                          <Moon className="w-3.5 h-3.5 text-slate-400" />
                        )}
                        <span className="text-slate-700">
                          {record.shift}
                        </span>
                      </div>
                    </td>

                    {/* Estado */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5 text-emerald-700">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        <span className="font-medium">Presente</span>
                      </div>
                    </td>

                    {/* Dispositivo */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5 text-slate-500 text-[11px]">
                        <Laptop2 className="w-3.5 h-3.5 text-slate-400" />
                        <span>{record.device_name}</span>
                      </div>
                    </td>

                    {/* Acción */}
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => onSelectPerson(record.person_id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors inline-flex items-center gap-1"
                        title="Ver perfil y ficha completa"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span className="text-[11px] font-medium">Ver perfil</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards (Responsive fallback) */}
          <div className="sm:hidden divide-y divide-slate-100">
            {filteredRecords.map((record) => (
              <div 
                key={record.id}
                onClick={() => onSelectPerson(record.person_id)}
                className="p-4 flex items-center justify-between active:bg-slate-50 cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${getAvatarColor(record.person_name)}`}>
                    {getInitials(record.person_name)}
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-slate-900 leading-tight">
                      {record.person_name}
                    </h4>
                    <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                      <span className="font-mono font-medium text-slate-800 tabular-nums">{record.time}</span>
                      <span>·</span>
                      <span>{record.shift}</span>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="flex items-center gap-1 text-emerald-700 text-xs font-semibold">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    <span>Presente</span>
                  </div>
                  <span className="text-[10px] text-slate-400 block mt-0.5 font-mono">{record.nfc_uid}</span>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};
