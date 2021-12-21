import React from 'react';

export default function Footer({ text }) {
  return (
    <div className="footer">
      <div className="container">
        <div className="row">
          <div className="col-xs-12 text-center text-muted">
            {text}
          </div>
        </div>
      </div>
    </div>
  );
}

Footer.propTypes = {
  text: React.PropTypes.string,
};
