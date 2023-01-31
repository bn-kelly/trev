import { STORAGE_GLOBAL, STORAGE_LOCAL } from './constants';
/**
 * Get value from storage against a field.
 * If field is null, return all items in storage
 * If storage = 0, get a value from global stroage
 * If storage = 1, get a value from local storage
 * @param {string} field
 * @param {string} storage
 */
export const getValueFromStorage = async (
  field: string,
  storage: string = STORAGE_GLOBAL
) => {
  return new Promise((resolve, reject) => {
    if (storage === STORAGE_GLOBAL) {
      try {
        chrome.storage.sync.get(null, (items) => {
          if (field) {
            resolve(items[field]);
          } else {
            resolve(items);
          }
        });
      } catch {
        if (field) {
          resolve(null);
        } else {
          resolve({});
        }
      }
    } else if (storage === STORAGE_LOCAL) {
      chrome.storage.local.get(null, (items) => {
        if (field) {
          resolve(items[field]);
        } else {
          resolve(items);
        }
      });
    } else {
      reject('Invalid Storage');
    }
  });
};

/**
 * Store data to storage
 * If storage = storage_global, set a value to global storage
 * If storage = storage_local, set a value to local storage
 * @param {any} data
 * @param {string} storage
 */
export const setValueToStorage = async (
  data: any,
  storage: string = STORAGE_GLOBAL
) => {
  return new Promise((resolve, reject) => {
    if (storage === STORAGE_GLOBAL) {
      try {
        chrome.storage.sync.set(data, () => {
          resolve(true);
        });
      } catch {
        resolve(false);
      }
    } else if (storage === STORAGE_LOCAL) {
      chrome.storage.local.set(data, () => {
        resolve(true);
      });
    } else {
      reject('Invalid Storage');
    }
  });
};
