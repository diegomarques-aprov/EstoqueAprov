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
            borderTop:
              '1px solid rgba(92, 62, 32, .12)',
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
            boxShadow:
              '0 5px 14px rgba(38, 57, 44, .18)',
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

        {/* CONSULTAR ESTOQUE */}

        <Tutorial
          id="consultar-estoque"
          icone="🔎"
          titulo="Consultar estoque"
          subtitulo="Consulta dos saldos disponíveis por gênero, local e lote."
        >
          <TituloTutorial>
            Para que serve
          </TituloTutorial>

          <TextoTutorial>
            A consulta de estoque permite visualizar a
            situação atual dos gêneros disponíveis no
            Estoque Aprov. Os saldos são apresentados
            separadamente entre QS e QR e organizados
            para facilitar a identificação do gênero,
            do local de armazenamento e, quando
            aplicável, do lote e da validade.
          </TextoTutorial>

          <TituloTutorial>
            Como consultar
          </TituloTutorial>

          <Passos>
            <li>
              Na tela <strong>Início</strong>, acesse{' '}
              <strong>Consultar estoque</strong>.
            </li>

            <li>
              Escolha a classe que deseja consultar:
              <strong> QS</strong> ou{' '}
              <strong>QR</strong>.
            </li>

            <li>
              Aguarde o carregamento dos saldos
              registrados para a classe selecionada.
            </li>

            <li>
              Localize o <strong>grupo</strong> ao qual
              pertence o gênero desejado.
            </li>

            <li>
              Dentro do grupo, localize a{' '}
              <strong>categoria</strong>.
            </li>

            <li>
              Localize o <strong>gênero</strong> que
              deseja consultar.
            </li>

            <li>
              Confira o saldo total apresentado para o
              gênero e sua respectiva unidade de
              medida.
            </li>

            <li>
              Verifique abaixo do gênero a distribuição
              das quantidades por{' '}
              <strong>local de armazenamento</strong>.
            </li>

            <li>
              Quando houver controle de lote, confira
              também o <strong>número do lote</strong>{' '}
              e a <strong>validade</strong> exibidos
              junto ao saldo.
            </li>
          </Passos>

          <TituloTutorial>
            Organização da consulta
          </TituloTutorial>

          <TextoTutorial>
            Para facilitar a leitura, o sistema
            organiza os registros em uma sequência
            hierárquica: grupo, categoria, gênero e
            local de armazenamento. Quando o gênero
            possuir controle por lote, cada saldo
            também poderá ser identificado pelo lote
            correspondente.
          </TextoTutorial>

          <Aviso tipo="informacao">
            Os totais apresentados respeitam a unidade
            de medida cadastrada para cada gênero. O
            sistema também apresenta totais por unidade
            nos agrupamentos, evitando somar
            diretamente unidades de natureza diferente.
          </Aviso>

          <TituloTutorial>
            Saldo por gênero
          </TituloTutorial>

          <TextoTutorial>
            O valor destacado ao lado do gênero
            representa a soma das quantidades
            disponíveis daquele gênero nos registros
            apresentados, respeitando sua unidade de
            medida.
          </TextoTutorial>

          <TituloTutorial>
            Local e lote
          </TituloTutorial>

          <TextoTutorial>
            Um mesmo gênero pode possuir saldo em
            diferentes locais de armazenamento ou em
            diferentes lotes. Por isso, além do total
            geral do gênero, a tela detalha onde cada
            quantidade está armazenada.
          </TextoTutorial>

          <Aviso>
            Antes de realizar movimentações, confira se
            o saldo apresentado corresponde ao gênero,
            local e lote desejados. Essa verificação é
            especialmente importante para gêneros com
            controle de validade e para a correta
            aplicação do PVPS.
          </Aviso>

          <TituloTutorial>
            Quando não houver saldo
          </TituloTutorial>

          <TextoTutorial>
            Caso não existam gêneros com quantidade
            disponível na classe selecionada, o sistema
            apresentará a mensagem{' '}
            <strong>“Nenhum saldo registrado”</strong>.
          </TextoTutorial>
        </Tutorial>

        {/* NOVO RECEBIMENTO */}

        <Tutorial
          id="novo-recebimento"
          icone="↓"
          titulo="Novo recebimento"
          subtitulo="Entrada de novos gêneros QS ou QR no estoque."
        >
          <TituloTutorial>
            Para que serve
          </TituloTutorial>

          <TextoTutorial>
            O módulo Novo recebimento é utilizado para
            registrar as entradas normais de gêneros no
            estoque após a implantação do sistema. Cada
            recebimento fica identificado e as
            quantidades confirmadas são acrescentadas
            aos saldos existentes.
          </TextoTutorial>

          <Aviso tipo="informacao">
            Diferentemente do Estoque Inicial, que é
            destinado à implantação dos saldos que já
            existiam no depósito, este é o módulo
            utilizado para registrar os novos
            recebimentos realizados durante a operação
            normal do Aprovisionamento.
          </Aviso>

          <TituloTutorial>
            Antes de começar
          </TituloTutorial>

          <TextoTutorial>
            Os gêneros e os locais de armazenamento
            utilizados no recebimento precisam estar
            cadastrados e ativos. O gênero também deve
            pertencer à mesma classe, QS ou QR,
            selecionada para o recebimento.
          </TextoTutorial>

          <TituloTutorial>
            Passo a passo
          </TituloTutorial>

          <Passos>
            <li>
              Na tela <strong>Início</strong>, acesse{' '}
              <strong>Novo recebimento</strong>.
            </li>

            <li>
              Selecione <strong>QS</strong> ou{' '}
              <strong>QR</strong>, conforme a
              classificação dos gêneros que estão
              sendo recebidos.
            </li>

            <li>
              Confira ou informe a{' '}
              <strong>data do recebimento</strong>.
            </li>

            <li>
              No campo <strong>Origem</strong>, informe
              a procedência do material quando
              aplicável. Para QS, por exemplo, poderá
              ser informado o B Sup. Para QR, poderá
              ser informado o fornecedor.
            </li>

            <li>
              No campo <strong>Documento</strong>,
              informe, quando houver, a relação, nota
              fiscal ou outro documento relacionado à
              entrada.
            </li>

            <li>
              Utilize o campo{' '}
              <strong>Observação</strong> quando for
              necessário registrar alguma informação
              complementar sobre o recebimento.
            </li>

            <li>
              Em <strong>Gêneros recebidos</strong>,
              selecione o primeiro gênero da entrada.
            </li>

            <li>
              Informe a <strong>quantidade</strong>,
              respeitando a unidade de medida exibida
              pelo sistema.
            </li>

            <li>
              Selecione o{' '}
              <strong>local de armazenamento</strong>.
              Quando o gênero possuir local padrão
              cadastrado, o sistema poderá preenchê-lo
              automaticamente.
            </li>

            <li>
              Se o gênero controlar lote, informe o{' '}
              <strong>lote</strong>.
            </li>

            <li>
              Se o gênero controlar validade, informe a{' '}
              <strong>validade</strong>.
            </li>

            <li>
              Informe o{' '}
              <strong>valor unitário</strong> quando
              essa informação estiver disponível para
              o recebimento.
            </li>

            <li>
              Caso existam outros gêneros no mesmo
              recebimento, toque em{' '}
              <strong>+ Adicionar</strong> e repita o
              preenchimento para cada item.
            </li>

            <li>
              Após informar todos os itens, toque em{' '}
              <strong>Revisar recebimento</strong>.
            </li>

            <li>
              Confira os gêneros, quantidades, locais,
              lotes, validades e demais informações
              antes de prosseguir.
            </li>

            <li>
              Se precisar corrigir alguma informação,
              toque em <strong>Voltar e editar</strong>.
            </li>

            <li>
              Estando tudo correto, toque em{' '}
              <strong>Confirmar</strong>.
            </li>
          </Passos>

          <TituloTutorial>
            Mais de um gênero
          </TituloTutorial>

          <TextoTutorial>
            Um único recebimento pode conter vários
            gêneros. O botão{' '}
            <strong>+ Adicionar</strong> cria novos
            itens dentro da mesma entrada, permitindo
            registrar os materiais relacionados ao
            mesmo recebimento sem criar lançamentos
            separados desnecessariamente.
          </TextoTutorial>

          <TituloTutorial>
            Lote e validade
          </TituloTutorial>

          <TextoTutorial>
            Lote e validade são solicitados de acordo
            com a configuração de cada gênero. Quando o
            gênero exigir essas informações, o
            recebimento somente poderá prosseguir após
            o preenchimento dos campos obrigatórios.
          </TextoTutorial>

          <Aviso>
            Confira cuidadosamente lote e validade
            antes da confirmação. Essas informações
            serão utilizadas posteriormente no
            controle e na rastreabilidade do estoque,
            inclusive para apoiar a aplicação do
            princípio PVPS.
          </Aviso>

          <TituloTutorial>
            Valor unitário
          </TituloTutorial>

          <TextoTutorial>
            O sistema permite informar o valor unitário
            de cada item do recebimento e apresenta o
            valor total informado para a entrada. O
            valor unitário não substitui a quantidade:
            são informações distintas registradas para
            o item.
          </TextoTutorial>

          <TituloTutorial>
            Revisão antes da entrada
          </TituloTutorial>

          <TextoTutorial>
            O botão{' '}
            <strong>Revisar recebimento</strong> não
            efetiva imediatamente a entrada. Ele
            permite uma última conferência dos dados
            antes da confirmação definitiva.
          </TextoTutorial>

          <Aviso tipo="informacao">
            O estoque somente é atualizado quando o
            recebimento é efetivamente confirmado.
          </Aviso>

          <TituloTutorial>
            O que acontece após confirmar
          </TituloTutorial>

          <TextoTutorial>
            Após a confirmação, o sistema cria o
            recebimento, registra seus itens, acrescenta
            as quantidades aos respectivos saldos de
            estoque e registra a movimentação para fins
            de rastreabilidade.
          </TextoTutorial>

          <TextoTutorial>
            Quando o gênero possui controle por lote, o
            sistema relaciona a entrada ao lote
            informado. Quando o gênero não possui
            controle por lote, a quantidade é somada ao
            saldo sem lote existente para aquele gênero
            e local, ou cria esse saldo caso ainda não
            exista.
          </TextoTutorial>

          <Aviso tipo="informacao">
            Após uma entrada concluída com sucesso, o
            sistema informa o número do recebimento e
            confirma que o estoque foi atualizado.
          </Aviso>

          <Aviso>
            Se ocorrer uma falha durante a efetivação do
            recebimento, o sistema não deve concluir
            apenas parte da operação. A entrada é
            processada de forma conjunta para preservar
            a consistência do estoque.
          </Aviso>
        </Tutorial>

        {/* SAÍDA DE GÊNEROS */}

        <Tutorial
          id="saida-generos"
          icone="↑"
          titulo="Saída de gêneros"
          subtitulo="Baixa dos materiais liberados para consumo ou utilização."
        >
          <TituloTutorial>
            Para que serve
          </TituloTutorial>

          <TextoTutorial>
            O módulo Saída de gêneros é utilizado para
            registrar a retirada física dos materiais
            do estoque. Ao confirmar a operação, as
            quantidades liberadas são baixadas dos
            saldos disponíveis e a movimentação fica
            registrada para rastreabilidade.
          </TextoTutorial>

          <TituloTutorial>
            Passo a passo
          </TituloTutorial>

          <Passos>
            <li>
              Na tela <strong>Início</strong>, acesse{' '}
              <strong>Saída de gêneros</strong>.
            </li>

            <li>
              Escolha a classe dos materiais:
              <strong> QS</strong> ou{' '}
              <strong>QR</strong>.
            </li>

            <li>
              Em <strong>Destino da saída</strong>,
              selecione a finalidade da retirada.
            </li>

            <li>
              Confira ou informe a{' '}
              <strong>data</strong> da saída.
            </li>

            <li>
              Se necessário, utilize o campo{' '}
              <strong>Observação</strong> para registrar
              informação complementar.
            </li>

            <li>
              No primeiro item, selecione o{' '}
              <strong>Grupo</strong>.
            </li>

            <li>
              Selecione a{' '}
              <strong>Categoria</strong>.
            </li>

            <li>
              Selecione o{' '}
              <strong>Gênero</strong>.
            </li>

            <li>
              Confira o saldo disponível apresentado
              pelo sistema.
            </li>

            <li>
              Informe a{' '}
              <strong>Quantidade</strong> que será
              liberada.
            </li>

            <li>
              Para incluir outros gêneros na mesma
              saída, toque em{' '}
              <strong>+ Adicionar</strong>.
            </li>

            <li>
              Depois de preencher todos os itens,
              utilize a opção de revisão da saída.
            </li>

            <li>
              Confira destino, data, gêneros e
              quantidades antes da confirmação.
            </li>

            <li>
              Estando tudo correto, confirme a saída.
            </li>
          </Passos>

          <TituloTutorial>
            Destinos disponíveis
          </TituloTutorial>

          <TextoTutorial>
            A tela permite identificar a finalidade da
            saída como <strong>Café da manhã</strong>,{' '}
            <strong>Almoço</strong>,{' '}
            <strong>Jantar</strong>,{' '}
            <strong>Ceia</strong>,{' '}
            <strong>Serviço do dia seguinte</strong> ou{' '}
            <strong>Outro</strong>.
          </TextoTutorial>

          <Aviso tipo="informacao">
            Na opção Serviço do dia seguinte, a
            finalidade identifica que o material foi
            retirado antecipadamente para o serviço
            seguinte. A movimentação física permanece
            registrada no momento real em que o
            material sai do estoque.
          </Aviso>

          <TituloTutorial>
            Saldo disponível
          </TituloTutorial>

          <TextoTutorial>
            O sistema consulta o estoque da classe
            selecionada e apresenta o saldo disponível
            para cada gênero. Gêneros ativos continuam
            visíveis na estrutura mesmo quando estão
            sem saldo, permitindo identificar a falta
            do material.
          </TextoTutorial>

          <Aviso>
            Não é possível confirmar uma saída com
            quantidade superior ao saldo disponível.
            Gêneros sem estoque também não podem ser
            liberados.
          </Aviso>

          <TituloTutorial>
            Estoque mínimo
          </TituloTutorial>

          <TextoTutorial>
            Quando o gênero possuir estoque mínimo
            cadastrado, o sistema pode sinalizar que o
            saldo disponível está abaixo desse nível,
            auxiliando o responsável na avaliação da
            situação antes da retirada.
          </TextoTutorial>

          <TituloTutorial>
            Mais de um gênero
          </TituloTutorial>

          <TextoTutorial>
            Uma mesma saída pode conter diversos
            gêneros. Cada gênero deve ser incluído uma
            única vez na operação, com sua respectiva
            quantidade.
          </TextoTutorial>

          <Aviso>
            O sistema impede que o mesmo gênero seja
            adicionado mais de uma vez dentro da mesma
            saída. Caso seja necessário alterar a
            quantidade, corrija o próprio item já
            incluído.
          </Aviso>

          <TituloTutorial>
            PVPS e escolha física do estoque
          </TituloTutorial>

          <TextoTutorial>
            Na confirmação, o sistema realiza a baixa
            utilizando os saldos físicos válidos do
            gênero. Para materiais controlados por
            validade, a retirada segue a prioridade dos
            lotes aplicáveis, preservando o princípio
            PVPS — Primeiro que Vence, Primeiro que Sai.
          </TextoTutorial>

          <Aviso>
            Saldo existente em lote vencido ou
            bloqueado para consumo não deve ser
            considerado como quantidade válida para
            uma saída normal.
          </Aviso>

          <TituloTutorial>
            Após a confirmação
          </TituloTutorial>

          <TextoTutorial>
            O sistema registra a saída, seus itens e
            cada movimentação física realizada nos
            respectivos lotes e locais de origem. O
            estoque é atualizado automaticamente.
          </TextoTutorial>

          <Aviso tipo="informacao">
            Após uma saída concluída com sucesso, o
            sistema apresenta o número da saída e
            confirma que o estoque foi atualizado.
          </Aviso>

          <Aviso>
            Se ocorrer uma falha durante a confirmação,
            nenhuma baixa parcial deve permanecer
            efetivada. A operação é tratada de forma
            conjunta para preservar a consistência do
            estoque.
          </Aviso>
        </Tutorial>

        {/* DEVOLUÇÕES E AJUSTES */}

        <Tutorial
          id="devolucoes-ajustes"
          icone="↺"
          titulo="Devoluções e ajustes"
          subtitulo="Transferências, devoluções, perdas, correções e cancelamentos."
        >
          <TituloTutorial>
            Para que serve
          </TituloTutorial>

          <TextoTutorial>
            O módulo Devoluções e ajustes reúne as
            operações utilizadas para regularizar ou
            movimentar saldos já existentes. A tela
            possui cinco procedimentos distintos:
            Transferência, Devolução, Perda/Descarte,
            Correção e Cancelar saída.
          </TextoTutorial>

          <Aviso>
            Utilize sempre o procedimento correspondente
            ao fato que realmente ocorreu. Devolução,
            perda, correção, transferência e
            cancelamento possuem efeitos e registros
            diferentes no histórico do estoque.
          </Aviso>

          <TituloTutorial>
            1. Transferência
          </TituloTutorial>

          <TextoTutorial>
            A Transferência é utilizada quando um
            material permanece no estoque, mas muda de
            local de armazenamento.
          </TextoTutorial>

          <Passos>
            <li>
              Acesse{' '}
              <strong>Devoluções e ajustes</strong>.
            </li>

            <li>
              Selecione{' '}
              <strong>Transferência</strong>.
            </li>

            <li>
              Escolha o saldo físico que será
              transferido. O item identifica gênero,
              local e lote, quando houver.
            </li>

            <li>
              Selecione o{' '}
              <strong>local de destino</strong>.
            </li>

            <li>
              Informe a{' '}
              <strong>quantidade</strong> a transferir.
            </li>

            <li>
              Registre uma observação quando
              necessário.
            </li>

            <li>
              Confira os dados e confirme a
              transferência.
            </li>
          </Passos>

          <Aviso tipo="informacao">
            A transferência mantém o mesmo gênero e o
            mesmo lote. A quantidade é retirada do
            local de origem e acrescentada ao local de
            destino, preservando a rastreabilidade.
          </Aviso>

          <Aviso>
            O local de destino precisa estar ativo e
            deve ser diferente do local de origem. A
            quantidade transferida também não pode ser
            superior ao saldo disponível.
          </Aviso>

          <TituloTutorial>
            2. Devolução ao depósito
          </TituloTutorial>

          <TextoTutorial>
            A Devolução é utilizada quando parte ou
            todo o material de uma saída anteriormente
            confirmada retorna fisicamente ao depósito.
          </TextoTutorial>

          <Passos>
            <li>
              Selecione a opção{' '}
              <strong>Devolução</strong>.
            </li>

            <li>
              Em <strong>Saída original</strong>,
              selecione a saída que gerou a retirada do
              material.
            </li>

            <li>
              Selecione o{' '}
              <strong>gênero devolvido</strong> entre
              os itens daquela saída.
            </li>

            <li>
              Confira a quantidade originalmente
              liberada.
            </li>

            <li>
              Informe a{' '}
              <strong>quantidade devolvida</strong>.
            </li>

            <li>
              Se necessário, informe o motivo ou uma
              observação.
            </li>

            <li>
              Confirme a devolução.
            </li>
          </Passos>

          <Aviso tipo="informacao">
            A devolução recompõe o estoque utilizando
            as movimentações físicas da saída
            original. Dessa forma, o material retorna
            ao gênero, lote e local de onde havia sido
            efetivamente retirado.
          </Aviso>

          <Aviso>
            Não é possível devolver quantidade superior
            ao que ainda pode ser devolvido daquela
            saída. O sistema considera também eventuais
            devoluções anteriores do mesmo gênero.
          </Aviso>

          <TituloTutorial>
            Devolução não é correção
          </TituloTutorial>

          <TextoTutorial>
            Utilize Devolução quando o material
            realmente saiu do depósito e depois
            retornou. Se o problema for uma diferença
            entre o saldo registrado e a quantidade
            física encontrada, utilize a operação
            Correção.
          </TextoTutorial>

          <TituloTutorial>
            3. Perda / Descarte
          </TituloTutorial>

          <TextoTutorial>
            A operação Perda/Descarte é utilizada para
            registrar material perdido, inutilizado,
            deteriorado ou descartado, reduzindo o
            saldo físico correspondente.
          </TextoTutorial>

          <Passos>
            <li>
              Selecione{' '}
              <strong>Perda / Descarte</strong>.
            </li>

            <li>
              Escolha o saldo físico correspondente ao
              gênero, local e lote afetados.
            </li>

            <li>
              Confira o saldo disponível.
            </li>

            <li>
              Informe a{' '}
              <strong>quantidade da perda</strong>.
            </li>

            <li>
              Informe obrigatoriamente o{' '}
              <strong>motivo</strong>.
            </li>

            <li>
              Confirme a perda ou descarte.
            </li>
          </Passos>

          <Aviso>
            A quantidade da perda não pode ser superior
            ao saldo físico disponível. O motivo é
            obrigatório e a operação fica registrada
            para rastreabilidade e auditoria.
          </Aviso>

          <TituloTutorial>
            4. Correção de estoque
          </TituloTutorial>

          <TextoTutorial>
            A Correção é utilizada para ajustar
            diferenças identificadas entre o saldo
            registrado no sistema e o estoque físico
            realmente existente.
          </TextoTutorial>

          <Passos>
            <li>
              Selecione{' '}
              <strong>Correção</strong>.
            </li>

            <li>
              Escolha o saldo físico que precisa ser
              corrigido.
            </li>

            <li>
              Confira gênero, classe, local, lote e
              quantidade atual.
            </li>

            <li>
              Em <strong>Valor do ajuste</strong>,
              informe o valor da diferença.
            </li>

            <li>
              Utilize um valor{' '}
              <strong>positivo</strong> para acrescentar
              quantidade ao saldo.
            </li>

            <li>
              Utilize um valor{' '}
              <strong>negativo</strong> para reduzir o
              saldo.
            </li>

            <li>
              Informe obrigatoriamente o{' '}
              <strong>motivo da correção</strong>.
            </li>

            <li>
              Confira e confirme a operação.
            </li>
          </Passos>

          <Aviso tipo="informacao">
            Exemplo: se o sistema registra 100 kg, mas
            a conferência física identifica 103 kg, o
            ajuste será <strong>+3</strong>. Se a
            conferência física identificar 95 kg, o
            ajuste será <strong>-5</strong>.
          </Aviso>

          <Aviso>
            A correção nunca pode resultar em saldo
            negativo. O sistema preserva o lançamento
            original e registra a correção
            separadamente, incluindo o saldo anterior,
            o ajuste, o saldo resultante, o motivo e o
            responsável.
          </Aviso>

          <TituloTutorial>
            5. Cancelar saída
          </TituloTutorial>

          <TextoTutorial>
            O cancelamento é utilizado quando uma saída
            confirmada precisa ser anulada. A saída não
            é apagada: permanece registrada no
            histórico e recebe a identificação de
            cancelamento.
          </TextoTutorial>

          <Passos>
            <li>
              Selecione{' '}
              <strong>Cancelar saída</strong>.
            </li>

            <li>
              Escolha a saída que será cancelada.
            </li>

            <li>
              Confira o número, a classe, o destino e
              os itens da saída selecionada.
            </li>

            <li>
              Informe obrigatoriamente o{' '}
              <strong>motivo do cancelamento</strong>.
            </li>

            <li>
              Confirme o cancelamento.
            </li>
          </Passos>

          <Aviso tipo="informacao">
            Ao cancelar, o sistema realiza a
            movimentação inversa e recompõe as
            quantidades exatamente nos mesmos gêneros,
            lotes e locais utilizados pela saída
            original. O registro da saída é preservado
            para auditoria.
          </Aviso>

          <Aviso>
            Uma saída que já possui devolução não pode
            ser cancelada diretamente, pois isso
            poderia recompor o estoque duas vezes.
            Nessa situação, a regularização deve ser
            realizada por correção, preservando o
            histórico.
          </Aviso>

          <TituloTutorial>
            Qual operação utilizar?
          </TituloTutorial>

          <div
            style={{
              display: 'grid',
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
                color: '#4e493e',
                fontSize: '12px',
                lineHeight: 1.5,
              }}
            >
              <strong style={{ color: '#294735' }}>
                ↔ Transferência
              </strong>
              <br />
              O material continua no estoque, mas muda
              de local de armazenamento.
            </div>

            <div
              style={{
                padding: '11px',
                borderRadius: '11px',
                background: 'rgba(55, 86, 61, .08)',
                border:
                  '1px solid rgba(55, 86, 61, .18)',
                color: '#4e493e',
                fontSize: '12px',
                lineHeight: 1.5,
              }}
            >
              <strong style={{ color: '#294735' }}>
                ↩ Devolução
              </strong>
              <br />
              O material saiu regularmente e depois
              retornou ao depósito.
            </div>

            <div
              style={{
                padding: '11px',
                borderRadius: '11px',
                background: 'rgba(167, 121, 61, .08)',
                border:
                  '1px solid rgba(167, 121, 61, .20)',
                color: '#4e493e',
                fontSize: '12px',
                lineHeight: 1.5,
              }}
            >
              <strong style={{ color: '#79562f' }}>
                ⚠ Perda / Descarte
              </strong>
              <br />
              O material deixou de estar disponível por
              perda, inutilização ou descarte.
            </div>

            <div
              style={{
                padding: '11px',
                borderRadius: '11px',
                background: 'rgba(55, 86, 61, .08)',
                border:
                  '1px solid rgba(55, 86, 61, .18)',
                color: '#4e493e',
                fontSize: '12px',
                lineHeight: 1.5,
              }}
            >
              <strong style={{ color: '#294735' }}>
                ± Correção
              </strong>
              <br />
              O saldo do sistema está diferente da
              quantidade física encontrada.
            </div>

            <div
              style={{
                padding: '11px',
                borderRadius: '11px',
                background: 'rgba(167, 121, 61, .08)',
                border:
                  '1px solid rgba(167, 121, 61, .20)',
                color: '#4e493e',
                fontSize: '12px',
                lineHeight: 1.5,
              }}
            >
              <strong style={{ color: '#79562f' }}>
                × Cancelar saída
              </strong>
              <br />
              A própria saída foi lançada
              indevidamente e precisa ser anulada.
            </div>
          </div>

          <TituloTutorial>
            Rastreabilidade
          </TituloTutorial>

          <TextoTutorial>
            As operações deste módulo não devem apagar
            silenciosamente o histórico. Transferências,
            perdas, correções, devoluções e
            cancelamentos geram movimentações que
            permitem compreender posteriormente o que
            aconteceu com o saldo.
          </TextoTutorial>

          <Aviso>
            Antes de confirmar qualquer ajuste, confira
            o gênero, o lote, o local e a quantidade.
            Principalmente em correções, perdas e
            cancelamentos, registre um motivo claro que
            permita compreender a operação futuramente.
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
