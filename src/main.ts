// import { createServer } from 'http';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import * as path from 'path';
import * as fs from 'fs';
import * as express from 'express';
import * as session from 'express-session';
import * as passport from 'passport';
import helmet from 'helmet';


// import * as rateLimit from 'express-rate-limit';
// import * as cors from 'cors';
// import { SwaggerModule } from '@nestjs/swagger/dist/swagger-module';
// import { DocumentBuilder } from '@nestjs/swagger/dist/document-builder';

// Import config
import keys from 'config/keys.config';

const figlet = require('figlet');
const bodyParser = require('body-parser');
const MongoDBStore = require('connect-mongodb-session')(session);

const corsOption = {
    credentials: true,
    origin: true,
    allowedHeaders:
        'Content-Type,X-Requested-With,Accept,Authorization,Access-Control-Allow-Origin,Access-Control-Allow-Credentials',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
};

const isProduction = process.env.NODE_ENV === 'production' ? true : false;

async function bootstrap() {
    const srcDir = 'src/';
    const sslDir = path.resolve(srcDir, `ssl/${isProduction ? 'prod' : 'dev'}`);
    const key = fs.readFileSync(`${sslDir}/localhost.key`);
    const cert = fs.readFileSync(`${sslDir}/localhost.crt`);
    const ca = fs.readFileSync(`${sslDir}/myCA.pem`);
    const app = await NestFactory.create<NestExpressApplication>(AppModule, {
        httpsOptions: { key, cert, ca },
    });
    app.use('/public', express.static(path.join(__dirname, '../../public')));
    app.use(bodyParser.json({ limit: '5mb' }));
    app.use(bodyParser.urlencoded({ limit: '5mb', extended: true }));
    // app.use(cors());
    app.enableCors(corsOption);
    app.setGlobalPrefix('api');
    /* SECURITY */
    const store = new MongoDBStore({
        uri: keys.MONGO.URI,
        collection: 'sessions',
        expires: keys.MONGO.EXPIRY,

        // Lets you set options passed to `MongoClient.connect()`. Useful for
        // configuring connectivity or working around deprecation warnings.
        connectionOptions: {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            serverSelectionTimeoutMS: 10000,
        },
    });

    store.on('error', function (error) {
        // Also get an error here
        console.log('Mongo connection error.', error);
    });

    app.use(
        session({
            name: '__session',
            secret: keys.SESSIONS.SECRET,
            resave: false,
            saveUninitialized: false,
            cookie: {
                maxAge: keys.SESSIONS.EXPIRY,
                sameSite: 'none',
                secure: true,
                httpOnly: true,
            },
            store: store,
        }),
    );
    app.use(passport.initialize());
    app.use(passport.session());
    app.enable('trust proxy');
    app.use(
        helmet({
            crossOriginResourcePolicy: false,
            crossOriginEmbedderPolicy: false,
            contentSecurityPolicy: isProduction ? undefined : false,
        }),
    );

    const host = '0.0.0.0';
    const port = keys.PORT;
    await app.listen(port, host);
}

figlet('Paymen', function (err, data) {
    if (err) {
        console.log('Something went wrong...');
        console.dir(err);
        return;
    }
    console.log(data);
});

bootstrap();
