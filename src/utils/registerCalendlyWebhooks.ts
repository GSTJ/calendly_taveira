import kapp from '../server/kapp';
import { CALENDLY_API_ORIGIN, getCalendlyResourcePath } from './calendlyApi';
import { getCalendlyWebhookSigningKey } from './calendlyWebhookSecurity';
import { getAuthorizedCalendlyInstance } from './getAuthorizedCalendlyInstance';

export enum CalendlyHooks {
  CalendlyEvent = 'calendly.event',
  InviteeCreated = 'invitee.created',
  InviteeCanceled = 'invitee.canceled',
}

const calendlyEvents = [
  CalendlyHooks.InviteeCanceled,
  CalendlyHooks.InviteeCreated,
];

export const registerCalendlyWebhooks = async (orgId: string) => {
  const calendlyInstance = await getAuthorizedCalendlyInstance(orgId);
  const webhookUrl = `${kapp.manifest.url}/orgs/${orgId}/hooks/${CalendlyHooks.CalendlyEvent}`;

  const { data: userData } = await calendlyInstance.get('/users/me');
  const organizationPath = getCalendlyResourcePath(
    userData?.resource?.current_organization,
    'organizations',
  );
  const organization = `${CALENDLY_API_ORIGIN}${organizationPath}`;
  const { data: webhookData } = await calendlyInstance.get(
    '/webhook_subscriptions',
    {
      params: {
        organization,
        scope: 'organization',
      },
    },
  );
  const existingWebhooks = (webhookData?.collection || []).filter(
    (webhook: { callback_url?: string }) => webhook.callback_url === webhookUrl,
  );

  for (const webhook of existingWebhooks) {
    const webhookPath = getCalendlyResourcePath(
      webhook.uri,
      'webhook_subscriptions',
    );
    await calendlyInstance.delete(webhookPath);
  }

  const { data } = await calendlyInstance.post('/webhook_subscriptions', {
    url: webhookUrl,
    events: calendlyEvents,
    organization,
    scope: 'organization',
    signing_key: getCalendlyWebhookSigningKey(orgId),
  });

  return data?.resource;
};
