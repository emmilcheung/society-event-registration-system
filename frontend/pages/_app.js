import '../styles/globals.css'
import '../styles/header.css'
import '../styles/event.css'
import '../styles/profile.css'
import '../styles/association.css'
import '../styles/create.css'
import '../styles/index.css'
import '../styles/notification.css'
import '../styles/survey.css'
import '../styles/recommendation.css'

import { AuthProvider } from '../components/authProvider';
import { NotificationProvider } from '../components/NotificationProvider';
import Header from '../components/Header';
import { useEffect } from 'react';

function MyApp({ Component, pageProps }) {
  // useEffect(() => {
  //   if ("serviceWorker" in navigator) {
  //     window.addEventListener("load", function () {
  //       navigator.serviceWorker.register("/sw.js").then(
  //         function (registration) {
  //           console.log("Service Worker registration successful with scope: ", registration.scope);
  //         },
  //         function (err) {
  //           console.log("Service Worker registration failed: ", err);
  //         }
  //       );
  //     });
  //   }
  // }, []);
  return (
    <AuthProvider>
      <NotificationProvider>
      <Component {...pageProps} />
      </NotificationProvider>
    </AuthProvider>
  );
}

export default MyApp
