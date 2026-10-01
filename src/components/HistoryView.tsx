import React, { useState } from 'react';
import { 
  Download, 
  Search, 
  Calendar, 
  Filter, 
  Sun, 
  Sunset, 
  Moon, 
  Laptop2, 
  Trash2, 
  RefreshCw 
} from 'lucide-react';
import { AttendanceRecord, Person, CurrentUser } from '../types';
import { storageService } from '../services/storageService';
import { getAvatarColor, getInitials, getShortSpanishDate } from '../utils/dateUtils';

interface HistoryViewProps {
  records: AttendanceRecord[];
  persons: Person[];
  onRefresh: () => void;
  currentUser: CurrentUser;
  onSelectPerson: (personId: string) => void;
}

export const HistoryView: React.FC<HistoryViewProps> = ({
  records,
  persons,
  onRefresh,
  currentUser,
  onSelectPerson,
}) => {
  const [selectedPersonId, setSelectedPersonId] = useState<string>('all');
  const [selectedShift, setSelectedShift] = useState<string>('all');
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredRecords = records.filter((r) => {
    const matchesPerson = selectedPersonId === 'all' || r.person_id === selectedPersonId;
    const matchesShift = selectedShift === 'all' || r.shift === selectedShift;
    const matchesDate = !selectedDate || r.date === selectedDate;
    const matchesQuery =
      r.person_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.nfc_uid.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesPerson && matchesShift && matchesDate && matchesQuery;
  });

  const handleExportCsv = () => {
    storageService.exportCsv(filteredRecords);
  };

  const handleDeleteRecord = (id: string, name: string, time: string) => {
    if (confirm(`¿Eliminar el registro de ${name} a las ${time}?`)) {
      storageService.deleteAttendance(id);
      onRefresh();
    }
  };

  const handleClearFilters = () => {
    setSelectedPersonId('all');
    setSelectedShift('all');
    setSelectedDate('');
    setSearchQuery('');
  };

  return (
    <div className="space-y-6">
      
      {/* Header and Export Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Histórico de Asistencias
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Registro cronológico general de accesos y presencia mediante lector NFC.
          </p>
        </div>

        <button
          onClick={handleExportCsv}
          className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors self-start sm:self-auto"
        >
          <Download className="w-4 h-4" />
          <span>Exportar CSV ({filteredRecords.length})</span>
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
        
        {/* Search Input */}
        <div>
          <label className="block text-slate-500 font-semibold mb-1">Buscar persona</label>
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Nombre o UID..."
              className="w-full pl-8 pr-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        {/* Filter by Person */}
        <div>
          <label className="block text-slate-500 font-semibold mb-1">Filtrar por persona</label>
          <select
            value={selectedPersonId}
            onChange={(e) => setSelectedPersonId(e.target.value)}
            className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-indigo-500"
          >
            <option value="all">Todas las personas ({persons.length})</option>
            {persons.map((p) => (
              <option key={p.id} value={p.id}>
                {p.full_name} ({p.internal_id})
              </option>
            ))}
          </select>
        </div>

        {/* Filter by Shift */}
        <div>
          <label className="block text-slate-500 font-semibold mb-1">Franja horaria</label>
          <select
            value={selectedShift}
            onChange={(e) => setSelectedShift(e.target.value)}
            className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-indigo-500"
          >
            <option value="all">Todas las franjas</option>
            <option value="Mañana">Mañana (06:00 - 14:00)</option>
            <option value="Tarde">Tarde (14:00 - 22:00)</option>
            <option value="Noche">Noche (Fuera de horario)</option>
          </select>
        </div>

        {/* Filter by Date */}
        <div>
          <label className="block text-slate-500 font-semibold mb-1">Fecha específica</label>
          <div className="flex gap-2">
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-indigo-500"
            />
            {(selectedDate || selectedPersonId !== 'all' || selectedShift !== 'all' || searchQuery) && (
              <button
                onClick={handleClearFilters}
                className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium whitespace-nowrap"
                title="Limpiar filtros"
              >
                Limpiar
              </button>
            )}
          </div>
        </div>

      </div>

      {/* History Records Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {filteredRecords.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            <Calendar className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="font-semibold text-slate-700">No hay registros para este criterio</p>
            <p className="text-xs text-slate-400 mt-1">
              Prueba a modificar los filtros de fecha o nombre.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/75 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
                  <th className="py-3 px-4">Persona</th>
                  <th className="py-3 px-4">Fecha</th>
                  <th className="py-3 px-4">Hora</th>
                  <th className="py-3 px-4">Franja</th>
                  <th className="py-3 px-4">Dispositivo</th>
                  <th className="py-3 px-4">Tipo</th>
                  {currentUser.role === 'admin' && (
                    <th className="py-3 px-4 text-right">Acción</th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredRecords.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50/80 transition-colors">
                    {/* Persona */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${getAvatarColor(r.person_name)}`}>
                          {getInitials(r.person_name)}
                        </div>
                        <div>
                          <button
                            onClick={() => onSelectPerson(r.person_id)}
                            className="font-bold text-slate-900 hover:text-indigo-600 transition-colors text-left"
                          >
                            {r.person_name}
                          </button>
                          <p className="text-[11px] text-slate-400 font-mono">
                            {r.nfc_uid}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Fecha */}
                    <td className="py-3 px-4 text-slate-800">
                      {getShortSpanishDate(r.date)}
                    </td>

                    {/* Hora */}
                    <td className="py-3 px-4">
                      <span className="font-mono font-semibold text-slate-900 tabular-nums">
                        {r.time}
                      </span>
                    </td>

                    {/* Franja */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5 text-slate-700">
                        {r.shift === 'Mañana' ? (
                          <Sun className="w-3.5 h-3.5 text-amber-500" />
                        ) : r.shift === 'Tarde' ? (
                          <Sunset className="w-3.5 h-3.5 text-indigo-500" />
                        ) : (
                          <Moon className="w-3.5 h-3.5 text-slate-400" />
                        )}
                        <span>{r.shift}</span>
                      </div>
                    </td>

                    {/* Dispositivo */}
                    <td className="py-3 px-4 text-slate-500">
                      <div className="flex items-center gap-1.5">
                        <Laptop2 className="w-3.5 h-3.5 text-slate-400" />
                        <span>{r.device_name}</span>
                      </div>
                    </td>

                    {/* Tipo */}
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center gap-1 text-emerald-700 font-medium">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        {r.type}
                      </span>
                    </td>

                    {/* Delete action for admin */}
                    {currentUser.role === 'admin' && (
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => handleDeleteRecord(r.id, r.person_name, r.time)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                          title="Eliminar este registro"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
};
