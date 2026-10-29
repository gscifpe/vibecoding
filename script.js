const defaultProducts = [
  { id: 'brigadeiro', name: 'Brigadeiro Gourmet', category: 'doces', price: 4.50, description: 'Brigadeiro artesanal, coberto com granulado de chocolate.', image: 'https://images.unsplash.com/photo-1581798459219-318e76aecc7b?auto=format&fit=crop&w=650&q=80', badge: 'FEITO À MÃO' },
  { id: 'brownie', name: 'Brownie de Chocolate', category: 'doces', price: 9.00, description: 'Brownie macio por dentro, com chocolate intenso.', image: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=650&q=80', badge: 'MAIS PEDIDO' },
  { id: 'bolo-cenoura', name: 'Bolo de Cenoura', category: 'bolos', price: 8.00, description: 'Fatia fofinha com cobertura generosa de chocolate.', image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=650&q=80' },
  { id: 'cookie', name: 'Cookie de Chocolate', category: 'doces', price: 7.50, description: 'Cookie amanteigado com gotas de chocolate.', image: 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?auto=format&fit=crop&w=650&q=80' },
  { id: 'limonada', name: 'Limonada Fresquinha', category: 'bebidas', price: 7.00, description: 'Limão espremido na hora, gelo e um toque de hortelã.', image: 'assets/limonada-fresquinha.jpg' },
  { id: 'empada', name: 'Empada de Frango', category: 'salgados', price: 6.00, description: 'Massa leve e amanteigada com recheio cremoso de frango.', image: 'https://images.unsplash.com/photo-1608039829572-78524f79c4c7?auto=format&fit=crop&w=650&q=80' }
];
let customProducts = [];
try { customProducts = JSON.parse(localStorage.getItem('ifdoces-products') || '[]'); if (!Array.isArray(customProducts)) customProducts = []; } catch { customProducts = []; }
const products = [...defaultProducts, ...customProducts];
const money = value => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
const escapeHTML = value => String(value).replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]);
let cart = {};
try { const saved = JSON.parse(localStorage.getItem('ifdoces-cart') || '{}'); for (const product of products) { if (Number.isInteger(saved?.[product.id]) && saved[product.id] > 0) cart[product.id] = Math.min(saved[product.id], 99); } } catch { /* O cardápio funciona mesmo sem armazenamento. */ }
let category = 'todos';
const dialog = document.querySelector('#cart-dialog');
const result = document.querySelector('#order-result');
function renderProducts() {
  const query = document.querySelector('#search').value.trim().normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  const filtered = products.filter(p => (category === 'todos' || p.category === category) && `${p.name} ${p.description}`.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().includes(query));
  document.querySelector('#products').innerHTML = filtered.map(p => `<article class="product"><div class="product-image"><img src="${escapeHTML(p.image || 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=650&q=80')}" alt="${escapeHTML(p.name)}" loading="lazy">${p.badge ? `<span class="badge">${escapeHTML(p.badge)}</span>` : ''}</div><div class="product-body"><h3>${escapeHTML(p.name)}</h3><p>${escapeHTML(p.description)}</p><div class="product-bottom"><span class="price"><small>R$</small> ${p.price.toFixed(2).replace('.', ',')}</span><button class="add-button" data-add="${escapeHTML(p.id)}" aria-label="Adicionar ${escapeHTML(p.name)} ao pedido">+</button></div></div></article>`).join('');
  document.querySelector('#empty').hidden = filtered.length > 0;
}
function renderOwnerProducts() {
  const list = document.querySelector('#owner-products');
  list.innerHTML = customProducts.length ? customProducts.map(p => `<article class="owner-product"><div><strong>${escapeHTML(p.name)}</strong><span>${escapeHTML(p.category)} · ${money(p.price)}</span></div><button class="remove-product" data-remove="${escapeHTML(p.id)}" aria-label="Remover ${escapeHTML(p.name)}">Remover</button></article>`).join('') : '<p class="empty">Ainda não há produtos personalizados.</p>';
}
function renderCart() {
  const selected = products.filter(p => cart[p.id]);
  document.querySelector('#cart-count').textContent = Object.values(cart).reduce((a, b) => a + b, 0);
  document.querySelector('#cart-items').innerHTML = selected.length ? selected.map(p => `<div class="cart-row"><div class="cart-row-info"><strong>${p.name}</strong><span>${money(p.price * cart[p.id])}</span></div><div class="quantity"><button data-change="${p.id}" data-step="-1" aria-label="Remover uma unidade de ${p.name}">−</button><span>${cart[p.id]}</span><button data-change="${p.id}" data-step="1" aria-label="Adicionar uma unidade de ${p.name}" ${cart[p.id] >= 99 ? 'disabled' : ''}>+</button></div></div>`).join('') : '<p class="empty">Seu pedido está esperando um favorito.<br>Que tal escolher um docinho?</p>';
  document.querySelector('#cart-total').textContent = money(selected.reduce((total, p) => total + p.price * cart[p.id], 0));
  document.querySelector('#checkout').disabled = selected.length === 0;
  result.hidden = true;
  try { localStorage.setItem('ifdoces-cart', JSON.stringify(cart)); } catch { /* Armazenamento opcional. */ }
}
let toastTimer;
function toast(message) { const el = document.querySelector('#toast'); el.textContent = message; el.classList.add('visible'); clearTimeout(toastTimer); toastTimer = setTimeout(() => el.classList.remove('visible'), 2600); }
document.querySelectorAll('.category').forEach(button => button.addEventListener('click', () => { category = button.dataset.category; document.querySelectorAll('.category').forEach(item => { item.classList.toggle('active', item === button); item.setAttribute('aria-pressed', String(item === button)); }); renderProducts(); }));
document.querySelector('#search').addEventListener('input', renderProducts);
document.querySelectorAll('.mode-link').forEach(button => button.addEventListener('click', () => {
  const buyer = button.dataset.view === 'buyer-view';
  document.querySelector('#buyer-view').hidden = !buyer;
  document.querySelector('#owner-view').hidden = buyer;
  document.querySelectorAll('.mode-link').forEach(item => item.classList.toggle('active', item === button));
  window.scrollTo({ top: 0, behavior: 'smooth' });
}));
document.querySelector('#product-form').addEventListener('submit', async event => {
  event.preventDefault();
  const formElement = event.currentTarget;
  const form = new FormData(formElement);
  const imageFile = form.get('image');
  if (!(imageFile instanceof File) || !imageFile.size || !imageFile.type.startsWith('image/')) { toast('Escolha um arquivo de imagem.'); return; }
  if (imageFile.size > 1024 * 1024) { toast('A imagem precisa ter até 1 MB.'); return; }
  let imageData;
  try { imageData = await new Promise((resolve, reject) => { const reader = new FileReader(); reader.onload = () => resolve(reader.result); reader.onerror = () => reject(reader.error); reader.readAsDataURL(imageFile); }); }
  catch { toast('Não foi possível ler a imagem. Tente outro arquivo.'); return; }
  const product = { id: `ifd-${Date.now()}`, name: String(form.get('name')).trim(), category: String(form.get('category')), price: Number(form.get('price')), image: imageData, description: String(form.get('description')).trim() };
  if (!product.name || !product.description || !Number.isFinite(product.price) || product.price <= 0) return;
  customProducts.push(product);
  try { localStorage.setItem('ifdoces-products', JSON.stringify(customProducts)); } catch { customProducts.pop(); toast('Não foi possível salvar. Verifique o armazenamento do navegador.'); return; }
  products.push(product);
  formElement.reset();
  renderOwnerProducts(); renderProducts();
  toast('Produto adicionado ao cardápio!');
});
document.querySelector('#owner-products').addEventListener('click', event => {
  const button = event.target.closest('[data-remove]'); if (!button) return;
  const id = button.dataset.remove;
  customProducts = customProducts.filter(p => p.id !== id);
  const index = products.findIndex(p => p.id === id); if (index >= 0) products.splice(index, 1);
  delete cart[id];
  try { localStorage.setItem('ifdoces-products', JSON.stringify(customProducts)); } catch { /* A lista atual segue disponível nesta sessão. */ }
  renderOwnerProducts(); renderProducts(); renderCart();
});
document.querySelector('#products').addEventListener('click', event => { const button = event.target.closest('[data-add]'); if (!button) return; const id = button.dataset.add; if ((cart[id] || 0) >= 99) return toast('Limite de 99 unidades por item.'); cart[id] = (cart[id] || 0) + 1; renderCart(); toast(`${products.find(p => p.id === id).name} adicionado ao pedido`); });
document.querySelector('#cart-items').addEventListener('click', event => { const button = event.target.closest('[data-change]'); if (!button) return; const id = button.dataset.change; cart[id] = Math.min(99, cart[id] + Number(button.dataset.step)); if (cart[id] <= 0) delete cart[id]; renderCart(); const replacement = document.querySelector(`[data-change="${id}"][data-step="${button.dataset.step}"]`); (replacement || document.querySelector('#close-cart')).focus(); });
document.querySelector('#open-cart').addEventListener('click', () => dialog.showModal());
document.querySelector('#close-cart').addEventListener('click', () => dialog.close());
dialog.addEventListener('click', event => { if (event.target === dialog) { const bounds = dialog.getBoundingClientRect(); if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) dialog.close(); } });
document.querySelector('#checkout').addEventListener('click', () => {
  const selected = products.filter(p => cart[p.id]); if (!selected.length) return;
  const summary = `Olá! Gostaria de fazer um pedido na IFDoces.\n\n${selected.map(p => `${cart[p.id]}x ${p.name} — ${money(p.price * cart[p.id])}`).join('\n')}\n\nTotal dos itens: ${money(selected.reduce((sum, p) => sum + p.price * cart[p.id], 0))}\n\nEntrega e pagamento a combinar.`;
  document.querySelector('#order-summary').value = summary; result.hidden = false;
  const phone = (typeof WHATSAPP_NUMBER === 'string' ? WHATSAPP_NUMBER : '').replace(/\D/g, '');
  const link = document.querySelector('#whatsapp-link'); const status = document.querySelector('#whatsapp-status');
  if (!/^[1-9]\d{9,14}$/.test(phone)) { link.hidden = true; link.removeAttribute('href'); status.textContent = 'O WhatsApp do estabelecimento ainda não foi configurado. Você pode copiar o resumo abaixo.'; return; }
  const url = `https://wa.me/${phone}?text=${encodeURIComponent(summary)}`; link.href = url; link.hidden = false;
  status.textContent = 'Confira a mensagem no WhatsApp e toque em Enviar para concluir.';
  window.open(url, '_blank', 'noopener,noreferrer');
});
document.querySelector('#copy-order').addEventListener('click', async () => { const field = document.querySelector('#order-summary'); try { await navigator.clipboard.writeText(field.value); toast('Pedido copiado!'); } catch { field.focus(); field.select(); toast('Selecione e copie o resumo com Ctrl+C ou pelo menu do celular.'); } });
document.querySelector('#year').textContent = new Date().getFullYear();
renderProducts(); renderCart(); renderOwnerProducts();
