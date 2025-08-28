import React, {useState} from "react";
import {
    View,
    StyleSheet,
    SafeAreaView,
    TextInput,
    Pressable,
    Platform,
    KeyboardAvoidingView,
    TouchableWithoutFeedback,
    Keyboard,
} from "react-native";
import {useRouter, Link} from "expo-router";
import {useTheme} from "@/contexts/ThemeContext";
import {Text} from "@/components/ui";
import {AppleLogin} from "@/components/auth/AppleLogin";
import {GoogleLogin} from "@/components/auth/GoogleLogin";
import Loader from "@/components/modals/Loader";
import {SERVER_AJAX_URL, SuccessResponse, useRequests} from "@/hooks/useRequests";
import {login, User, UserTokens} from "@/utils/Auth";
import {useData} from "@/contexts/DataContext";

type AuthResponse = SuccessResponse & {
    userData: User;
    tokens: UserTokens;
};

export default function LoginScreen() {
    const {theme} = useTheme();
    const router = useRouter();
    const styles = createStyles(theme);
    const {sendDefaultRequest} = useRequests()
    const {restartApp} = useData()
    const [loader, setLoader] = useState(false)

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [secure, setSecure] = useState(true);

    const onSignIn = async () => {
        setLoader(true)

        try {
            const data = await sendDefaultRequest<AuthResponse>({
                url: `${SERVER_AJAX_URL}/user/login.php`,
                data: {email, password},
                showOptions: {success: false}
            })
            await login({userData: data.userData, tokensData: data.tokens})
            restartApp()
        } catch (e) {
        } finally {
            setLoader(false)
        }
    };

    return (
        <KeyboardAvoidingView
            style={{flex: 1}}
            behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
            <Loader visible={loader} mode={"container"}/>
            <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
                <SafeAreaView style={styles.container}>
                    <View style={styles.wrapper}>
                        <Text variant="title" color="onBackground" style={styles.title}>
                            Welcome back
                        </Text>
                        <Text
                            variant="body"
                            color="onSurfaceVariant"
                            style={styles.subtitle}
                        >
                            Sign in to continue
                        </Text>

                        <View style={styles.card}>
                            {/* Email */}
                            <View style={styles.field}>
                                <Text
                                    variant="caption"
                                    color="onSurfaceVariant"
                                    style={styles.label}
                                >
                                    Email
                                </Text>
                                <TextInput
                                    value={email}
                                    onChangeText={setEmail}
                                    placeholder="name@example.com"
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                    autoCorrect={false}
                                    textContentType="emailAddress"
                                    style={styles.input}
                                    placeholderTextColor={styles._pColor}
                                    accessibilityLabel="Email"
                                />
                            </View>

                            {/* Password */}
                            <View style={styles.field}>
                                <Text
                                    variant="caption"
                                    color="onSurfaceVariant"
                                    style={styles.label}
                                >
                                    Password
                                </Text>
                                <View style={styles.passwordRow}>
                                    <TextInput
                                        value={password}
                                        onChangeText={setPassword}
                                        placeholder="Your password"
                                        secureTextEntry={secure}
                                        autoCapitalize="none"
                                        autoCorrect={false}
                                        textContentType="password"
                                        style={[styles.input, styles.inputPassword]}
                                        placeholderTextColor={styles._pColor}
                                        accessibilityLabel="Password"
                                    />
                                    <Pressable
                                        onPress={() => setSecure((s) => !s)}
                                        accessibilityRole="button"
                                        accessibilityLabel={
                                            secure ? "Show password" : "Hide password"
                                        }
                                        style={styles.showBtn}
                                    >
                                        <Text variant="body" color="primary">
                                            {secure ? "Show" : "Hide"}
                                        </Text>
                                    </Pressable>
                                </View>
                            </View>

                            {/* Sign in */}
                            <Pressable
                                onPress={onSignIn}
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
                                    Sign in
                                </Text>
                            </Pressable>

                            {/* Links row */}
                            <View style={styles.linksRow}>
                                <Link href="/forgot-password" asChild>
                                    <Pressable accessibilityRole="button">
                                        <Text variant="body" color="primary">
                                            Forgot password?
                                        </Text>
                                    </Pressable>
                                </Link>

                                <Link href="/register" asChild>
                                    <Pressable accessibilityRole="button">
                                        <Text variant="body" color="primary">
                                            Create account
                                        </Text>
                                    </Pressable>
                                </Link>
                            </View>

                            {/* Divider */}
                            <View style={styles.dividerWrap}>
                                <View style={styles.dividerLine}/>
                                <Text
                                    variant="caption"
                                    color="onSurfaceVariant"
                                    style={styles.dividerText}
                                >
                                    or
                                </Text>
                                <View style={styles.dividerLine}/>
                            </View>

                            {/* Apple sign-in */}
                            <AppleLogin setLoader={setLoader}/>

                            <GoogleLogin setLoader={setLoader}/>
                        </View>
                    </View>
                </SafeAreaView>
            </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
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
        subtitle: {},

        card: {
            paddingTop: spacing.xl,
        },

        field: {
            marginBottom: spacing.lg,
        },
        label: {
            marginBottom: spacing.sm,
            fontSize: 15,
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
        inputPassword: {
            paddingRight: 72, // spațiu pentru butonul Show/Hide
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

        linksRow: {
            marginTop: spacing.md,
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
        },

        dividerWrap: {
            flexDirection: "row",
            alignItems: "center",
            marginVertical: spacing.lg,
            gap: spacing.md,
        },
        dividerLine: {
            flex: 1,
            height: 1,
            backgroundColor: colors.outline,
        },
        dividerText: {
            fontSize: 15,
        },

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
        appleBtn: {
            // pe iOS de obicei e full black, dar tu ai cerut simplu cu border ușor
        },
    });
};
