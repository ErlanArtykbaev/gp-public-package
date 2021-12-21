import React from 'react';
import FormattedDate from '@gostgroup/gp-ui-components/lib/FormattedDate';
import Div from '@gostgroup/gp-ui-components/lib/Div';
import ProcessHistoryLinkComponent from './ProcessHistoryLinkComponent';

export default class RfcItem extends React.Component {

  render() {
    const { rfc } = this.props;

    return (
      <Div>
        <form className="aui top-label">
          <Div className="rfc-process-name-background" hidden={!rfc.name}>
            <h2>{rfc.name}</h2>
          </Div>
          <Div className="field-group top-label" hidden={!rfc.user}>
            <label>Пользователь, создавший заявку:</label>
            <span>{rfc.user}</span>
          </Div>
          <Div className="field-group top-label" hidden={!rfc.dateStart}>
            <label>Дата отправки запроса:</label>
            <FormattedDate>{rfc.dateStart}</FormattedDate>
          </Div>
          <Div className="field-group top-label" hidden={!rfc.dateEnd}>
            <label>Дата завершения рассмотрения запроса:</label>
            <FormattedDate>{rfc.dateEnd}</FormattedDate>
          </Div>
          <Div className="field-group top-label" hidden={!rfc.currentTaskName}>
            <label>Текущая задача:</label>
            <span>{rfc.currentTaskName}</span>
          </Div>
          <Div className="field-group top-label" hidden={!rfc.statusName}>
            <label>Статус:</label>
            <span className={`aui-lozenge aui-lozenge-${rfc.statusClass}`}>{rfc.statusName}</span>
          </Div>
          <Div className="field-group top-label" hidden={!rfc.processId}>
            <h4 className="link-hand-cursor">
              <ProcessHistoryLinkComponent name="Посмотреть историю запроса" processId={rfc.processId} />
            </h4>
          </Div>
        </form>
        {this.props.children}
        <hr className="rfc-border-line" />
      </Div>
    );
  }

}
