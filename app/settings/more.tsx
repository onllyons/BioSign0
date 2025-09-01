import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { Text, Spacer } from '@/components/ui';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const MoreSettingsScreen: React.FC = () => {
  const { theme } = useTheme();
  const router = useRouter();
  const styles = createStyles(theme);

  const menuItems = [
    {
      id: 'profile',
      title: 'My Profile',
      subtitle: 'Name, email, avatar',
      route: '/settings/profile',
      accessibilityLabel: 'Open my profile',
    },
    {
      id: 'privacy',
      title: 'Privacy & Security',
      subtitle: 'Permissions, password, 2FA',
      route: '/settings/privacy',
      accessibilityLabel: 'Open privacy and security settings',
    },
    {
      id: 'access-history',
      title: 'Access History',
      subtitle: 'Signed-in devices and login history',
      route: '/settings/access-history',
      accessibilityLabel: 'Open access history (devices and logins)',
    },
    {
      id: 'feedback',
      title: 'Feedback & Suggestions',
      route: '/settings/feedback',
      accessibilityLabel: 'Open feedback and suggestions page',
    },
    {
      id: 'faq',
      title: 'FAQ',
      route: '/settings/faq',
      accessibilityLabel: 'Open frequently asked questions',
    },
    {
      id: 'report-bug',
      title: 'Report a Bug',
      route: '/settings/report-bug',
      accessibilityLabel: 'Open report a bug page',
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text variant="title" color="onBackground" style={styles.title}>
          More Settings 2
        </Text>
        <Text variant="body" color="onSurfaceVariant" style={styles.subtitle}>
          Additional settings and preferences
        </Text>
      </View>

      <ScrollView 
        style={styles.scrollView} 
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.menuContainer}>
          <View style={styles.menuGroup}>
            {menuItems.map((item, index) => (
              <React.Fragment key={item.id}>
                <TouchableOpacity
                  style={[
                    styles.menuRow,
                    index === 0 && styles.firstMenuRow,
                    index === menuItems.length - 1 && styles.lastMenuRow,
                  ]}
                  onPress={() => router.push(item.route as any)}
                  accessibilityRole="button"
                  accessibilityLabel={item.accessibilityLabel}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <View style={styles.menuContent}>
                    <Text variant="body" color="onSurface" style={styles.menuLabel}>
                      {item.title}
                    </Text>
                    {item.subtitle && (
                      <Text variant="caption" color="onSurfaceVariant" style={styles.menuSubtitle}>
                        {item.subtitle}
                      </Text>
                    )}
                  </View>
                  <Ionicons
                    name="chevron-forward"
                    size={18}
                    color={theme.colors.onSurfaceVariant}
                  />
                </TouchableOpacity>
                
                {index < menuItems.length - 1 && (
                  <View style={styles.menuSeparator} />
                )}
              </React.Fragment>
            ))}
          </View>
        </View>

        <Spacer size="xxl" />
      </ScrollView>
    </SafeAreaView>
  );
};

const createStyles = (theme: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    paddingTop: theme.spacing.md,
    paddingBottom: theme.spacing.lg,
    paddingHorizontal: theme.spacing.lg,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    marginBottom: theme.spacing.xs,
  },
  subtitle: {
    fontSize: 15,
    opacity: 0.8,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.xl,
  },
  menuContainer: {
    paddingBottom: theme.spacing.lg,
  },
  menuGroup: {
    backgroundColor: theme.colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.colors.outline,
    overflow: 'hidden',
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    minHeight: 50,
    backgroundColor: theme.colors.surface,
  },
  firstMenuRow: {
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  lastMenuRow: {
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
  },
  menuContent: {
    flex: 1,
  },
  menuLabel: {
    fontSize: 16,
    fontWeight: '400',
  },
  menuSubtitle: {
    fontSize: 13,
    lineHeight: 18,
    marginTop: 1,
  },
  menuSeparator: {
    height: 0.5,
    backgroundColor: theme.colors.outline,
    marginLeft: theme.spacing.lg,
    opacity: 0.3,
  },
});

export default MoreSettingsScreen;