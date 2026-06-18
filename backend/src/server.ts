import express from 'express'
import cors from 'cors'
import 'dotenv/config'

const app = express()

app.use(cors())
app.use(express.json())

app.get('/health', (req, res) => {
  res.json({ status: 'ok', project: 'FisioGest API' })
})

const PORT = process.env.PORT || 3333

app.listen(PORT, () => {
  console.log(`🚀 FisioGest API rodando em http://localhost:${PORT}`)
})
