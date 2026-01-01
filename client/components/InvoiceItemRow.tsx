import React, { useEffect, useState } from "react";
import { View, StyleSheet, Pressable, TextInput } from "react-native";
import { Feather } from "@expo/vector-icons";
import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { DefaultCategories, Spacing, BorderRadius, Typography, BrandColors } from "@/constants/theme";
import { InvoiceItem, CategoryData } from "@/types";
import { storage } from "@/lib/storage";

interface InvoiceItemRowProps {
  item: InvoiceItem;
  onUpdate: (updates: Partial<InvoiceItem>) => void;
  onRemove: () => void;
  onSelectCategory: () => void;
  categories?: CategoryData[];
}

export function InvoiceItemRow({ item, onUpdate, onRemove, onSelectCategory, categories: propCategories }: InvoiceItemRowProps) {
  const { theme } = useTheme();
  const [categories, setCategories] = useState<{ id: string; label: string }[]>([]);

  useEffect(() => {
    if (propCategories) {
      setCategories(propCategories.map(c => ({ id: c.categoryId, label: c.label })));
    } else {
      loadCategories();
    }
  }, [propCategories]);

  const loadCategories = async () => {
    try {
      const cats = await storage.getCategories();
      if (cats.length > 0) {
        setCategories(cats.map(c => ({ id: c.categoryId, label: c.label })));
      } else {
        setCategories(DefaultCategories.map(c => ({ id: c.id, label: c.label })));
      }
    } catch (error) {
      setCategories(DefaultCategories.map(c => ({ id: c.id, label: c.label })));
    }
  };

  const getCategoryLabel = (categoryId: string): string => {
    const category = categories.find((c) => c.id === categoryId);
    if (category) return category.label;
    const defaultCat = DefaultCategories.find((c) => c.id === categoryId);
    return defaultCat?.label || categoryId;
  };

  const handleQuantityChange = (delta: number) => {
    const newQty = Math.max(1, item.quantity + delta);
    const lineTotal = newQty * item.unitPrice;
    onUpdate({ quantity: newQty, lineTotal });
  };

  const handlePriceChange = (text: string) => {
    const price = parseFloat(text) || 0;
    const lineTotal = item.quantity * price;
    onUpdate({ unitPrice: price, lineTotal });
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
      <View style={styles.header}>
        <Pressable
          onPress={onSelectCategory}
          style={[styles.categoryButton, { backgroundColor: theme.backgroundSecondary }]}
        >
          <ThemedText type="bodyMedium">{getCategoryLabel(item.category)}</ThemedText>
          <Feather name="chevron-down" size={16} color={theme.text} />
        </Pressable>
        <Pressable onPress={onRemove} style={styles.removeButton}>
          <Feather name="trash-2" size={18} color={theme.error} />
        </Pressable>
      </View>

      <TextInput
        style={[styles.descriptionInput, { backgroundColor: theme.inputBackground, borderColor: theme.inputBorder, color: theme.text }]}
        placeholder="Description (optional)"
        placeholderTextColor={theme.placeholder}
        value={item.description}
        onChangeText={(text) => onUpdate({ description: text })}
      />

      <View style={styles.row}>
        <View style={styles.quantityContainer}>
          <ThemedText type="small" secondary style={styles.fieldLabel}>Qty</ThemedText>
          <View style={styles.quantityControls}>
            <Pressable
              onPress={() => handleQuantityChange(-1)}
              style={[styles.qtyButton, { backgroundColor: theme.backgroundSecondary }]}
            >
              <Feather name="minus" size={16} color={theme.text} />
            </Pressable>
            <ThemedText type="bodyMedium" style={styles.qtyValue}>{item.quantity}</ThemedText>
            <Pressable
              onPress={() => handleQuantityChange(1)}
              style={[styles.qtyButton, { backgroundColor: theme.backgroundSecondary }]}
            >
              <Feather name="plus" size={16} color={theme.text} />
            </Pressable>
          </View>
        </View>

        <View style={styles.priceContainer}>
          <ThemedText type="small" secondary style={styles.fieldLabel}>Price</ThemedText>
          <View style={styles.priceInputContainer}>
            <ThemedText type="body" style={styles.currencySymbol}>Rs.</ThemedText>
            <TextInput
              style={[styles.priceInput, { backgroundColor: theme.inputBackground, borderColor: theme.inputBorder, color: theme.text }]}
              keyboardType="numeric"
              value={item.unitPrice > 0 ? item.unitPrice.toString() : ""}
              onChangeText={handlePriceChange}
              placeholder="0"
              placeholderTextColor={theme.placeholder}
            />
          </View>
        </View>

        <View style={styles.totalContainer}>
          <ThemedText type="small" secondary style={styles.fieldLabel}>Total</ThemedText>
          <ThemedText type="price" style={{ color: BrandColors.primary }}>
            Rs. {item.lineTotal.toLocaleString("en-IN")}
          </ThemedText>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  categoryButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.sm,
    gap: Spacing.xs,
  },
  removeButton: {
    padding: Spacing.sm,
  },
  descriptionInput: {
    height: 40,
    borderWidth: 1,
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.md,
    fontSize: Typography.small.fontSize,
    textAlignVertical: "center",
  },
  row: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: Spacing.lg,
  },
  quantityContainer: {
    flex: 1,
  },
  fieldLabel: {
    marginBottom: Spacing.xs,
  },
  quantityControls: {
    flexDirection: "row",
    alignItems: "center",
  },
  qtyButton: {
    width: 32,
    height: 32,
    borderRadius: BorderRadius.sm,
    alignItems: "center",
    justifyContent: "center",
  },
  qtyValue: {
    minWidth: 32,
    textAlign: "center",
  },
  priceContainer: {
    flex: 1.2,
  },
  priceInputContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  currencySymbol: {
    marginRight: Spacing.xs,
  },
  priceInput: {
    flex: 1,
    height: 36,
    borderWidth: 1,
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.sm,
    fontSize: Typography.body.fontSize,
    textAlignVertical: "center",
  },
  totalContainer: {
    flex: 1.2,
    alignItems: "flex-end",
  },
});
