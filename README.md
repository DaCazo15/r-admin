# R-Admin 🚀

<img src="https://rotaract4370.org/wp-content/uploads/2025/03/cropped-isotipo-270x270.png" align="center" alt="R-Admin" width="120"/>

**R-Admin** es un panel de administración y gestión avanzado desarrollado con **Vue 3**, **Vite**, **Tailwind CSS v4**, **Pinia** y **Firebase** para los clubes del Distrito 4370 de Rotaract.

---

## 🛠️ Tecnologías y Herramientas

- **Framework Frontend:** [Vue 3](https://vuejs.org/) (Composition API)
- **Tooling & Build:** [Vite](https://vite.dev/)
- **Estilos:** [Tailwind CSS v4](https://tailwindcss.com/) & [Bootstrap Icons](https://icons.getbootstrap.com/)
- **Gestión de Estado:** [Pinia](https://pinia.vuejs.org/)
- **Enrutamiento:** [Vue Router](https://router.vuejs.org/)
- **Backend & Base de Datos:** [Firebase](https://firebase.google.com/) (Firestore, Auth) / [VueFire](https://vuefire.vuejs.org/)
- **Calendario / Agendamiento:** [FullCalendar](https://fullcalendar.io/) (`@fullcalendar/vue3`)
- **Formateador de Código:** [Prettier](https://prettier.io/)
- **Pruebas Unitarias:** [Vitest](https://vitest.dev/)

---

## ✨ Características Recientes (v1.1.0)

### 🔗 1. Sistema de Networking (Linktree Personalizable)
* Generador de páginas de enlace profesional con **tres temas visuales premium**:
  1. *Clásico Rotaract:* Fondo gris claro suave y botones corporativos en rosa.
  2. *Modern Glassmorphism:* Degradado colorido con efecto de vidrio esmerilado translúcido.
  3. *Cyber Dark Neon:* Estética oscura de código con tipografía monoespaciada y sombras verde neón.
* Panel de administración con un **mockup interactivo de teléfono inteligente** para previsualizar los cambios en tiempo real.

### 🛡️ 2. Privacidad y Visibilidad Granular
* Los socios pueden configurar la visibilidad pública de su perfil:
  * **Perfil Privado:** Oculta al socio de listados generales y búsquedas para miembros sin privilegios de administración.
  * **Ocultar Datos de Contacto:** Enmascara teléfono y correo en tablas de visualización y oculta los accesos directos de contacto (WhatsApp, Correo) de su Linktree.
  * **Ocultar Datos de Trabajo:** Oculta la sección laboral y la descarga del Curriculum Vitae (CV).

### 🛠️ 3. Portal de Herramientas del Club
* Un hub colaborativo donde los socios programadores pueden publicar utilidades web y bots para el club.
* Formulario de carga con control de desarrollador, enlaces del repositorio, enlaces de producción y soporte para equipos de trabajo.
* **Efecto Hover (Vista Previa en Iframe):** Al pasar el cursor sobre las tarjetas de herramientas se levanta un popover simulando una ventana de navegador web que carga interactivamente el sitio en tiempo real a escala.

### 🔒 4. Mitigación contra Inyecciones DOM-based XSS
* Saneamiento estricto de todas las URLs configuradas por usuarios (`href` de enlaces y `src` de iframes) mediante un módulo de saneamiento en `src/helpers/security.js`. Esto neutraliza ataques de inyección de scripts a través de esquemas peligrosos como `javascript:`, `data:` o `vbscript:`.

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

- **Pruebas Unitarias:** Ejecuta la suite de pruebas unitarias usando Vitest.
  ```bash
  npm run test:unit
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
│   │   ├── tools/       # Componentes de la sección Herramientas (ToolCard, ModalTools)
│   │   └── ...
│   ├── composable/      # Composables (lógica reactiva compartida)
│   ├── config/          # Configuración de Firebase y servicios
│   ├── helpers/         # Funciones auxiliares y helpers (soporte, security, etc.)
│   ├── router/          # Configuración de Vue Router
│   ├── services/        # Servicios de API / integración
│   ├── stores/          # Stores de Pinia
│   ├── views/           # Vistas / Páginas principales
│   └── main.js          # Punto de entrada de la aplicación
├── .env.local           # Variables de entorno locales (gitignored)
├── vercel.json          # Configuración de despliegue en Vercel
├── vite.config.js       # Configuración de Vite
└── package.json         # Dependencias y scripts
```
