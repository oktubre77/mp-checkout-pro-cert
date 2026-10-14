# Certificación Checkout Pro – Mercado Pago (Node.js)

Tienda mínima con **Checkout Pro** para hacer el desafío práctico de la certificación del
Partners Program de Mercado Pago:
https://www.mercadopago.com.ar/partners/developers/es/certifications/checkout-pro

Incluye:

- Preferencia completa: ítem con `id`, `title`, `description`, `picture_url`, `category_id`,
  `quantity`, `unit_price` y `currency_id`, más datos del `payer`.
- `back_urls` (success / failure / pending) y `auto_return: approved`.
- `notification_url` con webhook que consulta el pago y lo registra en `logs/webhooks.log`.
- `external_reference` única por orden y `statement_descriptor`.
- Reglas de medios de pago configurables (exclusiones y cuotas máximas).
- `integratorId` opcional (Partners Program).
- Validación de la firma `x-signature` del webhook (si configurás la clave secreta).
- Páginas de resultado que muestran el **Payment ID** para enviarlo en la certificación.

## Estructura

```
src/
  config.js        ← lo que se ajusta según los criterios de la certificación
  mercadopago.js   ← cliente del SDK oficial
  preference.js    ← arma y crea la preferencia
  webhooks.js      ← recibe notificaciones y valida la firma
  server.js        ← Express: tienda, API, back_urls y webhook
public/            ← página de la tienda
```

## Paso a paso

### 1. Leer los criterios
Iniciá sesión en Mercado Pago Developers, abrí la página de la certificación y hacé clic en
**Empezar certificación**. Anotá todo lo que piden (campos de la preferencia, exclusiones de
medios de pago, cuotas, etc.) y ajustalo en `src/config.js`.

### 2. Cuenta y credenciales de prueba
1. En **Tus integraciones**, creá una aplicación de tipo **Checkout Pro**.
2. Creá **dos usuarios de prueba**: uno **vendedor** y uno **comprador**.
3. Entrá con el usuario **vendedor** y copiá su **Access Token** de prueba.

### 3. Instalar
```bash
cd C:\German\mp-checkout-pro-cert
npm install
copy .env.example .env
```
Completá el `.env` con el Access Token y el email del comprador de prueba.

### 4. URL pública
Mercado Pago necesita una URL pública para el webhook y las `back_urls`. La forma rápida es
**ngrok**:
```bash
ngrok http 3000
```
Copiá la URL `https://...ngrok-free.app` en `BASE_URL` del `.env`.
(Alternativa: publicar el proyecto en Render, con las mismas variables de entorno.)

### 5. Correr
```bash
npm start
```
Abrí tu `BASE_URL` en el navegador.

### 6. Hacer el pago de prueba
1. Abrí una ventana de **incógnito** e iniciá sesión con el usuario **comprador** de prueba.
2. En la tienda, tocá **Pagar con Mercado Pago**.
3. Pagá con una **tarjeta de prueba** (están en la documentación de Mercado Pago, sección
   "Tarjetas de prueba"). El nombre del titular define el resultado: `APRO` = aprobado.
4. Al volver a la tienda vas a ver el **Payment ID**. También queda en `logs/webhooks.log`.

### 7. Enviar el Payment ID
Pegá el Payment ID en la página de la certificación. El resultado es inmediato.
Si falla, el mensaje indica qué campo falta: ajustá `src/config.js` y repetí el pago.

## Notas
- No subas el `.env` a ningún repositorio.
- Este proyecto usa solo credenciales y usuarios de prueba.
- Sirve también como pieza de portfolio: podés publicarlo en GitHub sin el `.env`.
