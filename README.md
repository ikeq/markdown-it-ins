# markdown-it-ins

[![CI](https://github.com/markdown-it/markdown-it-ins/workflows/CI/badge.svg?branch=master)](https://github.com/markdown-it/markdown-it-ins/actions)
[![NPM version](https://img.shields.io/npm/v/markdown-it-ins.svg?style=flat)](https://www.npmjs.org/package/markdown-it-ins)
[![Coverage Status](https://img.shields.io/coveralls/markdown-it/markdown-it-ins/master.svg?style=flat)](https://coveralls.io/r/markdown-it/markdown-it-ins?branch=master)

> `<ins>` tag plugin for [markdown-it](https://github.com/markdown-it/markdown-it) markdown parser.

__v3.+ requires `markdown-it` v10.+, see changelog.__

`++inserted++` => `<ins>inserted</ins>`

Markup uses the same conditions as CommonMark [emphasis](http://spec.commonmark.org/0.15/#emphasis-and-strong-emphasis).


## Install

node.js, browser:

```bash
npm install markdown-it-ins --save
bower install markdown-it-ins --save
```

## Use

```js
var md = require('markdown-it')()
            .use(require('markdown-it-ins')({ marker: '+', tag: 'ins' }));

md.render('++inserted++') // => '<p><ins>inserted</ins></p>'
```

_Differences in browser._ If you load script directly into the page, without
package system, module will add itself globally as `window.markdownitIns`.


## License

[MIT](https://github.com/markdown-it/markdown-it-ins/blob/master/LICENSE)
