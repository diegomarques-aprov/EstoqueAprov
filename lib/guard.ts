import { currentUser } from './auth';

type Perfil =
  | 'ADMIN_PRINCIPAL'
  | 'ADMINISTRADOR'
  | 'CHEFE_DEPOSITO'
  | 'GRADUADO_SERVICO';

function erroSessao() {
  return Response.json(
    {
      error:
        'Sessão expirada. Entre novamente.',
    },
    {
      status: 401,
    }
  );
}

function erroPermissao(
  mensagem: string
) {
  return Response.json(
    {
      error: mensagem,
    },
    {
      status: 403,
    }
  );
}

async function requirePerfis(
  perfis: Perfil[],
  mensagem: string
) {
  const u = await currentUser();

  if (!u) {
    return {
      error: erroSessao(),
    };
  }

  if (
    !perfis.includes(
      u.perfil as Perfil
    )
  ) {
    return {
      error:
        erroPermissao(
          mensagem
        ),
    };
  }

  return {
    user: u,
  };
}

/*
 * ADMINISTRAÇÃO
 *
 * Cadastros, configurações,
 * relatórios, QDAA e demais
 * funções administrativas.
 */

export async function requireAdmin() {
  return requirePerfis(
    [
      'ADMIN_PRINCIPAL',
      'ADMINISTRADOR',
    ],
    'Esta operação exige perfil de Administrador.'
  );
}

/*
 * ESTOQUE INICIAL
 *
 * Permitido para:
 * - Administrador Principal
 * - Administrador
 * - Chefe do Depósito
 *
 * O Graduado de Serviço não
 * realiza implantação do estoque.
 */

export async function requireEstoqueInicial() {
  return requirePerfis(
    [
      'ADMIN_PRINCIPAL',
      'ADMINISTRADOR',
      'CHEFE_DEPOSITO',
    ],
    'Você não possui permissão para registrar o estoque inicial.'
  );
}

/*
 * OPERAÇÕES DE ESTOQUE
 *
 * Recebimentos, saídas,
 * devoluções, ajustes e demais
 * movimentações operacionais.
 *
 * Permitido para:
 * - Administrador Principal
 * - Administrador
 * - Chefe do Depósito
 * - Graduado de Serviço
 */

export async function requireOperacaoEstoque() {
  return requirePerfis(
    [
      'ADMIN_PRINCIPAL',
      'ADMINISTRADOR',
      'CHEFE_DEPOSITO',
      'GRADUADO_SERVICO',
    ],
    'Você não possui permissão para realizar esta operação de estoque.'
  );
}

/*
 * EFETIVO / FECHAMENTO DIÁRIO
 *
 * Permitido para:
 * - Administrador Principal
 * - Administrador
 * - Graduado de Serviço
 *
 * O Chefe do Depósito não necessita
 * realizar o controle do efetivo.
 */

export async function requireEfetivo() {
  return requirePerfis(
    [
      'ADMIN_PRINCIPAL',
      'ADMINISTRADOR',
      'GRADUADO_SERVICO',
    ],
    'Você não possui permissão para realizar operações de efetivo e fechamento diário.'
  );
}
