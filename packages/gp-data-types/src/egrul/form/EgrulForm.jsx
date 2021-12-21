import React, { PropTypes } from 'react';
import get from 'lodash/get';

import CompanyForm from './CompanyForm';

const FIELDS = ['name', 'inn', 'opf', 'ogrn', 'kpp', 'okpo', 'address'];

export default class EgrulForm extends React.Component {

  static propTypes = {
    data: PropTypes.shape({}),
    onDataChange: PropTypes.func,
  }

  static contextTypes = {
    readOnly: PropTypes.bool,
  }

  handleCompanyFieldChange = (id, { companyData, unrestricted_value }) => {
    const newData = {
      unrestricted_value,
    };

    FIELDS.forEach((f) => {
      if (f === 'address') {
        newData[f] = companyData[f].value;
      } else if (f === 'name') {
        newData[f] = companyData[f].full;
      } else if (f === 'opf') {
        newData[f] = companyData[f].full;
      } else {
        newData[f] = companyData[f];
      }
    });

    this.props.onDataChange(newData);
  }

  render() {
    const { readOnly } = this.context;

    return (
      <div>
        {readOnly && <div>{get(this.props.data, 'value')}</div>}
        <CompanyForm company={this.props.data} onChange={this.handleCompanyFieldChange} />
      </div>
    );
  }

}
