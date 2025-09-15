import {useNavigation} from "@react-navigation/native";
import {useCallback, useEffect, useRef} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {getDeviceInfo} from "@/utils/Utils";
import {SERVER_AJAX_URL, SuccessResponse, useRequests} from "@/hooks/useRequests";
import {isAuthenticated} from "@/utils/Auth";
import {getStoredValueAsync, setStoredValueAsync} from "@/utils/Store";

type AnalyticResponse = SuccessResponse & {
    userIdKey: string | number;
    geoIpChecked: boolean
};

type AnalyticsInfo = {
    lastScreen: string;
    screen: string;
    lengthStayOnScreen?: number;

    [key: string]: unknown;
}

export const Analytics = () => {
    const {sendDefaultRequest} = useRequests()
    const DELAY_SEND_ANALYTICS = 10 // Seconds

    const navigation = useNavigation();
    const sendAnalyticsTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)
    const lengthStayOnScreens = useRef<Record<string, number>>({})

    // Analytics
    const analyticsInfo = useRef<AnalyticsInfo>({
        lastScreen: "",
        screen: "",
        ...getDeviceInfo()
    })

    useEffect(() => {
        const unsubscribe = navigation.addListener("state", handleNavigationChange);

        return () => {
            unsubscribe();
        };
    }, [navigation]);

    useEffect(() => {
        const interval = setInterval(() => {
            const screen = analyticsInfo.current["screen"]

            if (screen) lengthStayOnScreens.current[screen] += 1
        }, 1000)

        return () => {
            clearInterval(interval)
        }
    }, [])

    const handleNavigationChange = (state: any) => {
        if (!state.data.state || !state.data.state.routes) return

        let route = state.data.state.routes[state.data.state.index]

        if (!route) return
        if (route.state && route.state.routes.length > 0) route = route.state.routes[route.state.index]
        if (!route) return

        let nameRoute = route.name

        if (route.state?.routeNames) {
            nameRoute += ` - ${route.state.routeNames[route.state.index]}`
        }

        if (analyticsInfo.current.screen !== nameRoute) {
            analyticsInfo.current.lengthStayOnScreen = 0
        }

        if (!nameRoute) return;

        if (!lengthStayOnScreens.current[nameRoute]) lengthStayOnScreens.current[nameRoute] = 0
        analyticsInfo.current.screen = nameRoute
        sendAnalytics()
        analyticsInfo.current.lastScreen = nameRoute
    };

    const sendAnalytics = useCallback(async () => {
        if (sendAnalyticsTimeout.current !== null) {
            clearTimeout(sendAnalyticsTimeout.current)
            sendAnalyticsTimeout.current = null
        }

        const screen = analyticsInfo.current["screen"]
        const lengthStayOnScreen = lengthStayOnScreens.current[screen]
        let userIdKey = await AsyncStorage.getItem("userIdKey")
        let geoIpChecked = await getStoredValueAsync(`geoIpChecked-${userIdKey}`)

        sendDefaultRequest<AnalyticResponse>({
            url: `${SERVER_AJAX_URL}/send_analytics.php`,
            data: {
                ...analyticsInfo.current,
                lengthStayOnScreen,
                userIdKey: await AsyncStorage.getItem("userIdKey"),
                geoIpChecked,
            },
            sendLog: false,
            showOptions: {error: false, success: false}
        })
            .then(async (data) => {
                if (data.userIdKey) {
                    await AsyncStorage.setItem("userIdKey", `${data.userIdKey}`)
                    userIdKey = `${data.userIdKey}`
                }

                geoIpChecked = await getStoredValueAsync(`geoIpChecked-${userIdKey}`)

                if (data.geoIpChecked && !geoIpChecked) {
                    await setStoredValueAsync(`geoIpChecked-${userIdKey}`, 1, false, 1)
                }

                if (data.timeUpdated) {
                    lengthStayOnScreens.current[screen] = 0
                }
            })
            .catch((e) => {
                console.log(e)
            })
            .finally(() => {
                sendAnalyticsTimeout.current = setTimeout(() => sendAnalytics(), DELAY_SEND_ANALYTICS * 1000)
            })
    }, [])

    return null
}