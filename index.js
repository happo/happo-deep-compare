const compareSnapshots = require('./compareSnapshots');
const makeRequest = require('./makeRequest');

function validateArguments({ sha1, sha2, apiKey, apiSecret, threshold }) {
  if (!sha1) {
    throw new Error('Missing `sha1` argument');
  }
  if (!sha2) {
    throw new Error('Missing `sha2` argument');
  }
  if (!apiKey) {
    throw new Error('Missing `apiKey` argument');
  }
  if (!apiSecret) {
    throw new Error('Missing `apiSecret` argument');
  }
  if (!threshold) {
    throw new Error('Missing `threshold` argument');
  }
  if (typeof threshold !== 'number' || threshold > 1 || threshold < 0) {
    throw new Error(
      'Argument `threshold` needs to be a number between 0 and 1',
    );
  }
}

function ignore({ before, after, apiKey, apiSecret, endpoint }) {
  return makeRequest(
    {
      url: `${endpoint}/api/ignored-diffs`,
      method: 'POST',
      json: true,
      body: {
        snapshot1Id: before.id,
        snapshot2Id: after.id,
      },
    },
    { apiKey, apiSecret },
  );
}

module.exports = async function happoDeepCompare(
  args,
  { HAPPO_API_KEY, HAPPO_API_SECRET } = process.env,
  log = console.log,
) {
  args.apiKey = args.apiKey || HAPPO_API_KEY;
  args.apiSecret = args.apiSecret || HAPPO_API_SECRET;
  args.threshold = args.threshold || 0.05;
  args.endpoint = args.endpoint || 'https://happo.io';
  const {
    sha1,
    sha2,
    project,
    apiKey,
    apiSecret,
    endpoint,
    link,
    message,
    author,
    threshold,
  } = args;

  validateArguments(args);

  log(`Comparing ${sha1} with ${sha2}...`);
  // First, make a comparison without passing `link` (this will prevent any
  // github status posting from happening).
  const firstCompareResult = await makeRequest(
    {
      url: `${endpoint}/api/reports/${sha1}/compare/${sha2}`,
      method: 'POST',
      json: true,
      body: {
        project,
      },
    },
    { apiKey, apiSecret },
  );

  const resolved = [];
  log(
    `Found ${
      firstCompareResult.diffs.length
    } diffs to deep-compare using threshold ${threshold}`,
  );
  await Promise.all(
    firstCompareResult.diffs.map(async ([before, after]) => {
      const diff = await compareSnapshots({ before, after });
      if (diff < threshold) {
        log(
          `✓ ${after.component} - ${after.variant} - ${
            after.target
          } diff (${diff}) is within threshold`,
        );
        await ignore({ before, after, apiKey, apiSecret });
        resolved.push([before, after]);
      } else {
        log(
          `✗ ${after.component} - ${after.variant} - ${
            after.target
          } diff (${diff}) is larger than threshold`,
        );
      }
    }),
  );

  // Make second compare call to finalize the deep compare. The second call will
  // cause a status to be posted to the PR (if applicable). Any ignored diffs
  // from the first call will be excluded from the result.
  const secondCompareResult = await makeRequest(
    {
      url: `${endpoint}/api/reports/${sha1}/compare/${sha2}`,
      method: 'POST',
      json: true,
      body: {
        link,
        message,
        author,
        project,
      },
    },
    { apiKey, apiSecret },
  );

  log(secondCompareResult.summary);
  return Object.assign({ resolved }, secondCompareResult);
};
