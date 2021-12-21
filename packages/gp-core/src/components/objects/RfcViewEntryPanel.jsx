import React, { Component } from 'react';
import { queryRFCReferences, queryReferencesForView } from '@gostgroup/gp-api-services/lib/helpers/queryReferences'; // TODO add decorator
import { Form } from '@gostgroup/gp-forms';
import GForm from '../forms/Form';
import Field from '../forms/Field';
import { formatDate } from '@gostgroup/gp-utils/lib/util.js';

export default class RfcViewEntryPanel extends Component {

  render() {
    const { entry, schema, data, fullTitle, shortTitle, startDate, endDate, readOnly, rfcProcessId } = this.props;
    const basicData = { startDate, endDate, fullTitle, shortTitle };

    let resultQueryReferences = queryReferencesForView;

    if (rfcProcessId) {
      resultQueryReferences = fullPath => queryRFCReferences(fullPath, rfcProcessId);
    }

    return (
      <div>
        <GForm>
          <Field
            title="Дата начала"
            type="div"
            value={formatDate(startDate)}
          />
          <Field
            title="Дата окончания"
            value={formatDate(endDate)}
            type="div"
          />
        </GForm>
        <Form
          element={{ element: entry.element }}
          config={schema}
          data={data}
          basicData={basicData}
          queryReferencesForView={resultQueryReferences}
          disabled={readOnly}
        />
      </div>
    );
  }
}
