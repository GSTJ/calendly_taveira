import 'dotenv/config';
import './klasses';
import './views';
import './hooks';

import kapp from './server/kapp';
import { registerCalendlyWebhooks } from './utils/registerCalendlyWebhooks';

const configureCalendlyWebhooks = async (_user: string, org: string) => {
  kapp.log.info('Registering authenticated Calendly webhooks');
  await registerCalendlyWebhooks(org);
};

kapp.onInstall = configureCalendlyWebhooks;
kapp.onEnable = configureCalendlyWebhooks;

(async () => {
  try {
    await kapp.start({ port: Number(process.env.PORT || 3000) });
  } catch {
    kapp.log.error('Failed to start Calendly app');
  }
})();
