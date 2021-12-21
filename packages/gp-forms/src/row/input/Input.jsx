import React, { PropTypes } from 'react';
import get from 'lodash/get';
import { indexedTypes } from '@gostgroup/gp-data-types/lib';
import StringInput from './StringInput';
import TextInput from './TextInput';
import DateInput from './DateInput';
import ReferenceInput from './ReferenceInput';
import BoolInput from './BoolInput';
import FileInput from './FileInput';
import GeoJSONInput from './GeoJSONInput';
import ClassifierSchemaInput from './classifiers/ClassifierSchemaInput';
import ClassifierInput from './classifiers/ClassifierInput';
import LinkInput from './LinkInput';
import NumberInput from './NumberInput';

const selfUi = {
  string: StringInput,
  integer: NumberInput,
  text: TextInput,
  date: DateInput,
  reference: ReferenceInput,
  bool: BoolInput,
  file: FileInput,
  geojson: GeoJSONInput,
  classifier_schema: ClassifierSchemaInput,
  classifier: ClassifierInput,
  link: LinkInput,
};

export default class Input extends React.Component {
  static contextTypes = {
    ui: PropTypes.any,
  }

  static propTypes = {
    data: PropTypes.any,
    onDataChange: PropTypes.func.isRequired,
    config: PropTypes.object.isRequired,
    properties: PropTypes.object,
    error: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.array,
    ]),
  }

  getComponent = (ui, type) => ui[type] ? ui[type] : ui.string
  render() {
    const { config } = this.props;

    const props = {
      ...this.props,
    };

    const CustomComponent = get(indexedTypes, [config.type, 'form']);
    if (CustomComponent) {
      return <CustomComponent {...props} />;
    }
    const Component = this.context && this.context.ui ? this.getComponent(this.context.ui, config.type) : this.getComponent(selfUi, config.type);
    return <Component {...props} />;
  }
}
