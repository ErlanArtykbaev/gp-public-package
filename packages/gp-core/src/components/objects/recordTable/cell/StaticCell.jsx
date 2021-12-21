import React from 'react';
import get from 'lodash/get';
import { Link } from 'react-router';
import { validateRow } from '@gostgroup/gp-forms/lib/validate/index.js';
import { formatDate } from '@gostgroup/gp-utils/lib/util.js';
import cx from 'classnames';
import cellPropTypes from './cellPropTypes';
import '../styles/recordTable.global.scss';

const NOT_AVAILABLE_REASONS = {
  HOLE: 'Наличие дыр между версиями',
  NON_FULLY_IN_DATES: 'Не полностью в интервале дат',
  DATES_NOT_CONSISTENCY: 'Версии не консистентны',
  NOT_YET: 'Не соответствует времени жизни справочника',
  NON_FOUND: 'Ничего не найдено за даты',
};

const isPrimitive = test => test !== Object(test);

const StaticCell = (props) => {
  const { data, rowData, metadata } = props;
  const { $$meta } = rowData;

  if (metadata.columnName === 'title' && $$meta && metadata.titleLink) {
    const error = validateRow(metadata.itemSchema, data);
    const toTitle = {
      pathname: `/records/${$$meta.absolutPath}`,
      query: {
        version: $$meta.versionId,
        date: metadata.date,
      },
    };
    return (
      <span title={data}>
        <Link to={toTitle}>{data}</Link>
        {(error && !Array.isArray(error)) && <div className="error">{error}</div>}
      </span>
    );
  }

  if (metadata.type === 'reference') {
    const reference = get(rowData, metadata.node.refPath);
    if (!$$meta && !reference) {
      return null;
    }

    const disabled = !reference ||
      reference.available === false ||
      reference.isAvailable === false;
    const referenceClass = cx({ disabledVersion: disabled });
    let title = reference ? reference.title : get(data, 'title', data);
    if (disabled && reference && typeof reference.reason !== 'undefined') {
      title += ` (${NOT_AVAILABLE_REASONS[reference.reason]})`;
    }

    const to = {
      pathname: `/records/${metadata.refElementPath}/${data}`,
      query: {
        version: (reference || $$meta).versionId,
        date: metadata.date,
      },
    };

    return (
      <Link to={to} className={referenceClass}>
        {title}
      </Link>
    );
  }

  if (metadata.type === 'bool') {
    return <input type="checkbox" checked={data} disabled />;
  }

  if (metadata.type === 'date') {
    return <span>{formatDate(data)}</span>;
  }

  if (metadata.type === 'file' && data) {
    // TODO получать абсолютный url вместо относительного
    const splat = `/rest/files/download/${data.uuid}/${data.name}`;
    return <a href={splat} target="_blank" rel="noopener noreferrer">{data.name}</a>;
  }

  if (metadata.type === 'table') {
    return <span></span>
  }

  if (metadata.type === 'classifier') {
    return <span></span>
  }

  if (!isPrimitive(data)) {
    return <span className="inline-block error">Не удается отобразить данные</span>;
  }

  return <span className="inline-block">{data}</span>;
};

StaticCell.propTypes = cellPropTypes();

export default StaticCell;
