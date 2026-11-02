# Documentación técnica del código

## Arquitectura

El proyecto está dividido en tres módulos desplegados por separado: Angular sirve el frontend, Spring Boot expone la API REST y PostgreSQL almacena sedes y denuncias.

Rutas principales:

- Base de datos: `Documents\Sistema de Denuncias Universitario\Database-SDU`
- Backend: `Documents\Sistema de Denuncias Universitario\Backend-SDU`
- Frontend: `Documents\Sistema de Denuncias Universitario\Frontend-SDU`
- Orquestación Docker: `Documents\Sistema de Denuncias Universitario\compose.yaml`

```text
Navegador Angular
    -> ComplaintApiService
    -> Controladores REST (/api/public y /api/admin)
    -> ComplaintService
    -> Repositorios Spring Data/JPA
    -> PostgreSQL

ComplaintService -> TelegramService -> API de Telegram
```

## Backend

- Código fuente: `Documents\Sistema de Denuncias Universitario\Backend-SDU\src\main\java`
- Recursos: `Documents\Sistema de Denuncias Universitario\Backend-SDU\src\main\resources`
- Pruebas: `Documents\Sistema de Denuncias Universitario\Backend-SDU\src\test`
- Dockerfile: `Documents\Sistema de Denuncias Universitario\Backend-SDU\Dockerfile`
- Maven: `Documents\Sistema de Denuncias Universitario\Backend-SDU\pom.xml`
- `Documents\Sistema de Denuncias Universitario\Backend-SDU\src\main\java\edu\universidad\sdu\SduApplication.java`: arranca Spring Boot y habilita tareas programadas para consultar Telegram.
- `Documents\Sistema de Denuncias Universitario\Backend-SDU\src\main\java\edu\universidad\sdu\config`: permite `/api/public/**` y exige rol `ADMIN` en `/api/admin/**`. Usa HTTP Basic y mantiene las credenciales administrativas en memoria.
- `Documents\Sistema de Denuncias Universitario\Backend-SDU\src\main\java\edu\universidad\sdu\complaint`: contiene DTOs, controladores, entidad JPA, servicio, repositorio, estados y reglas de transición.
- `Documents\Sistema de Denuncias Universitario\Backend-SDU\src\main\java\edu\universidad\sdu\campus`: administra la información de sedes.
- `Documents\Sistema de Denuncias Universitario\Backend-SDU\src\main\java\edu\universidad\sdu\telegram`: vincula usuarios Telegram, sincroniza contactos y envía actualizaciones o mensajes personalizados.
- `Documents\Sistema de Denuncias Universitario\Backend-SDU\src\main\java\edu\universidad\sdu\common`: transforma errores de aplicación y validación en respuestas HTTP legibles.
- Configuración: `Documents\Sistema de Denuncias Universitario\Backend-SDU\src\main\resources\application.yml`

## Frontend

- Código fuente: `Documents\Sistema de Denuncias Universitario\Frontend-SDU\src`
- Código Angular: `Documents\Sistema de Denuncias Universitario\Frontend-SDU\src\app`
- Configuración Angular: `Documents\Sistema de Denuncias Universitario\Frontend-SDU\angular.json`
- Dependencias npm: `Documents\Sistema de Denuncias Universitario\Frontend-SDU\package.json`
- Proxy de desarrollo: `Documents\Sistema de Denuncias Universitario\Frontend-SDU\proxy.conf.json`
- Dockerfile: `Documents\Sistema de Denuncias Universitario\Frontend-SDU\Dockerfile`
- Servidor Nginx: `Documents\Sistema de Denuncias Universitario\Frontend-SDU\nginx.conf`
- `Documents\Sistema de Denuncias Universitario\Frontend-SDU\src\app\app.routes.ts`: define carga diferida de páginas y protege la ruta `/admin` mediante `authGuard`.
- `Documents\Sistema de Denuncias Universitario\Frontend-SDU\src\app\app.component.ts`: muestra la estructura, navegación y enlace de cierre de sesión.
- `Documents\Sistema de Denuncias Universitario\Frontend-SDU\src\app\core`: contiene autenticación, estado HTTP, cliente REST y modelos.
- `Documents\Sistema de Denuncias Universitario\Frontend-SDU\src\app\pages`: contiene formularios, inicio de sesión y panel administrativo.

## Base de datos

- Módulo PostgreSQL: `Documents\Sistema de Denuncias Universitario\Database-SDU`
- Dockerfile: `Documents\Sistema de Denuncias Universitario\Database-SDU\Dockerfile`
- Migraciones: `Documents\Sistema de Denuncias Universitario\Database-SDU\migrations`
- Esquema inicial: `Documents\Sistema de Denuncias Universitario\Database-SDU\migrations\V1__crear_esquema.sql`
- Sedes iniciales: `Documents\Sistema de Denuncias Universitario\Database-SDU\migrations\V2__sedes_iniciales.sql`

## Flujo principal de una denuncia

1. Angular carga las sedes desde `/api/public/campuses`.
2. El usuario completa el formulario; Angular valida campos básicos y llama a `/api/public/complaints`.
3. Spring valida `ComplaintRequest`, busca la sede y crea una entidad con estado `REGISTRADA`.
4. La denuncia se guarda en PostgreSQL y Telegram recibe una notificación si corresponde.
5. El administrador consulta `/api/admin/complaints` y `/api/admin/stats/by-campus`.
6. Al guardar un estado, el backend actualiza la entidad y envía opcionalmente un mensaje personalizado por Telegram.

## Convenciones

- Los controladores no contienen reglas de negocio complejas; delegan en servicios.
- Las entidades JPA pertenecen al paquete `complaint` o `campus`.
- Los componentes standalone contienen vista y lógica local; las llamadas HTTP se delegan al servicio API.
- Los comentarios explican responsabilidades o decisiones de flujo, no repiten código evidente.
