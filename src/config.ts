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

const TEST_FB: FirebaseConfig = {
    apiKey: "AIzaSyAGXRsAOC3bHfWzbf-Xe6LMEFSu8996yOA",
    authDomain: "pictophone-test.firebaseapp.com",
    databaseURL: "https://pictophone-test.firebaseio.com",
    projectId: "pictophone-test",
    storageBucket: "pictophone-test.appspot.com",
    messagingSenderId: "794693152973",
    appId: "1:794693152973:web:0e0e7c89d77aa30b073984",
    measurementId: "G-TL1FE9GRD6"
};

const TEST_CONFIG: Config = {
    backendAddr: 'http://localhost:3111',
    firebase: TEST_FB,
}

const PROD_CONFIG: Config = {
    backendAddr: 'https://api.pictophone.app',
    firebase: PROD_FB,
}

const QA_CONFIG: Config = {
    backendAddr: 'https://pictophone-be-t2flyr2hcq-ue.a.run.app',
    firebase: TEST_FB,
}

export default function Config(): Config {
    switch (getEnvironment()) {
        case 'development':
            return TEST_CONFIG
        case 'production':
            return PROD_CONFIG
        case 'qa':
            return QA_CONFIG
        default:
            throw new Error('unsupported')
    }
}
