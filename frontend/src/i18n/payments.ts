/**
 * Payments and Checkout Texts (Spanish - Mexico)
 */

export const paymentTexts = {
  // Checkout Page
  checkout: {
    title: 'Resumen de compra',
    event: 'Evento',
    ticketSummary: 'Resumen de boletos',
    ticketType: 'Tipo',
    quantity: 'Cantidad',
    price: 'Precio',
    subtotal: 'Subtotal',
    total: 'Total a pagar',
    proceedToPayment: 'Proceder al pago',
    processing: 'Procesando...',
    loading: 'Cargando información de pago...',
    orderExpired: 'Orden expirada',
    orderExpiredMessage:
      'Esta orden ha expirado. Los boletos han sido liberados. Por favor crea una nueva orden.',
    backToEvents: 'Volver a eventos',
  },

  // Payment Success Page
  success: {
    title: 'Compra exitosa',
    congratulations: '¡Felicidades!',
    message: 'Tu compra se ha procesado exitosamente.',
    orderNumber: 'Número de orden',
    downloadTickets: 'Descargar boletos',
    viewTickets: 'Ver mis boletos',
    backToEvents: 'Explorar más eventos',
    emailSent: 'Hemos enviado los detalles de tu compra a tu correo electrónico.',
  },

  // Payment Pending Page
  pending: {
    title: 'Pago pendiente',
    processingTitle: 'Procesando tu pago',
    message: 'Tu pago está siendo procesado. Recibirás una confirmación pronto.',
    instructions:
      'Si elegiste pagar en efectivo o transferencia, completa el pago siguiendo las instrucciones enviadas a tu correo.',
    checkStatus: 'Verificar estado del pago',
    viewOrders: 'Ver mis órdenes',
    backToEvents: 'Volver a eventos',
    estimatedTime: 'Tiempo estimado: 24-48 horas',
  },

  // Payment Failure Page
  failure: {
    title: 'Pago rechazado',
    errorTitle: 'Hubo un problema con tu pago',
    message: 'Tu pago no pudo ser procesado. Por favor intenta de nuevo.',
    reasons: 'Posibles causas:',
    reason1: 'Fondos insuficientes',
    reason2: 'Datos de tarjeta incorrectos',
    reason3: 'Transacción rechazada por el banco',
    reason4: 'Problema de conexión',
    tryAgain: 'Intentar de nuevo',
    contactSupport: 'Contactar soporte',
    backToEvents: 'Volver a eventos',
  },

  // Wallet/Tickets Page
  wallet: {
    title: 'Cartera de boletos',
    myTickets: 'Mis boletos',
    noTickets: 'Aún no tienes boletos',
    noTicketsMessage: '¡Explora eventos y compra tus boletos para empezar!',
    browseEvents: 'Explorar eventos',
    loading: 'Cargando tus boletos...',
    ticketCode: 'Código',
    event: 'Evento',
    date: 'Fecha',
    status: 'Estado',
    viewQR: 'Ver código QR',
    download: 'Descargar',
    valid: 'Válido',
    used: 'Usado',
  },

  // QR Code Modal/Validation
  qr: {
    title: 'Código QR de acceso',
    instructions: 'Muestra este código QR en la entrada del evento',
    ticketInfo: 'Información del boleto',
    eventName: 'Evento',
    ticketCode: 'Código',
    scanSuccess: 'Boleto validado correctamente',
    scanError: 'Error al validar el boleto',
    alreadyUsed: 'Este boleto ya fue utilizado',
    invalid: 'Código de boleto inválido',
    close: 'Cerrar',
  },

  // Validation Messages
  validation: {
    selectTickets: 'Selecciona al menos un boleto',
    quantityInvalid: 'Cantidad inválida',
    insufficientTickets: 'No hay suficientes boletos disponibles',
  },

  // Error Messages
  errors: {
    orderNotFound: 'Orden no encontrada',
    orderExpired: 'La orden ha expirado',
    paymentFailed: 'El pago no se pudo procesar',
    loadTicketsFailed: 'Error al cargar los boletos',
    paymentInitFailed: 'Error al iniciar el pago',
    serverError: 'Error del servidor. Intenta de nuevo más tarde.',
  },

  // Status Labels
  status: {
    pending: 'Pendiente',
    paid: 'Pagado',
    cancelled: 'Cancelado',
    expired: 'Expirado',
    processing: 'Procesando',
    approved: 'Aprobado',
    rejected: 'Rechazado',
  },
};
