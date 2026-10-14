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

export const env = {
  accessToken: required('MP_ACCESS_TOKEN'),
  // En Render, RENDER_EXTERNAL_URL se define sola con la URL pública del servicio.
  baseUrl: (process.env.BASE_URL || process.env.RENDER_EXTERNAL_URL || required('BASE_URL')).replace(/\/+$/, ''),
  port: Number(process.env.PORT || 3000),
  integratorId: process.env.MP_INTEGRATOR_ID || undefined,
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
};

/** Texto que ve el comprador en el resumen de la tarjeta (máx. 13 caracteres aprox.). */
export const statementDescriptor = 'MI TIENDA IOT';
