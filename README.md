# NN Feedback

Plataforma multi-campaña para registrar sesiones de feedback 1:1, acuerdos de mejora y actas de seguimiento para Maquinarias, Ambipar y Arval.

## Desarrollo

```bash
npm install
npm run dev
```

La aplicación estará disponible en `http://localhost:3000`.

## Configuración

Crea `.env.local` con las variables necesarias para persistencia y notificaciones:

```bash
DATABASE_URL=
RESEND_API_KEY=
RESEND_FROM_EMAIL=
RESEND_FROM_NAME=NN Feedback
NEXT_PUBLIC_APP_URL=https://tu-dominio.com

# Better Auth
BETTER_AUTH_SECRET=
BETTER_AUTH_URL=http://localhost:3000
```

## Base de datos

El esquema Drizzle define las sesiones y la campaña asociada (`maquinarias`, `ambipar` o `arval`). Antes de usar la nueva clasificación en una base existente, aplica el esquema:

```bash
npm run db:push
```

## Comprobaciones

```bash
npm run lint
npm run build
```

## Gestión de usuarios (Administración)

Los usuarios no se registran públicamente; son creados y administrados exclusivamente desde la terminal:

### Crear usuario
```bash
npm run user:create -- <correo> "<nombre completo>" <admin|supervisor>
```
*Ejemplo:*
```bash
npm run user:create -- supervisor1@empresa.com "Carlos Mendoza" supervisor
npm run user:create -- admin@empresa.com "Administrador General" admin
```
Genera una contraseña temporal segura que se muestra una sola vez. En el primer acceso, el usuario deberá cambiarla obligatoriamente.

### Restablecer contraseña
```bash
npm run user:reset -- <correo>
```
*Ejemplo:*
```bash
npm run user:reset -- supervisor1@empresa.com
```
Genera una nueva contraseña temporal, revoca las sesiones activas y fuerza el cambio de contraseña en su próximo acceso.

## Estructura

- `app/`: página y diseño global.
- `components/`: interfaz, formulario, historial y comprobante.
- `lib/campaigns.ts`: configuración visual de las tres campañas.
- `actions/`: persistencia y correo.
- `lib/db/`: esquema de Neon/Postgres con Drizzle.
