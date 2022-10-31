import { KObjects } from '@kustomer/apps-server-sdk/lib/api/kobject';

import { Klasses } from '../../../klasses';
import kapp from '../../../server/kapp';
import mapCalendlyEvent from './mapCalendlyEvent';

export async function updateEventKobject(Kobjects: KObjects, event: any) {
  const kobject = mapCalendlyEvent(event);

  kapp.log.info('Updating kobject', kobject);

  await Kobjects.update(event.kobject.id as string, Klasses.Event, kobject);

  kapp.log.info('Updated kobject');
}
