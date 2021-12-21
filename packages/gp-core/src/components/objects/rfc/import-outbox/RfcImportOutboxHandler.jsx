import { connect } from 'react-redux';
import { getRfcImportOutcomeItem } from 'gp-core/lib/redux/modules/rfc/importOutbox';
import { RfcOutboxHandler } from '../outbox/RfcOutboxHandler';

export default connect(
  state => state.core.rfc.importOutbox,
  { getItem: getRfcImportOutcomeItem },
)(RfcOutboxHandler);
