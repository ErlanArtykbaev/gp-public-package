import React from 'react';

export default class FileLink extends React.Component {

  static get propTypes() {
    return {
      data: React.PropTypes.object,
    };
  }

  render() {
    const data = this.props.data;

    if (data && data.uuid) {
      const { uuid, name, size } = data;

      let linkText;

      if (name) {
        linkText = `${name}${size ? ` (${size})` : ''}`;
      } else {
        linkText = 'скачать';
      }

      return <a href={`/rest/files/download/${uuid}/${name}`} className="aui-button aui-button-link">{linkText}</a>;
    }
    return null;
  }
}
