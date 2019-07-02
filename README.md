# happo-deep-compare

This tool is an experimental command acting as a replacement for [`happo
compare`](https://github.com/happo/happo.io#command-line-interface-cli).
The regular `happo compare` command will make a fast shallow diff between two
reports, reporting anything that has 1 or more pixel differences as a diff. The
`happo-deep-compare` command will download and make deep diffs between images
(using [`lcs-image-diff`](https://github.com/happo/lcs-image-diff)). This
process is slower but allows you to set a threshold value for allowed diffs.

## Installation

The `happo-deep-compare` command is bundled as an npm library.

```bash
npm install happo-deep-compare
```

## Usage

```bash
Usage:  happo-deep-compare <sha1> <sha2> [options]

Options:
  -V, --version                output the version number
  -t, --threshold <threshold>  diffs smaller than this threshold will be considered equal
(default: "0.1")
  -l, --link <url>             provide a link back to the commit
  -p, --project <name>         an identifying name of the project
  -m, --message <message>      associate the run with a message (e.g. commit subject)
  -a, --author <email>         the author of the commit
  --api-key <key>             the API key for the account
  --api-secret <secret>        the API secret for the account
  --endpoint <endpoint>        where the API is located (default: "https://happo.io")
  -h, --help                   output usage information
```

## Setting the threshold

Getting the threshold value right can be a little tricky. The diff value comes
from the algorithm used by
[`lcs-image-diff`(https://github.com/happo/lcs-image-diff/blob/1dd17ef513d55e352687216622db2f734a43f6b0/src/getDiffPixel.js#L7)
and represents the average Euclidean distance between all pixels in the images.
It is recommended to run the command a few times on a known Happo comparison
with different threshold values. To reset the comparison in between trial
runs, go to the "Ignored diffs" tab and undo the ignored diffs created by
`happo-deep-compare`.
