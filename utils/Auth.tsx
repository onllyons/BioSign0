import {deleteStoredValueAsync, getStoredValue, setStoredValueAsync} from "./Store";

export type User = {
    id: number;
    name: string;
    username: string;
    email: string;
    byGoogle: boolean;
    byApple: boolean;
    emailVerified: boolean;
};

export type UserTokens = {
    accessToken: string,
    refreshToken: string
}

export type UserTokensAccess = Partial<UserTokens> & { accessToken: string };

type LoginProps = {
    userData: User,
    tokensData: UserTokensAccess
}

let user: User | null = null;
let tokens: UserTokens | null = null;

export const login = async ({userData, tokensData}: LoginProps): Promise<void> => {
    try {
        // Save user data on local storage
        await setStoredValueAsync("user", userData, true);
        await setStoredValueAsync("lastUserId", userData.id, true)

        user = userData;

        await setTokens(tokensData);

        return Promise.resolve();
    } catch (error) {
        return Promise.reject();
    }
};

export const logout = async (): Promise<void> => {
    try {
        await deleteStoredValueAsync("user");
        await deleteStoredValueAsync("tokens");
        user = null;
        tokens = null

        return Promise.resolve();
    } catch (error) {
        return Promise.reject();
    }
};

export const isAuthenticated = (): boolean => user !== null;

export const getUser = () => user;

export const getTokens = () => tokens;

export const setTokens = async (obj: UserTokensAccess) => {
    if (!obj || typeof obj !== "object") return;

    const next: UserTokens = {
        accessToken: obj.accessToken ?? tokens?.accessToken ?? "",
        refreshToken: obj.refreshToken ?? tokens?.refreshToken ?? "",
    };

    tokens = next;

    await setStoredValueAsync("tokens", next, true);
};
