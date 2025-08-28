import AsyncStorage from "@react-native-async-storage/async-storage";

let stored: Record<string, any> = {};
let storedAllKeys: string[] = [];
const STORED_ASYNC_PREFIX = "stored";

export const initStore = async () => {
    try {
        if (storedAllKeys.length === 0) {
            storedAllKeys = JSON.parse((await AsyncStorage.getItem(`${STORED_ASYNC_PREFIX}_storedKeys`) ?? "[]"))

            if (!Array.isArray(storedAllKeys)) storedAllKeys = []
        }
    } catch (e) {
        console.log(e)
        storedAllKeys = []
    }

    for (const key of storedAllKeys) {
        stored[key] = await getStoredValueAsync(key)
    }
}

export const setStoredValue = (key: string, value: any) => stored[key] = value;

export const setStoredValueAsync = async (key: string, value: any, saveKey = false): Promise<void> => {
    setStoredValue(key, value);

    if (saveKey && storedAllKeys.indexOf(key) === -1) {
        storedAllKeys.push(key)

        AsyncStorage.setItem(`${STORED_ASYNC_PREFIX}_storedKeys`, JSON.stringify(storedAllKeys))
    }

    key = `${STORED_ASYNC_PREFIX}__${key}`;

    await AsyncStorage.setItem(key, JSON.stringify({expired: -1, data: value}));
};

export const getStoredValue = (key: string): any | null => stored[key] !== undefined ? stored[key] : null;

export const getStoredValueAsync = async (key: string): Promise<any | null> => {
    key = `${STORED_ASYNC_PREFIX}__${key}`;

    try {
        const value = await AsyncStorage.getItem(key);

        if (value === null) return null;

        const json = JSON.parse(value);

        if (json.expired !== -1 && json.expired < Date.now()) {
            try {
                await AsyncStorage.removeItem(key);
            } catch (err) {
            }
            return null;
        }

        return json.data;
    } catch (error) {
        return null;
    }
};

export const deleteStoredValue = (key: string): void => {
    if (stored[key] !== undefined) delete stored[key];
};

export const deleteStoredValueAsync = async (key: string): Promise<void> => {
    deleteStoredValue(key);

    key = `${STORED_ASYNC_PREFIX}__${key}`;

    try {
        await AsyncStorage.removeItem(key);
    } catch (e) {
    }
};