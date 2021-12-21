import React, { Component, PropTypes } from 'react';
import { AuiButton } from '@gostgroup/gp-ui-components/lib/buttons';
import { UnsubscribeService } from '@gostgroup/gp-api-services/lib/services';

export default class UnsubscribeHandler extends Component {

  static propTypes = {
    params: PropTypes.object,
  }

  state = {
    unsubscribe: null,
  }

  componentDidMount() {
    const { params } = this.props;
    const { splat } = params;
    splat && UnsubscribeService.path(splat).get().then(r => this.setState({ unsubscribe: r }));
  }

  unsubscribe = () => {
    const { unsubscribe } = this.state;
    UnsubscribeService.path('delete', unsubscribe.key).get().then(r => this.setState({ unsubscribe: r }));
  }

  render() {
    const { unsubscribe } = this.state;
    if (!unsubscribe) return <div />;
    return (
      <div>
        {unsubscribe.unsubscribe ?
          <div style={{ margin: 50, marginTop: 0, paddingTop: 30 }}>
            <h2>{unsubscribe.name}, вы успешно отказались от подписки на изменения.</h2>
          </div>
          :
          <div style={{ margin: 50, marginTop: 0, paddingTop: 30 }}>
            <h2>
              {unsubscribe.name}, вы действительно желаете отказаться от подписки на изменения?
            </h2>
            <AuiButton type="button" primary onClick={this.unsubscribe} style={{ marginTop: 20 }}>
              Отписаться
            </AuiButton>
          </div>
        }
      </div>
    );
  }
}
