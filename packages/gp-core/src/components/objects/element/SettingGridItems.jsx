import React from 'react';
import cx from 'classnames';
import ButtonLink from '@gostgroup/gp-ui-components/lib/ButtonLink';
import { MovableList } from '@gostgroup/gp-constructor/lib/decorators';


@MovableList('metadata')
export default class SettingGridItems extends React.Component {

  render() {
    const metadata = this.props.metadata;
    const props = this.props;

    const items = metadata.map((item, i) => {
      if (!item) { return null; } // TODO проверить зачем это вообще
      const isHidden = item.get('isHidden');
      const classRemove = cx('fa', { 'fa-plus': isHidden, 'fa-minus': !isHidden });
      const changeStatusTitle = isHidden ? 'Показать свойство' : 'Скрыть свойство';

      return (
        <div key={i} className="panel panel-default" style={{ height: '100%' }}>
          <div className="panel-heading" style={{ height: '40px' }}>

            {item.get('displayName')}

            <div className="pull-right">
              { item.get('columnName') !== 'title' ?
                <ButtonLink title={changeStatusTitle} onClick={this.changeStatusHidden.bind(this, i)}>
                  <i className={classRemove} />
                </ButtonLink> : null}
              <ButtonLink title="Переместить вниз" onClick={this.onMoveDown.bind(this, i)}>
                <i className="fa fa-arrow-down" />
              </ButtonLink>
              <ButtonLink title="Переместить вверх" onClick={this.onMoveUp.bind(this, i)}>
                <i className="fa fa-arrow-up" />
              </ButtonLink>
            </div>

          </div>
        </div>
      );
    });


    return (
      <div>
        {items}
      </div>
    );
  }

  changeStatusHidden(i) {
    let metadata = this.props.metadata;
    let item = metadata.get(i);
    item = item.set('isHidden', !item.get('isHidden'));
    metadata = metadata.set(i, item);
    this.props.onChange(metadata);
  }

}
