import React, { PropTypes, Component } from 'react';

import { connect } from 'react-redux';
import { getCodingTables } from 'gp-core/lib/redux/modules/rfc/codingTables';

import CodingTable from '../CodingTable';

@connect(
  state => state.core.rfc.codingTables,
  { getTables: getCodingTables },
)
export default class RfcCodingTableHandler extends Component {

  static propTypes = {
    tables: PropTypes.arrayOf(PropTypes.shape({})),
    getTables: PropTypes.func,
  }

  componentDidMount() {
    this.props.getTables();
  }

  render() {
    const { tables } = this.props;

    return (
      <div style={{ margin: 50, marginTop: 0, paddingTop: 30 }}>
        <h2>Перекодировочные таблицы</h2>
        <CodingTable codingTables={tables} />
      </div>
    );
  }
}
