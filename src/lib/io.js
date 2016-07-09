import fs from 'fs';
import path from 'path';

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

export const prepSecretDir = () => {
  const secretsDir = path.join(process.cwd(), 'secrets');
  try {
    fs.statSync(secretsDir);
  } catch (e) {
    fs.mkdir(secretsDir);
  }
};
