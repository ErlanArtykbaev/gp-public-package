import React, { PropTypes } from 'react';
import styles from './preloader.scss';

function BasePreloader(props) {
  const { style, width, relative = true, faded = false } = props;
  const overlayBackground = faded ? 'rgba(0, 0, 0, 0.2)' : 'transparent';
  return (
    <div className={styles.outer} style={{ background: overlayBackground }}>
      <div style={{ display: 'table', width: '100%', height: '100%' }}>
        <div className={styles.middle}>
          <div className={styles['select-box']} style={{ ...style, width }}>
            <div className={styles['select-box-container']}>
              <span className={!faded ? styles.select : styles.selectFaded} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Preloader(props) {
  const { style, type, text, width, relative = true, faded = false } = props;
  switch (type) {
    default:
      return <BasePreloader width={'10%'} {...props} />;
  }
}

Preloader.propTypes = {
  style: PropTypes.shape({}),
  type: PropTypes.string,
  text: PropTypes.string,
};
