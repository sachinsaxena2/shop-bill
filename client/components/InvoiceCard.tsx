import React from "react";
import { View, StyleSheet, Pressable } from "react-native";
import { Feather } from "@expo/vector-icons";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  WithSpringConfig,
} from "react-native-reanimated";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, BrandColors } from "@/constants/theme";
import { Invoice } from "@/types";

interface InvoiceCardProps {
  invoice: Invoice;
  onPress: () => void;
}

const springConfig: WithSpringConfig = {
  damping: 15,
  mass: 0.3,
  stiffness: 150,
  overshootClamping: true,
  energyThreshold: 0.001,
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const getStatusColor = (status: string, theme: any) => {
  switch (status) {
    case "paid":
      return BrandColors.success;
    case "pending":
      return BrandColors.warning;
    case "cancelled":
      return theme.error;
    default:
      return theme.textSecondary;
  }
};

export function InvoiceCard({ invoice, onPress }: InvoiceCardProps) {
  const { theme } = useTheme();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.98, springConfig);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, springConfig);
  };

  const statusColor = getStatusColor(invoice.status, theme);
  const formattedDate = new Date(invoice.createdAt).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[
        styles.container,
        { backgroundColor: theme.cardBackground, borderColor: theme.border },
        animatedStyle,
      ]}
    >
      <View style={styles.header}>
        <View>
          <ThemedText type="bodyMedium">{invoice.invoiceNumber}</ThemedText>
          <ThemedText type="small" secondary>{invoice.customerName}</ThemedText>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: statusColor + "20" }]}>
          <ThemedText type="caption" style={[styles.statusText, { color: statusColor }]}>
            {invoice.status.toUpperCase()}
          </ThemedText>
        </View>
      </View>
      <View style={styles.footer}>
        <ThemedText type="caption" secondary>{formattedDate}</ThemedText>
        <ThemedText type="price" style={{ color: BrandColors.primary }}>
          Rs. {invoice.total.toLocaleString("en-IN")}
        </ThemedText>
      </View>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    marginBottom: Spacing.sm,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: Spacing.md,
  },
  statusBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.xs,
  },
  statusText: {
    fontWeight: "600",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
});
