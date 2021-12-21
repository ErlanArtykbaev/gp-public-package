import React, { PropTypes } from 'react';
import SimpleGriddle from '@gostgroup/gp-ui-components/lib/SimpleGriddle';
import { Link } from 'react-router';
import Select from 'react-select';
import { getStatusLabels, isDisabledByParent } from '@gostgroup/gp-utils/lib/util.js';
import get from 'lodash/get';
import getRouteNameByType from '@gostgroup/gp-utils/lib/getRouteNameByType';
import connectToConfig from '../../../modules/connectToConfig';
import { DetailsToggle } from '../common/configurableDetails';

const OBJECT_TITLES = {
  group: 'Группа',
  element: 'Справочник',
};

const TypeComponent = connectToConfig(
  appConfig => ({
    elementLikeEntitites: get(appConfig, 'modules.nsi.elementLikeEntities'),
  })
)(({ data, elementLikeEntitites }) => {
  const text = OBJECT_TITLES[data] || get((elementLikeEntitites || []).find(e => e.type === data), 'title', 'Нет данных');

  return <span className="capitalize">{text}</span>;
});

TypeComponent.propTypes = {
  data: PropTypes.string,
};

const StatusComponent = ({ rowData }) => {
  const disabled = isDisabledByParent(rowData);
  const itemType = rowData.type;
  const status = disabled ? 'not_available_parent' : rowData.status;
  return <span>{getStatusLabels(status, itemType)}</span>;
};

StatusComponent.propTypes = {
  rowData: PropTypes.shape({}),
};

const TitleComponent = ({ rowData }) => {
  const { shortTitle, absolutPath, type } = rowData;

  return (
    <Link to={`/${getRouteNameByType(type)}s/${absolutPath}`}>
      {shortTitle}
    </Link>
  );
};

TitleComponent.propTypes = {
  rowData: PropTypes.shape({}),
};

const columnMetadata = [
  {
    columnName: 'fullTitle',
    displayName: 'Полное наименование',
  },
  {
    columnName: 'shortTitle',
    displayName: 'Краткое наименование',
    customComponent: TitleComponent,
  },
  {
    columnName: 'key',
    displayName: 'Ключ',
  },
  {
    columnName: 'type',
    displayName: 'Тип',
    customComponent: TypeComponent,
  },
  {
    columnName: 'dateStart',
    displayName: 'Дата начала',
  },
  {
    columnName: 'dateEnd',
    displayName: 'Дата окончания',
  },
  {
    columnName: 'status',
    displayName: 'Статус',
    customComponent: StatusComponent,
  },
];

// const columns = get(config, ['group', 'columns'], [
//   'shortTitle',
//   'type',
//   'dateStart',
//   'dateEnd',
//   'fullTitle',
//   'key',
//   'status',
// ]);

const defaultColumns = [
  'shortTitle',
  'type',
  'dateStart',
  'dateEnd',
  'fullTitle',
  'key',
  'status',
];

@connectToConfig(
  appConfig => ({
    columns: get(appConfig, ['group', 'columns'], defaultColumns),
  })
)
export default class ChildrenTable extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      filter: 2,
    };

    this.filterOptions = [
      { value: 1, label: 'Показывать все' },
      { value: 2, label: 'Скрывать все аннулированные' },
      { value: 3, label: 'Скрывать только аннулированные вручную' },
      { value: 4, label: 'Скрывать только аннулированные родителем' },
    ];
  }

  onFilterChange = (filter) => {
    this.setState({ filter });
  }

  render() {
    const { item, columns } = this.props;
    const children = item.children;

    if (!children) {
      return null;
    }

    // delete children so that table would not be a tree
    let data = children.map((child) => {
      const result = Object.assign({}, child);
      delete result.children;
      return result;
    });

    data = data.filter((element) => {
      switch (parseInt(this.state.filter, 10)) {
        case 1:
          return true;
        case 2:
          return element.status !== 'not_available' && !isDisabledByParent(element);
        case 3:
          return element.status !== 'not_available';
        case 4:
          return !isDisabledByParent(element);
        default:
          return false;
      }
    });

    const rowMetadata = {
      bodyCssClassName(rowData) {
        if ((rowData.status && rowData.status === 'not_available') ||
            (typeof rowData.isAvailable !== 'undefined' && rowData.isAvailable === false)) {
          return 'standard-row unavailable-row';
        }
        return 'standard-row';
      },
    };

    return (
      <div>
        <DetailsToggle {...this.props} className="sh-btn btn btn-default hide-service-information" />
        <div className="select-filter-container">
          <Select
            options={this.filterOptions}
            value={this.state.filter}
            searchable={false}
            onChange={this.onFilterChange}
            backspaceRemoves={false}
            clearable={false}
          />
        </div>
        <div style={{ marginTop: 20, overflow: 'auto' }}>
          <SimpleGriddle
            results={data}
            columnMetadata={columnMetadata}
            columns={columns}
            key={item.absolutPath}
            rowMetadata={rowMetadata}
          />
        </div>
      </div>
    );
  }

}
