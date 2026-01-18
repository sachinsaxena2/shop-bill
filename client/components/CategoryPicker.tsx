import React, { useEffect, useState } from "react";
import { View, StyleSheet, Pressable, ScrollView } from "react-native";
import { Feather } from "@expo/vector-icons";
import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { DefaultCategories, Spacing, BorderRadius, BrandColors } from "@/constants/theme";
import { storage } from "@/lib/storage";
import { CategoryData } from "@/types";

interface CategoryPickerProps {
  selectedCategory: string | null;
  onSelectCategory: (category: string) => void;
  showAll?: boolean;
  categories?: CategoryData[];
}

export function CategoryPicker({ selectedCategory, onSelectCategory, showAll = false, categories: propCategories }: CategoryPickerProps) {
  const { theme } = useTheme();
  const [categories, setCategories] = useState<{ id: string; label: string; icon: string }[]>([]);

  useEffect(() => {
    if (propCategories) {
      const sorted = propCategories
        .map(c => ({ id: c.categoryId, label: c.label, icon: c.icon }))
        .sort((a, b) => a.label.localeCompare(b.label));
      setCategories(sorted);
    } else {
      loadCategories();
    }
  }, [propCategories]);

  const loadCategories = async () => {
    try {
      const cats = await storage.getCategories();
      if (cats.length > 0) {
        const sorted = cats
          .filter(c => c.isActive)
          .map(c => ({ id: c.categoryId, label: c.label, icon: c.icon }))
          .sort((a, b) => a.label.localeCompare(b.label));
        setCategories(sorted);
      } else {
        const sorted = DefaultCategories
          .map(c => ({ id: c.id, label: c.label, icon: c.icon }))
          .sort((a, b) => a.label.localeCompare(b.label));
        setCategories(sorted);
      }
    } catch (error) {
      const sorted = DefaultCategories
        .map(c => ({ id: c.id, label: c.label, icon: c.icon }))
        .sort((a, b) => a.label.localeCompare(b.label));
      setCategories(sorted);
    }
  };

  const allCategories = showAll
    ? [{ id: "all", label: "All", icon: "grid" }, ...categories]
    : categories;

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {allCategories.map((category) => {
        const isSelected = selectedCategory === category.id || (showAll && selectedCategory === null && category.id === "all");
        return (
          <Pressable
            key={category.id}
            onPress={() => onSelectCategory(category.id === "all" ? null as any : category.id)}
            style={[
              styles.chip,
              {
                backgroundColor: isSelected ? BrandColors.primary : theme.backgroundSecondary,
                borderColor: isSelected ? BrandColors.primary : theme.border,
              },
            ]}
          >
            <Feather
              name={category.icon as any}
              size={16}
              color={isSelected ? "#FFFFFF" : theme.text}
              style={styles.icon}
            />
            <ThemedText
              type="small"
              style={[
                styles.label,
                { color: isSelected ? "#FFFFFF" : theme.text },
              ]}
            >
              {category.label}
            </ThemedText>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    gap: Spacing.sm,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
  },
  icon: {
    marginRight: Spacing.xs,
  },
  label: {
    fontWeight: "500",
  },
});
