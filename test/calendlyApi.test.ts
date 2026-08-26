import nock from 'nock';

import {
  CALENDLY_API_ORIGIN,
  getCalendlyInviteeId,
  getCalendlyResourcePath,
  getCalendlyScheduledEventPath,
} from '../src/utils/calendlyApi';
import { createAuthorizedCalendlyInstance } from '../src/utils/getAuthorizedCalendlyInstance';

describe('Calendly API boundary', () => {
  beforeAll(() => {
    nock.disableNetConnect();
  });

  afterEach(() => {
    nock.cleanAll();
  });

  afterAll(() => {
    nock.enableNetConnect();
  });

  it('extracts only expected Calendly resource paths', () => {
    const inviteeUri =
      'https://api.calendly.com/scheduled_events/event-123/invitees/invitee-456';

    expect(getCalendlyScheduledEventPath(inviteeUri)).toBe(
      '/scheduled_events/event-123',
    );
    expect(getCalendlyInviteeId(inviteeUri)).toBe('invitee-456');
    expect(
      getCalendlyResourcePath(
        'https://api.calendly.com/event_types/type-789',
        'event_types',
      ),
    ).toBe('/event_types/type-789');
  });

  it.each([
    'http://api.calendly.com/scheduled_events/a/invitees/b',
    'https://api.calendly.com.evil.test/scheduled_events/a/invitees/b',
    'https://api.calendly.com:444/scheduled_events/a/invitees/b',
    'https://user@api.calendly.com/scheduled_events/a/invitees/b',
    'https://api.calendly.com/scheduled_events/a/invitees/b?next=https://evil.test',
    'https://api.calendly.com/scheduled_events/a/invitees/%2Fsteal',
  ])('rejects an unsafe invitee URI: %s', uri => {
    expect(() => getCalendlyScheduledEventPath(uri)).toThrow();
  });

  it('does not send a bearer token to an attacker-controlled absolute URL', async () => {
    const attacker = nock('https://attacker.example')
      .get('/steal')
      .reply(200, { resource: {} });
    const calendly = createAuthorizedCalendlyInstance('calendly-secret');

    await expect(
      calendly.get('https://attacker.example/steal'),
    ).rejects.toThrow('Refusing to send credentials outside the Calendly API');
    expect(attacker.isDone()).toBe(false);
  });

  it('sends the bearer token to an allowed absolute Calendly URL', async () => {
    const calendlyRequest = nock(CALENDLY_API_ORIGIN, {
      reqheaders: { authorization: 'Bearer calendly-secret' },
    })
      .get('/users/me')
      .reply(200, { resource: { uri: 'user' } });
    const calendly = createAuthorizedCalendlyInstance('calendly-secret');

    await expect(
      calendly.get(`${CALENDLY_API_ORIGIN}/users/me`),
    ).resolves.toMatchObject({ status: 200 });
    expect(calendlyRequest.isDone()).toBe(true);
  });

  it('does not follow a Calendly redirect to another origin', async () => {
    const calendlyRequest = nock(CALENDLY_API_ORIGIN)
      .get('/scheduled_events/event-123')
      .reply(302, undefined, { Location: 'https://attacker.example/steal' });
    const attacker = nock('https://attacker.example')
      .get('/steal')
      .reply(200, { resource: {} });
    const calendly = createAuthorizedCalendlyInstance('calendly-secret');

    await expect(
      calendly.get('/scheduled_events/event-123'),
    ).rejects.toMatchObject({ response: { status: 302 } });
    expect(calendlyRequest.isDone()).toBe(true);
    expect(attacker.isDone()).toBe(false);
  });
});
