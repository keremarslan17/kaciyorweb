
const functions = require("firebase-functions");
const admin = require("firebase-admin");

admin.initializeApp();

const db = admin.firestore();

/**
 * Creates a new waiter user.
 * This function must be called by an authenticated business owner.
 */
exports.createWaiter = functions.https.onCall(async (data, context) => {
  // 1. Authentication Check: Ensure the user is authenticated.
  if (!context.auth) {
    throw new functions.https.HttpsError(
        "unauthenticated",
        "The function must be called while authenticated.",
    );
  }

  // 2. Role Check: Ensure the user is a business owner.
  const userDoc = await db.collection("users").doc(context.auth.uid).get();
  const userData = userDoc.data();
  
  if (userData.role !== "businessOwner" || !userData.restaurantId) {
    throw new functions.https.HttpsError(
        "permission-denied",
        "Only business owners can create waiters.",
    );
  }

  const { username, password, displayName } = data;
  const restaurantId = userData.restaurantId;

  // 3. Input Validation
  if (!username || !password || !displayName) {
    throw new functions.https.HttpsError(
        "invalid-argument",
        "Missing required fields: username, password, displayName.",
    );
  }

  const waiterEmail = `${username.toLowerCase()}@${restaurantId}.waiter`;

  try {
    // 4. Create User in Firebase Auth
    const userRecord = await admin.auth().createUser({
      email: waiterEmail,
      password: password,
      displayName: displayName,
    });

    // 5. Create User Document in Firestore
    await db.collection("users").doc(userRecord.uid).set({
      name: displayName,
      email: waiterEmail,
      role: "waiter",
      restaurantId: restaurantId,
      ownerId: context.auth.uid, // Link to the owner who created them
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    // 6. Set Custom Claim for Role-Based Access
    await admin.auth().setCustomUserClaims(userRecord.uid, { role: "waiter" });

    return {
      success: true,
      message: `Waiter ${displayName} created successfully!`,
      uid: userRecord.uid,
    };
  } catch (error) {
    console.error("Error creating waiter:", error);
    // Clean up if user was created in Auth but Firestore failed
    if (error.code && error.uid) {
        await admin.auth().deleteUser(error.uid);
    }
    throw new functions.https.HttpsError(
        "internal",
        "An error occurred while creating the waiter.",
        error.message,
    );
  }
});

// We will add deleteWaiter function later.
