import { getCalendlyInviteeId } from '../../../utils/calendlyApi';

const getInviteId = (uri: string) => getCalendlyInviteeId(uri);

export default getInviteId;
