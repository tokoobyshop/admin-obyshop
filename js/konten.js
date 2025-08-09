document.addEventListener("DOMContentLoaded", async () => {
  const form = document.getElementById("kontenForm");
  if (!form) return;

  const base = "http://localhost:5000";
  const isAbsolute = (u) => /^https?:\/\//i.test(u);

  try {
    const res = await fetch(`${base}/api/content`);
    const data = await res.json();

    const setField = (name, value) => {
      if (!name) return;
      const el = form.elements[name];
      if (el) el.value = value ?? "";
    };

    // Hero
    setField("heroTitle", data.heroTitle || "");
    setField("heroSubtitle", data.heroSubtitle || "");
    setField("heroTitleColor", data.heroTitleColor || "#000000");
    setField("heroSubtitleColor", data.heroSubtitleColor || "#000000");
    setField("heroBackgroundImage", data.heroBackgroundImage || "");
    if (data.heroBackgroundImage) {
      const preview = document.getElementById("heroPreview");
      if (preview) {
        const imgPath = data.heroBackgroundImage.startsWith("/")
          ? `${base}${data.heroBackgroundImage}`
          : (isAbsolute(data.heroBackgroundImage) ? data.heroBackgroundImage : `${base}${data.heroBackgroundImage}`);
        preview.src = imgPath;
      }
    }

    // Kontak
    setField("contactPhone", data.contactInfo?.phone || "");
    setField("contactEmail", data.contactInfo?.email || "");
    setField("contactAddress", data.contactInfo?.address || "");

    // Sosial Media
    setField("instagramLink", data.socialMedia?.instagram || "");
    setField("facebookLink", data.socialMedia?.facebook || "");
    setField("tiktokLink", data.socialMedia?.tiktok || "");

    // WhatsApp
    setField("waContact", data.whatsapp?.contactButton || "");
    setField("waBubble", data.whatsapp?.bubbleButton || "");

    // Tema Warna
    setField("primaryColor", data.theme?.primaryColor || "#000000");
    setField("backgroundColor", data.theme?.backgroundColor || "#ffffff");
  } catch (err) {
    console.error("Gagal memuat konten:", err);
    alert("Gagal memuat data konten dari server.");
  }
});

// ================= Fungsi Upload Gambar =================
async function handleFileUpload(inputEl, urlInputEl, previewEl) {
  if (!inputEl) return;
  const file = inputEl.files?.[0];
  if (!file) return;

  const base = "http://localhost:5000";
  const formData = new FormData();
  const isHero = inputEl.name === "heroBackgroundUpload";

  formData.append("gambar", file);

  const endpoint = "/api/upload/hero";

  try {
    const res = await fetch(`${base}${endpoint}`, {
      method: "POST",
      body: formData,
    });
    const result = await res.json();

    if (isHero && result.imageUrl) {
      const serverUrl = result.imageUrl;
      if (urlInputEl) urlInputEl.value = serverUrl;
      const final = /^https?:\/\//i.test(serverUrl) ? serverUrl : (serverUrl.startsWith("/") ? `${base}${serverUrl}` : `${base}${serverUrl}`);
      if (previewEl) previewEl.src = final;
    }
  } catch (err) {
    console.error("Upload gagal:", err);
    alert("Gagal mengunggah file.");
  }
}

// Event upload hero
document.getElementById("heroBackgroundUpload")?.addEventListener("change", () => {
  handleFileUpload(
    document.getElementById("heroBackgroundUpload"),
    document.getElementById("heroBackgroundImage"),
    document.getElementById("heroPreview")
  );
});

// ================= Submit Form =================
document.getElementById("kontenForm")?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const form = e.target;
  const base = "http://localhost:5000";

  const body = {
    heroTitle: form.heroTitle?.value || "",
    heroSubtitle: form.heroSubtitle?.value || "",
    heroTitleColor: form.heroTitleColor?.value || "#000000",
    heroSubtitleColor: form.heroSubtitleColor?.value || "#000000",
    heroBackgroundImage: form.heroBackgroundImage?.value || "",

    aboutText: "", // opsional
    aboutVideos: [], // kosongkan karena video dihapus

    contactInfo: {
      phone: form.contactPhone?.value || "",
      email: form.contactEmail?.value || "",
      address: form.contactAddress?.value || "",
    },

    socialMedia: {
      instagram: form.instagramLink?.value || "",
      facebook: form.facebookLink?.value || "",
      tiktok: form.tiktokLink?.value || "",
    },

    whatsapp: {
      contactButton: form.waContact?.value || "",
      bubbleButton: form.waBubble?.value || "",
    },

    theme: {
      primaryColor: form.primaryColor?.value || "#000000",
      backgroundColor: form.backgroundColor?.value || "#ffffff",
    },
  };

  try {
    const token = localStorage.getItem("token") ?? "";
    const res = await fetch(`${base}/api/content`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });

    if (res.ok) {
      alert("✅ Konten berhasil disimpan!");
    } else {
      const txt = await res.text();
      console.error("Response error:", res.status, txt);
      alert("❌ Gagal menyimpan konten.");
    }
  } catch (err) {
    console.error("Gagal submit:", err);
    alert("Terjadi kesalahan saat menyimpan.");
  }
});
