# react-data-dam

[![dependencies Status](https://david-dm.org/tableflip/react-data-dam/status.svg)](https://david-dm.org/tableflip/react-data-dam) [![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)

> Holds back your data until you're ready to see the updates.

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

---

A [(╯°□°）╯︵TABLEFLIP](https://tableflip.io) side project.
