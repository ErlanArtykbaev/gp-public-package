import React, { PropTypes } from 'react';
import RacktModal from 'react-modal';
import { ResizableBox } from 'react-resizable';
import cx from 'classnames';
import styles from './modal.scss';
import Preloader from './Preloader';

RacktModal.setAppElement(document.getElementById('container'));

export default class Modal extends React.Component {
  static propTypes = {
    title: PropTypes.string,
    isOpen: PropTypes.bool,
    onSubmit: PropTypes.func,
    onClose: PropTypes.func,
    onCloseConfirm: PropTypes.func,
    onCloseReject: PropTypes.func,
    onCancel: PropTypes.func,
    resetState: PropTypes.func,
    saveButton: PropTypes.bool,
    saveButtonDisabled: PropTypes.bool,
    saveButtonTitle: PropTypes.string,
    cancelButton: PropTypes.bool,
    cancelButtonTitle: PropTypes.string,
    warning: PropTypes.bool,
    children: PropTypes.node,
    // isWidthAdaptive: PropTypes.bool,
    backdrop: PropTypes.bool,
    alarm: PropTypes.bool,
    noHeader: PropTypes.bool,
    noFooter: PropTypes.bool,
    isLoading: PropTypes.bool,
    style: PropTypes.shape({}),
    resizable: PropTypes.bool,
    width: PropTypes.number,
    height: PropTypes.number,
    maxWidth: PropTypes.number,
  }

  static defaultProps = {
    isLoading: false,
    resizable: true,
  }

  constructor(props) {
    super(props);

    const { width, height, maxWidth } = props;

    this.state = {
      warning: false,
      width: width || 940,
      height: height || 600,
      maxWidth: maxWidth || 1280,
    };

    this.onRequestClose = this.onRequestClose.bind(this);
    this.renderCloseBtn = this.renderCloseBtn.bind(this);
    this.renderCloseBtnWrng = this.renderCloseBtnWrng.bind(this);
    this.onResize = this.onResize.bind(this);
  }

  componentWillReceiveProps(newProps) {
    const oldProps = this.props;

    if (oldProps.isOpen !== newProps.isOpen && this.props.resetState) {
      setTimeout(() => {
        document.body.style.overflow = newProps.isOpen ? 'hidden' : 'auto';
      }, 400);
      if (!newProps.isOpen) {
        this.props.resetState();
      }
    }
  }

  onRequestClose() { // backdrop
    const { backdrop, onClose } = this.props;
    if (backdrop && typeof onClose === 'function') onClose();
  }

  onResize(event, data) {
    window.requestAnimationFrame(() => {
      const maxWidth = this.modal ? ((this.modal.node.clientWidth / 100) * 90) - 15 : 1280;
      this.setState({
        width: data.size.width,
        height: data.size.height,
        maxWidth,
      });
    });
  }

  renderCloseBtnWrng() {
    return (
      <div>
        <span style={{ textDecoration: 'none' }}>
          Вы действительно хотите закрыть окно?
        </span>
        <button
          className={styles.warningAction}
          onClick={this.props.onCloseConfirm}
          style={{ marginLeft: 30 }}
        >
          Да
        </button>
        <button
          className={styles.warningAction}
          onClick={this.props.onCloseReject}
        >
          Нет
        </button>
      </div>
    );
  }

  renderCloseBtn() {
    return (
      <span className="aui-icon aui-icon-small aui-iconfont-close-dialog" onClick={this.props.onClose}>
        Закрыть
      </span>
    );
  }

  renderSaveButton() {
    const { saveButtonTitle = 'СОХРАНИТЬ' } = this.props;

    return (
      <button
        className={`btn sh-btn btn-default ${styles.footerActions}`}
        disabled={this.props.saveButtonDisabled}
        onClick={this.props.onSubmit}
      >
        {saveButtonTitle}
      </button>
    );
  }

  renderCancelButton() {
    const { cancelButtonTitle = 'ЗАКРЫТЬ' } = this.props;
    return (
      <button className={`btn sh-btn ${styles.footerActions}`} onClick={this.props.onCancel}>
        {cancelButtonTitle}
      </button>
    );
  }

  renderHeader() {
    const { title, warning, noHeader, alarm } = this.props;

    if (noHeader) {
      return null;
    }

    const classes = cx({ [styles.headerAlarm]: alarm, [styles.header]: !alarm });

    return (
      <header className={classes}>
        <h2 className={styles.headerMain} title={title}>
          {title}
        </h2>

        <div className={styles.headerIcon} />


        <a className={styles.headerClose}>
          {warning ? this.renderCloseBtnWrng() : this.renderCloseBtn()}
        </a>
      </header>
    );
  }

  renderContent() {
    const { children, isLoading } = this.props;
    return (
      <div className={styles.content}>
        {children}
        {!!isLoading && <Preloader faded />}
      </div>
    );
  }

  renderFooter() {
    const { saveButton, cancelButton, noFooter } = this.props;

    if (noFooter) {
      return null;
    }

    return (
      <footer className={styles.footer}>
        {cancelButton && this.renderCancelButton()}
        {saveButton && this.renderSaveButton()}
      </footer>
    );
  }

  renderModal() {
    return (
      <div className={styles.wrapper}>
        {this.renderHeader()}
        {this.renderContent()}
        {this.renderFooter()}
      </div>
    );
  }

  renderResizableModal() {
    return (
      <ResizableBox
        width={this.state.width}
        height={this.state.height}
        onResize={this.onResize}
        maxConstraints={[this.state.maxWidth, Infinity]}
      >
        {this.renderModal()}
      </ResizableBox>
    );
  }

  getWidth() {
    const { width, resizable } = this.props;
    if (resizable) return this.state.width;
    return width || this.state.width;
  }

  getHeight() {
    const { height, resizable } = this.props;
    if (resizable) return this.state.height;
    return height || this.state.height;
  }

  getMaxWidth() {
    const { maxWidth, resizable } = this.props;
    if (resizable) return this.state.maxWidth;
    return maxWidth || this.state.maxWidth;
  }

  render() {
    const { title, isOpen, style, resizable } = this.props;

    const computedStyle = {
      content: {
        height: this.getHeight(),
        maxWidth: this.getMaxWidth(),
        width: this.getWidth(),
        ...style,
      },
    };
    //
    // const computedStyle = Object.assign({}, { content: style }, styleNew);

    return (
      <RacktModal
        isOpen={isOpen}
        onRequestClose={this.onRequestClose}
        style={computedStyle}
        closeTimeoutMS={150}
        // className={cx({ [styles.widthAdaptive]: isWidthAdaptive })}
        contentLabel={title || 'Модальное окно'}
        ref={(ref) => { this.modal = ref; }}
      >
        {resizable
          ? this.renderResizableModal()
          : this.renderModal()
        }
      </RacktModal>
    );
  }


}
