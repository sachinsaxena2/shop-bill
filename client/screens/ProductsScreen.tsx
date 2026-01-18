import React, { useState, useCallback } from "react";
import { View, StyleSheet, FlatList, Pressable, RefreshControl, Alert, Modal } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { ScreenHeader } from "@/components/ScreenHeader";
import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { EmptyState } from "@/components/EmptyState";
import { KeyboardAwareScrollViewCompat } from "@/components/KeyboardAwareScrollViewCompat";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, BrandColors, DefaultCategories } from "@/constants/theme";
import { storage } from "@/lib/storage";
import { CategoryData } from "@/types";

const AVAILABLE_ICONS = [
  { id: "shopping-bag", label: "Shopping Bag" },
  { id: "layout", label: "Layout" },
  { id: "airplay", label: "Top" },
  { id: "award", label: "Award" },
  { id: "align-left", label: "Lines" },
  { id: "sidebar", label: "Sidebar" },
  { id: "package", label: "Package" },
  { id: "tag", label: "Tag" },
  { id: "gift", label: "Gift" },
  { id: "star", label: "Star" },
  { id: "heart", label: "Heart" },
  { id: "bookmark", label: "Bookmark" },
];

export default function ProductsScreen() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const [categories, setCategories] = useState<CategoryData[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryData | null>(null);
  const [categoryName, setCategoryName] = useState("");
  const [categoryIcon, setCategoryIcon] = useState("tag");

  const loadData = useCallback(async () => {
    try {
      const cats = await storage.getCategories();
      if (cats.length === 0) {
        const defaultCatsToSave = DefaultCategories.map((c, index) => ({
          categoryId: c.id,
          label: c.label,
          icon: c.icon,
          isActive: true,
          sortOrder: index,
        }));
        for (const cat of defaultCatsToSave) {
          await storage.saveCategory(cat);
        }
        const savedCats = await storage.getCategories();
        setCategories(savedCats);
      } else {
        setCategories(cats);
      }
    } catch (error) {
      console.error("Error loading categories:", error);
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

  const handleAddCategory = () => {
    setEditingCategory(null);
    setCategoryName("");
    setCategoryIcon("tag");
    setShowModal(true);
  };

  const handleEditCategory = (category: CategoryData) => {
    setEditingCategory(category);
    setCategoryName(category.label);
    setCategoryIcon(category.icon || "tag");
    setShowModal(true);
  };

  const handleDeleteCategory = (category: CategoryData) => {
    Alert.alert(
      "Delete Category",
      `Are you sure you want to delete "${category.label}"?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            await storage.deleteCategory(category.id);
            loadData();
          },
        },
      ]
    );
  };

  const handleSaveCategory = async () => {
    if (!categoryName.trim()) {
      Alert.alert("Error", "Please enter a category name");
      return;
    }

    const categoryId = categoryName.toLowerCase().replace(/\s+/g, "_");
    const trimmedName = categoryName.trim().toLowerCase();

    if (editingCategory) {
      const existingByLabel = categories.find(
        c => c.label.toLowerCase() === trimmedName && c.categoryId !== editingCategory.categoryId
      );
      if (existingByLabel) {
        Alert.alert("Error", "A category with this name already exists");
        return;
      }
      await storage.updateCategory(editingCategory.id, {
        label: categoryName.trim(),
        icon: categoryIcon,
      });
    } else {
      const existingByLabel = categories.find(c => c.label.toLowerCase() === trimmedName);
      const existingById = categories.find(c => c.categoryId === categoryId);
      if (existingByLabel || existingById) {
        Alert.alert("Error", "A category with this name already exists");
        return;
      }
      await storage.saveCategory({
        categoryId,
        label: categoryName.trim(),
        icon: categoryIcon,
        isActive: true,
        sortOrder: categories.length,
      });
    }

    setShowModal(false);
    loadData();
  };

  const renderCategory = ({ item }: { item: CategoryData }) => (
    <Pressable
      style={[styles.categoryCard, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}
      onPress={() => handleEditCategory(item)}
    >
      <View style={[styles.categoryIcon, { backgroundColor: BrandColors.primary + "20" }]}>
        <Feather name={item.icon as any || "tag"} size={24} color={BrandColors.primary} />
      </View>
      <View style={styles.categoryInfo}>
        <ThemedText type="bodyMedium">{item.label}</ThemedText>
        <ThemedText type="caption" secondary>ID: {item.categoryId}</ThemedText>
      </View>
      <Pressable 
        onPress={(e) => {
          e?.stopPropagation?.();
          handleDeleteCategory(item);
        }} 
        style={styles.deleteButton}
        hitSlop={8}
      >
        <Feather name="trash-2" size={18} color={theme.error} />
      </Pressable>
    </Pressable>
  );

  return (
    <ThemedView style={styles.container}>
      <ScreenHeader 
        title="Categories" 
        rightAction={{
          icon: "plus",
          onPress: handleAddCategory,
        }}
      />

      {categories.length > 0 ? (
        <FlatList
          data={categories}
          keyExtractor={(item) => item.categoryId}
          renderItem={renderCategory}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <EmptyState
          icon="grid"
          title="No categories yet"
          description="Add categories to organize your invoices"
          actionLabel="Add Category"
          onAction={handleAddCategory}
        />
      )}

      <Modal
        visible={showModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowModal(false)}
      >
        <ThemedView style={styles.modalContainer}>
          <View style={[styles.modalHeader, { borderBottomColor: theme.border, paddingTop: insets.top + Spacing.lg }]}>
            <Pressable onPress={() => setShowModal(false)}>
              <ThemedText type="link">Cancel</ThemedText>
            </Pressable>
            <ThemedText type="h4">{editingCategory ? "Edit Category" : "Add Category"}</ThemedText>
            <Pressable onPress={handleSaveCategory}>
              <ThemedText type="link">Save</ThemedText>
            </Pressable>
          </View>
          
          <KeyboardAwareScrollViewCompat contentContainerStyle={styles.modalContent}>
            <Input
              label="Category Name"
              placeholder="Enter category name"
              value={categoryName}
              onChangeText={setCategoryName}
            />
            
            <ThemedText type="small" style={styles.iconLabel}>Icon</ThemedText>
            <View style={styles.iconGrid}>
              {AVAILABLE_ICONS.map((icon) => (
                <Pressable
                  key={icon.id}
                  onPress={() => setCategoryIcon(icon.id)}
                  style={[
                    styles.iconOption,
                    { 
                      backgroundColor: categoryIcon === icon.id ? BrandColors.primary : theme.backgroundSecondary,
                      borderColor: categoryIcon === icon.id ? BrandColors.primary : theme.border,
                    },
                  ]}
                >
                  <Feather
                    name={icon.id as any}
                    size={20}
                    color={categoryIcon === icon.id ? "#FFFFFF" : theme.text}
                  />
                </Pressable>
              ))}
            </View>
          </KeyboardAwareScrollViewCompat>
        </ThemedView>
      </Modal>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    padding: Spacing.lg,
    paddingBottom: Spacing["3xl"],
  },
  categoryCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    marginBottom: Spacing.sm,
  },
  categoryIcon: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  categoryInfo: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  deleteButton: {
    padding: Spacing.sm,
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
  iconLabel: {
    marginBottom: Spacing.sm,
    marginTop: Spacing.lg,
    fontWeight: "500",
  },
  iconGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
  },
  iconOption: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
