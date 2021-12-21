import * as styledComponents from 'styled-components';
import * as React from 'react';
import { ThemedStyledComponentsModule, ThemedStyledProps, StyledComponentClass } from 'styled-components';
import { Theme, theme } from './theme';

export type MTP<P> = ThemedStyledProps<P, Theme>;

const { default: styled, css, injectGlobal, keyframes, ThemeProvider } = styledComponents as ThemedStyledComponentsModule<Theme>;

export { css, injectGlobal, keyframes, ThemeProvider, ThemedStyledProps, StyledComponentClass, theme };
export default styled;
