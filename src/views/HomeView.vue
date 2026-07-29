<script setup>
import Logo from '../components/ux/Logo.vue'
import Tabla from '../components/ux/Tabla.vue'
import Modal from '../components/form/Modal.vue'
import ModalPassEstandarClub from '../components/form/ModalPassEstandarClub.vue'
import Filtros from '../components/ux/Filtros.vue'
import OpcionesTesoreria from '@/components/OpcionesTesoreria.vue'
import MetricasComponent from '@/components/MetricasComponent.vue'
import JuntaComponent from '@/components/JuntaComponent.vue'
import { ref, computed, watch } from 'vue'
import { useEncabezado } from '../composable/useEncabezado.js'

import ModalTesoreria from '../components/form/ModalTesoreria.vue'
import { useEdicion } from '../composable/useEdicion.js'
import { useSesionStore } from '@/stores/useSesionStore'
import { storeToRefs } from 'pinia'
import { useTesoreriaStore } from '@/stores/useTesoreriaStore'

// Subcomponentes modulares de presentación
import HomeNavTabs from '@/components/home/HomeNavTabs.vue'
import HomeActionsBar from '@/components/home/HomeActionsBar.vue'

const { iniciarEdicion, cancelarEdicion } = useEdicion()

const isOpen = ref(false)
const isOpenTesoreria = ref(false)
const isOpenModalPass = ref(false)
const personaActual = ref(null)
const filtro = ref(false)
const buscador = ref('')
const terminoAplicado = ref('')
const metricasOn = ref(false)
const { estatus, encabezados } = useEncabezado()

const sesionStore = useSesionStore()
const { rol, club } = storeToRefs(sesionStore)

const puedeAccederTesoreria = computed(() => {
  return ['tesorero', 'vicepresidente', 'presidente'].includes(rol.value)
})

const puedeAgregarPersona = computed(() => {
  if (estatus.value === 'Socios') {
    return ['secretario', 'vicepresidente', 'presidente'].includes(rol.value)
  }
  if (estatus.value === 'Aspirantes') {
    return ['membresia', 'secretario', 'vicepresidente', 'presidente'].includes(rol.value)
  }
  return false
})

const puedeModificarPassEstandar = computed(() => {
  return rol.value === 'presidente'
})

watch([estatus, puedeAccederTesoreria], () => {
  if (estatus.value === 'Tesoreria' && !puedeAccederTesoreria.value) {
    estatus.value = 'Socios'
  }
})

const modal = (persona = null) => {
  if (persona && persona.id) {
    iniciarEdicion(persona)
  } else {
    cancelarEdicion()
  }
  personaActual.value = persona
  isOpen.value = !isOpen.value
}

const modalTesoreria = (registro = null) => {
  if (registro && registro.id) {
    iniciarEdicion(registro)
  } else {
    cancelarEdicion()
  }
  personaActual.value = registro
  isOpenTesoreria.value = !isOpenTesoreria.value
}
const cambioEstatus = (nuevoEstatus) => (estatus.value = nuevoEstatus)
const aplicarFiltro = () => (filtro.value = !filtro.value)

const addOn = computed(() => {
  return estatus.value && estatus.value !== 'Junta'
})
const filtrosOn = computed(() => {
  return estatus.value === 'Tesoreria' && filtro.value
})

const tesoreriaStore = useTesoreriaStore()
const isUpdating = ref(false)
const mensajeExito = ref(false)

const verMetricas = () => {
  metricasOn.value = !metricasOn.value
}

const aplicarBusqueda = () => {
  terminoAplicado.value = buscador.value.trim()
}

const actualizarClub = async () => {
  if (isUpdating.value) return
  isUpdating.value = true
  mensajeExito.value = false

  try {
    await tesoreriaStore.syncEstadoClub(club.value || 'Isla de Margarita')
    mensajeExito.value = true
    setTimeout(() => {
      mensajeExito.value = false
    }, 3000)
  } catch (error) {
    console.error(error)
  } finally {
    isUpdating.value = false
  }
}
</script>

<template>
  <Modal v-if="isOpen" @close="modal" :estatus="estatus" :persona="personaActual" />
  <ModalTesoreria v-if="isOpenTesoreria" @close="modalTesoreria" :transaccion="personaActual" />
  <ModalPassEstandarClub v-if="isOpenModalPass" @close="isOpenModalPass = false" />
  
  <main>
    <!-- Logo -->
    <Logo v-if="estatus !== 'Tesoreria'" :club="club" />

    <!-- Botones de Navegación -->
    <HomeNavTabs
      :estatus="estatus"
      :puede-acceder-tesoreria="puedeAccederTesoreria"
      @cambioEstatus="cambioEstatus"
    />

    <!-- Opciones de Tesoreria -->
    <OpcionesTesoreria
      v-if="estatus === 'Tesoreria'"
      @metricas="verMetricas"
      :metricasOn="metricasOn"
    />

    <!-- Barra de Búsqueda y Acciones Rápidas -->
    <HomeActionsBar
      v-if="addOn"
      v-model:buscador="buscador"
      :estatus="estatus"
      :puede-agregar-persona="puedeAgregarPersona"
      :puede-modificar-pass-estandar="puedeModificarPassEstandar"
      :filtro="filtro"
      :metricas-on="metricasOn"
      :is-updating="isUpdating"
      :mensaje-exito="mensajeExito"
      @addPersona="modal(null)"
      @openModalPass="isOpenModalPass = true"
      @search="aplicarBusqueda"
      @toggleFiltro="aplicarFiltro"
      @actualizarClub="actualizarClub"
    />

    <!-- Filtros de Tesorería -->
    <Filtros v-if="filtrosOn" />

    <!-- Tabla principal -->
    <Tabla
      v-if="addOn && !metricasOn"
      :encabezados="encabezados"
      :estatus="estatus"
      :terminoBusqueda="terminoAplicado"
      @modalPersona="modal"
      @modalTesoreria="modalTesoreria"
    />

    <!-- Métricas -->
    <MetricasComponent v-if="metricasOn && estatus === 'Tesoreria'" />

    <!-- Junta Directiva -->
    <JuntaComponent v-if="estatus === 'Junta'" />
  </main>
</template>
