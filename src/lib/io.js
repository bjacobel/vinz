import fs from 'fs';
import path from 'path';
import { SECRET_DIR_NAME } from '../constants';

export const writeToFile = (fileName, encryptedData) => {
  const secretPath = path.join(process.cwd(), SECRET_DIR_NAME, fileName);
  return new Promise((resolve, reject) => {
    fs.writeFile(path, encryptedData, (err) => {
      if (err) {
        reject(err);
      } else {
        resolve('success');
      }
    });
  }).catch((err) => {
    throw new Error(`Error writing to ${secretPath}. Details: \n\n${err}`);
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
    fs.readFile(path.join(process.cwd(), SECRET_DIR_NAME, secretName), (err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve(data);
      }
    });
  });
};
