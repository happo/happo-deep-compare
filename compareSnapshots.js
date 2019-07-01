const crypto = require('crypto');
const Jimp = require('jimp');

const imageDiff = require('lcs-image-diff');

function createHash(data) {
  return crypto
    .createHash('md5')
    .update(data)
    .digest('hex');
}

module.exports = async function compareSnapshots({ before, after }) {
  const [image1, image2] = await Promise.all([
    Jimp.read(before.url),
    Jimp.read(after.url),
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
