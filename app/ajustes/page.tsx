import Link from 'next/link';
import { redirect } from 'next/navigation';
import { currentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import AjustesClient from '@/components/AjustesClient';

export default async function Page() {
  const usuario = await currentUser();

  if (!usuario) {
    redirect('/login');
  }

  /*
   * PERFIS AUTORIZADOS
   *
   * Ajustes e movimentações especiais
   * fazem parte da operação do estoque.
   */
  if (
    ![
      'ADMIN_PRINCIPAL',
      'ADMINISTRADOR',
      'CHEFE_DEPOSITO',
      'GRADUADO_SERVICO',
    ].includes(usuario.perfil)
  ) {
    redirect('/inicio');
  }

  const [
    estoques,
    saidasBanco,
    locaisBanco,
  ] = await Promise.all([
    prisma.estoqueLocal.findMany({
      include: {
        genero: {
          include: {
            unidade: true,
          },
        },

        local: true,
        lote: true,
      },

      orderBy: {
        genero: {
          nome: 'asc',
        },
      },
    }),

    prisma.saida.findMany({
      include: {
        itens: {
          include: {
            genero: {
              include: {
                unidade: true,
              },
            },
          },
        },
      },

      orderBy: {
        criadoEm: 'desc',
      },

      take: 50,
    }),

    prisma.localArmazenamento.findMany({
      where: {
        situacao: 'ATIVO',
      },

      orderBy: {
        nome: 'asc',
      },
    }),
  ]);

  const rows = estoques.map(
    (item) => ({
      id: item.id,

      genero:
        item.genero.nome,

      classe:
        item.genero.classe,

      unidade:
        item.genero.unidade.sigla,

      local:
        item.local.nome,

      localId:
        item.localId,

      lote:
        item.lote?.numero ||
        null,

      quantidade:
        Number(
          item.quantidade
        ),
    })
  );

  const saidas = saidasBanco.map(
    (saida) => ({
      id: saida.id,

      numero:
        saida.numero,

      classe:
        saida.classe,

      destino:
        saida.destino,

      data:
        saida.data.toISOString(),

      cancelada:
        !!saida.canceladaEm,

      itens:
        saida.itens.map(
          (item) => ({
            generoId:
              item.generoId,

            genero:
              item.genero.nome,

            unidade:
              item.genero.unidade
                .sigla,

            quantidade:
              Number(
                item.quantidade
              ),
          })
        ),
    })
  );

  const locais = locaisBanco.map(
    (local) => ({
      id: local.id,
      nome: local.nome,
    })
  );

  return (
    <main>
      <Link
        className="back"
        href="/inicio"
      >
        ← Início
      </Link>

      <h1>
        Ajustes e movimentações
        especiais
      </h1>

      <AjustesClient
        rows={rows}
        saidas={saidas}
        locais={locais}
      />
    </main>
  );
}
