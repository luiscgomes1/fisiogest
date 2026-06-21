-- CreateEnum
CREATE TYPE "StatusAgendamento" AS ENUM ('AGENDADO', 'COMPARECEU', 'FALTOU', 'DESMARCOU');

-- CreateEnum
CREATE TYPE "TipoSessao" AS ENUM ('AVALIACAO', 'SESSAO', 'REPOSICAO');

-- CreateEnum
CREATE TYPE "TipoPacote" AS ENUM ('INDIVIDUAL', 'PACOTE_5', 'PACOTE_10');

-- CreateEnum
CREATE TYPE "StatusPagamento" AS ENUM ('AGUARDANDO', 'PAGO');

-- CreateEnum
CREATE TYPE "TipoAssinatura" AS ENUM ('DIGITAL', 'MANUSCRITA');

-- CreateTable
CREATE TABLE "Profissional" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "senha_hash" TEXT NOT NULL,
    "crefito" TEXT NOT NULL,
    "cidade" TEXT NOT NULL,
    "uf" CHAR(2) NOT NULL,
    "assinatura_url" TEXT,
    "horario_inicio" TEXT NOT NULL DEFAULT '07:00',
    "horario_fim" TEXT NOT NULL DEFAULT '18:00',
    "preco_sessao_individual" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "preco_pacote_5" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "preco_pacote_10" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Profissional_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Paciente" (
    "id" TEXT NOT NULL,
    "profissional_id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "cpf" TEXT NOT NULL,
    "data_nascimento" TIMESTAMP(3) NOT NULL,
    "endereco" TEXT NOT NULL,
    "estado_civil" TEXT NOT NULL,
    "nacionalidade" TEXT NOT NULL,
    "telefone" TEXT,
    "email" TEXT,
    "observacoes" TEXT,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "preco_sessao_individual" DECIMAL(10,2),
    "preco_pacote_5" DECIMAL(10,2),
    "preco_pacote_10" DECIMAL(10,2),

    CONSTRAINT "Paciente_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Agendamento" (
    "id" TEXT NOT NULL,
    "paciente_id" TEXT NOT NULL,
    "profissional_id" TEXT NOT NULL,
    "data" DATE NOT NULL,
    "horario" TEXT NOT NULL,
    "slot" INTEGER NOT NULL,
    "status" "StatusAgendamento" NOT NULL DEFAULT 'AGENDADO',
    "tipo" "TipoSessao" NOT NULL DEFAULT 'SESSAO',
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Agendamento_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Prontuario" (
    "id" TEXT NOT NULL,
    "paciente_id" TEXT NOT NULL,
    "medico_solicitante" TEXT,
    "diagnostico_medico" TEXT,
    "hda" TEXT,
    "hpp_has" BOOLEAN NOT NULL DEFAULT false,
    "hpp_dm" BOOLEAN NOT NULL DEFAULT false,
    "hpp_ca" BOOLEAN NOT NULL DEFAULT false,
    "hpp_cardiopatia" BOOLEAN NOT NULL DEFAULT false,
    "medicacoes" TEXT,
    "habitos_vida" TEXT,
    "exames_medicos" TEXT,
    "avaliacao_fisica" TEXT,
    "diagnostico_fisio" TEXT,
    "pa" TEXT,
    "fr" TEXT,
    "fc" TEXT,
    "ap" TEXT,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Prontuario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Evolucao" (
    "id" TEXT NOT NULL,
    "prontuario_id" TEXT NOT NULL,
    "texto" TEXT NOT NULL,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "correcao_texto" TEXT,
    "correcao_em" TIMESTAMP(3),

    CONSTRAINT "Evolucao_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Pacote" (
    "id" TEXT NOT NULL,
    "paciente_id" TEXT NOT NULL,
    "profissional_id" TEXT NOT NULL,
    "tipo" "TipoPacote" NOT NULL,
    "valor_cobrado" DECIMAL(10,2) NOT NULL,
    "status_pagamento" "StatusPagamento" NOT NULL DEFAULT 'AGUARDANDO',
    "pago_em" TIMESTAMP(3),
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Pacote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SessaoPacote" (
    "id" TEXT NOT NULL,
    "pacote_id" TEXT NOT NULL,
    "agendamento_id" TEXT NOT NULL,

    CONSTRAINT "SessaoPacote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Laudo" (
    "id" TEXT NOT NULL,
    "paciente_id" TEXT NOT NULL,
    "profissional_id" TEXT NOT NULL,
    "conteudo" JSONB NOT NULL,
    "tipo_assinatura" "TipoAssinatura" NOT NULL DEFAULT 'MANUSCRITA',
    "pdf_url" TEXT,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Laudo_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Profissional_email_key" ON "Profissional"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Paciente_cpf_profissional_id_key" ON "Paciente"("cpf", "profissional_id");

-- CreateIndex
CREATE UNIQUE INDEX "Agendamento_profissional_id_data_horario_slot_key" ON "Agendamento"("profissional_id", "data", "horario", "slot");

-- CreateIndex
CREATE UNIQUE INDEX "Prontuario_paciente_id_key" ON "Prontuario"("paciente_id");

-- CreateIndex
CREATE UNIQUE INDEX "SessaoPacote_agendamento_id_key" ON "SessaoPacote"("agendamento_id");

-- AddForeignKey
ALTER TABLE "Paciente" ADD CONSTRAINT "Paciente_profissional_id_fkey" FOREIGN KEY ("profissional_id") REFERENCES "Profissional"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Agendamento" ADD CONSTRAINT "Agendamento_paciente_id_fkey" FOREIGN KEY ("paciente_id") REFERENCES "Paciente"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Agendamento" ADD CONSTRAINT "Agendamento_profissional_id_fkey" FOREIGN KEY ("profissional_id") REFERENCES "Profissional"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Prontuario" ADD CONSTRAINT "Prontuario_paciente_id_fkey" FOREIGN KEY ("paciente_id") REFERENCES "Paciente"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Evolucao" ADD CONSTRAINT "Evolucao_prontuario_id_fkey" FOREIGN KEY ("prontuario_id") REFERENCES "Prontuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pacote" ADD CONSTRAINT "Pacote_paciente_id_fkey" FOREIGN KEY ("paciente_id") REFERENCES "Paciente"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pacote" ADD CONSTRAINT "Pacote_profissional_id_fkey" FOREIGN KEY ("profissional_id") REFERENCES "Profissional"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SessaoPacote" ADD CONSTRAINT "SessaoPacote_pacote_id_fkey" FOREIGN KEY ("pacote_id") REFERENCES "Pacote"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SessaoPacote" ADD CONSTRAINT "SessaoPacote_agendamento_id_fkey" FOREIGN KEY ("agendamento_id") REFERENCES "Agendamento"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Laudo" ADD CONSTRAINT "Laudo_paciente_id_fkey" FOREIGN KEY ("paciente_id") REFERENCES "Paciente"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Laudo" ADD CONSTRAINT "Laudo_profissional_id_fkey" FOREIGN KEY ("profissional_id") REFERENCES "Profissional"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
