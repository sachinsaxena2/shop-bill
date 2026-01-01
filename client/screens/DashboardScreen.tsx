import React, { useEffect, useState, useCallback } from "react";
import { View, StyleSheet, ScrollView, RefreshControl } from "react-native";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { ScreenHeader } from "@/components/ScreenHeader";
import { SummaryCard } from "@/components/SummaryCard";
import { InvoiceCard } from "@/components/InvoiceCard";
import { FAB } from "@/components/FAB";
import { EmptyState } from "@/components/EmptyState";
import { Spacing, BrandColors } from "@/constants/theme";
import { storage } from "@/lib/storage";
import { Invoice } from "@/types";
import { RootStackParamList } from "@/navigation/RootStackNavigator";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function DashboardScreen() {
  const navigation = useNavigation<NavigationProp>();
  const [refreshing, setRefreshing] = useState(false);
  const [todaySales, setTodaySales] = useState(0);
  const [invoiceCount, setInvoiceCount] = useState(0);
  const [recentInvoices, setRecentInvoices] = useState<Invoice[]>([]);

  const loadData = useCallback(async () => {
    try {
      const today = new Date().toISOString().split("T")[0];
      const summary = await storage.getDailySummary(today);
      setTodaySales(summary.totalSales);
      setInvoiceCount(summary.invoiceCount);

      const invoices = await storage.getInvoices();
      const sorted = invoices.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      setRecentInvoices(sorted.slice(0, 5));
    } catch (error) {
      console.error("Error loading dashboard data:", error);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleCreateInvoice = () => {
    navigation.navigate("CreateInvoice");
  };

  const handleViewInvoice = (invoice: Invoice) => {
    navigation.navigate("InvoiceDetail", { invoiceId: invoice.id });
  };

  return (
    <ThemedView style={styles.container}>
      <ScreenHeader title="Nazaara" showLogo />
      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        <ThemedText type="h3" style={styles.greeting}>Today's Overview</ThemedText>
        
        <View style={styles.summaryRow}>
          <SummaryCard
            title="Today's Sales"
            value={`Rs. ${todaySales.toLocaleString("en-IN")}`}
            icon="trending-up"
            color={BrandColors.primary}
          />
          <View style={styles.summaryGap} />
          <SummaryCard
            title="Invoices"
            value={invoiceCount.toString()}
            icon="file-text"
            color={BrandColors.success}
          />
        </View>

        <View style={styles.sectionHeader}>
          <ThemedText type="h4">Recent Invoices</ThemedText>
        </View>

        {recentInvoices.length > 0 ? (
          recentInvoices.map((invoice) => (
            <InvoiceCard
              key={invoice.id}
              invoice={invoice}
              onPress={() => handleViewInvoice(invoice)}
            />
          ))
        ) : (
          <EmptyState
            icon="file-text"
            title="No invoices yet"
            description="Create your first invoice to get started"
            actionLabel="Create Invoice"
            onAction={handleCreateInvoice}
          />
        )}
      </ScrollView>
      <FAB onPress={handleCreateInvoice} icon="plus" />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: Spacing.lg,
    paddingBottom: Spacing.fabSize + Spacing["3xl"],
  },
  greeting: {
    marginBottom: Spacing.lg,
  },
  summaryRow: {
    flexDirection: "row",
    marginBottom: Spacing.md,
  },
  summaryGap: {
    width: Spacing.md,
  },
  sectionHeader: {
    marginTop: Spacing.xl,
    marginBottom: Spacing.lg,
  },
});
