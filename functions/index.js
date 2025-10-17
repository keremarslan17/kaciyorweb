
const functions = require("firebase-functions");
const admin = require("firebase-admin");

admin.initializeApp();
const db = admin.firestore();

/**
 * Sets a custom role for a user.
 * Must be called by an admin.
 */
exports.setUserRole = functions.https.onCall(async (data, context) => {
    // 1. Authentication & Admin Check - CORRECTED LOGIC
    if (!context.auth || context.auth.token.role !== 'admin') {
         throw new functions.https.HttpsError("permission-denied", "Only admins can set user roles.");
    }
    
    const { userId, newRole } = data;
    
    // 2. Input Validation
    const validRoles = ['admin', 'businessOwner', 'waiter', 'customer'];
    if (!userId || !newRole || !validRoles.includes(newRole)) {
        throw new functions.https.HttpsError("invalid-argument", "Request is missing required 'userId' or 'newRole' parameters.");
    }

    try {
        // 3. Set Custom Claim in Auth
        await admin.auth().setCustomUserClaims(userId, { role: newRole });
        
        // 4. Update Role in Firestore
        await db.collection("users").doc(userId).update({ role: newRole });
        
        return { success: true, message: `User ${userId} role updated to ${newRole}.` };

    } catch (error) {
        console.error("Error setting user role:", error);
        throw new functions.https.HttpsError("internal", "Failed to update user role.", error.message);
    }
});

/**
 * Creates a new restaurant and a business owner user for that restaurant.
 * This function must be called by an authenticated admin user.
 */
exports.createRestaurantAndOwner = functions.https.onCall(async (data, context) => {
    // 1. Authentication & Role Check - CORRECTED LOGIC
    if (!context.auth || context.auth.token.role !== 'admin') {
        throw new functions.https.HttpsError("permission-denied", "Only admins can execute this action.");
    }

    // 2. Input Validation
    const { 
        restaurantName, address, cuisine, latitude, longitude,
        ownerName, ownerEmail, ownerPassword 
    } = data;

    if (!restaurantName || !address || !ownerName || !ownerEmail || !ownerPassword || !latitude || !longitude) {
        throw new functions.https.HttpsError("invalid-argument", "Missing required fields for restaurant and owner creation.");
    }

    let ownerRecord;
    try {
        // 3. Create Business Owner User in Firebase Auth
        ownerRecord = await admin.auth().createUser({
            email: ownerEmail,
            password: ownerPassword,
            displayName: ownerName,
        });

        // 4. Set Custom Claim for the new owner
        await admin.auth().setCustomUserClaims(ownerRecord.uid, { role: "businessOwner" });

        // 5. Create Restaurant Document in Firestore
        const restaurantRef = await db.collection("restaurants").add({
            name: restaurantName,
            address: address,
            cuisine: cuisine,
            location: new admin.firestore.GeoPoint(parseFloat(latitude), parseFloat(longitude)),
            ownerId: ownerRecord.uid,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        // 6. Create User Document for the owner in Firestore
        await db.collection("users").doc(ownerRecord.uid).set({
            name: ownerName,
            email: ownerEmail,
            role: "businessOwner",
            restaurantId: restaurantRef.id,
            restaurantName: restaurantName,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
        });
        
        return { success: true, restaurantId: restaurantRef.id, ownerId: ownerRecord.uid };

    } catch (error) {
        console.error("Error creating restaurant and owner:", error);
        if (ownerRecord) {
            await admin.auth().deleteUser(ownerRecord.uid);
        }
        throw new functions.https.HttpsError("internal", "An error occurred during creation.", error.message);
    }
});

/**
 * Creates a new waiter user.
 * This function must be called by an authenticated business owner.
 */
exports.createWaiter = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError("unauthenticated", "The function must be called while authenticated.");
  }

  const userDoc = await db.collection("users").doc(context.auth.uid).get();
  const userData = userDoc.data();
  
  if (userData.role !== "businessOwner" || !userData.restaurantId) {
    throw new functions.https.HttpsError("permission-denied", "Only business owners can create waiters.");
  }

  const { email, password, displayName } = data;
  const restaurantId = userData.restaurantId;

  if (!email || !password || !displayName) {
    throw new functions.https.HttpsError("invalid-argument", "Missing required fields: email, password, displayName.");
  }

  try {
    const userRecord = await admin.auth().createUser({
      email: email,
      password: password,
      displayName: displayName,
    });

    await db.collection("users").doc(userRecord.uid).set({
      name: displayName,
      email: email,
      role: "waiter",
      restaurantId: restaurantId,
      ownerId: context.auth.uid,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    await admin.auth().setCustomUserClaims(userRecord.uid, { role: "waiter" });

    return { success: true, message: `Waiter ${displayName} created successfully!`, uid: userRecord.uid };
  } catch (error) {
    console.error("Error creating waiter:", error);
    if (error.code && error.uid) {
        await admin.auth().deleteUser(error.uid);
    }
    throw new functions.https.HttpsError("internal", "An error occurred while creating the waiter.", error.message);
  }
});
