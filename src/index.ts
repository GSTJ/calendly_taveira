import 'dotenv/config';
import './klasses';
import './views';
import './hooks';

import kapp from './server/kapp';
import { registerCalendlyWebhooks } from './utils/registerCalendlyWebhooks';

kapp.onInstall = async (_user, org) => {
  try {
    kapp.log.info('Registering Calendly webhooks');
    await registerCalendlyWebhooks(org);
  } catch (e) {
    kapp.log.error(JSON.stringify(e, undefined, 2));
  }
};

(async () => {
  try {
    await kapp.start({ port: Number(process.env.PORT || 3000) });
  } catch (err) {
    kapp.log.error(JSON.stringify(err, undefined, 2));
  }
})();
