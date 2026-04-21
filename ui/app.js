// ═══════════════════════════════════════════════════════════════════
// CONTRACT ABIs
// ═══════════════════════════════════════════════════════════════════

const ACCESS_CONTROL_ABI = [
  { "inputs": [{"name":"role","type":"bytes32"},{"name":"account","type":"address"}], "name": "hasRole", "outputs": [{"name":"","type":"bool"}], "stateMutability": "view", "type": "function" },
  { "inputs": [{"name":"role","type":"bytes32"},{"name":"account","type":"address"}], "name": "grantRole", "outputs": [], "stateMutability": "nonpayable", "type": "function" },
  { "inputs": [{"name":"role","type":"bytes32"},{"name":"account","type":"address"}], "name": "revokeRole", "outputs": [], "stateMutability": "nonpayable", "type": "function" }
];

const REGISTRY_ABI = [
  ...ACCESS_CONTROL_ABI,
  { "inputs": [{"name":"crn","type":"string"},{"name":"mdrHash","type":"bytes32"},{"name":"mawp","type":"uint256"}], "name": "registerEquipment", "outputs": [{"name":"equipmentId","type":"uint256"}], "stateMutability": "nonpayable", "type": "function" },
  { "inputs": [{"name":"equipmentId","type":"uint256"}], "name": "signShopInspection", "outputs": [], "stateMutability": "nonpayable", "type": "function" },
  { "inputs": [{"name":"equipmentId","type":"uint256"},{"name":"aNumber","type":"string"}], "name": "issueCertificate", "outputs": [], "stateMutability": "nonpayable", "type": "function" },
  { "inputs": [{"name":"equipmentId","type":"uint256"}], "name": "activateEquipment", "outputs": [], "stateMutability": "nonpayable", "type": "function" },
  { "inputs": [{"name":"equipmentId","type":"uint256"}], "name": "getEquipment", "outputs": [{"components":[{"name":"equipmentId","type":"uint256"},{"name":"crn","type":"string"},{"name":"aNumber","type":"string"},{"name":"mdrHash","type":"bytes32"},{"name":"mawp","type":"uint256"},{"name":"manufacturer","type":"address"},{"name":"registeredAt","type":"uint256"},{"name":"shopInspector","type":"address"},{"name":"shopInspectedAt","type":"uint256"},{"name":"certificateIssuer","type":"address"},{"name":"certificateIssuedAt","type":"uint256"},{"name":"status","type":"uint8"}],"name":"","type":"tuple"}], "stateMutability": "view", "type": "function" },
  { "inputs": [{"name":"equipmentId","type":"uint256"}], "name": "isCertified", "outputs": [{"name":"","type":"bool"}], "stateMutability": "view", "type": "function" },
  { "inputs": [], "name": "equipmentCount", "outputs": [{"name":"","type":"uint256"}], "stateMutability": "view", "type": "function" },
  { "anonymous": false, "inputs": [{"indexed":true,"name":"equipmentId","type":"uint256"},{"indexed":true,"name":"manufacturer","type":"address"},{"indexed":false,"name":"crn","type":"string"}], "name": "EquipmentRegistered", "type": "event" }
];

const INSPECTION_ABI = [
  ...ACCESS_CONTROL_ABI,
  { "inputs": [{"name":"equipmentId","type":"uint256"},{"name":"result","type":"uint8"},{"name":"notesHash","type":"bytes32"}], "name": "logInspection", "outputs": [], "stateMutability": "nonpayable", "type": "function" },
  { "inputs": [{"name":"equipmentId","type":"uint256"}], "name": "checkOverdue", "outputs": [], "stateMutability": "nonpayable", "type": "function" },
  { "inputs": [{"name":"intervalSeconds","type":"uint256"}], "name": "setInspectionInterval", "outputs": [], "stateMutability": "nonpayable", "type": "function" },
  { "inputs": [{"name":"equipmentId","type":"uint256"}], "name": "isCompliant", "outputs": [{"name":"","type":"bool"}], "stateMutability": "view", "type": "function" },
  { "inputs": [{"name":"equipmentId","type":"uint256"}], "name": "getInspectionHistory", "outputs": [{"components":[{"name":"inspectionId","type":"uint256"},{"name":"inspector","type":"address"},{"name":"inspectedAt","type":"uint256"},{"name":"result","type":"uint8"},{"name":"notesHash","type":"bytes32"}],"name":"","type":"tuple[]"}], "stateMutability": "view", "type": "function" },
  { "inputs": [{"name":"equipmentId","type":"uint256"}], "name": "getLastInspection", "outputs": [{"components":[{"name":"inspectionId","type":"uint256"},{"name":"inspector","type":"address"},{"name":"inspectedAt","type":"uint256"},{"name":"result","type":"uint8"},{"name":"notesHash","type":"bytes32"}],"name":"","type":"tuple"}], "stateMutability": "view", "type": "function" },
  { "inputs": [], "name": "inspectionInterval", "outputs": [{"name":"","type":"uint256"}], "stateMutability": "view", "type": "function" },
  { "inputs": [{"name":"","type":"uint256"}], "name": "lastInspectedAt", "outputs": [{"name":"","type":"uint256"}], "stateMutability": "view", "type": "function" },
  { "inputs": [{"name":"","type":"uint256"}], "name": "complianceFlag", "outputs": [{"name":"","type":"bool"}], "stateMutability": "view", "type": "function" }
];

const TRANSFER_ABI = [
  ...ACCESS_CONTROL_ABI,
  { "inputs": [{"name":"equipmentId","type":"uint256"},{"name":"operator","type":"address"}], "name": "assignInitialCustody", "outputs": [], "stateMutability": "nonpayable", "type": "function" },
  { "inputs": [{"name":"equipmentId","type":"uint256"},{"name":"to","type":"address"}], "name": "initiateTransfer", "outputs": [], "stateMutability": "nonpayable", "type": "function" },
  { "inputs": [{"name":"equipmentId","type":"uint256"}], "name": "completeTransfer", "outputs": [], "stateMutability": "nonpayable", "type": "function" },
  { "inputs": [{"name":"equipmentId","type":"uint256"}], "name": "cancelTransfer", "outputs": [], "stateMutability": "nonpayable", "type": "function" },
  { "inputs": [{"name":"equipmentId","type":"uint256"}], "name": "getCurrentOwner", "outputs": [{"name":"","type":"address"}], "stateMutability": "view", "type": "function" },
  { "inputs": [{"name":"equipmentId","type":"uint256"}], "name": "getTransferHistory", "outputs": [{"components":[{"name":"from","type":"address"},{"name":"to","type":"address"},{"name":"transferredAt","type":"uint256"},{"name":"transferredBy","type":"address"}],"name":"","type":"tuple[]"}], "stateMutability": "view", "type": "function" },
  { "inputs": [{"name":"equipmentId","type":"uint256"}], "name": "getPendingTransfer", "outputs": [{"name":"to","type":"address"}], "stateMutability": "view", "type": "function" }
];

// ═══════════════════════════════════════════════════════════════════
// DEPLOYED CONTRACT ADDRESSES (Sepolia)
// ═══════════════════════════════════════════════════════════════════

const DEPLOYED = {
  registry:   '0xBEcfeF2471a6e1BeDbD5B6dE8c3ef8626Da2e27c',
  inspection: '0xFaC9EECA2b0d4823581e36A2953B7990ABcae5B5',
  transfer:   '0x82544563e6dccA61aC59Bba0C7258A816B0F9708'
};

// ═══════════════════════════════════════════════════════════════════
// STATE
// ═══════════════════════════════════════════════════════════════════

const SEPOLIA_CHAIN_ID = 11155111;

const ZERO_ADDR = '0x0000000000000000000000000000000000000000';
const ZERO_BYTES32 = '0x0000000000000000000000000000000000000000000000000000000000000000';

// Role constants (keccak256 of role name strings)
const ROLES = {
  DEFAULT_ADMIN_ROLE:  '0x0000000000000000000000000000000000000000000000000000000000000000',
  MANUFACTURER_ROLE:   ethers.utils.keccak256(ethers.utils.toUtf8Bytes('MANUFACTURER_ROLE')),
  SCO_ROLE:            ethers.utils.keccak256(ethers.utils.toUtf8Bytes('SCO_ROLE')),
  ABSA_ROLE:           ethers.utils.keccak256(ethers.utils.toUtf8Bytes('ABSA_ROLE')),
  OPERATOR_ROLE:       ethers.utils.keccak256(ethers.utils.toUtf8Bytes('OPERATOR_ROLE'))
};

let provider = null;
let signer = null;
let account = null;
let networkId = null;

let registryContract = null;
let inspectionContract = null;
let transferContract = null;

let userRoles = {
  isAdmin: false,
  isManufacturer: false,
  isSCO: false,
  isABSA: false,
  isOperator: false
};

const PAGE_SIZE = 25;
let dashState = {
  data: [],            // array of { equip, compliant } for current page
  sort: { col: 'id', dir: 'desc' },
  filter: { status: '', compliance: '' },
  page: 1,
  total: 0
};

// ═══════════════════════════════════════════════════════════════════
// SETTINGS
// ═══════════════════════════════════════════════════════════════════

function getAddresses() {
  return {
    registry:   localStorage.getItem('il_registry')   || '',
    inspection: localStorage.getItem('il_inspection') || '',
    transfer:   localStorage.getItem('il_transfer')   || ''
  };
}

function openSettings() {
  const addr = getAddresses();
  document.getElementById('cfg-registry').value   = addr.registry;
  document.getElementById('cfg-inspection').value = addr.inspection;
  document.getElementById('cfg-transfer').value   = addr.transfer;
  document.body.classList.add('modal-open');
  document.getElementById('settings-modal').classList.add('open');
}

function closeSettings() {
  document.body.classList.remove('modal-open');
  document.getElementById('settings-modal').classList.remove('open');
}

function saveSettings() {
  const registry   = document.getElementById('cfg-registry').value.trim();
  const inspection = document.getElementById('cfg-inspection').value.trim();
  const transfer   = document.getElementById('cfg-transfer').value.trim();

  if (registry && !ethers.utils.isAddress(registry)) {
    toast('Invalid EquipmentRegistry address', 'error'); return;
  }
  if (inspection && !ethers.utils.isAddress(inspection)) {
    toast('Invalid InspectionLog address', 'error'); return;
  }
  if (transfer && !ethers.utils.isAddress(transfer)) {
    toast('Invalid OwnershipTransfer address', 'error'); return;
  }

  localStorage.setItem('il_registry',   registry);
  localStorage.setItem('il_inspection', inspection);
  localStorage.setItem('il_transfer',   transfer);

  closeSettings();
  toast('Contract addresses saved!', 'success');

  if (signer) {
    initContracts();
    updateAddressPreviews();
  }
}

function updateAddressPreviews() {
  const addr = getAddresses();
  const reg = addr.registry || DEPLOYED.registry;
  document.getElementById('reg-preview-addr').textContent =
    reg ? shortAddr(reg) + ' (EquipmentRegistry)' : 'Not configured';
}

// ═══════════════════════════════════════════════════════════════════
// WALLET CONNECTION
// ═══════════════════════════════════════════════════════════════════

function disconnectWallet() {
  account = null;
  provider = null;
  signer = null;
  networkId = null;
  registryContract = null;
  inspectionContract = null;
  transferContract = null;
  userRoles = { isAdmin: false, isManufacturer: false, isSCO: false, isABSA: false, isOperator: false };

  document.getElementById('wallet-dot').classList.remove('connected');
  document.getElementById('wallet-label').textContent = 'Connect Wallet';
  const badge = document.getElementById('network-badge');
  badge.style.display = 'none';
  const chip = document.getElementById('balance-chip');
  if (chip) chip.style.display = 'none';

  dashState.data  = [];
  dashState.total = 0;
  dashState.page  = 1;
  document.getElementById('dash-pagination').style.display = 'none';

  updateDashboardBanner();
  updateMyRolesDisplay();
  document.getElementById('dash-table-container').innerHTML =
    '<div class="empty-state">Connect your wallet and configure contract addresses to load equipment.</div>';
  // Reset dashboard stats
  ['stat-total','stat-compliant','stat-flags','stat-certified'].forEach(id => {
    const el = document.getElementById(id); if (el) el.textContent = '—';
  });
  document.getElementById('stat-total-sub').textContent = 'Connect wallet to load';
  document.getElementById('stat-compliant-sub').textContent = '—';
  toast('Wallet disconnected', 'info');
  updateNavTabRoles();
}

async function connectWallet() {
  if (account) { disconnectWallet(); return; }

  if (!window.ethereum) {
    toast('MetaMask not detected. Please install MetaMask.', 'error'); return;
  }

  const btn = document.getElementById('wallet-btn');
  btn.disabled = true;
  document.getElementById('wallet-label').textContent = 'Connecting…';

  try {
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    account = accounts[0];

    provider = new ethers.providers.Web3Provider(window.ethereum);
    signer = provider.getSigner();

    const network = await provider.getNetwork();
    networkId = network.chainId;

    updateWalletUI();
    initContracts();
    await detectRoles();
    updateDashboardBanner();
    updateAddressPreviews();
    loadDashboard();
    loadRecentActivity();

  } catch (err) {
    if (isUserRejection(err)) {
      toast('Connection request cancelled', 'warning');
    } else {
      toast('Wallet connection failed: ' + extractErrorMsg(err), 'error');
    }
    document.getElementById('wallet-label').textContent = 'Connect Wallet';
  } finally {
    btn.disabled = false;
  }
}

function updateWalletUI() {
  document.getElementById('wallet-dot').classList.toggle('connected', !!account);
  document.getElementById('wallet-label').textContent = account ? shortAddr(account) : 'Connect Wallet';

  const badge = document.getElementById('network-badge');
  if (networkId) {
    badge.style.display = 'inline-block';
    if (networkId === SEPOLIA_CHAIN_ID) {
      badge.textContent = 'Sepolia';
      badge.className = 'network-badge';
    } else {
      badge.textContent = `Wrong Network (${networkId})`;
      badge.className = 'network-badge wrong';
      toast('Please switch MetaMask to the Sepolia testnet', 'warning');
    }
  } else {
    badge.style.display = 'none';
  }

  // Show ETH balance
  const chip = document.getElementById('balance-chip');
  if (account && provider) {
    provider.getBalance(account).then(bal => {
      const eth = parseFloat(ethers.utils.formatEther(bal)).toFixed(4);
      if (chip) { chip.textContent = eth + ' ETH'; chip.style.display = 'inline-block'; }
    }).catch(() => {});
  } else if (chip) {
    chip.style.display = 'none';
  }
}

function initContracts() {
  const addr = getAddresses();
  try {
    if (addr.registry && ethers.utils.isAddress(addr.registry)) {
      registryContract = new ethers.Contract(addr.registry, REGISTRY_ABI, signer);
    }
    if (addr.inspection && ethers.utils.isAddress(addr.inspection)) {
      inspectionContract = new ethers.Contract(addr.inspection, INSPECTION_ABI, signer);
    }
    if (addr.transfer && ethers.utils.isAddress(addr.transfer)) {
      transferContract = new ethers.Contract(addr.transfer, TRANSFER_ABI, signer);
    }
  } catch (err) {
    toast('Error initializing contracts: ' + err.message, 'error');
  }
}

async function detectRoles() {
  if (!account || !registryContract) return;

  try {
    const [isAdmin, isMfg, isSCO, isABSA, isOp] = await Promise.all([
      registryContract.hasRole(ROLES.DEFAULT_ADMIN_ROLE, account),
      registryContract.hasRole(ROLES.MANUFACTURER_ROLE, account),
      registryContract.hasRole(ROLES.SCO_ROLE, account),
      registryContract.hasRole(ROLES.ABSA_ROLE, account),
      registryContract.hasRole(ROLES.OPERATOR_ROLE, account)
    ]);
    userRoles = { isAdmin, isManufacturer: isMfg, isSCO, isABSA, isOperator: isOp };
  } catch (err) {
    console.warn('Role detection failed:', err.message);
    toast('Could not detect wallet roles — contract may be unreachable on this network.', 'warning');
  }
  updateMyRolesDisplay();
  updateNavTabRoles();
}

function updateDashboardBanner() {
  const banner = document.getElementById('dash-role-banner');
  if (!account) {
    banner.className = 'role-banner none';
    banner.innerHTML = 'Connect your wallet to see your role and interact with contracts.';
    return;
  }

  let cls = 'auditor', roleName = 'Auditor (read-only)';
  if (userRoles.isAdmin)        { cls = 'absa';     roleName = 'DEFAULT_ADMIN_ROLE'; }
  else if (userRoles.isABSA)    { cls = 'absa';     roleName = 'ABSA'; }
  else if (userRoles.isSCO)     { cls = 'sco';      roleName = 'Safety Codes Officer (SCO)'; }
  else if (userRoles.isManufacturer) { cls = 'mfg'; roleName = 'Manufacturer'; }
  else if (userRoles.isOperator){ cls = 'operator'; roleName = 'Operator'; }

  banner.className = `role-banner ${cls}`;
  banner.innerHTML = `<strong>Connected role:</strong> ${escHtml(roleName)} &nbsp;·&nbsp;
    <span class="hash">${escHtml(account)}</span>
    &nbsp;·&nbsp; <span class="badge ${networkId === SEPOLIA_CHAIN_ID ? 'badge-active' : 'badge-flagged'}">${networkId === SEPOLIA_CHAIN_ID ? 'Sepolia' : 'Wrong Network'}</span>`;
}

// ═══════════════════════════════════════════════════════════════════
// DASHBOARD
// ═══════════════════════════════════════════════════════════════════

async function loadDashboard(page) {
  page = page || 1;
  if (!registryContract) {
    document.getElementById('dash-table-container').innerHTML =
      '<div class="empty-state">Configure contract addresses in Settings first.</div>';
    document.getElementById('dash-pagination').style.display = 'none';
    return;
  }

  setBtnLoading('btn-dash-refresh', true, 'Loading…');
  try {
    document.getElementById('dash-table-container').innerHTML =
      '<div class="loading-msg">Loading equipment data…</div>';
    document.getElementById('dash-pagination').style.display = 'none';

    const count = await registryContract.equipmentCount();
    const total = count.toNumber();
    dashState.total = total;
    dashState.page  = page;

    document.getElementById('stat-total').textContent = total;
    document.getElementById('stat-total-sub').textContent = 'Total registered';

    if (total === 0) {
      ['stat-compliant','stat-flags','stat-certified'].forEach(id =>
        document.getElementById(id).textContent = '0'
      );
      document.getElementById('stat-compliant-sub').textContent = '—';
      document.getElementById('dash-table-container').innerHTML =
        '<div class="empty-state">No equipment registered yet.</div>';
      return;
    }

    // Compute page range (page 1 = most recent PAGE_SIZE items)
    const endId   = total - (page - 1) * PAGE_SIZE;
    const startId = Math.max(1, endId - PAGE_SIZE + 1);
    if (endId < 1) { return loadDashboard(1); }

    const promises = [];
    for (let i = startId; i <= endId; i++) {
      promises.push(registryContract.getEquipment(i));
    }
    const equipList = await Promise.all(promises);

    const compliancePromises = inspectionContract
      ? equipList.map(e => inspectionContract.isCompliant(e.equipmentId).catch(() => true))
      : equipList.map(() => Promise.resolve(true));
    const complianceResults = await Promise.all(compliancePromises);

    // Store data in dashState
    dashState.data = equipList.map((e, i) => ({ equip: e, compliant: complianceResults[i] }));

    // Update stats (approximate from first page)
    if (page === 1) {
      let compliant = 0, flagged = 0, certified = 0;
      equipList.forEach((e, i) => {
        if (complianceResults[i]) compliant++; else flagged++;
        if (e.status >= 2) certified++;
      });
      document.getElementById('stat-compliant').textContent = compliant;
      document.getElementById('stat-compliant-sub').textContent =
        equipList.length > 0 ? `${((compliant / equipList.length) * 100).toFixed(1)}% of displayed` : '—';
      document.getElementById('stat-flags').textContent = flagged;
      document.getElementById('stat-certified').textContent = certified;
    }

    renderDashTable();
    updateDashPagination(total, page);

  } catch (err) {
    document.getElementById('dash-table-container').innerHTML =
      `<div class="empty-state">Error loading data: ${escHtml(err.message)}</div>`;
    toast('Dashboard load error: ' + err.message, 'error');
  } finally {
    setBtnLoading('btn-dash-refresh', false, '↺ Refresh');
  }
}

async function searchEquipment() {
  const query = document.getElementById('dash-search-input').value.trim();
  if (!query) { loadDashboard(); return; }

  // If purely numeric, jump straight to detail
  if (/^\d+$/.test(query) && parseInt(query, 10) > 0) {
    quickDetail(parseInt(query, 10));
    return;
  }

  // Search across loaded data by CRN, A-Number, or manufacturer address
  if (!registryContract) { toast('Connect wallet and configure contracts first', 'warning'); return; }

  setBtnLoading('btn-dash-search', true, 'Searching…');
  try {
    const count = await registryContract.equipmentCount();
    const total = count.toNumber();
    if (total === 0) { toast('No equipment registered', 'info'); return; }

    const lowerQuery = query.toLowerCase();
    const batchSize = Math.min(total, 100);
    const promises = [];
    for (let i = 1; i <= batchSize; i++) {
      promises.push(registryContract.getEquipment(i));
    }
    const allEquip = await Promise.all(promises);

    const matches = allEquip.filter(e =>
      e.crn.toLowerCase().includes(lowerQuery) ||
      (e.aNumber && e.aNumber.toLowerCase().includes(lowerQuery)) ||
      e.manufacturer.toLowerCase().includes(lowerQuery)
    );

    if (matches.length === 0) {
      toast(`No equipment matches "${query}"`, 'info');
      return;
    }
    if (matches.length === 1) {
      quickDetail(matches[0].equipmentId.toNumber());
      return;
    }

    // Multiple matches — display them in the dashboard table
    const compliancePromises = inspectionContract
      ? matches.map(e => inspectionContract.isCompliant(e.equipmentId).catch(() => true))
      : matches.map(() => Promise.resolve(true));
    const complianceResults = await Promise.all(compliancePromises);

    dashState.data = matches.map((e, i) => ({ equip: e, compliant: complianceResults[i] }));
    dashState.total = matches.length;
    dashState.page = 1;
    renderDashTable();
    document.getElementById('dash-pagination').style.display = 'none';
    toast(`Found ${matches.length} results for "${query}"`, 'success');
  } catch (err) {
    toast('Search failed: ' + extractErrorMsg(err), 'error');
  } finally {
    setBtnLoading('btn-dash-search', false, 'Search');
  }
}

function makeSortTh(c, label) {
  let cls = 'sortable';
  if (dashState.sort.col === c) cls += dashState.sort.dir === 'asc' ? ' sort-asc' : ' sort-desc';
  return `<th class="${cls}" onclick="sortDash('${c}')" tabindex="0" onkeydown="if(event.key==='Enter')sortDash('${c}')">${label}</th>`;
}

function renderDashTable() {
  let data = [...dashState.data];

  // Apply filters
  const { status, compliance } = dashState.filter;
  if (status !== '') {
    data = data.filter(d => d.equip.status === parseInt(status, 10));
  }
  if (compliance === 'compliant') {
    data = data.filter(d => d.compliant);
  } else if (compliance === 'flagged') {
    data = data.filter(d => !d.compliant);
  }

  // Apply sort
  const { col, dir } = dashState.sort;
  data.sort((a, b) => {
    let av, bv;
    if      (col === 'id')         { av = a.equip.equipmentId.toNumber(); bv = b.equip.equipmentId.toNumber(); }
    else if (col === 'crn')        { av = a.equip.crn;                    bv = b.equip.crn; }
    else if (col === 'status')     { av = a.equip.status;                 bv = b.equip.status; }
    else if (col === 'mawp')       { av = a.equip.mawp.toNumber();        bv = b.equip.mawp.toNumber(); }
    else if (col === 'date')       { av = a.equip.registeredAt.toNumber(); bv = b.equip.registeredAt.toNumber(); }
    else if (col === 'compliance') { av = a.compliant ? 1 : 0;            bv = b.compliant ? 1 : 0; }
    else return 0;
    if (typeof av === 'string') return dir === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av);
    return dir === 'asc' ? av - bv : bv - av;
  });

  if (data.length === 0) {
    document.getElementById('dash-table-container').innerHTML =
      '<div class="empty-state">No equipment matches the selected filters.</div>';
    return;
  }

  const rows = data.map(({ equip: e, compliant }) => `<tr>
    <td><strong>${e.equipmentId.toString()}</strong></td>
    <td>${escHtml(e.crn)}</td>
    <td>${statusBadge(e.status)}</td>
    <td>${compliant
      ? '<span class="badge badge-compliant">✓ Compliant</span>'
      : '<span class="badge badge-flagged">⚠ Flagged</span>'}</td>
    <td>${e.mawp.toString()} kPa</td>
    <td>${addrLink(e.manufacturer)}</td>
    <td>${tsToDate(e.registeredAt.toNumber())}</td>
    <td><button class="btn btn-secondary btn-sm" onclick="quickDetail(${e.equipmentId.toString()})"
        aria-label="View details for equipment ${e.equipmentId.toString()}">View</button></td>
  </tr>`).join('');

  document.getElementById('dash-table-container').innerHTML = `
    <div class="table-scroll">
      <table>
        <thead><tr>
          ${makeSortTh('id', 'ID')}
          ${makeSortTh('crn', 'CRN')}
          ${makeSortTh('status', 'Status')}
          ${makeSortTh('compliance', 'Compliance')}
          ${makeSortTh('mawp', 'MAWP')}
          <th>Manufacturer</th>
          ${makeSortTh('date', 'Registered')}
          <th></th>
        </tr></thead>
        <tbody>${rows}</tbody>
      </table>
    </div>`;
}

function sortDash(col) {
  dashState.sort.dir = dashState.sort.col === col && dashState.sort.dir === 'desc' ? 'asc' : 'desc';
  dashState.sort.col = col;
  renderDashTable();
}

function applyDashFilters() {
  dashState.filter.status     = document.getElementById('dash-filter-status').value;
  dashState.filter.compliance = document.getElementById('dash-filter-compliance').value;
  renderDashTable();
}

function clearDashFilters() {
  dashState.filter = { status: '', compliance: '' };
  document.getElementById('dash-filter-status').value     = '';
  document.getElementById('dash-filter-compliance').value = '';
  renderDashTable();
}

function updateDashPagination(total, page) {
  const maxPage = Math.ceil(total / PAGE_SIZE);
  const container = document.getElementById('dash-pagination');
  if (maxPage <= 1) { container.style.display = 'none'; return; }
  container.style.display = 'flex';
  container.innerHTML =
    `<button class="btn btn-secondary btn-sm" onclick="loadDashboard(${page - 1})" ${page <= 1 ? 'disabled' : ''} aria-label="Previous page">← Prev</button>
     <span class="page-info">Page ${page} of ${maxPage} &nbsp;·&nbsp; ${total} total</span>
     <button class="btn btn-secondary btn-sm" onclick="loadDashboard(${page + 1})" ${page >= maxPage ? 'disabled' : ''} aria-label="Next page">Next →</button>`;
}

function exportCSV() {
  if (!dashState.data.length) { toast('No data loaded to export', 'warning'); return; }

  // Apply current filters so the CSV matches what the user sees
  let data = [...dashState.data];
  const { status, compliance } = dashState.filter;
  if (status !== '') data = data.filter(d => d.equip.status === parseInt(status, 10));
  if (compliance === 'compliant') data = data.filter(d => d.compliant);
  else if (compliance === 'flagged') data = data.filter(d => !d.compliant);
  if (!data.length) { toast('No data matches the current filters', 'warning'); return; }

  const header = ['ID', 'CRN', 'A-Number', 'MAWP (kPa)', 'Status', 'Compliant', 'Manufacturer', 'Registered'];
  const rows = data.map(({ equip: e, compliant }) =>
    [e.equipmentId.toString(), e.crn, e.aNumber || '', e.mawp.toString(),
     statusLabel(e.status), compliant ? 'Yes' : 'No', e.manufacturer, tsToDate(e.registeredAt.toNumber())]
    .map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')
  );
  const csv  = [header.join(','), ...rows].join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = `ironledger-equipment-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
  toast('CSV exported!', 'success');
}

function quickDetail(id) {
  document.getElementById('detail-search-id').value = id;
  showPage('detail');
  loadEquipmentDetail();
}

// ═══════════════════════════════════════════════════════════════════
// REGISTER EQUIPMENT
// ═══════════════════════════════════════════════════════════════════

async function registerEquipment() {
  if (!ensureConnected() || !ensureContract('registry') || !ensureNetwork()) return;

  const crn     = document.getElementById('reg-crn').value.trim();
  const mdrText = document.getElementById('reg-mdr-text').value.trim();
  const mdrRaw  = document.getElementById('reg-mdr-hash').value.trim();
  const mawp    = document.getElementById('reg-mawp').value.trim();

  if (!crn)  { toast('CRN is required', 'error'); return; }
  if (!mawp || parseInt(mawp, 10) <= 0 || isNaN(parseInt(mawp, 10))) { toast('MAWP must be a positive number greater than 0', 'error'); return; }
  if (!mdrText && !mdrRaw) { toast('MDR document text or hash is required', 'error'); return; }

  let mdrHash;
  if (mdrRaw) {
    if (!/^0x[0-9a-fA-F]{64}$/.test(mdrRaw)) {
      toast('MDR hash must be a 0x-prefixed bytes32 (64 hex chars)', 'error'); return;
    }
    mdrHash = mdrRaw;
  } else {
    mdrHash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(mdrText));
  }

  // Update preview
  document.getElementById('reg-preview-fn').textContent =
    `registerEquipment(\n  "${crn}",\n  ${mdrHash.slice(0,10)}…,\n  ${mawp}\n)`;

  try {
    setBtnLoading('btn-register', true, 'Sending…');
    const tx = await registryContract.registerEquipment(crn, mdrHash, ethers.BigNumber.from(mawp));
    toast(`Transaction sent: ${shortAddr(tx.hash)}`, 'info');

    const receipt = await tx.wait();
    const event = receipt.events?.find(e => e.event === 'EquipmentRegistered');
    const newId = event ? event.args.equipmentId.toString() : '?';

    document.getElementById('reg-result-box').innerHTML = `
      <div class="gate-row gate-pass">
        <div class="gate-icon">✅</div>
        <div>
          <div class="gate-label">Equipment Registered &mdash; ID: <strong>#${escHtml(newId)}</strong></div>
          <div class="gate-sub">CRN: ${escHtml(crn)} &nbsp;&middot;&nbsp; MAWP: ${escHtml(mawp)} kPa</div>
        </div>
      </div>
      <div style="margin-top:12px;font-size:12px;line-height:2">
        <strong>Transaction:</strong>
        <a class="tx-link" href="https://sepolia.etherscan.io/tx/${encodeURIComponent(tx.hash)}" target="_blank" rel="noopener noreferrer">
          ${shortAddr(tx.hash)} ↗
        </a>
        <button class="copy-btn" data-copy="${escHtml(tx.hash)}" onclick="copyText(this.dataset.copy, this)" title="Copy tx hash">📋</button><br/>
        <strong>MDR Hash:</strong>
        <span class="hash" title="${escHtml(mdrHash)}">${escHtml(mdrHash.slice(0,12))}…${escHtml(mdrHash.slice(-8))}</span>
        <button class="copy-btn" data-copy="${escHtml(mdrHash)}" onclick="copyText(this.dataset.copy, this)" title="Copy MDR hash">📋</button><br/>
        <strong>Next step:</strong> <a href="#" onclick="document.getElementById('sco-equip-id').value='${escHtml(newId)}';showPage('certificate');return false;">Sign Shop Inspection →</a>
      </div>
      <div class="status-steps" style="margin-top:14px">
        <div class="status-step done"><div class="step-circle">✓</div><div class="step-label">Registered</div></div>
        <div class="status-step current"><div class="step-circle">2</div><div class="step-label">Shop Inspect</div></div>
        <div class="status-step"><div class="step-circle">3</div><div class="step-label">Certified</div></div>
        <div class="status-step"><div class="step-circle">4</div><div class="step-label">Active</div></div>
      </div>`;

    toast(`Equipment registered! ID: ${newId}`, 'success');
    loadDashboard();
  } catch (err) {
    if (isUserRejection(err)) {
      toast('Transaction cancelled', 'warning');
      document.getElementById('reg-result-box').innerHTML =
        '<div class="empty-state">Registration cancelled — no transaction was sent.</div>';
    } else {
      const msg = extractErrorMsg(err);
      toast('Registration failed: ' + msg, 'error');
      document.getElementById('reg-result-box').innerHTML =
        `<div class="gate-row gate-fail"><div class="gate-icon">✗</div>
         <div><div class="gate-label">Transaction Failed</div>
         <div class="gate-sub">${escHtml(msg)}</div></div></div>`;
    }
  } finally {
    setBtnLoading('btn-register', false, 'Register Equipment');
  }
}

function clearRegisterForm() {
  ['reg-crn','reg-mdr-text','reg-mdr-hash','reg-mawp'].forEach(id => {
    document.getElementById(id).value = '';
    sessionStorage.removeItem(`il_form_${id}`);
  });
  document.getElementById('reg-result-box').innerHTML =
    '<div class="empty-state">Register equipment to see result here.</div>';
  document.getElementById('reg-preview-fn').textContent = 'registerEquipment(crn, mdrHash, mawp)';
}

// ═══════════════════════════════════════════════════════════════════
// INSPECTION LOG
// ═══════════════════════════════════════════════════════════════════

async function logInspection() {
  if (!ensureConnected() || !ensureContract('inspection') || !ensureNetwork()) return;

  const equipId   = document.getElementById('insp-equip-id').value.trim();
  const result    = document.getElementById('insp-result').value;
  const notesText = document.getElementById('insp-notes-text').value.trim();
  const notesRaw  = document.getElementById('insp-notes-hash').value.trim();

  if (!equipId || !/^\d+$/.test(equipId) || parseInt(equipId, 10) <= 0) { toast('Enter a valid positive Equipment ID', 'error'); return; }
  if (!notesText && !notesRaw) { toast('Inspection notes or hash is required', 'error'); return; }

  let notesHash;
  if (notesRaw) {
    if (!/^0x[0-9a-fA-F]{64}$/.test(notesRaw)) {
      toast('Notes hash must be a 0x-prefixed bytes32', 'error'); return;
    }
    notesHash = notesRaw;
  } else {
    notesHash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(notesText));
  }

  try {
    setBtnLoading('btn-loginsp', true, 'Sending…');
    const tx = await inspectionContract.logInspection(
      ethers.BigNumber.from(equipId), parseInt(result, 10), notesHash
    );
    toast(`Transaction sent: ${shortAddr(tx.hash)}`, 'info');
    await tx.wait();
    toast('Inspection logged successfully!', 'success');
    clearInspectForm();
    document.getElementById('insp-history-id').value = equipId;
    loadInspectionHistory();
  } catch (err) {
    if (isUserRejection(err)) { toast('Transaction cancelled', 'warning'); }
    else { toast('Log inspection failed: ' + extractErrorMsg(err), 'error'); }
  } finally {
    setBtnLoading('btn-loginsp', false, 'Sign & Log Inspection');
  }
}

function clearInspectForm() {
  ['insp-equip-id','insp-notes-text','insp-notes-hash'].forEach(id => {
    document.getElementById(id).value = '';
    sessionStorage.removeItem(`il_form_${id}`);
  });
  document.getElementById('insp-result').value = '0';
}

async function checkCompliance() {
  if (!ensureContract('inspection')) return;
  const id = document.getElementById('compliance-check-id').value.trim();
  if (!id || !/^\d+$/.test(id) || parseInt(id, 10) <= 0) { toast('Enter a valid positive Equipment ID', 'error'); return; }

  const res = document.getElementById('compliance-result');
  res.innerHTML = '<div class="loading-msg" style="padding:12px 0"><span class="spinner" style="border-top-color:var(--brand-light)"></span> Checking compliance…</div>';

  try {
    const [compliant, flagged] = await Promise.all([
      inspectionContract.isCompliant(ethers.BigNumber.from(id)),
      inspectionContract.complianceFlag(ethers.BigNumber.from(id))
    ]);

    if (compliant) {
      res.innerHTML = `<div class="gate-row gate-pass">
        <div class="gate-icon">✓</div>
        <div><div class="gate-label">Equipment #${escHtml(id)} — Compliant</div>
        <div class="gate-sub">No active compliance flags · eligible for transfer</div></div></div>`;
    } else {
      res.innerHTML = `<div class="gate-row gate-fail">
        <div class="gate-icon">✗</div>
        <div><div class="gate-label">Equipment #${escHtml(id)} — Non-Compliant</div>
        <div class="gate-sub">Active flag: ${flagged} · Transfer blocked</div></div></div>`;
    }
  } catch (err) {
    res.innerHTML = '';
    toast('Compliance check failed: ' + extractErrorMsg(err), 'error');
  }
}

async function checkOverdue() {
  if (!ensureConnected() || !ensureContract('inspection')) return;
  const id = document.getElementById('compliance-check-id').value.trim();
  if (!id || !/^\d+$/.test(id) || parseInt(id, 10) <= 0) { toast('Enter a valid positive Equipment ID', 'error'); return; }

  if (!confirm(`Flag Equipment #${id} as overdue?\nThis will set a compliance flag on-chain and block transfers until resolved.`)) return;

  try {
    setBtnLoading('btn-checkoverdue', true, 'Checking…');
    const tx = await inspectionContract.checkOverdue(ethers.BigNumber.from(id));
    toast(`Transaction sent: ${shortAddr(tx.hash)}`, 'info');
    await tx.wait();
    toast('Overdue check completed', 'success');
    checkCompliance();
  } catch (err) {
    if (isUserRejection(err)) { toast('Transaction cancelled', 'warning'); }
    else { toast('Check overdue failed: ' + extractErrorMsg(err), 'error'); }
  } finally {
    setBtnLoading('btn-checkoverdue', false, 'Check Overdue (ABSA)');
  }
}

async function loadInspectionHistory() {
  if (!ensureContract('inspection')) return;
  const id = document.getElementById('insp-history-id').value.trim();
  if (!id || !/^\d+$/.test(id) || parseInt(id, 10) <= 0) { toast('Enter a valid positive Equipment ID', 'error'); return; }

  const container    = document.getElementById('insp-history-container');
  const intervalInfo = document.getElementById('insp-interval-info');
  container.innerHTML = '<div class="loading-msg">Loading…</div>';
  intervalInfo.style.display = 'none';

  try {
    const [records, interval] = await Promise.all([
      inspectionContract.getInspectionHistory(ethers.BigNumber.from(id)),
      inspectionContract.inspectionInterval().catch(() => null)
    ]);

    if (interval) {
      const days = Math.floor(interval.toNumber() / 86400);
      const hrs  = Math.floor((interval.toNumber() % 86400) / 3600);
      intervalInfo.textContent = `⏱ Inspection interval: ${days} day${days !== 1 ? 's' : ''}${hrs > 0 ? (' ' + hrs + 'h') : ''}`;
      intervalInfo.style.display = 'block';
    }

    if (records.length === 0) {
      container.innerHTML = '<div class="empty-state">No inspections logged for this equipment.</div>';
      return;
    }

    const rows = [...records].reverse().map(r => `
      <tr>
        <td>${r.inspectionId.toString()}</td>
        <td>${tsToDate(r.inspectedAt.toNumber())}</td>
        <td><span class="hash">${shortAddr(r.inspector)}</span></td>
        <td>${r.result === 0
          ? '<span class="badge badge-compliant">✓ Pass</span>'
          : '<span class="badge badge-flagged">✗ Fail</span>'}</td>
        <td><span class="hash" title="${escHtml(r.notesHash)}">${escHtml(r.notesHash.slice(0,10))}…</span></td>
      </tr>`).join('');

    container.innerHTML = `
      <table>
        <thead><tr><th>#</th><th>Date</th><th>Inspector</th><th>Result</th><th>Notes Hash</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>`;
  } catch (err) {
    container.innerHTML = `<div class="empty-state">Error: ${escHtml(extractErrorMsg(err))}</div>`;
  }
}

// ═══════════════════════════════════════════════════════════════════
// CERTIFICATE
// ═══════════════════════════════════════════════════════════════════

async function signShopInspection() {
  if (!ensureConnected() || !ensureContract('registry') || !ensureNetwork()) return;
  const id = document.getElementById('sco-equip-id').value.trim();
  if (!id || !/^\d+$/.test(id) || parseInt(id, 10) <= 0) { toast('Enter a valid positive Equipment ID', 'error'); return; }

  try {
    setBtnLoading('btn-shopsign', true, 'Sending…');
    const tx = await registryContract.signShopInspection(ethers.BigNumber.from(id));
    toast(`Transaction sent: ${shortAddr(tx.hash)}`, 'info');
    await tx.wait();
    toast(`Shop inspection signed for Equipment #${id}!`, 'success');
    document.getElementById('cert-lookup-id').value = id;
    loadCertEquipment();
  } catch (err) {
    if (isUserRejection(err)) { toast('Transaction cancelled', 'warning'); }
    else { toast('Sign shop inspection failed: ' + extractErrorMsg(err), 'error'); }
  } finally {
    setBtnLoading('btn-shopsign', false, 'Sign Shop Inspection');
  }
}

async function issueCertificate() {
  if (!ensureConnected() || !ensureContract('registry') || !ensureNetwork()) return;
  const id      = document.getElementById('cert-equip-id').value.trim();
  const aNumber = document.getElementById('cert-anumber').value.trim();

  if (!id || !/^\d+$/.test(id) || parseInt(id, 10) <= 0) { toast('Enter a valid positive Equipment ID', 'error'); return; }
  if (!aNumber) { toast('A-Number is required', 'error'); return; }

  try {
    setBtnLoading('btn-issuecert', true, 'Sending…');
    const tx = await registryContract.issueCertificate(ethers.BigNumber.from(id), aNumber);
    toast(`Transaction sent: ${shortAddr(tx.hash)}`, 'info');
    await tx.wait();
    toast(`Certificate issued for Equipment #${id} with A-Number ${aNumber}!`, 'success');
    document.getElementById('cert-lookup-id').value = id;
    loadCertEquipment();
  } catch (err) {
    if (isUserRejection(err)) { toast('Transaction cancelled', 'warning'); }
    else { toast('Issue certificate failed: ' + extractErrorMsg(err), 'error'); }
  } finally {
    setBtnLoading('btn-issuecert', false, 'Issue Certificate');
  }
}

async function activateEquipment() {
  if (!ensureConnected() || !ensureContract('registry') || !ensureNetwork()) return;
  const id = document.getElementById('activate-equip-id').value.trim();
  if (!id || !/^\d+$/.test(id) || parseInt(id, 10) <= 0) { toast('Enter a valid positive Equipment ID', 'error'); return; }

  try {
    setBtnLoading('btn-activate', true, 'Sending…');
    const tx = await registryContract.activateEquipment(ethers.BigNumber.from(id));
    toast(`Transaction sent: ${shortAddr(tx.hash)}`, 'info');
    await tx.wait();
    toast(`Equipment #${id} activated!`, 'success');
    document.getElementById('cert-lookup-id').value = id;
    loadCertEquipment();
  } catch (err) {
    if (isUserRejection(err)) { toast('Transaction cancelled', 'warning'); }
    else { toast('Activate equipment failed: ' + extractErrorMsg(err), 'error'); }
  } finally {
    setBtnLoading('btn-activate', false, 'Activate Equipment');
  }
}

async function loadCertPrecheck() {
  if (!ensureContract('registry')) return;
  const id = document.getElementById('cert-equip-id').value.trim();
  if (!id || !/^\d+$/.test(id) || parseInt(id, 10) <= 0) { toast('Enter a valid positive Equipment ID', 'error'); return; }

  const container = document.getElementById('cert-gate-check');
  container.innerHTML = '<div class="loading-msg" style="padding:8px 0">Checking pre-conditions…</div>';

  try {
    const equip = await registryContract.getEquipment(ethers.BigNumber.from(id));
    const s = equip.status;
    container.innerHTML = `
      <div class="section-label">Pre-conditions</div>
      <div class="gate-row ${equip.registeredAt.toNumber() > 0 ? 'gate-pass' : 'gate-fail'}" style="margin-bottom:6px">
        <div class="gate-icon">${equip.registeredAt.toNumber() > 0 ? '✓' : '✗'}</div>
        <div><div class="gate-label">Equipment Registered</div><div class="gate-sub">Status: ${statusLabel(s)}</div></div>
      </div>
      <div class="gate-row ${s >= 1 ? 'gate-pass' : 'gate-fail'}" style="margin-bottom:6px">
        <div class="gate-icon">${s >= 1 ? '✓' : '○'}</div>
        <div><div class="gate-label">Shop Inspection Signed</div>
        <div class="gate-sub">${s >= 1 ? `SCO: ${shortAddr(equip.shopInspector)}` : 'Awaiting SCO sign-off'}</div></div>
      </div>
      <div class="gate-row ${s < 2 ? 'gate-pass' : 'gate-fail'}" style="margin-bottom:0">
        <div class="gate-icon">${s < 2 ? '✓' : '✗'}</div>
        <div><div class="gate-label">Certificate Not Yet Issued</div>
        <div class="gate-sub">${s < 2 ? 'Ready to issue' : 'Already issued — ' + escHtml(equip.aNumber)}</div></div>
      </div>`;
  } catch (err) {
    container.innerHTML = '';
    toast('Failed to load equipment: ' + extractErrorMsg(err), 'error');
  }
}

async function loadCertEquipment() {
  if (!ensureContract('registry')) return;
  const id = document.getElementById('cert-lookup-id').value.trim();
  if (!id || !/^\d+$/.test(id) || parseInt(id, 10) <= 0) return;

  const container = document.getElementById('cert-equip-summary');
  container.innerHTML = '<div class="loading-msg">Loading…</div>';

  try {
    const equip = await registryContract.getEquipment(ethers.BigNumber.from(id));
    container.innerHTML = equipmentTable(equip);
  } catch (err) {
    container.innerHTML = `<div class="empty-state">Error: ${escHtml(extractErrorMsg(err))}</div>`;
  }
}

// ═══════════════════════════════════════════════════════════════════
// OWNERSHIP TRANSFER
// ═══════════════════════════════════════════════════════════════════

async function assignInitialCustody() {
  if (!ensureConnected() || !ensureContract('transfer') || !ensureNetwork()) return;
  const id       = document.getElementById('custody-equip-id').value.trim();
  const operator = document.getElementById('custody-operator').value.trim();

  if (!id || !/^\d+$/.test(id) || parseInt(id, 10) <= 0) { toast('Enter a valid positive Equipment ID', 'error'); return; }
  if (!operator) { toast('Operator address is required', 'error'); return; }
  if (!ethers.utils.isAddress(operator)) { toast('Invalid operator address', 'error'); return; }

  try {
    setBtnLoading('btn-custody', true, 'Sending…');
    const tx = await transferContract.assignInitialCustody(ethers.BigNumber.from(id), operator);
    toast(`Transaction sent: ${shortAddr(tx.hash)}`, 'info');
    await tx.wait();
    toast(`Initial custody assigned for Equipment #${id}!`, 'success');
    document.getElementById('xfer-history-id').value = id;
    loadTransferHistory();
  } catch (err) {
    if (isUserRejection(err)) { toast('Transaction cancelled', 'warning'); }
    else { toast('Assign custody failed: ' + extractErrorMsg(err), 'error'); }
  } finally {
    setBtnLoading('btn-custody', false, 'Assign Custody');
  }
}

async function loadTransferGate() {
  if (!transferContract || !inspectionContract) return;
  const id = document.getElementById('xfer-equip-id').value.trim();
  if (!id || !/^\d+$/.test(id) || parseInt(id, 10) <= 0) return;

  const container = document.getElementById('transfer-gate-check');
  try {
    const [certified, compliant, owner] = await Promise.all([
      registryContract ? registryContract.isCertified(ethers.BigNumber.from(id)) : Promise.resolve(false),
      inspectionContract.isCompliant(ethers.BigNumber.from(id)),
      transferContract.getCurrentOwner(ethers.BigNumber.from(id))
    ]);

    const canTransfer = certified && compliant;
    container.innerHTML = `
      <div class="section-label">Compliance Gate</div>
      <div class="gate-row ${certified ? 'gate-pass' : 'gate-fail'}" style="margin-bottom:6px">
        <div class="gate-icon">${certified ? '✓' : '✗'}</div>
        <div><div class="gate-label">Certificate Issued</div><div class="gate-sub">isCertified() = ${certified}</div></div>
      </div>
      <div class="gate-row ${compliant ? 'gate-pass' : 'gate-fail'}" style="margin-bottom:6px">
        <div class="gate-icon">${compliant ? '✓' : '✗'}</div>
        <div><div class="gate-label">No Active Compliance Flag</div><div class="gate-sub">isCompliant() = ${compliant}</div></div>
      </div>
      <div class="gate-row ${canTransfer ? 'gate-pass' : 'gate-fail'}">
        <div class="gate-icon">${canTransfer ? '✓' : '✗'}</div>
        <div><div class="gate-label">${canTransfer ? 'Transfer Eligible' : 'Transfer Blocked'}</div>
        <div class="gate-sub">Current owner: ${shortAddr(owner)}</div></div>
      </div>`;
  } catch (err) {
    container.innerHTML = `<div style="font-size:12px;color:var(--text-muted)">Could not load gate check: ${escHtml(err.message)}</div>`;
  }
}

async function initiateTransfer() {
  if (!ensureConnected() || !ensureContract('transfer') || !ensureNetwork()) return;
  const id = document.getElementById('xfer-equip-id').value.trim();
  const to = document.getElementById('xfer-to').value.trim();

  if (!id || !/^\d+$/.test(id) || parseInt(id, 10) <= 0) { toast('Enter a valid positive Equipment ID', 'error'); return; }
  if (!to) { toast('To address is required', 'error'); return; }
  if (!ethers.utils.isAddress(to)) { toast('Invalid to address', 'error'); return; }
  if (to === ZERO_ADDR) { toast('Cannot transfer to the zero address', 'error'); return; }
  if (account && to.toLowerCase() === account.toLowerCase()) { toast('Cannot transfer to your own address', 'error'); return; }

  try {
    setBtnLoading('btn-initxfer', true, 'Sending…');
    const tx = await transferContract.initiateTransfer(ethers.BigNumber.from(id), to);
    toast(`Transaction sent: ${shortAddr(tx.hash)}`, 'info');
    await tx.wait();
    toast(`Transfer initiated for Equipment #${id}!`, 'success');
    document.getElementById('xfer-history-id').value = id;
    loadTransferHistory();
    document.getElementById('xfer-complete-id').value = id;
    loadPendingTransfer();
  } catch (err) {
    if (isUserRejection(err)) { toast('Transaction cancelled', 'warning'); }
    else { toast('Initiate transfer failed: ' + extractErrorMsg(err), 'error'); }
  } finally {
    setBtnLoading('btn-initxfer', false, 'Initiate Transfer');
  }
}

async function loadPendingTransfer() {
  if (!transferContract) return;
  const id = document.getElementById('xfer-complete-id').value.trim();
  if (!id || !/^\d+$/.test(id) || parseInt(id, 10) <= 0) return;

  const container = document.getElementById('pending-transfer-info');
  try {
    const pending = await transferContract.getPendingTransfer(ethers.BigNumber.from(id));
    if (pending === ZERO_ADDR) {
      container.innerHTML = `<div style="font-size:12px;color:var(--text-muted)">No pending transfer for Equipment #${id}</div>`;
    } else {
      container.innerHTML = `<div class="gate-row gate-pass">
        <div class="gate-icon">⏳</div>
        <div><div class="gate-label">Pending Transfer</div>
        <div class="gate-sub">Equipment #${id} → <span class="hash">${shortAddr(pending)}</span></div></div>
      </div>`;
    }
  } catch (err) {
    container.innerHTML = `<div style="font-size:12px;color:var(--text-muted)">Error: ${escHtml(err.message)}</div>`;
  }
}

async function completeTransfer() {
  if (!ensureConnected() || !ensureContract('transfer') || !ensureNetwork()) return;
  const id = document.getElementById('xfer-complete-id').value.trim();
  if (!id || !/^\d+$/.test(id) || parseInt(id, 10) <= 0) { toast('Enter a valid positive Equipment ID', 'error'); return; }

  try {
    setBtnLoading('btn-completexfer', true, 'Sending…');
    const tx = await transferContract.completeTransfer(ethers.BigNumber.from(id));
    toast(`Transaction sent: ${shortAddr(tx.hash)}`, 'info');
    await tx.wait();
    toast(`Transfer completed for Equipment #${id}!`, 'success');
    document.getElementById('xfer-history-id').value = id;
    loadTransferHistory();
    loadPendingTransfer();
  } catch (err) {
    if (isUserRejection(err)) { toast('Transaction cancelled', 'warning'); }
    else { toast('Complete transfer failed: ' + extractErrorMsg(err), 'error'); }
  } finally {
    setBtnLoading('btn-completexfer', false, 'Complete Transfer');
  }
}

async function cancelTransfer() {
  if (!ensureConnected() || !ensureContract('transfer') || !ensureNetwork()) return;
  const id = document.getElementById('xfer-complete-id').value.trim();
  if (!id || !/^\d+$/.test(id) || parseInt(id, 10) <= 0) { toast('Enter a valid positive Equipment ID', 'error'); return; }

  if (!confirm(`Cancel the pending transfer for Equipment #${id}?\nThis action cannot be undone.`)) return;

  try {
    setBtnLoading('btn-cancelxfer', true, 'Sending…');
    const tx = await transferContract.cancelTransfer(ethers.BigNumber.from(id));
    toast(`Transaction sent: ${shortAddr(tx.hash)}`, 'info');
    await tx.wait();
    toast(`Transfer cancelled for Equipment #${id}`, 'success');
    loadPendingTransfer();
    loadTransferHistory();
  } catch (err) {
    if (isUserRejection(err)) { toast('Transaction cancelled', 'warning'); }
    else { toast('Cancel transfer failed: ' + extractErrorMsg(err), 'error'); }
  } finally {
    setBtnLoading('btn-cancelxfer', false, 'Cancel Transfer');
  }
}

async function loadTransferHistory() {
  if (!ensureContract('transfer')) return;
  const id = document.getElementById('xfer-history-id').value.trim();
  if (!id || !/^\d+$/.test(id) || parseInt(id, 10) <= 0) { toast('Enter a valid positive Equipment ID', 'error'); return; }

  const container = document.getElementById('xfer-history-container');
  container.innerHTML = '<div class="loading-msg">Loading…</div>';

  try {
    const records = await transferContract.getTransferHistory(ethers.BigNumber.from(id));
    if (records.length === 0) {
      container.innerHTML = '<div class="empty-state">No transfer history for this equipment.</div>';
      return;
    }

    const rows = [...records].reverse().map(r => `
      <tr>
        <td><span class="hash">${shortAddr(r.from)}</span></td>
        <td><span class="hash">${shortAddr(r.to)}</span></td>
        <td>${tsToDate(r.transferredAt.toNumber())}</td>
        <td><span class="hash">${shortAddr(r.transferredBy)}</span></td>
      </tr>`).join('');

    container.innerHTML = `
      <table>
        <thead><tr><th>From</th><th>To</th><th>Date</th><th>By</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>`;
  } catch (err) {
    container.innerHTML = `<div class="empty-state">Error: ${escHtml(extractErrorMsg(err))}</div>`;
  }
}

// ═══════════════════════════════════════════════════════════════════
// EQUIPMENT DETAIL
// ═══════════════════════════════════════════════════════════════════

async function loadEquipmentDetail() {
  const id = document.getElementById('detail-search-id').value.trim();
  if (!id || !/^\d+$/.test(id) || parseInt(id, 10) <= 0) { toast('Enter a valid positive Equipment ID', 'error'); return; }
  if (!ensureContract('registry')) return;

  // Persist last searched ID across tab navigations
  sessionStorage.setItem('il_last_detail_id', id);

  document.getElementById('detail-stats').style.display = 'none';
  document.getElementById('detail-content').style.display = 'none';

  try {
    const idBN = ethers.BigNumber.from(id);

    // Parallel fetch
    const [equip, inspections, transfers, owner, compliant, flagged] = await Promise.all([
      registryContract.getEquipment(idBN),
      inspectionContract ? inspectionContract.getInspectionHistory(idBN) : Promise.resolve([]),
      transferContract ? transferContract.getTransferHistory(idBN) : Promise.resolve([]),
      transferContract ? transferContract.getCurrentOwner(idBN) : Promise.resolve('0x0000000000000000000000000000000000000000'),
      inspectionContract ? inspectionContract.isCompliant(idBN) : Promise.resolve(true),
      inspectionContract ? inspectionContract.complianceFlag(idBN) : Promise.resolve(false)
    ]);

    // Stats bar
    document.getElementById('detail-stat-id').textContent = id;
    document.getElementById('detail-stat-crn').textContent = 'CRN: ' + equip.crn;
    document.getElementById('detail-stat-compliance').innerHTML = compliant
      ? '<span class="badge badge-compliant" style="font-size:14px;padding:5px 14px">Compliant</span>'
      : '<span class="badge badge-flagged" style="font-size:14px;padding:5px 14px">Flagged</span>';
    document.getElementById('detail-stat-flag').textContent = flagged ? 'Active compliance flag' : 'No active flags';

    document.getElementById('detail-stat-owner').textContent = owner === ZERO_ADDR ? 'Not assigned' : owner;
    document.getElementById('detail-stat-owner').title = owner;
    const lastXfer = transfers.length ? tsToDate(transfers[transfers.length-1].transferredAt.toNumber()) : '';
    document.getElementById('detail-stat-owner-since').textContent = lastXfer ? `Since ${lastXfer}` : (owner !== ZERO_ADDR ? 'Initial custody' : '');

    document.getElementById('detail-stats').style.display = 'grid';

    // Equipment record
    document.getElementById('detail-record-table').innerHTML = equipmentTable(equip);

    // Inspection summary
    if (inspections.length === 0) {
      document.getElementById('detail-inspection-table').innerHTML =
        '<div class="empty-state">No inspections logged.</div>';
    } else {
      const rows = [...inspections].reverse().map(r => `
        <tr>
          <td>${r.inspectionId.toString()}</td>
          <td>${tsToDate(r.inspectedAt.toNumber())}</td>
          <td><span class="hash">${shortAddr(r.inspector)}</span></td>
          <td>${r.result === 0
            ? '<span class="badge badge-compliant">✓ Pass</span>'
            : '<span class="badge badge-flagged">✗ Fail</span>'}</td>
        </tr>`).join('');
      document.getElementById('detail-inspection-table').innerHTML = `
        <table><thead><tr><th>#</th><th>Date</th><th>Inspector</th><th>Result</th></tr></thead>
        <tbody>${rows}</tbody></table>`;
    }

    // Build timeline
    buildTimeline(equip, inspections, transfers, owner);

    document.getElementById('detail-content').style.display = 'grid';

  } catch (err) {
    toast('Failed to load equipment: ' + extractErrorMsg(err), 'error');
  }
}

function buildTimeline(equip, inspections, transfers, currentOwner) {
  const events = [];

  // Registration
  events.push({
    ts: equip.registeredAt.toNumber(),
    color: 'blue',
    label: 'Equipment Registered',
    meta: 'EquipmentRegistry.sol',
    addr: `Manufacturer: ${shortAddr(equip.manufacturer)}`
  });

  // Shop inspection
  if (equip.status >= 1 && equip.shopInspectedAt.toNumber() > 0) {
    events.push({
      ts: equip.shopInspectedAt.toNumber(),
      color: 'blue',
      label: 'Shop Inspection Signed',
      meta: 'EquipmentRegistry.sol',
      addr: `SCO: ${shortAddr(equip.shopInspector)}`
    });
  }

  // Certificate
  if (equip.status >= 2 && equip.certificateIssuedAt.toNumber() > 0) {
    events.push({
      ts: equip.certificateIssuedAt.toNumber(),
      color: 'green',
      label: 'Certificate of Inspection Issued',
      meta: `EquipmentRegistry.sol · A-Number: ${equip.aNumber || '—'}`,
      addr: `ABSA: ${shortAddr(equip.certificateIssuer)}`
    });
  }

  // Inspections
  inspections.forEach(r => {
    events.push({
      ts: r.inspectedAt.toNumber(),
      color: r.result === 0 ? 'blue' : 'red',
      label: `Inspection Logged — ${r.result === 0 ? 'Pass' : 'Fail'}`,
      meta: 'InspectionLog.sol',
      addr: `SCO: ${shortAddr(r.inspector)}`
    });
  });

  // Transfers
  transfers.forEach(r => {
    events.push({
      ts: r.transferredAt.toNumber(),
      color: 'green',
      label: 'Transfer Completed',
      meta: 'OwnershipTransfer.sol',
      addr: `${shortAddr(r.from)} → ${shortAddr(r.to)}`
    });
  });

  // Sort descending by timestamp
  events.sort((a, b) => b.ts - a.ts);

  const container = document.getElementById('detail-timeline');
  if (events.length === 0) {
    container.innerHTML = '<div class="empty-state">No events found.</div>';
    return;
  }

  container.innerHTML = events.map(e => `
    <div class="tl-item">
      <div class="tl-dot ${e.color}"></div>
      <div class="tl-card">
        <div class="tl-event">${escHtml(e.label)}</div>
        <div class="tl-meta">${tsToDate(e.ts)} &nbsp;&middot;&nbsp; ${escHtml(e.meta)}</div>
        <div class="tl-addr">${escHtml(e.addr)}</div>
      </div>
    </div>`).join('');
}

// ═══════════════════════════════════════════════════════════════════
// ADMIN / ROLES
// ═══════════════════════════════════════════════════════════════════

async function grantRole() {
  if (!ensureConnected() || !ensureNetwork()) return;
  const contractKey = document.getElementById('grant-contract').value;
  const roleName    = document.getElementById('grant-role').value;
  const address     = document.getElementById('grant-address').value.trim();

  if (!address || !ethers.utils.isAddress(address)) {
    toast('Valid Ethereum address is required', 'error'); return;
  }

  const contract = getAdminContract(contractKey);
  if (!contract) { toast('Contract not configured', 'error'); return; }

  try {
    setBtnLoading('btn-grant', true, 'Granting…');
    const roleBytes = ROLES[roleName];
    const tx = await contract.grantRole(roleBytes, address);
    toast(`Transaction sent: ${shortAddr(tx.hash)}`, 'info');
    await tx.wait();
    toast(`${roleName} granted to ${shortAddr(address)}!`, 'success');
    checkAllRoles();
  } catch (err) {
    if (isUserRejection(err)) { toast('Transaction cancelled', 'warning'); }
    else { toast('Grant role failed: ' + extractErrorMsg(err), 'error'); }
  } finally {
    setBtnLoading('btn-grant', false, 'Grant Role');
  }
}

async function revokeRole() {
  if (!ensureConnected() || !ensureNetwork()) return;
  const contractKey = document.getElementById('grant-contract').value;
  const roleName    = document.getElementById('grant-role').value;
  const address     = document.getElementById('grant-address').value.trim();

  if (!address || !ethers.utils.isAddress(address)) {
    toast('Valid Ethereum address is required', 'error'); return;
  }

  if (!confirm(`Revoke ${roleName} from ${shortAddr(address)} on ${contractKey}?\nThis will take effect on-chain and costs gas.`)) return;

  const contract = getAdminContract(contractKey);
  if (!contract) { toast('Contract not configured', 'error'); return; }

  try {
    setBtnLoading('btn-revoke', true, 'Revoking…');
    const roleBytes = ROLES[roleName];
    const tx = await contract.revokeRole(roleBytes, address);
    toast(`Transaction sent: ${shortAddr(tx.hash)}`, 'info');
    await tx.wait();
    toast(`${roleName} revoked from ${shortAddr(address)}`, 'success');
    checkAllRoles();
  } catch (err) {
    if (isUserRejection(err)) { toast('Transaction cancelled', 'warning'); }
    else { toast('Revoke role failed: ' + extractErrorMsg(err), 'error'); }
  } finally {
    setBtnLoading('btn-revoke', false, 'Revoke Role');
  }
}

function getAdminContract(key) {
  if (key === 'registry')   return registryContract;
  if (key === 'inspection') return inspectionContract;
  if (key === 'transfer')   return transferContract;
  return null;
}

async function checkAllRoles() {
  const addrInput = document.getElementById('check-role-addr').value.trim();
  const target = addrInput || account;

  if (!target) { toast('Connect wallet or enter an address', 'error'); return; }
  if (!ethers.utils.isAddress(target)) { toast('Invalid address', 'error'); return; }
  if (!registryContract) { toast('Registry contract not configured', 'error'); return; }

  const container = document.getElementById('role-check-result');
  container.innerHTML = '<div class="loading-msg">Checking roles…</div>';

  try {
    const roleNames = Object.keys(ROLES);
    const contracts = [
      { label: 'EquipmentRegistry', c: registryContract },
      { label: 'InspectionLog',     c: inspectionContract },
      { label: 'OwnershipTransfer', c: transferContract }
    ].filter(x => x.c);

    // For each contract, check every role — a role is considered granted if
    // it is granted on ANY of the deployed contracts.
    const allChecks = await Promise.all(
      contracts.flatMap(({ c }) =>
        roleNames.map(name => c.hasRole(ROLES[name], target).catch(() => false))
      )
    );

    // Merge: role[i] = true if granted on at least one contract
    const merged = roleNames.map((_, i) =>
      contracts.some((_, ci) => allChecks[ci * roleNames.length + i])
    );

    const rows = roleNames.map((name, i) => `
      <div class="role-item">
        <div class="dot ${merged[i] ? 'has-role' : ''}"></div>
        <div><strong>${name}</strong></div>
        ${merged[i] ? '<span class="badge badge-compliant" style="margin-left:auto">✓ Granted</span>' : '<span style="margin-left:auto;font-size:11px;color:var(--text-light)">—</span>'}
      </div>`).join('');

    container.innerHTML = `
      <div style="font-size:12px;color:var(--text-muted);margin-bottom:10px">
        Roles across all contracts for <span class="hash">${shortAddr(target)}</span>
      </div>
      ${rows}`;
  } catch (err) {
    container.innerHTML = `<div class="empty-state">Error: ${escHtml(extractErrorMsg(err))}</div>`;
  }
}

function updateNavTabRoles() {
  const tabRoles = {
    dashboard:   () => true,
    detail:      () => true,
    register:    () => userRoles.isManufacturer || userRoles.isAdmin,
    inspect:     () => userRoles.isSCO || userRoles.isAdmin,
    certificate: () => userRoles.isABSA || userRoles.isSCO || userRoles.isAdmin,
    transfer:    () => userRoles.isOperator || userRoles.isABSA || userRoles.isAdmin,
    admin:       () => userRoles.isAdmin
  };
  document.querySelectorAll('.nav-tab').forEach(tab => {
    const page = tab.dataset.page;
    const existing = tab.querySelector('.tab-lock');
    if (existing) existing.remove();
    if (account && tabRoles[page] && !tabRoles[page]()) {
      const lock = document.createElement('span');
      lock.className = 'tab-lock';
      lock.textContent = '🔒';
      lock.title = 'Your wallet does not have the required role for this section';
      tab.appendChild(lock);
    }
  });
}

async function updateMyRolesDisplay() {
  const container = document.getElementById('my-roles-display');
  if (!account) {
    container.innerHTML = '<div class="empty-state">Connect wallet to see your roles.</div>';
    return;
  }

  const roleMap = [
    { name: 'DEFAULT_ADMIN_ROLE', has: userRoles.isAdmin },
    { name: 'MANUFACTURER_ROLE', has: userRoles.isManufacturer },
    { name: 'SCO_ROLE', has: userRoles.isSCO },
    { name: 'ABSA_ROLE', has: userRoles.isABSA },
    { name: 'OPERATOR_ROLE', has: userRoles.isOperator }
  ];

  container.innerHTML = roleMap.map(r => `
    <div class="role-item" style="margin-bottom:6px">
      <div class="dot ${r.has ? 'has-role' : ''}"></div>
      <div>${r.name}</div>
      ${r.has
        ? '<span class="badge badge-compliant" style="margin-left:auto">✓ Active</span>'
        : '<span style="margin-left:auto;font-size:11px;color:var(--text-light)">—</span>'}
    </div>`).join('');
}

// ═══════════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════════

function showPage(id) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active'));
  const page = document.getElementById(`page-${id}`);
  if (page) page.classList.add('active');
  const tab = document.querySelector(`.nav-tab[data-page="${id}"]`);
  if (tab) tab.classList.add('active');
  closeSidebar();

  // Restore persisted form data
  if (id === 'register') restoreFormData(['reg-crn','reg-mdr-text','reg-mdr-hash','reg-mawp']);
  if (id === 'inspect')  restoreFormData(['insp-equip-id','insp-notes-text','insp-notes-hash']);
  if (id === 'detail') {
    const saved = sessionStorage.getItem('il_last_detail_id');
    const input = document.getElementById('detail-search-id');
    if (saved && input && !input.value) input.value = saved;
  }
}

function restoreFormData(ids) {
  ids.forEach(id => {
    const val = sessionStorage.getItem(`il_form_${id}`);
    if (val !== null) {
      const el = document.getElementById(id);
      if (el && !el.value) el.value = val;
    }
  });
}

function toggleSidebar() {
  document.getElementById('sidebar').classList.toggle('open');
  document.getElementById('sidebar-overlay').classList.toggle('open');
}

function closeSidebar() {
  document.getElementById('sidebar').classList.remove('open');
  document.getElementById('sidebar-overlay').classList.remove('open');
}

function ensureConnected() {
  if (!account) { toast('Please connect your wallet first', 'warning'); return false; }
  return true;
}

function ensureContract(name) {
  if (name === 'registry' && !registryContract) {
    toast('EquipmentRegistry address not configured. Open Settings.', 'warning'); return false;
  }
  if (name === 'inspection' && !inspectionContract) {
    toast('InspectionLog address not configured. Open Settings.', 'warning'); return false;
  }
  if (name === 'transfer' && !transferContract) {
    toast('OwnershipTransfer address not configured. Open Settings.', 'warning'); return false;
  }
  return true;
}

function copyText(text, btn) {
  navigator.clipboard.writeText(text).then(() => {
    if (btn) { const orig = btn.textContent; btn.textContent = '✓'; setTimeout(() => btn.textContent = orig, 1500); }
    else toast('Copied to clipboard', 'success');
  }).catch(() => toast('Could not copy to clipboard', 'error'));
}

function addrLink(addr) {
  if (!addr || addr === ZERO_ADDR) return '—';
  if (!ethers.utils.isAddress(addr)) return escHtml(addr);
  return `<a class="tx-link" href="https://sepolia.etherscan.io/address/${encodeURIComponent(addr)}" target="_blank" rel="noopener noreferrer">${shortAddr(addr)} ↗</a>`;
}

function toast(message, type = 'info') {
  const dur = type === 'error' ? 6000 : type === 'warning' ? 5000 : 3500;
  const container = document.getElementById('toast-container');
  const el = document.createElement('div');
  el.className = `toast ${type}`;
  const icon = { success: '✅', error: '❌', info: 'ℹ️', warning: '⚠️' }[type] || '';
  el.innerHTML = `<span style="flex-shrink:0">${icon}</span><span>${escHtml(message)}</span>`;
  container.appendChild(el);
  setTimeout(() => { el.style.opacity = '0'; el.style.transition = 'opacity 0.4s'; }, dur - 400);
  setTimeout(() => el.remove(), dur);
}

function shortAddr(addr) {
  if (!addr || addr === '0x0000000000000000000000000000000000000000') return '—';
  return `${addr.slice(0,6)}…${addr.slice(-4)}`;
}

function tsToDate(ts) {
  if (!ts || ts === 0) return '—';
  return new Date(ts * 1000).toLocaleDateString('en-CA', {
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit'
  });
}

function statusLabel(s) {
  return ['Registered','ShopInspected','Certified','Active'][s] || `Unknown(${s})`;
}

function statusBadge(s) {
  const labels  = ['Registered', 'ShopInspected', 'Certified', 'Active'];
  const classes = ['badge-registered', 'badge-shopinspected', 'badge-certified', 'badge-active'];
  const icons   = ['📋 ', '🔍 ', '🏆 ', '✅ '];
  return `<span class="badge ${classes[s] || ''}">${icons[s] || ''}${labels[s] || s}</span>`;
}

function equipmentTable(equip) {
  const hashCell = (h) => h && h !== ZERO_ADDR && h !== ZERO_BYTES32
    ? `<span class="hash" title="${escHtml(h)}">${escHtml(h.slice(0,10))}…${escHtml(h.slice(-6))}</span>
       <button class="copy-btn" data-copy="${escHtml(h)}" onclick="copyText(this.dataset.copy, this)" title="Copy">📋</button>`
    : '—';
  const addrCell = (a) => a && a !== ZERO_ADDR
    ? `${addrLink(a)} <button class="copy-btn" data-copy="${escHtml(a)}" onclick="copyText(this.dataset.copy, this)" title="Copy">📋</button>`
    : '—';
  return `<table><tbody>
    <tr><td class="info-label">Equipment ID</td><td><strong>#${equip.equipmentId.toString()}</strong></td></tr>
    <tr><td class="info-label">CRN</td><td>${escHtml(equip.crn)}</td></tr>
    <tr><td class="info-label">A-Number</td><td>${escHtml(equip.aNumber) || '—'}</td></tr>
    <tr><td class="info-label">MAWP</td><td>${equip.mawp.toString()} kPa</td></tr>
    <tr><td class="info-label">MDR Hash</td><td>${hashCell(equip.mdrHash)}</td></tr>
    <tr><td class="info-label">Manufacturer</td><td>${addrCell(equip.manufacturer)}</td></tr>
    <tr><td class="info-label">Registered</td><td>${tsToDate(equip.registeredAt.toNumber())}</td></tr>
    <tr><td class="info-label">Shop Inspector</td><td>${addrCell(equip.shopInspector)}</td></tr>
    <tr><td class="info-label">Shop Inspected</td><td>${tsToDate(equip.shopInspectedAt.toNumber())}</td></tr>
    <tr><td class="info-label">Cert Issuer</td><td>${addrCell(equip.certificateIssuer)}</td></tr>
    <tr><td class="info-label">Cert Issued</td><td>${tsToDate(equip.certificateIssuedAt.toNumber())}</td></tr>
    <tr><td class="info-label">Status</td><td>${statusBadge(equip.status)}</td></tr>
  </tbody></table>`;
}

function isUserRejection(err) {
  return err.code === 4001 || err.code === 'ACTION_REJECTED' ||
    (typeof err.message === 'string' && err.message.toLowerCase().includes('user rejected'));
}

function ensureNetwork() {
  if (networkId && networkId !== SEPOLIA_CHAIN_ID) {
    toast('Switch MetaMask to Sepolia testnet before sending transactions.', 'error');
    return false;
  }
  return true;
}

function extractErrorMsg(err) {
  if (err.code === -32002) return 'MetaMask has a pending request — open MetaMask to respond.';
  if (err.code === 'UNPREDICTABLE_GAS_LIMIT') return 'Transaction would revert — check contract state and your role permissions.';
  if (err.code === 'INSUFFICIENT_FUNDS' || (err.message || '').includes('insufficient funds'))
    return 'Insufficient ETH to cover gas fees.';
  if ((err.message || '').toLowerCase().includes('nonce too low') || (err.message || '').toLowerCase().includes('nonce mismatch'))
    return 'Nonce error — try resetting your MetaMask account activity.';
  if (err.reason) return err.reason;
  if (err.data?.message) return err.data.message;
  if (err.error?.message) return err.error.message;
  const m = err.message || '';
  const match = m.match(/reason="([^"]+)"/);
  if (match) return match[1];
  const match2 = m.match(/reverted with reason string '([^']+)'/);
  if (match2) return match2[1];
  return m.length > 200 ? m.slice(0, 200) + '…' : m;
}

function escHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function setBtnLoading(id, loading, label) {
  const btn = document.getElementById(id);
  if (!btn) return;
  btn.disabled = loading;
  if (loading) {
    btn.dataset.origText = btn.innerHTML;
    btn.innerHTML = `<span class="spinner"></span>${label || 'Loading…'}`;
  } else {
    btn.innerHTML = btn.dataset.origText || label || btn.innerHTML;
  }
}

// ═══════════════════════════════════════════════════════════════════
// MY TRANSFERS
// ═══════════════════════════════════════════════════════════════════

async function loadMyTransfers() {
  if (!ensureConnected()) return;
  if (!transferContract) { toast('OwnershipTransfer contract not configured', 'warning'); return; }
  const container = document.getElementById('my-transfers-container');
  const btn = document.getElementById('btn-my-transfers');
  if (btn) { btn.disabled = true; btn.textContent = 'Loading…'; }
  container.innerHTML = '<div class="loading-msg">Scanning transfer history…</div>';

  try {
    const count = registryContract ? await registryContract.equipmentCount().catch(() => null) : null;
    if (count === null) {
      container.innerHTML = '<div class="empty-state">Could not determine equipment count — registry not configured.</div>';
      return;
    }
    const total = count.toNumber();
    const limit = Math.min(total, 50); // scan last 50 IDs for performance
    const startId = Math.max(1, total - limit + 1);

    const historyPromises = [];
    for (let i = startId; i <= total; i++) {
      const eid = i;
      historyPromises.push(
        transferContract.getTransferHistory(ethers.BigNumber.from(eid))
          .then(recs => recs.map(r => ({ ...r, equipmentId: eid })))
          .catch(() => [])
      );
    }
    const allHistories = await Promise.all(historyPromises);
    const myTransfers = allHistories.flat()
      .filter(r =>
        (r.from  && r.from.toLowerCase()          === account.toLowerCase()) ||
        (r.to    && r.to.toLowerCase()             === account.toLowerCase()) ||
        (r.transferredBy && r.transferredBy.toLowerCase() === account.toLowerCase())
      )
      .sort((a, b) => b.transferredAt.toNumber() - a.transferredAt.toNumber());

    if (myTransfers.length === 0) {
      container.innerHTML = `<div class="empty-state">No transfers found for your wallet (scanned last ${limit} equipment IDs).</div>`;
      return;
    }
    container.innerHTML = myTransfers.slice(0, 10).map(r => `
      <div class="transfer-item">
        <div style="display:flex;justify-content:space-between;align-items:center">
          <strong>Equipment #${r.equipmentId}</strong>
          <button class="btn btn-secondary btn-sm" onclick="quickDetail(${r.equipmentId})">View</button>
        </div>
        <div style="margin-top:4px">
          <span class="hash">${shortAddr(r.from)}</span> → <span class="hash">${shortAddr(r.to)}</span>
        </div>
        <div style="color:var(--text-muted);font-size:11px;margin-top:3px">${tsToDate(r.transferredAt.toNumber())} &nbsp;·&nbsp; By: ${shortAddr(r.transferredBy)}</div>
      </div>`).join('');
  } catch (err) {
    container.innerHTML = `<div class="empty-state">Error: ${escHtml(extractErrorMsg(err))}</div>`;
  } finally {
    if (btn) { btn.disabled = false; btn.textContent = 'Load'; }
  }
}

// ═══════════════════════════════════════════════════════════════════
// RECENT ACTIVITY
// ═══════════════════════════════════════════════════════════════════

async function loadRecentActivity() {
  const container = document.getElementById('activity-container');
  if (!provider) { toast('Connect wallet to load activity', 'warning'); return; }
  container.innerHTML = '<div class="loading-msg">Fetching recent on-chain events…</div>';

  try {
    const latestBlock = await provider.getBlockNumber();
    const fromBlock   = Math.max(0, latestBlock - 2000); // ~6 hours on Sepolia
    const activities  = [];

    const sources = [
      { c: registryContract,   name: 'EquipmentRegistry' },
      { c: inspectionContract, name: 'InspectionLog' },
      { c: transferContract,   name: 'OwnershipTransfer' }
    ].filter(x => x.c);

    for (const { c, name } of sources) {
      try {
        const logs = await c.queryFilter({}, fromBlock, latestBlock);
        logs.forEach(log => activities.push({
          blockNumber: log.blockNumber,
          event:       log.event || 'Event',
          contract:    name,
          txHash:      log.transactionHash
        }));
      } catch (_) { /* skip if filter unsupported */ }
    }

    activities.sort((a, b) => b.blockNumber - a.blockNumber);
    const recent = activities.slice(0, 15);

    if (recent.length === 0) {
      container.innerHTML = '<div class="empty-state">No events found in the last ~2 000 blocks on Sepolia.</div>';
      return;
    }

    const eventIcons = {
      EquipmentRegistered: '📋', InspectionLogged:   '🔍',
      TransferCompleted:   '🔄', CertificateIssued:  '🏆',
      ShopInspectionSigned:'✍️', EquipmentActivated: '✅',
      TransferInitiated:   '↗️', TransferCancelled:  '✖️'
    };

    container.innerHTML = recent.map(a => `
      <div class="activity-item">
        <div class="activity-icon">${eventIcons[a.event] || '⚡'}</div>
        <div>
          <div class="activity-title">${escHtml(a.event)}</div>
          <div class="activity-meta">
            ${escHtml(a.contract)} &nbsp;·&nbsp; Block #${a.blockNumber}
            &nbsp;·&nbsp;
            <a class="tx-link" href="https://sepolia.etherscan.io/tx/${encodeURIComponent(a.txHash)}" target="_blank" rel="noopener noreferrer">
              ${shortAddr(a.txHash)} ↗
            </a>
          </div>
        </div>
      </div>`).join('');
  } catch (err) {
    container.innerHTML = `<div class="empty-state">Error: ${escHtml(extractErrorMsg(err))}</div>`;
    toast('Failed to load activity: ' + extractErrorMsg(err), 'error');
  }
}

// ═══════════════════════════════════════════════════════════════════
// PRINT CERTIFICATE
// ═══════════════════════════════════════════════════════════════════

async function printCertificate() {
  if (!registryContract) { toast('Registry contract not configured', 'warning'); return; }
  const id = document.getElementById('cert-lookup-id').value.trim();
  if (!id) { toast('Load an equipment record first', 'warning'); return; }

  try {
    const equip = await registryContract.getEquipment(ethers.BigNumber.from(id));
    if (equip.status < 2) {
      toast('Equipment must be Certified or Active before printing', 'warning');
      return;
    }
    const fields = [
      ['Certificate Type',  'Certificate of Inspection (ABSA)'],
      ['Equipment ID',      '#' + equip.equipmentId.toString()],
      ['CRN',               equip.crn],
      ['A-Number',          equip.aNumber || '—'],
      ['MAWP',              equip.mawp.toString() + ' kPa'],
      ['Status',            statusLabel(equip.status)],
      ['Manufacturer',      equip.manufacturer],
      ['Certificate Issuer',equip.certificateIssuer],
      ['Issued On',         tsToDate(equip.certificateIssuedAt.toNumber())],
      ['Network',           'Ethereum Sepolia Testnet (Chain ID: 11155111)'],
      ['Printed At',        new Date().toLocaleString()]
    ];
    document.getElementById('print-cert-fields').innerHTML = fields.map(([label, value]) => `
      <div class="cert-field">
        <span class="cert-label">${escHtml(label)}</span>
        <span>${escHtml(String(value))}</span>
      </div>`).join('');
    document.getElementById('print-cert-footer').innerHTML =
      `Blockchain-verified &nbsp;·&nbsp; IronLedger &nbsp;·&nbsp; Registry: ${shortAddr(registryContract.address)}`;
    window.print();
  } catch (err) {
    toast('Could not load certificate data: ' + extractErrorMsg(err), 'error');
  }
}

// ═══════════════════════════════════════════════════════════════════
// THEME (DARK MODE)
// ═══════════════════════════════════════════════════════════════════

function getPreferredTheme() {
  const stored = localStorage.getItem('il_theme');
  if (stored === 'dark' || stored === 'light') return stored;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  const btn = document.getElementById('theme-toggle-btn');
  if (btn) btn.textContent = theme === 'dark' ? '☀️' : '🌙';
}

function toggleTheme() {
  const current = document.documentElement.getAttribute('data-theme') || 'light';
  const next = current === 'dark' ? 'light' : 'dark';
  localStorage.setItem('il_theme', next);
  applyTheme(next);
}

// Apply theme on load (before DOMContentLoaded to avoid flash)
applyTheme(getPreferredTheme());

// Listen for OS preference changes
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
  if (!localStorage.getItem('il_theme')) {
    applyTheme(e.matches ? 'dark' : 'light');
  }
});

// ═══════════════════════════════════════════════════════════════════
// NAV & INIT
// ═══════════════════════════════════════════════════════════════════

document.querySelectorAll('.nav-tab').forEach(tab => {
  tab.addEventListener('click', () => showPage(tab.dataset.page));
});

// Form persistence — auto-save inputs to sessionStorage
['reg-crn','reg-mdr-text','reg-mdr-hash','reg-mawp',
 'insp-equip-id','insp-notes-text','insp-notes-hash'].forEach(id => {
  const el = document.getElementById(id);
  if (el) el.addEventListener('input', () => sessionStorage.setItem(`il_form_${id}`, el.value));
});

// Escape key closes settings modal
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeSettings();
});

// MetaMask event listeners
if (window.ethereum) {
  window.ethereum.on('accountsChanged', accounts => {
    account = accounts[0] || null;
    if (account) {
      // Guard: provider may be null if the user never clicked Connect Wallet
      if (!provider) {
        provider = new ethers.providers.Web3Provider(window.ethereum);
      }
      signer = provider.getSigner();
      updateWalletUI();
      initContracts();
      detectRoles().then(() => {
        updateDashboardBanner();
        updateMyRolesDisplay();
        loadDashboard();
      });
    } else {
      disconnectWallet();
    }
  });

  window.ethereum.on('chainChanged', () => {
    window.location.reload();
  });
}

// Auto-init: seed deployed addresses into localStorage if not already set
// and silently reconnect wallet if MetaMask already has permission
window.addEventListener('load', async () => {
  if (!localStorage.getItem('il_registry'))   localStorage.setItem('il_registry',   DEPLOYED.registry);
  if (!localStorage.getItem('il_inspection')) localStorage.setItem('il_inspection', DEPLOYED.inspection);
  if (!localStorage.getItem('il_transfer'))   localStorage.setItem('il_transfer',   DEPLOYED.transfer);
  updateAddressPreviews();

  // Silently restore wallet connection — eth_accounts never triggers a popup
  if (window.ethereum) {
    try {
      document.getElementById('wallet-label').textContent = 'Connecting…';
      const accounts = await window.ethereum.request({ method: 'eth_accounts' });
      if (accounts && accounts.length > 0) {
        account = accounts[0];
        provider = new ethers.providers.Web3Provider(window.ethereum);
        signer = provider.getSigner();
        const network = await provider.getNetwork();
        networkId = network.chainId;
        updateWalletUI();
        initContracts();
        await detectRoles();
        updateDashboardBanner();
        loadDashboard();
      } else {
        document.getElementById('wallet-label').textContent = 'Connect Wallet';
      }
    } catch (err) {
      console.warn('Auto-reconnect failed:', err.message);
      document.getElementById('wallet-label').textContent = 'Connect Wallet';
    }
  }
});
