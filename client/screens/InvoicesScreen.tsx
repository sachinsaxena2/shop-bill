import React, { useState, useCallback } from "react";
import { View, StyleSheet, FlatList, Pressable, RefreshControl, TextInput, Modal, Platform } from "react-native";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { ScreenHeader } from "@/components/ScreenHeader";
import { InvoiceCard } from "@/components/InvoiceCard";
import { FAB } from "@/components/FAB";
import { EmptyState } from "@/components/EmptyState";
import { Input } from "@/components/Input";
import { Button } from "@/components/Button";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, BrandColors } from "@/constants/theme";
import { storage } from "@/lib/storage";
import { Invoice, InvoiceStatus } from "@/types";
import { RootStackParamList } from "@/navigation/RootStackNavigator";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type FilterType = "all" | "today" | "week" | "month" | "custom";

export default function InvoicesScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { theme } = useTheme();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [filter, setFilter] = useState<FilterType>("all");
  const [statusFilter, setStatusFilter] = useState<InvoiceStatus | "all">("all");
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const loadData = useCallback(async () => {
    try {
      const data = await storage.getInvoices();
      setInvoices(data.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      ));
    } catch (error) {
      console.error("Error loading invoices:", error);
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

  const parseDate = (dateStr: string): Date | null => {
    if (!dateStr) return null;
    const parts = dateStr.split("/");
    if (parts.length !== 3) return null;
    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const year = parseInt(parts[2], 10);
    if (isNaN(day) || isNaN(month) || isNaN(year)) return null;
    return new Date(year, month, day);
  };

  const getFilteredInvoices = () => {
    let filtered = [...invoices];
    
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(i => 
        i.customerName.toLowerCase().includes(query) ||
        i.customerPhone.includes(query) ||
        i.invoiceNumber.toLowerCase().includes(query)
      );
    }

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

    switch (filter) {
      case "today":
        filtered = filtered.filter(i => new Date(i.createdAt) >= today);
        break;
      case "week":
        filtered = filtered.filter(i => new Date(i.createdAt) >= weekAgo);
        break;
      case "month":
        filtered = filtered.filter(i => new Date(i.createdAt) >= monthAgo);
        break;
      case "custom":
        const from = parseDate(fromDate);
        const to = parseDate(toDate);
        if (from) {
          filtered = filtered.filter(i => new Date(i.createdAt) >= from);
        }
        if (to) {
          const toEnd = new Date(to);
          toEnd.setHours(23, 59, 59, 999);
          filtered = filtered.filter(i => new Date(i.createdAt) <= toEnd);
        }
        break;
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter(i => i.status === statusFilter);
    }

    return filtered;
  };

  const filteredInvoices = getFilteredInvoices();

  const filters: { key: FilterType; label: string }[] = [
    { key: "all", label: "All" },
    { key: "today", label: "Today" },
    { key: "week", label: "Week" },
    { key: "month", label: "Month" },
  ];

  const statusFilters: { key: InvoiceStatus | "all"; label: string }[] = [
    { key: "all", label: "All" },
    { key: "paid", label: "Paid" },
    { key: "pending", label: "Pending" },
    { key: "cancelled", label: "Cancelled" },
  ];

  const handleApplyCustomFilter = () => {
    setFilter("custom");
    setShowFilterModal(false);
  };

  const handleClearCustomFilter = () => {
    setFromDate("");
    setToDate("");
    setFilter("all");
    setShowFilterModal(false);
  };

  const renderInvoice = ({ item }: { item: Invoice }) => (
    <InvoiceCard
      invoice={item}
      onPress={() => handleViewInvoice(item)}
    />
  );

  return (
    <ThemedView style={styles.container}>
      <ScreenHeader 
        title="Invoices" 
        rightAction={{
          icon: "sliders",
          onPress: () => setShowFilterModal(true),
        }}
      />

      <View style={[styles.searchContainer, { backgroundColor: theme.backgroundDefault }]}>
        <Feather name="search" size={18} color={theme.textSecondary} />
        <TextInput
          style={[styles.searchInput, { color: theme.text }]}
          placeholder="Search by name, phone, or invoice #"
          placeholderTextColor={theme.placeholder}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 ? (
          <Pressable onPress={() => setSearchQuery("")}>
            <Feather name="x" size={18} color={theme.textSecondary} />
          </Pressable>
        ) : null}
      </View>
      
      <View style={styles.filterContainer}>
        {filters.map((f) => (
          <Pressable
            key={f.key}
            onPress={() => setFilter(f.key)}
            style={[
              styles.filterChip,
              { 
                backgroundColor: filter === f.key ? BrandColors.primary : theme.backgroundSecondary,
                borderColor: filter === f.key ? BrandColors.primary : theme.border,
              },
            ]}
          >
            <ThemedText
              type="small"
              style={{ color: filter === f.key ? "#FFFFFF" : theme.text, fontWeight: "500" }}
            >
              {f.label}
            </ThemedText>
          </Pressable>
        ))}
        {filter === "custom" ? (
          <View style={[styles.filterChip, { backgroundColor: BrandColors.primary, borderColor: BrandColors.primary }]}>
            <ThemedText type="small" style={{ color: "#FFFFFF", fontWeight: "500" }}>
              Custom
            </ThemedText>
          </View>
        ) : null}
      </View>

      <View style={styles.statusFilterContainer}>
        {statusFilters.map((sf) => (
          <Pressable
            key={sf.key}
            onPress={() => setStatusFilter(sf.key)}
            style={[
              styles.statusChip,
              { 
                backgroundColor: statusFilter === sf.key ? theme.backgroundSecondary : "transparent",
                borderColor: statusFilter === sf.key ? theme.border : "transparent",
              },
            ]}
          >
            <ThemedText
              type="caption"
              style={{ 
                color: statusFilter === sf.key ? theme.text : theme.textSecondary, 
                fontWeight: statusFilter === sf.key ? "600" : "400" 
              }}
            >
              {sf.label}
            </ThemedText>
          </Pressable>
        ))}
      </View>

      {invoices.length > 0 ? (
        <FlatList
          data={filteredInvoices}
          keyExtractor={(item) => item.id}
          renderItem={renderInvoice}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyFilter}>
              <ThemedText secondary>No invoices found</ThemedText>
              {searchQuery.length > 0 || filter !== "all" || statusFilter !== "all" ? (
                <Pressable 
                  onPress={() => {
                    setSearchQuery("");
                    setFilter("all");
                    setStatusFilter("all");
                    setFromDate("");
                    setToDate("");
                  }}
                  style={[styles.clearButton, { borderColor: BrandColors.primary }]}
                >
                  <ThemedText type="small" style={{ color: BrandColors.primary }}>Clear Filters</ThemedText>
                </Pressable>
              ) : null}
            </View>
          }
        />
      ) : (
        <EmptyState
          icon="file-text"
          title="No invoices yet"
          description="Create your first invoice to get started"
          actionLabel="Create Invoice"
          onAction={handleCreateInvoice}
        />
      )}
      
      <FAB onPress={handleCreateInvoice} icon="plus" />

      <Modal
        visible={showFilterModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowFilterModal(false)}
      >
        <ThemedView style={styles.modalContainer}>
          <View style={[styles.modalHeader, { borderBottomColor: theme.border }]}>
            <Pressable onPress={() => setShowFilterModal(false)}>
              <ThemedText type="link">Cancel</ThemedText>
            </Pressable>
            <ThemedText type="h4">Filter by Date</ThemedText>
            <Pressable onPress={handleApplyCustomFilter}>
              <ThemedText type="link">Apply</ThemedText>
            </Pressable>
          </View>
          
          <View style={styles.modalContent}>
            <ThemedText type="bodyMedium" style={styles.filterLabel}>From Date</ThemedText>
            <Input
              placeholder="DD/MM/YYYY"
              value={fromDate}
              onChangeText={setFromDate}
              keyboardType="numeric"
            />
            
            <ThemedText type="bodyMedium" style={styles.filterLabel}>To Date</ThemedText>
            <Input
              placeholder="DD/MM/YYYY"
              value={toDate}
              onChangeText={setToDate}
              keyboardType="numeric"
            />

            <ThemedText type="caption" secondary style={styles.hint}>
              Enter dates in DD/MM/YYYY format (e.g., 25/12/2024)
            </ThemedText>

            <Pressable 
              onPress={handleClearCustomFilter}
              style={[styles.clearFilterButton, { borderColor: theme.border }]}
            >
              <ThemedText type="body" style={{ color: theme.error }}>Clear Date Filter</ThemedText>
            </Pressable>
          </View>
        </ThemedView>
      </Modal>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: Spacing.lg,
    marginVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    gap: Spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    paddingVertical: Spacing.xs,
  },
  filterContainer: {
    flexDirection: "row",
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    gap: Spacing.sm,
  },
  filterChip: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
  },
  statusFilterContainer: {
    flexDirection: "row",
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.sm,
    gap: Spacing.xs,
  },
  statusChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
  },
  listContent: {
    padding: Spacing.lg,
    paddingBottom: Spacing.fabSize + Spacing["3xl"],
  },
  emptyFilter: {
    padding: Spacing["3xl"],
    alignItems: "center",
    gap: Spacing.lg,
  },
  clearButton: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
  },
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: Spacing.lg,
    borderBottomWidth: 1,
  },
  modalContent: {
    padding: Spacing.lg,
  },
  filterLabel: {
    marginBottom: Spacing.sm,
    marginTop: Spacing.lg,
  },
  hint: {
    marginTop: Spacing.md,
  },
  clearFilterButton: {
    marginTop: Spacing["2xl"],
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    alignItems: "center",
  },
});
