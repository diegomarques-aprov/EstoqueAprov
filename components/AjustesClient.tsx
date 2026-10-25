'use client';

import { useState } from 'react';

type Row = {
  id: string;
  genero: string;
  classe: string;
  unidade: string;
  local: string;
  localId: string;
  lote: string | null;
  quantidade: number;
};

type Local = {
  id: string;
  nome: string;
};

type S = {
  id: string;
  numero: number;
  classe: string;
  destino: string;
  data: string;
  cancelada: boolean;
  itens: {
    generoId: string;
    genero: string;
    unidade: string;
    quantidade: number;
  }[];
};

type SendFunction = (
  url: string,
  data: Record<string, unknown>
) => Promise<void>;

const estiloOperacao = {
  background: '#0c1811',
  border: '1px solid #284334',
  borderRadius: '14px',
  padding: '16px',
  marginTop: '16px',
};

const estiloInfo = {
  background: 'rgba(255,255,255,0.04)',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: '11px',
  padding: '12px',
  marginBottom: '14px',
};

const tabs = [
  {
    id: 'transferencia',
    nome: 'Transferência',
    icone: '↔',
  },
  {
    id: 'devolucao',
    nome: 'Devolução',
    icone: '↩',
  },
  {
    id: 'perda',
    nome: 'Perda / Descarte',
    icone: '⚠',
  },
  {
    id: 'correcao',
    nome: 'Correção',
    icone: '±',
  },
  {
    id: 'cancelamento',
    nome: 'Cancelar saída',
    icone: '×',
  },
];

export default function AjustesClient({
  rows,
  saidas,
  locais,
}: {
  rows: Row[];
  saidas: S[];
  locais: Local[];
}) {
  const [tab, setTab] =
    useState('transferencia');

  const [msg, setMsg] =
    useState('');

  const [busy, setBusy] =
    useState(false);

  async function send(
    url: string,
    data: Record<string, unknown>
  ) {
    setBusy(true);
    setMsg('');

    try {
      const r = await fetch(
        url,
        {
          method: 'POST',
          headers: {
            'content-type':
              'application/json',
          },
          body: JSON.stringify(
            data
          ),
        }
      );

      const j =
        await r.json();

      setMsg(
        r.ok
          ? 'Operação registrada com sucesso.'
          : j.error ||
              'Não foi possível concluir.'
      );

      if (r.ok) {
        setTimeout(
          () =>
            location.reload(),
          700
        );
      }
    } catch {
      setMsg(
        'Não foi possível concluir.'
      );
    } finally {
      setBusy(false);
    }
  }

  const active =
    rows.filter(
      (r) =>
        r.quantidade > 0
    );

  return (
    <div>
      {/* SELETOR DE OPERAÇÃO */}

      <div
        style={{
          display: 'grid',
          gridTemplateColumns:
            'repeat(auto-fit, minmax(135px, 1fr))',
          gap: '8px',
        }}
      >
        {tabs.map(
          (item) => {
            const ativo =
              tab === item.id;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  setTab(
                    item.id
                  );
                  setMsg('');
                }}
                style={{
                  minHeight:
                    '64px',
                  padding:
                    '9px 8px',
                  borderRadius:
                    '12px',
                  border: ativo
                    ? '1px solid #2b8a57'
                    : '1px solid #355143',
                  background:
                    ativo
                      ? '#2b8a57'
                      : '#0c1811',
                  color:
                    '#eef7f1',
                  cursor:
                    'pointer',
                  fontWeight:
                    700,
                  display:
                    'flex',
                  flexDirection:
                    'column',
                  alignItems:
                    'center',
                  justifyContent:
                    'center',
                  gap: '4px',
                }}
              >
                <span
                  style={{
                    fontSize:
                      '20px',
                    lineHeight: 1,
                  }}
                >
                  {item.icone}
                </span>

                <span
                  style={{
                    fontSize:
                      '13px',
                    lineHeight:
                      1.2,
                    textAlign:
                      'center',
                  }}
                >
                  {item.nome}
                </span>
              </button>
            );
          }
        )}
      </div>

      {/* MENSAGEM */}

      {msg && (
        <div
          className={
            msg.includes(
              'sucesso'
            )
              ? 'success'
              : 'error'
          }
          style={{
            marginTop: '14px',
          }}
        >
          <strong>
            {msg}
          </strong>
        </div>
      )}

      {/* OPERAÇÕES */}

      {tab ===
        'transferencia' && (
        <Transfer
          rows={active}
          locais={locais}
          send={send}
          busy={busy}
        />
      )}

      {tab === 'devolucao' && (
        <Devolucao
          saidas={saidas.filter(
            (s) =>
              !s.cancelada
          )}
          send={send}
          busy={busy}
        />
      )}

      {tab === 'perda' && (
        <Perda
          rows={active}
          send={send}
          busy={busy}
        />
      )}

      {tab === 'correcao' && (
        <Correcao
          rows={rows}
          send={send}
          busy={busy}
        />
      )}

      {tab ===
        'cancelamento' && (
        <Cancel
          saidas={saidas.filter(
            (s) =>
              !s.cancelada
          )}
          send={send}
          busy={busy}
        />
      )}
    </div>
  );
}

function StockSelect({
  rows,
  onChange,
}: {
  rows: Row[];
  onChange: (
    id: string
  ) => void;
}) {
  return (
    <label>
      Gênero / estoque

      <select
        onChange={(e) =>
          onChange(
            e.target.value
          )
        }
        defaultValue=""
      >
        <option
          value=""
          disabled
        >
          Selecione o estoque
        </option>

        {rows.map(
          (r) => (
            <option
              key={r.id}
              value={r.id}
            >
              {r.genero} ·{' '}
              {r.quantidade.toLocaleString(
                'pt-BR'
              )}{' '}
              {r.unidade} ·{' '}
              {r.local}
              {r.lote
                ? ' · lote ' +
                  r.lote
                : ''}
            </option>
          )
        )}
      </select>
    </label>
  );
}

function Transfer({
  rows,
  locais,
  send,
  busy,
}: {
  rows: Row[];
  locais: Local[];
  send: SendFunction;
  busy: boolean;
}) {
  const [id, setId] =
    useState('');

  const [dest, setDest] =
    useState('');

  const [q, setQ] =
    useState('');

  const [obs, setObs] =
    useState('');

  const selecionado =
    rows.find(
      (r) =>
        r.id === id
    );

  return (
    <section style={estiloOperacao}>
      <CabecalhoOperacao
        icone="↔"
        titulo="Transferência interna"
        descricao="Mova um gênero entre locais de armazenamento sem alterar o estoque total."
      />

      <div style={estiloInfo}>
        <div
          className="muted"
          style={{
            fontSize: '13px',
            lineHeight: 1.45,
          }}
        >
          A transferência altera
          somente a localização física
          do material.
        </div>
      </div>

      <StockSelect
        rows={rows}
        onChange={(valor) => {
          setId(valor);
          setDest('');
        }}
      />

      {selecionado && (
        <ResumoEstoque
          row={selecionado}
        />
      )}

      <label>
        Local de destino

        <select
          value={dest}
          onChange={(e) =>
            setDest(
              e.target.value
            )
          }
        >
          <option value="">
            Selecione o local
          </option>

          {locais.map(
            (r) => (
              <option
                key={r.id}
                value={r.id}
              >
                {r.nome}
              </option>
            )
          )}
        </select>
      </label>

      <label>
        Quantidade

        <input
          placeholder="0"
          type="number"
          min="0"
          step="0.001"
          inputMode="decimal"
          value={q}
          onChange={(e) =>
            setQ(
              e.target.value
            )
          }
        />
      </label>

      <label>
        Observação

        <input
          placeholder="Observação opcional"
          value={obs}
          onChange={(e) =>
            setObs(
              e.target.value
            )
          }
        />
      </label>

      <button
        className="btn"
        style={{
          width: '100%',
          marginTop: '4px',
        }}
        disabled={
          busy ||
          !id ||
          !dest ||
          !q
        }
        onClick={() =>
          send(
            '/api/transferencias',
            {
              estoqueId: id,
              localDestinoId:
                dest,
              quantidade:
                Number(q),
              observacao: obs,
            }
          )
        }
      >
        {busy
          ? 'Registrando...'
          : 'Confirmar transferência'}
      </button>
    </section>
  );
}

function Perda({
  rows,
  send,
  busy,
}: {
  rows: Row[];
  send: SendFunction;
  busy: boolean;
}) {
  const [id, setId] =
    useState('');

  const [q, setQ] =
    useState('');

  const [m, setM] =
    useState('');

  const selecionado =
    rows.find(
      (r) =>
        r.id === id
    );

  return (
    <section style={estiloOperacao}>
      <CabecalhoOperacao
        icone="⚠"
        titulo="Perda / Descarte"
        descricao="Registre materiais perdidos, inutilizados ou descartados."
      />

      <div
        style={{
          ...estiloInfo,
          border:
            '1px solid rgba(245,158,11,0.45)',
          background:
            'rgba(245,158,11,0.07)',
        }}
      >
        <strong>
          Atenção
        </strong>

        <div
          className="muted"
          style={{
            fontSize: '13px',
            marginTop: '4px',
          }}
        >
          Esta operação reduzirá o
          saldo disponível do gênero.
          Informe obrigatoriamente o
          motivo.
        </div>
      </div>

      <StockSelect
        rows={rows}
        onChange={setId}
      />

      {selecionado && (
        <ResumoEstoque
          row={selecionado}
        />
      )}

      <label>
        Quantidade da perda

        <input
          placeholder="0"
          type="number"
          min="0"
          step="0.001"
          inputMode="decimal"
          value={q}
          onChange={(e) =>
            setQ(
              e.target.value
            )
          }
        />
      </label>

      <label>
        Motivo

        <textarea
          placeholder="Informe o motivo da perda ou descarte"
          value={m}
          onChange={(e) =>
            setM(
              e.target.value
            )
          }
        />
      </label>

      <button
        className="btn"
        style={{
          width: '100%',
          marginTop: '4px',
        }}
        disabled={
          busy ||
          !id ||
          !q ||
          m.length < 3
        }
        onClick={() =>
          send(
            '/api/perdas',
            {
              estoqueId: id,
              quantidade:
                Number(q),
              motivo: m,
            }
          )
        }
      >
        {busy
          ? 'Registrando...'
          : 'Confirmar perda / descarte'}
      </button>
    </section>
  );
}

function Correcao({
  rows,
  send,
  busy,
}: {
  rows: Row[];
  send: SendFunction;
  busy: boolean;
}) {
  const [id, setId] =
    useState('');

  const [q, setQ] =
    useState('');

  const [m, setM] =
    useState('');

  const selecionado =
    rows.find(
      (r) =>
        r.id === id
    );

  return (
    <section style={estiloOperacao}>
      <CabecalhoOperacao
        icone="±"
        titulo="Correção de estoque"
        descricao="Corrija diferenças identificadas entre o saldo registrado e o estoque físico."
      />

      <div style={estiloInfo}>
        <strong>
          Como lançar
        </strong>

        <div
          className="muted"
          style={{
            fontSize: '13px',
            marginTop: '4px',
            lineHeight: 1.45,
          }}
        >
          Use um valor positivo para
          acrescentar e negativo para
          reduzir. O lançamento
          original permanece no
          histórico.
        </div>
      </div>

      <StockSelect
        rows={rows}
        onChange={setId}
      />

      {selecionado && (
        <ResumoEstoque
          row={selecionado}
        />
      )}

      <label>
        Valor do ajuste

        <input
          placeholder="Ex.: -5 ou 3"
          type="number"
          step="0.001"
          inputMode="decimal"
          value={q}
          onChange={(e) =>
            setQ(
              e.target.value
            )
          }
        />
      </label>

      <label>
        Motivo

        <textarea
          placeholder="Informe o motivo da correção"
          value={m}
          onChange={(e) =>
            setM(
              e.target.value
            )
          }
        />
      </label>

      <button
        className="btn"
        style={{
          width: '100%',
          marginTop: '4px',
        }}
        disabled={
          busy ||
          !id ||
          !q ||
          m.length < 3
        }
        onClick={() =>
          send(
            '/api/correcoes',
            {
              estoqueId: id,
              ajuste:
                Number(q),
              motivo: m,
            }
          )
        }
      >
        {busy
          ? 'Registrando...'
          : 'Confirmar correção'}
      </button>
    </section>
  );
}

function Devolucao({
  saidas,
  send,
  busy,
}: {
  saidas: S[];
  send: SendFunction;
  busy: boolean;
}) {
  const [sid, setSid] =
    useState('');

  const [gid, setGid] =
    useState('');

  const [q, setQ] =
    useState('');

  const [m, setM] =
    useState('');

  const s =
    saidas.find(
      (x) =>
        x.id === sid
    );

  const itemSelecionado =
    s?.itens.find(
      (item) =>
        item.generoId === gid
    );

  return (
    <section style={estiloOperacao}>
      <CabecalhoOperacao
        icone="↩"
        titulo="Devolução ao depósito"
        descricao="Registre o retorno ao estoque de material anteriormente liberado."
      />

      <div style={estiloInfo}>
        <div
          className="muted"
          style={{
            fontSize: '13px',
            lineHeight: 1.45,
          }}
        >
          Selecione primeiro a saída
          original e depois o gênero
          que está retornando ao
          depósito.
        </div>
      </div>

      <label>
        Saída original

        <select
          value={sid}
          onChange={(e) => {
            setSid(
              e.target.value
            );
            setGid('');
            setQ('');
          }}
        >
          <option value="">
            Selecione a saída
            original
          </option>

          {saidas.map(
            (saida) => (
              <option
                key={saida.id}
                value={saida.id}
              >
                Saída{' '}
                {saida.numero} ·{' '}
                {saida.classe} ·{' '}
                {saida.destino} ·{' '}
                {new Date(
                  saida.data
                ).toLocaleDateString(
                  'pt-BR'
                )}
              </option>
            )
          )}
        </select>
      </label>

      {s && (
        <label>
          Gênero devolvido

          <select
            value={gid}
            onChange={(e) => {
              setGid(
                e.target.value
              );
              setQ('');
            }}
          >
            <option value="">
              Selecione o gênero
            </option>

            {s.itens.map(
              (i) => (
                <option
                  key={
                    i.generoId
                  }
                  value={
                    i.generoId
                  }
                >
                  {i.genero} ·
                  liberado{' '}
                  {i.quantidade.toLocaleString(
                    'pt-BR'
                  )}{' '}
                  {i.unidade}
                </option>
              )
            )}
          </select>
        </label>
      )}

      {itemSelecionado && (
        <div
          style={{
            background:
              '#102018',
            border:
              '1px solid #284334',
            borderRadius:
              '11px',
            padding:
              '11px 12px',
            marginBottom:
              '14px',
            display: 'flex',
            justifyContent:
              'space-between',
            gap: '10px',
          }}
        >
          <span
            className="muted"
            style={{
              fontSize: '13px',
            }}
          >
            Quantidade liberada
          </span>

          <strong>
            {itemSelecionado.quantidade.toLocaleString(
              'pt-BR'
            )}{' '}
            {
              itemSelecionado.unidade
            }
          </strong>
        </div>
      )}

      <label>
        Quantidade devolvida

        <input
          placeholder="0"
          type="number"
          min="0"
          step="0.001"
          inputMode="decimal"
          value={q}
          onChange={(e) =>
            setQ(
              e.target.value
            )
          }
        />
      </label>

      <label>
        Motivo / observação

        <input
          placeholder="Opcional"
          value={m}
          onChange={(e) =>
            setM(
              e.target.value
            )
          }
        />
      </label>

      <button
        className="btn"
        style={{
          width: '100%',
          marginTop: '4px',
        }}
        disabled={
          busy ||
          !sid ||
          !gid ||
          !q
        }
        onClick={() =>
          send(
            '/api/devolucoes',
            {
              saidaId: sid,
              generoId: gid,
              quantidade:
                Number(q),
              motivo: m,
            }
          )
        }
      >
        {busy
          ? 'Registrando...'
          : 'Registrar devolução'}
      </button>
    </section>
  );
}

function Cancel({
  saidas,
  send,
  busy,
}: {
  saidas: S[];
  send: SendFunction;
  busy: boolean;
}) {
  const [sid, setSid] =
    useState('');

  const [m, setM] =
    useState('');

  const selecionada =
    saidas.find(
      (s) =>
        s.id === sid
    );

  return (
    <section style={estiloOperacao}>
      <CabecalhoOperacao
        icone="×"
        titulo="Cancelar saída confirmada"
        descricao="Cancele uma saída mantendo todo o registro para auditoria."
      />

      <div
        style={{
          ...estiloInfo,
          border:
            '1px solid rgba(245,158,11,0.45)',
          background:
            'rgba(245,158,11,0.07)',
        }}
      >
        <strong>
          Atenção
        </strong>

        <div
          className="muted"
          style={{
            fontSize: '13px',
            marginTop: '4px',
            lineHeight: 1.45,
          }}
        >
          A saída não será apagada. O
          sistema fará a movimentação
          inversa e preservará o
          histórico da operação.
        </div>
      </div>

      <label>
        Saída

        <select
          value={sid}
          onChange={(e) =>
            setSid(
              e.target.value
            )
          }
        >
          <option value="">
            Selecione a saída
          </option>

          {saidas.map(
            (s) => (
              <option
                key={s.id}
                value={s.id}
              >
                Saída {s.numero} ·{' '}
                {s.classe} ·{' '}
                {s.destino} ·{' '}
                {new Date(
                  s.data
                ).toLocaleDateString(
                  'pt-BR'
                )}
              </option>
            )
          )}
        </select>
      </label>

      {selecionada && (
        <div style={estiloInfo}>
          <strong>
            Saída nº{' '}
            {selecionada.numero}
          </strong>

          <div
            className="muted"
            style={{
              fontSize: '13px',
              marginTop: '5px',
              lineHeight: 1.45,
            }}
          >
            {selecionada.classe} ·{' '}
            {selecionada.destino}
            <br />
            {
              selecionada.itens
                .length
            }{' '}
            item(ns) registrado(s)
          </div>
        </div>
      )}

      <label>
        Motivo do cancelamento

        <textarea
          placeholder="Informe obrigatoriamente o motivo"
          value={m}
          onChange={(e) =>
            setM(
              e.target.value
            )
          }
        />
      </label>

      <button
        className="btn"
        style={{
          width: '100%',
          marginTop: '4px',
        }}
        disabled={
          busy ||
          !sid ||
          m.length < 3
        }
        onClick={() =>
          send(
            '/api/cancelamentos',
            {
              saidaId: sid,
              motivo: m,
            }
          )
        }
      >
        {busy
          ? 'Cancelando...'
          : 'Confirmar cancelamento'}
      </button>
    </section>
  );
}

function CabecalhoOperacao({
  icone,
  titulo,
  descricao,
}: {
  icone: string;
  titulo: string;
  descricao: string;
}) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems:
          'flex-start',
        gap: '10px',
        paddingBottom:
          '13px',
        marginBottom:
          '14px',
        borderBottom:
          '1px solid rgba(255,255,255,0.08)',
      }}
    >
      <div
        style={{
          fontSize: '23px',
          lineHeight: 1,
          minWidth: '25px',
          textAlign:
            'center',
        }}
      >
        {icone}
      </div>

      <div>
        <strong
          style={{
            fontSize: '17px',
          }}
        >
          {titulo}
        </strong>

        <div
          className="muted"
          style={{
            marginTop: '4px',
            fontSize: '13px',
            lineHeight: 1.45,
          }}
        >
          {descricao}
        </div>
      </div>
    </div>
  );
}

function ResumoEstoque({
  row,
}: {
  row: Row;
}) {
  return (
    <div
      style={{
        background: '#102018',
        border:
          '1px solid #284334',
        borderRadius: '11px',
        padding: '12px',
        marginBottom: '14px',
      }}
    >
      <strong>
        {row.genero}
      </strong>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns:
            '1fr auto',
          gap: '8px',
          marginTop: '7px',
          alignItems: 'center',
        }}
      >
        <div
          className="muted"
          style={{
            fontSize: '13px',
            lineHeight: 1.4,
          }}
        >
          {row.classe} ·{' '}
          {row.local}
          {row.lote && (
            <>
              <br />
              Lote: {row.lote}
            </>
          )}
        </div>

        <strong
          style={{
            whiteSpace: 'nowrap',
            fontSize: '16px',
          }}
        >
          {row.quantidade.toLocaleString(
            'pt-BR'
          )}{' '}
          {row.unidade}
        </strong>
      </div>
    </div>
  );
}
