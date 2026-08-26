import '../src/hooks';

import { createHmac } from 'crypto';
import nock from 'nock';
import request from 'supertest';

import kapp from '../src/server/kapp';
import { getCalendlyWebhookSigningKey } from '../src/utils/calendlyWebhookSecurity';
import { CalendlyHooks } from '../src/utils/registerCalendlyWebhooks';

const org = 'org-123';
const hookPath = `/orgs/${org}/hooks/${CalendlyHooks.CalendlyEvent}`;

function createBody(uri: string) {
  return {
    event: 'invitee.created',
    payload: {
      email: 'invitee@example.com',
      location: { location: 'Video call' },
      name: 'Test Invitee',
      status: 'active',
      updated_at: '2026-08-26T12:00:00.000Z',
      uri,
    },
  };
}

function sign(body: unknown) {
  const timestamp = Math.floor(Date.now() / 1000).toString();
  const signature = createHmac('sha256', getCalendlyWebhookSigningKey(org))
    .update(`${timestamp}.${JSON.stringify(body)}`, 'utf8')
    .digest('hex');

  return `t=${timestamp},v1=${signature}`;
}

describe('Calendly webhook HTTP path', () => {
  const getByEmail = jest.fn().mockResolvedValue(undefined);
  const createCustomer = jest.fn().mockResolvedValue({ id: 'customer-123' });
  const createKObject = jest.fn().mockResolvedValue(undefined);
  const getByExternalId = jest.fn().mockResolvedValue(undefined);

  beforeAll(async () => {
    jest.spyOn(kapp, 'org').mockReturnValue({
      customers: {
        create: createCustomer,
        createKObject,
        getByEmail,
      },
      kobjects: { getByExternalId },
      settings: {
        get: jest.fn().mockResolvedValue({
          default: { authToken: 'calendly-secret' },
        }),
      },
    } as never);

    await kapp.start({ port: 0, publish: false });
    nock.disableNetConnect();
    nock.enableNetConnect('127.0.0.1');
  });

  afterEach(() => {
    nock.cleanAll();
  });

  afterAll(async () => {
    nock.enableNetConnect();
    jest.restoreAllMocks();
    await kapp.stop();
  });

  it('rejects an unsigned webhook before reading integration settings', async () => {
    const body = createBody(
      'https://api.calendly.com/scheduled_events/event-123/invitees/invitee-456',
    );

    const response = await request(kapp.app).post(hookPath).send(body);

    expect(response.status).toBe(401);
    expect(kapp.org).not.toHaveBeenCalled();
  });

  it('blocks a signed attacker-controlled absolute URL without sending the token', async () => {
    const body = createBody(
      'https://attacker.example/scheduled_events/event-123/invitees/invitee-456',
    );
    const attacker = nock('https://attacker.example')
      .get('/scheduled_events/event-123')
      .reply(200, { resource: {} });

    const response = await request(kapp.app)
      .post(hookPath)
      .set('Calendly-Webhook-Signature', sign(body))
      .send(body);

    expect(response.status).toBe(400);
    expect(attacker.isDone()).toBe(false);
    expect(kapp.org).not.toHaveBeenCalled();
  });

  it('processes a signed Calendly invitee payload through the real hook route', async () => {
    const body = createBody(
      'https://api.calendly.com/scheduled_events/event-123/invitees/invitee-456',
    );
    const scheduledEvent = nock('https://api.calendly.com', {
      reqheaders: { authorization: 'Bearer calendly-secret' },
    })
      .get('/scheduled_events/event-123')
      .reply(200, {
        resource: {
          end_time: '2026-08-26T12:30:00.000Z',
          event_type: 'https://api.calendly.com/event_types/type-789',
          name: 'Security review',
          start_time: '2026-08-26T12:00:00.000Z',
        },
      });
    const eventType = nock('https://api.calendly.com', {
      reqheaders: { authorization: 'Bearer calendly-secret' },
    })
      .get('/event_types/type-789')
      .reply(200, {
        resource: {
          description_plain: 'Review the integration',
          duration: 30,
          type: 'Standard Event',
        },
      });

    const response = await request(kapp.app)
      .post(hookPath)
      .set('Calendly-Webhook-Signature', sign(body))
      .send(body);

    expect(response.status).toBe(200);
    expect(scheduledEvent.isDone()).toBe(true);
    expect(eventType.isDone()).toBe(true);
    expect(getByExternalId).toHaveBeenCalledWith('invitee-456', 'event_klass');
    expect(createCustomer).toHaveBeenCalledWith(
      expect.objectContaining({ externalId: 'invitee-456' }),
    );
    expect(createKObject).toHaveBeenCalledWith(
      'customer-123',
      'event_klass',
      expect.objectContaining({ externalId: 'invitee-456' }),
    );
  });
});
