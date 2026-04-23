const admin = require('firebase-admin');
require('dotenv').config();

function buildServiceAccount() {
  if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
    try {
      return JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
    } catch (err) {
      throw new Error('Failed to parse FIREBASE_SERVICE_ACCOUNT_KEY as JSON: ' + err.message);
    }
  }

  const { FIREBASE_PROJECT_ID, FIREBASE_PRIVATE_KEY, FIREBASE_CLIENT_EMAIL } = process.env;

  if (!FIREBASE_PROJECT_ID || !FIREBASE_PRIVATE_KEY || !FIREBASE_CLIENT_EMAIL) {
    throw new Error(
      'Firebase credentials are not configured. Set either FIREBASE_SERVICE_ACCOUNT_KEY ' +
      'or FIREBASE_PROJECT_ID, FIREBASE_PRIVATE_KEY, and FIREBASE_CLIENT_EMAIL environment variables.'
    );
  }

  return {
    type: 'service_account',
    project_id: FIREBASE_PROJECT_ID,
    // Cloud providers escape newlines as \n in env vars — restore them here
    private_key: FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    client_email: FIREBASE_CLIENT_EMAIL,
  };
}

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(buildServiceAccount()),
  });
}

module.exports = admin;
