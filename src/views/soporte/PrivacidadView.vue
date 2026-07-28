<script setup>
import { useRouter } from 'vue-router'
import { secciones_politicas } from '../../helpers/soporte.js'

const router = useRouter()

const fechaActualizacion = '27 de julio de 2026'

const secciones = [
  {
    icon: 'bi-info-circle',
    titulo: '1. Información general',
    contenido: [
      'Esta Política de Privacidad describe cómo R-Admin (el "Panel", el "Servicio"), operado para la administración y gestión de actividades del club Rotaract 4370, recopila, usa, almacena y protege tus datos personales.',
      'Al utilizar el Panel aceptas las prácticas descritas en esta política. Si no estás de acuerdo, te recomendamos no proporcionar tus datos ni utilizar el Servicio.',
    ],
  },
  {
    icon: 'bi-person-lines-fill',
    titulo: '2. Datos que recopilamos',
    contenido: [
      'Datos de cuenta: nombre completo, correo electrónico y contraseña (almacenada de forma cifrada mediante Firebase Authentication).',
      'Datos de perfil: foto de perfil, información de contacto y demás datos que decidas registrar en tu cuenta.',
      'Datos de uso del club: información relacionada con eventos, calendario de actividades, participación y demás registros administrativos gestionados dentro del Panel.',
      'Datos técnicos: información básica de la sesión y del dispositivo (tipo de navegador, hora de acceso) generada automáticamente por los servicios de Firebase con fines de seguridad y funcionamiento.',
    ],
  },
  {
    icon: 'bi-gear',
    titulo: '3. Cómo usamos tu información',
    contenido: [
      'Utilizamos tus datos para crear y administrar tu cuenta, permitirte acceder a las funciones del Panel y gestionar la información administrativa del club Rotaract 4370.',
      'También los usamos para organizar el calendario de actividades, generar reportes o documentos administrativos (por ejemplo en formato PDF) y comunicarnos contigo sobre asuntos relacionados con tu cuenta o con el club.',
      'No utilizamos tus datos personales con fines publicitarios ni los vendemos a terceros.',
    ],
  },
  {
    icon: 'bi-hdd-network',
    titulo: '4. Almacenamiento y proveedores externos',
    contenido: [
      'Tus datos se almacenan y procesan mediante Firebase y Google Cloud Platform, proveedores que aplican medidas de seguridad estándar de la industria, como cifrado en tránsito y en reposo.',
      'Al usar estos servicios, el tratamiento de ciertos datos técnicos también está sujeto a las políticas de privacidad de Google/Firebase.',
    ],
  },
  {
    icon: 'bi-shield-lock',
    titulo: '5. Seguridad de la información',
    contenido: [
      'Implementamos medidas técnicas y organizativas razonables para proteger tus datos frente a accesos no autorizados, pérdida, alteración o divulgación indebida.',
      'Sin embargo, ningún sistema es completamente infalible: te recomendamos usar una contraseña segura y no compartir tus credenciales de acceso con terceros.',
    ],
  },
  {
    icon: 'bi-people',
    titulo: '6. Con quién compartimos tus datos',
    contenido: [
      'Tus datos pueden ser visibles para el equipo administrativo del club Rotaract 4370 en la medida necesaria para la gestión de actividades y miembros.',
      'No compartimos tu información personal con terceros ajenos al club, salvo obligación legal o cuando sea estrictamente necesario para el funcionamiento técnico del Servicio (por ejemplo, proveedores de infraestructura como Firebase).',
    ],
  },
  {
    icon: 'bi-card-checklist',
    titulo: '7. Tus derechos',
    contenido: [
      'Puedes acceder, actualizar o corregir tus datos de perfil desde la sección de Configuración del Panel.',
      'Puedes solicitar la eliminación de tu cuenta y de los datos personales asociados contactando al equipo administrativo del club, salvo que exista una obligación legal o administrativa de conservarlos.',
    ],
  },
  {
    icon: 'bi-cookie',
    titulo: '8. Cookies y almacenamiento local',
    contenido: [
      'El Panel puede utilizar cookies o almacenamiento local del navegador, principalmente gestionados por Firebase Authentication, para mantener tu sesión iniciada y garantizar el funcionamiento correcto del Servicio.',
    ],
  },
  {
    icon: 'bi-arrow-repeat',
    titulo: '9. Cambios a esta política',
    contenido: [
      'Podemos actualizar esta Política de Privacidad periódicamente. Los cambios entrarán en vigor a partir de su publicación en esta misma página, indicando la fecha de última actualización.',
      'El uso continuado del Servicio después de la publicación de los cambios constituye tu aceptación de los mismos.',
    ],
  },
  {
    icon: 'bi-envelope-at',
    titulo: '10. Contacto',
    contenido: [
      'Si tienes preguntas sobre esta Política de Privacidad o sobre el tratamiento de tus datos, puedes contactar al equipo administrativo del club Rotaract 4370 a través de los canales oficiales del club.',
    ],
  },
]
</script>

<template>
  <div class="w-[92%] sm:w-11/12 md:w-3/4 mx-auto max-w-3xl pb-10">
    <!-- Encabezado -->
    <div class="mb-6">
      <button
        type="button"
        @click="router.back()"
        class="inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-primary-600 transition-colors cursor-pointer mb-4"
      >
        <i class="bi bi-arrow-left"></i>
        Volver
      </button>

      <div class="flex items-center gap-3">
        <div
          class="w-11 h-11 rounded-xl bg-primary-50 flex items-center justify-center shrink-0 border border-primary-100"
        >
          <i class="bi bi-file-lock text-xl text-primary-600"></i>
        </div>
        <div>
          <h1 class="text-xl md:text-2xl font-bold text-gray-900 leading-tight">
            Política de Privacidad
          </h1>
          <p class="text-xs text-gray-500 mt-0.5">Última actualización: {{ fechaActualizacion }}</p>
        </div>
      </div>
    </div>

    <!-- Tarjeta contenedora -->
    <div class="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
      <div class="p-5 md:p-6 border-b border-gray-100 bg-gray-50/60">
        <p class="text-sm text-gray-600 leading-relaxed">
          En R-Admin, panel de administración y gestión del club Rotaract 4370, respetamos tu
          privacidad. Esta política explica de forma clara qué información recopilamos, cómo la
          usamos y cuáles son tus derechos sobre ella.
        </p>
      </div>

      <div class="divide-y divide-gray-100">
        <section v-for="seccion in secciones_politicas" :key="seccion.titulo" class="p-5 md:p-6">
          <h2 class="flex items-center gap-2.5 text-sm md:text-base font-bold text-gray-900 mb-3">
            <i :class="['bi', seccion.icon, 'text-primary-600 text-lg']"></i>
            {{ seccion.titulo }}
          </h2>
          <div class="space-y-2.5 pl-[1.9rem]">
            <p
              v-for="(parrafo, idx) in seccion.contenido"
              :key="idx"
              class="text-sm text-gray-600 leading-relaxed"
            >
              {{ parrafo }}
            </p>
          </div>
        </section>
      </div>
    </div>

    <p class="text-xs text-gray-400 text-center mt-6">
      Rotaract 4370 &middot; R-Admin &middot; Todos los derechos reservados
    </p>
  </div>
</template>
