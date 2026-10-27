# Nuxt4-boilerplate

Boilerplate de Nuxt 4 con shadcn/ui, autenticación con sesiones y control de roles (RBAC) mediante Prisma y PostgreSQL.

## Stack

- **Nuxt 4** (Vue 3, SSR)
- **nuxt-auth-utils** — sesiones de usuario (`useUserSession`, `setUserSession`)
- **Prisma 7 + adapter-pg** — PostgreSQL
- **bcrypt** — hash de contraseñas
- **shadcn-nuxt + Tailwind CSS 4 + reka-ui**
- **Pinia**, **vee-validate + zod**, **nuxt-security**, **@nuxtjs/i18n**, **@nuxtjs/seo**

## Roles

Definidos como enum en `prisma/schema.prisma`:

| Rol | Descripción |
| --- | --- |
| `USER` | Rol por defecto al registrarse |
| `ADMIN` | Acceso al panel admin |
| `ROOT` | Acceso total (creado por el seed) |

Las páginas declaran los roles permitidos con `definePageMeta({ roles: [...] })` y el middleware global `app/middleware/role.global.ts` las protege. El tipo `RouteMeta.roles` se extiende en `app/types/page-meta.d.ts`.

## Setup

Requisitos: Node `24` (ver `.nvmrc`) y pnpm `10`.

```bash
cp .env.example .env   # rellena DATABASE_URL y NUXT_SESSION_PASSWORD
pnpm install
pnpm prisma:migrate    # aplica el schema a la base de datos
pnpm prisma:seed       # crea root@example.com / root1234 (ROOT)
pnpm dev
```

## Diagramas de secuencia

### Login (`POST /api/auth/login`)

```mermaid
sequenceDiagram
    actor U as Usuario
    participant P as login.vue
    participant API as POST /api/auth/login
    participant DB as PostgreSQL
    participant S as Sesión (cookie)

    U->>P: Enviar email + password
    P->>API: $fetch POST /api/auth/login
    API->>DB: findUnique({ email })
    DB-->>API: user (o null)
    alt Usuario no encontrado
        API-->>P: 400 "Usuario no encontrado"
    else
        API->>API: bcrypt.compare(password, user.password)
        alt Contraseña incorrecta
            API-->>P: 400 "Credenciales incorrectas"
        else
            API->>S: setUserSession({ id, email, role })
            API-->>P: { success: true }
            P->>S: fetch() (refresca sesión en el cliente)
            P->>U: navigateTo('/protected')
        end
    end
```

### Registro (`POST /api/auth/register`)

```mermaid
sequenceDiagram
    actor U as Usuario
    participant P as register.vue
    participant API as POST /api/auth/register
    participant DB as PostgreSQL
    participant S as Sesión (cookie)

    U->>P: Enviar email + password (+ rol opcional)
    P->>API: $fetch POST /api/auth/register
    API->>API: Validar email y password
    alt Campos vacíos
        API-->>P: 400 "Email y password requeridos"
    else
        API->>DB: findUnique({ email })
        DB-->>API: user (o null)
        alt Usuario ya existe
            API-->>P: 400 "El usuario ya existe"
        else
            API->>API: bcrypt.hash(password, 10)
            API->>DB: create({ email, password: hash, role: USER })
            DB-->>API: user creado
            API->>S: setUserSession({ id, email, role })
            API-->>P: { ok: true }
            P->>S: fetch() (refresca sesión en el cliente)
            P->>U: navigateTo('/protected')
        end
    end
```

### Navegación a página protegida con roles

Se ejecutan dos middleware: `auth.ts` (redirige a `/login` si no hay sesión) y `role.global.ts` (comprueba `to.meta.roles`).

```mermaid
sequenceDiagram
    actor U as Usuario
    participant N as Nuxt (middleware auth)
    participant R as role.global.ts
    participant S as useUserSession()
    participant PG as Página (/admin, /protected)

    U->>N: Navegar a página protegida
    N->>S: ¿loggedIn?
    alt No logueado
        S-->>N: false
        N->>S: fetch() (sesión desde el servidor)
        alt Sigue sin sesión
            N-->>U: navigateTo('/login')
        end
    end
    N->>R: continuar
    alt La página declara roles (definePageMeta)
        R->>S: user.role
        alt Rol no permitido
            R-->>U: navigateTo('/forbidden')
        else Rol permitido
            R->>PG: renderizar página
        end
    else Sin roles declarados
        R->>PG: renderizar página
    end
```

### Datos del usuario autenticado (`GET /api/user/user`)

```mermaid
sequenceDiagram
    participant P as protected.vue (o cliente)
    participant API as GET /api/user/user
    participant S as Sesión (cookie)
    participant DB as PostgreSQL

    P->>API: $fetch GET /api/user/user
    API->>S: getUserSession(event)
    alt Sin sesión
        API-->>P: null
    else Con sesión
        API->>DB: findUnique({ id }) (datos frescos)
        DB-->>API: { id, email, role, createdAt }
        API-->>P: { id, email, role, loggedInAt }
    end
```

### Logout

```mermaid
sequenceDiagram
    actor U as Usuario
    participant P as protected.vue
    participant API as POST /api/auth/logout
    participant S as useUserSession()

    U->>P: Clic en "Logout"
    P->>API: $fetch POST /api/auth/logout
    API->>S: clearUserSession(event)
    API-->>P: OK
    P->>S: clear() + fetch() (limpieza en el cliente)
    P->>U: navigateTo('/login')
```

## Estructura

```
app/
├── composables/useRole.ts      # rol actual del usuario (computed)
├── middleware/
│   ├── auth.ts                 # exige sesión / redirige si ya está logueado
│   └── role.global.ts          # protege páginas con definePageMeta({ roles })
├── pages/                      # login, register, protected, admin, root, forbidden
├── types/page-meta.d.ts        # extiende RouteMeta con `roles`
└── generated/prisma/           # cliente generado por Prisma
server/
├── api/auth/                   # login.post, register.post, logout.post
├── api/user/user.get.ts        # datos del usuario autenticado
└── utils/prisma.ts             # instancia de Prisma (adapter pg)
prisma/
├── schema.prisma               # modelo User + enum Role
└── seed.js                     # crea el usuario ROOT
shared/types/                   # tipos compartidos
```

## Scripts

| Script | Descripción |
| --- | --- |
| `pnpm dev` | Servidor de desarrollo |
| `pnpm build` | Build de producción |
| `pnpm typecheck` | Chequeo de tipos (vue-tsc) |
| `pnpm prisma:migrate` | Migración de desarrollo |
| `pnpm prisma:seed` | Crear usuario ROOT |

## Notas

- La sesión se guarda en una cookie cifrada con `NUXT_SESSION_PASSWORD` (mín. 32 caracteres); no hay JWT ni base de datos de sesiones.
- El rol se copia a la sesión en login/registro; `GET /api/user/user` refresca los datos desde la BD para no depender solo de la cookie.
