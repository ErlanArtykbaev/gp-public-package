import React from 'react';
import { WrapperLayoutPropTypes } from './index';

const BasicWrapperLayout = ({ allProperties, FormLayout, renderProperty }) => (
  <FormLayout>
    {allProperties.map(prop => renderProperty(prop))}
  </FormLayout>
);

BasicWrapperLayout.propTypes = WrapperLayoutPropTypes;

export default BasicWrapperLayout;
