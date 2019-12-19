export type Config = {
    backendAddr: string
    firebase: FirebaseConfig
}

type FirebaseConfig = {
    apiKey: string
    authDomain: string
    databaseURL: string
    projectId: string
    storageBucket: string
    messagingSenderId: string
    appId: string
    measurementId?: string
}

type Environment = 'production' | 'qa' | 'test' | 'development'

export function getEnvironment(): Environment {
    switch (process.env.NODE_ENV) {
        case 'development':
        case 'test':
            return process.env.NODE_ENV
        case 'production':
            switch (process.env.REACT_APP_ENV) {
                case 'production':
                case 'qa':
                    return process.env.REACT_APP_ENV
                default:
                    throw new Error('undefined REACT_APP_ENV: ' + process.env.REACT_APP_ENV)
            }
    }
}

const PROD_FB: FirebaseConfig = {
    apiKey: "AIzaSyCzMg7Q2ByK5UxUd_x730LT8TmOmbA61MU",
    authDomain: "pictophone-app.firebaseapp.com",
    databaseURL: "https://pictophone-app.firebaseio.com",
    projectId: "pictophone-app",
    storageBucket: 'pictophone-app-drawings',
    messagingSenderId: "837882351009",
    appId: "1:837882351009:web:9056a6b26d58fb373ecfe0"
}

const DEV_FB: FirebaseConfig = {
    apiKey: "AIzaSyBR4MaJ6AA73bHwu8U4tCMWDzLvWZZHa_U",
    authDomain: "pictophone-dev.firebaseapp.com",
    databaseURL: "https://pictophone-dev.firebaseio.com",
    projectId: "pictophone-dev",
    storageBucket: "pictophone-dev-drawings",
    messagingSenderId: "601565992263",
    appId: "1:601565992263:web:8b31e4b572140138f86862",
    measurementId: "G-M5NXB21QCN"
}


const DEV_CONFIG: Config = {
    backendAddr: 'http://localhost:3000',
    firebase: DEV_FB,
}

const PROD_CONFIG: Config = {
    backendAddr: 'https://api.pictophone.app',
    firebase: PROD_FB,
}

const QA_CONFIG: Config = {
    backendAddr: 'https://pictophone-be-3u2pedngkq-ue.a.run.app',
    firebase: DEV_FB,
}

export default function Config(): Config {
    switch (getEnvironment()) {
        case 'development':
            return DEV_CONFIG
        case 'production':
            return PROD_CONFIG
        case 'qa':
            return QA_CONFIG
        default:
            throw new Error('unsupported')
    }
}
