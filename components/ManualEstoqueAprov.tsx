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

function Titulo({
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

function Texto({
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
        marginTop: '14px',
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
}: {
  titulo: string;
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        marginTop: '8px',
        padding: '11px 12px',
        borderRadius: '11px',
        background: 'rgba(55, 86, 61, .07)',
        border: '1px solid rgba(55, 86, 61, .17)',
        color: '#4e493e',
        fontSize: '12px',
        lineHeight: 1.55,
      }}
    >
      <strong style={{ color: '#294735' }}>
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
            maxWidth: '580px',
            margin: '8px auto 0',
            color: '#5f513f',
            fontSize: '13px',
            lineHeight: 1.55,
          }}
        >
          Consulte o procedimento desejado para entender sua finalidade,
          forma correta de utilização e os principais cuidados durante
          a operação do Estoque Aprov.
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
        Operação e administração
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
          <Titulo>Para que serve</Titulo>

          <Texto>
            O Painel de Avisos reúne situações que podem exigir
            providência durante a rotina do Aprovisionamento. A consulta
            diária ajuda a identificar pendências antes que elas afetem
            o controle do estoque ou o planejamento.
          </Texto>

          <Titulo>O que pode aparecer</Titulo>

          <Passos>
            <li>Conferência diária dos gêneros FLV.</li>
            <li>Fechamentos diários ainda pendentes.</li>
            <li>Falta de registro do efetivo previsto para amanhã.</li>
            <li>Gêneros abaixo do estoque mínimo.</li>
            <li>Lotes próximos da validade ou vencidos.</li>
            <li>Lembrete para o cardápio semanal.</li>
            <li>Lembrete mensal do QDAA entre os dias 23 e 25.</li>
          </Passos>

          <Titulo>Como utilizar</Titulo>

          <Passos>
            <li>
              Na tela inicial, abra o <strong>Painel de Avisos</strong>.
            </li>
            <li>Leia os alertas apresentados.</li>
            <li>
              Quando houver uma ação disponível, acesse o procedimento
              correspondente e regularize a situação.
            </li>
            <li>
              Consulte novamente o painel para acompanhar a atualização.
            </li>
          </Passos>

          <Aviso tipo="informacao">
            Os avisos dependem dos registros existentes no sistema.
            Quanto mais atualizadas estiverem as informações, mais útil
            será o painel.
          </Aviso>
        </Tutorial>

        {/* 2. ESTOQUE INICIAL */}

        <Tutorial
          id="estoque-inicial"
          icone="📦"
          titulo="Estoque inicial"
          subtitulo="Implantação dos saldos existentes no depósito."
        >
          <Titulo>Para que serve</Titulo>

          <Texto>
            O Estoque Inicial registra os materiais que já existem
            fisicamente no depósito quando o Estoque Aprov começa a ser
            utilizado. Ele serve para fazer o sistema partir do saldo
            real existente.
          </Texto>

          <Titulo>Antes de começar</Titulo>

          <Texto>
            O gênero, sua unidade de medida e o local de armazenamento
            precisam estar cadastrados. As exigências de lote e validade
            são determinadas pelas configurações do gênero.
          </Texto>

          <Titulo>Passo a passo</Titulo>

          <Passos>
            <li>Acesse <strong>Estoque inicial</strong>.</li>
            <li>Escolha a classe <strong>QS</strong> ou <strong>QR</strong>.</li>
            <li>Selecione o gênero.</li>
            <li>Confira sua unidade de medida.</li>
            <li>Selecione o local onde o material está armazenado.</li>
            <li>Informe a quantidade física existente.</li>
            <li>Informe lote e validade quando forem exigidos.</li>
            <li>Confira os dados e registre o saldo inicial.</li>
          </Passos>

          <Aviso>
            Estoque Inicial é procedimento de implantação. Depois disso,
            as novas entradas devem ser registradas em{' '}
            <strong>Novo recebimento</strong>.
          </Aviso>

          <Aviso tipo="informacao">
            Gêneros FLV configurados sem controle de lote não exigirão
            essa informação.
          </Aviso>
        </Tutorial>

        {/* 3. CONSULTAR ESTOQUE */}

        <Tutorial
          id="consultar-estoque"
          icone="🔎"
          titulo="Consultar estoque"
          subtitulo="Consulta dos saldos por gênero, local e lote."
        >
          <Titulo>Para que serve</Titulo>

          <Texto>
            Permite verificar quanto existe de cada gênero e onde o
            material está armazenado, mantendo a separação entre QS e
            QR.
          </Texto>

          <Titulo>Como consultar</Titulo>

          <Passos>
            <li>Acesse <strong>Consultar estoque</strong>.</li>
            <li>Escolha QS ou QR.</li>
            <li>Localize o grupo e a categoria.</li>
            <li>Localize o gênero desejado.</li>
            <li>Confira o saldo e a unidade de medida.</li>
            <li>
              Quando aplicável, confira local de armazenamento, lote e
              validade.
            </li>
          </Passos>

          <Aviso tipo="informacao">
            A separação por local e lote ajuda na conferência física e
            na aplicação do PVPS — Primeiro que Vence, Primeiro que Sai.
          </Aviso>
        </Tutorial>

        {/* 4. NOVO RECEBIMENTO */}

        <Tutorial
          id="novo-recebimento"
          icone="↓"
          titulo="Novo recebimento"
          subtitulo="Entrada normal de gêneros QS ou QR."
        >
          <Titulo>Para que serve</Titulo>

          <Texto>
            O recebimento registra a entrada física de novos materiais
            no depósito. Pode ser utilizado tanto para gêneros QS quanto
            QR.
          </Texto>

          <Titulo>Passo a passo</Titulo>

          <Passos>
            <li>Acesse <strong>Novo recebimento</strong>.</li>
            <li>Escolha QS ou QR.</li>
            <li>Informe a data do recebimento.</li>
            <li>Informe a origem do material.</li>
            <li>Informe documento e observação, quando houver.</li>
            <li>Selecione o gênero.</li>
            <li>Informe a quantidade recebida.</li>
            <li>Selecione o local de armazenamento.</li>
            <li>Informe lote e validade quando exigidos.</li>
            <li>
              Informe o valor unitário quando essa informação estiver
              disponível.
            </li>
            <li>Adicione outros gêneros, se necessário.</li>
            <li>Revise o recebimento e confirme.</li>
          </Passos>

          <Aviso>
            O estoque somente aumenta depois da confirmação do
            recebimento. Confira principalmente gênero, quantidade,
            lote, validade e local antes de confirmar.
          </Aviso>

          <Aviso tipo="informacao">
            Para QS, a origem pode identificar a Cadeia de Suprimento ou
            B Sup. Para QR, pode identificar o fornecedor ou a origem da
            aquisição. O registro é operacional e não constitui controle
            financeiro de QR.
          </Aviso>
        </Tutorial>

        {/* 5. SAÍDA DE GÊNEROS */}

        <Tutorial
          id="saida-generos"
          icone="↑"
          titulo="Saída de gêneros"
          subtitulo="Baixa dos materiais retirados do estoque."
        >
          <Titulo>Para que serve</Titulo>

          <Texto>
            Registra a retirada física de gêneros do depósito para
            consumo ou utilização, reduzindo o saldo disponível.
          </Texto>

          <Titulo>Passo a passo</Titulo>

          <Passos>
            <li>Acesse <strong>Saída de gêneros</strong>.</li>
            <li>Escolha QS ou QR.</li>
            <li>Selecione o destino da saída.</li>
            <li>Confira a data.</li>
            <li>Selecione grupo, categoria e gênero.</li>
            <li>Confira o saldo disponível.</li>
            <li>Informe a quantidade.</li>
            <li>Adicione outros gêneros, quando necessário.</li>
            <li>Revise e confirme a saída.</li>
          </Passos>

          <Titulo>PVPS</Titulo>

          <Texto>
            Para materiais controlados por validade, o sistema utiliza
            os lotes aplicáveis respeitando a prioridade de vencimento,
            auxiliando o uso do material que vence primeiro.
          </Texto>

          <Aviso>
            Não é permitido confirmar quantidade superior ao saldo
            disponível. Confira sempre gênero, quantidade e destino
            antes de concluir.
          </Aviso>
        </Tutorial>

        {/* 6. DEVOLUÇÕES E AJUSTES */}

        <Tutorial
          id="devolucoes-ajustes"
          icone="↺"
          titulo="Devoluções e ajustes"
          subtitulo="Transferências, devoluções, perdas, correções e cancelamentos."
        >
          <Titulo>Para que serve</Titulo>

          <Texto>
            Este módulo trata situações em que o estoque precisa ser
            movimentado ou corrigido fora de um recebimento ou saída
            normal.
          </Texto>

          <Quadro titulo="Transferência">
            Utilize quando o material continua pertencendo ao estoque,
            mas muda fisicamente de um local para outro.
          </Quadro>

          <Quadro titulo="Devolução">
            Utilize quando parte de uma saída retorna fisicamente ao
            depósito. A quantidade devolvida volta para o estoque de
            origem correspondente.
          </Quadro>

          <Quadro titulo="Perda / Descarte">
            Utilize quando um material precisa ser baixado por perda,
            deterioração, inutilização ou descarte. Informe o motivo.
          </Quadro>

          <Quadro titulo="Correção">
            Utilize para ajustar uma divergência comprovada entre o saldo
            do sistema e a quantidade física. A correção pode aumentar
            ou diminuir o saldo e deve ser justificada.
          </Quadro>

          <Quadro titulo="Cancelar saída">
            Utilize quando uma saída registrada precisa ser anulada. A
            saída permanece no histórico como cancelada e o estoque é
            recomposto.
          </Quadro>

          <Aviso>
            Não utilize Correção para substituir uma devolução, perda ou
            transferência. Escolha sempre o procedimento que represente
            o fato realmente ocorrido.
          </Aviso>
        </Tutorial>

        {/* 7. EFETIVO ALIMENTADO */}

        <Tutorial
          id="efetivo-alimentado"
          icone="👥"
          titulo="Efetivo alimentado"
          subtitulo="Planejamento do arranchamento e fechamento diário."
        >
          <Titulo>Para que serve</Titulo>

          <Texto>
            Permite planejar o efetivo previsto para as refeições e,
            posteriormente, registrar o resultado real do atendimento.
            Essas informações apoiam o planejamento do consumo.
          </Texto>

          <Titulo>Planejamento</Titulo>

          <Passos>
            <li>Acesse <strong>Efetivo alimentado</strong>.</li>
            <li>Confira ou selecione a data planejada.</li>
            <li>Selecione a refeição.</li>
            <li>Informe o efetivo previsto.</li>
            <li>Confira a margem de segurança aplicada.</li>
            <li>Confira o total considerado para planejamento.</li>
            <li>Registre o arranchamento.</li>
          </Passos>

          <Aviso tipo="informacao">
            A margem de segurança ajuda a absorver pequenas variações do
            efetivo. Ela não significa que todo o acréscimo será
            obrigatoriamente consumido.
          </Aviso>

          <Titulo>Fechamento Diário</Titulo>

          <Passos>
            <li>Acesse <strong>Fechamento Diário</strong>.</li>
            <li>Selecione a data.</li>
            <li>Informe o efetivo realmente alimentado.</li>
            <li>Informe as faltas.</li>
            <li>Informe não arranchados que foram atendidos.</li>
            <li>Informe a sobra pesada total, quando houver.</li>
            <li>Confira o resumo e finalize.</li>
          </Passos>

          <Aviso>
            A sobra informada no Fechamento Diário é um dado de
            acompanhamento. Ela não devolve automaticamente gêneros ao
            estoque. Havendo devolução física ao depósito, utilize o
            procedimento próprio de devolução.
          </Aviso>
        </Tutorial>

        {/* 8. RELATÓRIOS */}

        <Tutorial
          id="relatorios"
          icone="📊"
          titulo="Relatórios"
          subtitulo="Consulta, consolidação e exportação dos registros."
        >
          <Titulo>Para que serve</Titulo>

          <Texto>
            Os relatórios consolidam as informações registradas no
            Estoque Aprov e auxiliam a conferência, acompanhamento e
            prestação de informações do Aprovisionamento.
          </Texto>

          <Titulo>Como gerar</Titulo>

          <Passos>
            <li>Acesse <strong>Relatórios</strong>.</li>
            <li>Informe a data inicial e final.</li>
            <li>Escolha QS + QR, somente QS ou somente QR.</li>
            <li>
              Selecione as informações que deseja incluir, como
              entradas, saídas, devoluções, estoque, efetivo e refeições.
            </li>
            <li>Visualize o relatório.</li>
            <li>Exporte em PDF ou Excel, quando necessário.</li>
          </Passos>

          <Aviso tipo="informacao">
            As movimentações registradas permitem acompanhar saldo
            inicial, recebimentos, saídas, devoluções, perdas, correções
            e transferências.
          </Aviso>

          <Aviso>
            Os alertas de estoque também são apresentados para auxiliar
            na identificação de estoque baixo, falta de material e
            problemas relacionados à validade.
          </Aviso>
        </Tutorial>

        {/* 9. QDAA / RESSUPRIMENTO QS */}

        <Tutorial
          id="qdaa-ressuprimento"
          icone="▤"
          titulo="QDAA / Ressuprimento QS"
          subtitulo="QDAA mensal e planejamento normal bimestral do QS."
        >
          <Titulo>Entenda a diferença</Titulo>

          <Texto>
            O módulo reúne procedimentos relacionados aos gêneros QS,
            mas existem duas periodicidades diferentes que não devem ser
            confundidas.
          </Texto>

          <Quadro titulo="QDAA">
            É realizado mensalmente, com acompanhamento das informações
            dos gêneros QS referentes ao mês.
          </Quadro>

          <Quadro titulo="Ressuprimento QS normal">
            É bimestral. Cada planejamento normal projeta a necessidade
            de abastecimento para um período fixo de 2 meses.
          </Quadro>

          <Titulo>Apoio ao QDAA</Titulo>

          <Passos>
            <li>Acesse <strong>QDAA / Ressuprimento QS</strong>.</li>
            <li>Entre em <strong>Apoio ao QDAA</strong>.</li>
            <li>Selecione o mês e o ano.</li>
            <li>Gere o QDAA.</li>
            <li>Confira as informações e movimentações dos gêneros QS.</li>
          </Passos>

          <Titulo>Planejamento de Ressuprimento QS</Titulo>

          <Texto>
            O sistema utiliza informações de consumo e estoque para
            auxiliar no cálculo da necessidade do próximo período
            bimestral.
          </Texto>

          <Passos>
            <li>
              Acesse <strong>Planejamento de Ressuprimento QS</strong>.
            </li>
            <li>
              Escolha o período histórico que será usado para calcular a
              média de consumo.
            </li>
            <li>Confira a margem de segurança.</li>
            <li>
              Resolva eventuais referências de consumo pendentes.
            </li>
            <li>Analise a sugestão calculada pelo Estoque Aprov.</li>
            <li>Informe a quantidade que será efetivamente planejada.</li>
            <li>
              Quando alterar uma quantidade, registre a justificativa
              quando solicitada.
            </li>
            <li>Salve como rascunho ou finalize o planejamento.</li>
          </Passos>

          <Aviso>
            O período histórico de 1, 2, 3 ou 6 meses é utilizado apenas
            para calcular a média de consumo. Ele não muda o ciclo de
            ressuprimento normal, que permanece sempre em{' '}
            <strong>2 meses</strong>.
          </Aviso>

          <Titulo>Referência de Consumo QS</Titulo>

          <Texto>
            Quando ainda não existe histórico suficiente no Estoque
            Aprov, pode ser necessário informar uma referência de
            consumo para o gênero. Essa referência permite que o sistema
            tenha uma base para auxiliar o planejamento.
          </Texto>

          <Titulo>Histórico de Ressuprimentos</Titulo>

          <Texto>
            Utilize o histórico para consultar planejamentos já
            registrados, seus parâmetros, quantidades, justificativas e
            demais informações relacionadas ao ciclo.
          </Texto>

          <Titulo>Ressuprimento Complementar</Titulo>

          <Texto>
            Durante um ciclo bimestral pode surgir, excepcionalmente, a
            necessidade de solicitar quantidade adicional. Isso pode
            ocorrer, por exemplo, quando o material recebido foi inferior
            ao planejado, houve erro nos dados ou surgiu uma necessidade
            operacional inesperada.
          </Texto>

          <Passos>
            <li>Abra o planejamento bimestral finalizado.</li>
            <li>
              Acesse <strong>Ressuprimento complementar</strong>.
            </li>
            <li>Selecione somente os gêneros necessários.</li>
            <li>Informe a quantidade adicional.</li>
            <li>Registre obrigatoriamente a justificativa.</li>
            <li>Confirme o complementar.</li>
          </Passos>

          <Aviso>
            O Ressuprimento Complementar não cria um novo ciclo e não
            altera o planejamento original. Mais de um complementar pode
            ser registrado durante o mesmo ciclo, quando necessário.
          </Aviso>

          <Aviso tipo="informacao">
            O complementar registra a necessidade de ressuprimento, mas
            não movimenta o estoque. Quando o material chegar
            fisicamente, registre a entrada em{' '}
            <strong>Novo recebimento</strong>.
          </Aviso>
        </Tutorial>

        {/* 10. LOCAIS DE ARMAZENAMENTO */}

        <Tutorial
          id="locais"
          icone="🏬"
          titulo="Locais de armazenamento"
          subtitulo="Organização dos espaços físicos do depósito."
        >
          <Titulo>Para que serve</Titulo>

          <Texto>
            Identifica os espaços físicos onde os gêneros ficam
            armazenados. O local registrado no sistema deve representar
            onde o material realmente se encontra.
          </Texto>

          <Titulo>Como cadastrar</Titulo>

          <Passos>
            <li>Na tela inicial, acesse <strong>Locais</strong>.</li>
            <li>Informe um nome claro para o local.</li>
            <li>Informe uma descrição, quando necessário.</li>
            <li>Toque em <strong>Adicionar local</strong>.</li>
          </Passos>

          <Aviso>
            Não cadastre nomes diferentes para o mesmo espaço físico. O
            sistema também impede a duplicidade do nome do local.
          </Aviso>

          <Titulo>Onde é utilizado</Titulo>

          <Texto>
            Os locais são utilizados no Estoque Inicial, recebimentos,
            consulta de saldos, transferências e como referência de
            armazenamento nas configurações aplicáveis.
          </Texto>

          <Titulo>Editar um local</Titulo>

          <Passos>
            <li>Abra <strong>Ver locais cadastrados</strong>.</li>
            <li>Localize o registro.</li>
            <li>Toque em <strong>Editar local</strong>.</li>
            <li>Corrija o nome ou a descrição.</li>
            <li>Salve a alteração.</li>
          </Passos>

          <Aviso>
            Editar o nome do local não representa movimentação física de
            estoque. Se o gênero realmente mudar de um local para outro,
            registre uma <strong>Transferência</strong> em Devoluções e
            ajustes.
          </Aviso>
        </Tutorial>

        {/* 11. UNIDADES DE MEDIDA */}

        <Tutorial
          id="unidades"
          icone="⚖"
          titulo="Unidades de medida"
          subtitulo="Cadastro das unidades utilizadas nos gêneros."
        >
          <Titulo>Para que serve</Titulo>

          <Texto>
            A unidade de medida define como a quantidade de cada gênero
            será controlada no Estoque Aprov. Exemplos comuns são kg
            para quilograma, L para litro e un para unidade.
          </Texto>

          <Titulo>Como cadastrar</Titulo>

          <Passos>
            <li>Na tela inicial, acesse <strong>Unidades</strong>.</li>
            <li>
              Em Nova unidade, informe a <strong>Sigla</strong>, por
              exemplo: kg.
            </li>
            <li>
              Informe o <strong>Nome da unidade</strong>, por exemplo:
              Quilograma.
            </li>
            <li>Toque em <strong>Adicionar unidade</strong>.</li>
          </Passos>

          <Aviso tipo="informacao">
            A nova unidade é cadastrada como ativa e fica disponível para
            utilização nos gêneros QS e QR.
          </Aviso>

          <Aviso>
            A sigla deve ser única. Não é permitido cadastrar outra
            unidade com a mesma sigla.
          </Aviso>

          <Titulo>Consultar e editar</Titulo>

          <Passos>
            <li>
              Toque em <strong>Ver unidades cadastradas</strong>.
            </li>
            <li>Localize a unidade desejada.</li>
            <li>Entre na edição.</li>
            <li>
              Altere sigla, nome ou situação, quando necessário.
            </li>
            <li>Salve.</li>
          </Passos>

          <Titulo>Ativar ou inativar</Titulo>

          <Texto>
            Uma unidade ativa permanece disponível para utilização nos
            cadastros. Quando não deve mais ser utilizada, ela pode ser
            marcada como inativa.
          </Texto>

          <Aviso>
            Se a unidade estiver vinculada a um ou mais gêneros, o
            sistema não permitirá sua inativação. Primeiro será
            necessário alterar os gêneros vinculados.
          </Aviso>

          <Aviso tipo="informacao">
            Como a unidade define a interpretação das quantidades do
            gênero, confira esse cadastro cuidadosamente antes de iniciar
            as movimentações reais do estoque.
          </Aviso>
        </Tutorial>
                {/* 12. GRUPOS DE GÊNEROS */}

        <Tutorial
          id="grupos-generos"
          icone="≡"
          titulo="Grupos de gêneros"
          subtitulo="Organização das categorias em grandes grupos do estoque."
        >
          <Titulo>Para que serve</Titulo>

          <Texto>
            Os grupos representam o nível mais amplo de organização dos
            gêneros alimentícios no Estoque Aprov. Eles reúnem categorias
            com características semelhantes, facilitando a organização,
            as consultas, os relatórios e o planejamento.
          </Texto>

          <Quadro titulo="Estrutura do cadastro">
            A organização segue a sequência:
            <strong> Grupo → Categoria → Gênero</strong>.
            Primeiro é criado o grupo; depois, as categorias podem ser
            vinculadas a ele; por fim, os gêneros são organizados dentro
            das respectivas categorias.
          </Quadro>

          <Titulo>Como cadastrar um grupo</Titulo>

          <Passos>
            <li>
              Na tela inicial, acesse <strong>Grupos</strong>.
            </li>
            <li>
              Em <strong>Novo grupo</strong>, informe o nome do grupo.
            </li>
            <li>
              Informe uma descrição para facilitar sua identificação,
              quando necessário.
            </li>
            <li>
              Toque em <strong>Adicionar grupo</strong>.
            </li>
          </Passos>

          <Aviso tipo="informacao">
            Todo novo grupo é cadastrado como ativo e, depois de criado,
            fica disponível para seleção no cadastro das categorias.
          </Aviso>

          <Aviso>
            O nome do grupo deve ser único. O sistema não permite
            cadastrar dois grupos com o mesmo nome.
          </Aviso>

          <Titulo>Consultar os grupos cadastrados</Titulo>

          <Passos>
            <li>
              Toque em <strong>Ver grupos cadastrados</strong>.
            </li>
            <li>
              Localize o grupo desejado.
            </li>
            <li>
              Confira seu nome, descrição e situação.
            </li>
            <li>
              Confira também a quantidade de categorias vinculadas
              ao grupo.
            </li>
          </Passos>

          <Titulo>Editar um grupo</Titulo>

          <Passos>
            <li>
              Abra a relação de grupos cadastrados.
            </li>
            <li>
              Localize o grupo e toque em <strong>Editar grupo</strong>.
            </li>
            <li>
              Altere o nome ou a descrição, quando necessário.
            </li>
            <li>
              Se necessário, altere a situação entre
              <strong> Ativo</strong> e <strong>Inativo</strong>.
            </li>
            <li>
              Toque em <strong>Salvar</strong>.
            </li>
          </Passos>

          <Titulo>Ativar ou inativar</Titulo>

          <Texto>
            Um grupo ativo permanece disponível para utilização na
            organização das categorias. Quando ele não deve mais ser
            utilizado, pode ser marcado como inativo.
          </Texto>

          <Aviso>
            Um grupo que possui categorias vinculadas
            <strong> não pode ser inativado</strong>. Antes da
            inativação, as categorias vinculadas deverão ser alteradas
            para outro grupo ou reorganizadas conforme a necessidade.
          </Aviso>

          <Aviso tipo="informacao">
            Antes de iniciar o cadastro dos gêneros, procure definir uma
            estrutura simples e coerente de grupos e categorias. Isso
            evita duplicidades e facilita a localização dos materiais
            durante a operação do estoque.
          </Aviso>
        </Tutorial>
                {/* 13. CATEGORIAS DE GÊNEROS */}

        <Tutorial
          id="categorias-generos"
          icone="▦"
          titulo="Categorias de gêneros"
          subtitulo="Organização dos gêneros e definição de padrões de controle."
        >
          <Titulo>Para que serve</Titulo>

          <Texto>
            As categorias representam o nível intermediário de organização
            do estoque. Elas ficam abaixo dos grupos e servem para reunir
            gêneros com características semelhantes, além de permitir a
            definição de padrões que serão sugeridos no cadastro dos gêneros.
          </Texto>

          <Quadro titulo="Estrutura do estoque">
            A organização segue a sequência:
            <strong> Grupo → Categoria → Gênero</strong>.
            Por exemplo, um grupo pode reunir várias categorias e cada
            categoria pode possuir diversos gêneros vinculados.
          </Quadro>

          <Titulo>Como cadastrar uma categoria</Titulo>

          <Passos>
            <li>
              Na tela inicial, acesse <strong>Categorias</strong>.
            </li>
            <li>
              Em <strong>Nova categoria</strong>, informe o nome.
            </li>
            <li>
              Selecione o <strong>Grupo de gêneros</strong> ao qual ela
              pertence. Caso ainda não esteja definido, o campo pode
              permanecer como <strong>Não definido</strong>.
            </li>
            <li>
              Marque <strong>Controla lote</strong> quando esse for o
              padrão esperado para os gêneros dessa categoria.
            </li>
            <li>
              Marque <strong>Controla validade</strong> quando os gêneros
              normalmente exigirem esse controle.
            </li>
            <li>
              Se existir um local normalmente utilizado para essa categoria,
              selecione-o em <strong>Local habitual da categoria</strong>.
            </li>
            <li>
              Toque em <strong>Adicionar categoria</strong>.
            </li>
          </Passos>

          <Aviso tipo="informacao">
            Uma nova categoria é cadastrada como ativa. Somente grupos e
            locais ativos podem ser selecionados no cadastro.
          </Aviso>

          <Titulo>Padrões de lote e validade</Titulo>

          <Texto>
            Os campos Controla lote e Controla validade funcionam como
            padrões da categoria. Quando um gênero for vinculado a ela,
            esses controles serão sugeridos automaticamente para facilitar
            o cadastro.
          </Texto>

          <Aviso>
            Esses campos são padrões sugeridos para os gêneros da categoria.
            Antes de concluir o cadastro de cada gênero, confira se o controle
            de lote e validade realmente corresponde à forma como aquele
            material deve ser administrado.
          </Aviso>

          <Titulo>Local habitual</Titulo>

          <Texto>
            O local habitual indica onde os gêneros daquela categoria
            normalmente ficam armazenados. Essa informação ajuda a
            padronizar o cadastro e a organização física do depósito.
          </Texto>

          <Aviso tipo="informacao">
            Local habitual não significa que o material esteja
            obrigatoriamente naquele local. A posição real do estoque é
            determinada pelas movimentações registradas no sistema.
          </Aviso>

          <Titulo>Consultar as categorias</Titulo>

          <Passos>
            <li>
              Toque em <strong>Ver categorias cadastradas</strong>.
            </li>
            <li>Localize a categoria desejada.</li>
            <li>Confira o grupo ao qual ela está vinculada.</li>
            <li>Confira sua situação: Ativo ou Inativo.</li>
            <li>
              Confira os padrões de lote e validade.
            </li>
            <li>Confira o local habitual.</li>
            <li>
              Confira a quantidade de gêneros vinculados.
            </li>
          </Passos>

          <Titulo>Editar uma categoria</Titulo>

          <Passos>
            <li>Abra as categorias cadastradas.</li>
            <li>
              Localize a categoria e toque em
              <strong> Editar categoria</strong>.
            </li>
            <li>Altere o nome, quando necessário.</li>
            <li>
              Altere o grupo ao qual ela pertence, se necessário.
            </li>
            <li>
              Revise os padrões de lote e validade.
            </li>
            <li>
              Altere o local habitual, quando necessário.
            </li>
            <li>
              Altere a situação entre <strong>Ativo</strong> e
              <strong> Inativo</strong>, quando aplicável.
            </li>
            <li>Toque em <strong>Salvar</strong>.</li>
          </Passos>

          <Titulo>Ativar ou inativar</Titulo>

          <Texto>
            Uma categoria ativa permanece disponível para utilização no
            cadastro dos gêneros. Quando não deve mais ser utilizada, pode
            ser marcada como inativa.
          </Texto>

          <Aviso>
            Uma categoria vinculada a um ou mais gêneros
            <strong> não pode ser inativada</strong>. Primeiro será
            necessário alterar os gêneros vinculados.
          </Aviso>

          <Aviso>
            O nome da categoria deve ser único. O sistema não permite duas
            categorias com o mesmo nome.
          </Aviso>

          <Aviso tipo="informacao">
            Organize grupos e categorias antes de cadastrar os gêneros
            definitivos. Uma estrutura bem definida facilita consultas,
            relatórios e a administração do estoque no uso diário.
          </Aviso>
        </Tutorial>
                {/* 14. USUÁRIOS E PERMISSÕES */}

        <Tutorial
          id="usuarios-permissoes"
          icone="👤"
          titulo="Usuários e permissões"
          subtitulo="Cadastro de usuários e definição dos níveis de acesso."
        >
          <Titulo>Para que serve</Titulo>

          <Texto>
            O módulo Usuários e permissões controla quem pode acessar o
            Estoque Aprov e quais áreas do sistema ficam disponíveis para
            cada usuário. Cada militar ou usuário autorizado deve possuir
            seu próprio acesso.
          </Texto>

          <Aviso tipo="informacao">
            Somente o <strong>Administrador Principal</strong> pode
            cadastrar, editar, ativar ou inativar usuários.
          </Aviso>

          <Titulo>Perfis disponíveis</Titulo>

          <Quadro titulo="Administrador Principal">
            Possui acesso administrativo ao sistema e é o único perfil
            autorizado a gerenciar usuários e permissões.
          </Quadro>

          <Quadro titulo="Administrador">
            Possui acesso às rotinas administrativas, configurações,
            cadastros, relatórios, QDAA e Ressuprimento QS, além das
            principais operações do estoque.
          </Quadro>

          <Quadro titulo="Chefe do Depósito">
            Atua principalmente nas rotinas do depósito. Pode consultar
            estoque, registrar estoque inicial, recebimentos, saídas,
            devoluções e ajustes, conforme as permissões operacionais
            disponibilizadas pelo sistema.
          </Quadro>

          <Quadro titulo="Graduado de Serviço">
            Possui acesso às rotinas operacionais necessárias ao serviço,
            como consulta de estoque, recebimentos, saídas, devoluções e
            ajustes, além do registro e fechamento relacionados ao efetivo
            alimentado.
          </Quadro>

          <Aviso>
            Os módulos apresentados na tela inicial variam conforme o perfil
            do usuário. Se determinada função não estiver autorizada para o
            perfil, ela não ficará disponível normalmente para acesso.
          </Aviso>

          <Titulo>Como cadastrar um usuário</Titulo>

          <Passos>
            <li>
              Na tela inicial, acesse
              <strong> Usuários e permissões</strong>.
            </li>
            <li>
              Em <strong>Novo usuário</strong>, informe o nome.
            </li>
            <li>
              Informe posto ou graduação, quando aplicável.
            </li>
            <li>
              Informe a função exercida pelo usuário, quando aplicável.
            </li>
            <li>
              Crie um <strong>Login</strong> para acesso ao sistema.
            </li>
            <li>
              Informe a <strong>Senha inicial</strong>.
            </li>
            <li>
              Escolha o <strong>Perfil de acesso</strong> adequado às
              atribuições do usuário.
            </li>
            <li>
              Confira os dados e toque em
              <strong> Cadastrar usuário</strong>.
            </li>
          </Passos>

          <Aviso>
            O login deve possuir pelo menos 3 caracteres e não pode estar
            sendo utilizado por outro usuário. A senha deve possuir pelo
            menos <strong>8 caracteres</strong>.
          </Aviso>

          <Aviso tipo="informacao">
            Todo novo usuário é criado inicialmente com situação
            <strong> Ativo</strong>.
          </Aviso>

          <Titulo>Consultar usuários</Titulo>

          <Texto>
            A relação de usuários permite verificar os dados de identificação,
            login, perfil de acesso, situação e informação do último acesso.
            Quando o usuário ainda não tiver utilizado o sistema, será
            indicado que ele nunca acessou.
          </Texto>

          <Titulo>Editar um usuário</Titulo>

          <Passos>
            <li>
              Localize o usuário cadastrado.
            </li>
            <li>
              Toque em <strong>Editar usuário</strong>.
            </li>
            <li>
              Altere nome, posto ou graduação e função, se necessário.
            </li>
            <li>
              Altere o login, quando necessário.
            </li>
            <li>
              Confira ou altere o perfil de acesso.
            </li>
            <li>
              Confira a situação: <strong>Ativo</strong> ou
              <strong> Inativo</strong>.
            </li>
            <li>
              Para trocar a senha, informe uma nova senha no campo
              correspondente.
            </li>
            <li>
              Salve as alterações.
            </li>
          </Passos>

          <Aviso tipo="informacao">
            Ao editar um usuário, deixe o campo
            <strong> Nova senha</strong> em branco quando desejar manter a
            senha atual.
          </Aviso>

          <Titulo>Ativar ou inativar</Titulo>

          <Texto>
            Um usuário ativo permanece autorizado a acessar o Estoque Aprov
            conforme seu perfil. Quando o acesso não for mais necessário,
            o Administrador Principal pode alterar sua situação para
            Inativo.
          </Texto>

          <Aviso>
            O Administrador Principal que está utilizando o sistema
            <strong> não pode inativar o próprio usuário</strong> e também
            não pode retirar de si mesmo o perfil de Administrador
            Principal.
          </Aviso>

          <Aviso>
            O Estoque Aprov deve manter
            <strong> pelo menos um Administrador Principal ativo</strong>.
            Por segurança, o sistema bloqueia qualquer alteração que deixe
            o sistema sem um Administrador Principal ativo.
          </Aviso>

          <Titulo>Boas práticas de acesso</Titulo>

          <Passos>
            <li>
              Crie um usuário individual para cada pessoa autorizada.
            </li>
            <li>
              Não compartilhe login e senha entre usuários.
            </li>
            <li>
              Escolha o perfil de acordo com a função realmente exercida.
            </li>
            <li>
              Inative acessos que não sejam mais necessários.
            </li>
            <li>
              Altere a senha quando houver suspeita de comprometimento do
              acesso.
            </li>
          </Passos>

          <Aviso tipo="informacao">
            As alterações realizadas no gerenciamento de usuários são
            registradas pelo sistema para fins de rastreabilidade.
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
        Manual do Estoque Aprov · Orientações para utilização segura e
        correta do sistema.
      </div>
    </section>
  );
}
