import { View, Text, StyleSheet, Platform, StatusBar, SafeAreaView, Linking, TouchableHighlight } from 'react-native'
import React from 'react'
import { ThemedText } from '@/components/ThemedText'
import { 
  Camera, 
  useCameraDevice, 
  useCameraPermission, 
  TakePhotoOptions 
} from 'react-native-vision-camera'
import { Href, Redirect, useRouter } from 'expo-router'
import ObscuraButton from '@/components/ObscuraButton'
import { BlurView } from 'expo-blur'
import { FontAwesome5 } from '@expo/vector-icons'
import ZoomControls from '@/components/ZoomControls'
import ExposureControls from '@/components/ExposureControls'

const HomeScreen = () => {
  const {hasPermission} = useCameraPermission()
  const microphonePermission = Camera.getMicrophonePermissionStatus()
  const redirectToPermissions = !hasPermission || microphonePermission === 'not-determined'
  const [showZoomControls, setShowZoomControls] = React.useState(false);
  const [showExposureControls, setShowExposureControls] = React.useState(false);

  const [cameraPosition, setCameraPosition] = React.useState<"front" | "back">(
    "back"
  );

  const camera = React.useRef<Camera>(null);
  const device = useCameraDevice(cameraPosition)
  const router = useRouter()

  const [zoom, setZoom] = React.useState(device?.neutralZoom);
  const [exposure, setExposure] = React.useState(0);
  const [flash, setFlash] = React.useState<"off" | "on">("off");
  const [torch, setTorch] = React.useState<"off" | "on">("off");

  const takePicture = async () => {
    try {
      if(camera.current == null) throw new Error("Camera ref is null")

        console.log("Taking picture...")
        const photo = await camera.current.takePhoto({
          flash: flash,
          enableShutterSound: true,
        })

        // const video = camera.current.startRecording({
        //   onRecordingFinished: (video) => {console.log(video)},
        //   onRecordingError: (error) => {console.log(error)}
        // })

        router.push({
          pathname: '/media',
          params: {media: photo.path, type: 'photo'}
        })
    } catch (e) {
      console.log(e);
    }
  }

  if(redirectToPermissions) return <Redirect href={'/permissions' as Href} />
  if(!device) return <></>
  
  return (
    <>
      <SafeAreaView style={styles.container}>
        {/* CameraView */}
        <View style={{flex:3, borderRadius: 10, overflow: "hidden", backgroundColor: "black"}}>
          <Camera 
            ref={camera}
            style={{flex: 1}} 
            device={device} 
            isActive
            zoom={zoom}
            resizeMode='cover'
            exposure={exposure}
            torch={torch}
            video
            photo
          />
          <BlurView
            intensity={100}
            tint="systemThinMaterialDark"
            style={{
              flex: 1,
              position: "absolute",
              bottom: 0,
              right: 0,
              padding: 10,
            }}
            experimentalBlurMethod="dimezisBlurView"
          >
            <ThemedText
              style={{
                color: "white",
              }}
            >
              Exposure: {exposure} | Zoom: x{zoom}
            </ThemedText>
          </BlurView>
        </View>

        {showZoomControls ? (
          <ZoomControls
            setZoom={setZoom}
            setShowZoomControls={setShowZoomControls}
            zoom={zoom ?? 1}
          />
        ): showExposureControls ? (
          <ExposureControls
            setExposure={setExposure}
            setShowExposureControls={setShowExposureControls}
            exposure={exposure}
          />
        ) : (

        <View style={{flex: 1, backgroundColor: "black"}}>
          {/* <View style={{flex: 0.7}}>
            <ThemedText>Max FPS: {device.formats[0].maxFps}</ThemedText>
            <ThemedText>Width: {device.formats[0].photoWidth} Height: {device.formats[0].photoHeight}</ThemedText>
            <ThemedText>Camera: {device.name}</ThemedText>
          </View> */}

          <View style={{flex: 0.7, flexDirection: "row",justifyContent: "space-evenly",}}>
            <ObscuraButton
                iconName={torch === "on" ? "flashlight" : "flashlight-outline"}
                onPress={() => setTorch((t) => (t === "off" ? "on" : "off"))}
                containerStyle={{ alignSelf: "center" }}
              />
            <ObscuraButton
              iconName={
                flash === "on" ? "flash-outline" : "flash-off-outline"
              }
              onPress={() => setFlash((f) => (f === "off" ? "on" : "off"))}
              containerStyle={{ alignSelf: "center" }}
            />
            <ObscuraButton
              iconName="camera-reverse-outline"
              onPress={() =>
                setCameraPosition((p) => (p === "back" ? "front" : "back"))
              }
              containerStyle={{ alignSelf: "center" }}
            />
            <ObscuraButton
              iconName="image-outline"
              onPress={() => {
                const link = Platform.select({
                  ios: "photos-redirect://",
                  android: "content://media/external/images/media",
                });
                Linking.openURL(link!);
              }}
              containerStyle={{ alignSelf: "center" }}
            />
            <ObscuraButton
              iconName="settings-outline"
              onPress={() => router.push("/_sitemap")}
              containerStyle={{ alignSelf: "center" }}
            />
          </View>
          <View style={{
              flex: 1.1, 
              flexDirection: "row",
              justifyContent: "space-evenly",
              alignItems: "center",
            }}>
              <ObscuraButton
                iconSize={40}
                title="+/-"
                onPress={() => setShowZoomControls((s) => !s)}
                containerStyle={{ alignSelf: "center" }}
              />

              <TouchableHighlight onPress={takePicture}>
                <FontAwesome5 name="dot-circle" size={55} color="white" />
              </TouchableHighlight>

              <ObscuraButton
                iconSize={40}
                title="1x"
                onPress={() => setShowExposureControls((s) => !s)}
                containerStyle={{ alignSelf: "center" }}
              />
          </View>
        </View>
        )}
      </SafeAreaView>
    </>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
    backgroundColor: "black",
  },
  stepContainer: {
    gap: 8,
    marginBottom: 8,
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: "absolute",
  },
});

export default HomeScreen