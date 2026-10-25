# Sistema de Denuncias Universitario

Aplicación monolítica: un frontend Angular y un backend Spring Boot organizados en el mismo repositorio. En despliegue, Angular se compila dentro del artefacto Spring Boot, que sirve la interfaz y la API desde el mismo origen. PostgreSQL es el único servicio externo.

## Versiones base

- Angular 22.2.3 y Angular CLI 22.2.4
- Spring Boot 4.1.2 con Java 25
- Node.js 24.16+ y npm 11+
- PostgreSQL 18

Las versiones están fijadas para que las actualizaciones sean explícitas y revisables. Angular y Spring Boot publican actualizaciones compatibles de seguridad y mantenimiento; revisa sus guías de actualización antes de subir versiones mayores.

## Funcionalidad

- Página de inicio y envío público de denuncias, conservando roles y sedes.
- Panel administrativo autenticado para revisar, filtrar y cambiar el estado de denuncias, con mensaje personalizado opcional por Telegram.
- Resumen estadístico por sede.
- Notificaciones Telegram opcionales. El bot se configura únicamente mediante variables de entorno.
- Esquema y sedes iniciales administrados con Flyway.

## Desarrollo local

Requisitos: Java 25, Maven 3.9+, Node.js 24.16+, npm y PostgreSQL 18. Para iniciar PostgreSQL:

```powershell
$env:DATABASE_PASSWORD = "sdu"
$env:SDU_ADMIN_USERNAME = "admin"
$env:SDU_ADMIN_PASSWORD = "cambia-esto-por-una-clave-larga"
docker compose up -d db
$env:DATABASE_URL = "jdbc:postgresql://localhost:5432/sdu"
$env:DATABASE_USERNAME = "sdu"
mvn -f backend\pom.xml spring-boot:run
```

En otra terminal, inicia Angular:

```powershell
cd frontend
npm install
npm start
```

Abre http://localhost:4200. El proxy de desarrollo envía `/api` al backend en `http://localhost:8080`.

## Despliegue monolítico

Configura `DATABASE_PASSWORD` y `SDU_ADMIN_PASSWORD` con valores aleatorios y fuertes. Para habilitar Telegram, configura `TELEGRAM_BOT_TOKEN` con la credencial del bot. Puede seguir siendo el mismo bot; el token se suministra en tiempo de ejecución y nunca debe incluirse en el `Dockerfile` ni en el código:

```powershell
$env:DATABASE_PASSWORD = "<clave-aleatoria-de-base-de-datos>"
$env:SDU_ADMIN_PASSWORD = "<clave-aleatoria-del-administrador>"
$env:SDU_ADMIN_USERNAME = "admin"
$env:TELEGRAM_BOT_TOKEN = "<token-del-bot>"
docker compose up --build
```

La aplicación estará en http://localhost:8080 y el contenedor tendrá el nombre `SDU-app`. El servicio consulta actualizaciones del bot periódicamente, así que no configures un webhook de Telegram para ese mismo bot. Al actualizar la aplicación existente, ejecuta `docker compose up -d --build --force-recreate --remove-orphans sdu-app` para reemplazar el contenedor anterior `monolito-app-1`. En producción, termina TLS en un proxy confiable y restringe el acceso administrativo a la red institucional.

En el panel administrativo puedes escribir un mensaje opcional debajo del selector de estado. Al guardar, el estado y el mensaje se envían juntos al usuario de Telegram vinculado a la denuncia.

## Estructura

```text
monolito/
├── backend/       API REST, reglas de negocio, seguridad y migraciones
├── frontend/      Aplicación Angular standalone
├── compose.yaml   Aplicación y PostgreSQL
└── Dockerfile     Compilación multi-stage; genera una sola aplicación desplegable
```

## Migración desde Oracle APEX

Los archivos originales `.sql` y `.apx` se archivaron en `App-SQL-APX.zip` en la raíz del proyecto; esos archivos ya no permanecen descomprimidos en `App/`. El ZIP contiene un procedimiento de Oracle con una credencial de Telegram: mantenlo privado y no lo publiques ni compartas. Las migraciones crean las tablas equivalentes `sedes` y `denuncias` e incluyen los nombres de sedes de los archivos fuente. Los registros de la instalación Oracle no se copian automáticamente: exporta los datos con un proceso controlado, valida los identificadores y fechas y realiza una importación revisada antes de sustituir el sistema actual. No uses el SQL exportado de APEX directamente contra PostgreSQL.

El archivo Oracle inspeccionado contiene el token de Telegram escrito directamente en el procedimiento. Aunque se conserve el mismo bot, considera expuesta esa credencial: revócala y genera un token de reemplazo para ese bot antes de habilitar notificaciones. Pasa el reemplazo por `TELEGRAM_BOT_TOKEN`; no lo copies a archivos versionados ni a la imagen Docker.
