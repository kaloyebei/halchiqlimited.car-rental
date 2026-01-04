import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

// --- Supabase config ---
const SUPABASE_URL = "https://znngixswuvsumxycohcj.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpubmdpeHN3dXZzdW14eWNvaGNqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY5MzI2MjUsImV4cCI6MjA4MjUwODYyNX0.QR4ZI_grVqueuo_KucdvypzbpTDYx4stAHnep6Hx2i0"; // Replace with your anon/public key
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// --- DOM elements ---
const loginForm = document.getElementById("adminLoginForm");
const adminPanel = document.getElementById("adminPanel");
const fileList = document.getElementById("fileList");
const logoutBtn = document.getElementById("logoutBtn"); // Add a button with id="logoutBtn" in HTML

// Subfolders under fleet
const folders = ["booking_forms", "id_passport", "driving_license"];

// --- Admin login ---
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

    // Clear form
    loginForm.reset();
    loginForm.style.display = "none";
    adminPanel.style.display = "block";

    // Store session temporarily in sessionStorage
    const sessionData = {
      session: data.session,
      timestamp: Date.now(),
    };
    sessionStorage.setItem("admin_session", JSON.stringify(sessionData));

    alert("Login successful!");
    await loadUploadedFiles();

    // Auto logout after 10 minutes
    setTimeout(() => {
      logoutAdmin("Session expired due to inactivity.");
    }, 10 * 60 * 1000);
  } catch (err) {
    alert("Login failed: " + err.message);
  }
});

// --- Logout function ---
function logoutAdmin(message = "Logged out successfully.") {
  sessionStorage.removeItem("admin_session");
  loginForm.style.display = "block";
  adminPanel.style.display = "none";
  alert(message);
}

// --- Logout button click ---
logoutBtn.addEventListener("click", () => {
  logoutAdmin();
});

// --- Load files from all folders ---
async function loadUploadedFiles() {
  fileList.innerHTML = "";

  for (const folder of folders) {
    const { data: files, error } = await supabase.storage
      .from("documents")
      .list(`fleet/${folder}`);

    if (error) {
      console.error(`Error fetching files in ${folder}:`, error.message);
      continue;
    }

    if (!files || files.length === 0) continue;

    const folderHeading = document.createElement("h4");
    folderHeading.textContent = folder.replace("_", " ").toUpperCase();
    fileList.appendChild(folderHeading);

    const ul = document.createElement("ul");

    files.forEach((file) => {
      const li = document.createElement("li");
      li.textContent = file.name + " ";

      // Download button
      const downloadBtn = document.createElement("button");
      downloadBtn.textContent = "Download";
      downloadBtn.addEventListener("click", async () => {
        const { data, error } = await supabase.storage
          .from("documents")
          .download(`fleet/${folder}/${file.name}`);
        if (error) return alert("Download failed: " + error.message);

        const url = URL.createObjectURL(data);
        const a = document.createElement("a");
        a.href = url;
        a.download = file.name;
        a.click();
        URL.revokeObjectURL(url);
      });

      // Delete button
      const deleteBtn = document.createElement("button");
      deleteBtn.textContent = "Delete";
      deleteBtn.addEventListener("click", async () => {
        const { error } = await supabase.storage
          .from("documents")
          .remove([`fleet/${folder}/${file.name}`]);
        if (error) return alert("Delete failed: " + error.message);

        alert("File deleted!");
        loadUploadedFiles(); // Refresh list
      });

      li.appendChild(downloadBtn);
      li.appendChild(deleteBtn);
      ul.appendChild(li);
    });

    fileList.appendChild(ul);
  }
}

// --- Always show login form first ---
// No auto-restoration: admin must log in each time
loginForm.style.display = "block";
adminPanel.style.display = "none";

