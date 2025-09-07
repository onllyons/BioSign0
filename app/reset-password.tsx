import React, {useCallback, useEffect, useState} from "react";
import {
    View,
    StyleSheet,
    SafeAreaView,
    TouchableWithoutFeedback,
    Keyboard, Platform, Pressable, TextInput,
} from "react-native";
import {useRouter, useLocalSearchParams} from "expo-router";
import {useTheme} from "@/contexts/ThemeContext";
import {Text} from "@/components/ui";
import Loader from "@/components/modals/Loader";
import {SERVER_AJAX_URL, useRequests} from "@/hooks/useRequests";

export default function MailVerify() {
    const {hash} = useLocalSearchParams<{ hash?: string }>();
    const router = useRouter();
    const {theme} = useTheme();
    const styles = createStyles(theme);
    const {sendDefaultRequest} = useRequests()
    const [loader, setLoader] = useState(true)
    const [password, setPassword] = useState("")
    const [passwordConfirm, setPasswordConfirm] = useState("")

    const [securePassword, setSecurePassword] = useState(false)
    const [securePasswordConfirm, setSecurePasswordConfirm] = useState(false)

    const handleResetPassword = useCallback(async () => {
        try {
            await sendDefaultRequest({
                url: `${SERVER_AJAX_URL}/user/reset_password.php`,
                data: {hash, password, passwordConfirm}
            })
            router.replace("/")
        } catch (e) {
        } finally {
            setLoader(false)
        }
    }, [hash, password, passwordConfirm])

    const handleCheckHash = useCallback(async () => {
        try {
            await sendDefaultRequest({
                url: `${SERVER_AJAX_URL}/user/reset_password_check_hash.php`,
                data: {hash}
            })
        } catch (e) {
            router.replace("/")
        } finally {
            setLoader(false)
        }
    }, [hash, password, passwordConfirm])

    useEffect(() => {
        handleCheckHash()
    }, [])

    return (
        <View style={{flex: 1}}>
            <Loader visible={loader}/>

            <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
                <SafeAreaView style={styles.container}>
                    <View style={styles.wrapper}>
                        <Text variant="title" color="onBackground" style={styles.title}>
                            Password reset
                        </Text>

                        <View style={styles.field}>
                            <Text
                                variant="caption"
                                color="onSurfaceVariant"
                                style={styles.label}
                            >
                                New password
                            </Text>
                            <View style={styles.passwordRow}>
                                <TextInput
                                    value={password}
                                    onChangeText={setPassword}
                                    placeholder="Your password"
                                    secureTextEntry={securePassword}
                                    autoCapitalize="none"
                                    autoCorrect={false}
                                    textContentType="password"
                                    style={[styles.input, styles.inputPassword]}
                                    placeholderTextColor={styles._pColor}
                                    accessibilityLabel="Password"
                                />
                                <Pressable
                                    onPress={() => setSecurePassword((s) => !s)}
                                    accessibilityRole="button"
                                    accessibilityLabel={
                                        securePassword ? "Show password" : "Hide password"
                                    }
                                    style={styles.showBtn}
                                >
                                    <Text variant="body" color="primary">
                                        {securePassword ? "Show" : "Hide"}
                                    </Text>
                                </Pressable>
                            </View>
                        </View>

                        <View style={styles.field}>
                            <Text
                                variant="caption"
                                color="onSurfaceVariant"
                                style={styles.label}
                            >
                                New password confirm
                            </Text>
                            <View style={styles.passwordRow}>
                                <TextInput
                                    value={passwordConfirm}
                                    onChangeText={setPasswordConfirm}
                                    placeholder="Your password confirm"
                                    secureTextEntry={securePasswordConfirm}
                                    autoCapitalize="none"
                                    autoCorrect={false}
                                    textContentType="password"
                                    style={[styles.input, styles.inputPassword]}
                                    placeholderTextColor={styles._pColor}
                                    accessibilityLabel="Password"
                                />
                                <Pressable
                                    onPress={() => setSecurePasswordConfirm((s) => !s)}
                                    accessibilityRole="button"
                                    accessibilityLabel={
                                        securePasswordConfirm ? "Show password" : "Hide password"
                                    }
                                    style={styles.showBtn}
                                >
                                    <Text variant="body" color="primary">
                                        {securePasswordConfirm ? "Show" : "Hide"}
                                    </Text>
                                </Pressable>
                            </View>
                        </View>

                        <Pressable
                            onPress={handleResetPassword}
                            accessibilityRole="button"
                            accessibilityLabel="Sign in"
                            style={({pressed}) => [
                                styles.primaryBtn,
                                pressed && styles.primaryBtnPressed,
                            ]}
                        >
                            <Text
                                variant="button"
                                color="onPrimary"
                                style={styles.primaryBtnText}
                            >
                                Reset
                            </Text>
                        </Pressable>

                        <Pressable
                            onPress={() => router.replace("/")}
                            accessibilityRole="button"
                            accessibilityLabel="Go back"
                        >
                            <Text color="onSurface">
                                Go to main menu
                            </Text>
                        </Pressable>
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
        showBtn: {
            position: "absolute",
            right: spacing.sm,
            paddingHorizontal: spacing.md,
            paddingVertical: spacing.sm,
            borderRadius: 999,
            justifyContent: "center",
            alignItems: "center",
        },
        wrapper: {
            flex: 1,
            paddingHorizontal: spacing.lg,
            paddingTop: spacing.xl,
        },
        title: {},
        field: {
            marginBottom: spacing.lg,
        },
        label: {
            marginBottom: spacing.sm,
            fontSize: 15,
        },
        inputPassword: {
            paddingRight: 72, // spațiu pentru butonul Show/Hide
        },
        input: {
            borderWidth: 1,
            borderColor: colors.outline,
            backgroundColor: colors.surface,
            color: colors.onSurface,
            paddingHorizontal: spacing.lg,
            paddingVertical: spacing.md,
            borderRadius: radius,
            fontSize: 16,
        },
        passwordRow: {
            position: "relative",
            justifyContent: "center",
        },
        primaryBtn: {
            backgroundColor: colors.primary,
            borderRadius: radius,
            paddingVertical: spacing.md + 2,
            alignItems: "center",
            justifyContent: "center",
        },
        primaryBtnPressed: {
            opacity: 0.9,
        },
        primaryBtnText: {
            textAlign: "center",
            color: 'white'
        },
    });
};
