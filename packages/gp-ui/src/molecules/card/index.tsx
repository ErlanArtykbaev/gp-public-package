import * as React from 'react'
import * as classNames from 'classnames'
import './index.scss'
import {Title, Button} from 'src';
interface CardProps {
  className?: string
  title?: string
  submitButton?: string
  cancelButton?: string
  style?: React.CSSProperties
}

export default class Card extends React.PureComponent<CardProps> {
  render() {
    const { className, title, submitButton, cancelButton, style, children } = this.props;

    return (
      <div className={classNames('card', className)} style={style}>
        {title && (
          <div className="card-title">
            <Title>{title}</Title>
          </div>
        )}
        <div className="card-body">{children}</div>
        {(submitButton || cancelButton) && (
          <div className="card-buttons">
            {submitButton && (
              <Button type="primary" size="small">
                {submitButton}
              </Button>
            )}
            {cancelButton && (
              <Button type="danger" size="small">
                {cancelButton}
              </Button>
            )}
          </div>
        )}
      </div>
    )
  }
}
