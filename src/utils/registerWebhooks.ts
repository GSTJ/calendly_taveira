import kapp from '../server/kapp';
import { getAuthorizedCalendlyInstance } from './getAuthorizedCalendlyInstance';

export enum CalendlyHooks {
  CalendlyEvent = 'calendly.event',
  InviteeCreated = 'invitee.created',
  InviteeCancelled = 'invitee.cancelled',
}

const calendlyEvents = [
  CalendlyHooks.InviteeCancelled,
  CalendlyHooks.InviteeCreated,
];

export const registerWebhooks = async (orgId: string) => {
  const calendlyInstance = await getAuthorizedCalendlyInstance(orgId);

  const webhookUrl = `${kapp.manifest.url}/orgs/${orgId}/hooks/${CalendlyHooks.CalendlyEvent}`;

  async function getCurrentUser() {
    const { data } = await calendlyInstance.get('/users/me');
    return data?.resource;
  }

  async function getEventsNotAlreadyRegistered() {
    const { collection } = await getWebhooks();

    if (!collection || !collection.length) return calendlyEvents;

    return calendlyEvents.filter(event => {
      return !collection.find(webhook => {
        return (
          webhook.events.includes(event) && webhook.callback_url === webhookUrl
        );
      });
    });
  }

  async function getWebhooks() {
    const user = await getCurrentUser();
    const { data } = await calendlyInstance.get(
      `/webhook_subscriptions?scope=organization&organization=${user.current_organization}`,
    );

    return data;
  }

  async function createWebhooks() {
    const user = await getCurrentUser();

    const payload = {
      url: webhookUrl,
      events: calendlyEvents,
      organization: user?.current_organization,
      scope: 'organization',
    };

    const { data } = await calendlyInstance.post(
      '/webhook_subscriptions',
      payload,
    );

    return data?.resource;
  }

  const events = await getEventsNotAlreadyRegistered();

  if (!events.length) {
    kapp.log.info('Events already registered');
    return events;
  }

  return createWebhooks();
};
