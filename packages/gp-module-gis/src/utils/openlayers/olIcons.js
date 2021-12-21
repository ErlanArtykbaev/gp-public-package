// В константы
const ICON_WIDTH = 25;
const ICON_RATIO = 25;

// Чем я занимаюсь... Надо не забыть разобраться с этим дерьмом
const getFileExtension = (string) => {
  const re = /(?:\.([^.]+))?$/;
  return re.exec(string)[1];
};

const getMimeType = (string) => {
  const base = string.split(';')[0];
  if (base.split(':')[0] === 'data') {
    return base.split(':')[1];
  }
  return null;
};

const MIMETYPES_TYPES = {
  'image/png': 'png',
  'image/svg+xml': 'svg',
  'image/svg': 'svg',
};

const STATUS_COLOR_MAP = {
  active: 'green',
  inactive: 'red',
  noinfo: 'yellow',
};

const DEFAULT_ICON_CONFIG = {
  scale: true,
};

const icons = {};
const styles = {
  noStyle: [],
};
const parser = new DOMParser();

function makeBase64BlobFromSvg(svg) {
  const base64 = btoa(unescape(encodeURIComponent(svg.outerHTML)));
  return `data:image/svg+xml;base64,${base64}`;
}

function calculatePngScale(size) {
  const pngWidth = size[0];
  return (ICON_WIDTH / pngWidth);
}

export default function getMapIconByType(type) {
  return styles[type] || styles.noStyle;
}

function getIconFeatureStyle(type, data, size, scale) {
  if (type !== 'svg' && type !== 'png') {
    console.warn('Unknown icon type', type); // eslint-disable-line no-console
    return [];
  }
  return [
    new ol.style.Style({
      image: new ol.style.Icon({
        src: data,
        scale: type === 'png' && scale ? calculatePngScale(size) : undefined,
      }),
      zIndex: 10,
    }),
  ];
}

function determineType(data) {
  const type = getFileExtension(data);
  if (!type) {
    const mimeType = getMimeType(data);
    return MIMETYPES_TYPES[mimeType] || null;
  }
  return type;
}

function loadSvgIcon(iconType, name, data, size, status) {
  const width = size ? size[0] : ICON_WIDTH;
  const height = size ? size[1] : ICON_WIDTH * ICON_RATIO;

  return fetch(data, { credentials: 'include' }).then(r => r.text()).then((r) => {
    try {
      const parsedSvg = parser.parseFromString(r, 'image/svg+xml');
      const svg = parsedSvg.getElementsByTagName('svg')[0];
      svg.setAttribute('width', `${width}px`);
      svg.setAttribute('height', `${height}px`);
      // NOTE colorization
      if (status && STATUS_COLOR_MAP[status]) {
        const circles = svg.getElementsByTagName('circle');
        const circle = circles && circles[0];
        if (circle) {
          circle.setAttribute('style', `stroke: ${STATUS_COLOR_MAP[status]}`);
        }
      }
      const source = makeBase64BlobFromSvg(svg);
      icons[name] = source;
      styles[name] = getIconFeatureStyle(iconType, source, size);
    } catch (e) {
      console.error('SVG Load Error', e, name, data); // eslint-disable-line no-console
    }
  });
}

function loadPngIcon(iconType, name, data, scale) {
  const img = new Image();
  // NOTE for older browsers we should use
  // img.onload = function(){
  //    console.log(this.width, this.height);
  // };
  img.addEventListener('load', function onImageLoad() {
    styles[name] = getIconFeatureStyle(iconType, data, [this.naturalWidth, this.naturalHeight], scale);
    icons[name] = data;
  });
  img.src = data;
}

export function loadIcon(name, data, config = DEFAULT_ICON_CONFIG) {
  if (icons[name]) return;
  const { size, status, scale } = config;

  const iconType = determineType(data);

  if (iconType === 'svg') {
    loadSvgIcon(iconType, name, data, size, status);
  } else if (iconType === 'png') {
    loadPngIcon(iconType, name, data, scale);
  }
}

export function getIcon(name, data, config = DEFAULT_ICON_CONFIG) {
  if (!icons[name]) {
    loadIcon(name, data, config);
  }
  return name;
}

export function getIconUrl(name) {
  return icons[name];
}
