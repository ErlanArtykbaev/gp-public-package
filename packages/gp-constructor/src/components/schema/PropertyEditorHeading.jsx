import React, { PropTypes } from 'react';
import cx from 'classnames';
import ButtonLink from '@gostgroup/gp-ui-components/lib/ButtonLink';


export default class PropertyEditor extends React.Component {

  static propTypes = {
    onMoveUp: PropTypes.func,
    onMoveDown: PropTypes.func,
    onDuplicate: PropTypes.func,
    onDelete: PropTypes.func,
    onChange: PropTypes.func,
    property: PropTypes.object,
    disableMove: PropTypes.bool,
  }

  static contextTypes = {
    container: PropTypes.object,
  }

  isDeletable(property) {
    const { container } = this.context;
    const { permissions = [] } = container;
    if (!property.get('isDeletable')) {
      if (property.getIn(['id', 'value']) !== 'title') {
        if (permissions.indexOf('hard_admin') > -1) {
          return true;
        }
      }
      return false;
    }
    return true;
  }

  render() {
    const { property, onChange } = this.props;
    const isCollapsed = property.get('collapsed');
    const collapsedIconClass = cx('fa', {
      'fa-angle-right': isCollapsed,
      'fa-angle-down': !isCollapsed,
    });
    const toggle = () => onChange(property.set('collapsed', !isCollapsed));

    return (
      <div className="panel-heading" style={{ userSelect: 'none', height: '40px', cursor: 'pointer' }} onClick={toggle}>

        <ButtonLink title={isCollapsed ? 'Развернуть' : 'Свернуть'} style={{ display: 'inline-block', width: '12.5px' }}>
          <i className={collapsedIconClass}>&nbsp;</i>
        </ButtonLink>

        <span className="name-property">{property.getIn(['title', 'value'])}</span>

        <div className="pull-right" onClick={e => e.stopPropagation()}>
          <div style={{ display: this.props.disableMove ? 'none' : 'inline' }}>
            <ButtonLink title="Дублировать" onClick={this.props.onDuplicate}>
              <i className="fa fa-files-o" />
            </ButtonLink>
            <ButtonLink title="Переместить вниз" onClick={this.props.onMoveDown}>
              <i className="fa fa-arrow-down" />
            </ButtonLink>
            <ButtonLink title="Переместить вверх" onClick={this.props.onMoveUp}>
              <i className="fa fa-arrow-up" />
            </ButtonLink>
          </div>

          {this.isDeletable(property) &&
            <ButtonLink title="Удалить свойство" onClick={this.props.onDelete}>
              <i className="fa fa-times" />
            </ButtonLink>
          }
        </div>
      </div>
    );
  }

}
