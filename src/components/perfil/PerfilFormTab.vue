<script setup>
import Aviso from '../ux/Aviso.vue'
import { ref } from 'vue'

const props = defineProps({
  form: Object,
  isSaving: Boolean,
  errorMsg: String,
  exitoMsg: String,
  config: Boolean,
  usuarioEmail: String
})
const emit = defineEmits(['save', 'cancel', 'cerrarSesion'])

const tabEdicion = ref('personal')

</script>

<template>
  <div class="space-y-6">
    <div class="md:flex flex-col justify-between border-b pb-2 border-gray-100">
      <h3
        class="text-lg font-bold text-gray-900 flex items-center gap-2"
      >
        <i
          class="bi"
          :class="[config ? 'bi-gear-wide-connected' : 'bi-pencil-square', 'text-primary-600']"
        ></i>
        {{ config ? 'Configuración de Perfil' : 'Editar Datos Personales' }}
      </h3>
    </div>

    <!-- Pestañas de Edición -->
    <div class="flex border-b border-gray-100 mb-6">
      <button
        type="button"
        @click="tabEdicion = 'personal'"
        :class="[
          tabEdicion === 'personal'
            ? 'border-primary-600 text-primary-600 font-bold'
            : 'border-transparent text-gray-400 hover:text-gray-600',
        ]"
        class="cursor-pointer py-2.5 px-4 border-b-2 text-sm transition-all"
      >
        Información Personal
      </button>
      <button
        type="button"
        @click="tabEdicion = 'redes'"
        :class="[
          tabEdicion === 'redes'
            ? 'border-primary-600 text-primary-600 font-bold'
            : 'border-transparent text-gray-400 hover:text-gray-600',
        ]"
        class="cursor-pointer py-2.5 px-4 border-b-2 text-sm transition-all"
      >
        Redes & CV
      </button>
      <button
        type="button"
        @click="tabEdicion = 'laboral'"
        :class="[
          tabEdicion === 'laboral'
            ? 'border-primary-600 text-primary-600 font-bold'
            : 'border-transparent text-gray-400 hover:text-gray-600',
        ]"
        class="cursor-pointer py-2.5 px-4 border-b-2 text-sm transition-all"
      >
        Empleo
      </button>
      <button
        type="button"
        @click="tabEdicion = 'pass'"
        :class="[
          tabEdicion === 'pass'
            ? 'border-primary-600 text-primary-600 font-bold'
            : 'border-transparent text-gray-400 hover:text-gray-600',
        ]"
        class="cursor-pointer py-2.5 px-4 border-b-2 text-sm transition-all"
      >
        Cambiar Contraseña
      </button>
    </div>

    <!-- Contenedor del Formulario -->
    <form @submit.prevent="emit('save', tabEdicion)" class="space-y-6">
      <!-- TAB 1: INFORMACIÓN PERSONAL -->
      <div v-if="tabEdicion === 'personal'" class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="flex flex-col gap-1.5">
          <label class="text-xs font-bold text-gray-600">Nombre Completo</label>
          <input
            type="text"
            v-model="form.nombre"
            required
            class="px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>

        <div class="flex flex-col gap-1.5">
          <label class="text-xs font-bold text-gray-600">Fecha de Nacimiento</label>
          <input
            type="date"
            v-model="form.fecha"
            class="px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>

        <div class="flex flex-col gap-1.5">
          <label class="text-xs font-bold text-gray-600">Edad (Vacío para auto-calcular)</label>
          <input
            type="number"
            v-model="form.edad"
            placeholder="Auto-calculado"
            class="px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>

        <div class="flex flex-col gap-1.5">
          <label class="text-xs font-bold text-gray-600">Ubicación / Residencia</label>
          <input
            type="text"
            v-model="form.ubicacion"
            placeholder="Ubicación"
            class="px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>
      </div>

      <!-- TAB 2: REDES SOCIALES & CV -->
      <div v-if="tabEdicion === 'redes'" class="space-y-4">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="flex flex-col gap-1.5">
            <label class="text-xs font-bold text-gray-600">Número de Teléfono (WhatsApp)</label>
            <input
              type="text"
              v-model="form.telefono"
              placeholder="Teléfono"
              class="px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          <div class="flex flex-col gap-1.5">
            <label class="text-xs font-bold text-gray-600">Instagram (Nombre de Usuario)</label>
            <input
              type="text"
              v-model="form.instagram"
              placeholder="Instagram"
              class="px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          <div class="flex flex-col gap-1.5">
            <label class="text-xs font-bold text-gray-600">Facebook (Usuario o URL)</label>
            <input
              type="text"
              v-model="form.facebook"
              placeholder="Facebook"
              class="px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          <div class="flex flex-col gap-1.5">
            <label class="text-xs font-bold text-gray-600">GitHub (Nombre de Usuario)</label>
            <input
              type="text"
              v-model="form.github"
              placeholder="GitHub"
              class="px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          <div class="flex flex-col gap-1.5">
            <label class="text-xs font-bold text-gray-600">LinkedIn (Nombre de Usuario)</label>
            <input
              type="text"
              v-model="form.linkedin"
              placeholder="LinkedIn"
              class="px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          <div class="flex flex-col gap-1.5">
            <label class="text-xs font-bold text-gray-600">Enlace de Descarga de CV</label>
            <input
              type="url"
              v-model="form.cvUrl"
              placeholder="https://drive.google.com/..."
              class="px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
        </div>

        <!-- Nota recomendación Drive -->
        <div
          class="p-4 bg-primary-50/50 border border-primary-100 rounded-xl flex gap-3 text-sm text-primary-800 font-light mt-2"
        >
          <i class="bi bi-info-circle-fill text-primary-600 text-lg shrink-0"></i>
          <p>
            <strong>Recomendación para el CV:</strong> Te sugerimos subir tu archivo PDF de CV a
            <strong>Google Drive</strong>, <strong>OneDrive</strong> o similar, configurarlo en modo
            <i>"Público (cualquier persona con el enlace puede leer)"</i> y pegar únicamente el
            enlace de compartición en el campo superior.
          </p>
        </div>
      </div>

      <!-- TAB 3: INFORMACIÓN -->
      <div v-if="tabEdicion === 'laboral'" class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="flex flex-col gap-1.5">
          <label class="text-xs font-bold text-gray-600">Empresa / Empleo</label>
          <input
            type="text"
            v-model="form.empleo"
            placeholder="Empresa"
            class="px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>

        <div class="flex flex-col gap-1.5">
          <label class="text-xs font-bold text-gray-600">Cargo</label>
          <input
            type="text"
            v-model="form.cargo"
            placeholder="Cargo"
            class="px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>

        <div class="flex flex-col gap-1.5">
          <label class="text-xs font-bold text-gray-600">Fecha de Inicio</label>
          <input
            type="date"
            v-model="form.fechaInicio"
            class="px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>

        <div class="flex flex-col gap-1.5">
          <label class="text-xs font-bold text-gray-600">Instagram de la Empresa (Opcional)</label>
          <input
            type="text"
            v-model="form.instagramEmpresa"
            placeholder="Instagram"
            class="px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>
      </div>

      <!-- TAB 4: PASSWORD -->
      <Aviso v-if="tabEdicion === 'pass'" class="hidden md:block"/>
      <div v-if="tabEdicion === 'pass'" class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Aviso v-if="tabEdicion === 'pass'" class="md:hidden block"/>
        <div class="flex flex-col gap-1.5">
          <label class="text-xs font-bold text-gray-600">Contraseña Actual</label>
          <input
            type="password"
            v-model="form.contraseñaActual"
            placeholder="Contraseña Actual"
            autocomplete="current-password"
            class="px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>

        <div class="flex flex-col gap-1.5">
          <label class="text-xs font-bold text-gray-600">Nueva Contraseña</label>
          <input
            type="password"
            v-model="form.nuevaContraseña"
            placeholder="Nueva Contraseña"
            autocomplete="new-password"
            class="px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>

        <div class="flex flex-col gap-1.5">
          <label class="text-xs font-bold text-gray-600">Confirmar Nueva Contraseña</label>
          <input
            type="password"
            v-model="form.confirmarNuevaContraseña"
            placeholder="Confirmar Nueva Contraseña"
            autocomplete="new-password"
            class="px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>
      </div>

      <!-- Mensajes de Estado -->
      <div
        v-if="errorMsg"
        class="p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl font-medium"
      >
        {{ errorMsg }}
      </div>
      <div
        v-if="exitoMsg"
        class="p-3 bg-emerald-50 border border-emerald-200 text-emerald-600 text-sm rounded-xl font-medium"
      >
        {{ exitoMsg }}
      </div>

      <!-- Botones del Formulario -->
      <div class="flex justify-between items-center pt-4 border-t border-gray-100">
        <!-- Botón cerrar sesión solo si estamos en pestaña config -->
        <div>
          <button
            v-if="config"
            type="button"
            @click="emit('cerrarSesion')"
            class="cursor-pointer px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 font-bold rounded-xl text-xs flex items-center gap-1.5 border border-red-200"
          >
            <i class="bi bi-box-arrow-right"></i>
            Cerrar Sesión
          </button>
        </div>

        <div class="flex gap-3">
          <button
            type="button"
            @click="emit('cancel')"
            class="cursor-pointer px-4 py-2 border border-gray-200 hover:bg-gray-50 text-gray-700 font-medium rounded-xl text-sm transition-all active:scale-95"
            :disabled="isSaving"
          >
            Cancelar
          </button>
          <button
            type="submit"
            class="cursor-pointer px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-xl text-sm transition-all active:scale-95 flex items-center gap-1.5"
            :disabled="isSaving"
          >
            <span
              v-if="isSaving"
              class="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"
            ></span>
            Guardar Cambios
          </button>
        </div>
      </div>
    </form>
  </div>
</template>
