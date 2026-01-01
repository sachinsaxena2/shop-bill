import React, { useState, useCallback } from "react";
import { View, StyleSheet, FlatList, TextInput, RefreshControl } from "react-native";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

import { ThemedView } from "@/components/ThemedView";
import { ScreenHeader } from "@/components/ScreenHeader";
import { CustomerCard } from "@/components/CustomerCard";
import { FAB } from "@/components/FAB";
import { EmptyState } from "@/components/EmptyState";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, Typography } from "@/constants/theme";
import { storage } from "@/lib/storage";
import { Customer, Invoice } from "@/types";
import { RootStackParamList } from "@/navigation/RootStackNavigator";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function CustomersScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { theme } = useTheme();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [customerTotals, setCustomerTotals] = useState<Record<string, number>>({});
  const [searchQuery, setSearchQuery] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [showSearch, setShowSearch] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const [customersData, invoicesData] = await Promise.all([
        storage.getCustomers(),
        storage.getInvoices(),
      ]);

      const totals: Record<string, number> = {};
      invoicesData.forEach((invoice: Invoice) => {
        if (!totals[invoice.customerId]) {
          totals[invoice.customerId] = 0;
        }
        totals[invoice.customerId] += invoice.total;
      });

      setCustomers(customersData.sort((a, b) => 
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      ));
      setCustomerTotals(totals);
    } catch (error) {
      console.error("Error loading customers:", error);
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

  const handleAddCustomer = () => {
    navigation.navigate("CreateCustomer");
  };

  const handleViewCustomer = (customer: Customer) => {
    navigation.navigate("CustomerDetail", { customerId: customer.id });
  };

  const filteredCustomers = customers.filter((customer) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      customer.name.toLowerCase().includes(query) ||
      customer.phone.includes(query)
    );
  });

  const renderCustomer = ({ item }: { item: Customer }) => (
    <CustomerCard
      customer={item}
      totalPurchases={customerTotals[item.id] || 0}
      onPress={() => handleViewCustomer(item)}
    />
  );

  return (
    <ThemedView style={styles.container}>
      <ScreenHeader 
        title="Customers" 
        rightAction={{
          icon: showSearch ? "x" : "search",
          onPress: () => setShowSearch(!showSearch),
        }}
      />
      
      {showSearch ? (
        <View style={[styles.searchContainer, { backgroundColor: theme.backgroundDefault }]}>
          <TextInput
            style={[styles.searchInput, { color: theme.text, backgroundColor: theme.inputBackground, borderColor: theme.inputBorder }]}
            placeholder="Search by name or phone..."
            placeholderTextColor={theme.placeholder}
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoFocus
          />
        </View>
      ) : null}

      {customers.length > 0 ? (
        <FlatList
          data={filteredCustomers}
          keyExtractor={(item) => item.id}
          renderItem={renderCustomer}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <EmptyState
          icon="users"
          title="No customers yet"
          description="Add your first customer to get started"
          actionLabel="Add Customer"
          onAction={handleAddCustomer}
        />
      )}
      
      <FAB onPress={handleAddCustomer} icon="user-plus" />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchContainer: {
    padding: Spacing.lg,
  },
  searchInput: {
    height: 44,
    borderWidth: 1,
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.lg,
    fontSize: Typography.body.fontSize,
  },
  listContent: {
    padding: Spacing.lg,
    paddingBottom: Spacing.fabSize + Spacing["3xl"],
  },
});
