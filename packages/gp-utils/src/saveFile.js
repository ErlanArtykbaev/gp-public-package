export default (blob, fileName) => {
  if (!blob || !fileName) {
    throw new Error('Arguments are not valid');
  }

  const a = document.createElement('a');
  document.body.appendChild(a);
  a.style = 'display: none';
  const url = window.URL.createObjectURL(blob);
  a.href = url;
  a.download = 'Отчет.xls';
  if (fileName) {
    a.download = fileName;
  }
  a.click();
  setTimeout(() => window.URL.revokeObjectURL(url), 100);
};
