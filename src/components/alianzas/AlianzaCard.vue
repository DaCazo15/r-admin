<script setup>
import { sanitizeUrl } from '@/helpers/security'

defineProps({
  item: Object,
  puedeModificarAlianzas: Boolean
})

const emit = defineEmits(['edit', 'delete'])
</script>

<template>
  <div
    class="bg-white rounded-2xl border border-gray-200 shadow-xs p-5 flex flex-col gap-3 hover:shadow-sm transition-shadow"
  >
    <div class="flex items-start justify-between gap-3">
      <div class="flex items-center gap-3 min-w-0">
        <div
          class="w-11 h-11 rounded-xl bg-primary-50 flex items-center justify-center shrink-0 border border-primary-100"
        >
          <i class="bi bi-diagram-3 text-xl text-primary-600"></i>
        </div>
        <div class="min-w-0">
          <h3 class="font-bold text-gray-900 truncate">{{ item.nombre }}</h3>
          <span
            class="inline-block text-[10px] font-semibold uppercase tracking-wide text-primary-600 bg-primary-50 px-2 py-0.5 rounded-full mt-1"
          >
            {{ item.tipo }}
          </span>
        </div>
      </div>

      <div v-if="puedeModificarAlianzas" class="flex items-center gap-1 shrink-0">
        <button
          @click="emit('edit')"
          class="cursor-pointer w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-primary-600 hover:bg-primary-50 transition-all"
          title="Editar"
        >
          <i class="bi bi-pencil"></i>
        </button>
        <button
          @click="emit('delete')"
          class="cursor-pointer w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-all"
          title="Eliminar"
        >
          <i class="bi bi-trash"></i>
        </button>
      </div>
    </div>

    <p class="text-sm text-gray-600 leading-relaxed line-clamp-3">{{ item.descripcion }}</p>

    <div class="border-t border-gray-100 pt-3 space-y-1.5">
      <p class="text-xs text-gray-500 flex items-center gap-2">
        <i class="bi bi-person text-gray-400"></i>
        {{ item.contacto }}
      </p>
      <p class="text-xs text-gray-500 flex items-center gap-2">
        <i class="bi bi-envelope text-gray-400"></i>
        {{ item.correo }}
      </p>
      <p class="text-xs text-gray-500 flex items-center gap-2">
        <i class="bi bi-telephone text-gray-400"></i>
        {{ item.telefono }}
      </p>
      <a
        v-if="item.sitioWeb"
        :href="sanitizeUrl(item.sitioWeb)"
        target="_blank"
        rel="noopener noreferrer"
        class="text-xs text-primary-600 hover:text-primary-700 font-medium flex items-center gap-2"
      >
        <i class="bi bi-globe"></i>
        {{ item.sitioWeb }}
      </a>
    </div>
  </div>
</template>
