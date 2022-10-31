import { KObjects } from '@kustomer/apps-server-sdk/lib/api/kobject';

import { Klasses } from '../../klasses';
import kapp from '../../server/kapp';

export async function getEventKobject(Kobjects: KObjects, eventId: string) {
  kapp.log.info('Getting kobject');

  const kobject = await Kobjects.getByExternalId(eventId, Klasses.Event);

  kapp.log.info('KObject retrieved', kobject);

  return kobject;
}
