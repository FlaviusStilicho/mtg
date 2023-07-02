import express from 'express'
import cors from 'cors'
import { routes } from "./routes.ts"
import * as Bluebird from 'bluebird';
import winston from 'winston';
import bodyParser from 'body-parser'

const consoleTransport = new winston.transports.Console()
const myWinstonOptions = {
    transports: [consoleTransport],
    level: 'debug'
}
export const logger = winston.createLogger(myWinstonOptions)

export interface DummyConstructor extends Bluebird<any> {
    new <T>(): Bluebird<T>;
    all: any;
    race: any;
}

declare global {
    interface Promise<T> extends Bluebird<T> { }

    interface PromiseConstructor extends DummyConstructor { }
}

const app = express()

app.use(express.json())
app.use(cors({
    origin: ["http://localhost:3000"]
}))
app.use(express.static('static'))
app.use(bodyParser.urlencoded({ extended: true }));

routes(app);

app.listen(8000, () => {
    logger.info('listening to port 8000')
})


