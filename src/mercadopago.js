import { MercadoPagoConfig, Preference, Payment, MerchantOrder } from 'mercadopago';
import { env } from './config.js';

const client = new MercadoPagoConfig({
  accessToken: env.accessToken,
  options: {
    timeout: 10000,
    // El Integrator ID identifica tu integración dentro del Partners Program.
    ...(env.integratorId ? { integratorId: env.integratorId } : {}),
  },
});

export const preferenceClient = new Preference(client);
export const paymentClient = new Payment(client);
export const merchantOrderClient = new MerchantOrder(client);
