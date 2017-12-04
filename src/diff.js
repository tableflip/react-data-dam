import deepEqual from 'fast-deep-equal'

export function difference (a, b, idProp = '_id') {
  const diff = {
    // All b items whose ID is not equal to every a item
    added: b.filter((bItem) => a.every((aItem) => aItem[idProp] !== bItem[idProp])),
    // All a items whose ID is not equal to every b item
    removed: a.filter((aItem) => b.every((bItem) => aItem[idProp] !== bItem[idProp])),
    // All b items who also exist in a, what aren't deepEqual to each other
    updated: b.filter((bItem) => {
      return a.some((aItem) => aItem[idProp] === bItem[idProp] && !deepEqual(aItem, bItem))
    })
  }

  diff.total = {
    changes: diff.added.length + diff.removed.length + diff.updated.length,
    added: diff.added.length,
    removed: diff.removed.length,
    updated: diff.updated.length
  }

  return diff
}

export const NoDiff = Object.freeze({
  added: [],
  removed: [],
  updated: [],
  total: {
    changes: 0,
    added: 0,
    removed: 0,
    updated: 0
  }
})
