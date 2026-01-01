import React from "react";
import { View, StyleSheet, Image, Pressable } from "react-native";
import {
  createDrawerNavigator,
  DrawerContentScrollView,
  DrawerContentComponentProps,
  DrawerItemList,
} from "@react-navigation/drawer";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import DashboardScreen from "@/screens/DashboardScreen";
import CustomersScreen from "@/screens/CustomersScreen";
import InvoicesScreen from "@/screens/InvoicesScreen";
import ProductsScreen from "@/screens/ProductsScreen";
import SettingsScreen from "@/screens/SettingsScreen";
import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, BrandColors } from "@/constants/theme";

export type DrawerParamList = {
  Dashboard: undefined;
  Customers: undefined;
  Invoices: undefined;
  Products: undefined;
  Settings: undefined;
};

const Drawer = createDrawerNavigator<DrawerParamList>();

function CustomDrawerContent(props: DrawerContentComponentProps) {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.drawerContainer, { backgroundColor: theme.backgroundRoot }]}>
      <View style={[styles.drawerHeader, { paddingTop: insets.top + Spacing.lg }]}>
        <Image
          source={require("../../assets/images/icon.png")}
          style={styles.logo}
          resizeMode="contain"
        />
        <View style={styles.headerTextContainer}>
          <ThemedText type="h3" style={styles.shopName}>Nazaara</ThemedText>
          <ThemedText type="small" style={[styles.tagline, { color: theme.textSecondary }]}>
            Retail Billing Made Simple
          </ThemedText>
        </View>
      </View>
      <View style={[styles.divider, { backgroundColor: theme.divider }]} />
      <DrawerContentScrollView {...props} contentContainerStyle={styles.drawerContent}>
        <DrawerItemList {...props} />
      </DrawerContentScrollView>
    </View>
  );
}

export default function DrawerNavigator() {
  const { theme, isDark } = useTheme();

  return (
    <Drawer.Navigator
      initialRouteName="Dashboard"
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        headerShown: false,
        drawerActiveTintColor: BrandColors.primary,
        drawerInactiveTintColor: theme.text,
        drawerActiveBackgroundColor: isDark ? "rgba(228, 93, 240, 0.2)" : "rgba(228, 93, 240, 0.1)",
        drawerLabelStyle: {
          fontSize: 16,
          fontWeight: "500",
          marginLeft: -Spacing.md,
        },
        drawerItemStyle: {
          borderRadius: BorderRadius.md,
          marginHorizontal: Spacing.sm,
          paddingLeft: Spacing.sm,
        },
        drawerStyle: {
          width: 280,
          backgroundColor: theme.backgroundRoot,
        },
      }}
    >
      <Drawer.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{
          drawerLabel: "Dashboard",
          drawerIcon: ({ color, size }) => (
            <Feather name="home" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="Customers"
        component={CustomersScreen}
        options={{
          drawerLabel: "Customers",
          drawerIcon: ({ color, size }) => (
            <Feather name="users" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="Invoices"
        component={InvoicesScreen}
        options={{
          drawerLabel: "Invoices",
          drawerIcon: ({ color, size }) => (
            <Feather name="file-text" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="Products"
        component={ProductsScreen}
        options={{
          drawerLabel: "Categories",
          drawerIcon: ({ color, size }) => (
            <Feather name="grid" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          drawerLabel: "Settings",
          drawerIcon: ({ color, size }) => (
            <Feather name="settings" size={size} color={color} />
          ),
        }}
      />
    </Drawer.Navigator>
  );
}

const styles = StyleSheet.create({
  drawerContainer: {
    flex: 1,
  },
  drawerHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.xl,
  },
  logo: {
    width: 56,
    height: 56,
    borderRadius: BorderRadius.md,
  },
  headerTextContainer: {
    marginLeft: Spacing.lg,
  },
  shopName: {
    color: BrandColors.primary,
  },
  tagline: {
    marginTop: Spacing.xs,
  },
  divider: {
    height: 1,
    marginHorizontal: Spacing.lg,
  },
  drawerContent: {
    paddingTop: Spacing.lg,
  },
});
