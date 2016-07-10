import fs from 'fs';
import path from 'path';
import { SECRET_DIR_NAME } from '../constants';

export const writeToFile = (fileName, encryptedData) => {
  return new Promise((resolve, reject) => {
    fs.writeFile(`./${SECRET_DIR_NAME}/${fileName}`, encryptedData, (err) => {
      if (err) {
        reject(err);
      } else {
        resolve('success');
      }
    });
  }).catch((err) => {
    throw new Error(`Error writing to ./${SECRET_DIR_NAME}/${fileName}. Details: \n\n${err}`);
  });
};

export const prepSecretDir = () => {
  const secretsDir = path.join(process.cwd(), SECRET_DIR_NAME);
  try {
    fs.statSync(secretsDir);
  } catch (e) {
    fs.mkdir(secretsDir);
  }
};

export const readFromFile = (secretName) => {
  return new Promise((resolve, reject) => {
    fs.readFile(`./${SECRET_DIR_NAME}/${secretName}`, { encoding: 'utf-8' }, (err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve(data);
      }
    });
  });
};
