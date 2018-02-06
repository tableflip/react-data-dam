import deepEqual from 'fast-deep-equal'

export function difference (a, b, idProp = '_id') {
  const added = []
  const updated = []
  const moved = []
  let removed = Array.from(a)

  b.forEach((bItem, bItemIndex) => {
    const aItemIndex = a.findIndex(aItem => aItem[idProp] === bItem[idProp])

    if (aItemIndex === -1) {
      added.push(bItem) // Added are items in b that are not in a
    } else {
      if (!deepEqual(a[aItemIndex], bItem)) {
        updated.push(bItem) // Updated are items in both a and b and are not deep equal
      }

      if (aItemIndex !== bItemIndex) {
        moved.push(bItem) // Moved are items in both a and b and do not have the same index
      }

      // Eventually removed becomes the list of removed items
      removed[aItemIndex] = null
    }
  })

  removed = removed.filter(Boolean)

  const diff = {
    added,
    removed,
    updated,
    moved,
    total: {
      changes: added.length + removed.length + updated.length,
      added: added.length,
      removed: removed.length,
      updated: updated.length,
      moved: moved.length
    }
  }

  return diff
}

export const NoDiff = Object.freeze({
  added: Object.freeze([]),
  removed: Object.freeze([]),
  updated: Object.freeze([]),
  moved: Object.freeze([]),
  total: Object.freeze({
    changes: 0,
    added: 0,
    removed: 0,
    updated: 0,
    moved: 0
  })
})
