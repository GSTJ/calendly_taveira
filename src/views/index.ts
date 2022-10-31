import { appName } from '../constants';
import kapp from '../server/kapp';

kapp.useView(`${appName}-event-kview`, './src/views/ExpandedTimeline.jsx', {
  resource: 'kobject',
  context: 'expanded-timeline',
  displayName: 'Calendly Event',
  icon: 'calendar',
  state: 'open',
  klass: 'calendly-sdk-event',
});
