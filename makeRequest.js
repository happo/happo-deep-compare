const jwt = require('jsonwebtoken');
const request = require('request-promise-native');

module.exports = async function makeRequest(
  requestAttributes,
  { apiKey, apiSecret },
) {
  const signed = jwt.sign({ key: apiKey }, apiSecret, {
    header: { kid: apiKey },
  });
  const result = await request({
    gzip: true,
    auth: {
      bearer: signed,
    },
    ...requestAttributes,
  });
  return result;
}
