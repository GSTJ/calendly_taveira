import kapp from '../server/kapp';
import { CalendlyHooks } from '../utils/registerCalendlyWebhooks';
import { handleCalendlyEvent } from './handleCalendlyEvent';

kapp.onHook(CalendlyHooks.CalendlyEvent, handleCalendlyEvent);
