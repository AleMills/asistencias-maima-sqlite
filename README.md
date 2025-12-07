# QR Attendance Server (SQLite Version)

Este backend ha sido migrado de MongoDB a SQLite usando `better-sqlite3`.

## Requisitos

- Node.js (v18 o superior recomendado)
- NPM

## Instalación

1.  Navega a la carpeta `server`:
    ```bash
    cd server
    ```
2.  Instala las dependencias:
    ```bash
    npm install
    ```

## Configuración

El archivo `.env` debe existir en la carpeta `server`. Ejemplo:

```env
PORT=3000
JWT_SECRET=tu_secreto_super_seguro
QRPORT=5173
# MONGO_URI ya no es necesario
```

## Base de Datos

La base de datos es un archivo local llamado `database.sqlite` que se creará automáticamente en la carpeta `server` la primera vez que inicies el servidor.

Las tablas se crean automáticamente:
- `admins`
- `empleados`
- `asistencias`

## Ejecución

### Desarrollo
```bash
npm run dev
```

### Producción
```bash
npm start
```

## Notas Importantes

- **Datos**: Al migrar a SQLite, la base de datos comienza vacía. Debes crear un nuevo administrador o empleados.
- **Backup**: Para hacer un backup, simplemente copia el archivo `database.sqlite`.
- **Rendimiento**: SQLite está configurado en modo WAL para mejor concurrencia.
