const admin = require('firebase-admin');
import serviceAccount from "./serviceKey.json";

export const verifyIdToken = async (token) => {
    if (!admin.apps.length) {
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
            databaseURL: "https://test-4b584.firebaseio.com"
        });

    }

    return admin.auth().verifyIdToken(token).catch(err => { throw err });
}

