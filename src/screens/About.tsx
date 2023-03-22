import { View, Text, Linking } from "react-native";
import { CustomButton } from "../ui";
import { version } from "../../package.json";

export default function Result() {
  return (
    <View className="flex-1 pt-8 items-center justify-start bg-white dark:bg-slate-800">
      <View className="w-full flex flex-col justify-center items-center">
        <Text className="text-lg w-10/12 text-slate-900 dark:text-slate-100 ">
          Dreamify is a simple app that helps you to generate images from text
          for free using Stable Diffusion.
        </Text>
        <CustomButton
          className="mt-4"
          variant="primary"
          title="Source code"
          onPress={() =>
            Linking.openURL("https://github.com/360macky/dreamify")
          }
        />
        <CustomButton
          className="mt-4"
          variant="secondary"
          title="Web version"
          onPress={() =>
            Linking.openURL("https://dreamify.art/")
          }
        />
        <View className="mt-12">
          <Text className="text-lg w-10/12 text-slate-900 dark:text-slate-100 ">
            Dreamify Version {version}
          </Text>
        </View>
      </View>
    </View>
  );
}
