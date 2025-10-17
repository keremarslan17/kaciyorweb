
import admin from 'firebase-admin';

// Initialize Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.applicationDefault(),
});

const auth = admin.auth();
const db = admin.firestore();

const ownerUsername = 'denizisletme';
const ownerPassword = 'sifre123';
const ownerEmail = `${ownerUsername}@kaciyorortak.owner`;
const restaurantIdToAssign = 'XGAaVEsaGm0QYVLpVIOC'; // Deniz Restoran's ID

async function createOwner() {
  try {
    // Check if user already exists
    try {
      await auth.getUserByEmail(ownerEmail);
      console.log(`User ${ownerUsername} already exists. Skipping creation.`);
      return;
    } catch (error) {
      // User does not exist, proceed to create
    }

    // 1. Create user in Firebase Authentication
    const userRecord = await auth.createUser({
      email: ownerEmail,
      password: ownerPassword,
      displayName: 'Deniz İşletme Sahibi',
    });
    console.log('Successfully created new owner in Auth:', userRecord.uid);

    // 2. Set custom claim to identify user as a business owner
    await auth.setCustomUserClaims(userRecord.uid, { role: 'businessOwner' });
    console.log('Successfully set custom claim.');

    // 3. Set user role and data in Firestore
    const userDocRef = db.collection('users').doc(userRecord.uid);
    await userDocRef.set({
      name: 'Deniz İşletme Sahibi',
      email: ownerEmail,
      role: 'businessOwner',
      restaurantId: restaurantIdToAssign, // Link the owner to their restaurant
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    console.log(`Successfully created user document for ${ownerUsername}.`);

  } catch (error) {
    console.error('Error creating new owner:', error);
  }
}

createOwner();
