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

        <div style={{ flex: 1, minWidth: 0 }}>
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
            transform: aberto ? 'rotate(180deg)' : 'rotate(0deg)',
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
  const informacao = tipo === 'informacao';

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
          color: informacao ? '#294735' : '#79562f',
        }}
      >
        {informacao ? 'ℹ Informação: ' : '⚠ Atenção: '}
      </strong>

      {children}
    </div>
  );
}

function Quadro({
  titulo,
  children,
  destaque = false,
}: {
  titulo: string;
  children: React.ReactNode;
  destaque?: boolean;
}) {
  return (
    <div
      style={{
        padding: '11px',
        borderRadius: '11px',
        background: destaque
          ? 'rgba(167, 121, 61, .08)'
          : 'rgba(55, 86, 61, .08)',
        border: destaque
          ? '1px solid rgba(167, 121, 61, .20)'
          : '1px solid rgba(55, 86, 61, .18)',
        color: '#4e493e',
        fontSize: '12px',
        lineHeight: 1.5,
      }}
    >
      <strong
        style={{
          color: destaque ? '#79562f' : '#294735',
        }}
      >
        {titulo}
      </strong>

      <br />

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
          Selecione abaixo o procedimento sobre o qual deseja
          orientação. Cada item apresenta sua finalidade, forma de
          utilização e cuidados importantes durante a operação.
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
        {/* 1. PAINEL DE AVISOS */}

        <Tutorial
          id="painel-avisos"
          icone="⚠"
          titulo="Painel de Avisos"
          subtitulo="Alertas, pendências e lembretes operacionais."
        >
          <TituloTutorial>Para que serve</TituloTutorial>

          <TextoTutorial>
            O Painel de Avisos concentra informações que podem exigir
            providências antes ou durante as atividades do
            Aprovisionamento. Sua finalidade é facilitar o
            acompanhamento diário das principais pendências do sistema.
          </TextoTutorial>

          <TituloTutorial>Quando consultar</TituloTutorial>

          <TextoTutorial>
            Recomenda-se consultar o Painel de Avisos diariamente,
            especialmente no início das atividades, para verificar se
            existe alguma situação que precise ser regularizada ou
            acompanhada.
          </TextoTutorial>

          <TituloTutorial>O que o painel verifica</TituloTutorial>

          <Passos>
            <li>
              <strong>Conferência FLV:</strong> permite acompanhar a
              conferência diária dos gêneros classificados como FLV.
            </li>

            <li>
              <strong>Fechamento diário pendente:</strong> informa
              quando existem dias anteriores com refeições cujo
              fechamento do efetivo alimentado ainda não foi realizado.
            </li>

            <li>
              <strong>Efetivo de amanhã:</strong> verifica se o efetivo
              previsto para o dia seguinte já foi informado.
            </li>

            <li>
              <strong>Estoque abaixo do mínimo:</strong> identifica
              gêneros cujo saldo total está abaixo do estoque mínimo
              definido no cadastro.
            </li>

            <li>
              <strong>Validade próxima:</strong> alerta sobre lotes com
              saldo que vencem em até 30 dias.
            </li>

            <li>
              <strong>Lotes vencidos:</strong> informa a existência de
              lotes vencidos que ainda possuem saldo registrado.
            </li>

            <li>
              <strong>Cardápio semanal:</strong> na sexta-feira,
              apresenta ao Administrador o lembrete para verificar e
              cadastrar o cardápio da próxima semana.
            </li>

            <li>
              <strong>QDAA:</strong> entre os dias 23 e 25, apresenta ao
              Administrador o lembrete para a realização do QDAA mensal,
              com referência ao prazo do dia 25.
            </li>
          </Passos>

          <TituloTutorial>Como utilizar</TituloTutorial>

          <Passos>
            <li>
              Na tela <strong>Início</strong>, localize o{' '}
              <strong>Painel de Avisos</strong>.
            </li>

            <li>
              Toque em <strong>Consultar avisos</strong>.
            </li>

            <li>
              Verifique os alertas e pendências apresentados.
            </li>

            <li>
              Quando houver um botão de ação, utilize-o para acessar
              diretamente o procedimento correspondente.
            </li>

            <li>
              Após regularizar a situação, consulte novamente o painel
              para acompanhar o estado operacional atualizado.
            </li>
          </Passos>

          <Aviso tipo="informacao">
            Quando nenhuma das pendências monitoradas estiver ativa e o
            efetivo de amanhã já estiver informado, o sistema apresenta
            a indicação de que nenhuma outra pendência operacional foi
            identificada naquele momento.
          </Aviso>

          <Aviso>
            Os avisos dependem das informações cadastradas no sistema.
            Manter estoque, efetivo, fechamentos, validade, cardápio e
            demais registros atualizados é essencial para que os alertas
            sejam úteis.
          </Aviso>
        </Tutorial>

        {/* 2. ESTOQUE INICIAL */}

        <Tutorial
          id="estoque-inicial"
          icone="📦"
          titulo="Estoque inicial"
          subtitulo="Implantação dos saldos existentes no depósito."
        >
          <TituloTutorial>Para que serve</TituloTutorial>

          <TextoTutorial>
            O Estoque Inicial é utilizado para registrar no sistema os
            gêneros que já existem fisicamente no depósito no momento da
            implantação do Estoque Aprov.
          </TextoTutorial>

          <TituloTutorial>Quando utilizar</TituloTutorial>

          <TextoTutorial>
            Esse procedimento deve ser utilizado na implantação do
            estoque, para que o saldo registrado no sistema corresponda
            ao material que já se encontra fisicamente armazenado.
          </TextoTutorial>

          <Aviso>
            Depois que o estoque inicial estiver implantado, as entradas
            normais de novos gêneros devem ser registradas no módulo{' '}
            <strong>Novo recebimento</strong>. Não utilize Estoque
            Inicial como rotina normal de entrada de material.
          </Aviso>

          <TituloTutorial>Quem pode acessar</TituloTutorial>

          <TextoTutorial>
            O módulo está disponível para os perfis de Administrador
            Principal, Administrador e Chefe do Depósito.
          </TextoTutorial>

          <TituloTutorial>Antes de começar</TituloTutorial>

          <TextoTutorial>
            O gênero, sua unidade de medida e o local de armazenamento
            precisam estar previamente cadastrados. As exigências de
            lote e validade também são determinadas pelo cadastro do
            gênero.
          </TextoTutorial>

          <TituloTutorial>Passo a passo</TituloTutorial>

          <Passos>
            <li>
              Na tela <strong>Início</strong>, acesse{' '}
              <strong>Estoque inicial</strong>.
            </li>

            <li>
              Escolha a classe do material: <strong>QS</strong> para
              gêneros da Cadeia de Suprimento ou <strong>QR</strong>{' '}
              para gêneros de Compra Local.
            </li>

            <li>
              No campo <strong>Gênero</strong>, selecione o item que será
              lançado.
            </li>

            <li>
              Confira a unidade de medida apresentada pelo sistema e as
              informações sobre controle de lote e validade.
            </li>

            <li>
              Selecione o <strong>Local de armazenamento</strong> onde o
              gênero se encontra fisicamente.
            </li>

            <li>
              Informe a <strong>Quantidade</strong> existente,
              respeitando a unidade de medida cadastrada para o gênero.
            </li>

            <li>
              Se o gênero possuir controle de lote, informe o{' '}
              <strong>Lote</strong>.
            </li>

            <li>
              Se o gênero possuir controle de validade, informe a{' '}
              <strong>Validade</strong>.
            </li>

            <li>Confira todas as informações antes de concluir.</li>

            <li>
              Toque em <strong>Registrar saldo inicial</strong>.
            </li>

            <li>
              Aguarde a mensagem{' '}
              <strong>“Saldo inicial registrado com sucesso.”</strong>
            </li>
          </Passos>

          <TituloTutorial>QS e QR</TituloTutorial>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
              gap: '8px',
              marginTop: '8px',
            }}
          >
            <Quadro titulo="QS">Cadeia de suprimento</Quadro>
            <Quadro titulo="QR">Compra local</Quadro>
          </div>

          <TituloTutorial>Lote e validade</TituloTutorial>

          <TextoTutorial>
            Os campos de lote e validade aparecem de acordo com as
            regras definidas no cadastro do gênero. Se o gênero não
            exigir controle de lote, esse campo não será solicitado.
          </TextoTutorial>

          <Aviso tipo="informacao">
            Para gêneros FLV configurados sem controle por lote, o
            sistema não solicitará essa informação durante o registro do
            saldo inicial.
          </Aviso>

          <TituloTutorial>Resultado do lançamento</TituloTutorial>

          <TextoTutorial>
            Após a confirmação, a quantidade informada passa a compor o
            saldo inicial do gênero no local de armazenamento
            selecionado.
          </TextoTutorial>

          <Aviso>
            Antes de registrar o saldo inicial real, faça a conferência
            física do material. Quantidade, local, lote e validade,
            quando aplicáveis, devem corresponder ao que realmente
            existe no depósito.
          </Aviso>
        </Tutorial>

        {/* 3. CONSULTAR ESTOQUE */}

        <Tutorial
          id="consultar-estoque"
          icone="🔎"
          titulo="Consultar estoque"
          subtitulo="Consulta dos saldos disponíveis por gênero, local e lote."
        >
          <TituloTutorial>Para que serve</TituloTutorial>

          <TextoTutorial>
            A consulta de estoque permite visualizar a situação atual
            dos gêneros disponíveis no Estoque Aprov. Os saldos são
            apresentados separadamente entre QS e QR.
          </TextoTutorial>

          <TituloTutorial>Como consultar</TituloTutorial>

          <Passos>
            <li>
              Na tela <strong>Início</strong>, acesse{' '}
              <strong>Consultar estoque</strong>.
            </li>

            <li>
              Escolha a classe: <strong>QS</strong> ou{' '}
              <strong>QR</strong>.
            </li>

            <li>Aguarde o carregamento dos saldos registrados.</li>

            <li>
              Localize o <strong>grupo</strong> ao qual pertence o
              gênero.
            </li>

            <li>
              Dentro do grupo, localize a <strong>categoria</strong>.
            </li>

            <li>
              Localize o <strong>gênero</strong>.
            </li>

            <li>
              Confira o saldo total e a unidade de medida.
            </li>

            <li>
              Verifique a distribuição por{' '}
              <strong>local de armazenamento</strong>.
            </li>

            <li>
              Quando houver controle de lote, confira o{' '}
              <strong>lote</strong> e a <strong>validade</strong>.
            </li>
          </Passos>

          <TituloTutorial>Organização da consulta</TituloTutorial>

          <TextoTutorial>
            O sistema organiza os registros em grupo, categoria, gênero
            e local de armazenamento. Quando o gênero possuir controle
            por lote, cada saldo também poderá ser identificado pelo
            lote correspondente.
          </TextoTutorial>

          <Aviso tipo="informacao">
            Os totais respeitam a unidade de medida cadastrada. O
            sistema evita somar diretamente unidades de natureza
            diferente.
          </Aviso>

          <TituloTutorial>Saldo por gênero</TituloTutorial>

          <TextoTutorial>
            O valor destacado ao lado do gênero representa a soma das
            quantidades disponíveis daquele gênero, respeitando sua
            unidade de medida.
          </TextoTutorial>

          <TituloTutorial>Local e lote</TituloTutorial>

          <TextoTutorial>
            Um mesmo gênero pode possuir saldo em diferentes locais ou
            lotes. Por isso, além do total geral, a tela detalha onde
            cada quantidade está armazenada.
          </TextoTutorial>

          <Aviso>
            Antes de realizar movimentações, confira gênero, local e
            lote. Essa verificação é especialmente importante para a
            correta aplicação do PVPS.
          </Aviso>

          <TituloTutorial>Quando não houver saldo</TituloTutorial>

          <TextoTutorial>
            Caso não existam gêneros com quantidade disponível, o
            sistema apresentará a mensagem{' '}
            <strong>“Nenhum saldo registrado”</strong>.
          </TextoTutorial>
        </Tutorial>

        {/* 4. NOVO RECEBIMENTO */}

        <Tutorial
          id="novo-recebimento"
          icone="↓"
          titulo="Novo recebimento"
          subtitulo="Entrada de novos gêneros QS ou QR no estoque."
        >
          <TituloTutorial>Para que serve</TituloTutorial>

          <TextoTutorial>
            O módulo Novo recebimento registra as entradas normais de
            gêneros após a implantação do sistema. As quantidades
            confirmadas são acrescentadas aos saldos existentes.
          </TextoTutorial>

          <Aviso tipo="informacao">
            O Estoque Inicial registra o que já existia no depósito. O
            Novo recebimento é utilizado para as entradas realizadas
            durante a operação normal.
          </Aviso>

          <TituloTutorial>Antes de começar</TituloTutorial>

          <TextoTutorial>
            Os gêneros e locais utilizados precisam estar cadastrados e
            ativos. O gênero deve pertencer à mesma classe QS ou QR
            selecionada para o recebimento.
          </TextoTutorial>

          <TituloTutorial>Passo a passo</TituloTutorial>

          <Passos>
            <li>
              Na tela <strong>Início</strong>, acesse{' '}
              <strong>Novo recebimento</strong>.
            </li>

            <li>
              Selecione <strong>QS</strong> ou <strong>QR</strong>.
            </li>

            <li>Confira ou informe a data do recebimento.</li>

            <li>
              Em <strong>Origem</strong>, informe a procedência quando
              aplicável. Para QS, por exemplo, poderá ser informado o B
              Sup. Para QR, poderá ser informado o fornecedor.
            </li>

            <li>
              Informe o <strong>Documento</strong>, quando houver.
            </li>

            <li>
              Utilize <strong>Observação</strong> quando necessário.
            </li>

            <li>Selecione o gênero recebido.</li>

            <li>
              Informe a <strong>quantidade</strong>.
            </li>

            <li>
              Selecione o <strong>local de armazenamento</strong>. O
              local padrão poderá ser preenchido automaticamente.
            </li>

            <li>
              Informe lote e validade quando exigidos pelo gênero.
            </li>

            <li>
              Informe o <strong>valor unitário</strong> quando essa
              informação estiver disponível.
            </li>

            <li>
              Para outros gêneros, toque em{' '}
              <strong>+ Adicionar</strong>.
            </li>

            <li>
              Toque em <strong>Revisar recebimento</strong>.
            </li>

            <li>Confira todos os dados.</li>

            <li>
              Para corrigir, toque em <strong>Voltar e editar</strong>.
            </li>

            <li>
              Estando correto, toque em <strong>Confirmar</strong>.
            </li>
          </Passos>

          <TituloTutorial>Mais de um gênero</TituloTutorial>

          <TextoTutorial>
            Um único recebimento pode conter vários gêneros. O botão{' '}
            <strong>+ Adicionar</strong> cria novos itens dentro da mesma
            entrada.
          </TextoTutorial>

          <TituloTutorial>Lote e validade</TituloTutorial>

          <TextoTutorial>
            Lote e validade são solicitados conforme a configuração de
            cada gênero.
          </TextoTutorial>

          <Aviso>
            Confira cuidadosamente lote e validade. Essas informações
            serão utilizadas na rastreabilidade e no PVPS.
          </Aviso>

          <TituloTutorial>Valor unitário</TituloTutorial>

          <TextoTutorial>
            O sistema permite informar o valor unitário de cada item e
            apresenta o valor total informado para a entrada.
          </TextoTutorial>

          <TituloTutorial>Revisão antes da entrada</TituloTutorial>

          <TextoTutorial>
            Revisar recebimento não efetiva a entrada. A etapa permite
            uma última conferência antes da confirmação definitiva.
          </TextoTutorial>

          <Aviso tipo="informacao">
            O estoque somente é atualizado quando o recebimento é
            confirmado.
          </Aviso>

          <TituloTutorial>Após confirmar</TituloTutorial>

          <TextoTutorial>
            O sistema cria o recebimento, registra seus itens,
            acrescenta as quantidades aos respectivos saldos e registra
            as movimentações para rastreabilidade.
          </TextoTutorial>

          <Aviso tipo="informacao">
            Após a conclusão, o sistema informa o número do recebimento
            e confirma que o estoque foi atualizado.
          </Aviso>

          <Aviso>
            Se ocorrer uma falha, o sistema não deve concluir apenas
            parte da operação. A entrada é processada conjuntamente para
            preservar a consistência do estoque.
          </Aviso>
        </Tutorial>

        {/* 5. SAÍDA DE GÊNEROS */}

        <Tutorial
          id="saida-generos"
          icone="↑"
          titulo="Saída de gêneros"
          subtitulo="Baixa dos materiais liberados para consumo ou utilização."
        >
          <TituloTutorial>Para que serve</TituloTutorial>

          <TextoTutorial>
            O módulo registra a retirada física dos materiais do
            estoque. Ao confirmar, as quantidades são baixadas e a
            movimentação fica registrada para rastreabilidade.
          </TextoTutorial>

          <TituloTutorial>Passo a passo</TituloTutorial>

          <Passos>
            <li>
              Na tela <strong>Início</strong>, acesse{' '}
              <strong>Saída de gêneros</strong>.
            </li>

            <li>
              Escolha <strong>QS</strong> ou <strong>QR</strong>.
            </li>

            <li>
              Selecione o <strong>Destino da saída</strong>.
            </li>

            <li>Confira ou informe a data.</li>

            <li>Registre observação quando necessário.</li>

            <li>Selecione Grupo, Categoria e Gênero.</li>

            <li>Confira o saldo disponível.</li>

            <li>Informe a quantidade a liberar.</li>

            <li>
              Para incluir outros gêneros, toque em{' '}
              <strong>+ Adicionar</strong>.
            </li>

            <li>Revise a saída.</li>

            <li>Confira destino, data, gêneros e quantidades.</li>

            <li>Confirme a saída.</li>
          </Passos>

          <TituloTutorial>Destinos disponíveis</TituloTutorial>

          <TextoTutorial>
            A saída pode ser identificada como Café da manhã, Almoço,
            Jantar, Ceia, Serviço do dia seguinte ou Outro.
          </TextoTutorial>

          <Aviso tipo="informacao">
            Serviço do dia seguinte identifica material retirado
            antecipadamente. A movimentação física permanece registrada
            no momento real em que o material sai do estoque.
          </Aviso>

          <TituloTutorial>Saldo disponível</TituloTutorial>

          <TextoTutorial>
            O sistema consulta o estoque da classe selecionada e
            apresenta o saldo disponível para cada gênero.
          </TextoTutorial>

          <Aviso>
            Não é possível confirmar quantidade superior ao saldo
            disponível. Gêneros sem estoque não podem ser liberados.
          </Aviso>

          <TituloTutorial>Estoque mínimo</TituloTutorial>

          <TextoTutorial>
            Quando houver estoque mínimo cadastrado, o sistema pode
            sinalizar saldo abaixo desse nível.
          </TextoTutorial>

          <TituloTutorial>Mais de um gênero</TituloTutorial>

          <TextoTutorial>
            Uma saída pode conter diversos gêneros. Cada gênero deve ser
            incluído uma única vez.
          </TextoTutorial>

          <TituloTutorial>PVPS</TituloTutorial>

          <TextoTutorial>
            Para materiais controlados por validade, a baixa segue a
            prioridade dos lotes aplicáveis, preservando o princípio
            PVPS — Primeiro que Vence, Primeiro que Sai.
          </TextoTutorial>

          <Aviso>
            Lote vencido ou bloqueado para consumo não deve ser
            considerado como quantidade válida para saída normal.
          </Aviso>

          <TituloTutorial>Após a confirmação</TituloTutorial>

          <TextoTutorial>
            O sistema registra a saída, seus itens e as movimentações
            físicas nos respectivos lotes e locais. O estoque é
            atualizado automaticamente.
          </TextoTutorial>

          <Aviso tipo="informacao">
            O sistema informa o número da saída após a conclusão.
          </Aviso>
        </Tutorial>

        {/* 6. DEVOLUÇÕES E AJUSTES */}

        <Tutorial
          id="devolucoes-ajustes"
          icone="↺"
          titulo="Devoluções e ajustes"
          subtitulo="Transferências, devoluções, perdas, correções e cancelamentos."
        >
          <TituloTutorial>Para que serve</TituloTutorial>

          <TextoTutorial>
            O módulo reúne cinco procedimentos distintos:
            Transferência, Devolução, Perda/Descarte, Correção e Cancelar
            saída.
          </TextoTutorial>

          <Aviso>
            Utilize sempre o procedimento correspondente ao fato que
            realmente ocorreu. Cada operação possui efeitos e registros
            diferentes no histórico.
          </Aviso>

          <TituloTutorial>1. Transferência</TituloTutorial>

          <TextoTutorial>
            Utilize quando o material permanece no estoque, mas muda de
            local de armazenamento.
          </TextoTutorial>

          <Passos>
            <li>Selecione Transferência.</li>
            <li>Escolha o saldo físico.</li>
            <li>Selecione o local de destino.</li>
            <li>Informe a quantidade.</li>
            <li>Registre observação quando necessário.</li>
            <li>Confira e confirme.</li>
          </Passos>

          <Aviso tipo="informacao">
            A transferência mantém o mesmo gênero e lote. A quantidade
            sai do local de origem e é acrescentada ao destino.
          </Aviso>

          <Aviso>
            O destino deve estar ativo e ser diferente da origem. A
            quantidade não pode superar o saldo disponível.
          </Aviso>

          <TituloTutorial>2. Devolução ao depósito</TituloTutorial>

          <TextoTutorial>
            Utilize quando parte ou todo o material de uma saída
            confirmada retorna fisicamente ao depósito.
          </TextoTutorial>

          <Passos>
            <li>Selecione Devolução.</li>
            <li>Selecione a saída original.</li>
            <li>Selecione o gênero devolvido.</li>
            <li>Confira a quantidade liberada.</li>
            <li>Informe a quantidade devolvida.</li>
            <li>Informe observação quando necessário.</li>
            <li>Confirme.</li>
          </Passos>

          <Aviso tipo="informacao">
            A devolução recompõe o estoque no gênero, lote e local de
            onde o material havia sido retirado.
          </Aviso>

          <Aviso>
            Não é possível devolver quantidade superior ao que ainda
            pode ser devolvido daquela saída.
          </Aviso>

          <TituloTutorial>Devolução não é correção</TituloTutorial>

          <TextoTutorial>
            Use Devolução quando o material realmente saiu e retornou.
            Se houver diferença entre saldo registrado e estoque físico,
            utilize Correção.
          </TextoTutorial>

          <TituloTutorial>3. Perda / Descarte</TituloTutorial>

          <TextoTutorial>
            Utilize para registrar material perdido, inutilizado,
            deteriorado ou descartado.
          </TextoTutorial>

          <Passos>
            <li>Selecione Perda / Descarte.</li>
            <li>Escolha o saldo físico.</li>
            <li>Confira o saldo disponível.</li>
            <li>Informe a quantidade da perda.</li>
            <li>Informe obrigatoriamente o motivo.</li>
            <li>Confirme.</li>
          </Passos>

          <Aviso>
            A perda não pode superar o saldo físico disponível. O motivo
            é obrigatório e a operação fica registrada.
          </Aviso>

          <TituloTutorial>4. Correção de estoque</TituloTutorial>

          <TextoTutorial>
            Utilize para ajustar diferenças entre o saldo do sistema e o
            estoque físico realmente existente.
          </TextoTutorial>

          <Passos>
            <li>Selecione Correção.</li>
            <li>Escolha o saldo físico.</li>
            <li>Confira gênero, classe, local, lote e saldo atual.</li>
            <li>Informe o valor do ajuste.</li>
            <li>Valor positivo acrescenta quantidade.</li>
            <li>Valor negativo reduz quantidade.</li>
            <li>Informe obrigatoriamente o motivo.</li>
            <li>Confirme.</li>
          </Passos>

          <Aviso tipo="informacao">
            Exemplo: saldo registrado de 100 kg e estoque físico de 103
            kg = ajuste +3. Estoque físico de 95 kg = ajuste -5.
          </Aviso>

          <Aviso>
            A correção nunca pode resultar em saldo negativo. O sistema
            preserva o histórico do ajuste e seu responsável.
          </Aviso>

          <TituloTutorial>5. Cancelar saída</TituloTutorial>

          <TextoTutorial>
            Utilize quando uma saída confirmada precisa ser anulada. A
            saída não é apagada: permanece registrada no histórico como
            cancelada.
          </TextoTutorial>

          <Passos>
            <li>Selecione Cancelar saída.</li>
            <li>Escolha a saída.</li>
            <li>Confira número, classe, destino e itens.</li>
            <li>Informe obrigatoriamente o motivo.</li>
            <li>Confirme.</li>
          </Passos>

          <Aviso tipo="informacao">
            O cancelamento recompõe as quantidades nos mesmos gêneros,
            lotes e locais utilizados pela saída original.
          </Aviso>

          <Aviso>
            Uma saída que já possui devolução não pode ser cancelada
            diretamente, evitando recomposição duplicada do estoque.
          </Aviso>

          <TituloTutorial>Qual operação utilizar?</TituloTutorial>

          <div
            style={{
              display: 'grid',
              gap: '8px',
              marginTop: '8px',
            }}
          >
            <Quadro titulo="↔ Transferência">
              Material continua no estoque, mas muda de local.
            </Quadro>

            <Quadro titulo="↩ Devolução">
              Material saiu regularmente e depois retornou ao depósito.
            </Quadro>

            <Quadro titulo="⚠ Perda / Descarte" destaque>
              Material deixou de estar disponível por perda,
              inutilização ou descarte.
            </Quadro>

            <Quadro titulo="± Correção">
              Saldo do sistema está diferente da quantidade física.
            </Quadro>

            <Quadro titulo="× Cancelar saída" destaque>
              A própria saída foi lançada indevidamente e precisa ser
              anulada.
            </Quadro>
          </div>

          <TituloTutorial>Rastreabilidade</TituloTutorial>

          <TextoTutorial>
            Transferências, perdas, correções, devoluções e cancelamentos
            geram movimentações que permitem compreender posteriormente
            o que aconteceu com o saldo.
          </TextoTutorial>
        </Tutorial>

        {/* 7. EFETIVO ALIMENTADO */}

        <Tutorial
          id="efetivo-alimentado"
          icone="👥"
          titulo="Efetivo alimentado"
          subtitulo="Planejamento do efetivo e fechamento diário das refeições."
        >
          <TituloTutorial>Para que serve</TituloTutorial>

          <TextoTutorial>
            O módulo Efetivo alimentado permite registrar o efetivo
            previsto para cada refeição, calcular uma margem de
            segurança para o planejamento do saque e, posteriormente,
            realizar o fechamento do serviço com os quantitativos
            realmente atendidos.
          </TextoTutorial>

          <Aviso tipo="informacao">
            O módulo trabalha em duas etapas: primeiro é realizado o
            planejamento do efetivo da refeição; depois, após a
            realização do serviço, é feito o Fechamento Diário.
          </Aviso>

          <TituloTutorial>Quem pode acessar</TituloTutorial>

          <TextoTutorial>
            O módulo está disponível para Administrador Principal,
            Administrador e Graduado de Serviço.
          </TextoTutorial>

          <TituloTutorial>1. Planejamento do efetivo</TituloTutorial>

          <TextoTutorial>
            O planejamento registra o efetivo arranchado previsto e
            fornece a quantidade de refeições que deverá ser considerada
            para o planejamento do saque dos gêneros.
          </TextoTutorial>

          <Passos>
            <li>
              Na tela <strong>Início</strong>, acesse{' '}
              <strong>Efetivo alimentado</strong>.
            </li>

            <li>
              Informe a <strong>Data da refeição</strong>. Inicialmente,
              o sistema sugere o dia seguinte.
            </li>

            <li>
              Selecione a <strong>Refeição</strong>.
            </li>

            <li>
              Informe o efetivo previsto por categoria:{' '}
              <strong>Of / STen / Sgt</strong>, <strong>Cb / Sd</strong>{' '}
              e <strong>Outros</strong>.
            </li>

            <li>
              Caso possua apenas o quantitativo total, marque{' '}
              <strong>Informar somente o total de arranchados</strong>.
            </li>

            <li>
              Nesse caso, informe diretamente o{' '}
              <strong>Total de militares arranchados</strong>.
            </li>

            <li>
              Confira o <strong>Efetivo arranchado previsto</strong>{' '}
              calculado pelo sistema.
            </li>

            <li>
              Informe ou confira a{' '}
              <strong>Margem de segurança (%)</strong>.
            </li>

            <li>
              Observe o{' '}
              <strong>Efetivo considerado para planejamento</strong>.
            </li>

            <li>Registre observação quando necessário.</li>

            <li>
              Toque em <strong>Relacionar efetivo arranchado</strong>.
            </li>
          </Passos>

          <TituloTutorial>
            Efetivo por categoria ou total
          </TituloTutorial>

          <TextoTutorial>
            Quando os quantitativos por categoria estiverem disponíveis,
            informe-os separadamente e o sistema realizará a soma
            automaticamente. Quando somente o total estiver disponível,
            utilize a opção de lançamento direto.
          </TextoTutorial>

          <Aviso>
            Para registrar o arranchamento é necessário informar um
            efetivo previsto superior a zero.
          </Aviso>

          <TituloTutorial>Margem de segurança</TituloTutorial>

          <TextoTutorial>
            A margem de segurança é aplicada sobre o efetivo previsto
            para produzir o quantitativo utilizado no planejamento. O
            sistema calcula automaticamente esse valor e apresenta o
            resultado antes do registro.
          </TextoTutorial>

          <Aviso tipo="informacao">
            O sistema inicia o campo de margem de segurança em 10%, mas
            o percentual pode ser ajustado conforme a necessidade do
            planejamento.
          </Aviso>

          <TituloTutorial>Planejamento do saque</TituloTutorial>

          <TextoTutorial>
            O efetivo considerado para planejamento é utilizado como
            referência para o planejamento das refeições e dos gêneros
            necessários. A tela orienta que o saque seja planejado para
            ocorrer até as 15:00 do dia anterior.
          </TextoTutorial>

          <TituloTutorial>Arranchamentos da data</TituloTutorial>

          <TextoTutorial>
            A parte inferior da tela apresenta os arranchamentos já
            relacionados para a data selecionada, permitindo acompanhar
            quais refeições já possuem planejamento registrado.
          </TextoTutorial>

          <TituloTutorial>2. Fechamento Diário</TituloTutorial>

          <TextoTutorial>
            Depois que as refeições forem realizadas, deve ser
            registrado o que efetivamente ocorreu durante o serviço.
          </TextoTutorial>

          <Passos>
            <li>
              Dentro de <strong>Efetivo alimentado</strong>, acesse{' '}
              <strong>Fechamento Diário</strong>.
            </li>

            <li>Selecione a data do serviço.</li>

            <li>
              Confira as refeições previamente relacionadas para a data.
            </li>

            <li>
              Para cada refeição, informe o efetivo realmente alimentado.
            </li>

            <li>
              Informe as <strong>faltas</strong>.
            </li>

            <li>
              Informe os{' '}
              <strong>militares não arranchados atendidos</strong>{' '}
              quando houver.
            </li>

            <li>
              Confira o total de atendimentos calculado.
            </li>

            <li>
              Informe a <strong>sobra pesada total do serviço</strong>{' '}
              em quilogramas.
            </li>

            <li>Registre observação geral quando necessário.</li>

            <li>
              Confira o <strong>Resumo do dia</strong>.
            </li>

            <li>Confirme o fechamento do serviço.</li>
          </Passos>

          <TituloTutorial>Militares de fora</TituloTutorial>

          <TextoTutorial>
            O campo permite registrar pessoas atendidas na refeição que
            não constavam no arranchamento previsto. Esses militares são
            considerados no total efetivamente atendido.
          </TextoTutorial>

          <TituloTutorial>Sobra do serviço</TituloTutorial>

          <TextoTutorial>
            A sobra deve representar a quantidade pesada ao final do
            serviço e é registrada em quilogramas.
          </TextoTutorial>

          <Aviso>
            A sobra informada no Fechamento Diário não deve ser
            confundida com devolução física de gênero ao depósito.
            Quando material efetivamente retornar ao estoque, utilize o
            procedimento de Devolução.
          </Aviso>

          <TituloTutorial>Resumo do dia</TituloTutorial>

          <TextoTutorial>
            O fechamento consolida os dados das refeições e apresenta o
            total de atendimentos do dia e a sobra pesada total do
            serviço.
          </TextoTutorial>

          <Aviso tipo="informacao">
            O Painel de Avisos utiliza essas informações para identificar
            dias anteriores com fechamento pendente.
          </Aviso>

          <Aviso>
            O fechamento deve refletir o serviço realmente executado.
            Confira os quantitativos antes de confirmar, pois essas
            informações serão utilizadas nos relatórios.
          </Aviso>
        </Tutorial>

        {/* 8. RELATÓRIOS */}

        <Tutorial
          id="relatorios"
          icone="📊"
          titulo="Relatórios"
          subtitulo="Consulta, consolidação e exportação das informações operacionais."
        >
          <TituloTutorial>Para que serve</TituloTutorial>

          <TextoTutorial>
            O módulo Relatórios consolida informações registradas no
            Estoque Aprov para permitir a consulta das movimentações, do
            efetivo, das refeições, da posição atual do estoque e dos
            alertas operacionais.
          </TextoTutorial>

          <TituloTutorial>Como gerar um relatório</TituloTutorial>

          <Passos>
            <li>
              Na tela <strong>Início</strong>, acesse{' '}
              <strong>Relatórios</strong>.
            </li>

            <li>
              Informe a <strong>Data inicial</strong>.
            </li>

            <li>
              Informe a <strong>Data final</strong>.
            </li>

            <li>
              Escolha a classe: <strong>QS + QR</strong>,{' '}
              <strong>QS</strong> ou <strong>QR</strong>.
            </li>

            <li>
              Em <strong>O que incluir no relatório</strong>, marque ou
              desmarque as informações desejadas.
            </li>

            <li>
              Toque em <strong>Visualizar relatório</strong>.
            </li>

            <li>Analise as informações apresentadas.</li>

            <li>
              Para gerar arquivo, utilize <strong>PDF</strong> ou{' '}
              <strong>Excel</strong>.
            </li>
          </Passos>

          <Aviso>
            A data inicial não pode ser posterior à data final. O
            sistema exige um período válido.
          </Aviso>

          <TituloTutorial>Classe do relatório</TituloTutorial>

          <TextoTutorial>
            O filtro permite visualizar conjuntamente QS e QR ou
            restringir a consulta a apenas uma dessas classes.
          </TextoTutorial>

          <TituloTutorial>O que incluir</TituloTutorial>

          <TextoTutorial>
            O usuário pode selecionar as seções que deseja visualizar e
            exportar.
          </TextoTutorial>

          <div
            style={{
              display: 'grid',
              gap: '8px',
              marginTop: '10px',
            }}
          >
            <Quadro titulo="👥 Efetivo por refeição">
              Previsto, alimentado, faltas e militares de fora.
            </Quadro>

            <Quadro titulo="🍽 Refeições relacionadas">
              Refeições identificadas pelas saídas registradas.
            </Quadro>

            <Quadro titulo="↓ Entradas">
              Recebimentos registrados no período.
            </Quadro>

            <Quadro titulo="↑ Saídas">
              Consumo e destinação dos gêneros.
            </Quadro>

            <Quadro titulo="↩ Devoluções">
              Materiais devolvidos ao estoque.
            </Quadro>

            <Quadro titulo="📦 Posição do estoque">
              Saldo atual organizado por grupo e categoria.
            </Quadro>
          </div>

          <TituloTutorial>Posição do estoque</TituloTutorial>

          <TextoTutorial>
            A posição apresenta os gêneros ativos e seus saldos atuais,
            organizados por grupo e categoria. Os totais respeitam as
            respectivas unidades de medida.
          </TextoTutorial>

          <Aviso tipo="informacao">
            Quantidades com unidades diferentes não devem ser
            interpretadas como um único total. O sistema organiza os
            totais por unidade.
          </Aviso>

          <TituloTutorial>
            Movimentações e rastreabilidade
          </TituloTutorial>

          <TextoTutorial>
            Os dados são formados a partir das movimentações registradas
            no sistema, incluindo saldo inicial, recebimentos, saídas,
            devoluções, perdas, correções e transferências.
          </TextoTutorial>

          <TextoTutorial>
            O histórico também preserva as informações relacionadas aos
            cancelamentos de saída, mantendo a rastreabilidade.
          </TextoTutorial>

          <Aviso tipo="informacao">
            Uma saída cancelada permanece no histórico, mas o sistema
            diferencia essa situação das saídas operacionais válidas
            para evitar distorção dos totais.
          </Aviso>

          <TituloTutorial>Efetivo no relatório</TituloTutorial>

          <TextoTutorial>
            Quando Efetivo por refeição estiver marcado, o relatório
            utiliza os registros de arranchamento e fechamento para
            apresentar previsto, alimentado, faltas, militares de fora,
            total atendido e sobra.
          </TextoTutorial>

          <TituloTutorial>Alertas de estoque</TituloTutorial>

          <TextoTutorial>
            A seção de alertas identifica situações como estoque abaixo
            do mínimo, estoque zerado, validade próxima e lotes vencidos
            que ainda possuem saldo.
          </TextoTutorial>

          <Aviso>
            Os alertas de estoque são sempre incluídos no relatório,
            mesmo que outras seções sejam desmarcadas.
          </Aviso>

          <TituloTutorial>Exportação</TituloTutorial>

          <TextoTutorial>
            Depois de definir período, classe e informações desejadas, o
            relatório pode ser exportado em <strong>PDF</strong> ou{' '}
            <strong>Excel</strong>. As opções marcadas também são
            consideradas na exportação.
          </TextoTutorial>

          <Aviso tipo="informacao">
            O PDF é indicado para visualização, impressão e
            encaminhamento. O Excel permite trabalhar posteriormente com
            os dados em formato de planilha.
          </Aviso>

          <TituloTutorial>Conferência dos dados</TituloTutorial>

          <TextoTutorial>
            Como os relatórios utilizam os registros dos demais módulos,
            a qualidade do resultado depende da atualização correta do
            estoque, recebimentos, saídas, devoluções, ajustes, efetivo e
            fechamento diário.
          </TextoTutorial>

          <Aviso>
            Antes de utilizar um relatório como documento de apoio à
            decisão, confira o período, a classe selecionada e as seções
            incluídas.
          </Aviso>
        </Tutorial>

        {/* 9. QDAA / RESSUPRIMENTO QS */}

        <Tutorial
          id="qdaa-ressuprimento-qs"
          icone="▤"
          titulo="QDAA / Ressuprimento QS"
          subtitulo="Controle mensal do QDAA e planejamento bimestral do Ressuprimento QS."
        >
          <TituloTutorial>Para que serve</TituloTutorial>

          <TextoTutorial>
            O módulo QDAA / Ressuprimento QS reúne os procedimentos de
            acompanhamento mensal dos gêneros QS e de planejamento das
            necessidades para o ressuprimento normal da Cadeia de
            Suprimento.
          </TextoTutorial>

          <Aviso>
            O <strong>QDAA é mensal</strong>. O{' '}
            <strong>Ressuprimento QS normal é bimestral</strong>, com
            ciclo fixo de 2 meses. São procedimentos relacionados, mas
            possuem periodicidades diferentes.
          </Aviso>

          <TituloTutorial>Opções do módulo</TituloTutorial>

          <TextoTutorial>
            Ao acessar QDAA / Ressuprimento QS, o sistema apresenta três
            áreas principais.
          </TextoTutorial>

          <div
            style={{
              display: 'grid',
              gap: '8px',
              marginTop: '10px',
            }}
          >
            <Quadro titulo="▤ Apoio ao QDAA">
              Consolidação mensal e controle dos gêneros QS.
            </Quadro>

            <Quadro titulo="⇄ Planejamento de Ressuprimento QS">
              Cálculo das necessidades para o próximo ciclo normal de 2
              meses.
            </Quadro>

            <Quadro titulo="◷ Histórico de Ressuprimentos">
              Consulta dos planejamentos QS registrados e acesso aos
              ressuprimentos complementares.
            </Quadro>
          </div>

          <TituloTutorial>1. Apoio ao QDAA — mensal</TituloTutorial>

          <TextoTutorial>
            O Apoio ao QDAA consolida mensalmente os dados dos gêneros
            QS registrados no Estoque Aprov.
          </TextoTutorial>

          <Passos>
            <li>
              Na tela <strong>Início</strong>, acesse{' '}
              <strong>QDAA / Ressuprimento QS</strong>.
            </li>

            <li>
              Selecione <strong>Apoio ao QDAA</strong>.
            </li>

            <li>
              Em <strong>Período do QDAA</strong>, selecione o mês.
            </li>

            <li>Informe ou confira o ano.</li>

            <li>
              Toque em <strong>Gerar QDAA</strong>.
            </li>

            <li>
              Confira os indicadores de gêneros{' '}
              <strong>Cadastrados</strong>,{' '}
              <strong>Com movimento</strong> e{' '}
              <strong>Sem movimento</strong>.
            </li>

            <li>
              Na relação de gêneros QS, toque no gênero que deseja
              consultar.
            </li>

            <li>
              Confira os dados mensais apresentados pelo sistema.
            </li>
          </Passos>

          <TituloTutorial>Dados mensais por gênero</TituloTutorial>

          <TextoTutorial>
            Para cada gênero QS, o sistema apresenta as informações
            utilizadas na consolidação do período, permitindo acompanhar
            o comportamento do estoque durante o mês.
          </TextoTutorial>

          <div
            style={{
              display: 'grid',
              gap: '8px',
              marginTop: '10px',
            }}
          >
            <Quadro titulo="Estoque inicial">
              Quantidade considerada no início do período.
            </Quadro>

            <Quadro titulo="Entradas">
              Recebimentos registrados durante o mês.
            </Quadro>

            <Quadro titulo="Devoluções">
              Quantidades que retornaram ao estoque.
            </Quadro>

            <Quadro titulo="Consumo">
              Quantidades consumidas no período.
            </Quadro>

            <Quadro titulo="Perdas">
              Quantidades registradas como perda ou descarte.
            </Quadro>

            <Quadro titulo="Ajustes">
              Correções de estoque registradas no período.
            </Quadro>

            <Quadro titulo="Estoque final" destaque>
              Saldo final calculado para o gênero no período consultado.
            </Quadro>
          </div>

          <Aviso tipo="informacao">
            O QDAA utiliza os registros existentes no Estoque Aprov.
            Portanto, recebimentos, saídas, devoluções, perdas e
            correções precisam estar corretamente lançados para que a
            consolidação mensal represente a realidade.
          </Aviso>

          <Aviso>
            A realização mensal do QDAA não cria um novo ciclo de
            ressuprimento. O ciclo normal de Ressuprimento QS continua
            sendo de 2 meses.
          </Aviso>

          <TituloTutorial>
            2. Planejamento de Ressuprimento QS
          </TituloTutorial>

          <TextoTutorial>
            O planejamento calcula a necessidade estimada dos gêneros QS
            para o próximo ciclo normal de ressuprimento, que é sempre
            bimestral.
          </TextoTutorial>

          <Passos>
            <li>
              Em <strong>QDAA / Ressuprimento QS</strong>, acesse{' '}
              <strong>Planejamento de Ressuprimento QS</strong>.
            </li>

            <li>
              Em <strong>Parâmetros</strong>, escolha o período de
              histórico que deseja utilizar no cálculo.
            </li>

            <li>
              Informe ou confira a{' '}
              <strong>Margem de segurança</strong>.
            </li>

            <li>
              Aguarde o cálculo das necessidades dos gêneros QS.
            </li>

            <li>
              Verifique se existem{' '}
              <strong>Referências pendentes</strong>.
            </li>

            <li>
              Quando houver pendências, informe as referências antes de
              concluir o planejamento.
            </li>

            <li>
              Analise o planejamento apresentado para cada gênero.
            </li>

            <li>
              Confira a quantidade sugerida pelo Estoque Aprov.
            </li>

            <li>
              Informe ou mantenha a{' '}
              <strong>Quantidade planejada</strong>.
            </li>

            <li>
              Caso altere a quantidade sugerida, informe a justificativa.
            </li>

            <li>
              Registre uma observação geral quando necessário.
            </li>

            <li>
              Utilize <strong>Salvar rascunho</strong> se ainda não
              desejar encerrar o planejamento.
            </li>

            <li>
              Quando tudo estiver conferido, toque em{' '}
              <strong>Finalizar</strong>.
            </li>
          </Passos>

          <TituloTutorial>
            Histórico utilizado no cálculo
          </TituloTutorial>

          <TextoTutorial>
            O sistema permite utilizar períodos de histórico de 1, 2, 3
            ou 6 meses para determinar a média de consumo utilizada no
            cálculo.
          </TextoTutorial>

          <Aviso>
            O número de meses escolhido para o{' '}
            <strong>histórico de consumo</strong> não altera a duração
            do ciclo de ressuprimento. O ressuprimento normal permanece
            sempre com <strong>2 meses — Bimestral</strong>.
          </Aviso>

          <TituloTutorial>Margem de segurança</TituloTutorial>

          <TextoTutorial>
            A margem de segurança é utilizada pelo cálculo para
            acrescentar uma reserva à necessidade projetada. Ela pode
            ser ajustada antes da elaboração do planejamento.
          </TextoTutorial>

          <TituloTutorial>
            Informações calculadas por gênero
          </TituloTutorial>

          <TextoTutorial>
            Ao abrir um gênero no planejamento, o sistema apresenta a
            memória utilizada para apoiar a decisão.
          </TextoTutorial>

          <div
            style={{
              display: 'grid',
              gap: '8px',
              marginTop: '10px',
            }}
          >
            <Quadro titulo="Média mensal">
              Média de consumo utilizada como base para a projeção.
            </Quadro>

            <Quadro titulo="Projeção 2 meses">
              Consumo projetado para o ciclo normal bimestral.
            </Quadro>

            <Quadro titulo="Estoque de segurança">
              Quantidade correspondente à margem de segurança aplicada.
            </Quadro>

            <Quadro titulo="Estoque disponível">
              Saldo considerado pelo sistema no momento do cálculo.
            </Quadro>

            <Quadro titulo="Previsto receber">
              Quantidade já considerada como prevista para recebimento,
              quando aplicável.
            </Quadro>

            <Quadro titulo="Sugestão EstoqueAprov" destaque>
              Quantidade calculada pelo sistema como necessidade para o
              próximo ressuprimento.
            </Quadro>
          </div>

          <TituloTutorial>Quantidade planejada</TituloTutorial>

          <TextoTutorial>
            A sugestão do Estoque Aprov serve como apoio. O responsável
            pode manter a quantidade sugerida ou informar outra
            quantidade planejada.
          </TextoTutorial>

          <Aviso>
            Sempre que a <strong>Quantidade planejada</strong> for
            diferente da <strong>Sugestão EstoqueAprov</strong>, o
            sistema exige uma justificativa para preservar a
            rastreabilidade da decisão.
          </Aviso>

          <TituloTutorial>3. Referência de Consumo QS</TituloTutorial>

          <TextoTutorial>
            Quando um gênero QS ainda não possui histórico suficiente
            para que o Estoque Aprov determine sua base de cálculo, ele
            aparece na área de <strong>Referências pendentes</strong>.
          </TextoTutorial>

          <Passos>
            <li>
              No planejamento, localize{' '}
              <strong>Referências pendentes</strong>.
            </li>

            <li>
              Toque em <strong>Informar referência</strong> no gênero
              desejado.
            </li>

            <li>
              Confira o gênero e sua unidade de medida.
            </li>

            <li>
              Escolha o tipo da referência:{' '}
              <strong>Mensal</strong> ou <strong>Bimestral</strong>.
            </li>

            <li>
              Informe uma quantidade maior que zero.
            </li>

            <li>
              Registre uma observação quando necessário.
            </li>

            <li>
              Toque em <strong>Salvar referência</strong>.
            </li>
          </Passos>

          <Aviso tipo="informacao">
            A observação pode indicar a origem utilizada para estabelecer
            a referência, como dados de controle anterior da OM.
          </Aviso>

          <TextoTutorial>
            Depois que uma referência é salva, o sistema atualiza o
            cálculo. Havendo outra referência pendente, o fluxo pode
            avançar para o próximo gênero. Quando não houver mais
            pendências, o usuário retorna ao planejamento.
          </TextoTutorial>

          <Aviso>
            Enquanto existirem gêneros QS sem base de cálculo, o
            planejamento não poderá ser finalizado integralmente.
          </Aviso>

          <TituloTutorial>Salvar rascunho</TituloTutorial>

          <TextoTutorial>
            O planejamento pode ser salvo como rascunho enquanto ainda
            estiver em elaboração. Isso permite registrar o trabalho sem
            transformá-lo imediatamente em planejamento finalizado.
          </TextoTutorial>

          <TituloTutorial>Finalização do planejamento</TituloTutorial>

          <TextoTutorial>
            Após conferir todos os gêneros e resolver as referências
            pendentes, utilize <strong>Finalizar</strong> para registrar
            definitivamente o planejamento bimestral.
          </TextoTutorial>

          <Aviso>
            Antes da finalização, o sistema solicita confirmação. Depois
            de finalizado, o planejamento fica preservado no histórico e
            não poderá ser alterado como um planejamento em elaboração.
          </Aviso>

          <TituloTutorial>
            4. Histórico de Ressuprimentos
          </TituloTutorial>

          <TextoTutorial>
            O Histórico de Ressuprimentos permite consultar os
            planejamentos QS registrados anteriormente e verificar os
            parâmetros e decisões utilizados em cada ciclo.
          </TextoTutorial>

          <Passos>
            <li>
              Em <strong>QDAA / Ressuprimento QS</strong>, acesse{' '}
              <strong>Histórico de Ressuprimentos</strong>.
            </li>

            <li>
              Consulte a relação de planejamentos registrados.
            </li>

            <li>
              Toque em <strong>Abrir planejamento</strong>.
            </li>

            <li>
              Confira a data de referência.
            </li>

            <li>
              Confira o histórico considerado no cálculo.
            </li>

            <li>
              Confira o ciclo planejado.
            </li>

            <li>
              Confira a margem de segurança utilizada.
            </li>

            <li>
              Consulte a memória do cálculo e as quantidades planejadas
              por gênero.
            </li>

            <li>
              Consulte as justificativas das alterações, quando houver.
            </li>

            <li>
              Verifique os ressuprimentos complementares vinculados ao
              planejamento.
            </li>
          </Passos>

          <Aviso tipo="informacao">
            O histórico preserva as informações administrativas do
            planejamento, permitindo identificar os parâmetros
            utilizados e o responsável pelo registro.
          </Aviso>

          <TituloTutorial>
            5. Ressuprimento Complementar QS
          </TituloTutorial>

          <TextoTutorial>
            O Ressuprimento Complementar é utilizado quando surge,
            durante um ciclo normal de 2 meses, uma necessidade
            extraordinária de complementar determinado gênero QS.
          </TextoTutorial>

          <TextoTutorial>
            Isso pode ocorrer, por exemplo, quando a quantidade recebida
            foi inferior à planejada, houve necessidade inesperada,
            ocorreu correção de dados ou outra situação operacional
            justificável.
          </TextoTutorial>

          <Aviso>
            O Ressuprimento Complementar{' '}
            <strong>não cria um novo ciclo bimestral</strong> e{' '}
            <strong>não altera o planejamento original</strong>. Ele é
            registrado separadamente e permanece vinculado ao ciclo
            normal já finalizado.
          </Aviso>

          <TituloTutorial>Como registrar um complementar</TituloTutorial>

          <Passos>
            <li>
              Abra um planejamento bimestral já{' '}
              <strong>Finalizado</strong>.
            </li>

            <li>
              Toque em{' '}
              <strong>+ Ressuprimento complementar</strong> ou utilize{' '}
              <strong>Ver / registrar complementar</strong> pelo
              histórico.
            </li>

            <li>
              Confira o planejamento normal ao qual o complementar será
              vinculado.
            </li>

            <li>
              Em <strong>Gêneros para complementar</strong>, selecione
              apenas os gêneros necessários.
            </li>

            <li>
              Informe a quantidade complementar de cada gênero
              selecionado.
            </li>

            <li>
              Informe obrigatoriamente a{' '}
              <strong>Justificativa</strong>.
            </li>

            <li>
              Confira os dados.
            </li>

            <li>
              Toque em <strong>+ Registrar complementar</strong>.
            </li>
          </Passos>

          <Aviso tipo="informacao">
            Somente gêneros que já faziam parte do planejamento
            bimestral original podem ser incluídos naquele ressuprimento
            complementar.
          </Aviso>

          <Aviso tipo="informacao">
            É possível registrar mais de um Ressuprimento Complementar
            durante o mesmo ciclo bimestral, quando houver necessidade
            operacional devidamente justificada.
          </Aviso>

          <TituloTutorial>
            Complementar não movimenta o estoque
          </TituloTutorial>

          <TextoTutorial>
            O registro do Ressuprimento Complementar representa a
            necessidade adicional de suprimento. Ele não significa que o
            material já chegou fisicamente ao depósito.
          </TextoTutorial>

          <Aviso>
            Quando os gêneros do Ressuprimento Complementar forem
            efetivamente recebidos, a entrada física deverá ser lançada
            separadamente no módulo <strong>Novo recebimento</strong>.
            Somente o recebimento atualiza o saldo do estoque.
          </Aviso>

          <TituloTutorial>Exemplo prático</TituloTutorial>

          <TextoTutorial>
            Se o planejamento normal do ciclo previa 500 kg de arroz e
            somente 350 kg foram efetivamente fornecidos, poderá ser
            registrado um Ressuprimento Complementar de 150 kg,
            acompanhado da respectiva justificativa. O planejamento
            original de 500 kg permanece preservado.
          </TextoTutorial>

          <TituloTutorial>Resumo das periodicidades</TituloTutorial>

          <div
            style={{
              display: 'grid',
              gap: '8px',
              marginTop: '10px',
            }}
          >
            <Quadro titulo="▤ QDAA — Mensal" destaque>
              A consolidação do QDAA é realizada mês a mês.
            </Quadro>

            <Quadro titulo="⇄ Ressuprimento QS normal — Bimestral">
              O planejamento normal sempre corresponde a um ciclo de 2
              meses.
            </Quadro>

            <Quadro titulo="📈 Histórico de cálculo">
              Pode utilizar 1, 2, 3 ou 6 meses para obtenção da média de
              consumo. Isso não altera o ciclo bimestral.
            </Quadro>

            <Quadro titulo="+ Ressuprimento complementar">
              Pode ocorrer excepcionalmente dentro do ciclo de 2 meses,
              sem iniciar novo ciclo e sem alterar o planejamento
              original.
            </Quadro>
          </div>

          <Aviso>
            Para que o planejamento seja confiável, mantenha as
            movimentações do Estoque Aprov atualizadas. O cálculo depende
            da qualidade dos dados registrados no sistema.
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
        Manual do Estoque Aprov · Os demais procedimentos serão
        acrescentados progressivamente.
      </div>
    </section>
  );
}
