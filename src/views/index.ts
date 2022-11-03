import fs from 'fs';
import path from 'path';

import { Klasses } from '../klasses';
import kapp from '../server/kapp';

enum KViews {
  EventKView = 'Event-KView',
}

kapp.useView(
  KViews.EventKView,
  fs.readFileSync(path.resolve(__dirname, './ExpandedTimeline.jsx'), {
    encoding: 'utf-8',
  }),
  {
    resource: 'kobject',
    context: 'expanded-timeline',
    displayName: 'Calendly Event',
    icon: 'calendar',
    state: 'open',
    klass: Klasses.Event,
  },
);
