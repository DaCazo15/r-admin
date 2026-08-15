import { onMounted } from 'vue'
import introJs from 'intro.js'
import 'intro.js/introjs.css'

export function useTutorial() {
  const startTutorial = () => {
    // Verificar si ya vio el tutorial
    const yaVio = localStorage.getItem('vistoTutorial')
    if (yaVio) return

    const intro = introJs()

    intro.setOptions({
      nextLabel: 'Siguiente',
      prevLabel: 'Atrás',
      doneLabel: 'Entendido',
      hidePrev: true,
      hideNext: false,
      showProgress: true,
      showBullets: false,
      steps: [
        {
          title: '¡Bienvenido a R-Admin!',
          intro: 'Vamos a dar un paseo rápido por las principales herramientas de tu panel de control.'
        },
        {
          element: document.querySelector('.tutorial-tabs'), // Hay que añadir esta clase a HomeNavTabs
          title: 'Navegación',
          intro: 'Aquí puedes cambiar entre las vistas de Socios, Aspirantes, Junta y Tesorería.'
        },
        {
          element: document.querySelector('.tutorial-search'), // A HomeActionsBar
          title: 'Buscador y Acciones',
          intro: 'Busca miembros rápidamente o usa este botón (+) para agregar nuevos registros.'
        },
        {
          element: document.querySelector('.tutorial-menu'), // A NavComponent o botón de menú
          title: 'Menú Principal',
          intro: 'Despliega este menú para acceder a Eventos, Configuraciones, y otras áreas.'
        }
      ]
    })

    // Se ejecuta al cerrar o terminar
    intro.oncomplete(() => {
      localStorage.setItem('vistoTutorial', 'true')
    })
    
    intro.onexit(() => {
      localStorage.setItem('vistoTutorial', 'true')
    })

    // Timeout pequeño para asegurar que el DOM cargó
    setTimeout(() => {
      intro.start()
    }, 1000)
  }

  // Método manual para volver a verlo
  const resetTutorial = () => {
    localStorage.removeItem('vistoTutorial')
    startTutorial()
  }

  return {
    startTutorial,
    resetTutorial
  }
}
