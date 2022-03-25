/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */

import React, {useEffect, useRef, useState} from 'react';
import {Node} from 'react';
import RNFetchBlob from 'rn-fetch-blob';
//import CameraRoll from '@react-native-community/cameraroll';
//import CameraRoll from "@react-native-community/cameraroll";

import {
  Dimensions,
  TouchableOpacity,
  PermissionsAndroid,
  Platform,
  Alert,
} from 'react-native';

import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from 'react-native';

import {
  Colors,
  DebugInstructions,
  Header,
  LearnMoreLinks,
  ReloadInstructions,
} from 'react-native/Libraries/NewAppScreen';
import WebView from 'react-native-webview';
import {getExtention, getPermissionAndroid} from './utils/utils';

const INJECTED_JAVASCRIPT = `(function() {
  window.callWebView = function(data){
    window.ReactNativeWebView.postMessage(data);
  }
  true;
})();`;

const runFirst = `
  window.isNativeApp = true;
  true; // note: this is required, or you'll sometimes get silent failures
`;

const test_image_URL =
  'https://v3.explorug.com/Assets/69CB4034543D2FEAF1A703B8F3C55516/Rooms/Bedroom%20Ariepad.jpg';

const App = () => {
  const iframeWidth = Dimensions.get('window').width; //Math.round(Dimensions.get('window').width);
  const iframeHeight = Dimensions.get('window').height; //Math.round(Dimensions.get('window').height);

  const [iframeWid, setIframeWid] = useState(iframeWidth);
  const [iframeHgt, setIframeHgt] = useState(iframeHeight);

  const webRef = useRef(null);
  const isDarkMode = useColorScheme() === 'dark';

  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
  };
  console.log('isDarkMode', isDarkMode);

  useEffect(() => {
    Dimensions.addEventListener('change', ({window: {width, height}}) => {
      setIframeWid(width);
      setIframeHgt(height);
    });
  }, []);

  const onWebviewMessage = event => {
    const url = event.nativeEvent.data;
    if (url) {
      const messageData = JSON.parse(url) || {};
      if (messageData?.pdf) {
        const pdf_url = messageData?.pdf;
        let fileName = messageData?.fileName || '';
        downloadFile({file_URL: pdf_url, fileName, type: 'pdf'});
      } else if (messageData?.image) {
        const img_url = messageData?.image;
        let fileName = messageData?.fileName || '';
        let extension = messageData?.extension || 'jpg';
        downloadFile({
          file_URL: img_url,
          fileName,
          extension: extension,
          type: 'img',
        });
      }
    }
  };

  const downloadFile = async ({
    file_URL,
    fileName,
    extension = '',
    type = 'img',
  }) => {
    if (Platform.OS === 'android') {
      const granted = await getPermissionAndroid();
      if (!granted) {
        return;
      }
    }

    // Getting the extention of the file
    let ext = extension ? extension : getExtention(file_URL);
    ext = '.' + ext;
    let date = new Date();

    const {config, fs} = RNFetchBlob;
    let PictureDir = fs.dirs.PictureDir;
    const nameSuffix = Math.floor(date.getTime() + date.getSeconds() / 2) + ext;
    let filename = fileName
      ? `${fileName}_${nameSuffix}`
      : `/${type}_${nameSuffix}`;

    const description = type === 'img' ? 'Image' : 'Pdf';

    let options = {
      fileCache: true,
      addAndroidDownloads: {
        //Related to the Android only
        useDownloadManager: true,
        notification: true,
        path: PictureDir + '/' + filename,
        description: description,
      },
    };
    config(options)
      .fetch('GET', file_URL)
      .then(res => {
        //Showing alert after successful downloading
        console.log('res -> ', JSON.stringify(res));
        Alert.alert(description + ' Downloaded Successfully.');
      });
  };

  return (
    <SafeAreaView style={backgroundStyle}>
      <StatusBar
        hidden={true}
        backgroundColor={'#fff'}
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
      />
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        style={backgroundStyle}>
        <View
          style={{
            backgroundColor: isDarkMode ? Colors.black : Colors.white,
          }}>
          <WebView
            allowFileAccess={true}
            originWhitelist={['*']}
            ref={webRef}
            source={{
              uri: 'https://createyourrug.explorug.com/explorug.html?page=brand&pageview=app&customclass=appview brand-app', //'https://v3.explorug.com/explorug.html?page=masterloom&pageview=app',
            }}
            style={{height: iframeHgt, width: iframeWid}}
            injectedJavaScriptBeforeContentLoaded={runFirst}
            onFileDownload={({nativeEvent: {downloadUrl}}) => {
              alert('onFileDownload ' + downloadUrl);
              // You use downloadUrl which is a string to download files however you want.
            }}
            injectedJavaScript={INJECTED_JAVASCRIPT}
            onMessage={onWebviewMessage}
          />
          {/* <TouchableOpacity
            style={styles.downloadButton}
            onPress={() => downloadFile(test_image_URL)}>
            <Text>Download this test Image</Text>
          </TouchableOpacity> */}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  downloadButton: {
    marginTop: 40,
    paddingHorizontal: 40,
    paddingVertical: 20,
    borderRadius: 3,
    borderWidth: 2,
    backgroundColor: 'beige',
  },
});

export default App;
