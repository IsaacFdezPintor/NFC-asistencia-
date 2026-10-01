import React, { useState } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon, 
  Users, 
  Sun, 
  Sunset, 
  Clock, 
  CheckCircle2, 
  CreditCard 
} from 'lucide-react';
import { AttendanceRecord, Person } from '../types';
import { getAvatarColor, getInitials, getShortSpanishDate } from '../utils/dateUtils';
import { getTodayDateString } from '../services/storageService';

interface CalendarViewProps {
  records: AttendanceRecord[];
  persons: Person[];
  onSelectPerson: (personId: string) => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({
  records,
  persons,
  onSelectPerson,
}) => {
  const todayStr = getTodayDateString();
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);

  const initialDate = new Date();
  const [currentYear, setCurrentYear] = useState(initialDate.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(initialDate.getMonth()); // 0-indexed

  // Month navigation
  const prevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  // Calendar matrix calculation
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

  // Day of week for first day (0 = Sunday, 1 = Monday). Convert so Monday = 0
  const startingDayIndex = (firstDayOfMonth.getDay() + 6) % 7;

  // Filter records for selected date
  const dayRecords = records.filter((r) => r.date === selectedDate);
  const uniqueAttendees = new Set(dayRecords.map((r) => r.person_id)).size;
  const morningAttendees = dayRecords.filter((r) => r.shift === 'Mañana').length;
  const afternoonAttendees = dayRecords.filter((r) => r.shift === 'Tarde').length;

  // Selected date formatted title
  const [selY, selM, selD] = selectedDate.split('-').map(Number);
  const selDateObj = new Date(selY, selM - 1, selD);
  const selectedDateFormatted = selDateObj.toLocaleDateString('es-ES', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="space-y-6">
      
      {/* View Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">
          Calendario de Asistencias
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Selecciona cualquier fecha para consultar el informe de presencia y personas asistentes.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Interactive Month Calendar (5 cols) */}
        <div className="lg:col-span-5 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          
          {/* Month Header & Controls */}
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-900 text-sm capitalize">
              {monthNames[currentMonth]} {currentYear}
            </h3>
            <div className="flex items-center gap-1">
              <button
                onClick={prevMonth}
                className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors"
                title="Mes anterior"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={nextMonth}
                className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors"
                title="Mes siguiente"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Weekday labels */}
          <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-semibold text-slate-400 mb-2">
            <span>Lun</span>
            <span>Mar</span>
            <span>Mié</span>
            <span>Jue</span>
            <span>Vie</span>
            <span>Sáb</span>
            <span>Dom</span>
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-1">
            {/* Blank offset cells */}
            {Array.from({ length: startingDayIndex }).map((_, i) => (
              <div key={`blank-${i}`} className="h-10 sm:h-12" />
            ))}

            {/* Days of Month */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const dayNum = i + 1;
              const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
              
              const isSelected = dateStr === selectedDate;
              const isToday = dateStr === todayStr;
              
              // Count attendances for this day
              const countForDay = records.filter((r) => r.date === dateStr).length;

              return (
                <button
                  key={`day-${dayNum}`}
                  onClick={() => setSelectedDate(dateStr)}
                  className={`relative h-10 sm:h-12 rounded-xl flex flex-col items-center justify-center text-xs font-semibold transition-all ${
                    isSelected
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30 font-bold scale-102'
                      : isToday
                      ? 'bg-slate-100 text-indigo-700 border border-indigo-200 hover:bg-slate-200'
                      : 'hover:bg-slate-50 text-slate-800'
                  }`}
                >
                  <span className="tabular-nums">{dayNum}</span>
                  {countForDay > 0 && (
                    <span 
                      className={`w-1.5 h-1.5 rounded-full mt-0.5 ${
                        isSelected ? 'bg-white' : 'bg-emerald-500'
                      }`} 
                    />
                  )}
                </button>
              );
            })}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>Días con asistencias registradas</span>
            </div>
            <button
              onClick={() => {
                setSelectedDate(todayStr);
                const d = new Date();
                setCurrentMonth(d.getMonth());
                setCurrentYear(d.getFullYear());
              }}
              className="text-indigo-600 hover:text-indigo-800 font-semibold"
            >
              Ir a hoy
            </button>
          </div>
        </div>

        {/* Right Column: Selected Day Details & Attendee List (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          
          {/* Day Summary Card */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
              Informe diario de presencia
            </span>
            <h3 className="text-xl font-bold text-slate-900 capitalize mt-1">
              {selectedDateFormatted}
            </h3>

            {/* Metric counters for the day */}
            <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-slate-100 text-xs">
              <div className="bg-slate-50 rounded-xl p-3 text-center border border-slate-100">
                <span className="text-slate-400 block text-[11px] font-medium">Presentes</span>
                <span className="text-xl font-bold text-slate-900 font-mono tabular-nums mt-0.5 block">
                  {uniqueAttendees}
                </span>
                <span className="text-[10px] text-slate-500">personas</span>
              </div>

              <div className="bg-slate-50 rounded-xl p-3 text-center border border-slate-100">
                <span className="text-slate-400 block text-[11px] font-medium flex items-center justify-center gap-1">
                  <Sun className="w-3 h-3 text-amber-500" />
                  Mañana
                </span>
                <span className="text-xl font-bold text-slate-900 font-mono tabular-nums mt-0.5 block">
                  {morningAttendees}
                </span>
                <span className="text-[10px] text-slate-500">asistencias</span>
              </div>

              <div className="bg-slate-50 rounded-xl p-3 text-center border border-slate-100">
                <span className="text-slate-400 block text-[11px] font-medium flex items-center justify-center gap-1">
                  <Sunset className="w-3 h-3 text-indigo-500" />
                  Tarde
                </span>
                <span className="text-xl font-bold text-slate-900 font-mono tabular-nums mt-0.5 block">
                  {afternoonAttendees}
                </span>
                <span className="text-[10px] text-slate-500">asistencias</span>
              </div>
            </div>
          </div>

          {/* List of Attendees on this day */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Personas que asistieron ({dayRecords.length})
              </h4>
              <span className="text-xs text-slate-400 font-mono">
                {selectedDate}
              </span>
            </div>

            {dayRecords.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-xs">
                <CalendarIcon className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="font-semibold text-slate-700">Sin asistencias registradas</p>
                <p className="text-slate-400 mt-0.5">
                  No constan fichajes mediante tarjeta NFC en esta fecha.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100 max-h-96 overflow-y-auto">
                {dayRecords.map((r) => (
                  <div 
                    key={r.id} 
                    className="p-3.5 flex items-center justify-between hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${getAvatarColor(r.person_name)}`}>
                        {getInitials(r.person_name)}
                      </div>
                      <div>
                        <button
                          onClick={() => onSelectPerson(r.person_id)}
                          className="font-bold text-slate-900 text-xs hover:text-indigo-600 transition-colors text-left"
                        >
                          {r.person_name}
                        </button>
                        <p className="text-[11px] text-slate-400 flex items-center gap-1.5 font-mono">
                          <span>NFC: {r.nfc_uid}</span>
                          <span>·</span>
                          <span>{r.device_name}</span>
                        </p>
                      </div>
                    </div>

                    <div className="text-right text-xs">
                      <span className="font-mono font-bold text-slate-900 tabular-nums">
                        {r.time}
                      </span>
                      <p className="text-[11px] text-indigo-600 font-semibold mt-0.5">
                        {r.shift}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

      </div>

    </div>
  );
};
