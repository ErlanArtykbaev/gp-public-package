import React, { PropTypes } from 'react';
import get from 'lodash/get';
import Form from '@gostgroup/gp-ui-components/lib/forms/Form';
import BaseAutoSuggest from '@gostgroup/gp-ui-components/lib/AutoSuggest';
import togglable from '@gostgroup/gp-hocs/lib/togglable';
import { CompanySuggestionsService } from '@gostgroup/gp-api-services/lib/services';

function getDaDataSuggestions(query) {
  return CompanySuggestionsService.post({ query });
}

function mapDaDataSuggestions(suggestion) {
  return {
    value: suggestion.value,
    label: suggestion.value,
    unrestricted_value: suggestion.unrestricted_value,
    companyData: suggestion.data,
  };
}

const AutoSuggest = props => <BaseAutoSuggest suggestionsMapper={mapDaDataSuggestions} {...props} />;

@togglable('full', 'toggleForm', true)
export default class CompanyForm extends React.Component {

  static propTypes = {
    company: PropTypes.shape({
      name: PropTypes.string,
      inn: PropTypes.string,
      opf: PropTypes.string,
      ogrn: PropTypes.string,
      kpp: PropTypes.string,
      okpo: PropTypes.string,
      address: PropTypes.string,
    }),
    onChange: PropTypes.func,
    full: PropTypes.bool,
    toggleForm: PropTypes.func,
  }

  render() {
    const { company = {}, onChange, full, toggleForm } = this.props;

    return (
      <Form horizontal>
        <Form.Group label="ИНН">
          <AutoSuggest
            value={get(company, 'inn')}
            onSelect={v => onChange('inn', v)}
            getSuggestions={getDaDataSuggestions}
          />
        </Form.Group>
        <Form.Group label="Название организации">
          <AutoSuggest
            value={get(company, 'name')}
            onSelect={v => onChange('name', v)}
            getSuggestions={getDaDataSuggestions}
          />
        </Form.Group>
        {full &&
          <div>
            <Form.Group label="ОПФ">
              <AutoSuggest
                value={get(company, 'opf')}
                onSelect={v => onChange('opf', v)}
                getSuggestions={getDaDataSuggestions}
              />
            </Form.Group>
            <Form.Group label="ОГРН">
              <AutoSuggest
                value={get(company, 'ogrn')}
                onSelect={v => onChange('ogrn', v)}
                getSuggestions={getDaDataSuggestions}
              />
            </Form.Group>
            <Form.Group label="КПП">
              <AutoSuggest
                value={get(company, 'kpp')}
                onSelect={v => onChange('kpp', v)}
                getSuggestions={getDaDataSuggestions}
              />
            </Form.Group>
            <Form.Group label="ОКПО">
              <AutoSuggest
                value={get(company, 'okpo')}
                onSelect={v => onChange('okpo', v)}
                getSuggestions={getDaDataSuggestions}
              />
            </Form.Group>
            <Form.Group label="Адрес организации">
              <AutoSuggest
                value={get(company, 'address')}
                onSelect={v => onChange('address', v)}
                getSuggestions={getDaDataSuggestions}
              />
            </Form.Group>
          </div>
        }
        <button type="button" className="sh-btn btn" style={{ marginTop: 20 }} onClick={toggleForm}>{full ? 'Скрыть' : 'Показать'} полную форму</button>
      </Form>
    );
  }

}
