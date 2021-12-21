import React, { PropTypes } from 'react';
import Immutable from 'immutable';
import Div from '@gostgroup/gp-ui-components/lib/Div';
import Select from '../ui/select';


function AccessRightsConfig(props) {
  const { hidden, onChange, permissionGroups, accessConfig } = props;
  const options = permissionGroups.map(g => ({ value: g.id, label: g.title }));

  return (
    <Div hidden={hidden}>
      <Select
        multi
        value={accessConfig.get('read')}
        options={options}
        label="Видимость"
        onChange={onChange('read')}
      />
      <Select
        multi
        value={accessConfig.get('create')}
        options={options}
        label="Добавление"
        onChange={onChange('create')}
      />
      <Select
        multi
        value={accessConfig.get('update')}
        options={options}
        label="Редактирование"
        onChange={onChange('update')}
      />
    </Div>
  );
}

AccessRightsConfig.propTypes = {
  hidden: PropTypes.bool,
  permissionGroups: PropTypes.arrayOf(PropTypes.shape({})),
  accessConfig: PropTypes.shape({}),
  onChange: PropTypes.func,
};

AccessRightsConfig.defaultProps = {
  accessConfig: new Immutable.Map(),
  permissionGroups: [],
};

export default AccessRightsConfig;
