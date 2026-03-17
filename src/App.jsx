import React, { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Plus, Minus, Trash2, Search, Dumbbell, Trophy, Users } from 'lucide-react'
import { supabase } from './supabase'
import './App.css'

const YEAR_KEYS = ['visits_2022', 'visits_2023', 'visits_2024', 'visits_2025', 'visits_2026']
const YEAR_LABELS = {
  visits_2022: '2022',
  visits_2023: '2023',
  visits_2024: '2024',
  visits_2025: '2025',
  visits_2026: '2026'
}

function getTotalVisits(person) {
  return YEAR_KEYS.reduce((acc, key) => acc + (Number(person[key]) || 0), 0)
}

function getGroupYearTotals(people) {
  return {
    visits_2022: people.reduce((acc, person) => acc + (Number(person.visits_2022) || 0), 0),
    visits_2023: people.reduce((acc, person) => acc + (Number(person.visits_2023) || 0), 0),
    visits_2024: people.reduce((acc, person) => acc + (Number(person.visits_2024) || 0), 0),
    visits_2025: people.reduce((acc, person) => acc + (Number(person.visits_2025) || 0), 0),
    visits_2026: people.reduce((acc, person) => acc + (Number(person.visits_2026) || 0), 0)
  }
}

export default function App() {
  const [newName, setNewName] = useState('')
  const [search, setSearch] = useState('')
  const [people, setPeople] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const groupYearTotals = getGroupYearTotals(people)
const historicalTotal = YEAR_KEYS.reduce(
  (acc, key) => acc + (Number(groupYearTotals[key]) || 0),
  0
)

  async function loadPeople() {
    setLoading(true)
    setError('')
    const { data, error } = await supabase
      .from('gym_people')
      .select('*')
      .eq('deleted', false)
      .order('name', { ascending: true })
    if (error) {
      setError('No se pudieron cargar los datos.')
      setLoading(false)
      return
    }
    setPeople(data || [])
    setLoading(false)
  }

  useEffect(() => {
    loadPeople()
  }, [])

  async function addPerson() {
    const trimmed = newName.trim()
    if (!trimmed || saving) return
    const exists = people.some((person) => person.name.toLowerCase() === trimmed.toLowerCase())
    if (exists) {
      setNewName('')
      return
    }
    setSaving(true)
    setError('')
    const { error } = await supabase.from('gym_people').insert({
      name: trimmed,
      visits_2022: 0,
      visits_2023: 0,
      visits_2024: 0,
      visits_2025: 0,
      visits_2026: 0,
      deleted: false
    })
    if (error) {
      setError('No se pudo agregar la persona.')
      setSaving(false)
      return
    }
    setNewName('')
    await loadPeople()
    setSaving(false)
  }

  async function removePerson(id) {
    if (saving) return
    setSaving(true)
    setError('')
    const { error } = await supabase
      .from('gym_people')
      .update({ deleted: true })
      .eq('id', id)
    if (error) {
      setError('No se pudo eliminar la persona.')
      setSaving(false)
      return
    }
    await loadPeople()
    setSaving(false)
  }

  async function changeVisits(id, field, delta) {
    if (saving) return
    const current = people.find((person) => person.id === id)
    if (!current) return
    const nextVisits = Math.max(0, (Number(current[field]) || 0) + delta)
    setSaving(true)
    setError('')
    const { error } = await supabase
      .from('gym_people')
      .update({ [field]: nextVisits })
      .eq('id', id)
    if (error) {
      setError('No se pudo actualizar el contador.')
      setSaving(false)
      return
    }
    await loadPeople()
    setSaving(false)
  }

  function editVisitsLocal(id, field, value) {
    const parsed = Number(value)
    const nextVisits = Number.isNaN(parsed) ? 0 : Math.max(0, Math.floor(parsed))
    setPeople((prev) =>
      prev.map((person) =>
        person.id === id ? { ...person, [field]: nextVisits } : person
      )
    )
  }

  async function saveVisits(id, field, value) {
    if (saving) return
    const parsed = Number(value)
    const nextVisits = Number.isNaN(parsed) ? 0 : Math.max(0, Math.floor(parsed))
    setSaving(true)
    setError('')
    const { error } = await supabase
      .from('gym_people')
      .update({ [field]: nextVisits })
      .eq('id', id)
    if (error) {
      setError('No se pudo guardar el valor.')
      setSaving(false)
      return
    }
    await loadPeople()
    setSaving(false)
  }

  const filteredPeople = useMemo(() => {
    return [...people]
      .filter((person) => person.name.toLowerCase().includes(search.toLowerCase()))
      .sort((a, b) => getTotalVisits(b) - getTotalVisits(a) || a.name.localeCompare(b.name))
  }, [people, search])

  const totalVisits = people.reduce((acc, person) => acc + getTotalVisits(person), 0)
  const leader = people.length
    ? [...people].sort((a, b) => getTotalVisits(b) - getTotalVisits(a) || a.name.localeCompare(b.name))[0]
    : null

  return (
    <div className="app-shell">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="hero"
        >
          <div>
            <p className="eyebrow">Gym tracker</p>
            <h1>Asistencias al gym 2026</h1>
       
          </div>
          <div className="hero-icon-wrap">
            <Dumbbell size={40} />
          </div>
        </motion.div>

        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-top">
              <Users size={18} />
              <span>Personas</span>
            </div>
            <div className="stat-value">{people.length}</div>
          </div>
          <div className="stat-card">
            <div className="stat-top">
              <Dumbbell size={18} />
              <span>Asistencias totales</span>
            </div>
            <div className="stat-value">{totalVisits}</div>
          </div>
          <div className="stat-card">
            <div className="stat-top">
              <Trophy size={18} />
              <span>Líder</span>
            </div>
            <div className="stat-value small">{leader ? leader.name : 'Sin datos'}</div>
            <div className="stat-subtitle">{leader ? `${getTotalVisits(leader)} asistencias acumuladas` : 'Todavía no hay personas'}</div>
          </div>
        </div>
        <div className="card summary-card">
  <h2>Tabla general de asistencias</h2>
  <div className="summary-table-wrap">
    <table className="summary-table">
      <thead>
        <tr>
          <th>Nombre</th>
          <th>2022</th>
          <th>2023</th>
          <th>2024</th>
          <th>2025</th>
          <th>2026</th>
          <th>Total</th>
        </tr>
      </thead>
      <tbody>
        {filteredPeople.map((person) => (
          <tr key={person.id}>
            <td>{person.name}</td>
            <td>{person.visits_2022 || 0}</td>
            <td>{person.visits_2023 || 0}</td>
            <td>{person.visits_2024 || 0}</td>
            <td>{person.visits_2025 || 0}</td>
            <td>{person.visits_2026 || 0}</td>
            <td>{getTotalVisits(person)}</td>
          </tr>
        ))}
      </tbody>
      <tfoot>
        <tr>
          <td>Total </td>
          <td>{people.reduce((acc, person) => acc + (Number(person.visits_2022) || 0), 0)}</td>
          <td>{people.reduce((acc, person) => acc + (Number(person.visits_2023) || 0), 0)}</td>
          <td>{people.reduce((acc, person) => acc + (Number(person.visits_2024) || 0), 0)}</td>
          <td>{people.reduce((acc, person) => acc + (Number(person.visits_2025) || 0), 0)}</td>
          <td>{people.reduce((acc, person) => acc + (Number(person.visits_2026) || 0), 0)}</td>
          <td>{people.reduce((acc, person) => acc + getTotalVisits(person), 0)}</td>
        </tr>
      </tfoot>
    </table>
  </div>
</div>
        <div className="main-grid">
          <div className="panel card">
            <h2>Agregar persona</h2>
            <label className="label">Nombre</label>
            <input
              className="input"
              type="text"
              placeholder="Ej: Pedro"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') addPerson()
              }}
            />
            <button className="primary-btn" onClick={addPerson} disabled={saving}>
              {saving ? 'Guardando...' : 'Agregar'}
            </button>

            <label className="label search-label">Buscar persona</label>
            <div className="search-wrap">
              <Search size={18} className="search-icon" />
              <input
                className="input search-input"
                type="text"
                placeholder="Buscar por nombre"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            {error ? <p style={{ color: '#dc2626', marginTop: '12px' }}>{error}</p> : null}
          </div>

          <div className="panel card">
            <h2>Asistencias por año</h2>
            <div className="people-list">
              {loading ? (
                <div className="empty-state">Cargando datos...</div>
              ) : filteredPeople.length === 0 ? (
                <div className="empty-state">No hay personas para mostrar.</div>
              ) : (
                filteredPeople.map((person, index) => (
                  <motion.div
                    key={person.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2, delay: index * 0.03 }}
                    className="person-card"
                  >
                    <div className="person-header">
                      <div className="person-info">
                        <div className="person-name">{person.name}</div>
                        <div className="person-subtitle">{getTotalVisits(person)} asistencias acumuladas entre 2022 y 2026</div>
                      </div>
                      <button className="delete-btn" onClick={() => removePerson(person.id)} disabled={saving}>
                        <Trash2 size={18} />
                      </button>
                    </div>

                    <div className="year-grid">
                      {YEAR_KEYS.map((field) => (
                        <div className="year-box" key={field}>
                          <div className="year-title">{YEAR_LABELS[field]}</div>
                          <div className="person-actions yearly-actions">
                            <button className="icon-btn" onClick={() => changeVisits(person.id, field, -1)} disabled={saving}>
                              <Minus size={18} />
                            </button>
                            <button className="icon-btn" onClick={() => changeVisits(person.id, field, 1)} disabled={saving}>
                              <Plus size={18} />
                            </button>
                            <input
                              className="counter-input"
                              type="number"
                              min="0"
                              value={person[field] || 0}
                              onChange={(e) => editVisitsLocal(person.id, field, e.target.value)}
                              onBlur={(e) => saveVisits(person.id, field, e.target.value)}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
