# Documentacion tecnica del proyecto

## Que hace el sistema

El Sistema de Denuncias Universitario permite registrar casos, elegir una sede, adjuntar enlaces opcionales de evidencia, consultar una denuncia mediante un codigo unico y administrar los casos desde un panel protegido.

La plataforma esta organizada en tres modulos independientes:

- **Frontend:** interfaz web hecha con Angular.
- **Backend:** API REST hecha con Spring Boot.
- **Base de datos:** PostgreSQL.
- **Docker Compose:** inicia los tres modulos y conecta sus puertos.

## Rutas principales

- Proyecto: `Documents\Sistema de Denuncias Universitario`
- Backend: `Documents\Sistema de Denuncias Universitario\Backend-SDU`
- Frontend: `Documents\Sistema de Denuncias Universitario\Frontend-SDU`
- Base de datos: `Documents\Sistema de Denuncias Universitario\Database-SDU`
- Orquestacion: `Documents\Sistema de Denuncias Universitario\compose.yaml`

## Arquitectura general

```text
Usuario
  -> Angular
  -> API de Spring Boot
  -> PostgreSQL

Spring Boot
  -> Telegram
  -> Mensajes de registro y cambio de estado
```

El frontend usa `/api` para comunicarse con el backend. Nginx recibe las solicitudes del navegador y las envia al servicio backend dentro de Docker. PostgreSQL guarda sedes, denuncias, contactos de Telegram y el cursor de sincronizacion.

## Backend

El backend expone endpoints publicos y administrativos:

- Los endpoints publicos permiten consultar sedes, crear denuncias y consultar su estado.
- Los endpoints administrativos requieren autenticacion HTTP Basic.
- El panel solo permite acceso al usuario administrador configurado en las variables de entorno.

Sus principales responsabilidades son:

- Validar los datos recibidos.
- Crear y consultar denuncias.
- Asociar la denuncia con una sede.
- Proteger el panel administrativo.
- Controlar los cambios de estado.
- Comunicarse con Telegram.
- Convertir errores de la API en respuestas comprensibles.

El backend usa JPA para leer y escribir la entidad de denuncias, repositorios Spring Data para PostgreSQL y transacciones para mantener coherencia entre la informacion guardada y las notificaciones.

### Glosario de términos técnicos

- **API (interfaz de programación):** conjunto de URLs que permite comunicar el frontend con el backend. Sus endpoints están definidos en `Backend-SDU\src\main\java\edu\universidad\sdu\complaint` y `Backend-SDU\src\main\java\edu\universidad\sdu\campus`.
- **REST (arquitectura de servicios HTTP):** forma de organizar operaciones mediante URLs y métodos como `GET`, `POST` y `PUT`.
- **Spring Boot (framework Java para servicios web):** ejecuta la API REST del sistema. Su configuración principal está en `Backend-SDU\src\main\resources\application.yml`.
- **JPA (Java Persistence API):** tecnología que convierte objetos Java en registros almacenados en PostgreSQL. Las entidades JPA están en los directorios `Backend-SDU\src\main\java\edu\universidad\sdu\complaint` y `Backend-SDU\src\main\java\edu\universidad\sdu\campus`.
- **PostgreSQL (motor de base de datos relacional):** guarda las sedes y denuncias. Su configuración y scripts se encuentran en `Database-SDU`.
- **Angular (framework para interfaces web):** contiene las páginas, formularios, modelos y navegación. Su código está en `Frontend-SDU\src\app`.
- **Nginx (servidor web y proxy):** sirve Angular compilado y reenvía `/api` al backend. Su configuración está en `Frontend-SDU\nginx.conf`.
- **Docker Compose (herramienta de orquestación de contenedores):** inicia de forma coordinada la base de datos, backend y frontend. Se configura en `compose.yaml`.
- **HTTP Basic (mecanismo de autenticación):** solicita usuario y contraseña al acceder a las rutas administrativas del backend. Su configuración está en `Backend-SDU\src\main\java\edu\universidad\sdu\config\SecurityConfig.java`.
- **Entidad JPA:** clase Java que representa una tabla de base de datos. La denuncia principal está en `Backend-SDU\src\main\java\edu\universidad\sdu\complaint\Complaint.java`.
- **Repositorio:** interfaz que permite consultar y guardar entidades sin escribir consultas SQL manuales. Los repositorios están junto a sus módulos, por ejemplo en `Backend-SDU\src\main\java\edu\universidad\sdu\complaint`.

## Frontend

Angular contiene estas areas principales:

- **Inicio:** presenta el sistema y sus opciones.
- **Denunciar:** registra el rol, sede, fecha, descripcion, usuario opcional de Telegram y evidencias.
- **Consultar:** busca una denuncia mediante su codigo de seguimiento.
- **Inicio administrativo:** autentica al administrador.
- **Panel administrativo:** muestra denuncias, sedes, evidencias, estadisticas y estados.

Las llamadas HTTP estan centralizadas en un servicio de Angular. Los modelos representan la informacion intercambiada con el backend. El guardia y el interceptor de autenticacion protegen las rutas administrativas y agregan las credenciales a sus solicitudes.

Nginx sirve la aplicacion Angular compilada y redirige las solicitudes `/api` al backend.

## Base de datos

PostgreSQL utiliza tres migraciones:

- `V1__crear_esquema.sql`: crea sedes, denuncias y tablas de Telegram.
- `V2__sedes_iniciales.sql`: carga las sedes disponibles al iniciar.
- `V3__seguimiento_y_evidencias.sql`: agrega el codigo de seguimiento, la evidencia y la restriccion de unicidad.

Las sedes cargadas actualmente son `SEDE 1`, `SEDE 2`, `POSGRADOS`, `SEDE 3`, `EUREKA`, `LA PERLA`, `ILE`, `SEDE Campestre` y `Sede Cúcuta`.

La entidad principal contiene informacion de la sede, rol del denunciante, fecha, descripcion, estado, usuario de Telegram y enlaces de evidencia. Las tablas de Telegram guardan los contactos vinculados al bot y el ultimo identificador procesado.

## Registro y seguimiento de denuncias

Cuando una denuncia se registra:

1. Angular valida los campos basicos y envia la solicitud publica.
2. Spring valida la descripcion, fecha, sede y rol.
3. Se crea la denuncia con estado inicial `REGISTRADA`.
4. El backend genera automaticamente un codigo alfanumerico aleatorio de 10 caracteres.
5. PostgreSQL guarda la denuncia y su codigo.
6. Angular muestra el codigo para que el denunciante pueda guardarlo.

La consulta publica solo muestra:

- Codigo de seguimiento.
- Sede.
- Fecha de registro.
- Estado actual.
- Enlaces de evidencia.

No muestra datos personales ni la descripcion completa en la respuesta publica.

## Evidencias

El denunciante puede pegar uno o varios enlaces publicos, por ejemplo obtenidos desde LimeWire. Los enlaces son opcionales y se almacenan como texto separado por lineas, con un limite de 2000 caracteres.

El panel administrativo muestra los enlaces. La consulta publica tambien los muestra sin requerir inicio de sesion.

## Estados y jerarquia

Los estados disponibles son:

1. `REGISTRADA`
2. `ADMITIDA`
3. `PROCESANDO`
4. `PROCESADA`
5. `RECHAZADA`

Las reglas principales son:

- Una denuncia avanza hacia estados posteriores.
- No puede retroceder al estado anterior.
- Puede pasar a `RECHAZADA` desde cualquier estado que aun no sea resuelta o procesada.
- `RECHAZADA` y `PROCESADA` son terminales.
- Una denuncia resuelta o procesada no puede cambiar a otro estado.

Estas reglas se aplican tanto en el frontend para deshabilitar opciones invalidas como en el backend para impedir cambios no permitidos directamente por API.

## Telegram

Telegram permite enviar notificaciones de:

- Registro exitoso de una denuncia.
- Cambio de estado.
- Mensajes personalizados escritos por el administrador.

El servicio sincroniza contactos mediante `getUpdates` y guarda el identificador del chat, nombre de usuario y nombre visible. Antes de enviar un aviso, busca el usuario normalizado en la base de datos.

El usuario debe enviar un mensaje nuevo al bot para vincular o actualizar su informacion. Los mensajes editados tambien pueden procesarse durante la sincronizacion.

## Configuracion por Docker

El proyecto despliega tres puertos independientes:

- PostgreSQL: `5432`
- Backend: `8080`
- Frontend por Nginx: `4200`

Las credenciales y el token se toman del archivo `.env` y no deben escribirse directamente en el codigo ni incluirse en Git.

Las variables principales son:

- `DATABASE_PASSWORD`
- `SDU_ADMIN_USERNAME`
- `SDU_ADMIN_PASSWORD`
- `TELEGRAM_BOT_TOKEN`
- `TELEGRAM_POLL_INTERVAL`
- `TELEGRAM_POLL_INITIAL_DELAY`

## Ejecucion local

Desde la raiz del proyecto se construye y inicia el sistema con Docker Compose. El frontend queda disponible en `http://localhost:4200`, el backend en `http://localhost:8080` y PostgreSQL en el puerto `5432`.

El sistema funciona actualmente por HTTP. No contiene configuracion HTTPS local.
