import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

/* ================= SUPABASE CONFIG ================= */
const SUPABASE_URL = "https://znngixswuvsumxycohcj.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpubmdpeHN3dXZzdW14eWNvaGNqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY5MzI2MjUsImV4cCI6MjA4MjUwODYyNX0.QR4ZI_grVqueuo_KucdvypzbpTDYx4stAHnep6Hx2i0";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

/* ================= DOM ELEMENTS ================= */
const loginForm = document.getElementById("adminLoginForm");
const adminPanel = document.getElementById("adminPanel");
const fileList = document.getElementById("fileList");
const logoutBtn = document.getElementById("logoutBtn");

/* ===== MODAL ELEMENTS ===== */
const previewModal = document.getElementById("previewModal");
const previewContainer = document.getElementById("previewContainer");
const filePreview = document.getElementById("filePreview");
const modalTitle = document.getElementById("modalTitle");
const confirmDownload = document.getElementById("confirmDownload");
const confirmDelete = document.getElementById("confirmDelete");
const cancelAction = document.getElementById("cancelAction");
const closeModal = document.getElementById("closeModal");

/* ================= GLOBAL STATE ================= */
let currentFile = null;
let currentFolder = null;

/* ================= STORAGE FOLDERS ================= */
const folders = ["booking_forms", "id_passport", "driving_license"];

/* ================= ADMIN LOGIN ================= */
loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;

    loginForm.reset();
    loginForm.style.display = "none";
    adminPanel.style.display = "block";

    sessionStorage.setItem(
      "admin_session",
      JSON.stringify({ session: data.session, time: Date.now() })
    );

    alert("Login successful");
    loadUploadedFiles();

    setTimeout(() => logoutAdmin("Session expired."), 10 * 60 * 1000);
  } catch (err) {
    alert("Login failed: " + err.message);
  }
});

/* ================= LOGOUT ================= */
function logoutAdmin(message = "Logged out") {
  sessionStorage.removeItem("admin_session");
  adminPanel.style.display = "none";
  loginForm.style.display = "block";
  alert(message);
}

logoutBtn.addEventListener("click", logoutAdmin);

/* ================= MODAL CONTROLS ================= */
closeModal.addEventListener("click", closePreview);
cancelAction.addEventListener("click", closePreview);

function closePreview() {
  previewModal.style.display = "none";
  previewContainer.innerHTML = "";
}

/* ================= LOAD FILES ================= */
async function loadUploadedFiles() {
  fileList.innerHTML = "";

  for (const folder of folders) {
    const { data: files, error } = await supabase.storage
      .from("documents")
      .list(`fleet/${folder}`);

    if (error || !files?.length) continue;

    const heading = document.createElement("h4");
    heading.textContent = folder.replace("_", " ").toUpperCase();
    fileList.appendChild(heading);

    const ul = document.createElement("ul");

    files.forEach((file) => {
      const li = document.createElement("li");
      li.textContent = file.name + " ";

      /* ===== PREVIEW BUTTON ===== */
      const previewBtn = document.createElement("button");
      previewBtn.textContent = "Preview";

      previewBtn.addEventListener("click", async () => {
        currentFile = file.name;
        currentFolder = folder;
        modalTitle.textContent = `Preview: ${file.name}`;

        const { data, error } = await supabase.storage
          .from("documents")
          .download(`fleet/${folder}/${file.name}`);

        if (error) return alert("Preview failed");

        const url = URL.createObjectURL(data);
        previewContainer.innerHTML = "";

        const ext = file.name.split(".").pop().toLowerCase();

        /* ===== IMAGE PREVIEW ===== */
        if (["jpg", "jpeg", "png", "gif", "webp"].includes(ext)) {
          const img = document.createElement("img");
          img.src = url;
          img.style.maxWidth = "100%";
          img.style.maxHeight = "100%";
          img.style.objectFit = "contain";
          previewContainer.appendChild(img);
        } else if (ext === "pdf") {
          /* ===== PDF PREVIEW ===== */
          const iframe = document.createElement("iframe");
          iframe.src = url;
          iframe.style.width = "100%";
          iframe.style.height = "100%";
          iframe.style.border = "none";
          previewContainer.appendChild(iframe);
        } else {
          /* ===== UNSUPPORTED ===== */
          previewContainer.innerHTML = "<p>No preview available.</p>";
        }

        previewModal.style.display = "flex";
      });

      li.appendChild(previewBtn);
      ul.appendChild(li);
    });

    fileList.appendChild(ul);
  }
}

/* ================= DOWNLOAD ================= */
confirmDownload.addEventListener("click", async () => {
  if (!currentFile || !currentFolder) return;

  const { data, error } = await supabase.storage
    .from("documents")
    .download(`fleet/${currentFolder}/${currentFile}`);

  if (error) return alert("Download failed");

  const url = URL.createObjectURL(data);
  const a = document.createElement("a");
  a.href = url;
  a.download = currentFile;
  a.click();
  URL.revokeObjectURL(url);

  closePreview();
});

/* ================= DELETE ================= */
confirmDelete.addEventListener("click", async () => {
  if (!currentFile || !currentFolder) return;

  const { error } = await supabase.storage
    .from("documents")
    .remove([`fleet/${currentFolder}/${currentFile}`]);

  if (error) return alert("Delete failed");

  alert("File deleted");
  closePreview();
  loadUploadedFiles();
});

/* ================= INITIAL STATE ================= */
loginForm.style.display = "block";
adminPanel.style.display = "none";
