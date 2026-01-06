import { Stack } from "expo-router";
import React from "react";
import { ProfileProvider } from "../context/profileContext";

export default function RootLayout() {
  return (
    <ProfileProvider>
      <Stack screenOptions={{ headerShown: false }} />
    </ProfileProvider>
  );
}
