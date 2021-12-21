import React, { PropTypes } from 'react';
import get from 'lodash/get';
import isEqual from 'lodash/isEqual';
import { AddressSuggestionsService } from '@gostgroup/gp-api-services/lib/services';
import FullAddressForm from './FullAddressForm';
import mapDaDataSuggestions from './mapDaDataSuggestions';

const FIELDS = [
  'city', 'street', 'house', 'city_with_type', 'street_with_type', 'house_type',
  'house_with_type', 'postal_code', 'block_type', 'block', 'block_with_type',
  'city_district', 'city_area',
];

const FIELDS_MAP = {
  city: 'city_with_type',
  street: 'street_with_type',
  // house: 'house_with_type',
  block: 'block_with_type',
};

export default class FiasForm extends React.Component {

  static propTypes = {
    data: PropTypes.shape({
      unrestricted_value: PropTypes.string,
    }),
    onDataChange: PropTypes.func,
  }

  static contextTypes = {
    readOnly: PropTypes.bool,
  }

  componentDidMount() {
    this.loadData();
  }

  componentWillReceiveProps(props) {
    const receivedFullAddress = props.data && Object.keys(props.data).length === 1 && props.data.unrestricted_value;
    if (receivedFullAddress || !isEqual(props.data, this.props.data)) {
      this.loadData(props.data);
    }
  }

  loadData(data = this.props.data) {
    if (get(data, 'unrestricted_value')) {
      AddressSuggestionsService.post({ query: data.unrestricted_value, count: 1 })
        .then(({ suggestions }) => {
          const possibleValue = get(suggestions.map(mapDaDataSuggestions), [0]);
          if (possibleValue) {
            this.handleAddressFieldChange('unrestricted_value', possibleValue);
          }
        });
    }
  }

  handleAddressFieldChange = (id, { value, addressData, unrestricted_value }) => {
    const newData = {
      unrestricted_value,
    };
    if (id !== 'unrestricted_value') {
      newData[id] = addressData[id];
      // Все поля кроме полного поля соотв айди мы приравниваем к адресному
      FIELDS.filter(f => f !== FIELDS_MAP[id]).forEach((f) => {
        newData[f] = addressData[f];
      });
      if (id === 'house') {
        newData.house_with_type = `${addressData.house_type} ${addressData.house}`;
      } else {
        newData[FIELDS_MAP[id]] = value;
      }
    } else {
      FIELDS.forEach((f) => {
        if (f === 'house_with_type') {
          if (addressData.house_type !== null && addressData.house !== null) {
            newData[f] = `${addressData.house_type} ${addressData.house}`;
          } else {
            newData[f] = null;
          }
        } else {
          newData[f] = addressData[f];
        }
      });
    }
    this.props.onDataChange(newData);
  }

  render() {
    const { readOnly } = this.context;
    return (
      <div>
        {readOnly && <div>{get(this.props.data, 'value')}</div>}
        <FullAddressForm address={this.props.data} onChange={this.handleAddressFieldChange} />
      </div>
    );
  }
}
