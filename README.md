<img src="https://user-images.githubusercontent.com/152863/33171665-06ce78d6-d045-11e7-8dd7-80fecd7a9ad1.png" width="150" />

# react-data-dam

[![Build Status](https://travis-ci.org/tableflip/react-data-dam.svg?branch=master)](https://travis-ci.org/tableflip/react-data-dam) [![dependencies Status](https://david-dm.org/tableflip/react-data-dam/status.svg)](https://david-dm.org/tableflip/react-data-dam) [![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)

> Holds back your data until you're ready to see the updates. Useful for implementing a Twitter style "See n new Tweets" button.

Initial data passed to `DataDam` will be passed onto it's children, but changes to that data are held back until the children signal that they want to receive it. Children are passed a diff object which describes the difference between the data they currently have and what is being held back so they know what they're missing.

## Install

```sh
npm install react-data-dam
```

## Usage

```js
import React from 'react'
import { DataDam } from 'react-data-dam'

export default ({ items }) => (
  <DataDam data={items}>
    {(data, diff, release) => (
      <div>
        <ul>
          {data.map((d) => <li>{d._id}</li>)}
        </ul>
        {diff.total.changes ? (
          <button onClick={release}>Load {diff.total.changes} updates</button>
        ) : null}
      </div>
    )}
  </DataDam>
)
```

## API

### `<DataDam />`

#### `data`

Type: `PropTypes.arrayOf(PropTypes.object).isRequired`

The data you want to build a dam against. Only the initial value will be passed through to child components until [`release`](#children) is called.

The [`flowing`](#flowing) prop can be used to allow data through from initial mount to a time that you're ready to enforce the dam.

Objects in the array should have an `_id` property to determine updates. This can be changed using the [`idProp`](#idprop) prop.

#### `children`

Type: `PropTypes.func.isRequired`

A function that renders the children. It is passed 3 parameters:

* `data` - the cached data since the last release or initial mount
* `diff` - the difference between the passed data and the data that is being held back
* `release` - a function to call that will release any data that is held back

The diff object looks like this:

```js
{
  added: [],
  removed: [],
  updated: [],
  total: {
    changes: 0,
    added: 0,
    removed: 0,
    updated: 0
  }
}
```

#### `flowing`

Type: `PropTypes.bool`, default: `false`

Allow data to flow freely through the dam without needing to call release.

#### `idProp`

Type: `PropTypes.string`, default: `_id`

Changes the property that is considered to be the ID of the data items.

#### `autoRelease`

Type: `PropTypes.func`

Called each time the held back data changes. When this function returns `true` the held back data will be released. It is passed 3 parameters:

* `data` - the cached data since the last release or initial mount
* `diff` - the difference between the passed data and the data that is being held back
* `nextData` - the data that is being held back

## Contribute

Feel free to dive in! [Open an issue](https://github.com/tableflip/react-data-dam/issues/new) or submit PRs.

## License

[MIT](LICENSE) © Alan Shaw

---

A [(╯°□°）╯︵TABLEFLIP](https://tableflip.io) side project.
