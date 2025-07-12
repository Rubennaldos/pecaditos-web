
# 🍪 Pecaditos Integrales - Landing Page

Página de bienvenida moderna y responsive para **Pecaditos Integrales**, una marca de galletas artesanales integrales.

## ✨ Características

### 🎨 Diseño
- **Responsive**: Optimizado para desktop, tablet y móvil
- **Modo oscuro/claro**: Detección automática con toggle manual
- **Animaciones suaves**: Efectos hover, transiciones y micro-interacciones
- **Colores marca**: Paleta tierra y amber (beige, naranja, rojo)
- **Tipografía**: Inter (sans-serif) + Playfair Display (display)

### 🚀 Funcionalidades
- **Landing principal** con logo, eslogan y texto editable
- **Cards animadas** para Catálogo y Login (con efectos hover)
- **Modal de seguimiento** de pedidos por número (simulado)
- **Redes sociales** con enlaces a WhatsApp, Instagram, Facebook, TikTok
- **Footer completo** con información legal y contacto
- **Configuración Firebase** lista para implementar

## 🛠️ Tecnologías

- **React 18** + **TypeScript**
- **Vite** (build tool)
- **Tailwind CSS** (estilos)
- **Shadcn/ui** (componentes)
- **Lucide React** (iconos)
- **Firebase** (preparado para auth + database)

## 📁 Estructura del Proyecto

```
src/
├── components/
│   ├── layout/
│   │   ├── Header.tsx          # Header móvil
│   │   └── Footer.tsx          # Footer con info legal
│   ├── sections/
│   │   ├── HeroSection.tsx     # Logo, eslogan, texto
│   │   ├── MainCards.tsx       # Cards catálogo y login
│   │   ├── OrderTracking.tsx   # Botón seguimiento
│   │   └── SocialMedia.tsx     # Redes sociales
│   └── modals/
│       └── OrderTrackingModal.tsx # Modal seguimiento
├── config/
│   └── firebase.ts             # Configuración Firebase
├── services/
│   └── firebaseService.ts      # Servicios Firebase
├── data/
│   └── mockData.ts             # Datos de prueba
├── hooks/
│   └── useAuth.tsx             # Hook autenticación
└── pages/
    └── Index.tsx               # Página principal
```

## 🚀 Instalación y Uso

1. **Clonar e instalar dependencias**:
```bash
npm install
```

2. **Ejecutar en desarrollo**:
```bash
npm run dev
```

3. **Ver en el navegador**:
```
http://localhost:8080
```

## ⚙️ Configuración

### 🔥 Firebase (Próxima Etapa)
Para habilitar autenticación y base de datos:

1. Crear proyecto en [Firebase Console](https://console.firebase.google.com)
2. Activar **Authentication** (Email/Password)
3. Activar **Realtime Database**
4. Copiar configuración en `src/config/firebase.ts`
5. Configurar reglas de seguridad

### 🎨 Personalización

#### Textos Editables
En `src/components/sections/HeroSection.tsx`:
```tsx
// Cambiar eslogan principal
<h1>Pecaditos Integrales</h1>
<p>Sabor auténtico, salud natural</p>

// Cambiar texto de bienvenida  
<p>Descubre nuestras galletas artesanales...</p>

// Cambiar frase motivacional
<blockquote>"Porque cuidarte nunca fue tan delicioso"</blockquote>
```

#### Colores de Marca
En `src/index.css` - variables CSS:
```css
:root {
  --primary: 35 91% 48%; /* Amber principal */
  --secondary: 37 39% 91%; /* Amber claro */
  /* ... más colores */
}
```

#### Redes Sociales
En `src/components/sections/SocialMedia.tsx`:
```tsx
const socialLinks = [
  {
    name: 'WhatsApp',
    url: 'https://wa.me/51999999999', // ← Cambiar número
    // ...
  }
  // ... más redes
];
```

## 🧪 Datos de Prueba

### Seguimiento de Pedidos
Números para probar el modal:
- `ORD001` - Pedido en camino
- `ORD002` - Pedido entregado

### Mock Data
Ver `src/data/mockData.ts` para:
- Productos de ejemplo
- Usuarios de prueba  
- Pedidos simulados
- Configuración de descuentos

## 📱 Funcionalidades Implementadas

### ✅ Completado
- [x] Landing page responsive
- [x] Cards animadas (Catálogo + Login)
- [x] Modal seguimiento pedidos
- [x] Redes sociales interactivas
- [x] Footer completo con enlaces legales
- [x] Modo oscuro/claro automático
- [x] Configuración Firebase base
- [x] Mock data y estructura modular

### 🔄 Próxima Etapa
- [ ] Página de catálogo de productos
- [ ] Carrito de compras sticky
- [ ] Sistema de login/registro
- [ ] Checkout y pasarela de pagos
- [ ] Dashboard de pedidos

## 🎯 Notas de Desarrollo

### Mock Data
Los datos de prueba están en `src/data/mockData.ts`. Incluye:
- **Productos**: galletas con precios, categorías, ingredientes
- **Usuarios**: datos de ejemplo con historial
- **Pedidos**: estados, números de seguimiento
- **Configuración**: descuentos, distritos permitidos

### Servicios Firebase
En `src/services/firebaseService.ts` están preparadas las funciones:
- Autenticación (login, registro, logout)
- Productos (obtener, filtrar)
- Pedidos (crear, actualizar, buscar)
- Usuarios (perfil, historial)

### Componentes Modulares
Cada sección está en su propio archivo para fácil mantenimiento y personalización.

## 🚀 Deploy

```bash
# Build para producción
npm run build

# Preview del build
npm run preview
```

---

## 📞 Contacto y Soporte

Para preguntas sobre implementación o personalización, contactar al equipo de desarrollo.

**¡Listo para la siguiente etapa!** 🎉
