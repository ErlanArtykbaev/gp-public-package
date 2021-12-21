import React, { Component, PropTypes } from 'react';
import controllable from 'react-controllables';
import pure from 'recompose/pure';
import getContext from 'recompose/getContext';
import cx from 'classnames';
import get from 'lodash/get';
import has from 'lodash/has';
import Div from '@gostgroup/gp-ui-components/lib/Div';
import { autobind } from 'core-decorators';
import checkPermissions from '@gostgroup/gp-hocs/lib/checkPermissions';
import { AuiButton } from '@gostgroup/gp-ui-components/lib/buttons';
import ListForm from '../ListForm';
import TableForm from '../table/TableForm';
import cleanRow from '../clean.js';
import Input from './input/Input';
import { unwrapProperties } from '../helpers/index.js';

const forms = {
  list: ListForm,
  table: TableForm,
};

const DefaultCommentComponent = ({ comment, className }) => !comment ? null : <div className={className}>{comment}</div>;

DefaultCommentComponent.propTypes = {
  comment: PropTypes.string,
  className: PropTypes.string,
};

const DefaultLayout = props => (
  <Div className={props.className} hidden={props.hidden}>
    {props.label}
    {props.input}
    {props.info}
  </Div>
);

export const FormRowLayoutPropTypes = {
  className: PropTypes.string,
  hidden: PropTypes.bool,
  label: PropTypes.any,
  input: PropTypes.any,
  info: PropTypes.any,
};

DefaultLayout.propTypes = FormRowLayoutPropTypes;

const DefaultComplexLayout = ({ title, rows, error, className }) => (<fieldset className={className}>
  {title}
  {rows}
  {!rows.length && ('Отсутствуют поля для редактирования')}
  {error}
</fieldset>);

@((Cmp) => {
  const Merged = (p, c) => <Cmp {...p} readOnly={p.readOnly || c.readOnly} />;
  Merged.contextTypes = { readOnly: PropTypes.bool };
  return Merged;
})
@getContext({
  schema: PropTypes.object.isRequired,
  validateRow: PropTypes.func.isRequired,
  element: PropTypes.object.isRequired,
  elementPath: PropTypes.string.isRequired,
  getFullData: PropTypes.func.isRequired,
  queryReferencesForView: PropTypes.func.isRequired,
  queryReferencesForEdit: PropTypes.func.isRequired,
  setAsyncLoadedReferences: PropTypes.func.isRequired,
  ReferenceLink: PropTypes.any.isRequired,
  FileLink: PropTypes.any.isRequired,
  ui: PropTypes.any,
})
@pure
@controllable(['value'])
@checkPermissions
@autobind
export default class FormRow extends Component {
  static contextTypes = {
    ui: PropTypes.any,
  };
  static propTypes = {
    config: PropTypes.object.isRequired,
    value: PropTypes.any,
    error: React.PropTypes.oneOfType([
      React.PropTypes.string,
      React.PropTypes.array,
    ]),
    onRemove: PropTypes.func,
    readOnly: PropTypes.bool,
    single: PropTypes.bool,
    onValueChange: PropTypes.func,
    disabled: PropTypes.bool,
    references: PropTypes.shape({}),
    styles: PropTypes.shape({
      error: PropTypes.string,
      formRow: PropTypes.string,
    }),
    commentComponent: PropTypes.func,
    commentContainer: PropTypes.oneOf(['label', 'div']),
    formatter: PropTypes.func,
    Layout: PropTypes.any,
    ComplexLayout: PropTypes.any,
    ReadonlyComponent: PropTypes.any,
  }

  static defaultProps = {
    commentComponent: DefaultCommentComponent,
    commentContainer: 'div',
    Layout: DefaultLayout,
    ComplexLayout: DefaultComplexLayout,
    ReadonlyComponent: Input,
  }

  isReadOnly() {
    if (this.props.readOnly) {
      return true;
    }

    const { config, userPermissions } = this.props;
    const { editableByAdminOnly } = config;
    const canEditPermissions = ['super_user', 'hard_admin'];
    const canEdit = editableByAdminOnly ? (userPermissions || []).some(e => canEditPermissions.includes(e)) : true;

    // const { accessFields } = this.props;
    // const isReadable = get(accessFields, 'isReadable', true);
    // const isUpdatable = get(accessFields, 'isUpdatable', true);
    // const isCreatable = get(accessFields, 'isCreatable', true);
    return !canEdit || get(config, ['config', 'readOnly']);
  }

  handleDataChange(value, label) {
    const { config } = this.props;
    if (typeof this.props.onValueChange === 'function') {
      this.props.onValueChange(config, cleanRow(config, value), label);
    }
  }

  handlePropertyChange(fieldConfig, rowValue) {
    const { config, onValueChange } = this.props;
    if (typeof onValueChange === 'function') {
      const value = Object.assign({},
        this.props.value,
        { [fieldConfig.id]: rowValue }
      );

      this.props.onValueChange(config, value);
    }
  }

  handleRowRemove() {
    if (this.props.onRemove) {
      this.props.onRemove();
    }
  }

  render() {
    const { commentComponent, commentContainer } = this.props;
    const { ui } = this.context;
    const { config, value, error, onRemove, single, styles = {}, ComplexLayout,
      references, accessFields, Layout, style, formatter, validateRow, id } = this.props;
    const readOnly = this.isReadOnly();
    const comment = get(config, 'config.comment');
    const isReadable = get(accessFields, 'isReadable', true);
    // const isUpdatable = get(accessFields, 'isUpdatable', true);
    // const isCreatable = get(accessFields, 'isCreatable', true);
    const notEditable = get(config, 'config.notEditable', false);

    const Comment = commentComponent;
    if (get(config, ['config', 'hidden'])) {
      return null;
    }
    const valueChecked = formatter ? formatter(value) : value;
    if (config.type === 'table') {
      return (
        <TableForm
          {...this.props}
        />
      );
    }

    if ((has(config, 'config.properties') && !single)) {
      const data = value || {};
      const rows = unwrapProperties(config).filter(row => !!row).map((row) => {
        const FormRowComponent = forms[row.type] || FormRow;
        return (
          <FormRowComponent
            {...this.props}
            key={row.id}
            config={row}
            value={data[row.id]}
            references={references}
            error={validateRow(row, data[row.id], references)}
            onValueChange={this.handlePropertyChange}
          />
        );
      });

      const title = (
        <h5>
          {config.title}
          {readOnly || !onRemove ? null : <AuiButton link onClick={this.handleRowRemove}>
            <span className="aui-icon aui-icon-small aui-iconfont-delete" />
          </AuiButton>}
        </h5>
      );

      const className = cx('form__sub', {
        'form__sub--error': error,
      });

      return (<ComplexLayout
        className={className}
        title={title}
        rows={rows}
        config={config}
        error={error && !readOnly ? <div className="form__error">{error}</div> : null}
      />);
    }

    const className = cx('field-group', {
      'field-group--error': error,
    }, styles.formRow);

    const errorEl = error && !readOnly && !Array.isArray(error)
      ? <div key="error" className={cx('error', styles.error)}>{error}</div>
      : null;
    const commentEl = !!comment && comment !== 'noSearch' && <div key="comment" style={{ width: '100%', float: 'left' }} className={cx(styles.comment)}>{comment}</div>;

    const InputCmp = readOnly ? this.props.ReadonlyComponent : Input;

    return (
      <Layout
        label={(
          !ui && <label htmlFor={config.id}>
            {config.title}
            {config.required && !readOnly ? <span className="aui-icon icon-required" /> : null}
            {commentContainer === 'label' && <Comment comment={comment} className={cx(styles.comment)} />}
          </label>
        )}
        input={(<InputCmp
          {...this.props}
          readOnly={readOnly}
          references={references}
          style={style}
          config={config}
          data={valueChecked}
          error={error}
          onDataChange={this.handleDataChange}
          disabled={this.props.disabled}
          noAsyncSearch={this.props.noAsyncSearch}
          preventLoading={this.props.preventLoading}
        />)}
        info={(errorEl || commentEl) ? [errorEl, commentEl] : null}
        className={className}
        hidden={!isReadable || (notEditable && !readOnly)}
      />
    );
  }
}
// {commentContainer === 'div' && <Comment comment={comment} className={cx(styles.comment)} />}
