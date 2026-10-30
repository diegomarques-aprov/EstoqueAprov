'use client';

import {
  useEffect,
  useState,
} from 'react';

type Perfil =
  | 'ADMIN_PRINCIPAL'
  | 'ADMINISTRADOR'
  | 'CHEFE_DEPOSITO'
  | 'GRADUADO_SERVICO';

type Situacao =
  | 'ATIVO'
  | 'INATIVO';

type Usuario = {
  id: string;
  nome: string;
  postoGraduacao: string | null;
  funcao: string | null;
  login: string;
  perfil: Perfil;
  situacao: Situacao;
  ultimoAcesso: string | null;
  criadoEm: string;
};

type RespostaAtualizacao = {
  ok?: boolean;
  senhaAlterada?: boolean;
  mensagem?: string;
  error?: string;
};

const perfis: {
  valor: Perfil;
  nome: string;
}[] = [
  {
    valor: 'ADMIN_PRINCIPAL',
    nome: 'Administrador Principal',
  },
  {
    valor: 'ADMINISTRADOR',
    nome: 'Administrador',
  },
  {
    valor: 'CHEFE_DEPOSITO',
    nome: 'Chefe do Depósito',
  },
  {
    valor: 'GRADUADO_SERVICO',
    nome: 'Graduado de Serviço',
  },
];

function nomePerfil(
  perfil: Perfil
) {
  return (
    perfis.find(
      (item) =>
        item.valor === perfil
    )?.nome || perfil
  );
}

function formatarData(
  data: string | null
) {
  if (!data) {
    return 'Nunca acessou';
  }

  return new Date(
    data
  ).toLocaleString('pt-BR');
}

export default function UsuariosClient() {
  const [usuarios, setUsuarios] =
    useState<Usuario[]>([]);

  const [
    carregando,
    setCarregando,
  ] = useState(true);

  const [salvando, setSalvando] =
    useState(false);

  const [erro, setErro] =
    useState('');

  const [sucesso, setSucesso] =
    useState('');

  const [
    mostrarUsuarios,
    setMostrarUsuarios,
  ] = useState(true);

  /*
   * NOVO USUÁRIO
   */

  const [nome, setNome] =
    useState('');

  const [
    postoGraduacao,
    setPostoGraduacao,
  ] = useState('');

  const [funcao, setFuncao] =
    useState('');

  const [login, setLogin] =
    useState('');

  const [senha, setSenha] =
    useState('');

  const [perfil, setPerfil] =
    useState<Perfil>(
      'GRADUADO_SERVICO'
    );

  /*
   * EDIÇÃO
   */

  const [
    editandoId,
    setEditandoId,
  ] = useState<string | null>(
    null
  );

  const [
    nomeEdicao,
    setNomeEdicao,
  ] = useState('');

  const [
    postoGraduacaoEdicao,
    setPostoGraduacaoEdicao,
  ] = useState('');

  const [
    funcaoEdicao,
    setFuncaoEdicao,
  ] = useState('');

  const [
    loginEdicao,
    setLoginEdicao,
  ] = useState('');

  const [
    perfilEdicao,
    setPerfilEdicao,
  ] = useState<Perfil>(
    'GRADUADO_SERVICO'
  );

  const [
    situacaoEdicao,
    setSituacaoEdicao,
  ] = useState<Situacao>(
    'ATIVO'
  );

  const [
    senhaEdicao,
    setSenhaEdicao,
  ] = useState('');

  const [
    confirmarSenhaEdicao,
    setConfirmarSenhaEdicao,
  ] = useState('');

  async function carregar(
    limparErro = true
  ) {
    setCarregando(true);

    if (limparErro) {
      setErro('');
    }

    try {
      const resposta =
        await fetch(
          '/api/usuarios',
          {
            cache: 'no-store',
          }
        );

      const dados =
        await resposta.json();

      if (!resposta.ok) {
        setErro(
          dados.error ||
            'Não foi possível carregar os usuários.'
        );

        setUsuarios([]);
        return;
      }

      setUsuarios(dados);
    } catch {
      setErro(
        'Não foi possível carregar os usuários.'
      );
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    carregar();
  }, []);

  function limparMensagens() {
    setErro('');
    setSucesso('');
  }

  async function cadastrar(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    limparMensagens();
    setSalvando(true);

    try {
      const resposta =
        await fetch(
          '/api/usuarios',
          {
            method: 'POST',

            headers: {
              'Content-Type':
                'application/json',
            },

            body: JSON.stringify({
              nome,
              postoGraduacao:
                postoGraduacao ||
                null,
              funcao:
                funcao || null,
              login,
              senha,
              perfil,
            }),
          }
        );

      const dados =
        await resposta.json();

      if (!resposta.ok) {
        setErro(
          dados.error ||
            'Não foi possível cadastrar o usuário.'
        );

        return;
      }

      setNome('');
      setPostoGraduacao('');
      setFuncao('');
      setLogin('');
      setSenha('');
      setPerfil(
        'GRADUADO_SERVICO'
      );

      await carregar(false);

      setSucesso(
        'Usuário cadastrado com sucesso.'
      );
    } catch {
      setErro(
        'Não foi possível cadastrar o usuário.'
      );
    } finally {
      setSalvando(false);
    }
  }

  function iniciarEdicao(
    usuario: Usuario
  ) {
    limparMensagens();

    setEditandoId(
      usuario.id
    );

    setNomeEdicao(
      usuario.nome
    );

    setPostoGraduacaoEdicao(
      usuario.postoGraduacao ||
        ''
    );

    setFuncaoEdicao(
      usuario.funcao || ''
    );

    setLoginEdicao(
      usuario.login
    );

    setPerfilEdicao(
      usuario.perfil
    );

    setSituacaoEdicao(
      usuario.situacao
    );

    setSenhaEdicao('');
    setConfirmarSenhaEdicao('');
  }

  function cancelarEdicao() {
    setEditandoId(null);
    setSenhaEdicao('');
    setConfirmarSenhaEdicao('');
    limparMensagens();
  }

  async function salvarEdicao(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (!editandoId) {
      return;
    }

    limparMensagens();

    const novaSenha =
      senhaEdicao.trim();

    const confirmacao =
      confirmarSenhaEdicao.trim();

    if (
      novaSenha.length > 0 &&
      novaSenha.length < 8
    ) {
      setErro(
        'A nova senha deve possuir pelo menos 8 caracteres.'
      );
      return;
    }

    if (
      novaSenha.length > 0 &&
      novaSenha !== confirmacao
    ) {
      setErro(
        'A confirmação da nova senha não confere.'
      );
      return;
    }

    setSalvando(true);

    try {
      const resposta =
        await fetch(
          '/api/usuarios',
          {
            method: 'PUT',

            headers: {
              'Content-Type':
                'application/json',
            },

            cache: 'no-store',

            body: JSON.stringify({
              id: editandoId,
              nome: nomeEdicao,
              postoGraduacao:
                postoGraduacaoEdicao ||
                null,
              funcao:
                funcaoEdicao ||
                null,
              login:
                loginEdicao,
              perfil:
                perfilEdicao,
              situacao:
                situacaoEdicao,
              senha:
                novaSenha,
            }),
          }
        );

      let dados:
        RespostaAtualizacao = {};

      try {
        dados =
          await resposta.json();
      } catch {
        dados = {};
      }

      if (!resposta.ok) {
        setErro(
          dados.error ||
            `Não foi possível atualizar o usuário. Código ${resposta.status}.`
        );

        return;
      }

      /*
       * Se uma nova senha foi enviada,
       * a API precisa confirmar que ela
       * foi realmente gravada no banco.
       */

      if (
        novaSenha.length >= 8 &&
        dados.senhaAlterada !== true
      ) {
        setErro(
          'O sistema não confirmou a gravação da nova senha. A senha anterior foi mantida.'
        );

        return;
      }

      const mensagemFinal =
        dados.mensagem ||
        (novaSenha.length >= 8
          ? 'Senha alterada com sucesso.'
          : 'Usuário atualizado com sucesso.');

      setSenhaEdicao('');
      setConfirmarSenhaEdicao('');

      /*
       * Fecha a edição somente depois
       * da confirmação positiva da API.
       */

      setEditandoId(null);

      /*
       * Atualiza a relação sem apagar
       * a mensagem de confirmação.
       */

      await carregar(false);

      setSucesso(
        mensagemFinal
      );
    } catch {
      setErro(
        'Não foi possível comunicar com o servidor para atualizar o usuário.'
      );
    } finally {
      setSalvando(false);
    }
  }

  return (
    <>
      <div
        style={{
          padding: '13px',
          borderRadius: '12px',
          background: '#0c1811',
          border:
            '1px solid #284334',
          marginBottom: '16px',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent:
              'space-between',
            alignItems:
              'flex-start',
            gap: '10px',
            marginBottom: '15px',
          }}
        >
          <div>
            <strong
              style={{
                fontSize: '15px',
              }}
            >
              Novo usuário
            </strong>

            <div
              className="muted"
              style={{
                marginTop: '3px',
                fontSize: '11px',
                lineHeight: 1.4,
              }}
            >
              Cadastre um militar
              ou usuário autorizado
              a acessar o sistema.
            </div>
          </div>

          <span
            style={{
              padding: '5px 8px',
              borderRadius: '999px',
              background: '#183d2a',
              border:
                '1px solid #284334',
              fontSize: '10px',
              fontWeight: 800,
              whiteSpace: 'nowrap',
            }}
          >
            ACESSO
          </span>
        </div>

        <form
          onSubmit={cadastrar}
          style={{
            display: 'grid',
            gap: '13px',
          }}
        >
          <label>
            Nome completo

            <input
              value={nome}
              onChange={(event) =>
                setNome(
                  event.target.value
                )
              }
              required
              minLength={2}
              maxLength={120}
              placeholder="Nome do usuário"
            />
          </label>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns:
                'repeat(2, minmax(0, 1fr))',
              gap: '9px',
            }}
          >
            <label>
              Posto/Graduação

              <input
                value={
                  postoGraduacao
                }
                onChange={(event) =>
                  setPostoGraduacao(
                    event.target
                      .value
                  )
                }
                placeholder="Ex.: 1º Sgt"
                maxLength={50}
              />
            </label>

            <label>
              Função

              <input
                value={funcao}
                onChange={(event) =>
                  setFuncao(
                    event.target.value
                  )
                }
                placeholder="Ex.: Adj Aprov"
                maxLength={100}
              />
            </label>
          </div>

          <label>
            Login

            <input
              value={login}
              onChange={(event) =>
                setLogin(
                  event.target.value
                )
              }
              required
              minLength={3}
              maxLength={50}
              autoCapitalize="none"
              autoCorrect="off"
              placeholder="Login de acesso"
            />
          </label>

          <label>
            Senha inicial

            <input
              type="password"
              value={senha}
              onChange={(event) =>
                setSenha(
                  event.target.value
                )
              }
              required
              minLength={8}
              maxLength={100}
              autoComplete="new-password"
              placeholder="Mínimo de 8 caracteres"
            />
          </label>

          <label>
            Perfil de acesso

            <select
              value={perfil}
              onChange={(event) =>
                setPerfil(
                  event.target
                    .value as Perfil
                )
              }
            >
              {perfis.map(
                (item) => (
                  <option
                    key={
                      item.valor
                    }
                    value={
                      item.valor
                    }
                  >
                    {item.nome}
                  </option>
                )
              )}
            </select>
          </label>

          <div
            style={{
              padding: '11px',
              borderRadius: '10px',
              background:
                'rgba(43,138,87,.06)',
              border:
                '1px solid rgba(43,138,87,.3)',
            }}
          >
            <strong
              style={{
                display: 'block',
                fontSize: '11px',
                marginBottom: '3px',
              }}
            >
              Perfil selecionado
            </strong>

            <span
              className="muted"
              style={{
                display: 'block',
                fontSize: '11px',
                lineHeight: 1.45,
              }}
            >
              {nomePerfil(perfil)}
            </span>
          </div>

          <button
            type="submit"
            className="btn"
            disabled={salvando}
            style={{
              width: '100%',
              minHeight: '46px',
            }}
          >
            {salvando
              ? 'Salvando...'
              : 'Cadastrar usuário'}
          </button>
        </form>
      </div>

      {erro && (
        <div
          role="alert"
          style={{
            padding: '12px',
            marginBottom: '14px',
            borderRadius: '11px',
            background:
              'rgba(239,68,68,.07)',
            border:
              '1px solid rgba(239,68,68,.55)',
            color: '#ef4444',
            fontSize: '12px',
            lineHeight: 1.45,
          }}
        >
          <strong>
            ⚠ {erro}
          </strong>
        </div>
      )}

      {sucesso && (
        <div
          role="status"
          style={{
            padding: '12px',
            marginBottom: '14px',
            borderRadius: '11px',
            background:
              'rgba(43,138,87,.08)',
            border:
              '1px solid rgba(43,138,87,.45)',
            fontSize: '12px',
            lineHeight: 1.45,
          }}
        >
          <strong>
            ✓ {sucesso}
          </strong>
        </div>
      )}

      <div
        style={{
          padding: '13px',
          borderRadius: '12px',
          background: '#0c1811',
          border:
            '1px solid #284334',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent:
              'space-between',
            alignItems: 'center',
            gap: '10px',
            marginBottom: '13px',
          }}
        >
          <div>
            <strong
              style={{
                fontSize: '15px',
              }}
            >
              Usuários cadastrados
            </strong>

            <div
              className="muted"
              style={{
                marginTop: '3px',
                fontSize: '11px',
              }}
            >
              {usuarios.length}{' '}
              usuário(s)
            </div>
          </div>

          <button
            type="button"
            onClick={() =>
              setMostrarUsuarios(
                (valor) =>
                  !valor
              )
            }
            style={{
              minHeight: '38px',
              padding: '8px 10px',
              borderRadius: '10px',
              border:
                '1px solid #284334',
              background: '#102018',
              color: '#fff',
              fontSize: '11px',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            {mostrarUsuarios
              ? 'Ocultar'
              : 'Mostrar'}
          </button>
        </div>

        {carregando && (
          <div
            style={{
              padding: '13px',
              borderRadius: '11px',
              background: '#102018',
              border:
                '1px solid #284334',
            }}
          >
            <span
              className="muted"
              style={{
                fontSize: '12px',
              }}
            >
              Carregando usuários...
            </span>
          </div>
        )}

        {!carregando &&
          mostrarUsuarios &&
          usuarios.length ===
            0 && (
            <div
              style={{
                padding: '13px',
                borderRadius: '11px',
                background: '#102018',
                border:
                  '1px solid #284334',
              }}
            >
              <span
                className="muted"
                style={{
                  fontSize: '12px',
                }}
              >
                Nenhum usuário
                encontrado.
              </span>
            </div>
          )}

        {!carregando &&
          mostrarUsuarios && (
            <div
              style={{
                display: 'grid',
                gap: '10px',
              }}
            >
              {usuarios.map(
                (usuario) => (
                  <article
                    key={
                      usuario.id
                    }
                    style={{
                      padding: '13px',
                      borderRadius:
                        '12px',
                      background:
                        '#102018',
                      border:
                        editandoId ===
                        usuario.id
                          ? '1px solid rgba(43,138,87,.75)'
                          : '1px solid #284334',
                    }}
                  >
                    {editandoId ===
                    usuario.id ? (
                      <form
                        onSubmit={
                          salvarEdicao
                        }
                        autoComplete="off"
                        style={{
                          display:
                            'grid',
                          gap: '13px',
                        }}
                      >
                        <div>
                          <strong
                            style={{
                              fontSize:
                                '15px',
                            }}
                          >
                            Editar usuário
                          </strong>

                          <div
                            className="muted"
                            style={{
                              marginTop:
                                '3px',
                              fontSize:
                                '11px',
                            }}
                          >
                            Altere os dados,
                            permissões ou a
                            situação da
                            conta.
                          </div>
                        </div>

                        <label>
                          Nome completo

                          <input
                            value={
                              nomeEdicao
                            }
                            onChange={(
                              event
                            ) =>
                              setNomeEdicao(
                                event.target
                                  .value
                              )
                            }
                            required
                            minLength={
                              2
                            }
                            maxLength={
                              120
                            }
                          />
                        </label>

                        <div
                          style={{
                            display:
                              'grid',
                            gridTemplateColumns:
                              'repeat(2, minmax(0, 1fr))',
                            gap: '9px',
                          }}
                        >
                          <label>
                            Posto/Graduação

                            <input
                              value={
                                postoGraduacaoEdicao
                              }
                              onChange={(
                                event
                              ) =>
                                setPostoGraduacaoEdicao(
                                  event
                                    .target
                                    .value
                                )
                              }
                              maxLength={
                                50
                              }
                            />
                          </label>

                          <label>
                            Função

                            <input
                              value={
                                funcaoEdicao
                              }
                              onChange={(
                                event
                              ) =>
                                setFuncaoEdicao(
                                  event
                                    .target
                                    .value
                                )
                              }
                              maxLength={
                                100
                              }
                            />
                          </label>
                        </div>

                        <label>
                          Login

                          <input
                            value={
                              loginEdicao
                            }
                            onChange={(
                              event
                            ) =>
                              setLoginEdicao(
                                event.target
                                  .value
                              )
                            }
                            required
                            minLength={
                              3
                            }
                            maxLength={
                              50
                            }
                            autoCapitalize="none"
                            autoCorrect="off"
                            autoComplete="off"
                          />
                        </label>

                        <label>
                          Perfil de acesso

                          <select
                            value={
                              perfilEdicao
                            }
                            onChange={(
                              event
                            ) =>
                              setPerfilEdicao(
                                event.target
                                  .value as Perfil
                              )
                            }
                          >
                            {perfis.map(
                              (
                                item
                              ) => (
                                <option
                                  key={
                                    item.valor
                                  }
                                  value={
                                    item.valor
                                  }
                                >
                                  {
                                    item.nome
                                  }
                                </option>
                              )
                            )}
                          </select>
                        </label>

                        <label>
                          Situação

                          <select
                            value={
                              situacaoEdicao
                            }
                            onChange={(
                              event
                            ) =>
                              setSituacaoEdicao(
                                event.target
                                  .value as Situacao
                              )
                            }
                          >
                            <option value="ATIVO">
                              Ativo
                            </option>

                            <option value="INATIVO">
                              Inativo
                            </option>
                          </select>
                        </label>

                        <div
                          style={{
                            padding:
                              '11px',
                            borderRadius:
                              '10px',
                            background:
                              situacaoEdicao ===
                              'ATIVO'
                                ? 'rgba(43,138,87,.07)'
                                : 'rgba(245,158,11,.07)',
                            border:
                              situacaoEdicao ===
                              'ATIVO'
                                ? '1px solid rgba(43,138,87,.35)'
                                : '1px solid rgba(245,158,11,.35)',
                          }}
                        >
                          <strong
                            style={{
                              display:
                                'block',
                              fontSize:
                                '11px',
                              marginBottom:
                                '3px',
                            }}
                          >
                            {situacaoEdicao ===
                            'ATIVO'
                              ? 'Acesso ativo'
                              : 'Acesso inativo'}
                          </strong>

                          <span
                            className="muted"
                            style={{
                              display:
                                'block',
                              fontSize:
                                '10px',
                              lineHeight:
                                1.45,
                            }}
                          >
                            {situacaoEdicao ===
                            'ATIVO'
                              ? 'O usuário permanece autorizado a acessar o sistema conforme seu perfil.'
                              : 'O usuário ficará marcado como inativo no sistema.'}
                          </span>
                        </div>

                        <div
                          style={{
                            padding:
                              '12px',
                            borderRadius:
                              '11px',
                            background:
                              'rgba(245,158,11,.06)',
                            border:
                              '1px solid rgba(245,158,11,.3)',
                            display:
                              'grid',
                            gap: '11px',
                          }}
                        >
                          <div>
                            <strong
                              style={{
                                display:
                                  'block',
                                fontSize:
                                  '12px',
                                marginBottom:
                                  '3px',
                              }}
                            >
                              Alterar senha
                            </strong>

                            <span
                              className="muted"
                              style={{
                                display:
                                  'block',
                                fontSize:
                                  '10px',
                                lineHeight:
                                  1.45,
                              }}
                            >
                              Para manter a
                              senha atual,
                              deixe os dois
                              campos abaixo
                              em branco.
                            </span>
                          </div>

                          <label>
                            Nova senha

                            <input
                              type="password"
                              value={
                                senhaEdicao
                              }
                              onChange={(
                                event
                              ) =>
                                setSenhaEdicao(
                                  event.target
                                    .value
                                )
                              }
                              minLength={
                                senhaEdicao
                                  ? 8
                                  : undefined
                              }
                              maxLength={
                                100
                              }
                              autoComplete="new-password"
                              placeholder="Mínimo de 8 caracteres"
                            />
                          </label>

                          <label>
                            Confirmar nova senha

                            <input
                              type="password"
                              value={
                                confirmarSenhaEdicao
                              }
                              onChange={(
                                event
                              ) =>
                                setConfirmarSenhaEdicao(
                                  event.target
                                    .value
                                )
                              }
                              minLength={
                                confirmarSenhaEdicao
                                  ? 8
                                  : undefined
                              }
                              maxLength={
                                100
                              }
                              autoComplete="new-password"
                              placeholder="Digite novamente a nova senha"
                            />
                          </label>
                        </div>

                        <div
                          style={{
                            display:
                              'grid',
                            gridTemplateColumns:
                              'repeat(2, minmax(0, 1fr))',
                            gap: '8px',
                          }}
                        >
                          <button
                            type="submit"
                            className="btn"
                            disabled={
                              salvando
                            }
                          >
                            {salvando
                              ? 'Salvando...'
                              : 'Salvar alterações'}
                          </button>

                          <button
                            type="button"
                            onClick={
                              cancelarEdicao
                            }
                            disabled={
                              salvando
                            }
                            style={{
                              minHeight:
                                '44px',
                              borderRadius:
                                '11px',
                              border:
                                '1px solid #284334',
                              background:
                                '#0c1811',
                              color:
                                '#fff',
                              fontWeight:
                                700,
                              cursor:
                                'pointer',
                            }}
                          >
                            Cancelar
                          </button>
                        </div>
                      </form>
                    ) : (
                      <>
                        <div
                          style={{
                            display:
                              'flex',
                            justifyContent:
                              'space-between',
                            alignItems:
                              'flex-start',
                            gap: '10px',
                            paddingBottom:
                              '11px',
                            marginBottom:
                              '11px',
                            borderBottom:
                              '1px solid rgba(255,255,255,.07)',
                          }}
                        >
                          <div
                            style={{
                              minWidth:
                                0,
                              flex: 1,
                            }}
                          >
                            <strong
                              style={{
                                display:
                                  'block',
                                fontSize:
                                  '14px',
                                lineHeight:
                                  1.35,
                              }}
                            >
                              {usuario.postoGraduacao
                                ? `${usuario.postoGraduacao} `
                                : ''}
                              {
                                usuario.nome
                              }
                            </strong>

                            <div
                              className="muted"
                              style={{
                                marginTop:
                                  '4px',
                                fontSize:
                                  '11px',
                              }}
                            >
                              {usuario.funcao ||
                                'Função não informada'}
                            </div>
                          </div>

                          <span
                            style={{
                              padding:
                                '4px 7px',
                              borderRadius:
                                '999px',
                              background:
                                usuario.situacao ===
                                'ATIVO'
                                  ? 'rgba(43,138,87,.12)'
                                  : 'rgba(245,158,11,.10)',
                              border:
                                usuario.situacao ===
                                'ATIVO'
                                  ? '1px solid rgba(43,138,87,.45)'
                                  : '1px solid rgba(245,158,11,.4)',
                              fontSize:
                                '10px',
                              fontWeight:
                                800,
                              whiteSpace:
                                'nowrap',
                            }}
                          >
                            {
                              usuario.situacao
                            }
                          </span>
                        </div>

                        <div
                          style={{
                            display:
                              'grid',
                            gap: '8px',
                          }}
                        >
                          <div
                            style={{
                              padding:
                                '10px',
                              borderRadius:
                                '10px',
                              background:
                                '#0c1811',
                              border:
                                '1px solid #284334',
                            }}
                          >
                            <div
                              className="muted"
                              style={{
                                fontSize:
                                  '9px',
                                marginBottom:
                                  '3px',
                              }}
                            >
                              LOGIN
                            </div>

                            <strong
                              style={{
                                fontSize:
                                  '12px',
                              }}
                            >
                              {
                                usuario.login
                              }
                            </strong>
                          </div>

                          <div
                            style={{
                              padding:
                                '10px',
                              borderRadius:
                                '10px',
                              background:
                                '#0c1811',
                              border:
                                '1px solid #284334',
                            }}
                          >
                            <div
                              className="muted"
                              style={{
                                fontSize:
                                  '9px',
                                marginBottom:
                                  '3px',
                              }}
                            >
                              PERFIL DE ACESSO
                            </div>

                            <strong
                              style={{
                                fontSize:
                                  '12px',
                              }}
                            >
                              {nomePerfil(
                                usuario.perfil
                              )}
                            </strong>
                          </div>

                          <div
                            style={{
                              padding:
                                '10px',
                              borderRadius:
                                '10px',
                              background:
                                '#0c1811',
                              border:
                                '1px solid #284334',
                            }}
                          >
                            <div
                              className="muted"
                              style={{
                                fontSize:
                                  '9px',
                                marginBottom:
                                  '3px',
                              }}
                            >
                              ÚLTIMO ACESSO
                            </div>

                            <span
                              style={{
                                fontSize:
                                  '11px',
                                lineHeight:
                                  1.4,
                              }}
                            >
                              {formatarData(
                                usuario.ultimoAcesso
                              )}
                            </span>
                          </div>
                        </div>

                        <button
                          type="button"
                          className="btn"
                          onClick={() =>
                            iniciarEdicao(
                              usuario
                            )
                          }
                          style={{
                            width:
                              '100%',
                            marginTop:
                              '12px',
                          }}
                        >
                          Editar usuário
                        </button>
                      </>
                    )}
                  </article>
                )
              )}
            </div>
          )}
      </div>
    </>
  );
}
