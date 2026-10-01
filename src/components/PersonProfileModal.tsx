import React from 'react';
import { 
  X, 
  Calendar, 
  Clock, 
  CreditCard, 
  CheckCircle2, 
  XCircle, 
  Sun, 
  Sunset, 
  Moon, 
  BarChart2, 
  Mail, 
  Phone,
  Building
} from 'lucide-react';
import { Person, AttendanceRecord } from '../types';
import { getAvatarColor, getInitials, getShortSpanishDate } from '../utils/dateUtils';

interface PersonProfileModalProps {
  person: Person | null;
  attendanceRecords: AttendanceRecord[];
  onClose: () => void;
}

export const PersonProfileModal: React.FC<PersonProfileModalProps> = ({
  person,
  attendanceRecords,
  onClose,
}) => {
  if (!person) return null;

  const personalRecords = attendanceRecords
    .filter((r) => r.person_id === person.id)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  // Calculate statistics
  const now = new Date();
  const currentMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  
  // Attendances this month
  const monthRecords = personalRecords.filter((r) => r.date.startsWith(currentMonthStr));
  const asistenciasMes = monthRecords.length;

  // Attendances this week (last 7 days)
  const oneWeekAgo = new Date(Date.now() - 7 * 86400000);
  const asistenciasSemana = personalRecords.filter(
    (r) => new Date(r.created_at).getTime() >= oneWeekAgo.getTime()
  ).length;

  // Last attendance
  const ultimaAsistencia = personalRecords.length > 0 ? personalRecords[0] : null;

  // Attendance by day of week breakdown for mini-chart
  const daysOfWeek = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
  const dayCounts = [0, 0, 0, 0, 0, 0, 0];

  personalRecords.forEach((r) => {
    const d = new Date(r.date + 'T12:00:00');
    // Monday is 1, Sunday is 0 in JS Date
    const dayIdx = (d.getDay() + 6) % 7; // Map so Monday = 0, Sunday = 6
    dayCounts[dayIdx]++;
  });

  const maxDayCount = Math.max(...dayCounts, 1);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden">
        
        {/* Modal Header */}
        <div className="p-6 bg-slate-50 border-b border-slate-200 flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold shadow-xs ${getAvatarColor(person.full_name)}`}>
              {getInitials(person.full_name)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-bold text-slate-900">{person.full_name}</h3>
                <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                  person.active ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                }`}>
                  {person.active ? 'Activo' : 'Inactivo'}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1 flex items-center gap-2 font-mono">
                <span>ID: {person.internal_id}</span>
                <span>·</span>
                <span className="flex items-center gap-1 font-semibold text-slate-700">
                  <CreditCard className="w-3.5 h-3.5 text-indigo-600" />
                  NFC: {person.nfc_uid}
                </span>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs">
          
          {/* Contact and Department strip */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 bg-slate-50 rounded-xl border border-slate-200/80">
            <div className="flex items-center gap-2 text-slate-600">
              <Mail className="w-4 h-4 text-slate-400" />
              <span className="truncate">{person.email || 'Sin correo'}</span>
            </div>
            <div className="flex items-center gap-2 text-slate-600">
              <Phone className="w-4 h-4 text-slate-400" />
              <span>{person.phone || 'Sin teléfono'}</span>
            </div>
            <div className="flex items-center gap-2 text-slate-600">
              <Building className="w-4 h-4 text-slate-400" />
              <span>{person.department || 'General'}</span>
            </div>
          </div>

          {/* 3 Metric cards */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-white border border-slate-200 rounded-xl p-3.5 text-center shadow-xs">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                Asistencias mes
              </span>
              <span className="text-2xl font-bold text-slate-900 tabular-nums font-mono mt-1 block">
                {asistenciasMes}
              </span>
              <span className="text-[10px] text-slate-400 mt-0.5 block">Mes en curso</span>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-3.5 text-center shadow-xs">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                Esta semana
              </span>
              <span className="text-2xl font-bold text-slate-900 tabular-nums font-mono mt-1 block">
                {asistenciasSemana}
              </span>
              <span className="text-[10px] text-slate-400 mt-0.5 block">Últimos 7 días</span>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-3.5 text-center shadow-xs">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                Última asistencia
              </span>
              <span className="text-sm font-bold text-slate-900 mt-2 block truncate">
                {ultimaAsistencia ? `${ultimaAsistencia.time} (${ultimaAsistencia.shift})` : 'Sin registros'}
              </span>
              <span className="text-[10px] text-slate-400 mt-0.5 block">
                {ultimaAsistencia ? getShortSpanishDate(ultimaAsistencia.date) : '—'}
              </span>
            </div>
          </div>

          {/* Mini Chart: Attendance Frequency by Day of Week */}
          <div className="border border-slate-200 rounded-xl p-4 bg-white">
            <div className="flex items-center justify-between mb-3">
              <span className="font-bold text-slate-900 flex items-center gap-1.5">
                <BarChart2 className="w-4 h-4 text-indigo-600" />
                Frecuencia de asistencia por día de la semana
              </span>
              <span className="text-[11px] text-slate-400">Total histórico</span>
            </div>

            <div className="grid grid-cols-7 gap-2 pt-2 items-end h-28">
              {daysOfWeek.map((day, idx) => {
                const count = dayCounts[idx];
                const heightPercent = maxDayCount > 0 ? (count / maxDayCount) * 100 : 0;
                return (
                  <div key={day} className="flex flex-col items-center h-full justify-end group">
                    <span className="text-[10px] font-mono text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity mb-1 tabular-nums">
                      {count}
                    </span>
                    <div className="w-full max-w-[28px] bg-slate-100 rounded-t-md h-full flex items-end overflow-hidden">
                      <div 
                        className="w-full bg-indigo-500 rounded-t-md transition-all duration-500 group-hover:bg-indigo-600"
                        style={{ height: `${Math.max(heightPercent, 6)}%` }}
                      />
                    </div>
                    <span className="text-[10px] font-semibold text-slate-600 mt-1.5">{day}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Complete Personal Attendance History List */}
          <div>
            <h4 className="font-bold text-slate-900 text-sm mb-3">
              Historial de asistencias registradas ({personalRecords.length})
            </h4>

            {personalRecords.length === 0 ? (
              <p className="text-slate-400 text-center py-6 bg-slate-50 rounded-xl border border-slate-100">
                Esta persona aún no ha registrado ninguna asistencia.
              </p>
            ) : (
              <div className="border border-slate-200 rounded-xl divide-y divide-slate-100 overflow-hidden max-h-56 overflow-y-auto">
                {personalRecords.map((r) => (
                  <div key={r.id} className="p-3 flex items-center justify-between hover:bg-slate-50 transition-colors">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
                        <CheckCircle2 className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900">
                          {getShortSpanishDate(r.date)}
                        </p>
                        <p className="text-[11px] text-slate-400">
                          Dispositivo: {r.device_name}
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="flex items-center gap-1.5 justify-end font-mono font-semibold text-slate-800 tabular-nums">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>{r.time}</span>
                      </div>
                      <span className="text-[11px] text-indigo-600 font-medium">
                        {r.shift}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-lg text-xs transition-colors"
          >
            Cerrar ficha
          </button>
        </div>

      </div>
    </div>
  );
};
