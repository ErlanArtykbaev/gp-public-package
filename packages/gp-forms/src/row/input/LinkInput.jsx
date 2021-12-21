import React, { PropTypes } from 'react';
import get from 'lodash/get';
import {
  ItemsService,
} from '@gostgroup/gp-api-services/lib/services';
import ReferenceLink from '@gostgroup/gp-core/lib/components/objects/ReferenceLink';
import ReferenceLinkButton from '@gostgroup/gp-core/lib/components/objects/common/ReferenceLinkButton';
import { isEmpty } from '@gostgroup/gp-utils/lib/functions';

export default class LinkInput extends React.Component {

  static propTypes = {
    readOnly: PropTypes.bool,
    config: PropTypes.shape({}),
    getFullData: PropTypes.func.isRequired,
  }

  constructor() {
    super();

    this.state = {
      isLoading: false,
      items: [],
    };
  }

  componentDidMount() {
    const { getFullData, config } = this.props;
    const key = get(config, 'config.key');
    const linkProperty = get(config, 'config.linkProperty');
    const ownProperty = get(config, 'config.ownProperty');
    const filterValue = get(getFullData(), ownProperty);
    if (isEmpty(filterValue)) return;
    const payload = {
      filter: {
        object: {
          [linkProperty]: filterValue,
        },
      },
    };
    this.setState({ isLoading: true });
    ItemsService.path(key).get(payload).then(({ items }) => {
      this.setState({ items, isLoading: false });
    });
  }

  render() {
    const { config, getFullData, readOnly } = this.props;
    const { isLoading, items } = this.state;
    const linkProperty = get(config, 'config.linkProperty');
    const ownProperty = get(config, 'config.ownProperty');
    const data = { [linkProperty]: getFullData()[ownProperty] };

    const key = get(config, 'config.key');
    const linkDisplayProperty = !isEmpty(get(config, 'config.linkDisplayProperty')) ? get(config, 'config.linkDisplayProperty') : 'title';

    if (isLoading) {
      return <span className="aui-icon aui-icon-wait" />;
    }
    return (
      <div>
        {items.map(item => (
          <div key={item.id}>
            <ReferenceLink referenceKey={key} id={item.id} title={get(item, ['version', 'object', linkDisplayProperty])} versionId={item.versionId || 1} editable={!readOnly} />
          </div>
        ))}
        {!readOnly && <ReferenceLinkButton type="add" referenceKey={key} data={data} style={{ marginLeft: 0, marginTop: 10 }} onSave={() => this.componentDidMount()} />}
      </div>
    );
  }
}
