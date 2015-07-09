# metalsmith-hyphenate [![Build Status](https://travis-ci.org/saneef/metalsmith-hyphenate.svg?branch=master)](https://travis-ci.org/saneef/metalsmith-hyphenate)

A Metalsmith plugin to hyphenate words. It’s based on [Bramstein’s](https://github.com/bramstein) [Hyper hyphenation engine](https://github.com/bramstein/Hypher)

## Installation

```
$ npm install metalsmith-hyphenate
```

## Usage

### CLI

Install via npm and then add the metalsmith-hyphenate key to your metalsmith.json plugins:

```JSON
{
  "plugins": {
    "metalsmith-hyphenate": {
      "elements": ["p", "blockquote"]
    }
  }
}
```

### JavaScript
Pass options to the hyphenate plugin and pass it to Metalsmith with the use method:

```JavaScript
var hyphenate = require('metalsmith-hyphenate');

metalsmith.use(hyphenate({
  "elements": ["p", "blockquote"],
  "langModule": "hyphenation.de",
  "ignore": ["archives/*"] // All the files inside 'archive' will not be hyphenated
}));
```

### Options

- `elements` - (Array) HTML elements which will be hyphenated. Default is `['p', 'a', 'li', 'ol']`
- `langModule` - (String) [Hyper](https://github.com/bramstein/Hypher#nodejs) [language rules](https://github.com/bramstein/hyphenation-patterns) to be used for hyphenation. Default is `'hyphenation.en-us'`. You need to install manually — `npm install <language-module>` – if you are going to use any language rule other than the default.
- `ignore` - (Array | String) You can use glob patterns to ignore some files.
