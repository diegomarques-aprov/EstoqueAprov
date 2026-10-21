import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { currentUser } from '@/lib/auth';

const perfisPermitidos = [
  'ADMIN_PRINCIPAL',
  'ADMINISTRADOR',
  'CHEFE_DEPOSITO',
  'GRADUADO_SERVICO',
] as const;

const criarUsuarioSchema = z.object({
  nome: z.string().trim().min(2).max(120),

  postoGraduacao: z
    .string()
    .trim()
    .max(50)
    .nullable()
    .optional(),

  funcao: z
    .string()
    .trim()
    .max(100)
    .nullable()
    .optional(),

  login: z
    .string()
    .trim()
    .min(3)
    .max(50),

  senha: z
    .string()
    .min(8)
    .max(100),

  perfil: z.enum(perfisPermitidos),
});

const atualizarUsuarioSchema = z.object({
  id: z.string().min(1),

  nome: z.string().trim().min(2).max(120),

  postoGraduacao: z
    .string()
    .trim()
    .max(50)
    .nullable()
    .optional(),

  funcao: z
    .string()
    .trim()
    .max(100)
    .nullable()
    .optional(),

  login: z
    .string()
    .trim()
    .min(3)
    .max(50),

  perfil: z.enum(perfisPermitidos),

  situacao: z.enum([
    'ATIVO',
    'INATIVO',
  ]),

  senha: z
    .string()
    .max(100)
    .optional(),
});

async function exigirAdministradorPrincipal() {
  const usuario = await currentUser();

  if (!usuario) {
    return {
      usuario: null,
      erro: Response.json(
        {
          error:
            'Sessão não encontrada. Faça login novamente.',
        },
        { status: 401 }
      ),
    };
  }

  if (
    usuario.perfil !==
    'ADMIN_PRINCIPAL'
  ) {
    return {
      usuario,
      erro: Response.json(
        {
          error:
            'Somente o Administrador Principal pode gerenciar usuários.',
        },
        { status: 403 }
      ),
    };
  }

  return {
    usuario,
    erro: null,
  };
}

function textoOpcional(
  valor: string | null | undefined
) {
  const texto = valor?.trim();

  return texto || null;
}

export async function GET() {
  const acesso =
    await exigirAdministradorPrincipal();

  if (acesso.erro) {
    return acesso.erro;
  }

  const usuarios =
    await prisma.usuario.findMany({
      select: {
        id: true,
        nome: true,
        postoGraduacao: true,
        funcao: true,
        login: true,
        perfil: true,
        situacao: true,
        ultimoAcesso: true,
        criadoEm: true,
      },

      orderBy: [
        {
          situacao: 'asc',
        },
        {
          nome: 'asc',
        },
      ],
    });

  return Response.json(usuarios);
}

export async function POST(
  req: Request
) {
  const acesso =
    await exigirAdministradorPrincipal();

  if (acesso.erro) {
    return acesso.erro;
  }

  try {
    const body =
      criarUsuarioSchema.parse(
        await req.json()
      );

    const login =
      body.login.trim();

    const usuarioExistente =
      await prisma.usuario.findUnique({
        where: {
          login,
        },
      });

    if (usuarioExistente) {
      return Response.json(
        {
          error:
            'Já existe um usuário com este login.',
        },
        { status: 409 }
      );
    }

    const senhaHash =
      await bcrypt.hash(
        body.senha,
        12
      );

    const novoUsuario =
      await prisma.usuario.create({
        data: {
          nome:
            body.nome.trim(),

          postoGraduacao:
            textoOpcional(
              body.postoGraduacao
            ),

          funcao:
            textoOpcional(
              body.funcao
            ),

          login,

          senhaHash,

          perfil:
            body.perfil,

          situacao:
            'ATIVO',
        },

        select: {
          id: true,
          nome: true,
          postoGraduacao: true,
          funcao: true,
          login: true,
          perfil: true,
          situacao: true,
          ultimoAcesso: true,
          criadoEm: true,
        },
      });

    await prisma.auditoria.create({
      data: {
        usuarioId:
          acesso.usuario!.id,

        acao: 'CRIAR',

        entidade: 'Usuario',

        entidadeId:
          novoUsuario.id,

        dadosNovos: {
          nome:
            novoUsuario.nome,

          postoGraduacao:
            novoUsuario.postoGraduacao,

          funcao:
            novoUsuario.funcao,

          login:
            novoUsuario.login,

          perfil:
            novoUsuario.perfil,

          situacao:
            novoUsuario.situacao,
        },
      },
    });

    return Response.json(
      novoUsuario,
      { status: 201 }
    );
  } catch (erro) {
    if (
      erro instanceof z.ZodError
    ) {
      return Response.json(
        {
          error:
            erro.issues[0]
              ?.message ||
            'Verifique os dados informados para o novo usuário.',
        },
        { status: 400 }
      );
    }

    console.error(erro);

    return Response.json(
      {
        error:
          'Não foi possível cadastrar o usuário.',
      },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: Request
) {
  const acesso =
    await exigirAdministradorPrincipal();

  if (acesso.erro) {
    return acesso.erro;
  }

  try {
    const body =
      atualizarUsuarioSchema.parse(
        await req.json()
      );

    const usuarioAtual =
      await prisma.usuario.findUnique({
        where: {
          id: body.id,
        },
      });

    if (!usuarioAtual) {
      return Response.json(
        {
          error:
            'Usuário não encontrado.',
        },
        { status: 404 }
      );
    }

    const login =
      body.login.trim();

    const loginEmUso =
      await prisma.usuario.findFirst({
        where: {
          login,
          id: {
            not: body.id,
          },
        },
      });

    if (loginEmUso) {
      return Response.json(
        {
          error:
            'Já existe outro usuário com este login.',
        },
        { status: 409 }
      );
    }

    /*
     * Proteções do Administrador Principal
     */
    if (
      body.id ===
        acesso.usuario!.id &&
      body.situacao ===
        'INATIVO'
    ) {
      return Response.json(
        {
          error:
            'Você não pode desativar o seu próprio usuário.',
        },
        { status: 400 }
      );
    }

    if (
      body.id ===
        acesso.usuario!.id &&
      body.perfil !==
        'ADMIN_PRINCIPAL'
    ) {
      return Response.json(
        {
          error:
            'Você não pode remover o seu próprio perfil de Administrador Principal.',
        },
        { status: 400 }
      );
    }

    /*
     * Impede que o sistema fique sem
     * Administrador Principal ativo.
     */
    if (
      usuarioAtual.perfil ===
        'ADMIN_PRINCIPAL' &&
      usuarioAtual.situacao ===
        'ATIVO' &&
      (body.perfil !==
        'ADMIN_PRINCIPAL' ||
        body.situacao ===
          'INATIVO')
    ) {
      const quantidadeAdministradoresPrincipais =
        await prisma.usuario.count({
          where: {
            perfil:
              'ADMIN_PRINCIPAL',
            situacao:
              'ATIVO',
          },
        });

      if (
        quantidadeAdministradoresPrincipais <=
        1
      ) {
        return Response.json(
          {
            error:
              'O sistema precisa manter pelo menos um Administrador Principal ativo.',
          },
          { status: 400 }
        );
      }
    }

    const novaSenha =
      body.senha?.trim();

    const senhaHash =
      novaSenha &&
      novaSenha.length >= 8
        ? await bcrypt.hash(
            novaSenha,
            12
          )
        : undefined;

    if (
      novaSenha &&
      novaSenha.length > 0 &&
      novaSenha.length < 8
    ) {
      return Response.json(
        {
          error:
            'A nova senha deve possuir pelo menos 8 caracteres.',
        },
        { status: 400 }
      );
    }

    const usuarioAtualizado =
      await prisma.usuario.update({
        where: {
          id: body.id,
        },

        data: {
          nome:
            body.nome.trim(),

          postoGraduacao:
            textoOpcional(
              body.postoGraduacao
            ),

          funcao:
            textoOpcional(
              body.funcao
            ),

          login,

          perfil:
            body.perfil,

          situacao:
            body.situacao,

          ...(senhaHash
            ? {
                senhaHash,
              }
            : {}),
        },

        select: {
          id: true,
          nome: true,
          postoGraduacao: true,
          funcao: true,
          login: true,
          perfil: true,
          situacao: true,
          ultimoAcesso: true,
          criadoEm: true,
        },
      });

    await prisma.auditoria.create({
      data: {
        usuarioId:
          acesso.usuario!.id,

        acao:
          'ALTERAR',

        entidade:
          'Usuario',

        entidadeId:
          usuarioAtualizado.id,

        dadosAnteriores: {
          nome:
            usuarioAtual.nome,

          postoGraduacao:
            usuarioAtual.postoGraduacao,

          funcao:
            usuarioAtual.funcao,

          login:
            usuarioAtual.login,

          perfil:
            usuarioAtual.perfil,

          situacao:
            usuarioAtual.situacao,
        },

        dadosNovos: {
          nome:
            usuarioAtualizado.nome,

          postoGraduacao:
            usuarioAtualizado.postoGraduacao,

          funcao:
            usuarioAtualizado.funcao,

          login:
            usuarioAtualizado.login,

          perfil:
            usuarioAtualizado.perfil,

          situacao:
            usuarioAtualizado.situacao,

          senhaAlterada:
            Boolean(
              senhaHash
            ),
        },
      },
    });

    return Response.json(
      usuarioAtualizado
    );
  } catch (erro) {
    if (
      erro instanceof z.ZodError
    ) {
      return Response.json(
        {
          error:
            erro.issues[0]
              ?.message ||
            'Verifique os dados informados para o usuário.',
        },
        { status: 400 }
      );
    }

    console.error(erro);

    return Response.json(
      {
        error:
          'Não foi possível atualizar o usuário.',
      },
      { status: 500 }
    );
  }
}
