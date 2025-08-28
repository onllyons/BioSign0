import {Image, Platform, Pressable, StyleSheet} from "react-native";
import React, {useEffect, useRef} from "react";
import * as AuthSession from "expo-auth-session";
import * as Linking from "expo-linking";
import {login, User, UserTokens} from "@/utils/Auth";
import {SERVER_AJAX_URL, SuccessResponse, useRequests} from "@/hooks/useRequests";
import {useData} from "@/contexts/DataContext";
import {Text} from "@/components/ui";
import {useTheme} from "@/contexts/ThemeContext";

type GoogleAuthResponse = SuccessResponse & {
    userData: User;
    tokens: UserTokens;
};

const CLIENT_ID = '975364175854-l03fhde1ffci0m0mlqon77llas0lt8tu.apps.googleusercontent.com';
const REDIRECT_URI = "https://biosign-app.com/backend/mobile_app/user/google_auth.php"

const useGoogleAuth = () => {
    const discovery = AuthSession.useAutoDiscovery('https://accounts.google.com');

    const [request, response, promptAsync] = AuthSession.useAuthRequest({
        clientId: CLIENT_ID,
        redirectUri: REDIRECT_URI,
        responseType: AuthSession.ResponseType.Code,
        prompt: AuthSession.Prompt.Login,
        scopes: [
            "email",
            "profile"
        ],
    }, discovery);

    return {request, response, promptAsync};
};

export const GoogleLogin = ({setLoader}: { setLoader: (value: boolean) => void }) => {
    const {sendDefaultRequest} = useRequests()
    const {theme} = useTheme();
    const styles = createStyles(theme);
    const {restartApp} = useData()
    const {promptAsync, request} = useGoogleAuth();
    const codeVerifier = useRef<string>("")
    const googleAuthProcess = useRef(false)

    if (request && request.codeVerifier) codeVerifier.current = request.codeVerifier

    // Deep linking
    useEffect(() => {
        const subscription = Linking.addEventListener("url", ({url}) => handleUrl(url))

        const handleUrl = (url: string) => {
            const parsed = Linking.parse(url)

            if (parsed.path === "google-login" || parsed.hostname === "google-login") {
                if (parsed.queryParams?.code && typeof parsed.queryParams.code === "string") {
                    googleAuth(parsed.queryParams.code)
                }
            }
        }

        // Отписка от событий
        return () => subscription.remove();
    }, []);

    const googleAuth = async (code: string) => {
        if (googleAuthProcess.current) return

        setLoader(true)
        googleAuthProcess.current = true

        sendDefaultRequest<GoogleAuthResponse>({
            url: `${SERVER_AJAX_URL}/user/google_auth_user.php`,
            data: {
                code: code,
                codeVerifier: codeVerifier.current
            },
            showOptions: {success: false}
        })
            .then(async data => {
                await login({userData: data.userData, tokensData: data.tokens})
                restartApp()
            })
            .catch(() => {
            })
            .finally(() => {
                googleAuthProcess.current = false
                setLoader(false)
            })
    }

    const handleGoogleLogin = async () => {
        try {
            const data = await promptAsync()

            if (!("params" in data)) {
                if (Platform.OS === "ios") throw new Error("ios err")
                return
            }

            googleAuth(data?.params.code)
        } catch (e) {
            console.log("error handleGoogleLogin - ", e)
        }
    }

    return (
        <Pressable
            onPress={handleGoogleLogin}
            accessibilityRole="button"
            accessibilityLabel="Sign in with Google"
            style={({pressed}) => [
                styles.oauthBtn,
                pressed && styles.oauthBtnPressed,
            ]}
        >
            <Text color="onSurface">
                Sign in with Google
            </Text>
        </Pressable>
    )
}

const createStyles = (theme: any) => {
    // fallback-uri dacă anumite valori nu există în tema ta
    const radius = theme?.radius?.xl ?? 16;
    const spacing = theme?.spacing ?? {
        xs: 6,
        sm: 8,
        md: 12,
        lg: 16,
        xl: 24,
        xxl: 32,
    };
    const colors = theme?.colors ?? {
        background: "#F7F8FA",
        surface: "#FFFFFF",
        onBackground: "#111111",
        onSurface: "#111111",
        onSurfaceVariant: "#6B7280",
        primary: "#0A84FF",
        onPrimary: "#FFFFFF",
        outline: "#E5E7EB",
    };

    const placeholder = Platform.select({
        ios: "#9AA0A6",
        android: "#9AA0A6",
        default: "#9AA0A6",
    });

    return StyleSheet.create({
        oauthBtn: {
            borderWidth: 1,
            borderColor: colors.outline,
            backgroundColor: colors.surface,
            borderRadius: radius,
            paddingVertical: spacing.md,
            alignItems: "center",
            justifyContent: "center",
            marginBottom: spacing.md,
        },
        oauthBtnPressed: {
            opacity: 0.9,
        },
    });
};