import 'react-native-gesture-handler';
import React, { useEffect } from 'react';
import { Platform } from 'react-native';

import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import * as IAP from 'expo-iap';

import HomeScreen from './src/screens/HomeScreen';
import MotivationScreen from './src/screens/MotivationScreen';
import NutritionScreen from './src/screens/NutritionScreen';
import PremiumScreen from './src/screens/PremiumScreen';
import RunScreen from './src/screens/RunScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import StepsScreen from './src/screens/StepsScreen';
import WorkoutsScreen from './src/screens/WorkoutsScreen';
import { initDb, kvSet } from './src/lib/db';
import { setPremiumUnlocked } from './src/lib/store';

// Ensure tables exist before any screen reads from DB.
try {
  initDb();
} catch {
  // ignore; app can still render basic UI
}

export default function App() {
  useEffect(() => {
    // react-native-iap needs native build (not Expo Go)
    // We keep initialization guarded so dev can still run UI.
    let purchaseUpdateSub: any = null;
    let purchaseErrorSub: any = null;
    (async () => {
      try {
        await IAP.initConnection();
        purchaseUpdateSub = IAP.purchaseUpdatedListener(async (purchase: any) => {
          try {
            // Basic entitlement: any successful purchase of our SKU unlocks premium.
            const pid = purchase?.productId || purchase?.sku;
            if (pid) kvSet('iap.lastPurchasedSku', String(pid));
            setPremiumUnlocked(true);

            // Finish transaction to acknowledge/complete.
            try {
              await IAP.finishTransaction({ purchase, isConsumable: false });
            } catch {
              // ignore
            }
          } catch {
            // ignore
          }
        });

        purchaseErrorSub = IAP.purchaseErrorListener(() => {
          // ignore global purchase errors; UI handles its own errors
        });
      } catch {
        // ignore
      }
    })();
    return () => {
      try {
        purchaseUpdateSub?.remove?.();
        purchaseErrorSub?.remove?.();
        IAP.endConnection();
      } catch {
        // ignore
      }
    };
  }, []);

  async function startPurchase() {
    // You must create these products in App Store Connect / Google Play Console.
    const productId = Platform.select({
      ios: 'com.yourcompany.fitnessapp.premium',
      android: 'com.fittrack.premium',
      default: 'com.fittrack.premium',
    }) as string;

    // In a real release, you should validate receipts on a server.
    // For offline-only apps, we still store local entitlement after a successful transaction.
    await IAP.requestPurchase({
      type: 'in-app',
      request: {
        apple: { sku: productId },
        google: { skus: [productId] },
      },
    });
    setPremiumUnlocked(true);
    kvSet('iap.lastPurchasedSku', productId);
  }

  async function restorePurchase() {
    const iosSku = 'com.yourcompany.fitnessapp.premium';
    const androidSku = 'com.fittrack.premium';
    const purchases = await IAP.getAvailablePurchases();
    const hasSku =
      (purchases ?? []).some((p: any) => p?.productId === iosSku || p?.productId === androidSku || p?.sku === androidSku);
    setPremiumUnlocked(hasSku);
  }

  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Home" options={{ title: 'FitTrack' }}>
          {({ navigation }) => (
            <HomeScreen
              onOpenMotivation={() => navigation.navigate('Motivation')}
              onOpenPremium={() => navigation.navigate('Premium')}
              onOpenWorkouts={() => navigation.navigate('Workouts')}
              onOpenNutrition={() => navigation.navigate('Nutrition')}
              onOpenSteps={() => navigation.navigate('Steps')}
              onOpenRun={() => navigation.navigate('Run')}
              onOpenSettings={() => navigation.navigate('Settings')}
            />
          )}
        </Stack.Screen>
        <Stack.Screen name="Workouts" component={WorkoutsScreen} />
        <Stack.Screen name="Nutrition" component={NutritionScreen} />
        <Stack.Screen name="Steps" component={StepsScreen} />
        <Stack.Screen name="Run" component={RunScreen} />
        <Stack.Screen name="Motivation" component={MotivationScreen} />
        <Stack.Screen name="Premium">
          {() => <PremiumScreen onStartPurchase={startPurchase} onRestorePurchase={restorePurchase} />}
        </Stack.Screen>
        <Stack.Screen name="Settings" component={SettingsScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

type RootStackParamList = {
  Home: undefined;
  Workouts: undefined;
  Nutrition: undefined;
  Steps: undefined;
  Run: undefined;
  Motivation: undefined;
  Premium: undefined;
  Settings: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
