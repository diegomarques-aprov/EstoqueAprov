# EstoqueAprov — V1.1 Fundação funcional

Primeira base executável do PWA de controle do Aprovisionamento.

## Implementado
- Next.js + TypeScript
- PostgreSQL + Prisma
- configuração inicial protegida (primeiro Administrador Principal)
- login/logout com sessão HTTP-only e senha com bcrypt
- guarda de permissões administrativas no backend
- cadastro/listagem de locais de armazenamento
- cadastro/listagem separada de gêneros QS e QR
- categorias e unidades padronizadas
- FLV com padrão sem lote e Câmara de Resfriamento como local habitual
- auditoria para criação de administrador, locais e gêneros
- validações orientativas básicas e prevenção de duplicidade

## Executar localmente
1. Copie `.env.example` para `.env` e configure um PostgreSQL.
2. `npm install`
3. `npm run db:generate`
4. `npm run db:push`
5. `npm run db:seed`
6. `npm run dev`
7. Abra `http://localhost:3000`.

> Em produção, troque `AUTH_SECRET`, use HTTPS e PostgreSQL com backups automáticos.

## Teste funcional V1.1
1. Criar Administrador Principal.
2. Fazer logout/login.
3. Conferir/cadastrar Câmara de Resfriamento.
4. Cadastrar Tomate em QR / FLV / kg: o formulário sugere sem lote e Câmara de Resfriamento.
5. Cadastrar um gênero QR.
6. Reabrir o sistema e confirmar persistência.

## Próxima fase — V1.2
Estoque inicial, recebimentos, lotes quando aplicáveis, localização física e movimentações de entrada.


## V1.2
- Estoque inicial por QS/QR
- Controle de localização física
- Lotes apenas quando o gênero exigir
- API transacional de recebimentos QS/QR
- Movimentações SALDO_INICIAL e RECEBIMENTO com auditoria
- Consulta de estoque atual por classificação

## V1.3.1 — movimentações especiais
- Devolução vinculada à saída original, sem apagar a saída.
- Transferência interna entre locais sem alterar o saldo total.
- Perda/descarte com motivo obrigatório e baixa fora do consumo de refeição.
- Correção de estoque por ajuste rastreável, sem sobrescrever histórico.
- Cancelamento de saída com reversão das movimentações; saídas com devolução prévia exigem regularização por correção para evitar dupla reposição.


## V1.4 - Gestão e Relatórios
- Efetivo alimentado independente e atualizável por data/refeição.
- Relatórios por período e classe QS/QR.
- Resumo de movimentações, perdas, devoluções e correções.
- Alertas de estoque mínimo e validade.
- Dashboard operacional com atalhos e alertas clicáveis.

## V1.5 — Recursos e Compras QR
- Saldo de crédito QR calculado por movimentações financeiras, sem edição direta do saldo.
- Entrada de novos recursos com descrição, documento, observação, responsável e data/hora.
- Compra/empenho QR mostra saldo antes e saldo projetado depois da operação.
- Bloqueio orientativo quando o crédito é insuficiente.
- Itens de compra vinculados exclusivamente a gêneros QR ativos, com quantidade, custo estimado e custo empenhado.
- Histórico financeiro preserva saldo anterior, valor da movimentação, saldo resultante, documento, responsável e vínculo com a compra.
- Compra/empenho permanece separada do recebimento físico, preparando o fluxo de recebimentos parciais da próxima evolução.


## V1.5.1 — Recebimento vinculado à compra QR
- Compra/empenho permanece separado do recebimento físico.
- Recebimentos QR podem ser parciais ou totais e ficam vinculados ao item empenhado.
- O sistema calcula quantidade recebida e saldo pendente por item.
- Impede recebimento acima da quantidade empenhada.
- Atualiza a compra para PARCIALMENTE_RECEBIDA ou RECEBIDA automaticamente.
- Recebimento alimenta estoque, lote/validade/local e histórico de movimentação sem alterar o empenho financeiro original.
- Registra valor unitário real do recebimento para futura comparação estimado × empenhado × recebido.

## V1.5.2 — Acompanhamento financeiro x físico QR
- Compras QR agora exibem comparativo entre valor estimado, empenhado e valor real efetivamente recebido.
- Cada item mostra quantidade empenhada, quantidade recebida acumulada e saldo pendente.
- Recebimentos parciais são consolidados automaticamente no acompanhamento da compra.
- Diferença entre valor real recebido e valor empenhado fica visível para conferência administrativa.
- O empenho financeiro original permanece preservado; o recebimento físico não altera silenciosamente o histórico do crédito QR.

## V1.5.3 — Cancelamento e estorno de empenho QR
- Empenho QR sem recebimento físico pode ser cancelado com motivo obrigatório.
- O cancelamento não apaga a compra nem o empenho original: cria uma movimentação financeira ESTORNO.
- O crédito empenhado retorna ao saldo disponível e ficam preservados saldo anterior, saldo resultante, usuário, documento, data e motivo.
- Empenho com recebimento físico parcial ou total não pode ser cancelado integralmente, evitando inconsistência entre estoque e financeiro.
- Compras canceladas permanecem visíveis no acompanhamento com status CANCELADA.

## V1.6 — Preparação para hospedagem
- Configuração TypeScript/Next.js adicionada ao projeto.
- Build standalone habilitado para implantação em servidor/container.
- Dockerfile e .dockerignore adicionados.
- Manifesto PWA incluído para instalação no iPhone/computador pelo navegador.
- Variáveis de produção mantidas fora do código (`DATABASE_URL` e `AUTH_SECRET`).
- Endpoint `/api/health` disponível para verificação do serviço.
- Runtime preparado para Node.js 20/22 e PostgreSQL.

### Variáveis obrigatórias em produção
- `DATABASE_URL`: conexão PostgreSQL da hospedagem.
- `AUTH_SECRET`: chave longa, aleatória e exclusiva da instalação.
- `NODE_ENV=production`.

### Implantação
1. Disponibilizar o código na hospedagem/repositório.
2. Configurar as variáveis de ambiente.
3. Gerar o Prisma Client (`npm run db:generate`).
4. Aplicar o schema/migrações no PostgreSQL.
5. Executar `npm run build` e `npm start`, ou usar o Dockerfile.
6. Acessar `/api/health` e então concluir a Configuração Inicial pelo navegador.

> O provedor da hospedagem contratada ainda precisa ser identificado para preencher os comandos/campos específicos do painel sem adivinhar configurações.
