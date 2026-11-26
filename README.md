# SGI-IT — Sistema de Gestión de Incidencias IT

Este fue mi **Trabajo de Fin de Grado del ciclo de DAW** (Desarrollo de Aplicaciones Web), desarrollado entre noviembre de 2023 y enero de 2024. Obtuvo una **calificación de 9/10**.

SGI-IT es un **sistema de ticketing** para un departamento de IT: los usuarios abren incidencias, los técnicos las atienden y el administrador lo supervisa todo desde un panel con estadísticas.

> Es un proyecto de mis inicios, con todo lo que eso conlleva, pero le tengo mucho cariño. Aquí se queda como recuerdo de dónde empecé.

## Funcionalidades

- **Registro e inicio de sesión** (con nombre de usuario o email y opción de "recordarme").
- **Tres roles**:
  - **Administrador**: gestiona usuarios y tiene acceso a todos los tickets.
  - **Solicitante**: abre tickets y sigue el estado de los suyos.
  - **Técnico**: atiende y resuelve los tickets que tiene asignados.
- **Tickets** con asunto, descripción, solicitante, técnico asignado y estado: *Abierto*, *En progreso* o *Resuelto*.
- **Conversación dentro de cada ticket**: mensajes entre el solicitante y el técnico.
- **Panel principal** con gráficas de tickets por estado y de tickets asignados o sin asignar.
- **Listados con filtros** de tickets y de usuarios.
- **Perfil de usuario** editable, con foto de perfil y cambio de contraseña.
- **Interfaz en español e inglés**: el idioma se detecta según el navegador.
- Páginas de error personalizadas (401, 404 y 500).

## Tecnologías

| Capa | Tecnología |
|---|---|
| Backend | [AdonisJS 5](https://v5-docs.adonisjs.com/) (Node.js 18 + TypeScript) |
| ORM / BBDD | Lucid ORM sobre **MySQL** (migraciones, seeders y factories) |
| Vistas | Plantillas **Edge** (renderizado en servidor) |
| Frontend | JavaScript, **SCSS** propio y **Chart.js** para las gráficas |
| Build de assets | Webpack Encore |
| Autenticación | `@adonisjs/auth` con sesiones y cookies |
| Seguridad | `@adonisjs/shield` (CSRF y cabeceras de seguridad) |
| Validación | Validadores de AdonisJS |
| i18n | `@adonisjs/i18n` (ES / EN) |
| Despliegue | Docker (Dockerfile multi-stage) |

## Cómo arrancarlo hoy

Lo más sencillo es usar **Docker**, porque no hace falta instalar Node ni MySQL. El `docker-compose.yml` levanta una base de datos MySQL 8 y la aplicación, y al arrancar aplica las migraciones y crea el usuario administrador.

```bash
git clone https://github.com/BoxGod14/SGI-IT.git
cd SGI-IT
docker compose up -d --build
```

Abre **http://localhost:3333** e inicia sesión con:

- **Usuario:** `admin`
- **Contraseña:** `admin`

Para pararlo:

```bash
docker compose down      # conserva los datos
docker compose down -v   # borra también la base de datos
```

> La primera vez puede tardar uno o dos minutos: hay que construir la imagen y esperar a que MySQL esté listo.

### Sin Docker (modo desarrollo)

Necesitas **Node.js 18** y un **MySQL 8** accesible.

```bash
npm install
cp .env.example .env          # y ajusta MYSQL_HOST, MYSQL_USER, MYSQL_PASSWORD...
node ace migration:run
node ace db:seed              # crea el usuario admin/admin
npm run dev                   # http://localhost:3333
```

### Datos de prueba

Abrir **http://localhost:3333/factories** genera 20 usuarios de ejemplo con 3 tickets cada uno.
