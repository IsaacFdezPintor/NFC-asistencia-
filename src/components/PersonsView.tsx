import React, { useState, useEffect } from 'react';
import { 
  Users, 
  UserPlus, 
  Search, 
  Edit3, 
  Trash2, 
  CreditCard, 
  CheckCircle2, 
  XCircle, 
  AlertCircle,
  Eye,
  X,
  Wifi,
  ShieldAlert,
  Smartphone,
  Mail
} from 'lucide-react';
import { Person, CurrentUser } from '../types';
import { storageService } from '../services/storageService';
import { nfcService } from '../services/nfcService';
import { getAvatarColor, getInitials, getShortSpanishDate } from '../utils/dateUtils';

interface PersonsViewProps {
  persons: Person[];
  onRefresh: () => void;
  currentUser: CurrentUser;
  onSelectPerson: (personId: string) => void;
  initialAssignUid?: string | null;
  onClearInitialAssignUid?: () => void;
}

export const PersonsView: React.FC<PersonsViewProps> = ({
  persons,
  onRefresh,
  currentUser,
  onSelectPerson,
  initialAssignUid,
  onClearInitialAssignUid,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPerson, setEditingPerson] = useState<Person | null>(null);

  // Form states
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [internalId, setInternalId] = useState('');
  const [department, setDepartment] = useState('General');
  const [nfcUid, setNfcUid] = useState('');
  const [isActive, setIsActive] = useState(true);

  // NFC assignment detection inside modal
  const [isListeningForNfc, setIsListeningForNfc] = useState(false);
  const [nfcError, setNfcError] = useState<string | null>(null);

  // Handle initialAssignUid passed from "Tarjeta no reconocida"
  useEffect(() => {
    if (initialAssignUid) {
      openAddModal(initialAssignUid);
      if (onClearInitialAssignUid) onClearInitialAssignUid();
    }
  }, [initialAssignUid]);

  // Listen for NFC taps while "Asignar NFC" is active in modal
  useEffect(() => {
    if (!isListeningForNfc) return;

    const unsubscribe = nfcService.onCardDetected((detectedUid) => {
      // Check collision
      const collision = storageService.isNfcUidAssigned(detectedUid, editingPerson?.id);
      if (collision.assigned && collision.person) {
        setNfcError(`Esta tarjeta NFC ya está asignada a ${collision.person.full_name}.`);
        nfcService.playFeedbackSound('warning');
      } else {
        setNfcUid(detectedUid);
        setNfcError(null);
        setIsListeningForNfc(false);
        nfcService.playFeedbackSound('success');
      }
    });

    return () => unsubscribe();
  }, [isListeningForNfc, editingPerson]);

  const openAddModal = (presetUid: string = '') => {
    setEditingPerson(null);
    setFirstName('');
    setLastName('');
    setEmail('');
    setPhone('');
    setInternalId(`EMP-0${persons.length + 101}`);
    setDepartment('Operaciones');
    setNfcUid(presetUid);
    setIsActive(true);
    setNfcError(null);
    setIsListeningForNfc(false);
    setIsModalOpen(true);
  };

  const openEditModal = (person: Person) => {
    setEditingPerson(person);
    setFirstName(person.first_name);
    setLastName(person.last_name);
    setEmail(person.email || '');
    setPhone(person.phone || '');
    setInternalId(person.internal_id);
    setDepartment(person.department || 'General');
    setNfcUid(person.nfc_uid);
    setIsActive(person.active);
    setNfcError(null);
    setIsListeningForNfc(false);
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName.trim() || !lastName.trim() || !nfcUid.trim()) {
      alert('Por favor, completa el nombre, apellido y asigna un identificador NFC.');
      return;
    }

    // Check collision again
    const collision = storageService.isNfcUidAssigned(nfcUid.trim(), editingPerson?.id);
    if (collision.assigned && collision.person) {
      setNfcError(`Esta tarjeta NFC ya está asignada a ${collision.person.full_name}.`);
      return;
    }

    if (editingPerson) {
      storageService.updatePerson(editingPerson.id, {
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        internal_id: internalId.trim(),
        department: department.trim(),
        nfc_uid: nfcUid.trim().toUpperCase(),
        active: isActive,
      });
    } else {
      storageService.createPerson({
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        internal_id: internalId.trim(),
        department: department.trim(),
        nfc_uid: nfcUid.trim().toUpperCase(),
        active: isActive,
      });
    }

    setIsModalOpen(false);
    onRefresh();
  };

  const handleDelete = (id: string, name: string) => {
    if (confirm(`¿Estás seguro de que deseas eliminar a ${name}? Esta acción no se puede deshacer.`)) {
      storageService.deletePerson(id);
      onRefresh();
    }
  };

  const handleToggleActive = (person: Person) => {
    storageService.updatePerson(person.id, { active: !person.active });
    onRefresh();
  };

  const filteredPersons = persons.filter((p) => {
    const matchesSearch =
      p.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.internal_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.nfc_uid.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.email && p.email.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus =
      statusFilter === 'all' ? true : statusFilter === 'active' ? p.active : !p.active;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      
      {/* Top action header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Gestión de Personas
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Administra los usuarios de la instalación y sus tarjetas NFC asignadas.
          </p>
        </div>

        {currentUser.role === 'admin' ? (
          <button
            onClick={() => openAddModal()}
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors"
          >
            <UserPlus className="w-4 h-4" />
            <span>Añadir persona</span>
          </button>
        ) : (
          <span className="text-xs text-slate-400">
            Modo Operador: solo lectura de personas
          </span>
        )}
      </div>

      {/* Filters and search bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por nombre, ID o UID NFC..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:bg-white transition-colors"
          />
        </div>

        {/* Status filters */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg self-start sm:self-auto">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
              statusFilter === 'all'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Todos ({persons.length})
          </button>
          <button
            onClick={() => setStatusFilter('active')}
            className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
              statusFilter === 'active'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Activos ({persons.filter((p) => p.active).length})
          </button>
          <button
            onClick={() => setStatusFilter('inactive')}
            className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
              statusFilter === 'inactive'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Inactivos ({persons.filter((p) => !p.active).length})
          </button>
        </div>
      </div>

      {/* Persons List Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {filteredPersons.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            <Users className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="font-semibold text-slate-700">No se encontraron personas</p>
            <p className="text-xs text-slate-400 mt-1">Prueba a cambiar el filtro de búsqueda.</p>
          </div>
        ) : (
          <>
            {/* Desktop / Tablet Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50/75 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
                    <th className="py-3 px-4">Persona</th>
                    <th className="py-3 px-4">Identificador Interno</th>
                    <th className="py-3 px-4">Tarjeta NFC Asignada</th>
                    <th className="py-3 px-4">Estado</th>
                    <th className="py-3 px-4">Fecha de Alta</th>
                    <th className="py-3 px-4 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {filteredPersons.map((person) => (
                    <tr key={person.id} className="hover:bg-slate-50/80 transition-colors group">
                      {/* Name & Contact */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${getAvatarColor(person.full_name)}`}>
                            {getInitials(person.full_name)}
                          </div>
                          <div>
                            <button
                              onClick={() => onSelectPerson(person.id)}
                              className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors text-left"
                            >
                              {person.full_name}
                            </button>
                            <div className="flex items-center gap-2 text-[11px] text-slate-400">
                              {person.email && <span>{person.email}</span>}
                              {person.department && (
                                <>
                                  <span>·</span>
                                  <span>{person.department}</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Internal ID */}
                      <td className="py-3 px-4">
                        <span className="font-mono text-slate-700">{person.internal_id}</span>
                      </td>

                      {/* NFC UID */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5">
                          <CreditCard className="w-3.5 h-3.5 text-indigo-500" />
                          <span className="font-mono text-xs font-semibold text-slate-800 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                            {person.nfc_uid}
                          </span>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4">
                        {person.active ? (
                          <span className="inline-flex items-center gap-1 text-emerald-700 font-medium">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            Activo
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-rose-700 font-medium">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                            Inactivo
                          </span>
                        )}
                      </td>

                      {/* Created date */}
                      <td className="py-3 px-4 text-slate-500">
                        {getShortSpanishDate(person.created_at.split('T')[0])}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => onSelectPerson(person.id)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                            title="Ver ficha de asistencia"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {currentUser.role === 'admin' && (
                            <>
                              <button
                                onClick={() => openEditModal(person)}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                                title="Editar persona"
                              >
                                <Edit3 className="w-4 h-4" />
                              </button>

                              <button
                                onClick={() => handleToggleActive(person)}
                                className={`p-1.5 rounded-lg transition-colors ${
                                  person.active
                                    ? 'text-slate-400 hover:text-amber-600 hover:bg-amber-50'
                                    : 'text-slate-400 hover:text-emerald-600 hover:bg-emerald-50'
                                }`}
                                title={person.active ? 'Desactivar usuario' : 'Activar usuario'}
                              >
                                {person.active ? <XCircle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
                              </button>

                              <button
                                onClick={() => handleDelete(person.id, person.full_name)}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                                title="Eliminar definitivamente"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden divide-y divide-slate-100">
              {filteredPersons.map((person) => (
                <div key={person.id} className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold ${getAvatarColor(person.full_name)}`}>
                        {getInitials(person.full_name)}
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 text-sm">{person.full_name}</h4>
                        <p className="text-xs text-slate-400 font-mono">{person.internal_id}</p>
                      </div>
                    </div>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                      person.active ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                    }`}>
                      {person.active ? 'Activo' : 'Inactivo'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-50">
                    <div className="flex items-center gap-1.5 font-mono text-slate-600 bg-slate-100 px-2 py-1 rounded">
                      <CreditCard className="w-3.5 h-3.5 text-indigo-500" />
                      <span>{person.nfc_uid}</span>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => onSelectPerson(person.id)}
                        className="p-1.5 text-slate-500 hover:bg-slate-100 rounded-lg text-xs font-medium"
                      >
                        Ver ficha
                      </button>
                      {currentUser.role === 'admin' && (
                        <button
                          onClick={() => openEditModal(person)}
                          className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg text-xs font-medium"
                        >
                          Editar
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Add / Edit Person Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-lg w-full overflow-hidden">
            
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  {editingPerson ? 'Editar Persona' : 'Añadir Nueva Persona'}
                </h3>
                <p className="text-xs text-slate-500">
                  Rellena los datos personales y vincula una tarjeta NFC.
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSave} className="p-5 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Nombre *</label>
                  <input
                    type="text"
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="Isaac"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-indigo-500 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Apellidos *</label>
                  <input
                    type="text"
                    required
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="García"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-indigo-500 focus:bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">ID Interno / Empleado</label>
                  <input
                    type="text"
                    value={internalId}
                    onChange={(e) => setInternalId(e.target.value)}
                    placeholder="EMP-0101"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-mono focus:outline-none focus:border-indigo-500 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Departamento / Área</label>
                  <input
                    type="text"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    placeholder="Operaciones"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-indigo-500 focus:bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Correo Electrónico</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="usuario@empresa.com"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-indigo-500 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Teléfono</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+34 600 000 000"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-indigo-500 focus:bg-white"
                  />
                </div>
              </div>

              {/* ASIGNAR TARJETA NFC SECTION */}
              <div className="p-3.5 bg-indigo-50/60 rounded-xl border border-indigo-100 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-indigo-600" />
                    <span className="font-bold text-indigo-950">Tarjeta o Pegatina NFC *</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setIsListeningForNfc(!isListeningForNfc);
                      setNfcError(null);
                    }}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                      isListeningForNfc
                        ? 'bg-amber-600 text-white animate-pulse'
                        : 'bg-indigo-600 text-white hover:bg-indigo-700'
                    }`}
                  >
                    <Wifi className="w-3.5 h-3.5" />
                    <span>{isListeningForNfc ? 'Escaneando lector...' : 'Asignar tarjeta NFC'}</span>
                  </button>
                </div>

                {/* Live listening alert */}
                {isListeningForNfc && (
                  <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-lg text-amber-900 text-xs flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
                    <span>Acerca la nueva tarjeta NFC al lector físico o usa el simulador...</span>
                  </div>
                )}

                {/* Collision error alert */}
                {nfcError && (
                  <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-lg text-rose-800 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                    <span>{nfcError}</span>
                  </div>
                )}

                <div>
                  <input
                    type="text"
                    required
                    value={nfcUid}
                    onChange={(e) => {
                      setNfcUid(e.target.value.toUpperCase());
                      setNfcError(null);
                    }}
                    placeholder="UID NFC (ej: 04:A2:7B:91:E2 o NFC-001)"
                    className="w-full px-3 py-2 bg-white border border-indigo-200 rounded-lg text-slate-900 font-mono font-semibold focus:outline-none focus:border-indigo-600 uppercase"
                  />
                  <p className="text-[11px] text-slate-500 mt-1">
                    Cada persona debe tener un identificador NFC único en el sistema.
                  </p>
                </div>
              </div>

              {/* Status active checkbox */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="activeCheck"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                />
                <label htmlFor="activeCheck" className="text-xs font-semibold text-slate-700 cursor-pointer">
                  Usuario activo (puede fichar y registrar asistencia)
                </label>
              </div>

              {/* Modal Footer */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-lg"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg shadow-xs"
                >
                  {editingPerson ? 'Guardar Cambios' : 'Crear Persona'}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
};
