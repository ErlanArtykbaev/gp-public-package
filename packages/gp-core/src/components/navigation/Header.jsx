import React, { PropTypes, Component } from 'react';
import { autobind } from 'core-decorators';
import { Link, withRouter } from 'react-router';

import { connect } from 'react-redux';
import { logout } from 'gp-core/lib/redux/modules/session';

import SearchField from '@gostgroup/gp-ui-components/lib/SearchField';
import AuiButton from '@gostgroup/gp-ui-components/lib/buttons/AuiButton';
import Div from '@gostgroup/gp-ui-components/lib/Div';

@connect(state => state.core.session, { logout })
@withRouter
@autobind
export default class Header extends Component {

  static propTypes = {
    session: React.PropTypes.object,
    title: React.PropTypes.string,
    logos: React.PropTypes.arrayOf(React.PropTypes.string),
    children: React.PropTypes.node,
    logout: PropTypes.func,
  }

  static defaultProps = {
    title: '',
    logos: [],
  }

  constructor(props) {
    super(props);

    this.state = {
      query: '',
    };
  }

  onQueryChange(query) {
    this.setState({ query });
  }

  search() {
    const { router } = this.props;
    router.push({
      pathname: `/search/${this.state.query}`,
      query: {
        page: 1,
      },
    });
  }

  searchInputIsHidden() {
    const { location } = this.props;
    const { pathname } = location;

    return pathname.indexOf('search') > -1 || pathname.indexOf('login') > -1;
  }

  logout() {
    this.props.logout();
  }

  render() {
    const { session, title, logos, children } = this.props;
    const user = (
      <div style={{ float: 'right', marginRight: 10, marginTop: 10 }}>
        <span style={{ marginRight: 20 }}>{session ? session.login : ''}</span>
        <AuiButton onClick={this.logout}>Выход</AuiButton>
      </div>
    );

    return (
      <div className="app-header">
        <header id="header" role="banner">
          <nav className="aui-header" role="navigation">
            <div className="aui-header-inner">
              <div className="aui-header-primary">

                <h1 className="aui-header-logo aui-header-logo-textonly">
                  <Link to="/">
                    {logos.map((l, i) => <img role="presentation" key={i} src={l} className="gis-tek-logo" />)}
                    <span className="aui-header-logo-device">{title}</span>
                  </Link>
                </h1>

                {children}
                {session && user}

                <Div hidden={this.searchInputIsHidden()} className="inline-block wrap-search">
                  <SearchField
                    searchText={this.state.query}
                    onChange={this.onQueryChange}
                    onSubmit={this.search}
                    placeholder={'Поиск по сайту'}
                  />
                </Div>

              </div>
            </div>
          </nav>
        </header>
      </div>
    );
  }
}
