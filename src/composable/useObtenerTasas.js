import { ref, computed } from 'vue'

export const useObtenerTasas = () => {
  const bcv = ref('0.00')
  const usdt = ref('0.00')
  const eur = ref('0.00')
  const cargandoTasas = ref(true)
  const obtenerTasas = async () => {
    cargandoTasas.value = true
    try {
      const [resBcv, resUsdt, resEur] = await Promise.all([
        fetch('https://ve.dolarapi.com/v1/dolares/oficial'),
        fetch('https://ve.dolarapi.com/v1/dolares/paralelo'),
        fetch('https://ve.dolarapi.com/v1/euros/oficial'),
      ])

      const [dataBcv, dataUsdt, dataEur] = await Promise.all([
        resBcv.json(),
        resUsdt.json(),
        resEur.json(),
      ])

      bcv.value = dataBcv.promedio.toFixed(2)
      usdt.value = dataUsdt.promedio.toFixed(2)
      eur.value = dataEur.promedio.toFixed(2)
    } catch (error) {
      console.error('Error al obtener las tasas:', error)
    } finally {
      cargandoTasas.value = false
    }
  }

  return { bcv, usdt, eur, cargandoTasas, obtenerTasas }
}
