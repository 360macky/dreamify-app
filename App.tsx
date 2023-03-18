import { Appearance, useColorScheme } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";

import Generator from "./src/screens/Generator";
import Index from "./src/screens/Index";
import Result from "./src/screens/Gallery";
import About from "./src/screens/About";
import Gallery from "./src/screens/Gallery";

const Stack = createNativeStackNavigator();

export default function App() {
  let colorScheme = useColorScheme();

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="Dreamify"
          screenOptions={{
            headerShown: true,
            headerStyle: {
              backgroundColor: colorScheme === "dark" ? "#1e293b" : "#ffffff",
            },
            headerTintColor: colorScheme === "dark" ? "#ffffff" : "#1e293b",
          }}
        >
          <Stack.Screen name="Dreamify" component={Index} />
          <Stack.Screen name="Generator" component={Generator} />
          <Stack.Screen name="Gallery" component={Gallery} />
          <Stack.Screen name="Result" component={Result} />
          <Stack.Screen name="About" component={About} />
        </Stack.Navigator>
      </NavigationContainer>
      <StatusBar style="auto" />
    </SafeAreaProvider>
  );
}
