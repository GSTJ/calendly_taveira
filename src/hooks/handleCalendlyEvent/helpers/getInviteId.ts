/**
 * This function extracts the ID from a calendly URI
 */
const getInviteId = (uri: string) => {
  return uri?.replace(
    /https:\/\/api.calendly\.com\/scheduled_events\/.*\/invitees\//,
    '',
  );
};

export default getInviteId;
