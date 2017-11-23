import { Component } from 'react'
import PropTypes from 'prop-types'
import { difference, NoDiff } from './diff'

export default class DataDam extends Component {
  static propTypes = {
    data: PropTypes.arrayOf(PropTypes.object).isRequired,
    children: PropTypes.func.isRequired,
    flowing: PropTypes.bool,
    idProp: PropTypes.string
  }

  static defaultProps = {
    flowing: false,
    idProp: '_id'
  }

  state = { data: Array.from(this.props.data) }

  componentWillReceiveProps (nextProps) {
    if (nextProps.flowing) this.setState({ data: Array.from(nextProps.data) })
  }

  release = () => this.setState({ data: Array.from(this.props.data) })

  render () {
    const { children, data: liveData, flowing, idProp } = this.props
    const { data } = this.state
    const diff = flowing ? NoDiff : difference(data, liveData, idProp)
    return children(data, diff, this.release)
  }
}
