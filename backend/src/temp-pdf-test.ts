import PDFDocument from 'pdfkit'
import fs from 'fs'
import path from 'path'

const doc = new PDFDocument({ size: 'A4', margin: 50 })

const outputPath = path.join(__dirname, '..', 'laudo-preview.pdf')
doc.pipe(fs.createWriteStream(outputPath))

// ── CABEÇALHO ──────────────────────────────────────────────
// Espaço reservado para a logo (canto superior esquerdo)
// Quando o profissional tiver uma logo cadastrada, substituímos por:
// doc.image(logoPath, 50, 45, { width: 80 })
doc
  .rect(50, 45, 80, 50)
  .dash(3, { space: 3 })
  .stroke('#000000')

doc.undash() // Remove o dash para o restante do documento

doc
  .fontSize(8)
  .fillColor('#000000')
  .font('Helvetica')
  .text('LOGO', 50, 63, { width: 80, align: 'center' })



// Título e data alinhados ao centro, respeitando o espaço da logo
doc
  .fillColor('#000000')
  .fontSize(14)
  .font('Helvetica-Bold')
  .text('LAUDO FISIOTERAPÊUTICO', 140, 50, { width: 355, align: 'center' })

doc
  .fontSize(10)
  .font('Helvetica')
  .text('Rio de Janeiro, RJ — 23/06/2026', 140, 70, { width: 355, align: 'center' })

// Move o cursor para abaixo do cabeçalho antes de continuar
doc.moveTo(50, 105).lineTo(545, 105).stroke()
doc.y = 115
doc.x = 50

doc.moveDown(0.5)

// ── DADOS DO PACIENTE ───────────────────────────────────────
doc
  .fontSize(10)
  .font('Helvetica-Bold')
  .text('DADOS DO PACIENTE', { underline: true })

doc.moveDown(0.3)

doc.font('Helvetica').text('Paciente: Fátima Maria Santos')
doc.text('Data de nascimento: 12/08/1962')
doc.text('Diagnóstico médico: Artroscopia joelho esquerdo')
doc.text('Médico solicitante: Dr. Juarez de Aquino')
doc.text('Início do tratamento: 16/06/2026')
doc.text('Frequência: 3x semanais')

doc.moveDown(1)

// ── QUADRO CLÍNICO ──────────────────────────────────────────
doc.font('Helvetica-Bold').text('QUADRO CLÍNICO', { underline: true })
doc.moveDown(0.3)
doc.font('Helvetica').text(
  'Paciente admitida para atendimento fisioterapêutico com diagnóstico médico de ' +
  'Artroscopia de joelho esquerdo, realizando fisioterapia 3x semanais, sendo ' +
  'submetida a avaliação física e funcional.',
  { align: 'justify' }
)

doc.moveDown(1)

// ── ACHADOS AO EXAME FÍSICO ─────────────────────────────────
doc.font('Helvetica-Bold').text('ACHADOS AO EXAME FÍSICO', { underline: true })
doc.moveDown(0.3)
doc.font('Helvetica').text(
  'Dor à palpação em compartimento medial, limitação de amplitude de flexão do ' +
  'joelho esquerdo. Presença de edema leve periarticular.',
  { align: 'justify' }
)

doc.moveDown(1)

// ── DIAGNÓSTICO FUNCIONAL ───────────────────────────────────
doc.font('Helvetica-Bold').text('DIAGNÓSTICO FUNCIONAL', { underline: true })
doc.moveDown(0.3)
doc.font('Helvetica').text(
  'Disfunção femoropatelar pós-cirúrgica com limitação funcional para atividades ' +
  'de vida diária, deambulação e subida/descida de escadas.',
  { align: 'justify' }
)

doc.moveDown(1)

// ── CONCLUSÃO ───────────────────────────────────────────────
doc.font('Helvetica-Bold').text('CONCLUSÃO', { underline: true })
doc.moveDown(0.3)
doc.font('Helvetica').text(
  'Diante do exposto, a paciente necessita de continuidade do tratamento ' +
  'fisioterapêutico para reabilitação funcional completa.',
  { align: 'justify' }
)

doc.moveDown(3)

// ── ASSINATURA ──────────────────────────────────────────────
doc.moveTo(150, doc.y).lineTo(445, doc.y).stroke()
doc.moveDown(0.3)
doc
  .fontSize(10)
  .font('Helvetica-Bold')
  .text('Igor Belmont', { align: 'center' })
doc
  .fontSize(9)
  .font('Helvetica')
  .text('CREFITO-2/123456-F', { align: 'center' })

doc.end()

console.log(`✅ PDF gerado em: ${outputPath}`)