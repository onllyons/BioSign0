import React, {useCallback, useEffect, useState} from "react";
import {
    View,
    StyleSheet,
    SafeAreaView,
    TouchableWithoutFeedback,
    Keyboard, Platform, Pressable,
} from "react-native";
import {useRouter, useLocalSearchParams} from "expo-router";
import {useTheme} from "@/contexts/ThemeContext";
import {Text} from "@/components/ui";
import Loader from "@/components/modals/Loader";
import {SERVER_AJAX_URL, SuccessResponse, useRequests} from "@/hooks/useRequests";

type MailVerifyResponse = SuccessResponse & {
    message: string
}

export default function MailVerify() {
    const {hash} = useLocalSearchParams<{ hash?: string }>();
    const router = useRouter();
    const {theme} = useTheme();
    const styles = createStyles(theme);
    const {sendDefaultRequest} = useRequests()
    const [loader, setLoader] = useState(true)
    const [response, setResponse] = useState<MailVerifyResponse | null>(null)

    const handleConfirmEmail = useCallback(async () => {
        try {
            const data = await sendDefaultRequest<MailVerifyResponse>({
                url: `${SERVER_AJAX_URL}/user/mail_verify.php`,
                data: {hash},
                showOptions: {error: false, success: false}
            })
            setResponse(data)
        } catch (e) {
            if (e && typeof e === "object") {
                const err = e as MailVerifyResponse;
                setResponse(err)
            }
        } finally {
            setLoader(false)
        }
    }, [hash])

    useEffect(() => {
        handleConfirmEmail()
    }, [hash]);

    const Response = () => {
        if (!response) return null

        if ("success" in response && "message" in response) {
            if (response.success) {
                return (
                    <View>
                        <Text variant="body" color="success">
                            {response.message}
                        </Text>
                    </View>
                );
            } else {
                return (
                    <View>
                        <Text variant="body" color="error">
                            {response.message}
                        </Text>
                    </View>
                );
            }
        } else {
            return (
                <View>
                    <Text variant="body" color="onBackground">
                        Something went wrong!
                    </Text>
                </View>
            );
        }
    };

    return (
        <View style={{flex: 1}}>
            <Loader visible={loader}/>

            <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
                <SafeAreaView style={styles.container}>
                    <View style={styles.wrapper}>
                        <Text variant="title" color="onBackground" style={styles.title}>
                            Mail verify
                        </Text>

                        <Response/>

                        {response && (
                            <Pressable
                                onPress={() => router.replace("/")}
                                accessibilityRole="button"
                                accessibilityLabel="Go back"
                            >
                                <Text color="onSurface">
                                    Go to main menu
                                </Text>
                            </Pressable>
                        )}
                    </View>
                </SafeAreaView>
            </TouchableWithoutFeedback>
        </View>
    );
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
        _pColor: placeholder as any,

        container: {
            flex: 1,
            backgroundColor: colors.background,
        },
        wrapper: {
            flex: 1,
            paddingHorizontal: spacing.lg,
            paddingTop: spacing.xl,
        },
        title: {},
    });
};
