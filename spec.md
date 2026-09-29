# Especificação Técnica: Sistema de Logística e Delivery (End-to-End)

## 1. Visão Geral do Sistema
Plataforma composta por um sistema Web (Gestão/Admin) e um aplicativo Android (Operação de Campo/Delivery). O objetivo é gerenciar o ciclo de vida de equipamentos (ex: antenas Starlink, suportes) desde o estoque inicial (Depósito 01), consolidação em pacotes para transporte (Depósitos 2, 3 e 4), desmembramento (Depósito 05) e entrega final ao cliente (Delivery).

## 2. Perfis de Usuário (RBAC)
* **Administrador (Web):** Possui controle total. Pode visualizar dashboards, auditar movimentações, realizar ajustes de saldo manual e deletar pacotes (tratamento de extravios/avarias).
* **Operador de Depósito (Android):** Atua no chão de fábrica/depósito. Utiliza a câmera do celular para ler QR Codes/Códigos de Barras, montar pacotes, registrar entrada/saída de depósitos intermediários e desmontar pacotes.
* **Entregador (Android):** Acessa apenas o módulo de delivery. Visualiza pedidos despachados, rotas e confirma a entrega unitária ao cliente final.

## 3. Modelagem de Dados (Entidades Principais)
* **Produto:** `id`, `sku`, `nome` (ex: Starlink Mini, Suporte Magnético), `categoria`.
* **Estoque_Local:** `deposito_id`, `produto_id`, `quantidade_disponivel`.
* **Pacote (Lote):** `id`, `codigo_rastreio` (QR Code), `status` (CRIADO, EM_TRANSITO, DESMONTADO, EXTRAVIADO), `deposito_atual_id`, `data_criacao`.
* **Pacote_Item:** `pacote_id`, `produto_id`, `quantidade`.
* **Movimentacao_Log:** `id`, `pacote_id`, `deposito_id`, `usuario_id`, `acao` (CRIACAO, RECEBIMENTO, DESMONTAGEM, EXCLUSAO_ADMIN), `timestamp`.
* **Pedido_Delivery:** `id`, `cliente_nome`, `endereco`, `status` (PENDENTE, EM_ROTA, ENTREGUE), `entregador_id`.
* **Pedido_Item:** `pedido_id`, `produto_id`, `quantidade`.

## 4. Especificações da Plataforma Web (Admin)
### 4.1. Dashboard Geral
* **KPIs:** Total de pacotes em trânsito, pacotes entregues no dia, alertas de atraso.
* **Visão de Estoque:** Tabela dividida mostrando o saldo de produtos unitários no Depósito 01 (Origem) e no Depósito 05 (Ponta Final).

### 4.2. Gestão de Pacotes (Tracking)
* **Tabela/Grid:** Lista todos os pacotes ativos. Colunas: ID, Código, Status, Depósito Atual, Última Atualização.
* **Tratamento de Exceções (Admin Override):** Ao clicar em um pacote, o admin deve ter um botão restrito por senha/perfil para `Excluir Pacote` (caso danificado/extraviado). Isso deve gerar um log de auditoria e não deve retornar o saldo para o estoque automaticamente (o ajuste físico será feito via inventário).

### 4.3. Gestão de Estoque (Depósito 05)
* **Ajuste Manual:** Tela onde o Admin pode selecionar o Depósito 05 e forçar a alteração de saldo de um produto específico (para corrigir divergências físicas, como falta de item ao abrir o pacote).

## 5. Especificações do App Android (Operação)
### 5.1. Fluxo de Leitura (Scanner)
* A tela principal do operador deve ser um Scanner de QR Code nativo.
* **Lógica de Estado via Scanner:** O app identifica a ação com base no status do pacote lido e no depósito vinculado ao usuário logado.

### 5.2. Ações por Depósito
* **Depósito 01 (Consolidação):**
  * Operador clica em "Criar Novo Pacote".
  * Informa a quantidade de itens (ex: 10 Starlinks, 10 Suportes).
  * O sistema gera um QR Code (Pacote 01), deduz do estoque unitário do Depósito 01 e altera o status do pacote para `EM_TRANSITO`.
* **Depósitos 02, 03 e 04 (Trânsito):**
  * Operador lê o QR Code do pacote.
  * O sistema registra a `Movimentacao_Log`, atualiza o `deposito_atual_id` e exibe mensagem de sucesso na tela: *"Pacote X recebido no Depósito Y"*.
* **Depósito 05 (Desmontagem/Fracionamento):**
  * Operador lê o QR Code.
  * O sistema identifica que está no destino final e exige confirmação: "Desmontar Pacote?".
  * Ao confirmar, o status do pacote muda para `DESMONTADO`.
  * **Ação de Banco de Dados:** O sistema lê a tabela `Pacote_Item` e *soma* as quantidades no saldo da tabela `Estoque_Local` do Depósito 05.

### 5.3. Módulo de Delivery (Entregador)
* **Lista de Pedidos:** Mostra pedidos com status `PENDENTE` despachados do Depósito 05.
* **Detalhes da Entrega:** Nome do cliente, endereço e itens a serem entregues (ex: 1 Starlink, 1 Suporte de Sucção).
* **Checkout de Entrega:** Botão "Confirmar Entrega" que finaliza o processo, deduzindo permanentemente os itens da operação.

## 6. Endpoints de API Críticos (Sugestão de Contrato)
* `POST /api/pacotes/criar` - Payload: lista de itens e depósito de origem. Retorna o ID/QR Code do pacote.
* `POST /api/pacotes/{codigo}/movimentar` - Payload: depósito de destino, usuário. Atualiza a localização.
* `POST /api/pacotes/{codigo}/desmontar` - Aciona a trigger/serviço que converte o pacote em saldo unitário no Depósito 05.
* `DELETE /api/admin/pacotes/{codigo}` - Exclusão lógica/física do pacote restrita a perfil de admin.
* `PUT /api/admin/estoque/{deposito_id}/ajuste` - Atualização manual do estoque para correção de divergências.