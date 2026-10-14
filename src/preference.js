import { randomUUID } from 'node:crypto';
import { env, product, paymentRules, statementDescriptor } from './config.js';
import { preferenceClient } from './mercadopago.js';

/**
 * Arma el body de la preferencia de Checkout Pro con todos los campos que
 * normalmente se evalúan: ítem completo, payer, back_urls, auto_return,
 * notification_url, external_reference y reglas de medios de pago.
 */
export function buildPreferenceBody({ quantity = 1 } = {}) {
  const externalReference = `ORDER-${Date.now()}-${randomUUID().slice(0, 8)}`;

  return {
    items: [
      {
        id: product.id,
        title: product.title,
        description: product.description,
        picture_url: product.pictureUrl || `${env.baseUrl}/img/producto.svg`,
        category_id: product.categoryId,
        quantity,
        currency_id: product.currencyId,
        unit_price: product.unitPrice,
      },
    ],
    payer: {
      name: 'Lalo',
      surname: 'Landa',
      email: env.testPayerEmail,
      phone: { area_code: '11', number: '44444444' },
      identification: { type: 'DNI', number: '12345678' },
      address: { zip_code: '1686', street_name: 'Calle Falsa', street_number: 123 },
    },
    back_urls: {
      success: `${env.baseUrl}/success`,
      failure: `${env.baseUrl}/failure`,
      pending: `${env.baseUrl}/pending`,
    },
    // Redirige automáticamente a back_urls.success cuando el pago se aprueba
    auto_return: 'approved',
    notification_url: `${env.baseUrl}/webhooks/mercadopago?source_news=webhooks`,
    external_reference: externalReference,
    statement_descriptor: statementDescriptor,
    payment_methods: {
      excluded_payment_methods: paymentRules.excludedPaymentMethods,
      excluded_payment_types: paymentRules.excludedPaymentTypes,
      installments: paymentRules.maxInstallments,
    },
    metadata: { source: 'certificacion-checkout-pro' },
  };
}

export async function createPreference(options) {
  const body = buildPreferenceBody(options);
  const preference = await preferenceClient.create({
    body,
    // Evita preferencias duplicadas si se reintenta la misma request
    requestOptions: { idempotencyKey: randomUUID() },
  });
  return {
    id: preference.id,
    initPoint: preference.init_point,
    sandboxInitPoint: preference.sandbox_init_point,
    externalReference: body.external_reference,
  };
}
