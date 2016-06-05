import fs from 'fs';

export const writeToFile = (fileName, encryptedData) => {
  return new Promise((resolve, reject) => {
    fs.writeFile(fileName, encryptedData, (err) => {
      if (err) {
        reject(err);
      } else {
        resolve('success');
      }
    });
  }).catch((err) => {
    throw new Error(`Error writing to ${fileName}. Details: \n\n${err}`);
  });
};
