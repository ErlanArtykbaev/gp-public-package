import React, { PropTypes } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { AuiButton } from '@gostgroup/gp-ui-components/lib/buttons';
import CheckResultModal from './CheckResultModal';
import * as packControlActions from '../redux/modules/packControl';

@connect(
  state => state.core.packControl,
  dispatch => ({ actions: bindActionCreators(packControlActions, dispatch) }),
)
export default class QualityModal extends React.Component {

  static propTypes = {
    actions: PropTypes.shape({}),
    singleResult: PropTypes.shape({
      items: PropTypes.arrayOf(PropTypes.shape({})),
    }),
    uuid: PropTypes.string,
  }

  constructor(props) {
    super(props);
    this.showErrors = this.showErrors.bind(this);
    this.showErrorsCallback = this.showErrorsCallback.bind(this);
    this.state = {
      checkResultModalIsOpen: false,
    };
  }

  componentDidMount() {
    const { actions } = this.props;
    actions.getPacketControlConfig();
  }

  showErrors(uuid) {
    const { actions } = this.props;
    actions.getSingleResult(uuid)
      .then(() => this.showErrorsCallback(), this.showErrorsCallback);
  }

  showErrorsCallback() {
    const { singleResult } = this.props;
    this.setState({
      checkResultModalIsOpen: true,
      errors: (singleResult || {}).items,
    });
  }

  render() {
    const { uuid, singleResult } = this.props;
    return (
      <span>
        <AuiButton primary type="button" onClick={() => this.showErrors(uuid)}>
          Подробнее
        </AuiButton>
        <CheckResultModal
          isOpen={this.state.checkResultModalIsOpen}
          errors={singleResult ? singleResult.items : singleResult}
          onClose={() => this.setState({ checkResultModalIsOpen: false })}
        />
      </span>
    );
  }
}
