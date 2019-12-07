export type Config = {
    backendAddr: string
    storageBucket: string
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

const DEV_CONFIG: Config = {
    backendAddr: 'http://localhost:3000',
    storageBucket: 'pictophone-app-drawings',
}

const PROD_CONFIG: Config = {
    backendAddr: 'https://api.pictophone.app',
    storageBucket: 'pictophone-app-drawings',
}

const QA_CONFIG: Config = {
    backendAddr: 'https://api.pictophone.app',
    storageBucket: 'pictophone-app-drawings',
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
