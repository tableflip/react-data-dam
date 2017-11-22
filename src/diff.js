import genericDiff from 'generic-diff'
import deepEqual from 'fast-deep-equal'

function filterDiffs (diffs, test) {
  return diffs
    .filter(test)
    .reduce((items, diff) => items.concat(diff.items), [])
}

export function difference (a, b, idProp = '_id') {
  const eqlId = (a, b) => a[idProp] === b[idProp]
  const eql = (a, b) => eqlId(a, b) ? deepEqual(a, b) : false

  const diffs = genericDiff(a, b, eql)

  let added = filterDiffs(diffs, (d) => d.added)
  let removed = filterDiffs(diffs, (d) => d.removed)
  let updated = []

  if (added.length && removed.length) {
    // Updates are items in both added and removed
    const items = added.length > removed.length ? removed : added
    const otherItems = items === added ? removed : added

    updated = items.reduce((items, item) => {
      if (otherItems.find((otherItem) => eqlId(otherItem, item))) {
        items.push(item)
      }
      return items
    }, [])

    if (updated.length) {
      added = added.filter((a) => !updated.some((u) => eqlId(a, u)))
      removed = removed.filter((a) => !updated.some((u) => eqlId(a, u)))
    }
  }

  return {
    added,
    removed,
    updated,
    total: {
      changes: added.length + removed.length + updated.length,
      added: added.length,
      removed: removed.length,
      updated: updated.length
    }
  }
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
