import { onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useTutorial } from './useTutorial'

export function useShortcuts() {
  const router = useRouter()
  const { startTutorial } = useTutorial()

  const handleKeydown = (e) => {
    // Evitar atajos si se está escribiendo en un input o textarea
    if (['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName)) {
      // Excepción para Esc (limpiar foco)
      if (e.key === 'Escape') {
        e.target.blur()
      }
      return
    }

    // Ctrl + K para enfocar el buscador (si existe)
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault()
      const searchInput = document.querySelector('input[placeholder="Buscar"]')
      if (searchInput) {
        searchInput.focus()
      }
    }

    // Shift + H para ir al Home
    if (e.shiftKey && e.key.toLowerCase() === 'h') {
      e.preventDefault()
      router.push({ name: 'home' })
    }

    // Shift + E para ir a Eventos
    if (e.shiftKey && e.key.toLowerCase() === 'e') {
      e.preventDefault()
      router.push({ name: 'eventos' })
    }

    // Shift + T para lanzar el tutorial manualmente
    if (e.shiftKey && e.key.toLowerCase() === 't') {
      e.preventDefault()
      localStorage.removeItem('vistoTutorial')
      startTutorial()
    }
  }

  onMounted(() => {
    window.addEventListener('keydown', handleKeydown)
  })

  onUnmounted(() => {
    window.removeEventListener('keydown', handleKeydown)
  })
}
