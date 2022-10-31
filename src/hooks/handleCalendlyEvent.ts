import { Klasses } from '../klasses';
import kapp from '../server/kapp';
import { getEventResource } from '../utils/calendly';
import { createEventKobject, updateEventKobject } from './helpers';

export const handleCalendlyEvent: Parameters<typeof kapp.onHook>[1] = async (
  org,
  _query,
  _headers,
  body: any,
) => {
  try {
    const { event_type, name, start_time, end_time } = await getEventResource(
      body.payload.uri.match(/.+?(?=\/invitee)/)[0],
    );

    const { type, description_plain, duration } = await getEventResource(
      event_type,
    );

    const internalOrg = (kapp as any).in(org);

    const kobject = await internalOrg.kobjects.getByExternalId(
      body.payload.uri,
      Klasses.Event,
    );

    const event = {
      kobject,
      calendly: {
        ...body.payload,
        eventType: type,
        eventName: name,
        eventDescription: description_plain,
        eventDuration: duration,
        eventStartTime: start_time,
        eventEndTime: end_time,
        status: body.payload.status,
        qAndA: body.payload?.questions_and_answers,
        eventUpdatedAt: body.payload.updated_at,
        canceledReason: body.payload?.cancellation?.reason,
        eventLocation: body.payload?.location?.location,
      },
    };

    // Update existing kobjects
    if (kobject) {
      return await updateEventKobject(internalOrg.kobjects, event);
    }

    return await createEventKobject(internalOrg.customers, event);
  } catch (e) {
    kapp.log.error('Failed to handle Calendly event', e);
  }
};
