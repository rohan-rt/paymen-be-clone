require('dotenv').config();
const config = {
    WEB_URI: process.env.WEB_URI,
    PORT: process.env.PORT,
    ENV: process.env.ENV,
    API_KEY: process.env.API_KEY,
    MONGO: {
        URI: process.env.MONGO_URI,
        EXPIRY: 1000 * 60 * 60 * 12,
        DOWNLOAD: {
            TTL: parseInt(process.env.MONGO_DOWNLOADS_TTL_SECS), // EXPIRY
        },
    },
    CACHE: {
        TTL: parseInt(process.env.CACHE_DOWNLOAD_TTL_MINS) * 60 * 1000,
    },

    SALT: 10, // Salt rounds

    JWT: {
        SECRET: process.env.JWT_SECRET,
        EXPIRY: 60 * 60 * 12 + 60 * 3, // 12 hours + 3 minutes extra (in seconds)
    },

    SESSIONS: {
        SECRET: process.env.SESSIONS_SECRET,
        EXPIRY: 1000 * 60 * 60 * 12, // 12 hours (in miliseconds)
    },

    CURRENCY: {
        uri: process.env.EXCHANGERATES_URI,
        apikey: process.env.EXCHANGERATES_APIKEY,
        symbols: ['EUR', 'USD', 'GBP'],
        symbol: 'EUR',
    },

    SOCKET: {
        PORT: process.env.SOCKET_PORT,
        NAMESPACE: process.env.SOCKET_NAMESPACE,
        EMAIL_SERVER: process.env.EMAIL_SERVER_SOCKET,
        URI: process.env.SOCKET_URI,
    },

    TWOFA: {
        OTP_NAME: process.env.TWOFA_OTP_NAME,
    },

    B2: {
        keyName: process.env.B2_KEYNAME,
        S3Endpoint: process.env.B2_S3_ENDPOINT,
        applicationKey: process.env.B2_APPLICATION_KEY,
        keyID: process.env.B2_KEY_ID,
        backblazeUrl: process.env.B2_URL,
        downloadLimit: parseInt(process.env.B2_DOWNLOAD_LIMIT),
        bucketName: process.env.B2_BUCKET_NAME,
        usersFolder: process.env.B2_BUCKET_USERS_FOLDER,
        teamsFolder: process.env.B2_BUCKET_TEAMS_FOLDER,
        avatarName: 'avatar.jpg',
        logoName: 'logo.jpg',
        nativeUrl: process.env.B2_URL_NATIVE,
        friendlyUrl: '/file/' + process.env.B2_BUCKET_NAME + '/',
    },

    MAILCOW: {
        DOMAIN: process.env.MAILCOW_DOMAIN,
        NO_REPLY: process.env.NO_REPLY,
        HOST: process.env.MAILCOW_HOST,
        API_KEY: process.env.MAILCOW_API_KEY,
        MAILBOX_PASSWORD: process.env.MAILCOW_MAILBOX_PASSWORD,
    },

    LINKEDIN: {
        clientId: process.env.LINKEDIN_CLIENT_ID,
        clientSecret: process.env.LINKEDIN_CLIENT_SECRET,
        redirectUrl: process.env.LINKEDIN_REDIRECT_URL,
    },

    STRIPE: {
        PRIVATE_KEY: process.env.STRIPE_PRIVATE_KEY,
    },

    EMAIL_SERVER: {
        URL: process.env.EMAIL_SERVER_URL,
        API_KEY: process.env.EMAIL_SERVER_API_KEY,
    },

    REDIS: {
        HOST: process.env.REDIS_HOST,
        PORT: parseInt(process.env.REDIS_PORT),
        PASSWORD: process.env.REDIS_PASSWORD,
        TTL: parseInt(process.env.REDIS_TTL_HOURS),
    },
};
export default config;
