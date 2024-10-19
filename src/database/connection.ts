import { Sequelize } from "sequelize-typescript";
import { envConfig } from "../config/config";

const sequelize = new Sequelize(envConfig.connectionString as string, {
    models: [__dirname + '/models']
})

try {
    sequelize.authenticate()
        .then(() => {
            console.log("Authentication successfull.😊")
        })
        .catch(err => {
            console.log("Error occured 🙁🙁", err)
        })
} catch (error) {
    console.log(error)
}

sequelize.sync({ force: false }).then(() => {
    console.log("Changes added to database. 👍👍")
})

export default sequelize