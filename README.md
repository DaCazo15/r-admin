# R-Admin 🚀

Panel de administración y gestión desarrollado con **Vue 3**, **Vite**, **Tailwind CSS v4**, **Pinia** y **Firebase**.

---

## 🛠️ Tecnologías y Herramientas

- **Framework Frontend:** [Vue 3](https://vuejs.org/) (Composition API)
- **Tooling & Build:** [Vite](https://vite.dev/)
- **Estilos:** [Tailwind CSS v4](https://tailwindcss.com/) & [Bootstrap Icons](https://icons.getbootstrap.com/)
- **Gestión de Estado:** [Pinia](https://pinia.vuejs.org/)
- **Enrutamiento:** [Vue Router](https://router.vuejs.org/)
- **Backend & Base de Datos:** [Firebase](https://firebase.google.com/) / [VueFire](https://vuefire.vuejs.org/)
- **Calendario / Agendamiento:** [FullCalendar](https://fullcalendar.io/) (`@fullcalendar/vue3`)
- **Formateador de Código:** [Prettier](https://prettier.io/)

---

## 🚀 Requisitos Previos

- **Node.js**: Versión `^22.18.0` o `>=24.12.0`
- **npm**: Incluido con Node.js

---

## 💻 Configuración e Instalación del Proyecto

1. **Clonar el repositorio e instalar dependencias:**

   ```bash
   npm install
   ```

2. **Configuración de Variables de Entorno:**

   Crea un archivo `.env.local` en la raíz del proyecto con la configuración correspondiente a Firebase u otros servicios:

   ```env
   VITE_FIREBASE_API_KEY=tu_api_key
   VITE_FIREBASE_AUTH_DOMAIN=tu_auth_domain
   VITE_FIREBASE_PROJECT_ID=tu_project_id
   VITE_FIREBASE_STORAGE_BUCKET=tu_storage_bucket
   VITE_FIREBASE_MESSAGING_SENDER_ID=tu_messaging_sender_id
   VITE_FIREBASE_APP_ID=tu_app_id
   ```

---

## 📜 Scripts Disponibles

- **Desarrollo:** Inicia el servidor de desarrollo local de Vite.
  ```bash
  npm run dev
  ```

- **Compilación para Producción:** Construye y optimiza los archivos para producción en la carpeta `dist`.
  ```bash
  npm run build
  ```

- **Vista Previa de Producción:** Sirve la build localmente para probar el comportamiento de producción.
  ```bash
  npm run preview
  ```

- **Formateo de Código:** Formatea los archivos dentro de `src/` usando Prettier.
  ```bash
  npm run format
  ```

---

## ☁️ Despliegue en Vercel

Este proyecto incluye una configuración optimizada en el archivo `vercel.json` para facilitar el despliegue en **Vercel** como una SPA (Single Page Application):

- **Framework:** Vite
- **Directorio de salida:** `dist`
- **Comando de build:** `npm run build`
- **Reescritura de rutas (Rewrites):** Todas las rutas redirigen a `/index.html` para un enrutamiento del lado del cliente correcto.

---

## 🎨 Estructura del Proyecto

```text
r-admin/
├── public/              # Archivos estáticos
├── src/
│   ├── assets/          # Imágenes, estilos globales y assets
│   ├── components/      # Componentes de Vue reutilizables
│   ├── composable/      # Composables (lógica reactiva compartida)
│   ├── config/          # Configuración de Firebase y servicios
│   ├── helpers/         # Funciones auxiliares y helpers
│   ├── router/          # Configuración de Vue Router
│   ├── services/        # Servicios de API / integración
│   ├── stores/          # Stores de Pinia
│   ├── views/           # Vistas / Páginas principales
│   ├── App.vue          # Componente principal
│   └── main.js          # Punto de entrada de la aplicación
├── .env.local           # Variables de entorno locales
├── vercel.json          # Configuración de despliegue en Vercel
├── vite.config.js       # Configuración de Vite
└── package.json         # Dependencias y scripts
```
