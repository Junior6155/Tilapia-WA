// Basic SPA + API client
const API = (path, options={}) => {
  const base = localStorage.getItem("api_base") || "http://localhost:4000";
  const token = localStorage.getItem("token");
  options.headers = Object.assign({}, options.headers || {}, {"Content-Type":"application/json"});
  if (token) options.headers.Authorization = "Bearer " + token;
  return fetch(base + path, options).then(async r => {
    const data = await r.json().catch(()=>({}));
    if (!r.ok) throw new Error(data.error || "Request failed");
    return data;
  });
};

const $ = sel => document.querySelector(sel);
const $$ = sel => document.querySelectorAll(sel);
const toast = (msg, type="ok") => {
  const t = $("#toast"); t.textContent = msg; t.className = "alert " + type; t.classList.remove("hidden");
  setTimeout(()=> t.classList.add("hidden"), 2500);
};

function showTab(id, e) {
  $$("main section").forEach(s => s.classList.add("hidden"));
  $(`#${id}`).classList.remove("hidden");
  $$("nav button").forEach(b => b.classList.remove("active"));
  if (e) e.target.classList.add("active");
}

async function login() {
  const email = $("#loginEmail").value.trim();
  const password = $("#loginPassword").value.trim();
  try {
    const res = await API("/auth/login", { method: "POST", body: JSON.stringify({ email, password }) });
    localStorage.setItem("token", res.token);
    $("#loginCard").classList.add("hidden");
    $("#app").classList.remove("hidden");
    $("#userBadge").textContent = res.user.name + " (" + res.user.role + ")";
    init();
  } catch (e) { toast(e.message, "err"); }
}

function setToday(sel) {
  const d = new Date().toISOString().split("T")[0];
  $(`#${sel}`).value = d;
}
function initDates() {
  ["s_date","p_date","i_date","e_date","r_end"].forEach(setToday);
  const d = new Date(); d.setDate(d.getDate()-30); $("#r_start").value = d.toISOString().split("T")[0];
}

async function init() {
  initDates();
  await loadCustomers();
  await loadInventory();
  await loadPayments();
  await loadSales();
  await loadExpenses();
  await loadSettings();
  await loadSummary();
}

async function loadCustomers() {
  const list = await API("/customers");
  const tbody = $("#customersTable");
  const opts = list.map(c => `<option value="${c.id}">${c.name}</option>`).join("");
  $("#s_customer").innerHTML = opts; $("#p_customer").innerHTML = opts;
  tbody.innerHTML = list.map(c => `<tr><td>${c.name}</td><td>${c.phone}</td><td>₵${(c.currentDebt||0).toFixed(2)}</td><td></td></tr>`).join("");
}

async function addCustomer() {
  const payload = {
    name: $("#c_name").value, phone: $("#c_phone").value,
    location: $("#c_location").value, email: $("#c_email").value,
    type: $("#c_type").value, creditLimit: Number($("#c_limit").value||1000)
  };
  try {
    await API("/customers", { method: "POST", body: JSON.stringify(payload) });
    toast("Customer added");
    await loadCustomers();
  } catch (e) { toast(e.message, "err"); }
}

async function loadInventory() {
  const items = await API("/inventory");
  $("#inventoryTable").innerHTML = items.map(i => `<tr><td>${i.fishSize}</td><td>${i.stockKg.toFixed(1)}</td><td>₵${i.costPriceKg.toFixed(2)}</td><td>${new Date(i.lastUpdated).toLocaleString()}</td></tr>`).join("");
}

async function addStock() {
  const payload = {
    date: $("#i_date").value, fishSize: $("#i_size").value, quantityKg: Number($("#i_qty").value),
    costPriceKg: Number($("#i_cost").value||0), supplier: $("#i_supplier").value
  };
  try {
    await API("/inventory/add", { method: "POST", body: JSON.stringify(payload) });
    toast("Stock added");
    await loadInventory();
  } catch (e) { toast(e.message, "err"); }
}

async function loadSales() {
  const list = await API("/sales");
  $("#salesTable").innerHTML = list.map(s => `<tr><td>${new Date(s.date).toLocaleDateString()}</td><td>${s.customer.name}</td><td>${s.fishSize}</td><td>${s.quantityKg.toFixed(1)}</td><td>₵${s.totalAmount.toFixed(2)}</td><td>${s.type}</td></tr>`).join("");
}

async function recordSale() {
  const payload = {
    date: $("#s_date").value, customerId: Number($("#s_customer").value),
    fishSize: $("#s_size").value, quantityKg: Number($("#s_qty").value),
    unitPrice: Number($("#s_unit").value), totalAmount: Number($("#s_total").value),
    type: $("#s_type").value, notes: $("#s_notes").value
  };
  try {
    await API("/sales", { method: "POST", body: JSON.stringify(payload) });
    toast("Sale recorded");
    await loadSales(); await loadInventory(); await loadSummary(); await loadCustomers();
  } catch (e) { toast(e.message, "err"); }
}

async function loadPayments() {
  const list = await API("/payments");
  $("#paymentsTable").innerHTML = list.map(p => `<tr><td>${new Date(p.date).toLocaleDateString()}</td><td>${p.customer.name}</td><td>₵${p.amount.toFixed(2)}</td><td>${p.method}</td></tr>`).join("");
}

async function recordPayment() {
  const payload = {
    date: $("#p_date").value, customerId: Number($("#p_customer").value),
    amount: Number($("#p_amount").value), method: $("#p_method").value, reference: $("#p_ref").value
  };
  try {
    await API("/payments", { method: "POST", body: JSON.stringify(payload) });
    toast("Payment recorded");
    await loadPayments(); await loadSummary(); await loadCustomers();
  } catch (e) { toast(e.message, "err"); }
}

async function loadExpenses() {
  const list = await API("/expenses");
  $("#expensesTable").innerHTML = list.map(e => `<tr><td>${new Date(e.date).toLocaleDateString()}</td><td>${e.category}</td><td>${e.description}</td><td>₵${e.amount.toFixed(2)}</td></tr>`).join("");
}

async function addExpense() {
  const payload = {
    date: $("#e_date").value, category: $("#e_cat").value, description: $("#e_desc").value,
    amount: Number($("#e_amount").value), method: $("#e_method").value
  };
  try {
    await API("/expenses", { method: "POST", body: JSON.stringify(payload) });
    toast("Expense recorded");
    await loadExpenses(); await loadSummary();
  } catch (e) { toast(e.message, "err"); }
}

async function loadSettings() {
  const data = await API("/settings");
  const s = data.settings;
  $("#s_name").value = s.businessName; $("#s_phone").value = s.businessPhone; $("#s_email").value = s.businessEmail;
  $("#s_limit").value = s.maxCreditLimit; $("#s_low").value = s.lowStockAlertKg;
  $("#s_thresh").value = s.bulkDiscountThreshold; $("#s_rate").value = s.bulkDiscountRate;
  const priceBody = data.prices.map(p => `<tr><td>${p.fishSize}</td><td><input id="price_${p.fishSize}" type="number" step="0.01" value="${p.priceKg}"></td></tr>`).join("");
  $("#priceTable").innerHTML = priceBody;
}

async function saveSettings() {
  const payload = { settings: {
    businessName: $("#s_name").value, businessPhone: $("#s_phone").value, businessEmail: $("#s_email").value,
    maxCreditLimit: Number($("#s_limit").value), lowStockAlertKg: Number($("#s_low").value),
    bulkDiscountThreshold: Number($("#s_thresh").value), bulkDiscountRate: Number($("#s_rate").value)
  }};
  try { await API("/settings", { method: "POST", body: JSON.stringify(payload) }); toast("Settings saved"); } catch(e){ toast(e.message,"err"); }
}

async function savePrices() {
  const sizes = ["TSS","SB","Eco","Reg","S1","S2","S3"];
  const updates = sizes.map(s => ({ fishSize: s, priceKg: Number(document.getElementById(`price_${s}`).value) }));
  try { await API("/settings/prices", { method: "POST", body: JSON.stringify({ prices: updates }) }); toast("Prices updated"); } catch(e){ toast(e.message,"err"); }
}

let chrt;
async function loadSummary() {
  const start = $("#r_start").value; const end = $("#r_end").value;
  const s = await API(`/reports/summary?start=${start}&end=${end}`);
  $("#reportBox").textContent = JSON.stringify(s, null, 2);
  $("#todaySales").textContent = "₵" + s.totalSales.toFixed(2);
  $("#todayPayments").textContent = "₵" + s.totalPayments.toFixed(2);
  $("#pendingDebt").textContent = "—"; // could compute from customers
  // Simple chart: Sales vs Expenses
  const ctx = document.getElementById("chartSalesExpenses").getContext("2d");
  if (chrt) chrt.destroy();
  chrt = new Chart(ctx, {
    type: "bar",
    data: { labels: ["Sales", "Expenses", "Profit"], datasets: [{ data: [s.totalSales, s.totalExpenses, s.profit] }] },
    options: { responsive: true, plugins: { legend: { display: false } } }
  });
}


// Auto-detect API base:
// - Local dev: http://localhost:4000
// - Netlify/Prod: use "/api" which Netlify proxies to Render backend (see netlify.toml)
(function(){
  const isLocal = /localhost|127\.0\.0\.1/.test(window.location.hostname);
  if (isLocal) {
    localStorage.setItem("api_base", "http://localhost:4000");
  } else {
    // Use relative proxy path in production
    localStorage.setItem("api_base", "/api");
  }
})();
