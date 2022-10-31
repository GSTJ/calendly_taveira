import { KApp } from '@kustomer/apps-server-sdk';

import changelog from '../../changelog.json';
import { appName, appVersion } from '../constants';

if (!process.env.BASE_URL) {
  throw new Error('baseUrl is required');
}

if (!process.env.CLIENT_ID || !process.env.CLIENT_SECRET) {
  throw new Error('clientId and clientSecret are required');
}

export default new KApp({
  app: appName,
  version: appVersion,
  title: 'Calendly Gabriel Taveira',
  visibility: 'private',
  description: 'Done using the new Apps SDK',
  dependencies: [],
  default: false,
  system: false,
  url: process.env.BASE_URL,
  clientId: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET,
  iconUrl: `${process.env.BASE_URL}/assets/icon.png`,
  env: 'prod',
  changelog,
  roles: [
    'org.user.customer.read',
    'org.user.customer.write',
    'org.user.message.read',
    'org.permission.customer.read',
    'org.permission.customer.create',
    'org.permission.customer.update',
    'org.permission.message.read',
  ],
  appDetails: {
    appDeveloper: {
      name: 'Gabriel Taveira',
      website: 'https://kustomer.com',
      supportEmail: 'support@kustomer.com',
    },
    externalPlatform: {
      name: 'Calendly',
      website: 'https://calendly.com/',
    },
  },
  screenshots: [],
  settings: {
    default: {
      authToken: {
        type: 'secret',
        defaultValue: '',
        required: true,
      },
    },
  },
  i18n: {
    en_us: {
      [`${appName}.settings.page.title`]: 'Calendly',
      [`${appName}.settings.page.description`]:
        'Configure settings for your Calendly integration with Kustomer. Fill out these fields after generating an access token on the Calendly site. [Learn more](https://help.kustomer.com/en_us/integrate-with-calendly-SkjppgFpv)',
      [`${appName}.settings.path.default.authToken.displayName`]:
        'Calendly API Token',
      [`${appName}.settings.path.default.authToken.description`]:
        "Locate this on [Calendly's API & Webhooks](https://calendly.com/integrations/api_webhooks) page.",
    },
  },
});
