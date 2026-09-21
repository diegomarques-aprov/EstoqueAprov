# EstoqueAprov v1.0.0

Primeira versão operacional consolidada do PWA para controle de gêneros alimentícios do Aprovisionamento.

## Escopo homologado
- Perfis e permissões: Administrador, Gestor de Estoque/Chefe do Depósito e Graduado de Serviço.
- Cadastro de gêneros QS/QR, fornecedores, locais, valores e estoque mínimo.
- Recebimentos com soma ao saldo existente.
- Controle por lote e validade quando aplicável; FLV sem exigência de lote.
- PVPS — Primeiro que Vence, Primeiro que Sai.
- Saques múltiplos no mesmo dia e consolidação por gênero.
- Destino → Finalidade: Cozinha, Padaria, Cassino, Catanho e Missões em geral.
- Devoluções vinculadas à saída original, inclusive sobra do dia anterior.
- Perdas/descarte e correções auditadas.
- Saldo final, alertas de estoque baixo/em falta e validade.
- Conferência diária de FLV e apoio pelo cardápio semanal.
- Crédito QR, compras e planejamento financeiro.
- Relatório diário, envio pelo Graduado de Serviço, análise/reabertura/confirmação pelo Administrador.
- Inventário e divergência físico x sistema.
- QDAA mensal e apoio ao ressuprimento QS bimestral.
- Lembretes operacionais e Verificação do Sistema.
- Ajuda por perfil.
- PWA instalável/standalone com controle de cache.

## Regra de saldo
QDAA: Saldo final = Estoque inicial + quantidades recebidas - quantidades consumidas.
Conciliação operacional mantém devoluções e perdas discriminadas para rastreabilidade.

## Homologação automatizada
12 testes de regras de negócio compõem a suíte da v1.0.0.
