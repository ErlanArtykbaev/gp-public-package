import utf8 from 'utf8';

function parseFilename(contentDisposition) {
  let filename;
  try {
    const result = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/.exec(contentDisposition);
    if (result && result[1]) {
      filename = utf8.decode(result[1]).replace(/"/g, '');
    }
  } catch (e) {
    filename = null;
  }
  return filename;
}

export {
  parseFilename,
};
