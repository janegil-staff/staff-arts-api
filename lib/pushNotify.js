// lib/pushNotify.js
// Utility to send push notifications via Expo's push API
// No SDK needed — just a simple fetch to Expo's endpoint

const EXPO_PUSH_URL = "https://exp.host/--/api/v2/push/send";

/**
 * Send a push notification to one or more Expo push tokens
 *
 * @param {Object} opts
 * @param {string[]} opts.tokens - Array of Expo push tokens
 * @param {string} opts.title - Notification title
 * @param {string} opts.body - Notification body text
 * @param {Object} [opts.data] - Custom data payload (for navigation on tap)
 * @param {string} [opts.sound] - Sound ("default" or null)
 * @param {number} [opts.badge] - Badge count
 */
export async function sendPushNotification({
  tokens,
  title,
  body,
  data,
  sound,
  badge,
}) {
  if (!tokens || tokens.length === 0) return;

  // Filter to valid Expo push tokens only
  var validTokens = tokens.filter(function (t) {
    return t && t.startsWith("ExponentPushToken[");
  });

  if (validTokens.length === 0) return;

  var messages = validTokens.map(function (token) {
    return {
      to: token,
      title: title,
      body: body,
      data: data || {},
      sound: sound || "default",
      badge: badge !== undefined ? badge : undefined,
    };
  });

  try {
    var res = await fetch(EXPO_PUSH_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(messages),
    });

    var result = await res.json();

    // Log any errors for debugging
    if (result.data) {
      result.data.forEach(function (receipt, i) {
        if (receipt.status === "error") {
          console.error(
            "[Push] Error sending to",
            validTokens[i],
            receipt.message,
          );
        }
      });
    }

    return result;
  } catch (err) {
    console.error("[Push] Send failed:", err.message);
    return null;
  }
}

/**
 * Send notification to a specific user by their userId
 * Looks up their push tokens and sends to all devices
 */
export async function notifyUser(userId, { title, body, data }) {
  // Import here to avoid circular dependencies
  const mongoose = await import("mongoose");
  const User = (await import("@/models/User")).default;

  try {
    const user = await User.findById(userId).select("pushTokens").lean();
    if (!user || !user.pushTokens || user.pushTokens.length === 0) return;

    await sendPushNotification({
      tokens: user.pushTokens,
      title: title,
      body: body,
      data: data,
    });
  } catch (err) {
    console.error("[Push] notifyUser failed:", err.message);
  }
}

/**
 * Send notification to multiple users
 */
export async function notifyUsers(userIds, { title, body, data }) {
  const mongoose = await import("mongoose");
  const User = (await import("@/models/User")).default;

  try {
    const users = await User.find({ _id: { $in: userIds } })
      .select("pushTokens")
      .lean();

    var allTokens = [];
    users.forEach(function (u) {
      if (u.pushTokens) {
        allTokens = allTokens.concat(u.pushTokens);
      }
    });

    if (allTokens.length > 0) {
      await sendPushNotification({
        tokens: allTokens,
        title: title,
        body: body,
        data: data,
      });
    }
  } catch (err) {
    console.error("[Push] notifyUsers failed:", err.message);
  }
}
