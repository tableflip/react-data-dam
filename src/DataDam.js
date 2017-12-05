import { Component } from 'react'
import PropTypes from 'prop-types'
import clone from 'clone'
import { difference, NoDiff } from './diff'

export default class DataDam extends Component {
  static propTypes = {
    data: PropTypes.arrayOf(PropTypes.object).isRequired,
    children: PropTypes.func.isRequired,
    flowing: PropTypes.bool,
    idProp: PropTypes.string,
    autoRelease: PropTypes.func
  }

  static defaultProps = {
    idProp: '_id'
  }

  constructor (props) {
    super(props)
    this.state = {
      data: props.flowing ? props.data : clone(props.data),
      diff: NoDiff
    }
  }

  componentWillReceiveProps (nextProps) {
    this.setState((state, props) => {
      // If we start or continue flowing then use the passed data
      if (nextProps.flowing) {
        return { data: nextProps.data, diff: NoDiff }
      }

      // ...else if we stop flowing then take a copy of the data
      if (!nextProps.flowing && props.flowing) {
        return { data: clone(nextProps.data), diff: NoDiff }
      }

      // ...otherwise we continue not flowing, and need to recalc the diff
      const diff = difference(state.data, nextProps.data, nextProps.idProp)

      if (nextProps.autoRelease && nextProps.autoRelease(state.data, diff)) {
        return { data: clone(nextProps.data), diff: NoDiff }
      }

      return { diff }
    })
  }

  release = () => this.setState({ data: clone(this.props.data), diff: NoDiff })

  render () {
    return this.props.children(this.state.data, this.state.diff, this.release)
  }
}
