// self.addEventListener("install", (event) =>{
//     console.log("Hellow world from the Service Worker");
// })
importScripts('https://www.gstatic.com/firebasejs/8.3.1/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/8.3.1/firebase-messaging.js');

// Initialize the Firebase app in the service worker by passing in
// your app's Firebase config object.
// https://firebase.google.com/docs/web/setup#config-object
const firebaseConfig = {
    apiKey: "AIzaSyAd_ZZ7NesP84URwhde8MZeDvoCGyd7M7w",
    authDomain: "test-4b584.firebaseapp.com",
    databaseURL: "https://test-4b584.firebaseio.com",
    projectId: "test-4b584",
    storageBucket: "test-4b584.appspot.com",
    messagingSenderId: "133524163100",
    appId: "1:133524163100:web:db9522414e6bf14f9fadd9",
    measurementId: "G-VNF733DQM9"
};
if (!firebase.apps.length) {
    console.log("sw.js");
    firebase.initializeApp(firebaseConfig);

    // Retrieve an instance of Firebase Messaging so that it can handle background
    // messages.
    const messaging = firebase.messaging();
    messaging.onBackgroundMessage((payload) => {
        console.log("onBackground", payload);
        const title = payload.notification.title;
        const options = {
            body: payload.data.status
        };
        // return self.registration.showNotification(title, options);
    })
}

