<script setup>
import { useSesionStore } from '../../stores/useSesionStore'
import { storeToRefs } from 'pinia'

const sesionStore = useSesionStore()
const { usuario } = storeToRefs(sesionStore)
</script>

<template>
  <div>
    <h4>Configuraciones de la cuenta</h4>
    <!-- Perfil -->
    <div class="flex items-center gap-3.5 pb-4 border-b border-white/15">
      <div class="relative">
        <img
          src="../../assets/img/img_user/user_img.webp"
          :alt="usuario?.nombre || 'Foto de perfil'"
          class="rounded-full w-14 h-14 object-cover shadow-lg border-2 border-white/30 p-0.5 ring-2 ring-primary-400/40"
        />
        <span
          class="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-400 border-2 border-primary-700 rounded-full"
        ></span>
      </div>
      <div class="overflow-hidden">
        <h2 class="font-bold text-base tracking-wide truncate text-white leading-tight">
          {{ usuario?.nombre || 'Usuario' }}
        </h2>
        <p class="text-xs text-primary-200/90 truncate font-light mt-0.5">
          {{ usuario?.email || 'correo@domain.com' }}
        </p>
      </div>
    </div>
    <div>
      <!-- Configuraciones de la cuenta -->
      <div>
        <h5>Perfil</h5>
        <button>Visibilidad del perfil</button>
        <button>Networking</button>
        <button>Tema</button>
      </div>

      <!-- Cuenta, datos, seguridad -->
      <div>
        <h5>Cuenta y datos</h5>
        <button>Cuenta y datos</button>
        <button>Seguridad</button>
      </div>

      <!-- Cuenta, datos, seguridad -->
      <div>
        <h5>Iniciar Sesión</h5>
        <button>Agregar Cuenta</button>
        <button>Cerrar Sesión</button>
      </div>

      <!-- Cuenta, datos, seguridad -->
      <div>
        <h5>Soporte</h5>
        <button>Centro de Ayuda</button>
        <button>Condiciones del Servicio</button>
        <button>Política de Privacidad</button>
        <button>Información</button>
      </div>
    </div>
  </div>
</template>
