import React from "react";
import { View, StyleSheet, Pressable, Image } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { DrawerActions, useNavigation } from "@react-navigation/native";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BrandColors } from "@/constants/theme";

interface ScreenHeaderProps {
  title: string;
  showMenu?: boolean;
  showBack?: boolean;
  showLogo?: boolean;
  rightAction?: {
    icon: keyof typeof Feather.glyphMap;
    onPress: () => void;
  };
}

export function ScreenHeader({ title, showMenu = true, showBack = false, showLogo = false, rightAction }: ScreenHeaderProps) {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();

  const handleMenuPress = () => {
    navigation.dispatch(DrawerActions.openDrawer());
  };

  const handleBackPress = () => {
    navigation.goBack();
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top + Spacing.sm, backgroundColor: theme.backgroundRoot }]}>
      <View style={styles.left}>
        {showMenu ? (
          <Pressable onPress={handleMenuPress} style={styles.iconButton}>
            <Feather name="menu" size={24} color={theme.text} />
          </Pressable>
        ) : null}
        {showBack ? (
          <Pressable onPress={handleBackPress} style={styles.iconButton}>
            <Feather name="arrow-left" size={24} color={theme.text} />
          </Pressable>
        ) : null}
      </View>
      
      <View style={styles.center}>
        {showLogo ? (
          <View style={styles.logoContainer}>
            <Image
              source={require("../../assets/images/icon.png")}
              style={styles.logo}
              resizeMode="contain"
            />
            <ThemedText type="h4" style={{ color: BrandColors.primary }}>{title}</ThemedText>
          </View>
        ) : (
          <ThemedText type="h4">{title}</ThemedText>
        )}
      </View>
      
      <View style={styles.right}>
        {rightAction ? (
          <Pressable onPress={rightAction.onPress} style={styles.iconButton}>
            <Feather name={rightAction.icon} size={24} color={theme.text} />
          </Pressable>
        ) : (
          <View style={styles.placeholder} />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.sm,
    paddingBottom: Spacing.sm,
  },
  left: {
    width: 48,
    alignItems: "flex-start",
  },
  center: {
    flex: 1,
    alignItems: "center",
  },
  right: {
    width: 48,
    alignItems: "flex-end",
  },
  iconButton: {
    width: 48,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
  },
  placeholder: {
    width: 48,
    height: 48,
  },
  logoContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  logo: {
    width: 28,
    height: 28,
    marginRight: Spacing.sm,
  },
});
