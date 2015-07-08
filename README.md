# metalsmith-hyphenate [![Build Status](https://travis-ci.org/saneef/metalsmith-hyphenate.svg?branch=master)](https://travis-ci.org/saneef/metalsmith-hyphenate)

A Metalsmith plugin to hyphenate words. It’s based on [Bramstein’s](https://github.com/bramstein) [Hyper hyphenation engine](https://github.com/bramstein/Hypher)

## Installation

```
$ npm install metalsmith-hyphenate
```

## Usage

### CLI

Install via npm and then add the metalsmith-hyphenate key to your metalsmith.json plugins:

```
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

```
var hyphenate = require('metalsmith-hyphenate');

metalsmith.use(hyphenate({
  "elements": ["p", "blockquote"],
  "langModule": "hyphenation.de"
}));
```

### Options

- `elements` - HTML elements which will be hyphenated. Default is `['p', 'a', 'li', 'ol']`
- `langModule` - [Hyper](https://github.com/bramstein/Hypher#nodejs) [language pattern](https://github.com/bramstein/hyphenation-patterns) to use. You need to install the language module separately. Default is `'hyphenation.en-us'`
