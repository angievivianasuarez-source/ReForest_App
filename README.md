# ReForest_App

HU05: registro de usuario con Angular 21, TypeScript, formularios reactivos y SCSS. Node.js 24 LTS es compatible. Instala dependencias y ejecuta desde esta carpeta:

```powershell
npm install
npm start
```

Abre http://127.0.0.1:4200/registro. FastAPI debe estar iniciado en http://127.0.0.1:8000 con PostgreSQL y migraciones aplicadas (ver README de ReForest_Api).

## Contrato y validación

POST /api/v1/auth/register recibe nombre (1–120 caracteres tras recorte), correo (válido, máximo 254, normalizado), password (8–128 caracteres, no solo espacios) y rol (CIUDADANO, VOLUNTARIO o ENTIDAD). El éxito 201 contiene id, nombre, correo y rol. 409 indica correo duplicado y 422 datos inválidos. Se muestran mensajes de carga, éxito y error. No se guardan contraseñas ni se inicia sesión automáticamente.

La URL se configura en src/environments/environment.ts. Producción usa /api/v1, que el servidor debe dirigir a FastAPI. Ningún ambiente contiene secretos.

## Verificación

```powershell
npm run build
npm test
npx playwright install chromium
npm run test:e2e
```

Las pruebas unitarias comprueban validadores, contrato HTTP, doble envío, éxito y errores 409/422/conexión. PI-01 con Playwright usa la API real, registra un correo único y comprueba respuesta pública, duplicado y rol prohibido. Requiere PostgreSQL operativo; crea un usuario de prueba persistente. La prueba de API comprueba además persistencia y hash en un esquema aislado.

## Estructura

- src/app/core/models: contratos TypeScript.
- src/app/core/services: cliente HTTP y servicio de registro.
- src/app/features/auth/register: formulario, validaciones y pruebas.
- src/app/app.routes.ts: ruta /registro y redirecciones.
- e2e: recorrido real PI-01.

Rama: feature/HU05-registro-usuario. Alcance: HU05-T01-APP a HU05-T06-APP.


La prueba de interfaz independiente de PostgreSQL se ejecuta con `npm run test:ui`. Comprueba validaciones en Chromium, roles públicos, diseño móvil y el mensaje de fallo de conexión (solicitud abortada por la prueba). No sustituye PI-01.

Si Node.js global no está instalado, la preparación dejó una copia portátil oficial en ../.tools/node-v24.19.0-win-x64. En PowerShell puedes añadirla al PATH de esta sesión:

```powershell
$env:PATH = (Resolve-Path '..\.tools\node-v24.19.0-win-x64').Path + ';' + $env:PATH
```

package-lock.json fija las versiones de las dependencias; en instalaciones posteriores usa `npm ci`.
