import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { settingsService } from '../../services/settingsService';
import {
  STATES, DISTRICTS, CITIES, MANDALS,
  addCustomLocation, removeCustomLocation, isBaseLocation,
} from '../../data/locations';
import { toast } from '../../store/toastStore';
import {
  MapPin, Plus, Trash2, ChevronDown, ChevronRight,
  Globe, Building2, Landmark,
} from 'lucide-react';

export default function Locations() {
  const { t } = useTranslation('dashboard');
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);

  // Form state
  const [newStateName, setNewStateName] = useState('');
  const [newDistrictState, setNewDistrictState] = useState('');
  const [newDistrictName, setNewDistrictName] = useState('');
  const [newCityDistrict, setNewCityDistrict] = useState('');
  const [newCityName, setNewCityName] = useState('');
  const [newMandalState, setNewMandalState] = useState('');
  const [newMandalDistrict, setNewMandalDistrict] = useState('');
  const [newMandalName, setNewMandalName] = useState('');

  // Expanded panels
  const [expandedStates, setExpandedStates] = useState({});

  useEffect(() => {
    settingsService.getSettings().then(s => {
      setSettings(s);
      setLoading(false);
    });
  }, []);

  async function syncToBackend(customLocations) {
    try {
      const res = await settingsService.updateSettings({ customLocations });
      setSettings(res);
    } catch {
      // Non-critical – data already saved to localStorage
    }
  }

  function getCustomLocations() {
    const raw = localStorage.getItem('omkar_custom_locations');
    try {
      return raw ? JSON.parse(raw) : { states: [], districts: {}, cities: [], mandals: {} };
    } catch {
      return { states: [], districts: {}, cities: [], mandals: {} };
    }
  }

  function saveCustomLocations(custom) {
    localStorage.setItem('omkar_custom_locations', JSON.stringify(custom));
    syncToBackend(custom);
  }

  // ── Add State ──
  function handleAddState(e) {
    e.preventDefault();
    const name = newStateName.trim();
    if (!name) return;
    if (STATES.includes(name)) {
      toast.error('State already exists.');
      return;
    }
    addCustomLocation('state', name);
    const custom = getCustomLocations();
    saveCustomLocations(custom);
    setNewStateName('');
    toast.success(`State "${name}" added successfully!`);
  }

  // ── Add District ──
  function handleAddDistrict(e) {
    e.preventDefault();
    const name = newDistrictName.trim();
    const state = newDistrictState;
    if (!name || !state) {
      toast.error('Please select a state and enter a district name.');
      return;
    }
    if (DISTRICTS[state]?.includes(name)) {
      toast.error('District already exists in this state.');
      return;
    }
    addCustomLocation('district', name, state);
    const custom = getCustomLocations();
    saveCustomLocations(custom);
    setNewDistrictName('');
    toast.success(`District "${name}" added to ${state}!`);
  }

  // ── Add City ──
  function handleAddCity(e) {
    e.preventDefault();
    const name = newCityName.trim();
    if (!name) return;
    if (CITIES.includes(name)) {
      toast.error('City already exists.');
      return;
    }
    addCustomLocation('city', name);
    const custom = getCustomLocations();
    saveCustomLocations(custom);
    setNewCityName('');
    toast.success(`City "${name}" added successfully!`);
  }

  // ── Add Mandal ──
  function handleAddMandal(e) {
    e.preventDefault();
    const name = newMandalName.trim();
    const district = newMandalDistrict;
    if (!name || !district) {
      toast.error('Please select a district and enter a mandal name.');
      return;
    }
    if (MANDALS[district]?.includes(name)) {
      toast.error('Mandal already exists in this district.');
      return;
    }
    addCustomLocation('mandal', name, district);
    const custom = getCustomLocations();
    saveCustomLocations(custom);
    setNewMandalName('');
    toast.success(`Mandal "${name}" added to ${district}!`);
  }

  // ── Remove ──
  function handleRemove(type, value, extraState) {
    removeCustomLocation(type, value, extraState);
    const custom = getCustomLocations();
    saveCustomLocations(custom);
    toast.success(`${type.charAt(0).toUpperCase() + type.slice(1)} "${value}" removed.`);
  }

  function toggleExpandState(state) {
    setExpandedStates(prev => ({ ...prev, [state]: !prev[state] }));
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-200 border-t-brand-600" />
      </div>
    );
  }

  const customLocations = settings?.customLocations || {};
  const customStates = customLocations.states || [];
  const customDistricts = customLocations.districts || {};
  const customCities = customLocations.cities || [];

  const selectCls = 'w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none bg-white';
  const inputCls = 'flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none';

  return (
    <div className="max-w-3xl space-y-6">
      {/* ── Header ── */}
      <div>
        <h1 className="text-xl font-bold text-gray-800 flex items-center gap-2">
          <MapPin size={22} className="text-brand-600" />
          Manage Locations
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Add or remove states, districts, mandals, and cities. Changes appear in property forms and filters immediately.
        </p>
      </div>

      {/* ── Add State ── */}
      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <Globe size={18} className="text-brand-600" />
          <h2 className="text-sm font-bold text-gray-800">Add New State</h2>
        </div>
        <form onSubmit={handleAddState} className="flex gap-2">
          <input
            type="text"
            required
            placeholder="e.g. Karnataka"
            value={newStateName}
            onChange={(e) => setNewStateName(e.target.value)}
            className={inputCls}
          />
          <button
            type="submit"
            className="flex items-center gap-1 rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-warm-white hover:bg-brand-700 cursor-pointer"
          >
            <Plus size={14} /> Add State
          </button>
        </form>
      </div>

      {/* ── Add District ── */}
      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <Building2 size={18} className="text-brand-600" />
          <h2 className="text-sm font-bold text-gray-800">Add New District</h2>
        </div>
        <form onSubmit={handleAddDistrict} className="flex gap-2">
          <select
            required
            value={newDistrictState}
            onChange={(e) => setNewDistrictState(e.target.value)}
            className={selectCls + ' w-48'}
          >
            <option value="">Select State</option>
            {STATES.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          <input
            type="text"
            required
            placeholder="e.g. Palnadu"
            value={newDistrictName}
            onChange={(e) => setNewDistrictName(e.target.value)}
            className={inputCls}
          />
          <button
            type="submit"
            className="flex items-center gap-1 rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-warm-white hover:bg-brand-700 cursor-pointer"
          >
            <Plus size={14} /> Add District
          </button>
        </form>
      </div>

      {/* ── Add City ── */}
      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <Landmark size={18} className="text-brand-600" />
          <h2 className="text-sm font-bold text-gray-800">Add New City / Town</h2>
        </div>
        <form onSubmit={handleAddCity} className="flex gap-2">
          <input
            type="text"
            required
            placeholder="e.g. Mangalagiri"
            value={newCityName}
            onChange={(e) => setNewCityName(e.target.value)}
            className={inputCls}
          />
          <button
            type="submit"
            className="flex items-center gap-1 rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-warm-white hover:bg-brand-700 cursor-pointer"
          >
            <Plus size={14} /> Add City
          </button>
        </form>
      </div>

      {/* ── Add Mandal ── */}
      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <MapPin size={18} className="text-brand-600" />
          <h2 className="text-sm font-bold text-gray-800">Add New Mandal</h2>
        </div>
        <form onSubmit={handleAddMandal} className="flex flex-wrap gap-2">
          <select
            required
            value={newMandalState}
            onChange={(e) => {
              setNewMandalState(e.target.value);
              setNewMandalDistrict('');
            }}
            className={selectCls + ' w-40'}
          >
            <option value="">Select State</option>
            {STATES.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          <select
            required
            value={newMandalDistrict}
            onChange={(e) => setNewMandalDistrict(e.target.value)}
            disabled={!newMandalState}
            className={selectCls + ' w-44'}
          >
            <option value="">Select District</option>
            {(DISTRICTS[newMandalState] || []).map(d => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
          <input
            type="text"
            required
            placeholder="e.g. Thullur"
            value={newMandalName}
            onChange={(e) => setNewMandalName(e.target.value)}
            className={inputCls}
          />
          <button
            type="submit"
            className="flex items-center gap-1 rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-warm-white hover:bg-brand-700 cursor-pointer"
          >
            <Plus size={14} /> Add Mandal
          </button>
        </form>
      </div>

      {/* ── Current Locations Summary ── */}
      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <h2 className="text-sm font-bold text-gray-800 mb-4">Current Locations</h2>

        {/* States */}
        <div className="mb-4">
          <p className="text-xs font-semibold text-gray-500 mb-2">States ({STATES.length})</p>
          <div className="space-y-1">
            {STATES.map(state => {
              const isCustom = !isBaseLocation('state', state);
              const isExpanded = expandedStates[state];
              const stateDistricts = DISTRICTS[state] || [];

              return (
                <div key={state} className="rounded-lg border border-gray-100">
                  <div className="flex items-center justify-between px-3 py-2 bg-gray-50 rounded-t-lg">
                    <button
                      type="button"
                      onClick={() => toggleExpandState(state)}
                      className="flex items-center gap-2 text-sm font-medium text-gray-700 cursor-pointer"
                    >
                      {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                      {state}
                      <span className="text-xs text-gray-400">({stateDistricts.length} districts)</span>
                      {isCustom && (
                        <span className="rounded-full bg-brand-100 px-2 py-0.5 text-[10px] font-semibold text-brand-700">
                          Custom
                        </span>
                      )}
                    </button>
                    {isCustom && (
                      <button
                        type="button"
                        onClick={() => handleRemove('state', state)}
                        className="text-red-400 hover:text-red-600 cursor-pointer"
                        title="Remove state"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                  {isExpanded && stateDistricts.length > 0 && (
                    <div className="px-4 py-2 space-y-1 border-t">
                      {stateDistricts.map(district => {
                        const isDistrictCustom = !isBaseLocation('district', district, state);
                        const districtMandals = MANDALS[district] || [];
                        return (
                          <div key={district} className="py-1">
                            <div className="flex items-center justify-between py-1">
                              <span className="text-xs text-gray-600 font-medium">
                                {district}
                                <span className="ml-2 text-[10px] text-gray-400">
                                  ({districtMandals.length} mandals)
                                </span>
                              </span>
                              {isDistrictCustom && (
                                <button
                                  type="button"
                                  onClick={() => handleRemove('district', district, state)}
                                  className="text-red-400 hover:text-red-600 cursor-pointer"
                                  title="Remove district"
                                >
                                  <Trash2 size={12} />
                                </button>
                              )}
                            </div>
                            {districtMandals.length > 0 && (
                              <div className="flex flex-wrap gap-1.5 mt-1 ml-3">
                                {districtMandals.map(mandal => {
                                  const isMandalCustom = !isBaseLocation('mandal', mandal, district);
                                  return (
                                    <span
                                      key={mandal}
                                      className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5 text-[11px] text-gray-600"
                                    >
                                      {mandal}
                                      {isMandalCustom && (
                                        <button
                                          type="button"
                                          onClick={() => handleRemove('mandal', mandal, district)}
                                          className="text-red-400 hover:text-red-600 cursor-pointer"
                                          title="Remove mandal"
                                        >
                                          <Trash2 size={10} />
                                        </button>
                                      )}
                                    </span>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Cities */}
        <div>
          <p className="text-xs font-semibold text-gray-500 mb-2">Cities / Towns ({CITIES.length})</p>
          <div className="flex flex-wrap gap-2">
            {CITIES.map(city => {
              const isCityCustom = !isBaseLocation('city', city);
              return (
                <span
                  key={city}
                  className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-700"
                >
                  {city}
                  {isCityCustom && (
                    <button
                      type="button"
                      onClick={() => handleRemove('city', city)}
                      className="ml-0.5 text-red-400 hover:text-red-600 cursor-pointer"
                      title="Remove city"
                    >
                      <Trash2 size={10} />
                    </button>
                  )}
                </span>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
