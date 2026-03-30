# Guía de Instalación en Nueva PC (Windows)

Esta guía detalla los pasos para instalar y configurar el sistema de **Asistencias Nexo 0km** en una nueva computadora, asegurando que se inicie automáticamente al encender el equipo.

---

## 1. Requisitos Previos

Descarga e instala lo siguiente:
- **Node.js (Versión LTS):** [https://nodejs.org/](https://nodejs.org/) (Esto instalará `node` y `npm`).

---

## 2. Preparación del Proyecto

1. **Copiar la Carpeta:** Copia la carpeta completa del proyecto `asistencias-nexo-sqlite` a la nueva PC (ejemplo: al Escritorio o a `C:\`).
2. **Instalar Dependencias del Servidor:**
   - Abre una terminal (CMD o PowerShell) en la carpeta `server`.
   - Ejecuta: `npm install`
3. **Instalar Dependencias del Cliente:**
   - Abre una terminal en la carpeta `client`.
   - Ejecuta: `npm install`

---

## 3. Configuración y Construcción

1. **Archivo .env:** Asegúrate de que en la carpeta `server` exista un archivo `.env` con la configuración necesaria (puertos, secretos, etc.).
2. **Generar el Cliente (Build):**
   - En la terminal de la carpeta `client`, ejecuta:
     ```bash
     npm run build
     ```
   - Esto creará una carpeta `dist` que el servidor usará para mostrar la página.

---

## 4. Configuración de PM2 (Segundo Plano y Autoinicio)

PM2 permite que la aplicación corra en segundo plano y se reinicie sola si hay un fallo.

1. **Instalar PM2 de forma global:**
   - Abre una terminal como **Administrador** y ejecuta:
     ```bash
     npm install -g pm2 pm2-windows-startup
     ```

2. **Configurar el inicio automático en Windows:**
   - En la misma terminal de administrador, ejecuta:
     ```bash
     pm2-startup install
     ```

3. **Iniciar la aplicación con PM2:**
   - Ve a la carpeta `server` en la terminal.
   - Ejecuta:
     ```bash
     pm2 start server.js --name "asistencias-nexo"
     ```

4. **Guardar el estado actual:**
   - Para que PM2 recuerde qué aplicaciones debe iniciar al prender la PC, ejecuta:
     ```bash
     pm2 save
     ```

---

## 5. Notas Importantes

- **Acceso:** La aplicación será accesible en `http://localhost:3000` (o el puerto que hayas configurado en el `.env`).
- **Ver estado:** Puedes ver si la app está corriendo con el comando `pm2 status`.
- **Logs (Errores):** Si algo no funciona, puedes ver los errores con `pm2 logs asistencias-nexo`.
- **IP WiFi:** El servidor intentará detectar la IP de tu red WiFi automáticamente para que otros dispositivos puedan escanear el QR. Asegúrate de estar conectado a la misma red.

---

## Resumen de Comandos de mantenimiento:
- `pm2 restart asistencias-nexo` (Reiniciar la app).
- `pm2 stop asistencias-nexo` (Detener la app).
- `pm2 delete asistencias-nexo` (Quitar la app de la lista de PM2).
