import { useState, useEffect } from "react";
import * as SecureStore from "expo-secure-store";
import { View, Text, Image, ScrollView, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { CustomButton } from "../ui";
import { saveImageToDevice } from "../utils";

async function fetchDreamifyData() {
  try {
    const dataString = await SecureStore.getItemAsync("dreamifyData");
    if (dataString) {
      const data = JSON.parse(dataString);
      return data;
    } else {
      return [];
    }
  } catch (error) {
    return [];
  }
}

interface Prediction {
  id: string;
  imageUrl: string;
  prompt: string;
}

export default function Gallery() {
  const [predictions, setPredictions] = useState([]);
  const [imageUrlSaving, setImageUrlSaving] = useState("");

  useEffect(() => {
    const fetchDataAsync = async () => {
      const fetchedData = await fetchDreamifyData();
      setPredictions(fetchedData);
      console.log(predictions);
    };

    fetchDataAsync();
  }, []);

  const saveImage = async (imageUrl: string) => {
    try {
      setImageUrlSaving(imageUrl);
      await saveImageToDevice(imageUrl);
    } catch (error) {
      Alert.alert("Error saving image");
    } finally {
      setImageUrlSaving("");
    }
  };

  const deleteImage = async (id: string) => {
    try {
      const existingDataString = await SecureStore.getItemAsync("dreamifyData");
      let existingData = [];

      if (existingDataString) {
        existingData = JSON.parse(existingDataString);
      }

      const updatedData = existingData.filter(
        (pair: Prediction) => pair.id !== id
      );

      await SecureStore.setItemAsync(
        "dreamifyData",
        JSON.stringify(updatedData)
      );

      setPredictions(updatedData);
    } catch (error) {
      Alert.alert("Error", "Something went wrong. Please try again.");
    }
  };

  const getRandomMessage = (): string => {
    const randomStrings = [
      "Wow! You have generated # images! If I was you, I would share it on Instagram.",
      "Currently you have # images in your gallery. That's awesome.",
      "You have generated # images. Want to share it with your friends?",
      "There are # images in your gallery. That's great!",
      "Great! In your gallery, you have # images.",
    ];

    const randomIndex = Math.floor(Math.random() * randomStrings.length);

    return randomStrings[randomIndex].replace(
      "#",
      predictions.length.toString()
    );
  };

  return (
    <View className="flex flex-1">
      <ScrollView className="flex-1 pt-4 pb-8 bg-white dark:bg-slate-800">
        <SafeAreaView className="flex justify-center items-center">
          <View className="flex flex-col py-2 w-10/12">
            <Text className="text-lg text-slate-900 dark:text-slate-100 text-center">
              {predictions.length === 0 && (
                <>This is a space for your generated images. It's now empty.</>
              )}
              {predictions.length === 1 && (
                <>Great! This is your first generated image.</>
              )}
              {predictions.length > 1 && <>{getRandomMessage()}</>}
            </Text>
          </View>
          <View className="w-10/12 pt-4 gap-y-6 pb-4">
            {predictions.map((prediction: Prediction) => (
              <View
                className="bg-slate-100 dark:bg-slate-700 dark:shadow p-4 rounded"
                key={prediction.id}
              >
                <Image
                  source={{
                    uri: prediction.imageUrl,
                  }}
                  style={{ width: "100%" }}
                  className="w-full h-auto aspect-square rounded"
                />
                <Text className="mt-4 text-center text-lg dark:text-white">
                  {prediction.prompt}
                </Text>
                <View className="flex flex-row gap-x-3">
                  <CustomButton
                    className="mt-4 flex-1"
                    variant="outline"
                    title={
                      imageUrlSaving === prediction.imageUrl
                        ? "Saving..."
                        : "Save"
                    }
                    onPress={() => {
                      saveImage(prediction.imageUrl);
                    }}
                  />
                  <CustomButton
                    className="mt-4 flex-1"
                    variant="outline"
                    title="Delete"
                    onPress={() => {
                      Alert.alert(
                        "Delete image",
                        "Are you sure you want to delete this image?",
                        [
                          {
                            text: "Cancel",
                            style: "cancel",
                          },
                          {
                            text: "OK",
                            onPress: () => deleteImage(prediction.id),
                            style: "destructive",
                          },
                        ],
                        { cancelable: false }
                      );
                    }}
                  />
                </View>
              </View>
            ))}
          </View>
        </SafeAreaView>
      </ScrollView>
    </View>
  );
}
