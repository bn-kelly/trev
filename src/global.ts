/**
 * Get value from storage against a field.
 * If field is null, return all items in storage
 * @param {string} field 
 */
export const getValueFromStorage = async (field: string) => {
    return new Promise((resolve, reject) => {
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
    });
}

/**
 * Store data to storage
 * @param {object} data
 */
export const setValueToStorage = async (data: any) => {
    return new Promise(resolve => {
        try {
            chrome.storage.sync.set(data, () => {
                resolve(true);
            });
        } catch {
            resolve(false);
        }
    });
}