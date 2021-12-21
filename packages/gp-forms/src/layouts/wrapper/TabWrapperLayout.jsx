import React from 'react';
import Tabs from 'react-bootstrap/lib/Tabs';
import Tab from 'react-bootstrap/lib/Tab';
import { WrapperLayoutPropTypes } from './index';

const TabWrapperLayout = ({ schema, mainProperties, complexProperties, FormLayout, renderProperty }) => (
  <Tabs defaultActiveKey={schema.id} id="form-tabs">
    <Tab mountOnEnter unmountOnExit eventKey={schema.id} key={schema.id} title={schema.title}>
      <FormLayout>
        {mainProperties.map(prop => renderProperty(prop))}
      </FormLayout>
    </Tab>
    {complexProperties.map(prop => (
      <Tab mountOnEnter unmountOnExit eventKey={prop.id} title={prop.title} key={prop.id}>
        <FormLayout>
          {renderProperty(prop)}
        </FormLayout>
      </Tab>
    ))}
  </Tabs>
);

TabWrapperLayout.propTypes = WrapperLayoutPropTypes;

export default TabWrapperLayout;
