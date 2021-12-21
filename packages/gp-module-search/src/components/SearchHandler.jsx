import React, { Component, PropTypes } from 'react';

import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import { Link, withRouter } from 'react-router';
import Paginator from '@gostgroup/gp-ui-components/lib/Paginator';
import { autobind } from 'core-decorators';
import SearchField from '@gostgroup/gp-ui-components/lib/SearchField';
import Div from '@gostgroup/gp-ui-components/lib/Div';
import styles from './SearchHandler.scss';
import * as searchActions from '../redux/modules/search';

const GroupSearchItem = (props) => {
  const description = {
    __html: props.item.description,
  };
  return (
    <div className={styles['group-search-item']}>
      <Link to={`/groups/${props.item.path}`}>
        Группа "{props.item.item.shortTitle}"
      </Link>
      <div>
        <div dangerouslySetInnerHTML={description} />
      </div>
    </div>
  );
};
GroupSearchItem.propTypes = {
  item: PropTypes.object,
};


const ElementSearchItem = (props) => {
  const description = {
    __html: props.item.description,
  };
  const locationDescriptor = {
    pathname: `/elements/${props.item.path}`,
  };

  return (
    <div className={styles['element-search-item']}>
      <Link to={locationDescriptor}>
        Cправочник "{props.item.item.shortTitle}"
      </Link>
      <div>
        <div dangerouslySetInnerHTML={description} />
      </div>
    </div>
  );
};
ElementSearchItem.propTypes = {
  item: PropTypes.object,
};

const RecordSearchItem = (props) => {
  const description = {
    __html: props.item.description,
  };
  const version = props.item.item.versions[0].id;
  const locationDescriptor = {
    pathname: `/records/${props.item.path}`,
    query: {
      version,
    },
  };

  return (
    <div className={styles['entry-search-item']}>
      <Link to={locationDescriptor}>
        {props.item.title} — Запись справочника "{props.item.item.element.shortTitle}"
      </Link>
      <div>
        <div>Версия: {version}</div>
        <div dangerouslySetInnerHTML={description} />
      </div>
    </div>
  );
};
RecordSearchItem.propTypes = {
  item: PropTypes.object,
};

const SearchItem = (props) => {
  switch (props.item.type) {
    case 'group':
      return <GroupSearchItem {...props} />;
    case 'element':
      return <ElementSearchItem {...props} />;
    case 'entry':
      return <RecordSearchItem {...props} />;
    default:
      return <RecordSearchItem {...props} />;
  }
};
SearchItem.propTypes = {
  item: PropTypes.object,
};

@connect(
  state => state.core.search,
  dispatch => ({ actions: bindActionCreators(searchActions, dispatch) }),
)
@withRouter
@autobind
export default class SearchHandler extends Component {

  static propTypes = {
    params: PropTypes.object,
    location: PropTypes.object,
    router: PropTypes.object,
    page: PropTypes.number,
    count: PropTypes.number,
    items: PropTypes.array,
    isSearching: PropTypes.bool,
    actions: PropTypes.shape({}),
  }

  constructor(props) {
    super(props);

    this.state = {
      query: props.params.splat || '',
      lastQuery: props.params.splat || '',
    };
  }

  componentDidMount() {
    const { params, location, actions } = this.props;
    const query = params.splat;
    const page = parseInt(location.query.page, 10);

    if (query && query.length) {
      if (typeof page !== 'undefined') {
        actions.setPage(page - 1);
      }
      actions.search(query, page - 1);
    }
  }

  onPageChange(page) {
    const { actions } = this.props;
    actions.setPage(page);
    this.search(this.state.query, page);
  }

  onQueryChange(query) {
    this.setState({ query });
  }

  search(query = this.state.query, page = this.props.page) {
    const { router, actions } = this.props;
    if (this.state.lastQuery !== query) {
      page = 0;
    }
    actions.search(query, page);
    this.setState({ lastQuery: query });
    router.push({
      pathname: `/search/${query}`,
      query: {
        page: page + 1,
      },
    });
  }

  render() {
    const { items = [], isSearching, page, count } = this.props;
    const searchResults = items.map((r, i) => <SearchItem key={i} item={r} />);
    const maxPage = Math.ceil(count / 10);

    return (
      <div className={styles.search}>
        <h2>Поиск по объектам НСИ: </h2>
        <SearchField
          searchText={this.state.query}
          onChange={this.onQueryChange}
          onSubmit={this.search}
        />

        <Div hidden={items.length === 0} className={styles['search-title']}>
          <h3>Результаты поиска: </h3>
        </Div>

        <Div hidden={items.length > 0 || isSearching} className={styles['search-notfound']}>
          <h3>Ничего не найдено</h3>
        </Div>

        <div className={styles['search-results']}>
          {searchResults}
        </div>
        <div className={styles['search-paginator']}>
          <Paginator currentPage={page} maxPage={maxPage} setPage={this.onPageChange} />
        </div>
      </div>
    );
  }

}
