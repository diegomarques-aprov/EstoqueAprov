import Link from 'next/link';
import {
  redirect,
  notFound,
} from 'next/navigation';

import { currentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

import ReceberCompraQRClient from '@/components/ReceberCompraQRClient';
import NavegacaoInferior from '@/components/NavegacaoInferior';

export default async function Page({
  params,
}: {
  params: Promise<{
    id: string;
  }>;
}) {
  const usuario =
    await currentUser();

  if (!usuario) {
    redirect('/login');
  }

  const { id } =
    await params;

  const [
    compraBanco,
    locaisBanco,
  ] = await Promise.all([
    prisma.compraQR.findUnique({
      where: {
        id,
      },

      include: {
        itens: {
          include: {
            genero: {
              include: {
                unidade: true,
              },
            },

            recebimentos: true,
          },
        },
      },
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

  if (!compraBanco) {
    notFound();
  }

  const compra = {
    id: compraBanco.id,

    numero:
      compraBanco.numero,

    status:
      compraBanco.status,

    fornecedor:
      compraBanco.fornecedor,

    itens:
      compraBanco.itens.map(
        (item) => ({
          id: item.id,

          generoId:
            item.generoId,

          nome:
            item.genero.nome,

          unidade:
            item.genero.unidade.sigla,

          controlaLote:
            item.genero.controlaLote,

          controlaValidade:
            item.genero.controlaValidade,

          quantidade:
            Number(
              item.quantidade
            ),

          recebida:
            item.recebimentos.reduce(
              (total, recebimento) =>
                total +
                Number(
                  recebimento.quantidade
                ),
              0
            ),

          valorUnitarioEmpenhado:
            item.valorUnitarioEmpenhado ==
            null
              ? null
              : Number(
                  item.valorUnitarioEmpenhado
                ),
        })
      ),
  };

  const locais =
    locaisBanco.map(
      (local) => ({
        id: local.id,
        nome: local.nome,
      })
    );

  return (
    <main>
      <Link
        className="back"
        href="/qr/financeiro"
      >
        ← Recursos e Compras QR
      </Link>

      <h1>
        Receber compra QR nº{' '}
        {compraBanco.numero}
      </h1>

      <p className="muted">
        Registre recebimentos parciais ou
        totais sem alterar o empenho
        original.
      </p>

      <ReceberCompraQRClient
        compra={compra}
        locais={locais}
      />

      <NavegacaoInferior
        voltarHref="/qr/financeiro"
        voltarTexto="Recursos e Compras QR"
      />
    </main>
  );
}
