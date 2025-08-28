import {View, StyleSheet, Button as RNButton} from 'react-native';
import {useTheme} from '@/contexts/ThemeContext';
import {Text, Card, Spacer, PressableButton} from '@/components/ui';
import {useRouter} from 'expo-router';
import {useData} from '@/contexts/DataContext';
import {getUser, isAuthenticated, login, logout} from "@/utils/Auth";
import {SERVER_AJAX_URL, useRequests} from "@/hooks/useRequests";
import React, {useState} from "react";
import Loader from "@/components/modals/Loader";

export default function HomeScreen() {
    const {theme} = useTheme();
    const {documents, restartApp} = useData();
    const router = useRouter();
    const styles = createStyles(theme);
    const {sendDefaultRequest} = useRequests()
    const [loader, setLoader] = useState(false)

    const handleGoToLogin = () => {
        router.push('/login');
    };
    const handleGoToChangePassword = () => {
        router.push('/change-password');
    };

    const handleConfirmEmail = async () => {
        setLoader(true)

        try {
            await sendDefaultRequest({url: `${SERVER_AJAX_URL}/user/send_confirm_email.php`})
        } catch (e) {
        } finally {
            setLoader(false)
        }
    };

    const totalDocuments = documents.length;
    const signedDocuments = documents.filter(doc => doc.signed).length;
    const pendingDocuments = totalDocuments - signedDocuments;

    return (
        <View style={styles.container}>
            <Loader visible={loader}/>
            <View style={styles.header}>
                <Text variant="title" color="onBackground" style={styles.title}>
                    BioSign
                </Text>
                <Text variant="body" color="onSurfaceVariant" style={styles.subtitle}>
                    Welcome to your biometric signature app
                </Text>
            </View>
            <View style={styles.content}>
                {isAuthenticated() ? (
                    <>
                        <Text>Logined</Text>
                        <Text>Email: {getUser()?.email}</Text>
                        <Text>Id: {getUser()?.id}</Text>
                        <RNButton title="Confirm email" onPress={handleConfirmEmail}/>
                        <RNButton title="Go to change password" onPress={handleGoToChangePassword}/>
                        <RNButton title="Logout" onPress={async () => {
                            await logout()
                            restartApp()
                        }}/>
                    </>
                ) : (
                    <RNButton title="Go to Login" onPress={handleGoToLogin}/>
                )}

                <Card style={styles.quickActions}>
                    <Text variant="headline" color="onSurface" style={styles.sectionTitle}>
                        Quick Actions
                    </Text>
                    <Spacer size="md"/>
                    <PressableButton
                        title="Create New Document"
                        onPress={() => router.push('/documents/create')}
                        variant="primary"
                        style={styles.actionButton}
                        accessibilityLabel="Create new document"
                        testID="quick-action-create-document"
                    />
                    <Spacer size="sm"/>
                    <PressableButton
                        title="View Recent Documents"
                        onPress={() => router.push('/documents')}
                        variant="outline"
                        style={styles.actionButton}
                        accessibilityLabel="View recent documents"
                        testID="quick-action-view-documents"
                    />
                </Card>
                <Spacer size="lg"/>
                <Card style={styles.statsCard}>
                    <Text variant="headline" color="onSurface" style={styles.sectionTitle}>
                        Overview
                    </Text>
                    <Spacer size="md"/>
                    <View style={styles.statsRow}>
                        <View style={styles.statItem}>
                            <Text variant="title" color="primary">{totalDocuments}</Text>
                            <Text variant="caption" color="onSurfaceVariant">Documents</Text>
                        </View>
                        <View style={styles.statItem}>
                            <Text variant="title" color="success">{signedDocuments}</Text>
                            <Text variant="caption" color="onSurfaceVariant">Signed</Text>
                        </View>
                        <View style={styles.statItem}>
                            <Text variant="title" color="secondary">{pendingDocuments}</Text>
                            <Text variant="caption" color="onSurfaceVariant">Pending</Text>
                        </View>
                    </View>
                </Card>
            </View>
        </View>
    );
}

const createStyles = (theme: any) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    header: {
        paddingTop: theme.spacing.xxl + theme.spacing.md,
        paddingHorizontal: theme.spacing.lg,
        paddingBottom: theme.spacing.xl,
    },
    title: {
        marginBottom: theme.spacing.md,
    },
    subtitle: {
        textAlign: 'left',
    },
    content: {
        flex: 1,
        paddingHorizontal: theme.spacing.lg,
    },
    quickActions: {
        padding: theme.spacing.xl,
    },
    sectionTitle: {
        marginBottom: theme.spacing.lg,
    },
    actionButton: {
        width: '100%',
    },
    statsCard: {
        padding: theme.spacing.xl,
    },
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
    },
    statItem: {
        alignItems: 'center',
    },
});