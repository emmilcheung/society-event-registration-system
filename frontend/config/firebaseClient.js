import firebase from 'firebase/app'
import firebaseConfig from './firebaseConfig'

// const firebaseConfig = ;
export default function firebaseClient() {
    if (!firebase.apps.length) {
        firebase.initializeApp(firebaseConfig);
    }
}