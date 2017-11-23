import { Component } from 'react'
import PropTypes from 'prop-types'
import clone from 'clone'
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

  constructor (props) {
    super(props)
    this.state = { data: props.flowing ? props.data : clone(props.data) }
  }

  componentWillReceiveProps (nextProps) {
    // If we start or continue flowing then use the passed data
    if (nextProps.flowing) {
      this.setState({ data: nextProps.data })
    // ...otherwise if we stop flowing then take a copy of the data
    } else if (!nextProps.flowing && this.props.flowing) {
      this.setState({ data: clone(nextProps.data) })
    }
  }

  release = () => this.setState({ data: clone(this.props.data) })

  render () {
    const { children, data: liveData, flowing, idProp } = this.props
    const { data } = this.state
    const diff = flowing ? NoDiff : difference(data, liveData, idProp)
    return children(data, diff, this.release)
  }
}
