import React, { useState, useRef, useEffect } from "react";
import { View, StyleSheet, Alert } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ThemedView } from "@/components/ThemedView";
import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { KeyboardAwareScrollViewCompat } from "@/components/KeyboardAwareScrollViewCompat";
import { Spacing, BrandColors } from "@/constants/theme";
import { storage } from "@/lib/storage";

export default function CreateCustomerScreen() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const isSavingRef = useRef(false);
  const phoneCheckTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isCheckingPhone, setIsCheckingPhone] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  // Check for existing customer when phone number reaches 10 digits
  useEffect(() => {
    // Clear any pending timeout
    if (phoneCheckTimeoutRef.current) {
      clearTimeout(phoneCheckTimeoutRef.current);
    }

    const cleanPhone = phone.replace(/[^0-9]/g, "");
    
    // Only check if we have exactly 10 digits
    if (cleanPhone.length === 10) {
      // Debounce the check by 500ms
      phoneCheckTimeoutRef.current = setTimeout(async () => {
        setIsCheckingPhone(true);
        try {
          const existingCustomer = await storage.getCustomerByPhone(cleanPhone);
          if (existingCustomer) {
            setErrors(prev => ({ 
              ...prev, 
              phone: `Customer "${existingCustomer.name}" already exists with this phone number` 
            }));
          } else {
            // Clear phone error if customer doesn't exist
            setErrors(prev => {
              const newErrors = { ...prev };
              delete newErrors.phone;
              return newErrors;
            });
          }
        } catch (error) {
          console.error("Error checking phone:", error);
        } finally {
          setIsCheckingPhone(false);
        }
      }, 500);
    } else if (cleanPhone.length > 10) {
      // If more than 10 digits, show format error
      setErrors(prev => ({ 
        ...prev, 
        phone: "Phone number should be exactly 10 digits" 
      }));
    } else {
      // Clear phone error for less than 10 digits
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.phone;
        return newErrors;
      });
    }

    // Cleanup timeout on unmount
    return () => {
      if (phoneCheckTimeoutRef.current) {
        clearTimeout(phoneCheckTimeoutRef.current);
      }
    };
  }, [phone]);
  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!name.trim()) {
      newErrors.name = "Name is required";
    }

    if (!phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (!/^[0-9]{10}$/.test(phone.replace(/[^0-9]/g, ""))) {
      newErrors.phone = "Please enter a valid 10-digit phone number";
    } else if (errors.phone && errors.phone.includes("already exists")) {
      // Keep the existing phone error if customer already exists
      newErrors.phone = errors.phone;
    }

    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Please enter a valid email address";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (isSavingRef.current) return;
    if (!validate()) return;

    isSavingRef.current = true;
    setIsSaving(true);
    try {
      await storage.saveCustomer({
        name: name.trim(),
        phone: phone.replace(/[^0-9]/g, ""),
        email: email.trim() || undefined,
        address: address.trim() || undefined,
        notes: notes.trim() || undefined,
      });

      navigation.goBack();
    } catch (error: any) {
      console.error("Error saving customer:", error);
      const errorMessage = error?.message || "";
      if (errorMessage.includes("400") || errorMessage.includes("already exists")) {
        setErrors({ ...errors, phone: "A customer with this phone number already exists" });
      } else {
        Alert.alert("Error", "Failed to save customer");
      }
      isSavingRef.current = false;
      setIsSaving(false);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <KeyboardAwareScrollViewCompat
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + Spacing.xl }]}
        showsVerticalScrollIndicator={false}
      >
        <Input
          label="Name *"
          placeholder="Enter customer name"
          value={name}
          onChangeText={setName}
          error={errors.name}
          autoCapitalize="words"
        />
        
        <Input
          label="Phone Number *"
          placeholder="Enter 10-digit phone number"
          value={phone}
          onChangeText={setPhone}
          error={errors.phone}
          helperText={isCheckingPhone ? "Checking if customer exists..." : undefined}
          keyboardType="phone-pad"
        />
        
        <Input
          label="Email"
          placeholder="Enter email address (optional)"
          value={email}
          onChangeText={setEmail}
          error={errors.email}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        
        <Input
          label="Address"
          placeholder="Enter address (optional)"
          value={address}
          onChangeText={setAddress}
          multiline
          numberOfLines={3}
        />
        
        <Input
          label="Notes"
          placeholder="Add any notes about this customer (optional)"
          value={notes}
          onChangeText={setNotes}
          multiline
          numberOfLines={3}
        />

        <Button
          onPress={handleSave}
          disabled={isSaving}
          style={styles.saveButton}
        >
          {isSaving ? "Saving..." : "Add Customer"}
        </Button>
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
  },
  saveButton: {
    marginTop: Spacing.xl,
  },
});
