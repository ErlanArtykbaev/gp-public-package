import React from 'react';
import ReactDOM from 'react-dom';
import cx from 'classnames';
import { AuiButton } from '@gostgroup/gp-ui-components/lib/buttons';

function uploadFile(el) {
  const file = FileAPI.getFiles(el)[0];
  return new Promise((resolve, reject) => {
    FileAPI.upload({
      url: '/rest/files/upload',
      files: {
        file,
      },
      data: {
        name: file.name,
      },
      complete(err, xhr) {
        if (err) {
          reject(err);
        } else {
          resolve(JSON.parse(xhr.response));
        }
      },
    });
  });
}

class FileInput extends React.Component {

  constructor(props) {
    super(props);

    this.handleFileSelection = this.handleFileSelection.bind(this);
    this.handleFileUploaded = this.handleFileUploaded.bind(this);
    this.handleFileError = this.handleFileError.bind(this);
    this.handleFinishedUpload = this.handleFinishedUpload.bind(this);
    this.toggleUploading = this.toggleUploading.bind(this);
    this.removeFile = this.removeFile.bind(this);
  }

  componentDidMount() {
    if (!this.props.readOnly) {
      const input = ReactDOM.findDOMNode(this).querySelector('input');

      this.setState({
        input,
      });

      FileAPI.event.on(input, 'change', this.handleFileSelection);
    }
  }

  componentDidUpdate() {
    const { data = {}, error } = this.props;
    const node = ReactDOM.findDOMNode(this);

    if (node && !this.props.readOnly) {
      node.className = error ? (node.className.indexOf('file-input--invalid') !== -1 ? node.className : `${node.className} file-input--invalid`) : node.className.replace('file-input--invalid', '');
      node.querySelector('.file-input__text').textContent = data && data.name ? data.name : ' Выберите файл';
    }
  }

  toggleUploading(isUploading) {
    const node = ReactDOM.findDOMNode(this);
    const { input } = this.state;

    if (isUploading) {
      node.setAttribute('disabled', true);
      input.setAttribute('disabled', true);
      node.querySelector('.aui-icon-wait').setAttribute('style', '');
      node.querySelector('.file-input__text').setAttribute('style', 'display: none;');
    } else {
      node.removeAttribute('disabled');
      input.removeAttribute('disabled');
      node.querySelector('.aui-icon-wait').setAttribute('style', 'display: none;');
      node.querySelector('.file-input__text').setAttribute('style', '');
    }
  }

  handleFileUploaded(response) {
    const { onDataChange } = this.props;
    const { uuid, name, mime, size } = response;

    if (onDataChange) {
      onDataChange({ uuid, name, mime, size, uploadError: false });
    }
  }

  handleFileError() {
    const { onDataChange } = this.props;

    if (onDataChange) {
      onDataChange({ uuid: null, name: null, mime: null, size: null, uploadError: true });
    }
  }

  handleFinishedUpload() {
    const { onDataChange, data } = this.props;

    if (onDataChange) {
      onDataChange(Object.assign({}, data, { uploading: false }));
    }

    this.toggleUploading(false);
  }

  handleFileSelection() {
    const { onDataChange } = this.props;

    this.toggleUploading(true);

    if (onDataChange) {
      onDataChange({ uuid: null, name: null, mime: null, size: null, uploading: true, uploadError: false });
    }

    uploadFile(this.state.input)
      .then(this.handleFileUploaded)
      .catch(this.handleFileError)
      .then(this.handleFinishedUpload)
      .catch(this.handleFinishedUpload);
  }

  removeFile() {
    const { onDataChange } = this.props;

    if (onDataChange) {
      onDataChange(null);
    }
  }

  render() {
    const { config, data = {}, error, readOnly, FileLink } = this.props;

    if (readOnly) {
      return <FileLink config={config} data={data} />;
    } else {
      const classes = cx('js-fileapi-wrapper', 'file-input', 'aui-button', {
        'file-input--invalid': error,
      });
      const buttonStyle = { marginLeft: 20, verticalAlign: 'top' };

      return (
        <div>
          <div className={classes}>
            <span className="aui-icon aui-icon-wait" style={{ display: 'none' }} />
            <span className="file-input__text"> Выберите файл</span>
            <input id={config.id} name={config.id} className="file-input__input" type="file" />
          </div>
          {data && data.name ? <AuiButton type="button" style={buttonStyle} onClick={this.removeFile}><i className="fa fa-times aui-red" /></AuiButton> : ''}
        </div>
      );
    }
  }
}

FileInput.propTypes = {
  data: React.PropTypes.object,
  onDataChange: React.PropTypes.func.isRequired,
  config: React.PropTypes.object.isRequired,
  error: React.PropTypes.string,
  readOnly: React.PropTypes.bool,
  FileLink: React.PropTypes.func.isRequired,
};

export default FileInput;
