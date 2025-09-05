import {Image, Platform, Pressable, StyleSheet} from "react-native";
import React, {useRef} from "react";
import * as AppleAuthentication from "expo-apple-authentication";
import Toast from "react-native-toast-message";
import {useNavigation} from "@react-navigation/native";
import {login, User, UserTokens} from "@/utils/Auth";
import {SERVER_AJAX_URL, SuccessResponse, useRequests} from "@/hooks/useRequests";
import {useData} from "@/contexts/DataContext";
import {useTheme} from "@/contexts/ThemeContext";
import {Text} from "@/components/ui";

type AppleAuthResponse = SuccessResponse & {
    userData: User;
    tokens: UserTokens;
};

export const AppleLogin = ({setLoader}: {setLoader: (value: boolean) => void}) => {
    const {restartApp} = useData()
    const {theme} = useTheme();
    const styles = createStyles(theme);
    const {sendDefaultRequest} = useRequests()
    const navigation = useNavigation()
    const appleAuthProcess = useRef(false)

    const handleAppleAuth = async () => {
        try {
            const credential = await AppleAuthentication.signInAsync({
                requestedScopes: [
                    AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
                    AppleAuthentication.AppleAuthenticationScope.EMAIL,
                ],
            });

            setLoader(true)

            const data = await sendDefaultRequest<AppleAuthResponse>({
                url: `${SERVER_AJAX_URL}/user/apple_auth_user.php`,
                data: {...credential},
                showOptions: {success: false}
            })

            await login({userData: data.userData, tokensData: data.tokens})
            restartApp()
        } catch (e) {
            appleAuthProcess.current = false
            console.log(e)

            if (e && typeof e === "object" && "code" in e && e.code === 'ERR_REQUEST_CANCELED') {
                console.log("cancel")
            } else {
                console.log("error")
                Toast.show({
                    type: "error",
                    text1: "Authorization error"
                });
            }
        } finally {
            setLoader(false)
        }
    }

    return (
        <Pressable
            onPress={handleAppleAuth}
            accessibilityRole="button"
            accessibilityLabel="Sign in with Apple"
            style={({pressed}) => [
                styles.oauthBtn,
                styles.appleBtn,
                pressed && styles.oauthBtnPressed,
            ]}
        >
            <Text color="onSurface">
                Sign in with Apple
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
        appleBtn: {
            // pe iOS de obicei e full black, dar tu ai cerut simplu cu border ușor
        },
    });
};