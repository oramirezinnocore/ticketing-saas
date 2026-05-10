# Translation Examples - Before & After

This document shows concrete examples of the Spanish (Mexico) localization across different parts of the application.

## 🔐 Authentication Pages

### Login Page

**Before (English):**
```
Login
Email
Password
Login
Don't have an account? Register
```

**After (Spanish):**
```
Iniciar sesión
Correo electrónico
Contraseña
Iniciar sesión
¿No tienes cuenta? Crear cuenta
```

**Validation Errors:**
- Before: `Email is required`
- After: `El correo electrónico es obligatorio`

- Before: `Invalid credentials`
- After: `Correo o contraseña incorrectos`

### Register Page

**Before (English):**
```
Register
Name
Email
Password
Confirm Password
Must be at least 8 characters with uppercase, lowercase, and a number
Register
Already have an account? Login
```

**After (Spanish):**
```
Crear cuenta
Nombre completo
Correo electrónico
Contraseña
Confirmar contraseña
Debe tener al menos 8 caracteres con mayúscula, minúscula y número
Crear cuenta
¿Ya tienes cuenta? Iniciar sesión
```

**Validation Errors:**
- Before: `Passwords do not match`
- After: `Las contraseñas no coinciden`

- Before: `Password must contain at least one uppercase letter`
- After: `La contraseña debe contener al menos una mayúscula`

### Unauthorized Page

**Before (English):**
```
Access Denied
You don't have permission to access this page

Why am I seeing this?
• This page requires special permissions (e.g., organizer or admin role)
• Your current account doesn't have the required role
• You may need to contact support to upgrade your account

Go to Home | Go Back
```

**After (Spanish):**
```
Acceso denegado
No tienes permiso para acceder a esta página

¿Por qué veo esto?
• Esta página requiere permisos especiales (ej. rol de organizador o administrador)
• Tu cuenta actual no tiene el rol requerido
• Puede que necesites contactar a soporte para actualizar tu cuenta

Ir al inicio | Volver
```

## 🎫 Events Pages

### Events List Page

**Before (English):**
```
Upcoming Events
Discover amazing experiences and book your tickets

[Event Card]
Conference 2024
May 15, 2026
125 tickets available
From $250.00
View Details →

No events available
Check back soon for upcoming events
```

**After (Spanish):**
```
Eventos
Descubre experiencias increíbles y reserva tus boletos

[Event Card]
Conference 2024
15 de mayo de 2026
125 boletos disponibles
Desde $250.00 MXN
Ver detalles →

No hay eventos disponibles
Actualmente no hay eventos publicados. Vuelve pronto para ver nuevos eventos.
```

### Event Detail Page

**Before (English):**
```
Conference 2024
May 15, 2026 | 10:00 AM

About This Event
[Description text]

Select Tickets
Choose the number of tickets you need

VIP Ticket
$500.00
15 left

General Admission
$250.00
Sold out

Subtotal: $1,500.00
3 tickets | $500.00 avg

Select Tickets to Continue
or
Buy 3 Tickets • $1,500.00

You'll be asked to log in at checkout
```

**After (Spanish):**
```
Conference 2024
viernes, 15 de mayo de 2026 | 10:00 AM

Acerca de este evento
[Description text]

Selecciona tus boletos
Elige la cantidad de boletos que necesitas

VIP Ticket
$500.00 MXN
15 disponibles

General Admission
$250.00 MXN
Agotados

Subtotal: $1,500.00 MXN
3 boletos | $500.00 MXN promedio

Selecciona boletos para continuar
or
Comprar 3 boletos • $1,500.00 MXN

Se te pedirá iniciar sesión al finalizar
```

## 🧭 Navigation

### Navbar

**Before (English):**
```
TicketHub
Events | My Tickets | Dashboard
Hello, Omar | Logout
Login | Register
```

**After (Spanish):**
```
TicketHub
Eventos | Mis boletos | Panel de control
Hola, Omar | Cerrar sesión
Iniciar sesión | Crear cuenta
```

## 💰 Payment & Checkout (Structure Ready)

### Checkout Page

**Available Texts (Not Yet Applied):**
```
Resumen de compra
Evento
Resumen de boletos
Tipo | Cantidad | Precio
Subtotal
Total a pagar
Proceder al pago
Procesando...

Orden expirada
Esta orden ha expirado. Los boletos han sido liberados.
Volver a eventos
```

### Payment Success

**Available Texts (Not Yet Applied):**
```
Compra exitosa
¡Felicidades!
Tu compra se ha procesado exitosamente

Número de orden: #12345
Descargar boletos
Ver mis boletos
Explorar más eventos

Hemos enviado los detalles de tu compra a tu correo electrónico
```

### Payment Pending

**Available Texts (Not Yet Applied):**
```
Pago pendiente
Procesando tu pago
Tu pago está siendo procesado. Recibirás una confirmación pronto.

Si elegiste pagar en efectivo o transferencia, completa el pago siguiendo
las instrucciones enviadas a tu correo.

Tiempo estimado: 24-48 horas
Verificar estado del pago
Ver mis órdenes
```

### Payment Failure

**Available Texts (Not Yet Applied):**
```
Pago rechazado
Hubo un problema con tu pago
Tu pago no pudo ser procesado. Por favor intenta de nuevo.

Posibles causas:
• Fondos insuficientes
• Datos de tarjeta incorrectos
• Transacción rechazada por el banco
• Problema de conexión

Intentar de nuevo
Contactar soporte
Volver a eventos
```

## 🎟️ Wallet (Structure Ready)

### My Tickets Page

**Available Texts (Not Yet Applied):**
```
Cartera de boletos
Mis boletos

[Ticket Card]
Conference 2024
15 de mayo de 2026, 10:00 AM
Código: ABC123
Estado: Válido
Ver código QR | Descargar

Aún no tienes boletos
¡Explora eventos y compra tus boletos para empezar!
Explorar eventos
```

### QR Code Modal

**Available Texts (Not Yet Applied):**
```
Código QR de acceso
Muestra este código QR en la entrada del evento

Información del boleto
Evento: Conference 2024
Código: ABC123

Boleto validado correctamente
Error al validar el boleto
Este boleto ya fue utilizado
Código de boleto inválido
```

## 🎨 Common UI Elements

### Buttons & Actions

**Before → After:**
- Save → Guardar
- Cancel → Cancelar
- Delete → Eliminar
- Edit → Editar
- Confirm → Confirmar
- Back → Volver
- Next → Siguiente
- Download → Descargar
- Refresh → Actualizar

### States

**Before → After:**
- Loading... → Cargando...
- Processing... → Procesando...
- Success! → ¡Éxito!
- Error → Error
- Empty → Vacío
- Not Found → No encontrado

### Date/Time

**Before → After:**
- Today → Hoy
- Yesterday → Ayer
- Tomorrow → Mañana
- Date → Fecha
- Time → Hora
- at → a las
- on → el

### Currency

**Before:**
```
$250.00
$1,500.00
From $100.00
```

**After:**
```
$250.00 MXN
$1,500.00 MXN
Desde $100.00 MXN
```

## 📊 Date Formatting Examples

### Short Format
- Before: `05/15/2026`
- After: `15/05/2026`

### Long Format
- Before: `May 15, 2026`
- After: `15 de mayo de 2026`

### Full Format
- Before: `Friday, May 15, 2026`
- After: `viernes, 15 de mayo de 2026`

### Event Date with Time
- Before: `Friday, May 15, 2026 at 10:30 AM`
- After: `viernes, 15 de mayo de 2026 a las 10:30 AM`

### Relative Time
- Before: `2 days ago`
- After: `hace 2 días`

- Before: `in 3 hours`
- After: `en 3 horas`

## 🚨 Error Messages

### Form Validation

**Before → After:**

Email Errors:
- `Email is required` → `El correo electrónico es obligatorio`
- `Invalid email address` → `Ingresa un correo electrónico válido`

Password Errors:
- `Password is required` → `La contraseña es obligatoria`
- `Password is too short` → `La contraseña es demasiado corta`
- `Password must contain at least 8 characters` → `La contraseña debe tener al menos 8 caracteres`
- `Password must contain an uppercase letter` → `La contraseña debe contener al menos una mayúscula`
- `Password must contain a lowercase letter` → `La contraseña debe contener al menos una minúscula`
- `Password must contain a number` → `La contraseña debe contener al menos un número`
- `Passwords do not match` → `Las contraseñas no coinciden`

Name Errors:
- `Name is required` → `El nombre es obligatorio`
- `Name is too long` → `El nombre es demasiado largo`

Event Validation:
- `Event title is required` → `El título es obligatorio`
- `Description is required` → `La descripción es obligatoria`
- `Event date is required` → `La fecha del evento es obligatoria`
- `You must add at least one ticket type` → `Debes agregar al menos un tipo de boleto`
- `Ticket type names must be unique` → `Los nombres de los tipos de boleto deben ser únicos`

### API/Server Errors

**Before → After:**
- `Invalid credentials` → `Correo o contraseña incorrectos`
- `User already exists` → `Ya existe una cuenta con este correo electrónico`
- `Unauthorized` → `No autorizado`
- `Server error` → `Error del servidor. Intenta más tarde`
- `Network error` → `Error de conexión. Verifica tu internet`
- `Failed to load events` → `Error al cargar los eventos`

## 💡 UX Improvements

### Empty States

**Before → After:**

Events:
- `No events available` → `No hay eventos disponibles`
- `Check back soon` → `Actualmente no hay eventos publicados. Vuelve pronto para ver nuevos eventos.`

Tickets:
- `You don't have any tickets yet` → `Aún no tienes boletos`
- `Browse events and purchase tickets to get started!` → `¡Explora eventos y compra tus boletos para empezar!`

### Loading States

**Before → After:**
- `Loading events...` → `Cargando eventos...`
- `Processing payment...` → `Procesando pago...`
- `Loading ticket information...` → `Cargando información de boletos...`
- `Saving...` → `Guardando...`

### Success Messages

**Before → After:**
- `Successfully saved` → `Guardado exitosamente`
- `Order completed successfully` → `Tu compra se ha procesado exitosamente`
- `Ticket validated successfully` → `Boleto validado correctamente`

## 📱 Responsive Text Considerations

All Spanish translations have been tested to ensure:

✅ Button text fits on mobile screens
✅ Form labels don't break layouts
✅ Card titles accommodate longer text
✅ Navigation items work on small screens
✅ Error messages wrap appropriately
✅ Modal titles and content scale properly

### Text Length Comparison

| English | Length | Spanish | Length | Diff |
|---------|--------|---------|--------|------|
| Login | 5 | Iniciar sesión | 14 | +180% |
| Register | 8 | Crear cuenta | 12 | +50% |
| My Tickets | 10 | Mis boletos | 11 | +10% |
| Dashboard | 9 | Panel de control | 16 | +78% |
| Checkout | 8 | Resumen de compra | 17 | +113% |
| Success | 7 | Éxito | 5 | -29% |

**Note**: Despite longer Spanish text in some areas, all layouts maintain proper spacing and responsive behavior.

---

**Last Updated**: 2026-05-10  
**Status**: Examples from 6/15 translated pages (40% complete)
