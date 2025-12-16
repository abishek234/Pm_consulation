// scripts/generateVapidKeys.js
const webpush = require('web-push');

// Generate VAPID keys for web push notifications
const vapidKeys = webpush.generateVAPIDKeys();

console.log('🔑 VAPID Keys Generated Successfully!');
console.log('==========================================');
console.log('📋 Add these to your .env file:');
console.log('==========================================');
console.log(`VAPID_PUBLIC_KEY=${vapidKeys.publicKey}`);
console.log(`VAPID_PRIVATE_KEY=${vapidKeys.privateKey}`);
console.log('==========================================');
console.log('💡 The public key will also be used in your frontend for service worker registration.');
console.log('🔒 Keep the private key secure and never expose it in client-side code.');

// Also save to a file for reference
const fs = require('fs');
const keyData = `# VAPID Keys generated on ${new Date().toISOString()}
VAPID_PUBLIC_KEY=${vapidKeys.publicKey}
VAPID_PRIVATE_KEY=${vapidKeys.privateKey}
`;

fs.writeFileSync('vapid-keys.txt', keyData);
console.log('💾 Keys also saved to vapid-keys.txt file');

module.exports = vapidKeys;