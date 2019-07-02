const commander = require('commander');

const packageJson = require('./package.json');
const happoDeepCompare = require('.');

commander
  .version(packageJson.version)
  .arguments('<sha1> <sha2>')
  .option(
    '-t, --threshold <threshold>',
    'diffs smaller than this threshold will be considered equal',
    '0.1',
  )
  .option('-l, --link <url>', 'provide a link back to the commit')
  .option('-p, --project <name>', 'an identifying name of the project')
  .option(
    '-m, --message <message>',
    'associate the run with a message (e.g. commit subject)',
  )
  .option('-a, --author <email>', 'the author of the commit')
  .option('--api-key <key>>', 'the API key for the account')
  .option('--api-secret <secret>', 'the API secret for the account')
  .option(
    '--endpoint <endpoint>',
    'where the API is located',
    'https://happo.io',
  )
  .usage('happo-deep-compare <sha1> <sha2> [options]')
  .action(async (sha1, sha2) => {
    try {
      const result = await happoDeepCompare({
        sha1,
        sha2,
        project: commander.project,
        apiKey: commander.apiKey,
        apiSecret: commander.apiSecret,
        endpoint: commander.endpoint,
        threshold: parseFloat(commander.threshold),
        link: commander.link,
        message: commander.message,
        author: commander.author,
      });
      if (result.equal) {
        process.exit(0);
      } else {
        process.exit(113);
      }
    } catch (e) {
      console.error(e);
      process.exit(1);
    }
  });

if (!process.argv.slice(2).length) {
  commander.outputHelp();
  process.exit(1);
} else {
  commander.parse(process.argv);
}
