import cors from "cors"
import * as dotevnv from "dotenv"
import express from "express"
import helmet from "helmet"
import { cardRouter } from "./cards/cards.routes"

dotevnv.config()

if (!process.env.PORT) {
    console.log(`No port value specified...`)
}

const PORT = parseInt(process.env.PORT as string, 10)

const app = express()

app.use(express.json())
app.use(express.urlencoded({extended : true}))
app.use(cors())
app.use(helmet())

app.use('/', cardRouter)

app.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`)
})