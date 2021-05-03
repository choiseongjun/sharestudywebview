import React,{useRef,useEffect,useState} from "react";
import { BackHandler,SafeAreaView,View } from "react-native";
import { WebView } from "react-native-webview";


const App = () => {
  const [exitApp,SETexitApp]=useState(false);
  const [RefreshY,setRefreshY] = useState(false);


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
  return (
    <SafeAreaView style={{ flex: 1,zIndex:0,backgroundColor:'transparent'}}>
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
          document.querySelector('.FeedContent').addEventListener('touchmove', function() {
            ReactNativeWebView.postMessage(JSON.stringify(window.scrollY))
          })
          })();
          true;   
        "
        onMessage={event => {
          console.log(event)
          console.log("event.nativeEvent.data==@",event.nativeEvent.data)
         
          if(event.nativeEvent.url===baseUrl){
            setRefreshY(event.nativeEvent.data)
          
          }else{
            setRefreshY(9999);//다른위치에선 스크롤 안되게하기위해 임시로 9999값 줌
          
          }
          }}
      />
    </SafeAreaView>
  )
}

export default App
