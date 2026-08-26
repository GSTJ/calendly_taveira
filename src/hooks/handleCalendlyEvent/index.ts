import { BadRequestError } from '@kustomer/apps-server-sdk';

import { Klasses } from '../../klasses';
import kapp from '../../server/kapp';
import {
  getCalendlyInviteeId,
  getCalendlyResourcePath,
  getCalendlyScheduledEventPath,
} from '../../utils/calendlyApi';
import { verifyCalendlyWebhook } from '../../utils/calendlyWebhookSecurity';
import { getAuthorizedCalendlyInstance } from '../../utils/getAuthorizedCalendlyInstance';
import { createEventKobject, updateEventKobject } from './helpers';

type CalendlyWebhookBody = {
  event?: string;
  payload?: {
    cancellation?: { reason?: unknown };
    location?: { location?: unknown };
    questions_and_answers?: unknown;
    status?: unknown;
    updated_at?: unknown;
    uri?: string;
    [key: string]: unknown;
  };
};

export const handleCalendlyEvent: Parameters<typeof kapp.onHook>[1] = async (
  org,
  _query,
  headers,
  body: CalendlyWebhookBody,
) => {
  verifyCalendlyWebhook(
    org,
    headers as Record<string, string | string[] | undefined>,
    body,
  );

  const payload = body?.payload;

  if (!payload?.uri) {
    throw new BadRequestError('invalid Calendly webhook payload');
  }

  let scheduledEventPath: string;
  let inviteeId: string;

  try {
    scheduledEventPath = getCalendlyScheduledEventPath(payload.uri);
    inviteeId = getCalendlyInviteeId(payload.uri);
  } catch {
    throw new BadRequestError('invalid Calendly webhook payload');
  }

  const calendlyInstance = await getAuthorizedCalendlyInstance(org);
  const inviteResponse = await calendlyInstance.get(scheduledEventPath);

  const { event_type, name, start_time, end_time } =
    inviteResponse?.data?.resource || {};
  const eventTypePath = getCalendlyResourcePath(event_type, 'event_types');
  const eventResponse = await calendlyInstance.get(eventTypePath);

  const { type, description_plain, duration } =
    eventResponse?.data?.resource || {};

  const internalOrg = kapp.org(org);
  const kobject = await internalOrg.kobjects.getByExternalId(
    inviteeId,
    Klasses.Event,
  );

  const event = {
    kobject,
    calendly: {
      ...payload,
      eventType: type,
      eventName: name,
      eventDescription: description_plain,
      eventDuration: duration,
      eventStartTime: start_time,
      eventEndTime: end_time,
      status: payload.status,
      qAndA: payload.questions_and_answers,
      eventUpdatedAt: payload.updated_at,
      canceledReason: payload.cancellation?.reason,
      eventLocation: payload.location?.location,
    },
  };

  if (kobject) {
    return updateEventKobject(internalOrg.kobjects, event);
  }

  return createEventKobject(internalOrg.customers, event);
};
