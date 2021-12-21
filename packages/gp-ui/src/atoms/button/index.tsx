import * as React from 'react'
import * as classNames from 'classnames'
import './index.scss'

export type ButtonType = 'primary' | 'danger'
export type ButtonHtmlType = 'button' | 'reset'
export type ButtonSize = 'small' | 'default' | 'large'

interface ButtonProps {
  type?: ButtonType
  htmlType?: ButtonHtmlType
  loading?: boolean
  disabled?: boolean
  size?: ButtonSize
  style?: React.CSSProperties
  onClick?: React.FormEventHandler<any>
  className?: string
}

interface ButtonState {
  loading: boolean
  clicked: boolean
}

export default class Button extends React.PureComponent<ButtonProps, ButtonState> {
  static defaultProps = {
    loading: false,
  }

  constructor(props: ButtonProps) {
    super(props)
    this.state = {
      loading: props.loading,
      clicked: false,
    }
  }

  handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    this.setState({ clicked: true })
    setTimeout(() => this.setState({ clicked: false }), 500)

    this.props.onClick && this.props.onClick(e)
  }
  render() {
    const { type, size, children, className, loading } = this.props
    const { clicked } = this.state

    const classes = classNames('btn', className, {
      [`btn-${type}`]: type,
      [`btn-${size}`]: size,
      [`btn-clicked`]: clicked,
      [`btn-loading`]: loading,
    })

    return (
      <button className={classes} onClick={this.handleClick}>
        {loading && <div className="btn-loading" />}
        <span>{children}</span>
      </button>
    )
  }
}
