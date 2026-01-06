import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import Constants from "expo-constants";

export async function registerForPushNotifications() {
  // 1. Cek kalau ini 'Device' sebenar (Bukan Simulator)
  if (!Device.isDevice) {
    console.log("Must use physical device for Push Notifications");
    return null;
  }

  // 2. Minta Permission
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== "granted") {
    console.log("Failed to get push token for push notification!");
    return null;
  }

  // 3. Dapatkan Token
  try {
    // Pastikan ID ini SAMA dengan yang ada dalam app.json -> "extra" -> "eas" -> "projectId"
    const myProjectId = "3d6d0794-745c-486e-9376-8b909d313b74"; 

    const tokenData = await Notifications.getExpoPushTokenAsync({
      projectId: myProjectId,
    });

    console.log("✅ Token Success:", tokenData.data); // Debugging

    // 4. Setup Channel untuk Android
    if (Platform.OS === "android") {
      await Notifications.setNotificationChannelAsync("default", {
        name: "default",
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: "#FF231F7C",
      });
    }

    return tokenData.data;

  } catch (error) {
    console.error("❌ Error getting push token:", error);
    return null;
  }
}

// Tambah di dalam lib/notifications.ts

export async function sendPushNotification(expoPushToken: string, title: string, body: string) {
  const message = {
    to: expoPushToken,
    sound: 'default',
    title: title,
    body: body,
    data: { someData: 'goes here' },
  };

  await fetch('https://exp.host/--/api/v2/push/send', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Accept-encoding': 'gzip, deflate',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(message),
  });
}