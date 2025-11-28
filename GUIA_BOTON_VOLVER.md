# 🔙 Guía del Botón "Volver al Panel"

## 📋 Descripción

El componente `BackToPanelButton` es un botón de navegación inteligente que funciona en **TODOS** los módulos del sistema. Detecta automáticamente el contexto del usuario y lo lleva al panel apropiado.

---

## ✨ Características

- ✅ **Detección automática** de la ruta de retorno
- ✅ **Navegación inteligente** basada en el contexto actual
- ✅ **Fallback seguro** al panel principal
- ✅ **Compatible con todos los módulos** (incluso dentro de modales)
- ✅ **Responsive**: oculta texto en móviles
- ✅ **Z-index alto**: siempre visible por encima de otros elementos
- ✅ **Animaciones suaves**: hover con escala y sombra

---

## 🎯 Uso Básico

### Modo Automático (Recomendado)

El botón detecta automáticamente a dónde volver:

```tsx
import { BackToPanelButton } from '@/components/ui/back-to-panel-button';

function MiModulo() {
  return (
    <div>
      <BackToPanelButton />
      {/* Tu contenido */}
    </div>
  );
}
```

El botón analizará:
1. La ruta actual (ej: `/pedidos` → va a `/panel-control`)
2. El rol del usuario (ej: `delivery` → va a `/delivery`)
3. Fallback seguro → `/panel-control`

---

## 🎨 Variantes de Uso

### Con Ruta Personalizada

Si necesitas ir a una ruta específica:

```tsx
<BackToPanelButton to="/mi-ruta-personalizada" />
```

### Con Etiqueta Personalizada

```tsx
<BackToPanelButton label="Volver al Inicio" />
```

### Con Ícono de Home

```tsx
<BackToPanelButton showHome={true} />
```

### Con Variante de Estilo

```tsx
<BackToPanelButton variant="outline" />
// Opciones: 'default' | 'ghost' | 'outline'
```

### Ejemplo Completo

```tsx
<BackToPanelButton 
  to="/dashboard"
  label="Volver al Dashboard"
  variant="outline"
  showHome={true}
/>
```

---

## 🗺️ Mapeo Inteligente de Rutas

El botón tiene un mapeo inteligente incorporado:

| Ruta Actual | Destino |
|-------------|---------|
| `/pedidos`, `/orders` | `/panel-control` |
| `/produccion`, `/production` | `/panel-control` |
| `/delivery`, `/despacho` | `/panel-control` |
| `/billing`, `/facturacion` | `/panel-control` |
| `/logistics`, `/logistica` | `/panel-control` |
| `/catalogo`, `/catalog` | `/panel-control` |
| `/tracking`, `/seguimiento` | `/panel-control` |
| `/mayorista`, `/wholesale` | `/panel-control` |

**Nota**: También funciona con rutas con parámetros (ej: `/pedidos/123`)

---

## 🎭 Detección por Rol

Si el mapeo de rutas no encuentra coincidencia, usa el rol del usuario:

| Rol | Destino |
|-----|---------|
| `admin`, `adminGeneral` | `/panel-control` |
| `production` | `/produccion` |
| `delivery` | `/delivery` |
| `billing` | `/billing` |
| `logistics` | `/logistica` |

---

## 🛡️ Seguridad y Fallbacks

El componente tiene múltiples niveles de seguridad:

1. **Try-catch en useAuth**: Si falla, continúa sin perfil
2. **Navegación segura**: Si navigate() falla, usa window.location.href
3. **Fallback final**: Siempre tiene una ruta de respaldo (`/panel-control`)

```typescript
try {
  navigate(route);
} catch (error) {
  console.error('Error al navegar:', error);
  window.location.href = '/panel-control'; // Fallback nativo
}
```

---

## 📱 Diseño Responsive

- **Desktop**: Muestra ícono + texto
- **Móvil**: Solo muestra ícono (ahorra espacio)

```tsx
<span className="hidden sm:inline">{label}</span>
```

---

## 🎨 Estilos y Animaciones

El botón tiene un diseño moderno y atractivo:

- **Fondo**: Blanco semi-transparente con blur
- **Borde**: Sutil y elegante
- **Sombra**: Aumenta en hover
- **Animación**: Escala 1.05x en hover
- **Transición**: Suave (200ms)

```css
className="fixed top-4 left-4 z-[100] 
  bg-white/95 backdrop-blur-sm 
  hover:bg-white border border-stone-200 
  shadow-lg hover:shadow-xl 
  transition-all duration-200 hover:scale-105"
```

---

## 🔧 Casos de Uso Comunes

### 1. Panel de Pedidos

```tsx
// src/pages/OrdersPanel.tsx
function OrdersPanel() {
  return (
    <div>
      <BackToPanelButton /> {/* Auto-detecta: va a /panel-control */}
      <h1>Gestión de Pedidos</h1>
      {/* ... */}
    </div>
  );
}
```

### 2. Panel de Delivery

```tsx
// src/pages/DeliveryPanel.tsx
function DeliveryPanel() {
  return (
    <div>
      <BackToPanelButton label="Volver" /> {/* Personalizado */}
      <h1>Entregas</h1>
      {/* ... */}
    </div>
  );
}
```

### 3. Módulo de Admin

```tsx
// src/components/admin/SomeModule.tsx
function AdminModule() {
  return (
    <div>
      <BackToPanelButton to="/panel-control" /> {/* Ruta explícita */}
      <h1>Configuración Admin</h1>
      {/* ... */}
    </div>
  );
}
```

### 4. Dentro de un Modal

```tsx
// Funciona incluso dentro de modales gracias al z-index alto
function MyModal({ isOpen, onClose }) {
  return (
    <Dialog open={isOpen}>
      <DialogContent>
        <BackToPanelButton /> {/* Visible por encima del modal */}
        {/* ... */}
      </DialogContent>
    </Dialog>
  );
}
```

---

## 🐛 Solución de Problemas

### El botón no aparece

**Causa**: Z-index muy bajo
**Solución**: El componente usa `z-[100]`, debería estar visible. Verifica que no haya elementos con z-index superior.

### El botón lleva a la ruta incorrecta

**Solución 1**: Usar ruta explícita
```tsx
<BackToPanelButton to="/mi-ruta-correcta" />
```

**Solución 2**: Agregar mapeo en el componente
Edita `src/components/ui/back-to-panel-button.tsx` y añade tu ruta al `routeMap`.

### Error "useAuth must be used within AuthProvider"

**Causa**: El componente está fuera del AuthProvider
**Solución**: El componente ya tiene un try-catch que maneja esto. Si persiste, verifica que tu app esté envuelta en `<AuthProvider>`.

---

## 📝 Notas Adicionales

### ¿Por qué no usar un simple navigate(-1)?

`navigate(-1)` vuelve a la página anterior del historial, pero:
- ❌ Puede llevar al usuario fuera del sistema
- ❌ No considera el contexto del usuario
- ❌ Puede ser confuso si llegó desde un enlace externo

`BackToPanelButton` es **inteligente** y **predecible**.

### Personalización Avanzada

Si necesitas comportamiento totalmente personalizado:

```tsx
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

function CustomBackButton() {
  const navigate = useNavigate();
  
  const handleClick = () => {
    // Tu lógica personalizada
    if (condicion) {
      navigate('/ruta-a');
    } else {
      navigate('/ruta-b');
    }
  };

  return (
    <Button onClick={handleClick} className="fixed top-4 left-4 z-[100]">
      <ArrowLeft className="h-4 w-4 mr-2" />
      Volver
    </Button>
  );
}
```

---

## ✅ Checklist de Implementación

Cuando agregues el botón a un nuevo módulo:

- [ ] Importar el componente
- [ ] Agregarlo al inicio del JSX
- [ ] Probar en desktop y móvil
- [ ] Verificar que la navegación funciona
- [ ] Confirmar que el z-index es apropiado
- [ ] (Opcional) Personalizar label si es necesario

---

## 🎉 Resultado Final

Con este componente, **TODOS** los módulos tienen navegación consistente, inteligente y profesional. El usuario siempre sabe cómo volver al panel principal, sin importar dónde esté.

**Estado**: ✅ FUNCIONANDO EN TODOS LOS MÓDULOS

---

**Última actualización**: 28 de noviembre, 2025  
**Mantenido por**: Equipo Pecaditos Integrales

