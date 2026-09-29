
    // --- Initial State & Mock DB ---
    const STORAGE_KEY = 'nexuslog_state_v1';

    // --- Hardened UI Utils (Toasts & Confirms) ---
    function showToast(message, type = 'success') {
      const container = document.getElementById('toast-container');
      const toast = document.createElement('div');
      
      const colors = {
        success: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
        error: 'bg-red-500/10 border-red-500/20 text-red-400',
        info: 'bg-blue-500/10 border-blue-500/20 text-blue-400'
      };
      
      const icons = {
        success: '✓',
        error: '✕',
        info: 'ℹ'
      };

      toast.className = `flex items-center gap-3 px-4 py-3 rounded-xl border ${colors[type]} backdrop-blur-md shadow-lg transform transition-all duration-300 translate-y-4 opacity-0`;
      toast.innerHTML = `<span class="font-bold">${icons[type]}</span><span class="text-xs font-medium">${message}</span>`;
      
      container.appendChild(toast);
      
      // Animate in
      requestAnimationFrame(() => {
        toast.classList.remove('translate-y-4', 'opacity-0');
      });
      
      // Animate out after 3.5s
      setTimeout(() => {
        toast.classList.add('opacity-0', 'scale-95');
        setTimeout(() => toast.remove(), 300);
      }, 3500);
    }

    let confirmCallback = null;
    function showConfirm(message, onConfirm, isDestructive = false) {
      document.getElementById('app-confirm-text').innerText = message;
      const btn = document.getElementById('app-confirm-btn');
      
      if (isDestructive) {
        btn.className = 'px-5 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white font-medium text-xs transition-colors shadow-lg';
      } else {
        btn.className = 'px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs transition-colors shadow-lg';
      }

      confirmCallback = onConfirm;
      document.getElementById('app-confirm-modal').classList.remove('hidden');
    }

    function closeAppConfirm() {
      document.getElementById('app-confirm-modal').classList.add('hidden');
      confirmCallback = null;
    }

    document.getElementById('app-confirm-btn').addEventListener('click', () => {
      if (confirmCallback) confirmCallback();
      closeAppConfirm();
    });


    function getInitialState() {
      return {
        inventories: {
          depot_1: {
            'SKU-STARLINK-MINI': { name: 'Starlink Mini (Antena)', category: 'Equipamento', qty: 120 },
            'SKU-MOUNT-MAG': { name: 'Suporte Magnético', category: 'Acessórios', qty: 250 },
            'SKU-CABLE-ETH': { name: 'Cabo Ethernet Reforçado 15m', category: 'Cabos', qty: 180 },
            'SKU-POWER-DC': { name: 'Fonte de Alimentação DC 12V', category: 'Energia', qty: 95 }
          },
          depot_5: {
            'SKU-STARLINK-MINI': { name: 'Starlink Mini (Antena)', category: 'Equipamento', qty: 15 },
            'SKU-MOUNT-MAG': { name: 'Suporte Magnético', category: 'Acessórios', qty: 30 },
            'SKU-CABLE-ETH': { name: 'Cabo Ethernet Reforçado 15m', category: 'Cabos', qty: 20 },
            'SKU-POWER-DC': { name: 'Fonte de Alimentação DC 12V', category: 'Energia', qty: 10 }
          }
        },
        packages: [
          { code: 'PKG-101', status: 'EM_TRANSITO', depotId: 'depot_2', sku: 'SKU-STARLINK-MINI', qty: 10, updatedAt: new Date(Date.now() - 3600000 * 2).toISOString() },
          { code: 'PKG-102', status: 'EM_TRANSITO', depotId: 'depot_3', sku: 'SKU-MOUNT-MAG', qty: 25, updatedAt: new Date(Date.now() - 3600000 * 55).toISOString() }, // Stalled > 48h for alert
          { code: 'PKG-103', status: 'DESMONTADO', depotId: 'depot_5', sku: 'SKU-CABLE-ETH', qty: 15, updatedAt: new Date(Date.now() - 3600000 * 12).toISOString() }
        ],
        auditLogs: [
          { timestamp: new Date(Date.now() - 3600000 * 2).toISOString(), packageCode: 'PKG-101', depot: 'Depósito 01', user: 'Op. Silva (ID: 04)', action: 'CRIACAO (Consolidação)' },
          { timestamp: new Date(Date.now() - 3600000 * 55).toISOString(), packageCode: 'PKG-102', depot: 'Depósito 01', user: 'Op. Silva (ID: 04)', action: 'CRIACAO (Consolidação)' }
        ],
        deliveryOrders: [
          { id: 'ORD-801', client: 'Fazenda Santa Rita', address: 'Rodovia BR-163, Km 42 - Zona Rural', status: 'PENDENTE', items: '1x Starlink Mini, 1x Magnetic Mount' },
          { id: 'ORD-802', client: 'Cooperativa Agrícola Sul', address: 'Av. das Nações, 1420 - Centro', status: 'PENDENTE', items: '2x Ethernet Cable 15m, 1x DC Power Supply' }
        ]
      };
    }

    let db = JSON.parse(localStorage.getItem(STORAGE_KEY)) || getInitialState();

    function saveDB() {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
      renderAll();
    }

    function resetDemoData() {
      db = getInitialState();
      saveDB();
    }

    // --- Navigation Tabs ---
    function switchTab(tab) {
      document.getElementById('tab-admin').classList.add('hidden');
      document.getElementById('tab-scanner').classList.add('hidden');
      document.getElementById('tab-delivery').classList.add('hidden');

      document.getElementById('nav-btn-admin').className = 'px-4 py-1.5 rounded-full transition-all duration-300 text-neutral-400 hover:text-white';
      document.getElementById('nav-btn-scanner').className = 'px-4 py-1.5 rounded-full transition-all duration-300 text-neutral-400 hover:text-white';
      document.getElementById('nav-btn-delivery').className = 'px-4 py-1.5 rounded-full transition-all duration-300 text-neutral-400 hover:text-white';

      document.getElementById('mob-btn-admin').className = 'flex flex-col items-center gap-1 p-2 w-full text-neutral-500 hover:text-neutral-300 transition-colors';
      document.getElementById('mob-btn-scanner').className = 'flex flex-col items-center gap-1 p-2 w-full text-neutral-500 hover:text-neutral-300 transition-colors';
      document.getElementById('mob-btn-delivery').className = 'flex flex-col items-center gap-1 p-2 w-full text-neutral-500 hover:text-neutral-300 transition-colors';

      if (tab === 'admin') {
        document.getElementById('tab-admin').classList.remove('hidden');
        document.getElementById('nav-btn-admin').className = 'px-4 py-1.5 rounded-full transition-all duration-300 text-white bg-white/10 shadow-sm';
        document.getElementById('mob-btn-admin').className = 'flex flex-col items-center gap-1 p-2 w-full text-white transition-colors';
      } else if (tab === 'scanner') {
        document.getElementById('tab-scanner').classList.remove('hidden');
        document.getElementById('nav-btn-scanner').className = 'px-4 py-1.5 rounded-full transition-all duration-300 text-white bg-white/10 shadow-sm';
        document.getElementById('mob-btn-scanner').className = 'flex flex-col items-center gap-1 p-2 w-full text-white transition-colors';
        updateScannerUI();
      } else if (tab === 'delivery') {
        document.getElementById('tab-delivery').classList.remove('hidden');
        document.getElementById('nav-btn-delivery').className = 'px-4 py-1.5 rounded-full transition-all duration-300 text-white bg-white/10 shadow-sm';
        document.getElementById('mob-btn-delivery').className = 'flex flex-col items-center gap-1 p-2 w-full text-white transition-colors';
        renderDeliveryOrders();
      }
    }

    // --- Modal Controls ---
    function openModal(id) { document.getElementById(id).classList.remove('hidden'); }
    function closeModal(id) { document.getElementById(id).classList.add('hidden'); }

    // --- Onboarding Logic ---
    function checkOnboarding() {
      if (!localStorage.getItem('nexuslog_onboarding_dismissed_v1')) {
        const banner = document.getElementById('onboarding-banner');
        if (banner) banner.classList.remove('hidden');
      }
    }

    function dismissOnboarding() {
      localStorage.setItem('nexuslog_onboarding_dismissed_v1', 'true');
      document.getElementById('onboarding-banner').classList.add('hidden');
    }

    // --- Render All UI ---
    function renderAll() {
      checkOnboarding();
      renderKPIs();
      renderInventories();
      renderPackagesTable();
      renderAuditLogs();
      renderDeliveryOrders();
      if (!document.getElementById('tab-scanner').classList.contains('hidden')) {
        updateScannerUI();
      }
    }

    function renderKPIs() {
      const transitCount = db.packages.filter(p => p.status === 'EM_TRANSITO').length;
      const deliveredCount = db.packages.filter(p => p.status === 'ENTREGUE').length;
      
      // Delay alerts: packages in transit created more than 48 hours ago
      const now = Date.now();
      const alertCount = db.packages.filter(p => p.status === 'EM_TRANSITO' && (now - new Date(p.updatedAt).getTime() > 3600000 * 48)).length;

      document.getElementById('kpi-transit').innerText = transitCount;
      document.getElementById('kpi-delivered').innerText = deliveredCount;
      document.getElementById('kpi-alerts').innerText = alertCount;
      document.getElementById('kpi-audits').innerText = db.auditLogs.length;
    }

    function renderInventories() {
      // Depósito 01
      const depot1Tbody = document.getElementById('inventory-depot-1');
      depot1Tbody.innerHTML = '';
      for (let sku in db.inventories.depot_1) {
        const item = db.inventories.depot_1[sku];
        depot1Tbody.innerHTML += `
          <tr class="relative">
            <td data-label="Produto" class="py-3 font-medium text-white">${item.name} <div class="text-[11px] text-neutral-500 font-mono">${sku}</div></td>
            <td data-label="Categoria" class="py-3 text-neutral-400">${item.category}</td>
            <td data-label="Qtd Disponível" class="py-3 text-right font-mono font-semibold text-white">${item.qty} un.</td>
          </tr>
        `;
      }

      // Depósito 05
      const depot5Tbody = document.getElementById('inventory-depot-5');
      depot5Tbody.innerHTML = '';
      for (let sku in db.inventories.depot_5) {
        const item = db.inventories.depot_5[sku];
        depot5Tbody.innerHTML += `
          <tr class="relative">
            <td data-label="Produto" class="py-3 font-medium text-white">${item.name} <div class="text-[11px] text-neutral-500 font-mono">${sku}</div></td>
            <td data-label="Categoria" class="py-3 text-neutral-400">${item.category}</td>
            <td data-label="Estoque Unitário" class="py-3 text-right font-mono font-semibold text-emerald-400">${item.qty} un.</td>
          </tr>
        `;
      }
    }

    function renderPackagesTable() {
      const search = document.getElementById('package-search').value.toLowerCase();
      const tbody = document.getElementById('packages-table-body');
      tbody.innerHTML = '';

      const filtered = db.packages.filter(p => p.code.toLowerCase().includes(search) || p.sku.toLowerCase().includes(search));

      if (db.packages.length === 0) {
        // True Empty State (First Use / Cleared DB)
        tbody.innerHTML = `<tr>
          <td colspan="6" class="py-16">
            <div class="flex flex-col items-center justify-center space-y-4">
              <div class="w-16 h-16 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 text-2xl shadow-inner">📦</div>
              <div class="text-center space-y-1">
                <h4 class="text-sm font-semibold text-white">Nenhum pacote ativo</h4>
                <p class="text-xs text-neutral-400 max-w-sm">The tracking system is completely empty. Create a package from Depósito 01 to begin the logistics simulation.</p>
              </div>
              <button onclick="openModal('create-package-modal')" class="mt-2 bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-lg text-xs font-medium transition-colors shadow-lg shadow-blue-900/20">Criar Primeiro Pacote</button>
            </div>
          </td>
        </tr>`;
        return;
      } else if (filtered.length === 0) {
        // No Results State (Search filtered out everything)
        tbody.innerHTML = `<tr>
          <td colspan="6" class="py-12">
            <div class="flex flex-col items-center justify-center space-y-3">
              <div class="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-neutral-500 text-lg">🔍</div>
              <p class="text-neutral-400 text-xs font-medium">Nenhum pacote encontrado com "${search}"</p>
              <button onclick="document.getElementById('package-search').value=''; renderPackagesTable()" class="text-xs text-blue-400 hover:text-blue-300 transition-colors mt-2">Limpar Filtros de Busca</button>
            </div>
          </td>
        </tr>`;
        return;
      }

      filtered.forEach(p => {
        let badgeColor = 'bg-blue-500/10 text-blue-400 border-blue-500/20';
        if (p.status === 'DESMONTADO') badgeColor = 'bg-purple-500/10 text-purple-400 border-purple-500/20';
        if (p.status === 'EXTRAVIADO') badgeColor = 'bg-red-500/10 text-red-400 border-red-500/20';
        if (p.status === 'ENTREGUE') badgeColor = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';

        tbody.innerHTML += `
          <tr class="hover:bg-white/[0.02] transition-colors relative">
            <td data-label="Código QR" class="py-3 font-mono font-semibold text-white">${p.code}</td>
            <td data-label="Status" class="py-3"><span class="text-[11px] font-mono px-2.5 py-1 rounded-full border ${badgeColor}">${p.status}</span></td>
            <td data-label="Depósito" class="py-3 text-neutral-300 font-mono text-xs">${p.depotId.toUpperCase()}</td>
            <td data-label="Resumo de Itens" class="py-3 text-neutral-300 hidden md:table-cell">${p.qty}x <span class="text-xs text-neutral-400">${p.sku}</span></td>
            <td data-label="Última Atualização" class="py-3 text-neutral-500 text-xs font-mono hidden md:table-cell">${new Date(p.updatedAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</td>
            <td data-label="Ações" class="py-3 text-right">
              <button onclick="promptAdminDelete('${p.code}')" class="text-xs text-red-400 hover:text-red-300 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 px-3 py-1 rounded-md transition-colors w-full sm:w-auto">Excluir (Admin)</button>
            </td>
          </tr>
        `;
      });
    }

    function renderAuditLogs() {
      const tbody = document.getElementById('audit-logs-body');
      tbody.innerHTML = '';
      
      const sortedLogs = [...db.auditLogs].reverse();
      if (sortedLogs.length === 0) {
        tbody.innerHTML = `<tr>
          <td colspan="5" class="py-12">
            <div class="flex flex-col items-center justify-center space-y-3">
              <div class="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-neutral-500 text-lg">📋</div>
              <p class="text-neutral-400 text-xs font-medium">Nenhum log de auditoria registrado ainda</p>
              <p class="text-[11px] text-neutral-500">Eventos e transações do sistema aparecerão aqui.</p>
            </div>
          </td>
        </tr>`;
        return;
      }

      sortedLogs.forEach(log => {
        tbody.innerHTML += `
          <tr class="relative">
            <td data-label="Data/Hora" class="py-2.5 text-neutral-500 hidden sm:table-cell">${new Date(log.timestamp).toLocaleString()}</td>
            <td data-label="ID do Pacote" class="py-2.5 font-semibold text-white">${log.packageCode}</td>
            <td data-label="Depósito" class="py-2.5 text-neutral-300">${log.depot}</td>
            <td data-label="Usuário" class="py-2.5 text-neutral-400 hidden md:table-cell">${log.user}</td>
            <td data-label="Ação" class="py-2.5 text-blue-400 font-medium">${log.action}</td>
          </tr>
        `;
      });
    }

    // --- Depósito 01: Create Package ---
    function submitCreatePackage() {
      const sku = document.getElementById('new-pkg-sku').value;
      const qty = parseInt(document.getElementById('new-pkg-qty').value);

      if (qty <= 0) { showToast('A quantidade deve ser maior que zero.', 'error'); return; }
      if (db.inventories.depot_1[sku].qty < qty) {
        showToast('Estoque insuficiente no Depósito 01 para esta consolidação!', 'error');
        return;
      }

      // Deduct stock
      db.inventories.depot_1[sku].qty -= qty;

      // Generate package
      const newCode = 'PKG-' + Math.floor(100 + Math.random() * 900);
      db.packages.push({
        code: newCode,
        status: 'EM_TRANSITO',
        depotId: 'depot_1',
        sku: sku,
        qty: qty,
        updatedAt: new Date().toISOString()
      });

      // Audit log
      db.auditLogs.push({
        timestamp: new Date().toISOString(),
        packageCode: newCode,
        depot: 'Depósito 01',
        user: 'Operador Admin',
        action: `CRIACAO (Consolidado ${qty}x ${sku})`
      });

      closeModal('create-package-modal');
      saveDB();
      showToast(`Pacote ${newCode} criado e despachado com sucesso!`, 'success');
    }

    // --- Depósito 05: Manual Stock Adjustment ---
    function submitStockAdjustment() {
      const sku = document.getElementById('adj-sku').value;
      const newQty = parseInt(document.getElementById('adj-qty').value);

      db.inventories.depot_5[sku].qty = newQty;
      db.auditLogs.push({
        timestamp: new Date().toISOString(),
        packageCode: 'SYSTEM',
        depot: 'Depósito 05',
        user: 'Administrador',
        action: `AJUSTE_MANUAL (Definido ${sku} para ${newQty})`
      });

      closeModal('manual-stock-modal');
      saveDB();
      showToast('Saldo de estoque do Depósito 05 atualizado com sucesso.', 'success');
    }

    // --- Exceção Admin Delete ---
    let packageToDelete = null;
    function promptAdminDelete(code) {
      packageToDelete = code;
      document.getElementById('del-pkg-code').innerText = code;
      document.getElementById('admin-pin').value = '';
      openModal('admin-delete-modal');
    }

    function confirmAdminDelete() {
      const pin = document.getElementById('admin-pin').value;
      const btn = document.querySelector('#admin-delete-modal button.bg-red-600');
      const originalText = btn.innerText;
      
      // Prevent double submission & simulate network check
      btn.disabled = true;
      btn.innerText = 'Verificando...';
      btn.classList.add('opacity-70', 'cursor-not-allowed');

      setTimeout(() => {
        btn.disabled = false;
        btn.innerText = originalText;
        btn.classList.remove('opacity-70', 'cursor-not-allowed');

        if (pin !== 'admin123' && pin !== '1234') { // Simple demo security PIN
          showToast('PIN de Admin Inválido! Verificação falhou.', 'error');
          return;
        }

        const pkgIndex = db.packages.findIndex(p => p.code === packageToDelete);
        if (pkgIndex !== -1) {
          const pkg = db.packages[pkgIndex];
          db.packages.splice(pkgIndex, 1);
          db.auditLogs.push({
            timestamp: new Date().toISOString(),
            packageCode: packageToDelete,
            depot: pkg.depotId,
            user: 'Exceção Admin',
            action: 'EXCLUSAO_ADMIN (Exceção tratada)'
          });
        }

        closeModal('admin-delete-modal');
        saveDB();
        showToast(`Pacote ${packageToDelete} excluído via Exceção Admin.`, 'success');
      }, 500);
    }

    // --- Warehouse Scanner App Logic ---
    function updateScannerUI() {
      const depot = document.getElementById('current-operator-depot').value;
      const titleEl = document.getElementById('depot-panel-title');
      const contentEl = document.getElementById('depot-panel-content');
      const quickBtns = document.getElementById('quick-scan-buttons');

      quickBtns.innerHTML = '';
      if (db.packages.length === 0) {
        quickBtns.innerHTML = `
          <div class="w-full mt-2 p-3 rounded-lg bg-blue-500/10 border border-blue-500/20 text-[11px] text-blue-300">
            <strong>Nenhum pacote ativo to scan.</strong> Create a package from the Painel Administrativo first.
          </div>
        `;
      } else {
        db.packages.forEach(p => {
          quickBtns.innerHTML += `
            <button onclick="document.getElementById('manual-qr-input').value='${p.code}'; handleScanAção();" class="text-xs font-mono bg-white/5 hover:bg-white/10 border border-white/10 px-3 py-1.5 rounded-lg text-white transition-colors">
              Scan ${p.code} (${p.status})
            </button>
          `;
        });
      }

      if (depot === 'depot_1') {
        titleEl.innerText = 'Depósito 01: Consolidação e Expedição';
        contentEl.innerHTML = `
          <p class="text-xs text-neutral-300 mb-3">At Depósito 01, operators create shipping batches. Click below to open the creation modal.</p>
          <button onclick="openModal('create-package-modal')" class="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-xs font-medium">Create New Package (Depósito 01)</button>
        `;
      } else if (depot === 'depot_2' || depot === 'depot_3' || depot === 'depot_4') {
        titleEl.innerText = `${depot.replace('_', ' ').toUpperCase()} (Ponto de Trânsito)`;
        contentEl.innerHTML = `
          <p class="text-xs text-neutral-300 mb-2">Scan any incoming package QR code to register receipt at this transit hub and update tracking location.</p>
        `;
      } else if (depot === 'depot_5') {
        titleEl.innerText = 'Depósito 05 (Disassembly / Final Destino)';
        contentEl.innerHTML = `
          <p class="text-xs text-neutral-300 mb-2">Scanning a package here will prompt disassembly. Once confirmed, items are automatically added to Depósito 05 unit stock.</p>
        `;
      }
    }

    function handleScanAção() {
      const code = document.getElementById('manual-qr-input').value.trim().toUpperCase();
      const depot = document.getElementById('current-operator-depot').value;
      const feedback = document.getElementById('scanner-feedback');
      const feedbackText = document.getElementById('scanner-feedback-text');

      if (!code) { showToast('Por favor, insira ou selecione um código QR de pacote válido.', 'error'); return; }

      const pkg = db.packages.find(p => p.code === code);
      if (!pkg) {
        showToast('Pacote não encontrado no banco de dados do sistema!', 'error');
        return;
      }

      feedback.classList.remove('hidden');

      if (depot === 'depot_5') {
        if (pkg.status === 'DESMONTADO') {
          feedbackText.innerText = `O pacote ${code} já está desmontado no Depósito 05.`;
          return;
        }
        
        // Disassembly action
        showConfirm(`Desmontar Pacote ${code}? Isso adicionará ${pkg.qty}x ${pkg.sku} ao estoque unitário do Depósito 05.`, () => {
          pkg.status = 'DESMONTADO';
          pkg.depotId = 'depot_5';
          pkg.updatedAt = new Date().toISOString();

          // Add to depot 5 stock
          if (db.inventories.depot_5[pkg.sku]) {
            db.inventories.depot_5[pkg.sku].qty += pkg.qty;
          }

          db.auditLogs.push({
            timestamp: new Date().toISOString(),
            packageCode: code,
            depot: 'Depósito 05',
            user: 'Operador Depósito 05',
            action: `DESMONTAGEM (+${pkg.qty} added to Depósito 05)`
          });

          feedbackText.innerText = `Sucesso: Pacote ${code} desmontado! ${pkg.qty} unidades adicionadas ao estoque do Depósito 05.`;
          saveDB();
          showToast(`Pacote ${code} desmontado com sucesso!`, 'success');
        });
      } else {
        // Transit or Origin scan
        pkg.depotId = depot;
        pkg.updatedAt = new Date().toISOString();

        db.auditLogs.push({
          timestamp: new Date().toISOString(),
          packageCode: code,
          depot: depot.replace('_', ' ').toUpperCase(),
          user: 'Operador Campo',
          action: `RECEBIMENTO em ${depot.toUpperCase()}`
        });

        feedbackText.innerText = `Pacote ${code} recebido e registrado no ${depot.replace('_', ' ').toUpperCase()}!`;
        saveDB();
      }
    }

    // --- App de Entrega Logic ---
    function renderDeliveryOrders() {
      const container = document.getElementById('delivery-orders-list');
      container.innerHTML = '';

      if (db.deliveryOrders.length === 0) {
        container.innerHTML = `
          <div class="py-16 flex flex-col items-center justify-center space-y-4 rounded-xl border border-dashed border-white/10 bg-white/[0.01]">
            <div class="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-neutral-500 text-2xl shadow-inner">🚚</div>
            <div class="text-center space-y-1">
              <h4 class="text-sm font-semibold text-white">Nenhum pedido de entrega</h4>
              <p class="text-[11px] text-neutral-400 max-w-xs">Não há entregas ativas despachadas para o seu veículo no momento. Novos pedidos aparecerão aqui automaticamente.</p>
            </div>
          </div>
        `;
        return;
      }

      db.deliveryOrders.forEach(ord => {
        const isDelivered = ord.status === 'ENTREGUE';
        container.innerHTML += `
          <div class="p-5 rounded-xl bg-white/[0.02] border ${isDelivered ? 'border-emerald-500/20 bg-emerald-500/[0.02]' : 'border-white/10'} flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div class="space-y-1">
              <div class="flex items-center gap-2">
                <span class="text-xs font-mono font-bold text-white">${ord.id}</span>
                <span class="text-[10px] font-mono px-2 py-0.5 rounded-full border ${isDelivered ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border-amber-500/20'}">${ord.status}</span>
              </div>
              <h4 class="text-sm font-semibold text-white">${ord.client}</h4>
              <p class="text-xs text-neutral-400">📍 ${ord.address}</p>
              <p class="text-xs text-blue-400 font-mono">Itens: ${ord.items}</p>
            </div>
            <div>
              ${isDelivered ? `
                <span class="text-xs text-emerald-400 font-medium bg-emerald-500/10 border border-emerald-500/20 px-4 py-2 rounded-lg inline-block">✓ Entregue com Sucesso</span>
              ` : `
                <button onclick="confirmDelivery('${ord.id}')" class="bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-2.5 rounded-lg text-xs font-semibold transition-colors shadow-lg">Confirmar Entrega</button>
              `}
            </div>
          </div>
        `;
      });
    }

    function confirmDelivery(ordId) {
      const ord = db.deliveryOrders.find(o => o.id === ordId);
      if (!ord) return;

      showConfirm(`Confirmar Entrega do pedido ${ordId} para ${ord.client}? Isso finalizará a saída e deduzirá os itens permanentemente.`, () => {
        ord.status = 'ENTREGUE';
        
        // Also add a delivered package entry for KPI
        db.packages.push({
          code: 'DLV-' + Math.floor(1000 + Math.random() * 9000),
          status: 'ENTREGUE',
          depotId: 'depot_5',
          sku: 'SKU-STARLINK-MINI',
          qty: 1,
          updatedAt: new Date().toISOString()
        });

        db.auditLogs.push({
          timestamp: new Date().toISOString(),
          packageCode: ordId,
          depot: 'Ponta Final (Entrega)',
          user: 'Entregador Carlos Silva',
          action: 'CONFIRMACAO_ENTREGA'
        });

        saveDB();
        showToast(`Pedido ${ordId} entregue e registrado com sucesso!`, 'success');
      });
    }

    // Initialize on load
    renderAll();
  