import * as React from 'react';
import styled, { MTP, StyledComponentClass } from '../../index';
import { Theme } from '../../theme';

export type ButtonType = 'primary' | 'default' | 'danger';
export type ButtonSize = 'small' | 'default' | 'large';

export interface ButtonProps {
  type?: ButtonType;
  htmlType?: string;
  size?: ButtonSize;
  onClick?: React.FormEventHandler<any>;
  onMouseUp?: React.FormEventHandler<any>;
  onMouseDown?: React.FormEventHandler<any>;
  onKeyPress?: React.KeyboardEventHandler<any>;
  onKeyDown?: React.KeyboardEventHandler<any>;
  loading?: boolean | { delay?: number };
  disabled?: boolean;
  style?: React.CSSProperties;
  className?: string;
}

export class Button extends React.Component<ButtonProps, any> {
  static defaultProps = {
    loading: false,
    type: 'default',
    size: 'default',
  };

  timeout: number;
  delayTimeout: number;

  constructor(props: ButtonProps) {
    super(props);
    this.state = {
      loading: props.loading,
      clicked: false,
    };
  }

  componentWillReceiveProps(nextProps: ButtonProps) {
    const currentLoading = this.props.loading;
    const loading = nextProps.loading;

    if (currentLoading) {
      clearTimeout(this.delayTimeout);
    }

    if (typeof loading !== 'boolean' && loading && loading.delay) {
      this.delayTimeout = window.setTimeout(() => this.setState({ loading }), loading.delay);
    } else {
      this.setState({ loading });
    }
  }

  componentWillUnmount() {
    if (this.timeout) {
      clearTimeout(this.timeout);
    }
    if (this.delayTimeout) {
      clearTimeout(this.delayTimeout);
    }
  }

  handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    this.setState({ clicked: true });
    clearTimeout(this.timeout);
    this.timeout = window.setTimeout(() => this.setState({ clicked: false }), 500);

    const onClick = this.props.onClick;
    if (onClick) {
      onClick(e);
    }
  };

  render() {
    const { type, size, className, htmlType, children, style, ...others } = this.props;
    const { loading, clicked } = this.state;

    return (
      <ButtonSC onClick={this.handleClick} type={type} size={size}>
        {this.props.children}
      </ButtonSC>
    );
  }
}

export type StyledProps = MTP<ButtonProps>;

export const ButtonSC = styled.button`
  background-color: ${(p: StyledProps) => p.theme.button.background.color[p.type]};
  border-width: ${(p: StyledProps) => p.theme.button.border.width};
  border-style: ${(p: StyledProps) => p.theme.button.border.style};
  border-color: ${(p: StyledProps) => p.theme.button.border.color[p.type]};
  border-radius: ${(p: StyledProps) => p.theme.button.border.radius};
  color: ${(p: StyledProps) => p.theme.button.color[p.type]};
  font-size: ${(p: StyledProps) => p.theme.button.font.size[p.size]};
  height: ${(p: StyledProps) => p.theme.button.height[p.size]};
  margin: ${(p: StyledProps) => p.theme.button.margin};
  padding: ${(p: StyledProps) => p.theme.button.padding};
  text-decoration: none;
  &:hover,
  &:focus {
    outline: none;
    background-color: ${(p: StyledProps) => p.theme.button.background.color.hover[p.type]};
    color: ${(p: StyledProps) => p.theme.button.color.hover[p.type]};
  }
`;
