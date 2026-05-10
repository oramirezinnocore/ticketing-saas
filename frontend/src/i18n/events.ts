/**
 * Events Management Texts (Spanish - Mexico)
 */

export const eventTexts = {
  // Events List Page
  list: {
    title: 'Eventos',
    subtitle: 'Descubre experiencias increíbles y reserva tus boletos',
    searchPlaceholder: 'Buscar eventos...',
    noEvents: 'No hay eventos disponibles',
    noEventsMessage: 'Actualmente no hay eventos publicados. Vuelve pronto para ver nuevos eventos.',
    loading: 'Cargando eventos...',
    loadError: 'Error al cargar los eventos',
    viewDetails: 'Ver detalles',
    ticketsAvailable: 'boletos disponibles',
  },

  // Event Detail Page
  detail: {
    loading: 'Cargando detalles del evento...',
    notFound: 'Evento no encontrado',
    notFoundMessage: 'El evento que buscas no existe o ha sido eliminado',
    backToEvents: 'Volver a eventos',
    buyTickets: 'Comprar',
    selectTickets: 'Selecciona tus boletos',
    selectTicketsSubtitle: 'Elige la cantidad de boletos que necesitas',
    selectTicketsContinue: 'Selecciona boletos para continuar',
    aboutEvent: 'Acerca de este evento',
    ticketTypes: 'Tipos de boleto',
    date: 'Fecha',
    time: 'Hora',
    location: 'Ubicación',
    description: 'Descripción',
    organizedBy: 'Organizado por',
    quantity: 'Cantidad',
    price: 'Precio',
    available: 'disponibles',
    soldOut: 'Agotados',
    unavailable: 'No disponible',
    loginRequired: 'Se te pedirá iniciar sesión al finalizar',
  },

  // Create Event Page (Organizer)
  create: {
    title: 'Crear nuevo evento',
    backToDashboard: 'Volver al panel',
    eventDetails: 'Detalles del evento',
    eventTitle: 'Título del evento',
    eventTitlePlaceholder: 'Conferencia Tech 2024',
    description: 'Descripción',
    descriptionPlaceholder: 'Describe tu evento...',
    dateTime: 'Fecha y hora del evento',
    ticketTypes: 'Tipos de boleto',
    addTicketType: '+ Agregar tipo de boleto',
    ticketName: 'Nombre del boleto',
    ticketNamePlaceholder: 'Entrada general',
    ticketPrice: 'Precio ($)',
    ticketQuantity: 'Cantidad',
    removeTicket: 'Eliminar',
    cancel: 'Cancelar',
    create: 'Crear evento',
    creating: 'Creando evento...',
    required: '*',
  },

  // Organizer Events Page
  organizer: {
    title: 'Mis eventos',
    createEvent: 'Crear evento',
    noEvents: 'Sin eventos',
    noEventsMessage: 'Comienza creando tu primer evento.',
    loading: 'Cargando tus eventos...',
    viewAll: 'Ver todos',
    viewDetails: 'Ver detalles',
    ticketsSold: 'Boletos vendidos',
    ticketsRemaining: 'boletos restantes',
    soldPercentage: 'vendidos',
    ticketTypes: 'Tipos de boleto:',
  },

  // Organizer Dashboard
  dashboard: {
    title: 'Panel de control',
    welcome: 'Bienvenido de nuevo',
    stats: {
      totalEvents: 'Eventos totales',
      ticketsSold: 'Boletos vendidos',
      revenue: 'Ingresos',
    },
    recentEvents: 'Tus eventos recientes',
    noEvents: 'Aún no tienes eventos',
    noEventsMessage: 'Comienza creando tu primer evento.',
    loading: 'Cargando estadísticas...',
    sold: 'vendidos',
    full: 'lleno',
  },

  // Validation Messages
  validation: {
    titleRequired: 'El título es obligatorio',
    titleTooLong: 'El título no debe exceder 300 caracteres',
    descriptionRequired: 'La descripción es obligatoria',
    dateRequired: 'La fecha del evento es obligatoria',
    dateFuture: 'La fecha del evento debe ser en el futuro',
    ticketTypesRequired: 'Debes agregar al menos un tipo de boleto',
    ticketNameRequired: 'Todos los tipos de boleto deben tener un nombre',
    ticketNamesUnique: 'Los nombres de los tipos de boleto deben ser únicos',
    ticketPriceNegative: 'El precio del boleto no puede ser negativo',
    ticketPriceInvalid: 'El precio debe ser un número válido',
    ticketQuantityMin: 'La cantidad de boletos debe ser al menos 1',
    ticketQuantityInvalid: 'La cantidad debe ser un número entero válido',
  },

  // Error Messages
  errors: {
    createFailed: 'No se pudo crear el evento',
    loadFailed: 'Error al cargar los eventos. Intenta de nuevo más tarde.',
    notFound: 'El evento solicitado no existe',
    unauthorized: 'No tienes permiso para realizar esta acción',
  },
};
