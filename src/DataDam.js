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
    // If we start or continue flowing then use the passed data
    if (nextProps.flowing) {
      this.setState({ data: nextProps.data, diff: NoDiff })
      // ...else if we stop flowing then take a copy of the data
    } else if (!nextProps.flowing && this.props.flowing) {
      this.setState({ data: clone(nextProps.data), diff: NoDiff })
    // ...otherwise we continue not flowing, and need to recalc the diff
    } else if (!nextProps.flowing) {
      const diff = difference(this.state.data, nextProps.data, nextProps.idProp)
      const { autoRelease } = nextProps

      if (diff.total.changes && autoRelease && autoRelease(this.state.data, diff)) {
        this.setState({ data: clone(nextProps.data), diff: NoDiff })
      } else {
        this.setState({ diff })
      }
    }
  }

  release = () => this.setState({ data: clone(this.props.data), diff: NoDiff })

  render () {
    return this.props.children(this.state.data, this.state.diff, this.release)
  }
}
