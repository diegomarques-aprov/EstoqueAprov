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
          </Passos>

          <TituloTutorial>Lote e validade</TituloTutorial>

          <TextoTutorial>
            Os campos de lote e validade aparecem de acordo com as
            regras definidas no cadastro do gênero.
          </TextoTutorial>

          <Aviso tipo="informacao">
            Para gêneros FLV configurados sem controle por lote, o
            sistema não solicitará essa informação.
          </Aviso>

          <Aviso>
            Antes de registrar o saldo inicial real, faça a conferência
            física do material.
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
            A consulta permite visualizar a situação atual dos gêneros
            disponíveis no Estoque Aprov, separadamente entre QS e QR.
          </TextoTutorial>

          <TituloTutorial>Como consultar</TituloTutorial>

          <Passos>
            <li>
              Na tela <strong>Início</strong>, acesse{' '}
              <strong>Consultar estoque</strong>.
            </li>
            <li>Escolha QS ou QR.</li>
            <li>Localize o grupo.</li>
            <li>Localize a categoria.</li>
            <li>Localize o gênero.</li>
            <li>Confira saldo e unidade de medida.</li>
            <li>Verifique o local de armazenamento.</li>
            <li>Quando houver, confira lote e validade.</li>
          </Passos>

          <Aviso tipo="informacao">
            Os totais respeitam a unidade de medida cadastrada.
          </Aviso>

          <Aviso>
            Antes de movimentar material, confira gênero, local e lote,
            especialmente para correta aplicação do PVPS.
          </Aviso>
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
            Registra as entradas normais de gêneros após a implantação
            do sistema.
          </TextoTutorial>

          <Passos>
            <li>Acesse Novo recebimento.</li>
            <li>Selecione QS ou QR.</li>
            <li>Informe a data.</li>
            <li>Informe a origem.</li>
            <li>Informe documento, quando houver.</li>
            <li>Selecione o gênero.</li>
            <li>Informe a quantidade.</li>
            <li>Selecione o local.</li>
            <li>Informe lote e validade quando exigidos.</li>
            <li>Informe valor unitário quando disponível.</li>
            <li>Use + Adicionar para outros gêneros.</li>
            <li>Toque em Revisar recebimento.</li>
            <li>Confira os dados.</li>
            <li>Confirme.</li>
          </Passos>

          <Aviso tipo="informacao">
            O estoque somente é atualizado quando o recebimento é
            confirmado.
          </Aviso>

          <Aviso>
            Confira cuidadosamente lote e validade, pois são utilizados
            na rastreabilidade e no PVPS.
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
            Registra a retirada física dos materiais do estoque.
          </TextoTutorial>

          <Passos>
            <li>Acesse Saída de gêneros.</li>
            <li>Escolha QS ou QR.</li>
            <li>Selecione o destino.</li>
            <li>Confira a data.</li>
            <li>Selecione Grupo, Categoria e Gênero.</li>
            <li>Confira o saldo.</li>
            <li>Informe a quantidade.</li>
            <li>Adicione outros gêneros quando necessário.</li>
            <li>Revise e confirme.</li>
          </Passos>

          <TituloTutorial>PVPS</TituloTutorial>

          <TextoTutorial>
            Para materiais controlados por validade, a baixa segue a
            prioridade dos lotes aplicáveis, preservando o princípio
            Primeiro que Vence, Primeiro que Sai.
          </TextoTutorial>

          <Aviso>
            Não é possível confirmar quantidade superior ao saldo
            disponível.
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
            Reúne os procedimentos de Transferência, Devolução,
            Perda/Descarte, Correção e Cancelamento de saída.
          </TextoTutorial>

          <TituloTutorial>Transferência</TituloTutorial>

          <TextoTutorial>
            Utilize quando o material continua no estoque, mas muda de
            local.
          </TextoTutorial>

          <TituloTutorial>Devolução</TituloTutorial>

          <TextoTutorial>
            Utilize quando material de uma saída retorna fisicamente ao
            depósito.
          </TextoTutorial>

          <TituloTutorial>Perda / Descarte</TituloTutorial>

          <TextoTutorial>
            Utilize para material perdido, deteriorado, inutilizado ou
            descartado.
          </TextoTutorial>

          <TituloTutorial>Correção</TituloTutorial>

          <TextoTutorial>
            Utilize para ajustar diferenças entre o saldo do sistema e o
            estoque físico.
          </TextoTutorial>

          <TituloTutorial>Cancelar saída</TituloTutorial>

          <TextoTutorial>
            A saída permanece registrada no histórico como cancelada e o
            estoque é recomposto.
          </TextoTutorial>

          <Aviso>
            Utilize sempre a operação correspondente ao fato que
            realmente ocorreu.
          </Aviso>
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
            Permite registrar o efetivo previsto, aplicar margem de
            segurança e posteriormente registrar o efetivo realmente
            atendido.
          </TextoTutorial>

          <TituloTutorial>Planejamento</TituloTutorial>

          <Passos>
            <li>Acesse Efetivo alimentado.</li>
            <li>Informe a data.</li>
            <li>Selecione a refeição.</li>
            <li>Informe o efetivo previsto.</li>
            <li>Confira a margem de segurança.</li>
            <li>Confira o efetivo considerado para planejamento.</li>
            <li>Registre o arranchamento.</li>
          </Passos>

          <TituloTutorial>Fechamento Diário</TituloTutorial>

          <Passos>
            <li>Acesse Fechamento Diário.</li>
            <li>Selecione a data.</li>
            <li>Informe o efetivo realmente alimentado.</li>
            <li>Informe faltas.</li>
            <li>Informe militares não arranchados atendidos.</li>
            <li>Informe a sobra pesada total.</li>
            <li>Confira o resumo e confirme.</li>
          </Passos>

          <Aviso>
            A sobra do Fechamento Diário não substitui a devolução física
            de gênero ao depósito.
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
            Consolida movimentações, efetivo, refeições, estoque e
            alertas operacionais.
          </TextoTutorial>

          <Passos>
            <li>Acesse Relatórios.</li>
            <li>Informe data inicial.</li>
            <li>Informe data final.</li>
            <li>Escolha QS + QR, QS ou QR.</li>
            <li>Selecione as informações desejadas.</li>
            <li>Toque em Visualizar relatório.</li>
            <li>Exporte em PDF ou Excel quando necessário.</li>
          </Passos>

          <TituloTutorial>Alertas</TituloTutorial>

          <TextoTutorial>
            Os relatórios identificam estoque baixo, estoque zerado,
            validade próxima e lotes vencidos com saldo.
          </TextoTutorial>

          <Aviso>
            Os alertas de estoque são sempre incluídos no relatório.
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
            Reúne o acompanhamento mensal dos gêneros QS e o
            planejamento das necessidades para a Cadeia de Suprimento.
          </TextoTutorial>

          <Aviso>
            O <strong>QDAA é mensal</strong>. O{' '}
            <strong>Ressuprimento QS normal é bimestral</strong>, com
            ciclo fixo de 2 meses.
          </Aviso>

          <TituloTutorial>Apoio ao QDAA</TituloTutorial>

          <TextoTutorial>
            Consolida mensalmente os dados dos gêneros QS registrados no
            Estoque Aprov.
          </TextoTutorial>

          <Passos>
            <li>Acesse QDAA / Ressuprimento QS.</li>
            <li>Selecione Apoio ao QDAA.</li>
            <li>Selecione mês e ano.</li>
            <li>Toque em Gerar QDAA.</li>
            <li>Confira os gêneros e suas movimentações.</li>
          </Passos>

          <TituloTutorial>Planejamento de Ressuprimento QS</TituloTutorial>

          <TextoTutorial>
            Calcula a necessidade estimada para o próximo ciclo normal
            de dois meses.
          </TextoTutorial>

          <Passos>
            <li>Acesse Planejamento de Ressuprimento QS.</li>
            <li>Escolha o período histórico.</li>
            <li>Confira a margem de segurança.</li>
            <li>Resolva referências pendentes.</li>
            <li>Confira a sugestão do Estoque Aprov.</li>
            <li>Informe a quantidade planejada.</li>
            <li>Justifique alterações quando necessário.</li>
            <li>Salve como rascunho ou finalize.</li>
          </Passos>

          <Aviso>
            O histórico de 1, 2, 3 ou 6 meses serve para calcular a média
            de consumo. Ele não altera o ciclo normal de 2 meses.
          </Aviso>

          <TituloTutorial>Referência de Consumo QS</TituloTutorial>

          <TextoTutorial>
            Quando não existe histórico suficiente, informe uma
            referência mensal ou bimestral para o gênero.
          </TextoTutorial>

          <TituloTutorial>Histórico de Ressuprimentos</TituloTutorial>

          <TextoTutorial>
            Permite consultar os planejamentos registrados, parâmetros,
            memória de cálculo, quantidades e justificativas.
          </TextoTutorial>

          <TituloTutorial>Ressuprimento Complementar</TituloTutorial>

          <TextoTutorial>
            É utilizado excepcionalmente dentro de um ciclo bimestral
            quando surge necessidade adicional de determinado gênero.
          </TextoTutorial>

          <Aviso>
            O complementar não cria novo ciclo e não altera o
            planejamento original.
          </Aviso>

          <Aviso>
            O Ressuprimento Complementar não movimenta estoque. Quando o
            material chegar fisicamente, a entrada deverá ser registrada
            em <strong>Novo recebimento</strong>.
          </Aviso>
        </Tutorial>

        {/* 10. LOCAIS DE ARMAZENAMENTO */}

        <Tutorial
          id="locais-armazenamento"
          icone="🏬"
          titulo="Locais de armazenamento"
          subtitulo="Cadastro e manutenção dos locais físicos onde os gêneros são armazenados."
        >
          <TituloTutorial>Para que serve</TituloTutorial>

          <TextoTutorial>
            O cadastro de Locais de armazenamento identifica os espaços
            físicos utilizados para guardar os gêneros alimentícios do
            Aprovisionamento.
          </TextoTutorial>

          <TextoTutorial>
            Esses locais são utilizados pelo Estoque Aprov para indicar
            onde cada quantidade se encontra fisicamente, permitindo
            organizar e rastrear corretamente os saldos.
          </TextoTutorial>

          <TituloTutorial>Exemplos de locais</TituloTutorial>

          <div
            style={{
              display: 'grid',
              gap: '8px',
              marginTop: '10px',
            }}
          >
            <Quadro titulo="Câmara de Resfriamento">
              Pode ser utilizada para armazenamento de hortifrutigranjeiros
              e outros gêneros que necessitem refrigeração.
            </Quadro>

            <Quadro titulo="Depósito">
              Pode representar uma área física destinada aos gêneros
              armazenados em temperatura ambiente.
            </Quadro>

            <Quadro titulo="Outros locais">
              Novos locais podem ser cadastrados de acordo com a
              organização física existente na OM.
            </Quadro>
          </div>

          <TituloTutorial>Quem pode cadastrar</TituloTutorial>

          <TextoTutorial>
            O cadastro e a alteração dos locais são procedimentos
            administrativos. O sistema exige permissão de Administrador
            para criar ou editar esses registros.
          </TextoTutorial>

          <TituloTutorial>Como cadastrar um novo local</TituloTutorial>

          <Passos>
            <li>
              Na tela <strong>Início</strong>, localize a área de
              configurações administrativas.
            </li>

            <li>
              Acesse <strong>Locais</strong>.
            </li>

            <li>
              Na área <strong>Novo local</strong>, informe o{' '}
              <strong>Nome do local</strong>.
            </li>

            <li>
              No campo <strong>Descrição</strong>, registre uma
              informação que facilite a identificação ou indique a
              finalidade do espaço.
            </li>

            <li>
              Confira as informações.
            </li>

            <li>
              Toque em <strong>Adicionar local</strong>.
            </li>

            <li>
              Aguarde a confirmação de que o local foi cadastrado com
              sucesso.
            </li>
          </Passos>

          <TituloTutorial>Nome do local</TituloTutorial>

          <TextoTutorial>
            Utilize um nome claro e correspondente ao espaço físico
            realmente existente. O nome deve permitir que o usuário
            identifique facilmente onde o material está armazenado.
          </TextoTutorial>

          <Aviso>
            O sistema não permite cadastrar dois locais com o mesmo
            nome. Se já existir um registro com a mesma identificação,
            será necessário utilizar o local existente ou corrigir o
            cadastro.
          </Aviso>

          <TituloTutorial>Descrição</TituloTutorial>

          <TextoTutorial>
            A descrição é utilizada para complementar a identificação do
            local. Ela pode informar, por exemplo, o tipo de material
            normalmente armazenado naquele espaço.
          </TextoTutorial>

          <Aviso tipo="informacao">
            Exemplo: para o local{' '}
            <strong>Câmara de Resfriamento</strong>, a descrição pode
            indicar <strong>Armazenamento de hortifruti / FLV</strong>.
          </Aviso>

          <TituloTutorial>Onde o local será utilizado</TituloTutorial>

          <TextoTutorial>
            Depois de cadastrado, o local poderá ser utilizado em
            diferentes pontos do Estoque Aprov.
          </TextoTutorial>

          <div
            style={{
              display: 'grid',
              gap: '8px',
              marginTop: '10px',
            }}
          >
            <Quadro titulo="📦 Estoque inicial">
              Identifica onde o saldo existente está fisicamente
              armazenado no momento da implantação.
            </Quadro>

            <Quadro titulo="↓ Recebimentos">
              Define o local para onde o gênero recebido será
              direcionado.
            </Quadro>

            <Quadro titulo="🏷 Local habitual do gênero">
              Pode ser utilizado como referência padrão no cadastro do
              gênero ou de sua categoria.
            </Quadro>

            <Quadro titulo="↔ Movimentações">
              Permite identificar a origem e o destino nas transferências
              entre locais.
            </Quadro>

            <Quadro titulo="🔎 Consulta de estoque">
              Permite visualizar em qual local cada quantidade está
              armazenada.
            </Quadro>
          </div>

          <TituloTutorial>Consultar locais cadastrados</TituloTutorial>

          <Passos>
            <li>
              Na tela de Locais, toque em{' '}
              <strong>Ver locais cadastrados</strong>.
            </li>

            <li>
              O sistema apresentará a quantidade de locais cadastrados.
            </li>

            <li>
              Consulte o nome, a descrição e a situação de cada local.
            </li>

            <li>
              Para recolher a relação, utilize{' '}
              <strong>Ocultar locais cadastrados</strong>.
            </li>
          </Passos>

          <TituloTutorial>Editar um local</TituloTutorial>

          <TextoTutorial>
            Quando for necessário corrigir o nome ou atualizar a
            descrição de um local existente, utilize a função de edição.
          </TextoTutorial>

          <Passos>
            <li>
              Abra <strong>Ver locais cadastrados</strong>.
            </li>

            <li>
              Localize o registro desejado.
            </li>

            <li>
              Toque em <strong>Editar local</strong>.
            </li>

            <li>
              Altere o <strong>Nome</strong> ou a{' '}
              <strong>Descrição</strong>.
            </li>

            <li>
              Toque em <strong>Salvar</strong>.
            </li>

            <li>
              Caso não queira manter a alteração, toque em{' '}
              <strong>Cancelar</strong>.
            </li>
          </Passos>

          <Aviso tipo="informacao">
            A edição altera a identificação do local já existente. Ela
            não representa uma movimentação física de material.
          </Aviso>

          <TituloTutorial>Local e estoque físico</TituloTutorial>

          <TextoTutorial>
            O local registrado no sistema deve corresponder ao local
            onde o material realmente se encontra. Essa correspondência
            é importante para a conferência do depósito e para a
            rastreabilidade das movimentações.
          </TextoTutorial>

          <Aviso>
            Se um gênero for transferido fisicamente de um local para
            outro, não altere apenas o cadastro do local. Utilize o
            procedimento de <strong>Transferência</strong> em{' '}
            <strong>Devoluções e ajustes</strong>, para que a
            movimentação fique registrada corretamente.
          </Aviso>

          <TituloTutorial>Local habitual</TituloTutorial>

          <TextoTutorial>
            Um local cadastrado também pode ser definido como local
            habitual de uma categoria ou gênero. Isso facilita o
            preenchimento das operações em que o sistema pode sugerir
            automaticamente o local normalmente utilizado.
          </TextoTutorial>

          <Aviso tipo="informacao">
            O local habitual funciona como referência operacional. A
            localização efetiva do saldo continua sendo determinada
            pelas movimentações realizadas no estoque.
          </Aviso>

          <TituloTutorial>Boas práticas</TituloTutorial>

          <Passos>
            <li>
              Cadastre somente locais físicos realmente utilizados.
            </li>

            <li>
              Utilize nomes simples e padronizados.
            </li>

            <li>
              Evite criar dois nomes diferentes para o mesmo espaço
              físico.
            </li>

            <li>
              Utilize a descrição para facilitar a identificação quando
              necessário.
            </li>

            <li>
              Sempre que houver movimentação física entre locais,
              registre a transferência no sistema.
            </li>
          </Passos>

          <Aviso>
            A organização correta dos locais é essencial para que o saldo
            apresentado pelo Estoque Aprov corresponda à disposição
            física dos gêneros no depósito.
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
