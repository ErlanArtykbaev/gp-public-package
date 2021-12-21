import { connect } from 'react-redux';
import { getRfcSubProcessHistory } from 'gp-core/lib/redux/modules/history';
import SimpleHistoryLinkComponent from './SimpleHistoryLinkComponent';

export default connect(
  state => state.core.history,
  { getHistory: getRfcSubProcessHistory }
)(SimpleHistoryLinkComponent);
