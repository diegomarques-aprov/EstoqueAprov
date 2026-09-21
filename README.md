# Estoque Aprov v0.18.0

PWA para controle de estoque de gêneros alimentícios.

## Novidades da v0.18.0
- Relatórios gerenciais por período.
- Consumo agrupado por Café, Almoço, Janta, Ceia e demais destinos.
- Posição atual do estoque com estoque mínimo e próxima validade.
- Relatório diário pronto para impressão ou salvamento em PDF pelo navegador.
- Inventário físico: registra saldo do sistema, contagem física e divergência por gênero.
- Histórico de inventários.
- Mantém login, perfis, PEPS, lotes, validade, correções auditadas e fechamento diário da v0.4.0.

## Perfis iniciais de demonstração
- Sgt Diego Marques — Adj Aprov — Administrador
- Ten Vicente — Aprovisionador — Administrador
- Sgt Castro — Chefe do Depósito — Gestor de Estoque
- Graduado de Serviço — Conferência diária

As senhas iniciais permanecem as definidas na v0.4.0 e devem ser alteradas antes de uso real.

## Executar
```bash
npm install
npm start
```
Abra `http://localhost:3000`.

## Próximas etapas
Módulo Ajuda por perfil, créditos/contato, refinamento de permissões, backup/restauração e publicação HTTPS para instalação como PWA no iPhone.


## Novidades v0.18.0
- Entradas classificadas por origem **QS** (cadeia de suprimento) ou **QR** (aquisição fora da cadeia), sempre somadas ao saldo existente.
- Regra operacional **PVPS — Primeiro que Vence, Primeiro que Sai**, com prioridade para lotes de validade mais próxima e orientação de fácil acesso físico no depósito.
- Módulo **Lembretes**, com QDAA mensal (dia 25), dedetização bimestral e verificação mensal das câmaras frias.
- QDAA passa a consolidar consumo mensal e apoiar o **ressuprimento bimestral de QS** para a próxima vinda do Batalhão de Suprimento.
- Projeção inicial de ressuprimento: consumo mensal × 2 menos saldo atual. É uma ferramenta de apoio e exige conferência do responsável.


## Novidades v0.18.0
- Fórmula oficial de estoque: **Saldo final = estoque inicial + quantidades recebidas - quantidades consumidas**.
- QS e QR permanecem identificados na origem, mas ambos compõem o saldo físico total.
- **Planejamento semanal QR** baseado em saldo atual e consumo recente.
- QR é tratado como aquisição variável, condicionada à disponibilidade de crédito para empenho.
- A previsão QR não gera entrada nem altera saldo; somente o recebimento físico lançado no sistema altera o estoque.
- Exemplos de QR: frutas, temperos, sucos, biscoitos, farinhas e outros gêneros adquiridos fora da cadeia.


## Novidades v0.18.0
- Cadastro do gênero com modalidade **QS**, **QR** ou **QS/QR**.
- Alertas de estoque baixo, crítico e em falta para qualquer gênero, independentemente da origem.
- Ação sugerida conforme modalidade: ressuprimento/QDAA para QS; avaliação de aquisição conforme crédito para QR.
- Cadastro de **perecibilidade**.
- Itens de alta perecibilidade, como frutas, legumes e verduras, recebem alerta de validade antecipado (janela de 7 dias) e destaque reforçado para PVPS.


## Novidades v0.18.0
- **Cardápio semanal** cadastrado pelo Administrador, pensado para ser preparado às sextas-feiras para a semana seguinte.
- Cadastro de Café, Almoço, Janta e Ceia por dia.
- **Conferência diária de FLV**: frutas, legumes e verduras de alta perecibilidade em estoque.
- A conferência mostra automaticamente o **cardápio do próximo dia**.
- Orientação operacional para verificar deterioração e priorizar aproveitamento dos perecíveis conforme cardápio e PVPS.
- O cardápio é planejamento e não movimenta estoque automaticamente.


## Novidades v0.18.0
- **Perda / descarte** como movimentação própria, sem contabilizar como consumo do rancho.
- Motivos de perda: deterioração, vencimento, embalagem avariada, contaminação/impróprio e outros.
- A perda reduz o saldo utilizando os lotes prioritários pelo PVPS e gera auditoria.
- **Devolução ao estoque** vinculada à saída original.
- Devoluções aumentam novamente o saldo do lote original, preservando rastreabilidade.
- Bloqueio para impedir devolução acima da quantidade originalmente retirada.


## Novidades v0.18.0
- Indicadores de **perdas e desperdício por período**.
- Ranking por gênero, quantidade perdida e taxa de perda.
- Taxa de perda calculada como `perda / (consumo + perda)`.
- Destaques para maior perda absoluta e maior taxa percentual.
- Totais específicos para **FLV/perecíveis** e para gêneros **QR / QS-QR**.
- Perdas continuam separadas do consumo normal do rancho.
- Relatório preparado para impressão/salvamento em PDF pelo navegador.


## Novidades v0.18.0
- QDAA mensal consolidado por gênero com: estoque inicial, recebido QS, recebido QR, devoluções, consumo, perdas e saldo final.
- Fórmula operacional exibida no sistema: **Saldo final = Estoque inicial + Recebido QS + Recebido QR + Devoluções - Consumo - Perdas**.
- Perdas permanecem separadas do consumo.
- Planejamento do próximo ressuprimento QS aparece em seção independente e nunca altera o estoque real.
- Planejamento QR passa a considerar o cadastro do gênero como QR ou QS/QR, mesmo antes de existir um lote QR anterior.


## Novidades v0.18.0 — Custos e crédito QR
- Valor unitário de referência no cadastro do gênero.
- Valor unitário real em cada recebimento QS ou QR e histórico de preços.
- Valor total calculado por lote/entrada.
- Compras QR debitam automaticamente o saldo de crédito disponível.
- Administrador pode lançar novas entradas de recurso/crédito QR.
- Extrato financeiro preserva créditos e débitos, responsável, data e documento.
- Relatório de custos por período, separado por gênero e origem QS/QR.
- Perdas/descarte passam a ter impacto financeiro estimado com base no custo do lote.
- Corrigido envio da origem QS/QR no formulário de recebimento.
- Terminologia de saída corrigida para PVPS.


## Novidades v0.18.0 — Planejamento QR x crédito disponível
- Planejamento QR agora consulta automaticamente o saldo de crédito disponível.
- Usa o preço QR mais recente do histórico; se não houver, usa o valor de referência do gênero.
- Calcula custo estimado por item e custo total provável da compra.
- Mostra automaticamente **CRÉDITO SUFICIENTE** ou **CRÉDITO INSUFICIENTE**.
- Informa sobra estimada ou déficit necessário para realizar a aquisição.
- O planejamento não debita crédito e não altera estoque.
- O débito financeiro continua ocorrendo somente no recebimento/compra QR efetivamente registrado.


## Novidades v0.18.0 — Assistente operacional e validações orientativas
- Modal central de assistência para avisos de informação faltante.
- Erros de procedimento deixam de aparecer apenas como mensagens técnicas e passam a explicar o que falta.
- Validação visual dos campos obrigatórios em formulários.
- Recebimento, saída, perda e devolução verificam pré-requisitos antes de abrir/concluir o fluxo.
- Devolução orienta quando não existe saída original.
- Planejamento QR avisa quando gêneros necessários não possuem preço de referência.
- Cadastro de gênero QR exige valor unitário de referência.
- Todo recebimento QS/QR exige valor unitário válido.
- Compra/recebimento QR é bloqueada quando o crédito disponível é insuficiente, informando compra, saldo e valor faltante.
- Mensagens seguem o padrão: “Para executar este procedimento, falta...”, com indicação do próximo passo quando aplicável.


## Novidades v0.18.0 — Refatoração estrutural
- Inicialização e migrações do SQLite movidas para `database/db.js`.
- Regras críticas extraídas para `services/businessRules.js`.
- Rotas financeiras movidas para `routes/financeiro.js`.
- Planejamento QR movido para `routes/planejamentoQr.js`.
- QDAA passou a usar função centralizada de cálculo de saldo.
- Criada suíte inicial de testes automáticos com `node:test`.
- Testes cobrem saldo físico, PVPS, crédito QR, planejamento de compra e QDAA.
- Estrutura preparada para continuar separando estoque, recebimentos, saídas, relatórios e cardápio em módulos independentes.


## Novidades v0.18.0 — Modularização completa do núcleo operacional
- `routes/estoque.js`: gêneros, lotes, recebimentos, saídas, perdas, devoluções, movimentações e correções.
- `routes/fechamento.js`: conferência, envio e decisão do fechamento diário.
- `routes/alertas.js`: alertas de validade/estoque e auditoria.
- `routes/relatorios.js`: consumo, estoque, relatório diário e indicadores de perdas.
- `routes/inventarios.js`: inventários e divergências.
- `routes/lembretes.js`: lembretes operacionais e recorrências.
- `routes/qdaa.js`: QDAA mensal e planejamento de ressuprimento QS.
- `routes/cardapio.js`: cardápio semanal e conferência FLV.
- Mantidos módulos independentes de financeiro e planejamento QR.
- PVPS centralizado em `services/businessRules.js`.
- Crédito QR centralizado em regra de negócio reutilizável.
- Corrigido retorno da saída para `pvps:true`.
- Permissão de lembretes adicionada a Administrador e Gestor de Estoque.
- Adicionados lembretes-base de conferência diária FLV e cardápio semanal.
- Lembretes agora suportam recorrência diária e semanal, além de mensal/bimestral.
- Middleware global de erros reposicionado após todas as rotas.


## Novidades v0.18.0 — Rotina operacional FLV e lembretes inteligentes
- Criadas tabelas `conferencias_flv` e `conferencia_flv_itens`.
- Conferência diária FLV passa a ser registrada de forma permanente, com responsável e observações.
- Cada gênero perecível pode ser classificado como `OK`, `ATENCAO` ou `DESCARTE`.
- Itens marcados para descarte exigem quantidade afetada antes da conclusão.
- A tela FLV informa se a conferência do dia está PENDENTE ou CONCLUÍDA.
- A conferência mostra o cardápio do dia seguinte; se ele estiver ausente, o assistente orienta o usuário.
- Ao concluir FLV, o lembrete diário é atualizado automaticamente.
- Ao cadastrar o cardápio semanal, o lembrete semanal é atualizado automaticamente.
- Lembretes de FLV e cardápio não podem mais ser concluídos manualmente sem executar a rotina correspondente.
- O painel principal passou a exibir rotinas operacionais vencidas, do dia e próximas.
- Alertas de rotina têm botão direto para abrir FLV, cardápio ou central de lembretes.


## Novidades v0.19.0 — Fechamento diário inteligente
- Criado checklist automático antes do envio do relatório diário.
- O sistema verifica saídas sem destino e sem data de consumo.
- Verifica correções sem justificativa, quantidades inválidas e perdas sem motivo.
- Quando há FLV em estoque, exige a Conferência diária FLV concluída antes do envio.
- Ausência do cardápio do dia seguinte aparece como aviso orientativo, sem impedir o fechamento.
- Pendências são classificadas em bloqueantes e avisos.
- O botão de envio fica indisponível enquanto houver pendência bloqueante.
- A API também impede o envio, evitando contornar a validação pela interface.
- O Graduado de Serviço recebe mensagem clara com o que falta e o próximo passo.
- Resumo do fechamento passou a exibir entradas, saídas, perdas, devoluções e correções.


## Novidades v0.20.0 — Relatório diário completo e tramitação
- Relatório diário ganhou cabeçalho e apresentação própria para conferência.
- Incluídos resumo de entradas, saídas, perdas e devoluções.
- Incluído resumo por destino e detalhamento das movimentações.
- Cada linha informa gênero, quantidade, lote, referência de consumo e responsável.
- Movimentações corrigidas são identificadas no relatório.
- Relatório informa status, Graduado de Serviço, data/hora de envio, Administrador, decisão e data/hora de análise.
- Incluído status da Conferência diária FLV.
- Incluídas observações do fechamento.
- Criado histórico de tramitação com envio, confirmação e reabertura registrados em auditoria.
- Mantida opção de impressão / geração de PDF pelo navegador.


## Novidades v0.21.0 — Análise do Administrador e ciclo de correção
- Administrador só pode decidir relatórios com status ENVIADO.
- Confirmação encerra e bloqueia o dia.
- Reabertura exige motivo obrigatório da divergência.
- Administrador pode registrar orientação adicional para a correção.
- Motivo e orientação ficam vinculados ao fechamento e aparecem no relatório diário.
- Reabertura fica registrada na auditoria com motivo e orientação.
- Após correções, o Graduado de Serviço pode reenviar o relatório ao Administrador.
- O sistema registra quem realizou o reenvio após correção e quando ocorreu.
- Histórico passa a distinguir envio inicial, reabertura, correção/reenvio e confirmação final.


## Novidades v0.22.0 — Painel central do Administrador
- Criado endpoint exclusivo `/api/admin-dashboard` para Administradores.
- Painel mostra relatórios aguardando análise e dias reabertos para correção.
- Exibe quantidade de gêneros em estoque crítico/zerado e lotes próximos do vencimento.
- Mostra rotinas operacionais atrasadas/do dia/próximas.
- Mostra situação da Conferência FLV do dia quando houver perecíveis em estoque.
- Exibe crédito QR disponível e total de compras QR do mês.
- Prioridades administrativas são listadas com atalhos diretos para análise do fechamento, FLV, lembretes, financeiro e alertas.
- Contadores de estoque crítico e validade usam totais reais, enquanto a lista mostra apenas os itens prioritários para manter a tela enxuta.


## Novidades v0.23.0 — Painel do Chefe do Depósito e saque diário
- Criado painel específico para Gestor de Estoque/Chefe do Depósito.
- Exibe, por data, quanto foi sacado de cada gênero.
- O cálculo considera somente movimentações do tipo SAÍDA pela data da retirada.
- Perdas e devoluções ficam fora do total de saque diário.
- Mostra quantidade sacada, unidade de medida, modalidade QS/QR/QS-QR e número de movimentos.
- Mostra consolidação por unidade de medida (kg, L, un etc.), evitando somar grandezas diferentes.
- Mostra também distribuição das saídas por destino/refeição.
- O Administrador também pode consultar esse painel.


## Novidades v0.24.0 — Saques acumulados e devoluções de sobras
- O Chefe do Depósito pode registrar múltiplos saques do mesmo gênero no mesmo dia; o painel soma automaticamente todas as SAÍDAS.
- O painel diferencia `Sacado bruto`, `Devolvido no dia` e `Líquido do dia` por gênero.
- Consolidação por unidade de medida também usa movimento líquido.
- Devoluções podem utilizar saídas de hoje ou do dia anterior.
- A tela de devolução mostra a quantidade ainda disponível para retorno em cada saída.
- Uma devolução nunca pode ultrapassar a quantidade originalmente sacada menos devoluções anteriores.
- Criado vínculo estruturado `referencia_movimentacao_id` entre DEVOLUÇÃO e SAÍDA original, mantendo compatibilidade com registros antigos.
- Sobras de uma saída do dia anterior podem retornar hoje ao estoque sem alterar o registro histórico do saque original.
- Auditoria da devolução registra a data da saída original e a data efetiva do retorno.


## Novidades v0.25.0 — Saque bruto, devolução e líquido no Relatório Diário
- Relatório Diário passa a consolidar todos os saques do mesmo gênero realizados no dia.
- Para cada gênero são exibidos `Sacado bruto`, `Devolvido`, `Líquido` e quantidade de saques.
- Fórmula operacional apresentada: Líquido = Sacado bruto - Devolvido no dia.
- A consolidação por unidade de medida evita somar kg, litros e unidades entre si.
- O detalhamento das devoluções informa a saída original quando existe `referencia_movimentacao_id`.
- Saques continuam registrados individualmente para auditoria, mesmo quando o relatório apresenta o total acumulado do gênero.
- Devoluções do dia anterior permanecem vinculadas ao saque original, mas entram no movimento de devolução da data em que retornaram fisicamente ao estoque.


## Novidades v0.26.0 — Situação do estoque após os movimentos do dia
- Painel do Chefe do Depósito passa a mostrar como ficou o estoque após todas as movimentações da data selecionada.
- Para cada gênero relevante são exibidos saldo inicial, entradas, saídas, devoluções, perdas e saldo final.
- Fórmula operacional usada: `Saldo final = saldo inicial + entradas + devoluções - saídas - perdas`.
- Cada gênero recebe situação `OK`, `BAIXO` ou `EM_FALTA` conforme o estoque mínimo.
- Itens que ficaram abaixo do mínimo permanecem destacados no painel.
- A visão complementa o resumo de sacado bruto, devolvido e líquido, permitindo acompanhar tanto o movimento quanto o saldo resultante.


## Novidades v0.27.0 — Destino e finalidade operacional do saque
- Saídas passam a usar estrutura hierárquica `Destino → Finalidade`.
- Cozinha: Café, Almoço, Janta e Ceia.
- Padaria: Ceia, Café e Coffee Break.
- Cassino: Ceia e Café.
- Catanho: General, Estado Maior e Visitantes autorizados.
- Missões em geral: Campo, Instrução e Outros.
- A finalidade é obrigatória e validada também no servidor.
- Auditoria registra destino e finalidade.
- Painel do Chefe do Depósito e Relatório Diário passam a discriminar as saídas por destino/finalidade.

## v0.90.0 — Consolidação candidata à v1.0
- Preservada toda a base operacional validada da v0.27.0.
- QDAA passa a exibir explicitamente a fórmula administrativa definida: Saldo final = Estoque inicial + quantidades recebidas - quantidades consumidas.
- A conciliação operacional continua separando devoluções e perdas para rastreabilidade, sem confundir a fórmula principal do QDAA.
- Criada Verificação do Sistema, somente leitura, para apontar lotes vencidos com saldo, gêneros sem valor de referência, estoque mínimo não definido, QS sem lote, FLV pendente e fechamentos aguardando ação.
- Criada Ajuda por perfil: Administrador, Gestor de Estoque/Chefe do Depósito e Graduado de Serviço.
- Ajuda consolida PVPS, saques, devoluções, FLV, destinos/finalidades, QDAA e ressuprimento.
- Créditos identificam 1º Sgt Diego Marques — Adj Aprov; telefone/e-mail ficam preparados para cadastro administrativo, evitando dados pessoais fixos no código.
