import { connect } from 'react-redux';
import { getRfcProcessHistory } from 'gp-core/lib/redux/modules/history';
import SimpleHistoryLinkComponent from './SimpleHistoryLinkComponent';

export default connect(
  state => state.core.history,
  { getHistory: getRfcProcessHistory }
)(SimpleHistoryLinkComponent);
