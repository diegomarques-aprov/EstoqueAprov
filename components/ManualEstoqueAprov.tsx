'use client';

import { useState } from 'react';

type TutorialProps = {
  id: string;
  icone: string;
  titulo: string;
  subtitulo: string;
  children: React.ReactNode;
};

function Tutorial({
  id,
  icone,
  titulo,
  subtitulo,
  children,
}: TutorialProps) {
  const [aberto, setAberto] = useState(false);

  return (
    <article
      style={{
        overflow: 'hidden',
        borderRadius: '16px',
        background: 'rgba(255, 250, 238, .76)',
        border: '1px solid rgba(92, 62, 32, .18)',
        boxShadow: '0 5px 16px rgba(73, 48, 27, .08)',
      }}
    >
      <button
        type="button"
        onClick={() => setAberto(!aberto)}
        aria-expanded={aberto}
        aria-controls={`tutorial-${id}`}
        style={{
          width: '100%',
          padding: '16px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          border: 0,
          background: 'transparent',
          color: '#20352a',
          textAlign: 'left',
          cursor: 'pointer',
        }}
      >
        <div
          style={{
            width: '42px',
            height: '42px',
            flexShrink: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '12px',
            background: 'rgba(55, 86, 61, .10)',
            border: '1px solid rgba(55, 86, 61, .15)',
            fontSize: '21px',
          }}
        >
          {icone}
        </div>

        <div
          style={{
            flex: 1,
            minWidth: 0,
          }}
        >
          <strong
            style={{
              display: 'block',
              fontSize: '16px',
              color: '#173b2a',
            }}
          >
            {titulo}
          </strong>

          <span
            style={{
              display: 'block',
              marginTop: '3px',
              fontSize: '12px',
              lineHeight: 1.4,
              color: '#6a5a46',
            }}
          >
            {subtitulo}
          </span>
        </div>

        <span
          aria-hidden="true"
          style={{
            flexShrink: 0,
            fontSize: '18px',
            fontWeight: 900,
            color: '#79562f',
            transform: aberto
              ? 'rotate(180deg)'
              : 'rotate(0deg)',
            transition: 'transform .2s ease',
          }}
        >
          ⌄
        </span>
      </button>

      {aberto && (
        <div
          id={`tutorial-${id}`}
          style={{
            padding: '0 18px 20px',
            borderTop: '1px solid rgba(92, 62, 32, .12)',
          }}
        >
          {children}
        </div>
      )}
    </article>
  );
}

function TituloTutorial({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <h4
      style={{
        margin: '18px 0 7px',
        fontSize: '14px',
        color: '#173b2a',
      }}
    >
      {children}
    </h4>
  );
}

function TextoTutorial({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <p
      style={{
        margin: 0,
        fontSize: '13px',
        lineHeight: 1.65,
        color: '#4e493e',
        textAlign: 'justify',
      }}
    >
      {children}
    </p>
  );
}

function Passos({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ol
      style={{
        margin: '8px 0 0',
        paddingLeft: '22px',
        color: '#4e493e',
        fontSize: '13px',
        lineHeight: 1.7,
      }}
    >
      {children}
    </ol>
  );
}

function Aviso({
  children,
  tipo = 'atencao',
}: {
  children: React.ReactNode;
  tipo?: 'atencao' | 'informacao';
}) {
  const informacao =
    tipo === 'informacao';

  return (
    <div
      style={{
        marginTop: '16px',
        padding: '12px 13px',
        borderRadius: '11px',
        background: informacao
          ? 'rgba(55, 86, 61, .08)'
          : 'rgba(167, 121, 61, .10)',
        border: informacao
          ? '1px solid rgba(55, 86, 61, .20)'
          : '1px solid rgba(167, 121, 61, .28)',
        color: '#4e493e',
        fontSize: '12px',
        lineHeight: 1.55,
      }}
    >
      <strong
        style={{
          color: informacao
            ? '#294735'
            : '#79562f',
        }}
      >
        {informacao
          ? 'ℹ Informação: '
          : '⚠ Atenção: '}
      </strong>

      {children}
    </div>
  );
}

export default function ManualEstoqueAprov() {
  return (
    <section
      style={{
        marginTop: '16px',
        marginBottom: '24px',
        padding: '22px',
        borderRadius: '20px',
        background: 'rgba(247, 236, 213, .58)',
        border: '1px solid rgba(92, 62, 32, .20)',
        boxShadow: '0 8px 24px rgba(73, 48, 27, .12)',
      }}
    >
      <div
        style={{
          marginBottom: '18px',
          textAlign: 'center',
        }}
      >
        <div
          style={{
            width: '52px',
            height: '52px',
            margin: '0 auto 11px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '15px',
            background: '#294735',
            color: '#f4d79d',
            fontSize: '25px',
            boxShadow: '0 5px 14px rgba(38, 57, 44, .18)',
          }}
        >
          📖
        </div>

        <h2
          style={{
            margin: 0,
            color: '#173b2a',
            fontSize: '21px',
          }}
        >
          Manual de utilização
        </h2>

        <p
          style={{
            maxWidth: '560px',
            margin: '8px auto 0',
            color: '#5f513f',
            fontSize: '13px',
            lineHeight: 1.55,
          }}
        >
          Selecione abaixo o procedimento sobre o qual
          deseja orientação. Cada item apresenta sua
          finalidade, forma de utilização e cuidados
          importantes durante a operação.
        </p>
      </div>

      <div
        style={{
          marginBottom: '10px',
          color: '#79562f',
          fontSize: '11px',
          fontWeight: 900,
          textTransform: 'uppercase',
          letterSpacing: '1.2px',
        }}
      >
        Operação
      </div>

      <div
        style={{
          display: 'grid',
          gap: '10px',
        }}
      >
        {/* PAINEL DE AVISOS */}

        <Tutorial
          id="painel-avisos"
          icone="⚠"
          titulo="Painel de Avisos"
          subtitulo="Alertas, pendências e lembretes operacionais."
        >
          <TituloTutorial>
            Para que serve
          </TituloTutorial>

          <TextoTutorial>
            O Painel de Avisos concentra informações
            que podem exigir providências antes ou
            durante as atividades do Aprovisionamento.
            Sua finalidade é facilitar o acompanhamento
            diário das principais pendências do
            sistema.
          </TextoTutorial>

          <TituloTutorial>
            Quando consultar
          </TituloTutorial>

          <TextoTutorial>
            Recomenda-se consultar o Painel de Avisos
            diariamente, especialmente no início das
            atividades, para verificar se existe alguma
            situação que precise ser regularizada ou
            acompanhada.
          </TextoTutorial>

          <TituloTutorial>
            O que o painel verifica
          </TituloTutorial>

          <Passos>
            <li>
              <strong>Conferência FLV:</strong>{' '}
              permite acompanhar a conferência diária
              dos gêneros classificados como FLV.
            </li>

            <li>
              <strong>
                Fechamento diário pendente:
              </strong>{' '}
              informa quando existem dias anteriores
              com refeições cujo fechamento do efetivo
              alimentado ainda não foi realizado.
            </li>

            <li>
              <strong>Efetivo de amanhã:</strong>{' '}
              verifica se o efetivo previsto para o dia
              seguinte já foi informado.
            </li>

            <li>
              <strong>
                Estoque abaixo do mínimo:
              </strong>{' '}
              identifica gêneros cujo saldo total está
              abaixo do estoque mínimo definido no
              cadastro.
            </li>

            <li>
              <strong>Validade próxima:</strong>{' '}
              alerta sobre lotes com saldo que vencem
              em até 30 dias.
            </li>

            <li>
              <strong>Lotes vencidos:</strong>{' '}
              informa a existência de lotes vencidos
              que ainda possuem saldo registrado.
            </li>

            <li>
              <strong>Cardápio semanal:</strong>{' '}
              na sexta-feira, apresenta ao
              Administrador o lembrete para verificar
              e cadastrar o cardápio da próxima semana.
            </li>

            <li>
              <strong>QDAA:</strong>{' '}
              entre os dias 23 e 25, apresenta ao
              Administrador o lembrete para a
              realização do QDAA mensal, com referência
              ao prazo do dia 25.
            </li>
          </Passos>

          <TituloTutorial>
            Como utilizar
          </TituloTutorial>

          <Passos>
            <li>
              Na tela <strong>Início</strong>, localize
              o <strong>Painel de Avisos</strong>.
            </li>

            <li>
              Toque em{' '}
              <strong>Consultar avisos</strong>.
            </li>

            <li>
              Verifique os alertas e pendências
              apresentados.
            </li>

            <li>
              Quando houver um botão de ação, utilize-o
              para acessar diretamente o procedimento
              correspondente.
            </li>

            <li>
              Após regularizar a situação, consulte
              novamente o painel para acompanhar o
              estado operacional atualizado.
            </li>
          </Passos>

          <Aviso tipo="informacao">
            Quando nenhuma das pendências monitoradas
            estiver ativa e o efetivo de amanhã já
            estiver informado, o sistema apresenta a
            indicação de que nenhuma outra pendência
            operacional foi identificada naquele
            momento.
          </Aviso>

          <Aviso>
            Os avisos dependem das informações
            cadastradas no sistema. Manter estoque,
            efetivo, fechamentos, validade, cardápio e
            demais registros atualizados é essencial
            para que os alertas sejam úteis.
          </Aviso>
        </Tutorial>

        {/* ESTOQUE INICIAL */}

        <Tutorial
          id="estoque-inicial"
          icone="📦"
          titulo="Estoque inicial"
          subtitulo="Implantação dos saldos existentes no depósito."
        >
          <TituloTutorial>
            Para que serve
          </TituloTutorial>

          <TextoTutorial>
            O Estoque Inicial é utilizado para registrar
            no sistema os gêneros que já existem
            fisicamente no depósito no momento da
            implantação do Estoque Aprov.
          </TextoTutorial>

          <TituloTutorial>
            Quando utilizar
          </TituloTutorial>

          <TextoTutorial>
            Esse procedimento deve ser utilizado na
            implantação do estoque, para que o saldo
            registrado no sistema corresponda ao
            material que já se encontra fisicamente
            armazenado.
          </TextoTutorial>

          <Aviso>
            Depois que o estoque inicial estiver
            implantado, as entradas normais de novos
            gêneros devem ser registradas no módulo{' '}
            <strong>Novo recebimento</strong>. Não
            utilize Estoque Inicial como rotina normal
            de entrada de material.
          </Aviso>

          <TituloTutorial>
            Quem pode acessar
          </TituloTutorial>

          <TextoTutorial>
            O módulo está disponível para os perfis de
            Administrador Principal, Administrador e
            Chefe do Depósito.
          </TextoTutorial>

          <TituloTutorial>
            Antes de começar
          </TituloTutorial>

          <TextoTutorial>
            O gênero, sua unidade de medida e o local de
            armazenamento precisam estar previamente
            cadastrados. As exigências de lote e
            validade também são determinadas pelo
            cadastro do gênero.
          </TextoTutorial>

          <TituloTutorial>
            Passo a passo
          </TituloTutorial>

          <Passos>
            <li>
              Na tela <strong>Início</strong>, acesse{' '}
              <strong>Estoque inicial</strong>.
            </li>

            <li>
              Escolha a classe do material:{' '}
              <strong>QS</strong> para gêneros da
              Cadeia de Suprimento ou{' '}
              <strong>QR</strong> para gêneros de
              Compra Local.
            </li>

            <li>
              No campo <strong>Gênero</strong>,
              selecione o item que será lançado.
            </li>

            <li>
              Confira a unidade de medida apresentada
              pelo sistema e as informações sobre
              controle de lote e validade.
            </li>

            <li>
              Selecione o{' '}
              <strong>Local de armazenamento</strong>{' '}
              onde o gênero se encontra fisicamente.
            </li>

            <li>
              Informe a <strong>Quantidade</strong>{' '}
              existente, respeitando a unidade de
              medida cadastrada para o gênero.
            </li>

            <li>
              Se o gênero possuir controle de lote,
              informe o <strong>Lote</strong>. Quando
              não houver esse controle, o campo não
              será solicitado.
            </li>

            <li>
              Se o gênero possuir controle de validade,
              informe a <strong>Validade</strong>.
            </li>

            <li>
              Confira todas as informações antes de
              concluir.
            </li>

            <li>
              Toque em{' '}
              <strong>Registrar saldo inicial</strong>.
            </li>

            <li>
              Aguarde a mensagem{' '}
              <strong>
                “Saldo inicial registrado com sucesso.”
              </strong>
            </li>
          </Passos>

          <TituloTutorial>
            QS e QR
          </TituloTutorial>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns:
                'repeat(2, minmax(0, 1fr))',
              gap: '8px',
              marginTop: '8px',
            }}
          >
            <div
              style={{
                padding: '11px',
                borderRadius: '11px',
                background: 'rgba(55, 86, 61, .08)',
                border:
                  '1px solid rgba(55, 86, 61, .18)',
              }}
            >
              <strong
                style={{
                  display: 'block',
                  color: '#294735',
                  fontSize: '13px',
                }}
              >
                QS
              </strong>

              <span
                style={{
                  display: 'block',
                  marginTop: '3px',
                  color: '#5f513f',
                  fontSize: '11px',
                  lineHeight: 1.4,
                }}
              >
                Cadeia de suprimento
              </span>
            </div>

            <div
              style={{
                padding: '11px',
                borderRadius: '11px',
                background: 'rgba(55, 86, 61, .08)',
                border:
                  '1px solid rgba(55, 86, 61, .18)',
              }}
            >
              <strong
                style={{
                  display: 'block',
                  color: '#294735',
                  fontSize: '13px',
                }}
              >
                QR
              </strong>

              <span
                style={{
                  display: 'block',
                  marginTop: '3px',
                  color: '#5f513f',
                  fontSize: '11px',
                  lineHeight: 1.4,
                }}
              >
                Compra local
              </span>
            </div>
          </div>

          <TituloTutorial>
            Lote e validade
          </TituloTutorial>

          <TextoTutorial>
            Os campos de lote e validade aparecem de
            acordo com as regras definidas no cadastro
            do gênero. Se o gênero não exigir controle
            de lote, por exemplo, esse campo não será
            solicitado no lançamento.
          </TextoTutorial>

          <Aviso tipo="informacao">
            Para gêneros FLV configurados sem controle
            por lote, o sistema não solicitará essa
            informação durante o registro do saldo
            inicial.
          </Aviso>

          <TituloTutorial>
            Resultado do lançamento
          </TituloTutorial>

          <TextoTutorial>
            Após a confirmação, a quantidade informada
            passa a compor o saldo inicial do gênero no
            local de armazenamento selecionado,
            permitindo que as movimentações posteriores
            sejam realizadas a partir da situação
            física existente no início da utilização do
            sistema.
          </TextoTutorial>

          <Aviso>
            Antes de registrar o saldo inicial real,
            faça a conferência física do material.
            Quantidade, local, lote e validade, quando
            aplicáveis, devem corresponder ao que
            realmente existe no depósito.
          </Aviso>
        </Tutorial>
      </div>

      <div
        style={{
          marginTop: '15px',
          paddingTop: '13px',
          borderTop: '1px solid rgba(92, 62, 32, .14)',
          textAlign: 'center',
          color: '#79562f',
          fontSize: '11px',
          lineHeight: 1.5,
          fontWeight: 700,
        }}
      >
        Manual do Estoque Aprov · Os demais
        procedimentos serão acrescentados
        progressivamente.
      </div>
    </section>
  );
}
