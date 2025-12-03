# 🍪 Pecaditos Integrales - Sistema CRM

Sistema de gestión integral (CRM) para **Pecaditos Integrales**, una marca de galletas artesanales integrales. Incluye gestión de pedidos, delivery, producción, cobranzas, y portal mayorista.

## ✨ Módulos del Sistema

### 📦 Módulos Implementados

| Módulo | Estado | Descripción |
|--------|--------|-------------|
| **Dashboard Global** | ✅ Completo | Vista completa del sistema con métricas |
| **Pedidos** | ✅ Completo | Crear, editar, rechazar, historial, QR |
| **Reparto/Delivery** | ✅ Completo | Asignación, tracking, entregas |
| **Producción** | ✅ Completo | Control de inventario y stock |
| **Cobranzas** | ✅ Completo | Facturas, pagos, reportes |
| **Portal Mayorista** | ✅ Completo | Portal dedicado con checkout |
| **Catálogo** | ✅ Completo | Productos minoristas |
| **Catálogos por Cliente** | ✅ Completo | Catálogos personalizados |
| **Ubicaciones** | ✅ Completo | Puntos de venta |
| **Logística** | ✅ Completo | Inventario y compras |
| **Mensajes** | ✅ Completo | Comunicación interna |
| **Auditoría** | ✅ Completo | Logs y seguimiento |
| **Configuración** | ✅ Completo | Sistema y parámetros |

### 🎨 Características de la Landing Page

- **Responsive**: Optimizado para desktop, tablet y móvil
- **Modo oscuro/claro**: Detección automática con toggle manual
- **Animaciones suaves**: Efectos hover, transiciones y micro-interacciones
- **Colores marca**: Paleta tierra y amber (beige, naranja, rojo)

## 🛠️ Tecnologías

- **React 18** + **TypeScript**
- **Vite** (build tool)
- **Tailwind CSS** (estilos)
- **Shadcn/ui** (componentes)
- **Radix UI** (primitivas)
- **Lucide React** (iconos)
- **Firebase** (Auth + Realtime Database + Storage + Functions)
- **TanStack Query** (gestión de estado servidor)
- **React Hook Form** + **Zod** (formularios y validación)
- **Recharts** (gráficos)

## 📁 Estructura del Proyecto

```
src/
├── components/
│   ├── admin/          # Componentes del panel de administración
│   ├── auth/           # Autenticación y rutas protegidas
│   ├── billing/        # Módulo de cobranzas
│   ├── catalog/        # Catálogo de productos
│   ├── clients/        # Gestión de clientes
│   ├── delivery/       # Módulo de delivery
│   ├── layout/         # Header, Footer
│   ├── logistics/      # Módulo de logística
│   ├── orders/         # Gestión de pedidos
│   ├── production/     # Módulo de producción
│   ├── sections/       # Secciones de landing
│   ├── ui/             # Componentes UI (Shadcn)
│   └── wholesale/      # Portal mayorista
├── config/
│   └── firebase.ts     # Configuración Firebase
├── contexts/           # Contextos de React (estado global)
├── hooks/              # Custom hooks
├── lib/                # Utilidades y constantes
│   ├── adminConstants.ts  # Constantes del panel admin
│   ├── logger.ts       # Logger configurable
│   └── utils.ts        # Utilidades generales
├── pages/              # Páginas/Rutas principales
├── services/           # Servicios de Firebase
├── types/              # Tipos TypeScript
└── data/               # Configuración y datos base
```

## 🚀 Instalación y Uso

### Requisitos Previos
- Node.js 18+
- npm o yarn

### Instalación

```bash
# Clonar el repositorio
git clone https://github.com/Rubennaldos/pecaditos-web.git

# Instalar dependencias
cd pecaditos-web
npm install
```

### Desarrollo

```bash
# Iniciar servidor de desarrollo
npm run dev
```

Abrir en el navegador: `http://localhost:5173`

### Producción

```bash
# Build para producción
npm run build

# Preview del build
npm run preview
```

## ⚙️ Configuración de Firebase

El proyecto está configurado con Firebase para:
- **Authentication**: Email/Password
- **Realtime Database**: Datos en tiempo real
- **Storage**: Imágenes de productos
- **Functions**: Facturación electrónica

## 🔐 Sistema de Roles y Permisos

### Roles Disponibles
- **admin/adminGeneral**: Acceso completo a todos los módulos
- **cliente**: Acceso a catálogo y seguimiento de pedidos
- **mayorista**: Acceso a portal mayorista
- **repartidor**: Acceso a módulo de delivery
- **produccion**: Acceso a módulo de producción

### Módulos de Acceso
```typescript
const allModules = [
  'dashboard',
  'catalog',
  'catalogs-admin',
  'orders',
  'tracking',
  'delivery',
  'production',
  'billing',
  'logistics',
  'locations',
  'reports',
  'wholesale'
];
```

## 📊 Flujo de Pedidos

El sistema maneja un flujo profesionalizado de pedidos:

```
Pendiente → En Preparación → Listo → En Ruta → Entregado
                                          ↓
                                      Rechazado
```

### Características del Flujo
- ✅ Correlativo transaccional único (ORD-001, ORD-002...)
- ✅ Facturación electrónica asíncrona
- ✅ Persistencia completa en Firebase RTDB
- ✅ Reindexación automática por estado
- ✅ Inicialización automática de billing

## 🧪 Testing

El proyecto incluye datos de prueba para desarrollo:

### Seguimiento de Pedidos
- `ORD001` - Pedido en camino
- `ORD002` - Pedido entregado

## 📱 PWA Support

El proyecto incluye:
- `manifest.json` configurado
- Iconos para diferentes tamaños
- Configuración de tema

## 🔧 Scripts Disponibles

```bash
npm run dev        # Desarrollo
npm run build      # Build producción
npm run preview    # Preview del build
npm run lint       # Linter
```

## 📝 Logging

El sistema incluye un logger configurable (`src/lib/logger.ts`):
- En desarrollo: muestra todos los logs
- En producción: solo errores críticos

```typescript
import logger from '@/lib/logger';

logger.info('Operación exitosa');
logger.error('Error crítico', error);
logger.orderCreated('ORD-001', 'abc123');
logger.delivery('abc123', 'entregado');
```

## 🚧 Próximas Mejoras Planificadas

- [ ] Tests unitarios y de integración
- [ ] PWA Service Worker completo
- [ ] Integración con pasarela de pagos
- [ ] Notificaciones push
- [ ] Reportes exportables avanzados

---

## 📞 Contacto y Soporte

Para preguntas sobre implementación o personalización, contactar al equipo de desarrollo.

**Desarrollado por**: Alberto Naldos  
**Última actualización**: Diciembre 2025
