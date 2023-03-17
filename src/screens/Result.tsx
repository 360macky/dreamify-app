import { View, Text } from "react-native";

export default function Result({ route, navigation }: { route: any, navigation: any }) {
  return (
    <View className="flex-1 pt-12 items-center justify-start bg-white dark:bg-slate-800">
      <View className="w-full flex flex-col justify-center items-center">
        <Text className="text-4xl font-bold text-slate-900 dark:text-slate-100 ">
          Prompt: {route.params.prompt}
        </Text>
      </View>
    </View>
  );
}

