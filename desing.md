# Especificación de Diseño y Arquitectura de Información

## 1. Principios de UX (Mobile-First)
- **Regla de los 3 clics:** El usuario debe poder abrir la app, tocar el FAB, escribir el monto y guardar en un flujo natural e inmediato.
- **Inputs Adaptativos:** Los campos de monto deben disparar el teclado numérico (`inputmode="decimal"` o `type="number"`) de forma automática en dispositivos móviles.

## 2. Sistema de Diseño (UI Token)
- **Fondo General:** `#0F172A` (Slate 900 - Modo oscuro por defecto) o un gris ártico quirúrgico.
- **Color Ingresos / Saldo Positivo:** `#10B981` (Emerald 500) - Exclusivo para dinero entrante.
- **Color Gastos / Saldo Negativo:** `#EF4444` (Red 500) o `#DC2626` (Crimson) - Exclusivo para dinero saliente.
- **Botón Flotante (FAB):** Central, circular, posicionado en la parte inferior de la pantalla (`bottom-6`), con un z-index alto para destacar sobre cualquier lista de transacciones.

## 3. Arquitectura de Pantallas e Interacciones


### Pantalla A: Dashboard Principal
- **Zona Superior:** Tarjetas compactas con scroll horizontal si es necesario (Saldo Total | Ingresos | Gastos).
- **Zona Central:** Gráfico de Dona de Tremor (Desglose por categorías) y Gráfico de Barras (Últimos 30 días).
- **Zona Inferior:** Lista de las últimas 5 transacciones con scroll vertical independiente.

### Pantalla B: Modal / Vista de Inserción Rápida (Disparada por el FAB)
- Campo gigante para el Monto (enfocado automáticamente).
- Selector de tipo tipo Toggle: [ GASTO ] [ INGRESO ].
- Grid de botones grandes para Categorías (iconos identificables).
- Botón ancho inferior: "Confirmar Transacción".