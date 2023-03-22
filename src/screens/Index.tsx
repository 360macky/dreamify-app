import { View, Text, Alert, Share } from "react-native";
import { CustomButton } from "../ui";

export default function Index({ navigation }: { navigation: any }) {
  const shareApp = async () => {
    const message =
      "I'm creating images generated with Artificial Intelligence with https://dreamify.art";

    try {
      await Share.share({
        message,
        title: "Share Dreamify",
      });
    } catch (error) {
      console.error("Error sharing:", error);
      Alert.alert("An error occurred while sharing. Please try again.");
    }
  };

  return (
    <View className="flex-1 pt-12 items-center justify-start bg-white dark:bg-slate-800">
      <View className="w-full flex flex-col justify-center items-center">
        <Text className="text-4xl font-bold text-slate-900 dark:text-slate-100 ">
          Dreamify
        </Text>
        <Text className="text-xl font-bold text-slate-900 dark:text-slate-100 ">
          Generate AI images just from text!
        </Text>
        <CustomButton
          onPress={() => navigation.navigate("Generator")}
          title="Open generator"
          variant="primary"
        />
        <CustomButton
          onPress={() => {
            navigation.navigate("Gallery");
          }}
          title="Gallery"
          variant="secondary"
        />
        <CustomButton onPress={shareApp} title="Share" variant="secondary" />
        <CustomButton
          onPress={() => navigation.navigate("About")}
          title="About"
          variant="secondary"
        />
      </View>
    </View>
  );
}
