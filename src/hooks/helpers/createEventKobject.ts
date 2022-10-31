import { Customers } from '@kustomer/apps-server-sdk/lib/api/customer';

import { Klasses } from '../../klasses';
import kapp from '../../server/kapp';
import mapCalendlyEvent from './mapCalendlyEvent';

export async function createEventKobject(Customers: Customers, event: any) {
  kapp.log.info('Creating kobject');

  let customer = await Customers.getByEmail(event.calendly.email);

  const kobject = mapCalendlyEvent(event.calendly);

  if (customer) {
    await Customers.createKObject(customer.id, Klasses.Event, kobject);

    kapp.log.info('Created kobject');

    return;
  }

  kapp.log.info('Creating customer');

  customer = await Customers.create({
    name: event.calendly.name,
    emails: [{ email: event.calendly.email }],
  });

  kapp.log.info('Created customer');

  await Customers.createKObject(customer.id, Klasses.Event, kobject);

  kapp.log.info('Created kobject');
}
