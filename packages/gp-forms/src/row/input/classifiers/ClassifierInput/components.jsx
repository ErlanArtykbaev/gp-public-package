import React from 'react';
import Button from 'react-bootstrap/lib/Button';

import Div from '@gostgroup/gp-ui-components/lib/Div';
import styles from './classifierInput.scss';

export const DefaultEditButton = ({ className, onClick, disabled }) => (
  <Button className={className} onClick={onClick} disabled={disabled}>
    <span className="fa fa-edit" />
  </Button>
);

export const DefaultSpinner = () => <span className="aui-icon aui-icon-wait" />;

/**
 * Если нужна более сложная вёрстка, то мы её делаем тут
 */
export const defaultRenderElements = elements => elements.loadingElement || Object.keys(elements).map(elementKey => elements[elementKey]);

export const DefaultInlineEditor = ({ FormRow, ...restProps }) => (
  <Div className={styles.inlineClassifierData}>
    <FormRow {...restProps} />
  </Div>
);
