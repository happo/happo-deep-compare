const happoDeepCompare = require('.');
const makeRequest = require('./makeRequest');

jest.mock('./makeRequest');

let subject;
let opts;
let log;

beforeEach(() => {
  log = [];
  compareResult = {
    diffs: [
      [
        {
          url: 'https://happo.io/img/happo-io/93eb2d9e57d43b0b5ca5527587484f18',
          component: 'Foo',
          variant: 'bar',
          target: 'chrome',
        },
        {
          url: 'https://happo.io/img/happo-io/4a340716fa580b80d9f87330d79903dc',
          component: 'Foo',
          variant: 'bar',
          target: 'chrome',
        },
      ],
    ],
  };
  makeRequest.mockImplementation(() => Promise.resolve(compareResult));
  opts = {
    sha1: 'abc',
    sha2: 'xyz',
    apiKey: 'foo',
    apiSecret: 'bar',
  };
  env = {};
  subject = () => happoDeepCompare(opts, env, msg => log.push(msg));
});

it('succeeds', async () => {
  const result = await subject();
  expect(result).toEqual([]);
  expect(log).toEqual([
    'Comparing abc with xyz...',
    'Found 1 diffs to deep-compare using threshold 0.05',
    '✗ Foo - bar - chrome diff (0.07157695903064663) is larger than threshold',
  ]);
});

describe('when apiKey is missing', () => {
  beforeEach(() => {
    delete opts.apiKey;
  });

  it('throws an error', async () => {
    await expect(subject()).rejects.toEqual(
      new Error('Missing `apiKey` argument'),
    );
  });
});

describe('when apiSecret is missing', () => {
  beforeEach(() => {
    delete opts.apiSecret;
  });

  it('throws an error', async () => {
    await expect(subject()).rejects.toEqual(
      new Error('Missing `apiSecret` argument'),
    );
  });
});

describe('when sha1 is missing', () => {
  beforeEach(() => {
    delete opts.sha1;
  });

  it('throws an error', async () => {
    await expect(subject()).rejects.toEqual(
      new Error('Missing `sha1` argument'),
    );
  });
});

describe('when sha2 is missing', () => {
  beforeEach(() => {
    delete opts.sha2;
  });

  it('throws an error', async () => {
    await expect(subject()).rejects.toEqual(
      new Error('Missing `sha2` argument'),
    );
  });
});

describe('when threshold is too large', () => {
  beforeEach(() => {
    opts.threshold = 12;
  });

  it('throws an error', async () => {
    await expect(subject()).rejects.toEqual(
      new Error('Argument `threshold` needs to be a number between 0 and 1'),
    );
  });
});

describe('when threshold is not a number', () => {
  beforeEach(() => {
    opts.threshold = '0.2';
  });

  it('throws an error', async () => {
    await expect(subject()).rejects.toEqual(
      new Error('Argument `threshold` needs to be a number between 0 and 1'),
    );
  });
});

describe('when threshold is larger than diff', () => {
  beforeEach(() => {
    opts.threshold = 0.1;
  });

  it('returns the diff that was deep-compared', async () => {
    const result = await subject();
    expect(result).toEqual(compareResult.diffs);

    expect(log).toEqual([
      'Comparing abc with xyz...',
      'Found 1 diffs to deep-compare using threshold 0.1',
      '✓ Foo - bar - chrome diff (0.07157695903064663) is within threshold',
    ]);
  });
});
