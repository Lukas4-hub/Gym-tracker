# 🏋️ Gym Tracker

Aplicación web para registrar y comparar las idas al gimnasio de un grupo de personas.

Permite agregar usuarios, editar sus asistencias y visualizar quién lidera el ranking.

---

## 🚀 Funcionalidades

* ➕ Agregar personas
* ➖ Sumar o restar idas al gym
* ✏️ Editar manualmente las visitas
* 🔍 Buscar personas
* 🏆 Ranking automático (líder)
* ☁️ Persistencia en base de datos (Supabase)
* 🌐 Deploy en Vercel

---

## 🛠️ Tecnologías utilizadas

* React + Vite
* Supabase (Base de datos PostgreSQL)
* Vercel (Deploy)
* Framer Motion (animaciones)
* Lucide React (iconos)

---

## 📦 Instalación local

Clonar el repositorio:

```bash
git clone https://github.com/tu-usuario/gym-tracker.git
cd gym-tracker
```

Instalar dependencias:

```bash
npm install
```

Crear archivo `.env.local` en la raíz:

```env
VITE_SUPABASE_URL=tu_url_de_supabase
VITE_SUPABASE_PUBLISHABLE_KEY=tu_key_publica
```

Ejecutar el proyecto:

```bash
npm run dev
```

---

## 🧠 Base de datos (Supabase)

Ejecutar este SQL en Supabase:

```sql
create table if not exists public.gym_people (
  id bigint generated always as identity primary key,
  name text not null unique,
  visits integer not null default 0,
  created_at timestamp with time zone default now()
);
```

---

## ☁️ Deploy en Vercel

1. Subir el proyecto a GitHub
2. Importarlo en Vercel
3. Configurar variables de entorno:

```env
VITE_SUPABASE_URL=tu_url
VITE_SUPABASE_PUBLISHABLE_KEY=tu_key
```

4. Deploy 🚀

---

## ⚠️ Notas

* No subir `node_modules` al repositorio
* Asegurarse de tener `.gitignore` configurado
* Las variables deben empezar con `VITE_`

---

## 💡 Futuras mejoras

* Login de usuarios
* Historial por día
* Ranking semanal/mensual
* Estadísticas y gráficos
* Notificaciones

---


## 👨‍💻 Autor

Proyecto desarrollado por Lucas 🚀
