import React, { useState, useEffect } from "react";
import { View, StyleSheet, Pressable, Alert } from "react-native";
import { Feather } from "@expo/vector-icons";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { ScreenHeader } from "@/components/ScreenHeader";
import { Input } from "@/components/Input";
import { Button } from "@/components/Button";
import { KeyboardAwareScrollViewCompat } from "@/components/KeyboardAwareScrollViewCompat";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, BrandColors } from "@/constants/theme";
import { storage, defaultSettings } from "@/lib/storage";
import { ShopSettings } from "@/types";

export default function SettingsScreen() {
  const { theme } = useTheme();
  const [settings, setSettings] = useState<ShopSettings>(defaultSettings);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    const data = await storage.getSettings();
    setSettings(data);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await storage.updateSettings(settings);
      Alert.alert("Success", "Settings saved successfully");
      setIsEditing(false);
    } catch (error) {
      Alert.alert("Error", "Failed to save settings");
    }
    setIsSaving(false);
  };

  const handleClearData = () => {
    Alert.alert(
      "Clear All Data",
      "This will delete all customers, invoices, and products. This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear Data",
          style: "destructive",
          onPress: async () => {
            await storage.clearAllData();
            Alert.alert("Data Cleared", "All data has been deleted");
            loadSettings();
          },
        },
      ]
    );
  };

  const updateSetting = (key: keyof ShopSettings, value: string | number) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <ThemedView style={styles.container}>
      <ScreenHeader 
        title="Settings" 
        rightAction={
          isEditing
            ? { icon: "check", onPress: handleSave }
            : { icon: "edit-2", onPress: () => setIsEditing(true) }
        }
      />
      
      <KeyboardAwareScrollViewCompat 
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.section}>
          <ThemedText type="h4" style={styles.sectionTitle}>Business Information</ThemedText>
          
          <Input
            label="Shop Name"
            value={settings.shopName}
            onChangeText={(text) => updateSetting("shopName", text)}
            editable={isEditing}
          />
          
          <Input
            label="Tagline"
            value={settings.tagline}
            onChangeText={(text) => updateSetting("tagline", text)}
            editable={isEditing}
          />
          
          <Input
            label="Address"
            value={settings.address || ""}
            onChangeText={(text) => updateSetting("address", text)}
            editable={isEditing}
            multiline
            numberOfLines={3}
          />
          
          <Input
            label="Phone"
            value={settings.phone || ""}
            onChangeText={(text) => updateSetting("phone", text)}
            editable={isEditing}
            keyboardType="phone-pad"
          />
          
          <Input
            label="GST Number"
            value={settings.gstNumber || ""}
            onChangeText={(text) => updateSetting("gstNumber", text)}
            editable={isEditing}
          />
        </View>

        <View style={styles.section}>
          <ThemedText type="h4" style={styles.sectionTitle}>Invoice Settings</ThemedText>
          
          <Input
            label="Invoice Prefix"
            value={settings.invoicePrefix}
            onChangeText={(text) => updateSetting("invoicePrefix", text)}
            editable={isEditing}
          />
          
          <Input
            label="Tax Rate (%)"
            value={settings.taxRate.toString()}
            onChangeText={(text) => updateSetting("taxRate", parseFloat(text) || 0)}
            editable={isEditing}
            keyboardType="numeric"
          />
        </View>

        <View style={styles.section}>
          <ThemedText type="h4" style={styles.sectionTitle}>Data Management</ThemedText>
          
          <Pressable
            style={[styles.dangerButton, { borderColor: theme.error }]}
            onPress={handleClearData}
          >
            <Feather name="trash-2" size={20} color={theme.error} />
            <ThemedText type="body" style={{ color: theme.error, marginLeft: Spacing.sm }}>
              Clear All Data
            </ThemedText>
          </Pressable>
        </View>

        <View style={styles.footer}>
          <ThemedText type="caption" secondary style={styles.footerText}>
            Nazaara Billing App v1.0.0
          </ThemedText>
          <ThemedText type="caption" secondary style={styles.footerText}>
            Retail Billing Made Simple
          </ThemedText>
        </View>
      </KeyboardAwareScrollViewCompat>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: Spacing.lg,
    paddingBottom: Spacing["4xl"],
  },
  section: {
    marginBottom: Spacing["2xl"],
  },
  sectionTitle: {
    marginBottom: Spacing.lg,
    color: BrandColors.primary,
  },
  dangerButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
  },
  footer: {
    alignItems: "center",
    marginTop: Spacing["2xl"],
  },
  footerText: {
    marginBottom: Spacing.xs,
  },
});
