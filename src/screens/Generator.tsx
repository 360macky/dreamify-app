import {
  View,
  Text,
  Alert,
  Image,
  useColorScheme,
  Platform,
  Keyboard,
} from "react-native";
import { useState } from "react";
import { CustomButton, CustomTextInput } from "../ui";
import * as MediaLibrary from "expo-media-library";
import * as FileSystem from "expo-file-system";
import * as Progress from "react-native-progress";
import * as Sharing from "expo-sharing";
import * as SecureStore from "expo-secure-store";
import uuid from "react-native-uuid";
import { saveImageToDevice } from "../utils";

/**
 * @name PredictionStatus
 * @description The status of a prediction not related to the Replicate API
 * @type {string}
 */
type PredictionStatus =
  | "initial"
  | "starting"
  | "loading"
  | "error"
  | "succeeded";

const BASE_URL = "https://dreamify.art";

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

interface Prediction {
  id: string;
  imageUrl: string;
  prompt: string;
}

export default function Generator({ navigation }: { navigation: any }) {
  let colorScheme = useColorScheme();
  const [generations, setGenerations] = useState<Prediction[]>([]);

  const [prompt, setPrompt] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [error, setError] = useState<string>("");
  const [prediction, setPrediction] = useState<any>(null);
  const [isImageSavingLoading, setIsImageSavingLoading] = useState(false);
  const [isImageSharingLoading, setIsImageSharingLoading] = useState(false);
  const [percentage, setPercentage] = useState<number>(0.0);
  const [predictionStatus, setPredictionStatus] =
    useState<PredictionStatus>("initial");

  async function saveData(imageUrl: string, prompt: string) {
    const newPair = {
      id: uuid.v4(),
      imageUrl,
      prompt,
    };

    try {
      const existingDataString = await SecureStore.getItemAsync("dreamifyData");
      let existingData = [];

      if (existingDataString) {
        existingData = JSON.parse(existingDataString);
      }

      existingData.push(newPair);

      await SecureStore.setItemAsync(
        "dreamifyData",
        JSON.stringify(existingData)
      );
      console.log("Data saved successfully");
    } catch (error) {
      console.error("Error saving data:", error);
    }
  }

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
    setIsImageSharingLoading(true);
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
    } finally {
      setIsImageSharingLoading(false);
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

  const saveExternalImageToGallery = async (url: string) => {
    try {
      setIsImageSavingLoading(true);
      await saveImageToDevice(url);
    } catch (error) {
      Alert.alert(
        "An error occurred while saving the image. Please try again."
      );
    } finally {
      setIsImageSavingLoading(false);
    }
  };

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
    setPredictionStatus("starting");

    // Poll for prediction status
    while (
      prediction.status !== "succeeded" &&
      prediction.status !== "failed"
    ) {
      await sleep(1000);
      const response = await fetch(`${BASE_URL}/api/image/` + prediction.id);
      prediction = await response.json();
      if (prediction.status === "processing") {
        setPredictionStatus("loading");
        setPercentage(
          roundToTwoDecimals(getLatestPercentage(prediction.logs) / 100)
        );
      }
      if (response.status !== 200) {
        setError(prediction.detail);
        setPredictionStatus("error");
        return;
      }
      if (prediction.status === "succeeded") {
        setImageUrl(prediction.output[prediction.output.length - 1]);
        setPredictionStatus("succeeded");
        saveData(prediction.output[prediction.output.length - 1], prompt);
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
          editable={
            predictionStatus === "initial" || predictionStatus === "error"
          }
        />
        <CustomButton
          title={
            predictionStatus === "starting" || predictionStatus === "loading"
              ? "Generating..."
              : "Generate"
          }
          variant="primary"
          onPress={() => {
            if (
              predictionStatus === "initial" ||
              predictionStatus === "error"
            ) {
              Keyboard.dismiss();
              onGenerateImage();
            }
          }}
        />
        {predictionStatus === "loading" &&
          (Platform.OS === "ios" ? (
            <View className="mt-2 flex w-10/12">
              <Progress.Bar
                progress={percentage}
                width={null}
                color={colorScheme === "dark" ? "#ffffff" : "#000000"}
              />
            </View>
          ) : (
            <View className="mt-2 flex w-10/12 justify-center items-center">
              <Text className="dark:text-white">
                Generating image at {percentage * 100}%
              </Text>
            </View>
          ))}
        {predictionStatus === "starting" && (
          <View className="mt-2 flex w-10/12 justify-center items-center">
            <Text className="dark:text-white">
              Starting image diffusion model...
            </Text>
          </View>
        )}
        {imageUrl && (
          <>
            <View className="mt-4 rounded bg-slate-300 w-10/12">
              <Image
                source={{
                  uri: imageUrl,
                }}
                style={{ width: "100%" }}
                className="w-full h-auto aspect-square rounded"
              />
            </View>
            <CustomButton
              title={isImageSavingLoading ? "Saving..." : "Save to device"}
              onPress={() => saveExternalImageToGallery(imageUrl)}
              variant="secondary"
            />
            <CustomButton
              title={
                isImageSharingLoading ? "Sharing..." : "Share with friends"
              }
              onPress={() => shareImage(imageUrl)}
              variant="secondary"
            />
          </>
        )}
      </View>
    </View>
  );
}
