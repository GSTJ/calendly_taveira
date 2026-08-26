import nock from 'nock';

import kapp from '../src/server/kapp';
import { CALENDLY_API_ORIGIN } from '../src/utils/calendlyApi';
import { getCalendlyWebhookSigningKey } from '../src/utils/calendlyWebhookSecurity';
import { registerCalendlyWebhooks } from '../src/utils/registerCalendlyWebhooks';

describe('Calendly webhook registration', () => {
  beforeAll(() => {
    jest.spyOn(kapp, 'org').mockReturnValue({
      settings: {
        get: jest.fn().mockResolvedValue({
          default: { authToken: 'calendly-secret' },
        }),
      },
    } as never);
    nock.disableNetConnect();
  });

  afterEach(() => {
    nock.cleanAll();
  });

  afterAll(() => {
    nock.enableNetConnect();
    jest.restoreAllMocks();
  });

  it('replaces legacy subscriptions with a signed subscription', async () => {
    const org = 'org-123';
    const callbackUrl = `${kapp.manifest.url}/orgs/${org}/hooks/calendly.event`;
    const authorization = { authorization: 'Bearer calendly-secret' };
    const currentUser = nock(CALENDLY_API_ORIGIN, {
      reqheaders: authorization,
    })
      .get('/users/me')
      .reply(200, {
        resource: {
          current_organization:
            'https://api.calendly.com/organizations/organization-123',
        },
      });
    const listSubscriptions = nock(CALENDLY_API_ORIGIN, {
      reqheaders: authorization,
    })
      .get('/webhook_subscriptions')
      .query({
        organization: 'https://api.calendly.com/organizations/organization-123',
        scope: 'organization',
      })
      .reply(200, {
        collection: [
          {
            callback_url: callbackUrl,
            uri: 'https://api.calendly.com/webhook_subscriptions/legacy-123',
          },
        ],
      });
    const deleteLegacy = nock(CALENDLY_API_ORIGIN, {
      reqheaders: authorization,
    })
      .delete('/webhook_subscriptions/legacy-123')
      .reply(204);
    const createSigned = nock(CALENDLY_API_ORIGIN, {
      reqheaders: authorization,
    })
      .post('/webhook_subscriptions', {
        events: ['invitee.canceled', 'invitee.created'],
        organization: 'https://api.calendly.com/organizations/organization-123',
        scope: 'organization',
        signing_key: getCalendlyWebhookSigningKey(org),
        url: callbackUrl,
      })
      .reply(201, { resource: { state: 'active' } });

    await expect(registerCalendlyWebhooks(org)).resolves.toEqual({
      state: 'active',
    });
    expect(currentUser.isDone()).toBe(true);
    expect(listSubscriptions.isDone()).toBe(true);
    expect(deleteLegacy.isDone()).toBe(true);
    expect(createSigned.isDone()).toBe(true);
  });
});
