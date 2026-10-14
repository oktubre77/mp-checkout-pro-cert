import express from 'express';
import { fileURLToPath } from 'node:url';
import { env, product } from './config.js';
import { createPreference } from './preference.js';
import { handleWebhook } from './webhooks.js';

const app = express();
const publicDir = fileURLToPath(new URL('../public/', import.meta.url));

app.use(express.json());
app.use(express.static(publicDir));

// Datos del producto para la página de la tienda
app.get('/api/product', (_req, res) => {
  res.json({
    id: product.id,
    title: product.title,
    description: product.description,
    unitPrice: product.unitPrice,
    currencyId: product.currencyId,
    publicKey: env.publicKey ?? null,
  });
});

// Crea la preferencia y devuelve la URL de Checkout Pro
app.post('/api/create_preference', async (req, res) => {
  try {
    const quantity = Math.max(1, Math.min(10, Number(req.body?.quantity) || 1));
    const pref = await createPreference({ quantity });
    console.log('Preferencia creada:', pref.id, pref.externalReference);
    res.json(pref);
  } catch (err) {
    console.error('Error creando la preferencia:', err?.cause ?? err);
    res.status(500).json({ error: 'No se pudo crear la preferencia de pago' });
  }
});

// Webhook de notificaciones de Mercado Pago
app.post('/webhooks/mercadopago', handleWebhook);

// back_urls: Mercado Pago agrega por query payment_id, status,
// external_reference, merchant_order_id, etc.
function resultPage(kind) {
  return (req, res) => {
    const q = req.query;
    const titles = {
      success: '¡Pago aprobado!',
      pending: 'Pago pendiente',
      failure: 'El pago no se pudo completar',
    };
    const esc = (v) => String(v ?? '-').replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
    res.send(`<!doctype html>
<html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${titles[kind]}</title><link rel="stylesheet" href="/styles.css"></head>
<body><main class="card result ${kind}">
<h1>${titles[kind]}</h1>
<p>Guardá el <strong>Payment ID</strong>: es el que se envía en la página de certificación.</p>
<dl>
  <dt>Payment ID</dt><dd class="pid">${esc(q.payment_id)}</dd>
  <dt>Estado</dt><dd>${esc(q.status || q.collection_status)}</dd>
  <dt>Referencia externa</dt><dd>${esc(q.external_reference)}</dd>
  <dt>Merchant order</dt><dd>${esc(q.merchant_order_id)}</dd>
  <dt>Tipo de pago</dt><dd>${esc(q.payment_type)}</dd>
</dl>
<a class="btn" href="/">Volver a la tienda</a>
</main></body></html>`);
  };
}
app.get('/success', resultPage('success'));
app.get('/pending', resultPage('pending'));
app.get('/failure', resultPage('failure'));

app.get('/health', (_req, res) => res.json({ ok: true }));

app.listen(env.port, () => {
  console.log(`Servidor en http://localhost:${env.port}`);
  console.log(`URL pública configurada: ${env.baseUrl}`);
  console.log(`Webhook: ${env.baseUrl}/webhooks/mercadopago`);
});
