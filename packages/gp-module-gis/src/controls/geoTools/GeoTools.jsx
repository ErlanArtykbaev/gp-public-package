import React, { PropTypes } from 'react';
import widget from 'bg/utils/widget';

import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as baseWidgetActions from 'bg/redux/modules/widget';

import PopupHeader from 'bg/utils/PopupHeader';
import BaseAddressWidget from './AddressWidget';
import BaseRoutingWidget from './RoutingWidget';
import BaseNearbyWidget from './NearbyWidget';

const geotoolPopup = Component => props => (
  <div>
    <PopupHeader {...props} />
    {!props.isCollapsed && <Component {...props} />}
  </div>
);

const AddressWidget = widget({
  title: 'Поиск адреса',
  id: 'addressWidget',
  defaultPosition: { x: 200, y: 40 },
})(geotoolPopup(BaseAddressWidget));

const RoutingWidget = widget({
  title: 'Проложить маршрут',
  id: 'routingWidget',
  defaultPosition: { x: 250, y: 40 },
})(geotoolPopup(BaseRoutingWidget));

const NearbyWidget = widget({
  title: 'Ближайшие объекты',
  id: 'nearbyWidget',
  defaultPosition: { x: 350, y: 40 },
})(geotoolPopup(BaseNearbyWidget));

const ToggleButton = p => (
  <div
    title={p.title}
    className={`geotools-button geotools-button-${p.btnClassName}`}
    onClick={p.onClick}
  />
);

@connect(
  null,
  dispatch => ({
    widgetActions: bindActionCreators(baseWidgetActions, dispatch),
  })
)
export default class GeoTools extends React.Component {
  static propTypes = {
    map: PropTypes.object,
    widgetActions: PropTypes.shape({
      close: PropTypes.func,
      register: PropTypes.func,
      toggle: PropTypes.func,
    }),
  }

  componentWillMount() {
    const { widgetActions } = this.props;
    widgetActions.register(
      'addressSelection',
      <AddressWidget
        map={this.props.map}
        onClose={() => widgetActions.close('addressSelection')}
      />
    );
    widgetActions.register(
      'nearbySelection',
      <NearbyWidget
        map={this.props.map}
        onClose={() => widgetActions.close('nearbySelection')}
      />
    );
    widgetActions.register(
      'routeSelection',
      <RoutingWidget
        map={this.props.map}
        onClose={() => widgetActions.close('routeSelection')}
      />
    );
  }


  render() {
    const { toggle } = this.props.widgetActions;
    return (
      <div className="geotools">
        <div className="measurer-button-wrap">
          <ToggleButton
            title="Найти по адресу"
            btnClassName="address"
            onClick={() => toggle('addressSelection')}
          />
          <ToggleButton
            title="Объекты поблизости"
            btnClassName="nearby"
            onClick={() => toggle('nearbySelection')}
          />
          <ToggleButton
            title="Проложить маршрут"
            btnClassName="route"
            onClick={() => toggle('routeSelection')}
          />
        </div>
      </div>
    );
  }
}
