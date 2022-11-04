import { KObject } from '@kustomer/apps-server-sdk';

import getInviteId from './getInviteId';

export default (event: any): KObject => {
  return {
    custom: {
      canceledStr: event.status === 'canceled' ? 'Yes' : 'No',
      cancelReasonStr: event.canceledReason || 'N/A',
      canceledDateStr:
        event.status === 'canceled' ? event.eventUpdatedAt : 'N/A',
      endTimeAt: event.eventEndTime,
      eventDescriptionStr: event.eventDescription,
      eventDurationNum: event.eventDuration,
      eventLocationStr: event.eventLocation,
      eventNameStr: event.eventName,
      eventTypeStr: event.eventType,
      startTimeAt: event.eventStartTime,
    },
    data: {
      payload: event,
    },
    title: event.eventName,
    externalId: getInviteId(event.uri),
  };
};
