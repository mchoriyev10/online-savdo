import { Stack } from "expo-router";
import Colors from "@/constants/colors";

export default function AdminLayout() {
  return (
    <Stack
      screenOptions={{
        headerBackTitle: "Orqaga",
        headerStyle: { backgroundColor: Colors.background },
        headerShadowVisible: false,
      }}
    />
  );
}