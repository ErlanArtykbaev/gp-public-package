import * as React from 'react';
import styled, { MTP, StyledComponentClass } from '../../index';
import { Theme } from '../../theme';
export interface CircleProps {
  size?: 'default' | 'small' | 'large';
  icon?: string;
}

export class Circle extends React.PureComponent<CircleProps> {
  static defaultProps = {
    size: 'default',
  };
  render() {
    return <StyledCircle size={this.props.size}>{this.props.children}</StyledCircle>;
  }
}
export type StyledProps = MTP<CircleProps>;

export const StyledCircle = styled.div`
  height: ${(props: StyledProps) => props.theme.circle.height[props.size]};
  width: ${(props: StyledProps) => props.theme.circle.width[props.size]};
  box-shadow: ${(props: StyledProps) => props.theme.circle.box.shadow};
  background-color: ${(props: StyledProps) => props.theme.circle.background.color};
  border-width: ${(props: StyledProps) => props.theme.circle.border.width};
  border-style: ${(props: StyledProps) => props.theme.circle.border.style};
  border-color: ${(props: StyledProps) => props.theme.circle.border.color};
  border-radius: ${(props: StyledProps) => props.theme.circle.border.radius};
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
`;
