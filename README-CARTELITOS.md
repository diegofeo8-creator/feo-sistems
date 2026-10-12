# Cartelitos de oferta + redes (MercadoLibre / Facebook Marketplace)

## Qué se agregó

1. **Componente nuevo**  
   `components/catalogo/ProductOfferCard.tsx`  
   - Precio destacado (con precio tachado opcional)  
   - Nota de descuento por transferencia/depósito  
   - Acordeón de otros medios de pago  
   - Botones a MercadoLibre y Facebook Marketplace (solo si el artículo tiene los links)

2. **Página de detalle actualizada**  
   `app/catalogo/[slug]/page.tsx`  
   - El cartelito se muestra **debajo de las fotos** (columna izquierda)  
   - Se leen los nuevos campos de Supabase

---

## Pasos para activarlo

### 1. Agregar columnas en Supabase

En la tabla **`articulos_categoria`** agregá estas columnas (todas `text`, nullable):

| Nombre de columna              | Uso                                      |
|--------------------------------|------------------------------------------|
| `mercadolibre_url`             | Link de la publicación en MercadoLibre   |
| `facebook_marketplace_url`     | Link de la publicación en FB Marketplace |
| `original_price` *(opcional)*  | Precio tachado (antes del descuento)     |
| `discount_note` *(opcional)*   | Texto personalizado del descuento        |

Cómo hacerlo:
1. Entrá al Table Editor de Supabase
2. Tabla `articulos_categoria`
3. Botón **+** (agregar columna)
4. Nombre exacto como arriba, tipo **text**, dejá nullable

### 2. Copiar los archivos al proyecto

Reemplazá / agregá:

```
components/catalogo/ProductOfferCard.tsx   ← NUEVO
app/catalogo/[slug]/page.tsx              ← REEMPLAZAR
```

### 3. Cargar los links en cada producto

En el Table Editor, en cada fila de `articulos_categoria` completá:

- `mercadolibre_url` → ej: `https://articulo.mercadolibre.com.ar/...`
- `facebook_marketplace_url` → ej: `https://www.facebook.com/marketplace/item/...`

Si un producto no tiene uno de los dos links, ese botón simplemente no aparece.

### 4. Deploy

Subí los cambios a Vercel (o hacé push a tu repo). Listo.

---

## Comportamiento

- Si **no** hay links de ML ni FB → se muestra un mensaje: “Publicación disponible solo en esta web…”
- Si hay al menos un link → se muestra la sección “Ver publicación original” con los botones correspondientes.
- El descuento por defecto es “Incluye 10% de descuento por pago con depósito o transferencia.”  
  Podés cambiarlo por producto con la columna `discount_note`.

---

## Personalización rápida

En `ProductOfferCard.tsx` podés editar:

- Los textos de los medios de pago
- Colores de los botones de ML / Facebook
- El mensaje por defecto del descuento
