import React,{useRef,useEffect,useState} from "react";
import { BackHandler,SafeAreaView,View,ScrollView,RefreshControl } from "react-native";
import { WebView } from "react-native-webview";
import messaging from '@react-native-firebase/messaging';

const wait = (timeout) => {
  return new Promise(resolve => setTimeout(resolve, timeout));
}
const App = () => {
  const [exitApp,SETexitApp]=useState(false);
  const [refreshY,setRefreshY] = useState(false);
  const [refreshing, setRefreshing] = useState(false);


  let baseUrl = "http://3.36.73.41"
  const webview = useRef(null);

  const backAction = () => {
    if(exitApp==false){
        SETexitApp(true);
        // Toast.show({
        //   text2: '한번 더 뒤로가기 버튼을 누르면 종료됩니다.',
        //   topOffset: 640,
        //   visibilityTime: 500,
        // });
        onAndroidBackPress();
        
    }
    else if(exitApp==true){
        BackHandler.exitApp()
    }

    setTimeout(()=>{
        SETexitApp(false)
    }, 500);
    return true;
  };
  const onAndroidBackPress = () => {
    if (webview.current) {
      webview.current.goBack();
      return true; // prevent default behavior (exit app)
    }
    return false;
  };
  useEffect(() => {
    const unsubscribe = messaging().onMessage(async remoteMessage => {
      Alert.alert('A new FCM message arrived!', JSON.stringify(remoteMessage));
      console.log('new messgae')
    });

    return unsubscribe;
  }, []);

  useEffect(()=>{
    let result =  messaging().getToken()
    //result.then((i)=>console.log(i))
  },[])
  messaging().setBackgroundMessageHandler(async remoteMessage => {
    console.log('Message handled in the background!', remoteMessage);
  });
  useEffect(()=> {
    BackHandler.addEventListener('hardwareBackPress', onAndroidBackPress);
    return () => {
      BackHandler.removeEventListener('hardwareBackPress', onAndroidBackPress);
    };
  }, []); // Never re-run this effect

  useEffect(() =>
    {
        const backHandler = BackHandler.addEventListener(
            "hardwareBackPress",
            backAction
        );
        return () => backHandler.remove();
    },[exitApp]) 

  const onRefresh = React.useCallback(() => {
    
      setRefreshing(true);
      webview.current.reload();
      
      wait(1000).then(() => setRefreshing(false));
    
  }, [refreshY]); 
  return (
    <SafeAreaView style={{ flex: 1,zIndex:0,backgroundColor:'transparent'}}>
      <ScrollView
          contentContainerStyle={{ flex: 1,
            }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh} 
              enabled={refreshY==0?true:false}
            />
          }
        >
        <WebView
          source={{ uri: baseUrl }}
          ref={webview}
          injectedJavaScript="
            (function() {
            function wrap(fn) {
            return function wrapper() {
              var res = fn.apply(this, arguments);
              window.ReactNativeWebView.postMessage(window.location.href);
              return res;
            }
            }
            history.pushState = wrap(history.pushState);
            history.replaceState = wrap(history.replaceState);
            window.addEventListener('popstate', function() {
              window.ReactNativeWebView.postMessage(window.location.href);
            });
            document.querySelector('.main_container').addEventListener('touchmove', function() {
              ReactNativeWebView.postMessage(JSON.stringify(window.scrollY))
            })
            })();
            true;   
          "
          onMessage={event => {
            setRefreshY(event.nativeEvent.data)    
          
          
            }}
        />
      </ScrollView>
    </SafeAreaView>
  )
}

export default App
