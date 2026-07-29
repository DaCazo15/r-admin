export const plantillasMensaje = {
  aviso: (saludo, club = 'Isla de Margarita') => 
    `${saludo} 📢\n\nTe escribimos desde *Rotaract ${club}* para informarte:\n\n[Escribe aquí el aviso]\n\n¡Gracias!`,
  recordatorio: (saludo) => 
    `${saludo} 👋\n\nTe recordamos que tu *mensualidad* del club está pendiente de pago. Si ya la realizaste, ¡ignora este mensaje y gracias!\n\nCualquier duda, quedamos atentos. 🙌`,
  cobro: (saludo, monto, club = 'Isla de Margarita') => 
    `${saludo}\n\nTe contactamos desde *Tesorería* de Rotaract ${club}. Tienes un monto pendiente de *$${Number(monto || 0).toFixed(2)}* correspondiente a la mensualidad del club.\n\nPor favor realiza el pago a la brevedad y envíanos el comprobante. ¡Gracias por tu apoyo! 🙏`,
  personalizado: (saludo) => 
    `${saludo}\n\n`
}
