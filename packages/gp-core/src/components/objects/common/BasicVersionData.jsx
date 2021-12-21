import React, { PropTypes } from 'react';
import set from 'lodash/set';
import { formatDate } from '@gostgroup/gp-utils/lib/util.js';
import { createValidDate } from '@gostgroup/gp-utils/lib/dates';
import { withHandlers, compose, pure } from 'recompose';
import { validateDate } from '@gostgroup/gp-utils/lib/validate/main';
import GForm from '../../forms/Form';
import Field from '../../forms/Field';

function compareDates(dateStart, dateEnd) {
  if (!dateEnd) return false;
  return new Date(dateStart).getTime() > new Date(dateEnd).getTime();
}

const composition = compose(
  pure,
  withHandlers({
    dispatch: props => (action) => {
      const { onChange, basicData } = props;
      const { type, key, value } = action;
      if (type === 'date') {
        const validDate = createValidDate(value);
        basicData[key] = validDate;
        set(basicData, ['errors', key], validateDate(validDate));
      }
      set(basicData, 'errors.dateError', compareDates(basicData.startDate, basicData.endDate));
      basicData.isValid = Object.values(basicData.errors).filter(k => !!k).length === 0;
      onChange(basicData);
    },
  }),
  withHandlers({
    onDateChange: ({ dispatch }) => key => (value) => {
      dispatch({
        type: 'date',
        key,
        value,
      });
    },
  })
);

function BasicVersionData({ basicData, onDateChange, readOnly }) {
  const { startDate, endDate, errors } = basicData;
  return (
    <GForm>
      <Field
        title="Дата начала"
        type="date"
        readOnly={readOnly}
        value={formatDate(startDate)}
        onChange={onDateChange('startDate')}
        error={!readOnly && errors.startDate}
      />
      <Field
        title="Дата окончания"
        type="date"
        readOnly={readOnly}
        value={formatDate(endDate)}
        onChange={onDateChange('endDate')}
        error={!readOnly && errors.endDate}
      />
      {errors.dateError &&
        <Field type="error" value="Дата окончания не может быть меньше даты начала" />
      }
      {/* {errors.dateError ? <div className="error">Дата окончания не может быть меньше даты начала</div> : false}*/}
    </GForm>
  );
}

BasicVersionData.propTypes = {
  onDateChange: PropTypes.func,
  basicData: PropTypes.shape({
    startDate: PropTypes.string,
    endDate: PropTypes.string,
  }),
  readOnly: PropTypes.bool,
};

export default composition(BasicVersionData);
