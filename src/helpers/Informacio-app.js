import { useRouter } from 'vue-router'

const router = useRouter()

export const tecnologias = [
  { nombre: 'Vue 3', icon: 'bi-lightning-charge' },
  { nombre: 'Vite', icon: 'bi-cpu' },
  { nombre: 'Tailwind CSS', icon: 'bi-palette2' },
  { nombre: 'Pinia', icon: 'bi-boxes' },
  { nombre: 'Firebase', icon: 'bi-fire' },
  { nombre: 'Vue Router', icon: 'bi-signpost-split' },
]

export const enlaces = [
  {
    icon: 'bi-globe',
    titulo: 'Sitio web del club',
    href: 'https://rotaract4370.org',
  },
  {
    icon: 'bi-file-text',
    titulo: 'Condiciones del servicio',
    accion: () => router.push({ name: 'conditions' }),
  },
  {
    icon: 'bi-file-lock',
    titulo: 'Política de privacidad',
    accion: () => router.push({ name: 'policies' }),
  },
  {
    icon: 'bi-question-circle',
    titulo: 'Centro de ayuda',
    accion: () => router.push({ name: 'help' }),
  },
]
