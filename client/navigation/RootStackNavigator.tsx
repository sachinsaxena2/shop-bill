import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import DrawerNavigator from "@/navigation/DrawerNavigator";
import CreateInvoiceScreen from "@/screens/CreateInvoiceScreen";
import CustomerDetailScreen from "@/screens/CustomerDetailScreen";
import InvoiceDetailScreen from "@/screens/InvoiceDetailScreen";
import CreateCustomerScreen from "@/screens/CreateCustomerScreen";
import { useScreenOptions } from "@/hooks/useScreenOptions";

export type RootStackParamList = {
  Main: undefined;
  CreateInvoice: { customerId?: string; invoiceId?: string } | undefined;
  CustomerDetail: { customerId: string };
  InvoiceDetail: { invoiceId: string };
  CreateCustomer: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootStackNavigator() {
  const screenOptions = useScreenOptions({ transparent: false });

  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen
        name="Main"
        component={DrawerNavigator}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="CreateInvoice"
        component={CreateInvoiceScreen}
        options={{
          presentation: "modal",
          headerTitle: "New Invoice",
        }}
      />
      <Stack.Screen
        name="CustomerDetail"
        component={CustomerDetailScreen}
        options={{
          presentation: "modal",
          headerTitle: "Customer",
        }}
      />
      <Stack.Screen
        name="InvoiceDetail"
        component={InvoiceDetailScreen}
        options={{
          presentation: "modal",
          headerTitle: "Invoice",
        }}
      />
      <Stack.Screen
        name="CreateCustomer"
        component={CreateCustomerScreen}
        options={{
          presentation: "modal",
          headerTitle: "Add Customer",
        }}
      />
    </Stack.Navigator>
  );
}
