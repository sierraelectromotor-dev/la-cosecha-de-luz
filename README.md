# 🥑 La Cosecha de Luz - Minimarket (Cartagena)

Aplicación Web Progresiva (PWA) de comercio electrónico para venta de frutas, verduras, tubérculos y minimarket enfocada en conjuntos residenciales de Cartagena (Parque Heredia, La Carolina, Ciudad Jardín, Calicanto y alrededores).

---

## 🚀 Características Principales

1. **Portal de Clientes con Imagen Tropical & Fresca:**
   - Paleta tropical de Cartagena (verde palma, amarillo sol, naranja mango).
   - Banner de promociones del día (Combos de Sancocho, Ensaladas, Desayunos).
   - Venta por múltiples unidades: **Kilogramo (kg), Libra (500g), 250g, Unidad, Atado, Bandeja o Docena**.
   - **Motor de Venta por Oportunidad (Cross-Selling Inteligente):** recomienda automáticamente productos complementarios con frases persuasivas según los hábitos culinarios del Caribe (ej. si llevas plátano verde, te ofrece queso costeño; si llevas tomate y cebolla, te ofrece cilantro fresco; si llevas frutas, te ofrece avena en hojuelas).
   - **Checkout para Conjuntos:** selector directo de conjuntos de Parque Heredia (*Coral, Amaneceres, Flamingo, Malibú, Sabana, Vívelo*), La Carolina y Ciudad Jardín, con indicación de Torre/Apto o Manzana/Casa.
   - **Cierre y Envío por WhatsApp:** envía el pedido formateado con desglose y totales directo al WhatsApp de la tienda.

2. **Acceso PWA sin Instalación Previa:**
   - Funciona directo en el navegador web.
   - Cuenta con banner inteligente y modal instructivo para instalar el acceso directo en 1 clic en Android y iPhone/iPad.

3. **Portal de Administración Protegido por PIN y Roles (`/admin`):**
   - **Pantalla de Seguridad (Lockscreen):** solo personas autorizadas con PIN numérico pueden ingresar.
   - **Control de Acceso Basado en Roles:**
     - 👑 **Administrador (Master):** control total de métricas, productos, precios, costos, finanzas, roles y cambio de PINs.
     - 🧺 **Tendero / Alistador:** acceso al flujo de alistamiento de pedidos y carga de inventario físico.
     - 🛵 **Repartidor / Domiciliario:** vista enfocada en pedidos despachados, direcciones de conjuntos, citófonos y cobro contra entrega.

4. **Módulo de Inventario con Carga Automática:**
   - Registro de entradas de mercancía (proveedor, fecha, costo de compra, precio de venta y cantidad).
   - Se carga automáticamente al stock disponible para la venta inmediata.
   - Cálculo en tiempo real del margen bruto de ganancia comercial.

---

## 🔐 PINs de Seguridad Predeterminados

| Rol | PIN por Defecto | Permisos |
| :--- | :---: | :--- |
| **Administrador** | `2026` | Acceso total (Dashboard, Pedidos, Productos, Inventario, Roles, Configuración) |
| **Tendero / Alistador** | `1234` | Alistamiento de pedidos e ingresos a inventario |
| **Repartidor** | `5678` | Ruta de despacho y direcciones de entrega |

> 💡 **Nota:** El administrador puede cambiar estos PINs en cualquier momento dentro de `/admin` en la pestaña **"Configuración Tienda & PINs"**.

---

## 🛠️ Ejecución Local

```bash
# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev

# Compilar para producción
npm run build
```

Abre en tu navegador:
* **Tienda para Clientes:** [http://localhost:3000](http://localhost:3000)
* **Portal de Administración:** [http://localhost:3000/admin](http://localhost:3000/admin)

---

## ☁️ Despliegue en Vercel

El proyecto está 100% optimizado para Vercel:
1. Sube tu código a un repositorio de GitHub, GitLab o Bitbucket.
2. Ingresa a [vercel.com](https://vercel.com) y selecciona **"Add New Project"**.
3. Importa el repositorio.
4. Presiona **"Deploy"** (Vercel detecta Next.js automáticamente sin configuraciones adicionales).
