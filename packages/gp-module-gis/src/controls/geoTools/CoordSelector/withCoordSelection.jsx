import React from 'react';
import { autobind } from 'core-decorators';
import { geocodeCoordinates, geocode } from 'bg/api/geoServer';

export default (options = {}) => Cmp => class CoordSelectorController extends React.Component {
  state = {
    addr: 'Южно-Сахалинск, ',
    loading: false,
    error: false,
    inSync: false,
    coord: null,
  }

  componentWillUpdate(nextProps, nextState) {
    if (nextState.addr === '') {
      this.setState({ addr: 'Южно-Сахалинск, ' });
    }
  }

  transaction(promise) {
    this.setState({ loading: true, error: false, inSync: false });
    promise
      .catch(() => this.setState({ error: true }))
      .then(() => this.setState({ loading: false, inSync: true }));
  }

  @autobind
  searchAddress(addr) {
    if (this.state.loading || this.state.inSync) return;
    if (!addr) this.setState({ coord: null });
    const fetchArrd = geocode(addr, true).then((c) => {
      const ok = Array.isArray(c);
      this.setState({ coord: ok ? c : null });
      if (!ok) throw new Error(c);
    });
    this.transaction(fetchArrd);
  }

  @autobind
  fromCoord(coord) {
    this.setState({ coord });
    this.transaction(
      geocodeCoordinates(coord.slice().reverse())
      .then(r => this.setState({ addr: r.full }))
    );
  }

  @autobind
  setAddr(addr) {
    this.setState({ error: false, inSync: false, addr });
  }

  @autobind
  onSubmit() {
    this.searchAddress(this.state.addr);
  }

  render() {
    const childProps = {
      coord: this.state.coord,
      onCoordChange: this.fromCoord,
      addr: this.state.addr,
      onAddrChange: this.setAddr,
      isLoading: this.state.loading,
      error: this.state.error,
      inSync: this.state.inSync,
      searchAddress: this.onSubmit,
    };
    const propLayout = options.prefix ? { [options.prefix]: childProps } : childProps;
    return <Cmp {...this.props} {...propLayout} />;
  }
};
