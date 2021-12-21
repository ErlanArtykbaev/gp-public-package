import React, { PropTypes, Component } from 'react';
import SimpleGriddle from '@gostgroup/gp-ui-components/lib/SimpleGriddle';
import Paginator from '@gostgroup/gp-ui-components/lib/Paginator';
import {
  RfcInboxErrorsService,
} from '@gostgroup/gp-api-services/lib/services';

import { hasValidationErrors } from '@gostgroup/gp-utils/lib/util.js';

const columnMetadata1 = [
  {
    columnName: 'uuid',
    displayName: 'ID изменения',
  },
  {
    columnName: 'error',
    displayName: 'Ошибка',
  },
  {
    columnName: 'fieldId',
    displayName: 'ID поля',
  },
];

const columnMetadata2 = [
  {
    columnName: 'uuid',
    displayName: 'ID изменения',
  },
  {
    columnName: 'error',
    displayName: 'Ошибка',
  },
];

const columns1 = [
  'uuid',
  'fieldId',
  'error',
];

const columns2 = [
  'uuid',
  'error',
];

export default class ValidationResult extends Component {

  static propTypes = {
    customValidateResult: PropTypes.shape({}),
    validateDataResult: PropTypes.shape({}),
    subProcessId: PropTypes.string,
  }

  constructor(props) {
    super(props);

    const { validateDataResult } = props;

    this.state = {
      validateDataResult: validateDataResult || {},
    };
  }

  async onPageChange(page) {
    const validateDataResult = await RfcInboxErrorsService.path(this.props.subProcessId).get({ page: page + 1 });
    this.setState({ validateDataResult });
  }

  render() {
    if (!hasValidationErrors(this.props)) {
      return null;
    }

    const customValidateResult = [];
    Object.keys(this.props.customValidateResult || {}).forEach((uuid) => {
      this.props.customValidateResult[uuid].forEach((error) => {
        customValidateResult.push({ uuid, error });
      });
    });

    const validateDataResult = [];
    const { errors, page, count, perPage } = this.state.validateDataResult;

    const maxPage = Math.ceil(count / perPage);
    Object.keys(errors || {}).forEach((uuid) => {
      const errorsMap = errors[uuid] || {};
      Object.keys(errorsMap).forEach((fieldId) => {
        // TODO: добавить преобрахование id в нормальное наименование;
        errorsMap[fieldId].forEach((error) => {
          validateDataResult.push({ uuid, fieldId, error });
        });
      });
    });

    const useServerPagination = !!count;

    return (
      <div>
        <h2 className="rfc-red">Результат валидации</h2>
        {validateDataResult.length > 0 &&
          <div style={{ marginBottom: 30 }}>
            <h3>Ошибки валидации данных и целостности</h3>
            <SimpleGriddle
              results={validateDataResult}
              columnMetadata={columnMetadata1}
              columns={columns1}
            />
            {useServerPagination && <Paginator currentPage={page - 1} maxPage={maxPage - 1} setPage={p => this.onPageChange(p)} />}
          </div>
        }
        {customValidateResult.length > 0 &&
          <div>
            <h3>Валидация данных по правилам валидации</h3>
            <SimpleGriddle
              results={customValidateResult}
              columnMetadata={columnMetadata2}
              columns={columns2}
              noDataMessage=""
            />
          </div>
        }
      </div>
    );
  }
}
