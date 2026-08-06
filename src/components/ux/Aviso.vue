<script setup>
defineProps({
  titulo: {
    type: String,
    default: 'Antes de continuar',
  },
  mensaje: {
    type: String,
    default:
      'Vas a cambiar la contraseña con la que iniciás sesión en R-Admin. Necesitás tu contraseña actual para confirmarlo, y por seguridad es posible que se te pida iniciar sesión de nuevo.',
  },
  icono: {
    type: String,
    default: 'bi-shield-lock-fill',
  },
  tipo: {
    type: String,
    default: 'warning', // 'warning' | 'info' | 'danger'
  },
})

const estilos = {
  warning: {
    contenedor: 'bg-amber-50/60 border-amber-100 text-amber-800',
    icono: 'text-amber-600',
  },
  info: {
    contenedor: 'bg-primary-50/50 border-primary-100 text-primary-800',
    icono: 'text-primary-600',
  },
  danger: {
    contenedor: 'bg-red-50 border-red-100 text-red-700',
    icono: 'text-red-600',
  },
}
</script>

<template>
  <div
    class="p-4 border rounded-xl flex gap-3 text-sm font-light mb-2"
    :class="estilos[tipo]?.contenedor || estilos.warning.contenedor"
  >
    <i class="bi text-lg shrink-0" :class="[icono, estilos[tipo]?.icono || estilos.warning.icono]"></i>
    <p>
      <strong class="font-bold">{{ titulo }}:</strong>
      {{ mensaje }}
    </p>
  </div>
</template>
