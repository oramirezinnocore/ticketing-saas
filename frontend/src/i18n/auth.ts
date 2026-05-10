/**
 * Authentication and Authorization Texts (Spanish - Mexico)
 */

export const authTexts = {
  // Login Page
  login: {
    title: 'Iniciar sesión',
    emailLabel: 'Correo electrónico',
    emailPlaceholder: 'tu@ejemplo.com',
    passwordLabel: 'Contraseña',
    passwordPlaceholder: 'Ingresa tu contraseña',
    submitButton: 'Iniciar sesión',
    noAccount: '¿No tienes cuenta?',
    registerLink: 'Crear cuenta',
    loading: 'Iniciando sesión...',
  },

  // Register Page
  register: {
    title: 'Crear cuenta',
    nameLabel: 'Nombre completo',
    namePlaceholder: 'Juan Pérez',
    emailLabel: 'Correo electrónico',
    emailPlaceholder: 'tu@ejemplo.com',
    passwordLabel: 'Contraseña',
    passwordPlaceholder: 'Mínimo 8 caracteres',
    confirmPasswordLabel: 'Confirmar contraseña',
    confirmPasswordPlaceholder: 'Repite tu contraseña',
    submitButton: 'Crear cuenta',
    hasAccount: '¿Ya tienes cuenta?',
    loginLink: 'Iniciar sesión',
    passwordHint: 'Debe tener al menos 8 caracteres con mayúscula, minúscula y número',
    loading: 'Creando cuenta...',
  },

  // Validation Messages
  validation: {
    emailRequired: 'El correo electrónico es obligatorio',
    emailInvalid: 'Ingresa un correo electrónico válido',
    passwordRequired: 'La contraseña es obligatoria',
    passwordMinLength: 'La contraseña debe tener al menos 8 caracteres',
    passwordUppercase: 'La contraseña debe contener al menos una mayúscula',
    passwordLowercase: 'La contraseña debe contener al menos una minúscula',
    passwordNumber: 'La contraseña debe contener al menos un número',
    passwordMismatch: 'Las contraseñas no coinciden',
    confirmPasswordRequired: 'Por favor confirma tu contraseña',
    nameRequired: 'El nombre es obligatorio',
    nameTooLong: 'El nombre es demasiado largo',
  },

  // Error Messages
  errors: {
    invalidCredentials: 'Correo o contraseña incorrectos',
    userExists: 'Ya existe una cuenta con este correo electrónico',
    registrationFailed: 'No se pudo crear la cuenta. Intenta de nuevo',
    loginFailed: 'No se pudo iniciar sesión. Intenta de nuevo',
    noTokenReceived: 'Error de autenticación - no se recibió token',
    invalidUserData: 'Error de autenticación - datos de usuario inválidos',
    authFailed: 'No se pudo completar la autenticación',
    serverError: 'Respuesta inválida del servidor',
    sessionExpired: 'Tu sesión ha expirado. Por favor inicia sesión de nuevo',
    unauthorized: 'No autorizado',
  },

  // Unauthorized Page
  unauthorized: {
    title: 'Acceso denegado',
    message: 'No tienes permiso para acceder a esta página',
    whyTitle: '¿Por qué veo esto?',
    reason1: 'Esta página requiere permisos especiales (ej. rol de organizador o administrador)',
    reason2: 'Tu cuenta actual no tiene el rol requerido',
    reason3: 'Puede que necesites contactar a soporte para actualizar tu cuenta',
    explanation:
      'Esta sección está restringida a usuarios con roles específicos. Si crees que esto es un error, contacta al administrador.',
    goHome: 'Ir al inicio',
    goBack: 'Volver',
  },
};
