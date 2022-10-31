import axios from 'axios';

import kapp from '../server/kapp';

export enum CalendlyHooks {
  CalendlyEvent = 'calendly.event',
  InviteeCreated = 'invitee.created',
  InviteeCancelled = 'invitee.cancelled',
}

const calendlyEvents = [
  CalendlyHooks.InviteeCancelled,
  CalendlyHooks.InviteeCreated,
];

const calendlyInstance = axios.create({
  baseURL: 'https://api.calendly.com',
  headers: {
    Authorization: `Bearer ${'How do I get that'}`,
  },
});

function getWebhookUrl(orgId: string) {
  return `${kapp.manifest.url}/orgs/${orgId}/hooks/${CalendlyHooks.CalendlyEvent}`;
}

async function getCurrentUser() {
  const { data } = await calendlyInstance.get('/users/me');
  return data?.resource;
}

export async function getEventResource(url: string) {
  const res = await calendlyInstance.get(url);
  return res?.data?.resource;
}

async function getEventsNotAlreadyRegistered(orgId: string) {
  const { collection } = await getWebhooks();

  if (!collection || !collection.length) return calendlyEvents;

  return calendlyEvents.filter(event => {
    return !collection.find(webhook => {
      return (
        webhook.events.includes(event) &&
        webhook.callback_url === getWebhookUrl(orgId)
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

async function createWebhooks(orgId: string) {
  const user = await getCurrentUser();

  const payload = {
    url: getWebhookUrl(orgId),
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

export async function registerWebhooks(orgId: string) {
  const events = await getEventsNotAlreadyRegistered(orgId);

  if (!events.length) {
    kapp.log.info('Events already registered');
    return events;
  }

  return createWebhooks(orgId);
}
