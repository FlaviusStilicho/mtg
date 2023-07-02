import { DataSource } from 'typeorm'
import { logger } from "./index.ts"

export const DB = new DataSource({
    type: "mysql",
    host: "localhost",
    port: 3306,
    username: "root",
    password: "password",
    database: "mtg",
    entities: ["src/entity/*"],
    logging: true,
    synchronize: true
});

DB.initialize()
    .then(() => {
        logger.info("Data Source has been initialized!")
    })
    .catch((err) => {
        logger.error("Error during Data Source initialization", err)
    })

