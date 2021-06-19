import React,{useRef,useEffect,useState} from "react";
import { BackHandler,SafeAreaView,View,ScrollView,RefreshControl,Alert,Text } from "react-native";
import { WebView } from "react-native-webview";
import messaging from '@react-native-firebase/messaging';
import Cookie from 'react-native-cookie';
import axios from 'axios';

const wait = (timeout) => {
  return new Promise(resolve => setTimeout(resolve, timeout));
}


const App = () => {
  const [exitApp,SETexitApp]=useState(false);
  const [refreshY,setRefreshY] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [token,setToken] = useState("");
  const [url,setUrl] = useState("");
  const [userId,setUserId] = useState("");
  const [userIdCheck,setUserIdCheck] = useState(false);


  let baseUrl = "http://192.168.0.113:3000/"
  let serverBaseUrl = "http://192.168.0.113:9090/";
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
  async function requestUserPermission() {
    const authStatus = await messaging().requestPermission();
    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;
  
    if (enabled) {
      // console.log('Authorization status:', authStatus);
    }
  }
  const onAndroidBackPress = () => {
    if (webview.current) {
      webview.current.goBack();
      return true; // prevent default behavior (exit app)
    }
    return false;
  };


  useEffect(() => {
    const unsubscribe = messaging().onMessage(async remoteMessage => {
      //Alert.alert('A new FCM message arrived!', JSON.stringify(remoteMessage));
      //Alert.alert(JSON.stringify(remoteMessage.notification))
      
      //console.log(remoteMessage.notification);
    });

    return unsubscribe;
  }, []);

  useEffect(()=>{
    requestUserPermission();
    
     let msgToken = messaging().getToken()
      msgToken.then((item)=>{
        setToken(item)
      })

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

  useEffect(() => {
    // Cookie.set(baseUrl+"Login", 'FCM_TOKEN', token).then((res) => {
      
        // axios.get("http://3.35.255.192:9090/api/auth/device/token",
        // {
        //   params: {
        //     token: token
        //   }
      
        // }
        // )
        // .then((res)=>{
        //   console.log('res==',res)
        // })
        
      
    // }
    // );

    if(userIdCheck){
      axios.get(serverBaseUrl+"api/auth/set/token",
      {
        params: {
          token: token,
          userId:userId
        }
      }
      )
      .then((res)=>{
        setUserIdCheck(false)
      })
      .catch((e)=>{
        setUserIdCheck(false)
      })
      
    }

    
  },[userIdCheck])

  

  const _onNavigationStateChange = (event) =>{
    setUrl(event.url)
    
  }
  function IsJsonString(str) {
      try {
          JSON.parse(str);
      } catch (e) {
          return false;
      }
      return true;
  }
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
          
          onNavigationStateChange={(event)=>_onNavigationStateChange(event)}

          injectedJavaScript={INJECTED_JAVASCRIPT}
          onMessage={(event)=> {
           
              //const res = JSON.parse(event.nativeEvent.data);
              console.log(event.nativeEvent.data)
              if(IsJsonString(event.nativeEvent.data)){
                const res = JSON.parse(event.nativeEvent.data);
                const resKey=  Object.keys(res)
                if(resKey=="userid"){
    
                  const resValue = Object.values(res);
                  const userId = resValue[0]
                  
                  setUserId(userId);
                  setUserIdCheck(true);
                } 
              }
             
            
           
          }}

        />
      </ScrollView>
     
    </SafeAreaView>
  )
}
const INJECTED_JAVASCRIPT = `(function() {
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
  document.querySelector('.main_container').addEventListener('touchmove', function() {
    ReactNativeWebView.postMessage(JSON.stringify(window.scrollY))
  })

  
  
  })();
  true; 
  `;



export default App
// 
// 
// `

// function sayHi(who, phrase) {
//   ReactNativeWebView.postMessage(JSON.stringify(window.document.querySelector(#userid)))
// }

// setTimeout(sayHi, 1000)
    
    
// `;