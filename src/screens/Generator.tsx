import {
  View,
  Text,
  Alert,
  Image,
  useColorScheme,
  Platform,
} from "react-native";
import { useState, useEffect } from "react";
import { CustomButton, CustomTextInput } from "../ui";
import * as MediaLibrary from "expo-media-library";
import * as FileSystem from "expo-file-system";
import * as Progress from "react-native-progress";
import * as Sharing from "expo-sharing";

/**
 * @name PredictionStatus
 * @description The status of a prediction not related to the Replicate API
 * @type {string}
 */
type PredictionStatus = "initial" | "loading" | "error" | "succeeded";

const BASE_URL = "https://dreamify.art";

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export default function Generator({ navigation }: { navigation: any }) {
  let colorScheme = useColorScheme();

  const [prompt, setPrompt] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [error, setError] = useState<string>("");
  const [prediction, setPrediction] = useState<any>(null);
  const [percentage, setPercentage] = useState<number>(0.0);
  const [predictionStatus, setPredictionStatus] =
    useState<PredictionStatus>("initial");

  async function requestPermission() {
    const { status } = await MediaLibrary.requestPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Warning",
        "We need media library permission to download the generated images."
      );
      return false;
    }
    return true;
  }

  async function shareImage(url: string) {
    try {
      // Check if the sharing API is available on the device
      const isAvailable = await Sharing.isAvailableAsync();
      if (!isAvailable) {
        Alert.alert("Sharing is not supported on this device");
        return;
      }

      // Download the image to a temporary location
      const { uri } = await FileSystem.downloadAsync(
        url,
        FileSystem.cacheDirectory + "temp-image.jpg"
      );

      // Share the image using the device's native sharing UI
      await Sharing.shareAsync(uri);
    } catch (error) {
      console.error("Error sharing image:", error);
      Alert.alert(
        "An error occurred while sharing the image. Please try again."
      );
    }
  }

  const getLatestPercentage = (logs: any): number => {
    const regex = /(\d+)%\|.*?$/gm;
    let match;
    let lastPercentage;
    while ((match = regex.exec(logs))) {
      lastPercentage = match[1];
    }
    return Number(lastPercentage);
  };

  async function saveExternalImageToGallery(url: string) {
    // Make sure the user granted permission
    if (!(await requestPermission())) {
      return;
    }

    try {
      // Download the image to a temporary location
      const { uri } = await FileSystem.downloadAsync(
        url,
        FileSystem.cacheDirectory + "temp-image.jpg"
      );

      // Save the image to the gallery
      const asset = await MediaLibrary.createAssetAsync(uri);

      const albumName = "Dreamify";
      const album = await MediaLibrary.getAlbumAsync(albumName);
      if (album === null) {
        await MediaLibrary.createAlbumAsync(albumName, asset, false);
      } else {
        await MediaLibrary.addAssetsToAlbumAsync([asset], album, false);
      }

      Alert.alert("Great!", "Image saved to gallery!");
    } catch (error) {
      console.error("Error saving image:", error);
      Alert.alert(
        "Error",
        "An error occurred while saving the image. Please try again."
      );
    }
  }

  function roundToTwoDecimals(num: number): number {
    return Math.round((num + Number.EPSILON) * 100) / 100;
  }

  const onGenerateImage = async () => {
    if (prompt.length === 0) {
      Alert.alert("Error", "Please enter a prompt");
      return;
    }
    if (prompt.length > 84) {
      Alert.alert("Error", "Please enter a prompt less than 84 characters");
      return;
    }

    const response = await fetch(`${BASE_URL}/api/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ prompt }),
    });

    let prediction = await response.json();

    if (response.status !== 201) {
      console.error(prediction);
      setPredictionStatus("error");
      return;
    }

    setPrediction(prediction);
    setPredictionStatus("loading");

    // Poll for prediction status
    while (
      prediction.status !== "succeeded" &&
      prediction.status !== "failed"
    ) {
      await sleep(1000);
      const response = await fetch(`${BASE_URL}/api/image/` + prediction.id);
      prediction = await response.json();
      setPercentage(
        roundToTwoDecimals(getLatestPercentage(prediction.logs) / 100)
      );
      if (response.status !== 200) {
        setError(prediction.detail);
        setPredictionStatus("error");
        return;
      }
      if (prediction.status === "succeeded") {
        setImageUrl(prediction.output[prediction.output.length - 1]);
        setPredictionStatus("succeeded");
      }
      setPrediction(prediction);
    }
  };

  return (
    <View className="flex-1 pt-12 items-center justify-start bg-white dark:bg-slate-800">
      <View className="w-full flex flex-col justify-center items-center">
        <Text className="text-4xl font-bold text-slate-900 dark:text-slate-100 ">
          Dreamify
        </Text>
        <CustomTextInput
          placeholder="Describe what you want"
          value={prompt}
          onChangeText={setPrompt}
          returnKeyType="done"
          maxLength={84}
        />
        <CustomButton
          title="Generate"
          variant="primary"
          onPress={onGenerateImage}
        />
        {predictionStatus === "loading" &&
          (Platform.OS === "ios" ? (
            <View className="mt-2 flex w-10/12">
              <Progress.Bar
                progress={percentage}
                width={null}
                color={colorScheme === "dark" ? "#ffffff" : "#000000"}
                className=""
              />
            </View>
          ) : (
            <View className="mt-2 flex w-10/12 justify-center items-center">
              <Text>Generating image at {percentage * 100}%</Text>
            </View>
          ))}
        {imageUrl && (
          <>
            <View className="mt-4 rounded bg-slate-300 w-full w-10/12">
              <Image
                source={{
                  uri: imageUrl,
                }}
                style={{ width: "100%" }}
                className="w-full h-auto aspect-square rounded"
              />
            </View>
            <CustomButton
              title="Save to gallery"
              onPress={() => saveExternalImageToGallery(imageUrl)}
            />
            <CustomButton
              title="Share instantly"
              onPress={() => shareImage(imageUrl)}
            />
          </>
        )}
      </View>
    </View>
  );
}
