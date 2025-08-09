const API = "http://localhost:5000/api/products";
const token = localStorage.getItem("token");

if (!token) location.href = "login.html";

const headers = {
  "Content-Type": "application/json",
  Authorization: `Bearer ${token}`
};

const tableBody = document.querySelector("#productTable tbody");
const form = document.getElementById("productForm");
const searchInput = document.getElementById("searchInput"); // Tambahkan input pencarian

async function loadProducts(query = "") {
  const url = query ? `${API}?q=${encodeURIComponent(query)}` : API;
  const res = await fetch(url);
  const result = await res.json();

  tableBody.innerHTML = "";

  // Pastikan sesuai format response baru
  const products = Array.isArray(result) ? result : result.data || [];

  if (products.length === 0) {
    tableBody.innerHTML = `<tr><td colspan="7">Tidak ada produk ditemukan.</td></tr>`;
    return;
  }

  products.forEach((p) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${p.nama}</td>
      <td>${p.harga}</td>
      <td><img src="http://localhost:5000/uploads/products/${p.imageFilename}" width="60" /></td>
      <td>${p.deskripsi || "-"}</td>
      <td>${p.produkBaru ? "✅" : "❌"}</td>
      <td>${p.produkUtama ? "✅" : "❌"}</td>
      <td>
        <button onclick="editProduct('${p._id}')">Edit</button>
        <button onclick="deleteProduct('${p._id}')">Hapus</button>
      </td>
    `;
    tableBody.appendChild(row);
  });
}

async function editProduct(id) {
  const res = await fetch(`${API}/${id}`);
  const p = await res.json();

  document.getElementById("productId").value = p._id;
  document.getElementById("nama").value = p.nama;
  document.getElementById("harga").value = p.harga;
  document.getElementById("gambar").value = p.gambar;
  document.getElementById("deskripsi").value = p.deskripsi || "";
  document.getElementById("produkUtama").checked = p.produkUtama || false;
  document.getElementById("produkBaru").checked = p.produkBaru || false;
}

async function deleteProduct(id) {
  if (confirm("Yakin hapus produk ini?")) {
    await fetch(`${API}/${id}`, {
      method: "DELETE",
      headers
    });
    loadProducts(searchInput.value); // Refresh berdasarkan hasil pencarian aktif
  }
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const data = {
    nama: form.nama.value,
    harga: form.harga.value,
    gambar: form.gambar.value,
    deskripsi: form.deskripsi.value,
    produkUtama: document.getElementById("produkUtama").checked,
    produkBaru: document.getElementById("produkBaru").checked
  };

  const id = form.productId.value;
  const method = id ? "PUT" : "POST";
  const url = id ? `${API}/${id}` : API;

  await fetch(url, {
    method,
    headers,
    body: JSON.stringify(data)
  });

  form.reset();
  loadProducts(searchInput.value);
});

// Fitur pencarian
if (searchInput) {
  searchInput.addEventListener("input", () => {
    loadProducts(searchInput.value);
  });
}

// Inisialisasi
loadProducts();
