import { Alert } from "react-native";
import * as MediaLibrary from "expo-media-library";
import * as FileSystem from "expo-file-system";

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

export async function saveImageToDevice (url: string) {
  if (!(await requestPermission())) {
    return;
  }
  const { uri } = await FileSystem.downloadAsync(
    url,
    FileSystem.cacheDirectory + "temp-image.jpg"
  );

  const asset = await MediaLibrary.createAssetAsync(uri);

  const albumName = "Dreamify";
  const album = await MediaLibrary.getAlbumAsync(albumName);
  if (album === null) {
    await MediaLibrary.createAlbumAsync(albumName, asset, false);
  } else {
    await MediaLibrary.addAssetsToAlbumAsync([asset], album, false);
  }

  Alert.alert("Great!", "Image saved to gallery!");
};


