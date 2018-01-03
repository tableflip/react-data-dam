import test from 'ava'
import { shallow, configure } from 'enzyme'
import React from 'react'
import Adapter from 'enzyme-adapter-react-16'
import clone from 'clone-deep'
import DataDam from '../src/DataDam'
import { NoDiff } from '../src/diff'
import testData from './fixtures/test-data'

configure({ adapter: new Adapter() })

test('should mount without exploding', (t) => {
  t.notThrows(() => {
    shallow(
      <DataDam data={testData()}>
        {() => <div />}
      </DataDam>
    )
  })
})

test('should pass LIVE data to children when flowing', (t) => {
  const data = testData()
  let passedData = null

  const wrapper = shallow(
    <DataDam data={data} flowing>
      {(data) => {
        // Take a copy of the data passed to us
        passedData = clone(data)
      }}
    </DataDam>
  )

  // Ensure data and passedData are now the same
  t.deepEqual(passedData, data)

  data.push({ _id: `another${Date.now()}`, name: 'Another' })
  wrapper.setProps({ data })

  // Ensure passedData is still data
  t.deepEqual(passedData, data)
})

test('should not pass LIVE data to children when not flowing', (t) => {
  const data = testData()
  const originalData = clone(data)

  let passedData = null

  const wrapper = shallow(
    <DataDam data={data} flowing={false}>
      {(data) => {
        // Take a copy of the data passed to us
        passedData = clone(data)
      }}
    </DataDam>
  )

  // Ensure data and passedData are now the same
  t.deepEqual(passedData, data)

  data.push({ _id: `another${Date.now()}`, name: 'Another' })
  wrapper.setProps({ data })

  // Ensure passedData is still originalData
  t.deepEqual(passedData, originalData)
})

test('should stop passing LIVE data to children after stop flowing', (t) => {
  const data = testData()
  const originalData = clone(data)

  let passedData = null

  const wrapper = shallow(
    <DataDam data={data} flowing>
      {(data) => {
        // Take a copy of the data passed to us
        passedData = clone(data)
      }}
    </DataDam>
  )

  // Ensure data and passedData are now the same
  t.deepEqual(passedData, data)

  wrapper.setProps({ flowing: false })
  data.push({ _id: `another${Date.now()}`, name: 'Another' })
  wrapper.setProps({ data })

  // Ensure passedData is still originalData
  t.deepEqual(passedData, originalData)
})

test('should pass LIVE data to children when release is called', (t) => {
  const data = testData()
  const originalData = clone(data)

  let passedData = null
  let passedRelease = null

  const wrapper = shallow(
    <DataDam data={data}>
      {(data, diff, release) => {
        // Take a copy of the data passed to us
        passedData = clone(data)
        passedRelease = release
      }}
    </DataDam>
  )

  // Ensure data and passedData are now the same
  t.deepEqual(passedData, data)

  // Remove the first item
  data.splice(0, 1)

  // Add a new item
  data.push({ _id: `another${Date.now()}`, name: 'Another' })

  // Update the second item
  data[0] = Object.assign({}, data[0], { name: `name${Date.now()}` })

  wrapper.setProps({ data })

  // Ensure passedData is still original data
  t.deepEqual(passedData, originalData)

  // Now release the data!
  passedRelease()

  // Ensure data and passedData are now the same
  t.deepEqual(passedData, data)
})

test('should correctly diff 1 add, 1 delete and 1 update', (t) => {
  const data = testData()
  const originalData = clone(data)

  let passedData = null
  let passedDiff = null

  const wrapper = shallow(
    <DataDam data={data}>
      {(data, diff) => {
        // Take a copy of the data passed to us
        passedData = clone(data)
        passedDiff = diff
      }}
    </DataDam>
  )

  // Ensure data and passedData are now the same
  t.deepEqual(passedData, data)

  // Remove the first item
  data.splice(0, 1)

  // Add a new item
  const newItems = [
    { _id: `another${Date.now()}`, name: 'Another' }
  ]

  data.push(...newItems)

  // Update the second item
  data[0].name = `name${Date.now()}`

  wrapper.setProps({ data })

  // Ensure passedData is still original data
  t.deepEqual(passedData, originalData)

  t.is(passedDiff.added.length, 1)
  t.deepEqual(passedDiff.added[0], newItems[0])

  t.is(passedDiff.removed.length, 1)
  t.deepEqual(passedDiff.removed[0], originalData[0])

  t.is(passedDiff.updated.length, 1)
  t.deepEqual(passedDiff.updated[0], data[0])

  t.is(passedDiff.total.changes, 3)
  t.is(passedDiff.total.added, 1)
  t.is(passedDiff.total.removed, 1)
  t.is(passedDiff.total.updated, 1)
})

test('should correctly diff 2 adds and 1 delete', (t) => {
  const data = testData()
  const originalData = clone(data)

  let passedData = null
  let passedDiff = null

  const wrapper = shallow(
    <DataDam data={data}>
      {(data, diff) => {
        // Take a copy of the data passed to us
        passedData = clone(data)
        passedDiff = diff
      }}
    </DataDam>
  )

  // Ensure data and passedData are now the same
  t.deepEqual(passedData, data)

  // Remove the first item
  data.splice(0, 1)

  // Add a new item
  const newItems = [
    { _id: `another1${Date.now()}`, name: 'Another 1' },
    { _id: `another2${Date.now()}`, name: 'Another 2' }
  ]

  data.push(...newItems)

  wrapper.setProps({ data })

  // Ensure passedData is still original data
  t.deepEqual(passedData, originalData)

  t.is(passedDiff.added.length, 2)
  t.deepEqual(passedDiff.added[0], newItems[0])
  t.deepEqual(passedDiff.added[1], newItems[1])

  t.is(passedDiff.removed.length, 1)
  t.deepEqual(passedDiff.removed[0], originalData[0])

  t.is(passedDiff.total.changes, 3)
  t.is(passedDiff.total.added, 2)
  t.is(passedDiff.total.removed, 1)
  t.is(passedDiff.total.updated, 0)
})

test('should correctly diff 1 add and 2 deletes', (t) => {
  const data = testData()
  const originalData = clone(data)

  let passedData = null
  let passedDiff = null

  const wrapper = shallow(
    <DataDam data={data}>
      {(data, diff) => {
        // Take a copy of the data passed to us
        passedData = clone(data)
        passedDiff = diff
      }}
    </DataDam>
  )

  // Ensure data and passedData are now the same
  t.deepEqual(passedData, data)

  // Remove the first 2 items
  data.splice(0, 2)

  // Add a new item
  const newItems = [
    { _id: `another1${Date.now()}`, name: 'Another 1' }
  ]

  data.push(...newItems)

  wrapper.setProps({ data })

  // Ensure passedData is still original data
  t.deepEqual(passedData, originalData)

  t.is(passedDiff.added.length, 1)
  t.deepEqual(passedDiff.added[0], newItems[0])

  t.is(passedDiff.removed.length, 2)
  t.deepEqual(passedDiff.removed[0], originalData[0])
  t.deepEqual(passedDiff.removed[1], originalData[1])

  t.is(passedDiff.total.changes, 3)
  t.is(passedDiff.total.added, 1)
  t.is(passedDiff.total.removed, 2)
  t.is(passedDiff.total.updated, 0)
})

test('should correctly diff no change', (t) => {
  const data = testData()
  const originalData = clone(data)

  let passedData = null
  let passedDiff = null

  const wrapper = shallow(
    <DataDam data={data}>
      {(data, diff) => {
        // Take a copy of the data passed to us
        passedData = clone(data)
        passedDiff = diff
      }}
    </DataDam>
  )

  // Ensure data and passedData are now the same
  t.deepEqual(passedData, data)

  wrapper.setProps({ data })

  // Ensure passedData is still original data
  t.deepEqual(passedData, originalData)

  t.deepEqual(passedDiff, NoDiff)
})

test('should contain new item in diff updates array', (t) => {
  const data = testData()
  const originalData = clone(data)

  let passedData = null
  let passedDiff = null

  const wrapper = shallow(
    <DataDam data={data}>
      {(data, diff) => {
        // Take a copy of the data passed to us
        passedData = clone(data)
        passedDiff = diff
      }}
    </DataDam>
  )

  // Ensure data and passedData are now the same
  t.deepEqual(passedData, data)

  const updatedName = `name${Date.now()}`

  // Update the first item
  data[0].name = updatedName

  // Add new items, this ensures data-dam iterates over the removed array and
  // so needs to pick the correct updated item to put in the diff.updated array
  const newItems = [
    { _id: `another1${Date.now()}`, name: 'Another 1' },
    { _id: `another2${Date.now()}`, name: 'Another 2' }
  ]

  data.push(...newItems)

  wrapper.setProps({ data })

  // Ensure passedData is still original data
  t.deepEqual(passedData, originalData)

  t.is(passedDiff.updated.length, 1)
  t.is(passedDiff.updated[0].name, updatedName)
})

test('should automatically release when autoRelease test passes', (t) => {
  const data = testData()
  const originalData = clone(data)

  let passedData = null

  const wrapper = shallow(
    <DataDam data={data} autoRelease={(_, diff) => diff.added.some((item) => item.doRelease)}>
      {(data) => {
        // Take a copy of the data passed to us
        passedData = clone(data)
      }}
    </DataDam>
  )

  // Ensure data and passedData are now the same
  t.deepEqual(passedData, data)

  // Add a new item
  data.push({ _id: `TEST${Date.now()}`, doRelease: false })

  wrapper.setProps({ data })

  // Ensure passedData is still original data
  t.deepEqual(passedData, originalData)

  // Add a new item (for autoRelease)
  data.push({ _id: `TEST${Date.now()}`, doRelease: true })

  wrapper.setProps({ data })

  t.deepEqual(passedData, data)
})
