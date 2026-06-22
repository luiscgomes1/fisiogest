import express from 'express'
import cors from 'cors'
import 'dotenv/config'

import authRoutes from './routes/auth.routes'
import profissionalRoutes from './routes/profissional.routes'
import pacienteRoutes from './routes/paciente.routes'
import agendaRoutes from './routes/agenda.routes'
import prontuarioRoutes from './routes/prontuario.routes'
import evolucaoRoutes from './routes/evolucao.routes'
import pacoteRoutes from './routes/pacote.routes'
import pacoteItemRoutes from './routes/pacoteItem.routes'

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
app.use('/pacientes/:id', prontuarioRoutes)
app.use('/evolucoes', evolucaoRoutes)
app.use('/pacientes/:id', pacoteRoutes)
app.use('/pacotes', pacoteItemRoutes)

const PORT = process.env.PORT || 3333

app.listen(PORT, () => {
  console.log(`🚀 FisioGest API rodando em http://localhost:${PORT}`)
})
