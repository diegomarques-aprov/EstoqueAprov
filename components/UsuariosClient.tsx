'use client';

import { useEffect, useState } from 'react';

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

function nomePerfil(perfil: Perfil) {
  return (
    perfis.find(
      (item) => item.valor === perfil
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

  const [carregando, setCarregando] =
    useState(true);

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
  const [editandoId, setEditandoId] =
    useState<string | null>(null);

  const [nomeEdicao, setNomeEdicao] =
    useState('');

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
  ] = useState<Situacao>('ATIVO');

  const [
    senhaEdicao,
    setSenhaEdicao,
  ] = useState('');

  async function carregar() {
    setCarregando(true);
    setErro('');

    try {
      const resposta = await fetch(
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
      const resposta = await fetch(
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
              postoGraduacao || null,
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

      setSucesso(
        'Usuário cadastrado com sucesso.'
      );

      await carregar();
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

    setEditandoId(usuario.id);

    setNomeEdicao(
      usuario.nome
    );

    setPostoGraduacaoEdicao(
      usuario.postoGraduacao || ''
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
  }

  function cancelarEdicao() {
    setEditandoId(null);
    setSenhaEdicao('');
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
    setSalvando(true);

    try {
      const resposta = await fetch(
        '/api/usuarios',
        {
          method: 'PUT',

          headers: {
            'Content-Type':
              'application/json',
          },

          body: JSON.stringify({
            id: editandoId,
            nome: nomeEdicao,
            postoGraduacao:
              postoGraduacaoEdicao ||
              null,
            funcao:
              funcaoEdicao || null,
            login: loginEdicao,
            perfil: perfilEdicao,
            situacao:
              situacaoEdicao,
            senha: senhaEdicao,
          }),
        }
      );

      const dados =
        await resposta.json();

      if (!resposta.ok) {
        setErro(
          dados.error ||
            'Não foi possível atualizar o usuário.'
        );

        return;
      }

      setEditandoId(null);
      setSenhaEdicao('');

      setSucesso(
        'Usuário atualizado com sucesso.'
      );

      await carregar();
    } catch {
      setErro(
        'Não foi possível atualizar o usuário.'
      );
    } finally {
      setSalvando(false);
    }
  }

  return (
    <>
      <div className="card">
        <h2>Novo usuário</h2>

        <p className="muted">
          Cadastre os militares ou usuários
          que terão acesso ao EstoqueAprov.
          Em caso de esquecimento da senha,
          o Administrador Principal poderá
          redefini-la sem alterar o histórico
          do usuário.
        </p>

        <form onSubmit={cadastrar}>
          <label>
            Nome completo
          </label>

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
          />

          <label>
            Posto/Graduação
          </label>

          <input
            value={postoGraduacao}
            onChange={(event) =>
              setPostoGraduacao(
                event.target.value
              )
            }
            placeholder="Ex.: 1º Sgt"
            maxLength={50}
          />

          <label>
            Função
          </label>

          <input
            value={funcao}
            onChange={(event) =>
              setFuncao(
                event.target.value
              )
            }
            placeholder="Ex.: Chefe do Depósito"
            maxLength={100}
          />

          <label>
            Login
          </label>

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
          />

          <label>
            Senha inicial
          </label>

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
          />

          <label>
            Perfil de acesso
          </label>

          <select
            value={perfil}
            onChange={(event) =>
              setPerfil(
                event.target
                  .value as Perfil
              )
            }
          >
            {perfis.map((item) => (
              <option
                key={item.valor}
                value={item.valor}
              >
                {item.nome}
              </option>
            ))}
          </select>

          <div
            className="actions"
            style={{
              marginTop: 16,
            }}
          >
            <button
              className="btn"
              disabled={salvando}
            >
              {salvando
                ? 'Salvando...'
                : 'Cadastrar usuário'}
            </button>
          </div>
        </form>
      </div>

      {erro && (
        <div
          className="card"
          style={{
            border:
              '1px solid #ef4444',
          }}
        >
          <p
            style={{
              margin: 0,
              color: '#ef4444',
            }}
          >
            {erro}
          </p>
        </div>
      )}

      {sucesso && (
        <div
          className="card"
          style={{
            border:
              '1px solid #22c55e',
          }}
        >
          <p style={{ margin: 0 }}>
            {sucesso}
          </p>
        </div>
      )}

      <div className="card">
        <div
          style={{
            display: 'flex',
            justifyContent:
              'space-between',
            alignItems: 'center',
            gap: 12,
            flexWrap: 'wrap',
          }}
        >
          <div>
            <h2
              style={{
                marginBottom: 4,
              }}
            >
              Usuários cadastrados
            </h2>

            <span className="muted">
              {usuarios.length}{' '}
              usuário(s)
            </span>
          </div>

          <button
            type="button"
            className="btn secondary"
            onClick={() =>
              setMostrarUsuarios(
                (valor) => !valor
              )
            }
          >
            {mostrarUsuarios
              ? 'Ocultar usuários'
              : 'Mostrar usuários'}
          </button>
        </div>

        {carregando && (
          <p className="muted">
            Carregando usuários...
          </p>
        )}

        {!carregando &&
          mostrarUsuarios &&
          usuarios.length === 0 && (
            <p className="muted">
              Nenhum usuário encontrado.
            </p>
          )}

        {!carregando &&
          mostrarUsuarios &&
          usuarios.map((usuario) => (
            <div
              className="row"
              key={usuario.id}
              style={{
                display: 'block',
                marginTop: 14,
              }}
            >
              {editandoId ===
              usuario.id ? (
                <form
                  onSubmit={
                    salvarEdicao
                  }
                >
                  <h3>
                    Editar usuário
                  </h3>

                  <label>
                    Nome completo
                  </label>

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
                    minLength={2}
                    maxLength={120}
                  />

                  <label>
                    Posto/Graduação
                  </label>

                  <input
                    value={
                      postoGraduacaoEdicao
                    }
                    onChange={(
                      event
                    ) =>
                      setPostoGraduacaoEdicao(
                        event.target
                          .value
                      )
                    }
                    maxLength={50}
                  />

                  <label>
                    Função
                  </label>

                  <input
                    value={
                      funcaoEdicao
                    }
                    onChange={(
                      event
                    ) =>
                      setFuncaoEdicao(
                        event.target
                          .value
                      )
                    }
                    maxLength={100}
                  />

                  <label>
                    Login
                  </label>

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
                    minLength={3}
                    maxLength={50}
                    autoCapitalize="none"
                    autoCorrect="off"
                  />

                  <label>
                    Perfil de acesso
                  </label>

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
                      (item) => (
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

                  <label>
                    Situação
                  </label>

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

                  <label>
                    Nova senha
                  </label>

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
                    placeholder="Deixe em branco para manter a senha atual"
                    maxLength={100}
                    autoComplete="new-password"
                  />

                  <p className="muted">
                    Em caso de esquecimento,
                    o Administrador Principal
                    pode definir uma nova senha
                    para este mesmo usuário.
                    O histórico de movimentações
                    permanece preservado.
                  </p>

                  <div className="actions">
                    <button
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
                      className="btn secondary"
                      onClick={
                        cancelarEdicao
                      }
                      disabled={
                        salvando
                      }
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
                      gap: 12,
                      flexWrap:
                        'wrap',
                    }}
                  >
                    <div>
                      <strong>
                        {usuario.postoGraduacao
                          ? `${usuario.postoGraduacao} `
                          : ''}
                        {usuario.nome}
                      </strong>

                      <div className="muted">
                        {usuario.funcao ||
                          'Função não informada'}
                      </div>
                    </div>

                    <strong>
                      {usuario.situacao ===
                      'ATIVO'
                        ? 'ATIVO'
                        : 'INATIVO'}
                    </strong>
                  </div>

                  <div
                    style={{
                      marginTop: 10,
                    }}
                  >
                    <div>
                      Login:{' '}
                      <strong>
                        {usuario.login}
                      </strong>
                    </div>

                    <div>
                      Perfil:{' '}
                      <strong>
                        {nomePerfil(
                          usuario.perfil
                        )}
                      </strong>
                    </div>

                    <div className="muted">
                      Último acesso:{' '}
                      {formatarData(
                        usuario.ultimoAcesso
                      )}
                    </div>
                  </div>

                  <div
                    className="actions"
                    style={{
                      marginTop: 12,
                    }}
                  >
                    <button
                      type="button"
                      className="btn secondary"
                      onClick={() =>
                        iniciarEdicao(
                          usuario
                        )
                      }
                    >
                      Editar usuário
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
      </div>
    </>
  );
}
