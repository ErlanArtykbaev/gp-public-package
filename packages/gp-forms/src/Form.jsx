import React, { Component, PropTypes } from 'react';
import get from 'lodash/get';
import isEmpty from 'lodash/isEmpty';
import { autobind } from 'core-decorators';
import ListForm from './ListForm';
import TableForm from './table/TableForm';
import { unwrapProperties } from './helpers/index.js';
import withFormContext from './withFormContext';
import SimpleLayout from './layouts/SimpleLayout';
import TabWrapperLayout from './layouts/wrapper/TabWrapperLayout';

const forms = {
  list: ListForm,
  table: TableForm,
};

@withFormContext
@autobind
export default class NsiForm extends Component {
  static contextTypes = {
    ui: PropTypes.any,
  };
  static propTypes = {
    data: PropTypes.object,
    FormRow: PropTypes.func.isRequired,
    validateRow: PropTypes.func.isRequired,
    readOnly: PropTypes.bool, // eslint-disable-line react/no-unused-prop-types
    allReferences: PropTypes.shape({}),
    handlePropertyChange: PropTypes.func.isRequired,
    schema: PropTypes.object.isRequired,
    WrapperLayout: PropTypes.func.isRequired,
    FormLayout: PropTypes.func.isRequired,
    FormRowLayout: PropTypes.func,
    FormRowComplexLayout: PropTypes.func,
  }

  static defaultProps = {
    WrapperLayout: TabWrapperLayout,
    FormLayout: SimpleLayout,
  }

  renderProperty(property) {
    if (isEmpty(property)) {
      return null;
    }
    const { data, FormRow, validateRow, allReferences, handlePropertyChange,
      FormRowLayout, FormRowComplexLayout } = this.props;
    const value = data ? data[property.id] : '';
    const FormRowComponent = this.context.ui ? FormRow : forms[property.type] || FormRow;
    return property.config && property.config.hidden ? null :
      (
        <FormRowComponent
          key={property.id}
          config={property}
          value={value}
          references={allReferences}
          error={validateRow(property, value, allReferences)}
          onValueChange={handlePropertyChange}
          Layout={FormRowLayout}
          ComplexLayout={FormRowComplexLayout}
        />
      );
  }

  render() {
    const { schema, FormLayout, WrapperLayout, FormRowLayout } = this.props;
    const unwrappedProperties = unwrapProperties(schema);

    const complexProperties = unwrappedProperties.filter(p => p.config.properties || p.type === 'table').filter(p => !get(p, 'config.hidden'));
    const mainProperties = unwrappedProperties.filter(p => !p.config.properties && p.type !== 'table');

    if (unwrappedProperties.length === 0) {
      return null;
    }

    return (
      <WrapperLayout
        allProperties={unwrappedProperties}
        mainProperties={mainProperties}
        complexProperties={complexProperties}
        renderProperty={this.renderProperty}
        schema={schema}
        FormLayout={FormLayout}
        FormRowLayout={FormRowLayout}
      />
    );
  }
}
