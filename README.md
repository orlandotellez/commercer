# TechComponents 

![Rust](https://img.shields.io/badge/rust-%23000000.svg?style=for-the-badge&logo=rust&logoColor=white)
![Axum](https://img.shields.io/badge/axum-%23000000.svg?style=for-the-badge&logo=rust&logoColor=white)
![TypeScript](https://img.shields.io/badge/typescript-%233178C6.svg?style=for-the-badge&logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/react-%2320232A.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)
![Next.js](https://img.shields.io/badge/next.js-%23000000.svg?style=for-the-badge&logo=nextdotjs&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/postgres-%23316192.svg?style=for-the-badge&logo=postgresql&logoColor=white)

E-commerce de componentes de PC construido con **Rust (Axum)** para el backend y **Next.js (React)** para el frontend.

## Estructura del Proyecto

```
TECHCOMPONENTS-REPO/
├── backend/           # API REST en Rust con Axum + SQLx + PostgreSQL
├── frontend/          # Aplicación web en Next.js 16
├── docs/              # Documentación de arquitectura
└── README.md          # Este archivo
```

---

## Quick Start

### Prerrequisitos

- **Backend**: Rust 1.75+, PostgreSQL 14+
- **Frontend**: Node.js 18+, pnpm

### 1. Configurar Backend

```bash
cd backend

# Copiar configuración de ejemplo
cp .env.example .env

# Editar .env con tus credenciales de PostgreSQL
# DATABASE_URL=postgres://user:password@localhost:5432/techcomponents

# Ejecutar migraciones (crear tablas)
cargo run --bin migrate

# Arrancar el servidor
cargo run
# Servidor corriendo en http://localhost:3001
```

### 2. Configurar Frontend

```bash
cd frontend

# Instalar dependencias
pnpm install

# Copiar configuración
cp .env.example .env.local
# NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1

# Arrancar desarrollo
pnpm dev
# Aplicación en http://localhost:3000
```

### 3.seed Datos de Prueba

1. Ir a `http://localhost:3000/admin/products`
2. Click en **"Crear Categorías"** (botón verde)
3. Click en **"Agregar Productos de Prueba"** (botón violeta)
4. ¡Listo! Los productos aparecerán en `/shop`

---

## Arquitectura

### Backend (Rust + Axum)

**Patrón Vertical Slice** - Cada feature tiene su propia carpeta con:

```
src/features/
├── auth/           # Login, Register, Refresh Token
├── products/       # CRUD de productos
├── categories/     # CRUD de categorías
└── users/          # Gestión de usuarios
```

**Tecnologías**:
- **Axum** - Framework web async
- **SQLx** - ORM con queries tipadas en tiempo de compilación
- **PostgreSQL** - Base de datos
- **JWT** - Autenticación sin estado
- **bcrypt** - Hash de contraseñas

**Endpoints principales**:
| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/api/v1/auth/register` | Registrar usuario |
| POST | `/api/v1/auth/login` | Iniciar sesión |
| GET | `/api/v1/products` | Listar productos |
| POST | `/api/v1/products` | Crear producto |
| GET | `/api/v1/categories` | Listar categorías |
| GET | `/api/v1/users/me` | Datos del usuario actual |

### Frontend (Next.js 16)

**Stack**:
- **Next.js 16** con App Router
- **React 19** - UI
- **TypeScript** - Tipado estático
- **CSS Modules** - Estilos scoped
- **Lucide React** - Iconos
- **Zustand** - Estado global (carrito)

**Rutas principales**:
| Ruta | Descripción |
|------|-------------|
| `/` | Home page |
| `/shop` | Catálogo de productos |
| `/product/[slug]` | Detalle de producto |
| `/cart` | Carrito de compras |
| `/admin/products` | Dashboard admin productos |

---

## Contribuir

### Backend

```bash
# Desarrollo
cd backend
cargo run

# Verificar tipos
cargo check

# Compilar release
cargo build --release
```

### Frontend

```bash
cd frontend

# Desarrollo
pnpm dev

# Build producción
pnpm build

#Lint
pnpm lint
```

---

## 📁 Estructura de Archivos Clave

### Backend

```
backend/src/
├── main.rs              # Entry point
├── routes/mod.rs        # Configuración de rutas
├── database/            # Conexión y migraciones
├── features/            # Vertical slices
│   ├── products/
│   │   ├── handler.rs   # Endpoints
│   │   ├── service.rs   # Lógica de negocio
│   │   ├── request.rs   # DTOs de entrada
│   │   ├── response.rs  # DTOs de salida
│   │   └── routes.rs   # Definición de rutas
│   └── categories/      # Mismo patrón
└── shared/              # Utilidades compartidas
    ├── errors/          # Manejo de errores
    ├── helpers/         # JWT, cookies, passwords
    └── state/           # Estado de la app
```

### Frontend

```
frontend/
├── app/
│   ├── (shop)/          # Rutas públicas
│   │   ├── shop/        # Catálogo
│   │   ├── product/     # Detalle producto
│   │   └── cart/        # Carrito
│   └── (admin)/         # Rutas admin
│       └── admin/       # Dashboard
└── src/
    ├── features/        # Componentes por feature
    │   ├── product/     # ProductCard, ProductDetail
    │   ├── cart/       # Carrito, Checkout
    │   └── shop/       # Sidebar, TopBar
    └── shared/          # Utilidades
        ├── lib/api.ts   # Cliente API
        ├── hooks/      # Custom hooks
        └── types/       # TypeScript types
```

---

## 🐛 Comandos Útiles

### Base de datos

```bash
# Ver conexiones activas
psql -U postgres -c "SELECT * FROM pg_stat_activity WHERE datname = 'techcomponents';"

# Resetear DB (cuidado!)
dropdb techcomponents && createdb techcomponents && cargo run --bin migrate
```

### Logs

```bash
# Backend
tail -f backend/target/debug/logs/app.log

# PostgreSQL
tail -f /var/log/postgresql/postgresql-14-main.log
```

---

## 📄 Licencia

MIT
