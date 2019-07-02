const crypto = require('crypto');
const Jimp = require('jimp');

const imageDiff = require('lcs-image-diff');

function createHash(data) {
  return crypto
    .createHash('md5')
    .update(data)
    .digest('hex');
}

function makeAbsolute(url, endpoint) {
  if (url.startsWith('http')) {
    return url;
  }
  return `${endpoint}${url}`;
}

module.exports = async function compareSnapshots({ before, after, endpoint }) {
  const [image1, image2] = await Promise.all([
    Jimp.read(makeAbsolute(before.url, endpoint)),
    Jimp.read(makeAbsolute(after.url, endpoint)),
  ]);

  const { diff } = imageDiff(
    image1.bitmap,
    image2.bitmap,
    {
      hashFunction: createHash,
    },
  );
  return diff;
};
