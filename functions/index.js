
const functions = require("firebase-functions");
const admin = require("firebase-admin");

admin.initializeApp();
const db = admin.firestore();

/**
 * Updates user balances after a new order is created.
 * This function is triggered when a new document is written to the /orders collection.
 */
exports.updateUserBalanceOnOrder = functions.firestore
    .document('orders/{orderId}')
    .onCreate(async (snap, context) => {
        const orderData = snap.data();
        const { userId, restaurantId, totalPrice, balanceUsed = 0 } = orderData;

        if (!userId || !restaurantId || totalPrice == null) {
            console.error("Order is missing critical data (userId, restaurantId, totalPrice):", orderData);
            return null;
        }

        const restaurantRef = db.collection('restaurants').doc(restaurantId);
        const userBalanceRef = db.collection('userBalances').doc(`${userId}_${restaurantId}`);

        try {
            await db.runTransaction(async (transaction) => {
                // 1. Get restaurant's loyalty percentage
                const restaurantDoc = await transaction.get(restaurantRef);
                if (!restaurantDoc.exists) {
                    throw new Error(`Restaurant with ID ${restaurantId} not found.`);
                }
                const loyaltyPercentage = restaurantDoc.data().loyaltyPercentage || 0;

                // 2. Get user's current balance
                const userBalanceDoc = await transaction.get(userBalanceRef);
                let currentBalance = 0;
                if (userBalanceDoc.exists) {
                    currentBalance = userBalanceDoc.data().balance;
                }

                // 3. Calculate new balance
                const balanceEarned = totalPrice * (loyaltyPercentage / 100);
                // The new balance is the current balance, minus any balance used in this order, plus any new balance earned.
                const newBalance = currentBalance - balanceUsed + balanceEarned;

                // 4. Update the user's balance
                transaction.set(userBalanceRef, {
                    userId,
                    restaurantId,
                    balance: newBalance,
                    restaurantName: restaurantDoc.data().name, // Store for easy display
                    lastUpdated: admin.firestore.FieldValue.serverTimestamp()
                }, { merge: true });

                // 5. (Optional) Update the order with the balance that was earned
                transaction.update(snap.ref, { balanceEarned });
            });

            console.log(`Successfully updated balance for user ${userId} at restaurant ${restaurantId}.`);
            return null;
        } catch (error) {
            console.error(`Error in updateUserBalanceOnOrder transaction for order ${context.params.orderId}:`, error);
            // The transaction will automatically be rolled back on error.
            return null;
        }
    });

/**
 * Sends a password reset email to a given user's email address.
 * Must be called by a businessOwner.
 */
exports.sendPasswordResetEmail = functions.https.onCall(async (data, context) => {
    // ... existing code ...
});

/**
 * Sets a custom role for a user.
 * Must be called by an admin.
 */
exports.setUserRole = functions.https.onCall(async (data, context) => {
    // ... existing code ...
});

/**
 * Creates a new restaurant and a business owner user for that restaurant.
 * This function must be called by an authenticated admin user.
 */
exports.createRestaurantAndOwner = functions.https.onCall(async (data, context) => {
    // ... existing code ...
});

/**
 * Creates a new waiter user.
 * This function must be called by an authenticated business owner.
 */
exports.createWaiter = functions.https.onCall(async (data, context) => {
  // ... existing code ...
});
