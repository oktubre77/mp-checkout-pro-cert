import { createHmac, timingSafeEqual } from 'node:crypto';
import { appendFile, mkdir } from 'node:fs/promises';
import { env } from './config.js';
import { paymentClient, merchantOrderClient } from './mercadopago.js';

const LOG_DIR = new URL('../logs/', import.meta.url);

async function log(entry) {
  const line = JSON.stringify({ at: new Date().toISOString(), ...entry });
  console.log(line);
  try {
    await mkdir(LOG_DIR, { recursive: true });
    await appendFile(new URL('webhooks.log', LOG_DIR), line + '\n');
  } catch (err) {
    console.error('No se pudo escribir el log:', err.message);
  }
}

/**
 * Valida la firma x-signature de Mercado Pago.
 * Manifest: id:<data.id>;request-id:<x-request-id>;ts:<ts>;
 * Solo se valida si MP_WEBHOOK_SECRET está configurado.
 */
function isValidSignature(req, dataId) {
  if (!env.webhookSecret) return true;

  const signature = req.get('x-signature') || '';
  const requestId = req.get('x-request-id') || '';
  const parts = Object.fromEntries(
    signature.split(',').map((p) => p.split('=').map((s) => s.trim())),
  );
  const { ts, v1 } = parts;
  if (!ts || !v1) return false;

  let manifest = '';
  if (dataId) manifest += `id:${String(dataId).toLowerCase()};`;
  if (requestId) manifest += `request-id:${requestId};`;
  manifest += `ts:${ts};`;

  const expected = createHmac('sha256', env.webhookSecret).update(manifest).digest('hex');
  const a = Buffer.from(expected);
  const b = Buffer.from(v1);
  return a.length === b.length && timingSafeEqual(a, b);
}

/**
 * Endpoint de notificaciones (webhooks).
 * Responde 200 rápido y procesa después, como recomienda Mercado Pago.
 */
export async function handleWebhook(req, res) {
  const type = req.body?.type || req.query.type || req.query.topic;
  const dataId = req.body?.data?.id || req.query['data.id'] || req.query.id;

  if (!isValidSignature(req, dataId)) {
    await log({ event: 'webhook_firma_invalida', type, dataId });
    return res.sendStatus(401);
  }

  res.sendStatus(200);

  try {
    if (type === 'payment' && dataId) {
      const payment = await paymentClient.get({ id: dataId });
      await log({
        event: 'payment',
        payment_id: payment.id,
        status: payment.status,
        status_detail: payment.status_detail,
        external_reference: payment.external_reference,
        payment_method_id: payment.payment_method_id,
        installments: payment.installments,
        transaction_amount: payment.transaction_amount,
      });
    } else if (type === 'merchant_order' && dataId) {
      const order = await merchantOrderClient.get({ merchantOrderId: dataId });
      await log({
        event: 'merchant_order',
        merchant_order_id: order.id,
        status: order.status,
        order_status: order.order_status,
        external_reference: order.external_reference,
      });
    } else {
      await log({ event: 'webhook_otro', type, dataId, body: req.body });
    }
  } catch (err) {
    await log({ event: 'webhook_error', type, dataId, error: err.message });
  }
}
