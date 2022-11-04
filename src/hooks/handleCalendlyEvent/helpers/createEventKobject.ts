import { Customers } from '@kustomer/apps-server-sdk/lib/api/customer';

import { Klasses } from '../../../klasses';
import kapp from '../../../server/kapp';
import getInviteId from './getInviteId';
import mapCalendlyEvent from './mapCalendlyEvent';

export async function createEventKobject(Customers: Customers, event: any) {
  kapp.log.info('Creating kobject');

  const customer = await Customers.getByEmail(event.calendly.email);

  const kobject = mapCalendlyEvent(event.calendly);

  if (customer) {
    await Customers.createKObject(customer.id, Klasses.Event, kobject);
    kapp.log.info('Created kobject');
    return;
  }

  kapp.log.info('Creating customer');

  const newCustomer = await Customers.create({
    name: event.calendly.name,
    emails: [{ email: event.calendly.email }],
    externalId: getInviteId(event.calendly.uri),
  });

  kapp.log.info('Created customer');

  await Customers.createKObject(newCustomer.id, Klasses.Event, kobject);

  kapp.log.info('Created kobject');
}
