import React, { PropTypes } from 'react';
import get from 'lodash/get';
import debounce from 'lodash/debounce';
import Select from 'react-select';
import { queryReferencesForEdit } from '@gostgroup/gp-api-services/lib/helpers/queryReferences';
import AuiButton from '../buttons/AuiButton';
import PropertySelector from './PropertySelector';
import FilterTypeSelector from './FilterTypeSelector';
import styles from './SingleFilter.scss';

export default function SingleFilter(props) {
  const { filter, element, refValues, onChange, onRemove, properties } = props;
  const absolutPath = element.element.absolutPath;
  let getOptions = (t, callback) => callback(null, { options: {} });
  let refValue = filter.value;

  const prop = get(element, 'element.schema.config.properties', [])
    .find(p => p.id === filter.key);
  const isReference = prop && prop.type === 'reference';

  if (isReference) {
    filter.type = 'equals';
    refValue = typeof filter.value !== 'undefined' ? refValues[filter.key] : '';
    const key = prop.config.key;

    getOptions = debounce((term = '', callback) => {
      let options = {};
      const value = typeof term === 'string' && !!term.trim() ? term.trim() : filter.value;
      queryReferencesForEdit(key, absolutPath, '', '', value).then((references) => {
        options = references.map(({ id, title }) => {
          const label = title;
          return { value: `${id}`, label };
        });

        callback(null, { options });
      });
    }, 300);
  }

  return (
    <div className={styles.filter}>
      <PropertySelector
        disabled={!!filter.persistent}
        value={filter.key}
        properties={properties}
        onChange={key => onChange({ ...filter, key })}
      />

      {!isReference && (<FilterTypeSelector
        disabled={!!filter.persistent}
        value={filter.type}
        onChange={type => onChange({ ...filter, type })}
      />)}

      {!isReference && (
        <div>
          <input
            className="form-control"
            type="text"
            disabled={!filter.key}
            value={filter.value}
            onChange={e => onChange({ ...filter, value: e.target.value })}
          />
        </div>
      )}

      {isReference && (<Select
        className={styles.select}
        asyncOptions={getOptions}
        cacheAsyncResults={false}
        autoload={false}
        value={refValue}
        onChange={value => onChange({ ...filter, value })}
        placeholder={''}
        noResultsText={'Ничего не найдено'}
        searchPromptText={'Введите строку для поиска'}
        searchingText={'Поиск'}
        clearValueText={'Очистить'}
      />)}

      {!filter.persistent && (
        <AuiButton onClick={onRemove}>
          <i className="fa fa-close" />
        </AuiButton>
      )}
    </div>
  );
}

SingleFilter.propTypes = {
  filter: PropTypes.shape({
    key: PropTypes.string,
    type: PropTypes.string,
    value: PropTypes.any,
  }),
  properties: PropTypes.arrayOf(PropTypes.shape({})),
  element: PropTypes.object,
  refValues: PropTypes.arrayOf(PropTypes.shape({})),
  onChange: PropTypes.func.isRequired,
  onRemove: PropTypes.func.isRequired,
};
