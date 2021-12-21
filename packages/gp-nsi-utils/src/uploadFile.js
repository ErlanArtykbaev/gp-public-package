export default function uploadFile(inputOrFile) {
  const isInput = !!inputOrFile.files;
  const file = isInput ? FileAPI.getFiles(inputOrFile)[0] : inputOrFile;
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

export function createFileInput() {
  const input = document.createElement('input');
  input.setAttribute('style', 'display:none;');
  input.setAttribute('type', 'file');
  // TODO потом сделаем
  // input.setAttribute('multiple', 'multiple');
  return input;
}
