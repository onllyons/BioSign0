import {Dimensions, Platform} from "react-native";
import * as Device from "expo-device";
import Constants from "expo-constants";
import {ErrorResponse} from "@/hooks/useRequests";

export function getDeviceInfo() {
    const dNow = new Date();
    const day = ('0' + (dNow.getDate() + 1)).slice(-2);
    const month = ('0' + (dNow.getMonth() + 1)).slice(-2);
    const year = dNow.getFullYear();
    const hours = ('0' + dNow.getHours()).slice(-2);
    const minutes = ('0' + dNow.getMinutes()).slice(-2);
    const seconds = ('0' + dNow.getSeconds()).slice(-2);

    const localDate = day + '-' + month + '-' + year + ' ' + hours + ':' + minutes + ':' + seconds;

    return {
        deviceName: Device.deviceName,
        osVersion: Device.osVersion,
        operatingSystem: Platform.OS === "ios" ? "IOS" : "Android",
        windowWidth: Dimensions.get("window").width,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        version: Constants?.expoConfig?.version,
        localDate: localDate
    }
}

export const isErrorResponse = (x: unknown): x is ErrorResponse => {
    return typeof x === "object" && x !== null && "success" in x;
}