import React, { PropTypes } from 'react';
import isEqual from 'lodash/isEqual';
import omit from 'lodash/omit';
import FormControl from 'react-bootstrap/lib/FormControl';
import InputGroup from 'react-bootstrap/lib/InputGroup';
import Button from 'react-bootstrap/lib/Button';
import Glyphicon from 'react-bootstrap/lib/Glyphicon';
import Preloader from '@gostgroup/gp-ui-components/lib/Preloader';

import CoordHelper from './CoordHelper';


const SyncIndicator = ({ isLoading, inSync, error }) => {
  if (isLoading) return <span style={{ display: 'inline-block', width: '14px', height: '13.75px' }}><Preloader width="20px" /></span>;
  if (error) return <Glyphicon glyph="alert" title="Не удалось найти адрес" style={{ color: '#f22' }} />;
  if (inSync) return <Glyphicon glyph="ok" style={{ color: '#5b2' }} />;
  return <Glyphicon glyph="search" />;
};

SyncIndicator.propTypes = {
  isLoading: PropTypes.bool,
  error: PropTypes.bool,
  inSync: PropTypes.bool,
};


export default class CoordSelector extends React.Component {
  static propTypes = {
    map: PropTypes.object.isRequired,

    coord: PropTypes.arrayOf(PropTypes.number),
    onCoordChange: PropTypes.func.isRequired,

    addr: PropTypes.string,
    onAddrChange: PropTypes.func.isRequired,

    searchAddress: PropTypes.func.isRequired,
    isLoading: PropTypes.bool,
    error: PropTypes.bool,
    inSync: PropTypes.bool,
  }

  state = { mapMode: false }

  componentWillMount() {
    this.helper = new CoordHelper(this.props.map, c => this.props.onCoordChange(c));
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.inSync && this.state.mapMode) {
      this.setState({ mapMode: false });
    }
    if (!isEqual(nextProps.coord, this.props.coord)) {
      this.helper.clear();
      this.helper.markEPSG(nextProps.coord);
    }
  }

  componentWillUpdate(nextProps, nextState) {
    if (this.state.mapMode === nextState.mapMode) return;

    if (nextState.mapMode) this.helper.start();
    else this.helper.stop();
  }

  componentWillUnmount() {
    this.helper.teardown();
  }

  render() {
    const { error, inSync, isLoading, searchAddress } = this.props;
    return (<InputGroup>
      <FormControl
        type="text"
        {...omit(this.props, Object.keys(CoordSelector.propTypes))}
        value={this.props.addr}
        onChange={e => this.props.onAddrChange(e.target.value)}
        onKeyDown={e => e.keyCode === 13 && searchAddress()}
      />
      <InputGroup.Button>
        <Button onClick={() => this.setState({ mapMode: !this.state.mapMode })}>
          <Glyphicon
            glyph="map-marker"
            style={{ color: this.state.mapMode ? '#f55' : '' }}
          />
        </Button>
      </InputGroup.Button>
      <InputGroup.Button>
        <Button disabled={inSync || error} onClick={searchAddress}>
          <SyncIndicator isLoading={isLoading} error={error} inSync={inSync} />
        </Button>
      </InputGroup.Button>
    </InputGroup>);
  }
}
