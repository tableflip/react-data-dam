import test from 'ava'
import { shallow, configure } from 'enzyme'
import React from 'react'
import Adapter from 'enzyme-adapter-react-16'
import DataDam from '../src/DataDam'

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
        passedData = Array.from(data)
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
  const originalData = Array.from(data)

  let passedData = null

  const wrapper = shallow(
    <DataDam data={data} flowing={false}>
      {(data) => {
        // Take a copy of the data passed to us
        passedData = Array.from(data)
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
  const originalData = Array.from(data)

  let passedData = null

  const wrapper = shallow(
    <DataDam data={data} flowing>
      {(data) => {
        // Take a copy of the data passed to us
        passedData = Array.from(data)
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
  const originalData = Array.from(data)

  let passedData = null
  let passedRelease = null

  const wrapper = shallow(
    <DataDam data={data}>
      {(data, diff, release) => {
        // Take a copy of the data passed to us
        passedData = Array.from(data)
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

test('should correctly diff the changes', (t) => {
  const data = testData()
  const originalData = Array.from(data)

  let passedData = null
  let passedDiff = null

  const wrapper = shallow(
    <DataDam data={data}>
      {(data, diff) => {
        // Take a copy of the data passed to us
        passedData = Array.from(data)
        passedDiff = diff
      }}
    </DataDam>
  )

  // Ensure data and passedData are now the same
  t.deepEqual(passedData, data)

  // Remove the first item
  data.splice(0, 1)

  // Add a new item
  const newItem = { _id: `another${Date.now()}`, name: 'Another' }
  data.push(newItem)

  // Update the second item
  data[0] = Object.assign({}, data[0], { name: `name${Date.now()}` })

  wrapper.setProps({ data })

  // Ensure passedData is still original data
  t.deepEqual(passedData, originalData)

  t.is(passedDiff.added.length, 1)
  t.deepEqual(passedDiff.added[0], newItem)

  t.is(passedDiff.removed.length, 1)
  t.deepEqual(passedDiff.removed[0], originalData[0])

  t.is(passedDiff.updated.length, 1)
  t.deepEqual(passedDiff.updated[0], data[0])

  t.is(passedDiff.total.changes, 3)
  t.is(passedDiff.total.added, 1)
  t.is(passedDiff.total.removed, 1)
  t.is(passedDiff.total.updated, 1)
})

function testData () {
  return [
    { _id: 'one', name: 'First' },
    { _id: 'two', name: 'Second' },
    { _id: 'three', name: 'Third' }
  ]
}
