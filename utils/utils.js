import { Alert, PermissionsAndroid, Platform } from "react-native";

export const getExtention = filename => {
  // To get the file extension
  //return /[.]/.exec(filename) ? /[^.]+$/.exec(filename) : undefined;
  return filename.substr(filename.lastIndexOf('.')+1, filename.length)
};
export const getPermissionAndroid = async () => {
  try {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
      {
        title: 'Image Download Permission',
        message: 'Your permission is required to save images to your device',
        buttonNegative: 'Cancel',
        buttonPositive: 'OK',
      },
    );
    if (granted === PermissionsAndroid.RESULTS.GRANTED) {
      return true;
    }
    Alert.alert(
      'Save remote Image',
      'Grant Me Permission to save Image',
      [{text: 'OK', onPress: () => console.log('OK Pressed')}],
      {cancelable: false},
    );
  } catch (err) {
    Alert.alert(
      'Save remote Image',
      'Failed to save Image: ' + err.message,
      [{text: 'OK', onPress: () => console.log('OK Pressed')}],
      {cancelable: false},
    );
  }
};
export const downloadFile = async file_URL => {
  if (Platform.OS === 'android') {
    const granted = await getPermissionAndroid();
    if (!granted) {
      return;
    }
  }
  let date = new Date();
  // Image URL which we want to download

  // Getting the extention of the file
  let ext = getExtention(file_URL);
  ext = '.' + ext[0];

  const {config, fs} = RNFetchBlob;
  let PictureDir = fs.dirs.PictureDir;
  let options = {
    fileCache: true,
    addAndroidDownloads: {
      //Related to the Android only
      useDownloadManager: true,
      notification: true,
      path:
        PictureDir +
        '/image_123' +
        Math.floor(date.getTime() + date.getSeconds() / 2) +
        ext,
      description: 'Image',
    },
  };
  config(options)
    .fetch('GET', file_URL)
    .then(res => {
      //Showing alert after successful downloading
      console.log('res -> ', JSON.stringify(res));
      alert('Image Downloaded Successfully.');
    });
};
