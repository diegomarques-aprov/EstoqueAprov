import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/guard';

export async function GET(req: Request) {
  const guard = await requireAdmin();

  if (guard.error) {
    return guard.error;
  }

  const classe = new URL(
    req.url
  ).searchParams.get('classe');

  const rows =
    await prisma.estoqueLocal.findMany({
      where: {
        genero: {
          situacao: 'ATIVO',
          ...(classe === 'QS' ||
          classe === 'QR'
            ? { classe }
            : {}),
        },
      },

      include: {
        genero: {
          include: {
            unidade: true,

            categoria: {
              include: {
                grupo: true,
              },
            },
          },
        },

        local: true,
        lote: true,
      },

      orderBy: [
        {
          genero: {
            categoria: {
              grupo: {
                nome: 'asc',
              },
            },
          },
        },
        {
          genero: {
            categoria: {
              nome: 'asc',
            },
          },
        },
        {
          genero: {
            nome: 'asc',
          },
        },
      ],
    });

  return Response.json(
    rows.map((item) => ({
      ...item,
      quantidade: Number(
        item.quantidade
      ),
    }))
  );
}
