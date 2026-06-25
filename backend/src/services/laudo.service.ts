import PDFDocument from 'pdfkit'
import { Response } from 'express'

interface DadosLaudo {
    cidade: string
    uf: string
    data: string
    paciente_nome: string
    paciente_nascimento: string
    diagnostico_medico: string
    medico_solicitante: string
    data_inicio: string
    frequencia_semanal: string
    quadro_clinico: string
    achados_exame: string
    diagnostico_funcional: string
    conclusao: string
    profissional_nome: string
    profissional_crefito: string
    logo_url?: string | null
    assinatura_url?: string | null
    tipo_assinatura: 'DIGITAL' | 'MANUSCRITA'
}

export async function gerarPDFLaudo(dados: DadosLaudo, res: Response) {
    const doc = new PDFDocument({ size: 'A4', margin: 50 })
    const agora = new Date()
    const dataHoraArquivo = [
        agora.getFullYear(),
        String(agora.getMonth() + 1).padStart(2, '0'),
        String(agora.getDate()).padStart(2, '0'),
        String(agora.getHours()).padStart(2, '0'),
        String(agora.getMinutes()).padStart(2, '0'),
    ].join('-')

    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader(
        'Content-Disposition',
        `attachment; filename="laudo-${dados.paciente_nome.replace(/\s+/g, '_').toLocaleLowerCase()}-${dataHoraArquivo}.pdf"`
    )
    doc.pipe(res)

    if (dados.logo_url) {
        try {
            doc.image(dados.logo_url, 50, 45, { width: 80 })
        } catch (error) {
            desenharPlaceholderLogo(doc)
        }
    } else {
        desenharPlaceholderLogo(doc)
    }

    doc
        .fillColor('#000000')
        .fontSize(14)
        .font('Helvetica-Bold')
        .text('LAUDO FISIOTERAPÊUTICO', 140, 50, { width: 355, align: 'center' })

    doc
        .fontSize(10)
        .font('Helvetica')
        .text(`${dados.cidade}, ${dados.uf} — ${dados.data}`, 140, 70, { width: 355, align: 'center' })

    doc.undash()
    doc.moveTo(50, 105).lineTo(545, 105).stroke()
    doc.y = 115
    doc.x = 50
    doc.moveDown(0.5)

    //dados do paciente
    doc.fontSize(10).font('Helvetica-Bold').text('DADOS DO PACIENTE', { underline: true })
    doc.moveDown(0.3)
    doc.font('Helvetica')
    doc.text(`Paciente: ${dados.paciente_nome}`)
    doc.text(`Data de nascimento: ${dados.paciente_nascimento}`)
    doc.text(`Diagnóstico médico: ${dados.diagnostico_medico}`)
    doc.text(`Médico solicitante: ${dados.medico_solicitante}`)
    doc.text(`Início do tratamento: ${dados.data_inicio}`)
    doc.text(`Frequência semanal: ${dados.frequencia_semanal}`)
    doc.moveDown(1)

    //quadro clínico
    secao(doc, 'QUADRO CLÍNICO', dados.quadro_clinico)

    //achados do exame
    secao(doc, 'ACHADOS AO EXAME FÍSICO', dados.achados_exame)

    //diagnóstico funcional
    secao(doc, 'DIAGNÓSTICO FUNCIONAL', dados.diagnostico_funcional)

    //conclusao
    secao(doc, 'CONCLUSÃO', dados.conclusao)

    doc.moveDown(3)

    if (dados.tipo_assinatura === 'DIGITAL' && dados.assinatura_url) {
        try {
            doc.image(dados.assinatura_url, 222, doc.y, { width: 150 })
            doc.moveDown(3)
        } catch {
            linhaAssinatura(doc)
        }
    } else {
        linhaAssinatura(doc)
    }

    doc.fontSize(10).font('Helvetica-Bold').text(dados.profissional_nome, { align: 'center' })
    doc.fontSize(9).font('Helvetica').text(`CREFITO: ${dados.profissional_crefito}`, { align: 'center' })

    doc.end()
}

function desenharPlaceholderLogo(doc: InstanceType<typeof PDFDocument>) {
    doc.rect(50, 45, 80, 50).dash(3, { space: 3 }).stroke('#AAAAAA')
    doc.undash()
    doc.fontSize(8).font('Helvetica').fillColor('#AAAAAA').text('LOGO', 50, 63, { width: 80, align: 'center' })
}

function secao(doc: InstanceType<typeof PDFDocument>, titulo: string, texto: string) {
    doc.fillColor('#000000').fontSize(10).font('Helvetica-Bold').text(titulo, { underline: true })
    doc.moveDown(0.3)
    doc.font('Helvetica').text(texto, { align: 'justify' })
    doc.moveDown(1)
}

function linhaAssinatura(doc: InstanceType<typeof PDFDocument>) {
    doc.moveTo(150, doc.y).lineTo(445, doc.y).stroke()
    doc.moveDown(0.3)
}