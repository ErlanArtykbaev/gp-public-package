import React, { PropTypes } from 'react';
import pick from 'lodash/pick';
import get from 'lodash/get';
import { AddressSuggestionsService } from '@gostgroup/gp-api-services/lib/services';
import BaseAutoSuggest from '@gostgroup/gp-ui-components/lib/AutoSuggest';
import Form from '@gostgroup/gp-ui-components/lib/forms/Form';
import togglable from '@gostgroup/gp-hocs/lib/togglable';
import mapDaDataSuggestions from './mapDaDataSuggestions';

const AutoSuggest = props => <BaseAutoSuggest suggestionsMapper={mapDaDataSuggestions} {...props} />;

function createRestrictedDadataSuggestions(bound, restriction) {
  return function getDaDataSuggestions(query) {
    return AddressSuggestionsService.post({
      query,
      locations: [{ ...restriction }],
      restrict_value: true,
      from_bound: { value: bound },
      to_bound: { value: bound },
    });
  };
}

function createRestrictedDadataSuggestionsBlock(bound, restriction, house) {
  return function getDaDataSuggestions(query) {
    return AddressSuggestionsService.post({
      query: `${house} ${query}`,
      locations: [{ ...restriction }],
      restrict_value: true,
      from_bound: { value: bound },
      to_bound: { value: bound },
    });
  };
}

@togglable('full', 'toggleForm', true)
export default class FullAddressForm extends React.Component {

  static contextTypes = {
    FormRow: PropTypes.func,
  }

  static propTypes = {
    address: PropTypes.shape({
      city: PropTypes.string,
      street: PropTypes.string,
    }),
    onChange: PropTypes.func,
    full: PropTypes.bool,
    toggleForm: PropTypes.func,
  }

  render() {
    const { address = {}, full, onChange, toggleForm } = this.props;
    const { block_with_type } = address;
    const combinedAdress = {
      additional: '',
      building: '',
    };
    const arrBlock = (block_with_type !== undefined && typeof block_with_type === 'string') ? block_with_type.split(' ') : [];
    for (let i = 0; i < arrBlock.length; i += 2) {
      if (arrBlock[i] === 'стр') {
        combinedAdress.building += `${arrBlock[i]} ${arrBlock[i + 1]} `;
      } else {
        combinedAdress.additional += `${arrBlock[i]} ${arrBlock[i + 1]} `;
      }
    }

    return (
      <Form horizontal>
        <Form.Group label="Полный адрес">
          <AutoSuggest value={get(address, 'unrestricted_value')} onSelect={v => onChange('unrestricted_value', v)} getSuggestions={createRestrictedDadataSuggestions()} />
        </Form.Group>
        {full &&
          <div>
            <Form.Group label="Индекс">
              <AutoSuggest value={get(address, 'postal_code')} onSelect={v => onChange('postal_code', v)} getSuggestions={createRestrictedDadataSuggestions('postal_code')} />
            </Form.Group>
            <Form.Group label="Город">
              <AutoSuggest value={get(address, 'city_with_type')} onSelect={v => onChange('city', v)} getSuggestions={createRestrictedDadataSuggestions('city')} />
            </Form.Group>
            <Form.Group label="Административный округ">
              <AutoSuggest value={get(address, 'city_area')} onSelect={v => onChange('city_area', v)} getSuggestions={createRestrictedDadataSuggestions('city_area')} />
            </Form.Group>
            <Form.Group label="Район города">
              <AutoSuggest value={get(address, 'city_district')} onSelect={v => onChange('city_district', v)} getSuggestions={createRestrictedDadataSuggestions('city_district')} />
            </Form.Group>
            <Form.Group label="Улица">
              <AutoSuggest value={get(address, 'street_with_type')} onSelect={v => onChange('street', v)} getSuggestions={createRestrictedDadataSuggestions('street', pick(address, ['country', 'city']))} />
            </Form.Group>
            <Form.Group label="Дом">
              <AutoSuggest value={get(address, 'house_with_type')} type="house" onSelect={v => onChange('house', v)} getSuggestions={createRestrictedDadataSuggestions('house', pick(address, ['country', 'city', 'street']))} />
            </Form.Group>
            <Form.Group label="Строение">
              <AutoSuggest value={get(combinedAdress, 'building')} onSelect={v => onChange('building', v)} getSuggestions={createRestrictedDadataSuggestionsBlock('block', pick(address, ['country', 'city', 'street']), get(address, 'house_with_type'))} />
            </Form.Group>
            <Form.Group label="Дополнение к номеру дома">
              <AutoSuggest value={get(combinedAdress, 'additional')} onSelect={v => onChange('additional', v)} getSuggestions={createRestrictedDadataSuggestionsBlock('block', pick(address, ['country', 'city', 'street']), get(address, 'house_with_type'))} />
            </Form.Group>
          </div>
        }
        <button type="button" className="sh-btn btn" style={{ marginTop: 20 }} onClick={toggleForm}>{full ? 'Скрыть' : 'Показать'} полную форму</button>
      </Form>
    );
  }
}
