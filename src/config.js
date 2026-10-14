import 'dotenv/config';

/**
 * Configuración central de la integración.
 *
 * Todo lo que suele pedir el desafío de certificación está acá, para que lo
 * ajustes en un solo lugar cuando leas los criterios oficiales en
 * "Empezar certificación". Si los criterios piden otra cosa, cambiá estos valores.
 */

function required(name) {
  const value = process.env[name];
  if (!value) {
    console.error(`Falta la variable de entorno ${name}. Revisá tu archivo .env (ver .env.example).`);
    process.exit(1);
  }
  return value;
}

function accessToken() {
  const value = required('MP_ACCESS_TOKEN').trim();
  if (!/^(APP_USR|TEST)-[\w-]+$/.test(value)) {
    // Pistas para encontrar el error sin mostrar el token
    const bad = value.search(/[^\w-]/);
    const hint = bad >= 0
      ? `carácter inválido en la posición ${bad}: U+${value.codePointAt(bad).toString(16).toUpperCase().padStart(4, '0')} ${JSON.stringify(value[bad])}`
      : `empieza con ${JSON.stringify(value.slice(0, 8))} (debería empezar con "APP_USR-" o "TEST-")`;
    console.error(`MP_ACCESS_TOKEN tiene un formato inválido (${value.length} caracteres; ${hint}). Pegá solo el token, sin comillas ni "MP_ACCESS_TOKEN=".`);
    process.exit(1);
  }
  return value;
}

export const env = {
  accessToken: accessToken(),
  // Public Key de prueba: la usa el SDK JS del frontend (Wallet Brick). Es pública por diseño.
  publicKey: process.env.MP_PUBLIC_KEY?.trim() || undefined,
  // En Render, RENDER_EXTERNAL_URL se define sola con la URL pública del servicio.
  baseUrl: (process.env.BASE_URL || process.env.RENDER_EXTERNAL_URL || required('BASE_URL')).replace(/\/+$/, ''),
  port: Number(process.env.PORT || 3000),
  // Integrator ID que asigna el desafío de certificación (no es secreto)
  integratorId: process.env.MP_INTEGRATOR_ID || 'dev_24c65fb163bf11ea96500242ac130004',
  webhookSecret: process.env.MP_WEBHOOK_SECRET || undefined,
  testPayerEmail: process.env.TEST_PAYER_EMAIL || 'test_user@testuser.com',
};

/** Producto de la tienda de ejemplo. */
export const product = {
  id: '1234',
  title: 'Monitor de temperatura IoT (ESP32)',
  description: 'Sensor de temperatura con alertas por WhatsApp para heladeras comerciales',
  // Debe ser una URL pública (https) para que Mercado Pago muestre la imagen.
  pictureUrl: null, // si es null se usa `${BASE_URL}/img/producto.svg`
  categoryId: 'electronics',
  unitPrice: 15000,
  currencyId: 'ARS',
};

/** Reglas de medios de pago. Ajustalas según los criterios de la certificación. */
export const paymentRules = {
  // Ej.: [{ id: 'visa' }] para excluir Visa
  excludedPaymentMethods: [],
  // Ej.: [{ id: 'ticket' }] para excluir pagos en efectivo
  excludedPaymentTypes: [],
  // Máximo de cuotas ofrecidas
  maxInstallments: 6,
  // true: el pago se aprueba o rechaza al instante (sin estado pendiente)
  binaryMode: true,
  // Horas que la preferencia sigue vigente desde que se crea
  preferenceTtlHours: 24,
  // Días para pagar un medio offline (efectivo) antes de que venza
  offlinePaymentDays: 3,
};

/** Texto que ve el comprador en el resumen de la tarjeta (máx. 13 caracteres aprox.). */
export const statementDescriptor = 'MI TIENDA IOT';
