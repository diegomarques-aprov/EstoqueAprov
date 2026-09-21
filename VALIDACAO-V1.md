# Validação operacional — candidata à v1.0

Fluxos obrigatórios antes da liberação:
1. Administrador cadastra/edita usuários, gêneros QS e QR, fornecedores, locais, valores e crédito QR.
2. Recebimento QS soma ao saldo existente, com lote, validade, valor e PVPS.
3. Recebimento QR soma ao saldo; FLV permanece sem lote quando aplicável e exige conferência diária.
4. Saques múltiplos do mesmo gênero no dia acumulam corretamente.
5. Destino → Finalidade respeita: Cozinha, Padaria, Cassino, Catanho e Missões em geral.
6. Devolução de sobra de hoje ou ontem retorna ao estoque e não supera a saída disponível.
7. Perda/descarte reduz saldo e permanece separada de consumo.
8. Painel do depósito mostra bruto, devolvido, líquido e saldo final.
9. Fechamento diário é enviado pelo Graduado de Serviço; Administrador confirma ou reabre com motivo.
10. Correção de dia reaberto é auditada e o relatório pode ser reenviado.
11. QDAA consolida o mês e apoia ressuprimento QS bimestral.
12. Planejamento QR verifica necessidade, custo provável e crédito disponível.
13. Lembretes incluem QDAA dia 25, dedetização bimestral e câmaras frias mensal.
14. Cardápio semanal e FLV orientam uso de perecíveis.
15. Inventário registra divergência entre sistema e contagem física.
16. Ajuda e Verificação do Sistema funcionam conforme o perfil.
17. PWA abre em modo standalone e atualização não mantém cache antigo do app.
