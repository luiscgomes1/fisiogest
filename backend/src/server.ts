import express from 'express'
import cors from 'cors'
import 'dotenv/config'

import authRoutes from './routes/auth.routes'
import profissionalRoutes from './routes/profissional.routes'
import pacienteRoutes from './routes/paciente.routes'
import agendaRoutes from './routes/agenda.routes'

const app = express()

app.use(cors())
app.use(express.json())

app.get('/health', (req, res) => {
  res.json({ status: 'ok', project: 'FisioGest API' })
})

app.use('/auth', authRoutes)
app.use('/profissional', profissionalRoutes)
app.use('/pacientes', pacienteRoutes)
app.use('/agenda', agendaRoutes)

const PORT = process.env.PORT || 3333

app.listen(PORT, () => {
  console.log(`🚀 FisioGest API rodando em http://localhost:${PORT}`)
})
