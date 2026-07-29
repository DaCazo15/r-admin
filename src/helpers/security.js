/**
 * Helpers de seguridad para sanitizar entradas y prevenir vulnerabilidades DOM-based XSS.
 */

/**
 * Sanitiza una URL para asegurarse de que no contenga protocolos peligrosos (javascript:, data:, vbscript:).
 * Retorna '#' como fallback si la URL es peligrosa.
 * 
 * @param {string} url - URL a sanitizar
 * @returns {string} URL limpia o '#' si es insegura
 */
export function sanitizeUrl(url) {
  if (!url) return '#'
  
  // Eliminar caracteres de control ascii, espacios iniciales/finales y caracteres no imprimibles
  // que los atacantes usan para evadir filtros (ej: java\u0009script:alert(1))
  const cleaned = url.replace(/[^\x20-\x7E]/g, '').trim()
  
  // Validar contra protocolos peligrosos
  const unsafePattern = /^(?:javascript|data|vbscript):/i
  if (unsafePattern.test(cleaned)) {
    return '#'
  }
  
  return cleaned
}

/**
 * Valida si una URL es estrictamente un enlace web seguro (http:// o https://).
 * Retorna '#' como fallback si no cumple el patrón.
 * Usado comúnmente para iframes de vistas previas.
 * 
 * @param {string} url - URL a validar
 * @returns {string} URL validada o '#' si no es segura
 */
export function sanitizeWebUrl(url) {
  if (!url) return '#'
  const cleaned = url.replace(/[^\x20-\x7E]/g, '').trim()
  
  // Validar estrictamente contra http:// o https://
  const safeWebPattern = /^https?:\/\//i
  if (!safeWebPattern.test(cleaned)) {
    return '#'
  }
  
  return cleaned
}
