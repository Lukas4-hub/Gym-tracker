import React, { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Plus, Minus, Trash2, Search, Dumbbell, Trophy, Users } from 'lucide-react'
import { supabase } from './supabase'
import './App.css'

export default function App() {
  const [newName, setNewName] = useState('')
  const [search, setSearch] = useState('')
  const [people, setPeople] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function loadPeople() {
    setLoading(true)
    setError('')
    const { data, error } = await supabase
      .from('gym_people')
      .select('*')
      .order('visits', { ascending: false })
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
      visits: 0
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
    const { error } = await supabase.from('gym_people').delete().eq('id', id)
    if (error) {
      setError('No se pudo eliminar la persona.')
      setSaving(false)
      return
    }
    await loadPeople()
    setSaving(false)
  }

  async function changeVisits(id, delta) {
    if (saving) return
    const current = people.find((person) => person.id === id)
    if (!current) return
    const nextVisits = Math.max(0, current.visits + delta)
    setSaving(true)
    setError('')
    const { error } = await supabase
      .from('gym_people')
      .update({ visits: nextVisits })
      .eq('id', id)
    if (error) {
      setError('No se pudo actualizar el contador.')
      setSaving(false)
      return
    }
    await loadPeople()
    setSaving(false)
  }

  async function editVisits(id, value) {
    const parsed = Number(value)
    const nextVisits = Number.isNaN(parsed) ? 0 : Math.max(0, Math.floor(parsed))
    setPeople((prev) =>
      prev.map((person) =>
        person.id === id ? { ...person, visits: nextVisits } : person
      )
    )
  }

  async function saveVisits(id, value) {
    if (saving) return
    const parsed = Number(value)
    const nextVisits = Number.isNaN(parsed) ? 0 : Math.max(0, Math.floor(parsed))
    setSaving(true)
    setError('')
    const { error } = await supabase
      .from('gym_people')
      .update({ visits: nextVisits })
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
      .sort((a, b) => b.visits - a.visits || a.name.localeCompare(b.name))
  }, [people, search])

  const totalVisits = people.reduce((acc, person) => acc + person.visits, 0)
  const leader = people.length
    ? [...people].sort((a, b) => b.visits - a.visits || a.name.localeCompare(b.name))[0]
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
            <div className="stat-subtitle">{leader ? `${leader.visits} idas` : 'Todavía no hay personas'}</div>
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
            <h2>Asistencias</h2>
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
                    className="person-row"
                  >
                    <div className="person-info">
                      <div className="person-name">{person.name}</div>
                      <div className="person-subtitle">{person.visits} asistencias registradas</div>
                    </div>

                    <div className="person-actions">
                      <button className="icon-btn" onClick={() => changeVisits(person.id, -1)} disabled={saving}>
                        <Minus size={18} />
                      </button>
                      <button className="icon-btn" onClick={() => changeVisits(person.id, 1)} disabled={saving}>
                        <Plus size={18} />
                      </button>
                      <input
                        className="counter-input"
                        type="number"
                        min="0"
                        value={person.visits}
                        onChange={(e) => editVisits(person.id, e.target.value)}
                        onBlur={(e) => saveVisits(person.id, e.target.value)}
                      />
                      <button className="delete-btn" onClick={() => removePerson(person.id)} disabled={saving}>
                        <Trash2 size={18} />
                      </button>
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