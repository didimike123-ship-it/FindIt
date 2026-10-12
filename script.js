/* =========================================
   LOST AND FOUND MANAGEMENT SYSTEM - SCRIPT
========================================= */

const ICONS = {
    Phone: "📱",
    Wallet: "👜",
    Keys: "🔑",
    "ID Card": "🪪",
    Books: "📚",
    Electronics: "💻",
    Others: "📦"
};

/* =========================================
   GLOBAL DATA
========================================= */

let items = JSON.parse(
    localStorage.getItem("findit2") || "[]"
);

let curType = "lost";
let dashboardFilter = "all";

/* =========================================
   STORAGE & SESSION MANAGEMENT
========================================= */

function save() {
    localStorage.setItem("findit2", JSON.stringify(items));
}

function getUsers() {
    return JSON.parse(localStorage.getItem("findit2_users") || "[]");
}

function saveUsers(users) {
    localStorage.setItem("findit2_users", JSON.stringify(users));
}

function getSession() {
    return JSON.parse(localStorage.getItem("findit2_session") || "null");
}

function setSession(session) {
    localStorage.setItem("findit2_session", JSON.stringify(session));
}

function ensureGuestSession() {
    let session = getSession();
    if (!session) {
        session = { id: "guest", name: "Guest User", contact: "", role: "guest" };
        setSession(session);
    }
    return session;
}

/* =========================================
   HELPERS
========================================= */

function esc(value) {
    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");
}

function initials(name) {
    const words = String(name || "User").trim().split(/\s+/);
    if (words.length > 1) {
        return (words[0][0] + words[words.length - 1][0]).toUpperCase();
    }
    return words[0].slice(0, 2).toUpperCase();
}

function toast(message) {
    const box = document.getElementById("toast");
    if (!box) {
        alert(message);
        return;
    }
    box.textContent = message;
    box.classList.add("show");
    setTimeout(() => {
        box.classList.remove("show");
    }, 2200);
}

function focusNext(event, nextId) {
    if (event.key === "Enter") {
        event.preventDefault();
        const nextEl = document.getElementById(nextId);
        nextEl?.focus();
    }
}

function submitOnEnter(event, callback) {
    if (event.key === "Enter") {
        event.preventDefault();
        if (typeof callback === "function") {
            callback();
        }
    }
}

function togglePw(inputId, btn) {
    const input = document.getElementById(inputId);
    if (!input) return;
    if (input.type === "password") {
        input.type = "text";
        btn.textContent = "🙈";
    } else {
        input.type = "password";
        btn.textContent = "👁️";
    }
}

/* =========================================
   PROFILE & TOP BAR (GUEST -> LOGIN BUTTON)
========================================= */

function initProfile() {
    const session = ensureGuestSession();
    const profileWrap = document.getElementById("profile-wrap-container");
    if (!profileWrap) return;

    // အကယ်၍ Guest ဖြစ်နေပါက Login ခလုတ်ကိုသာ ပြသမည်
    if (session.role === "guest") {
        profileWrap.innerHTML = `
            <button type="button" class="topbar-login-btn" onclick="location.href='login.html'">
                <span>🔑</span> Login
            </button>
        `;
    } else {
        // Login ဝင်ထားပါက User Profile dropdown ကို ပုံမှန်အတိုင်း ပြသမည်
        profileWrap.innerHTML = `
            <button type="button" class="profile-btn" onclick="toggleProfileMenu()">
                <div class="avatar" id="top-avatar">${initials(session.name)}</div>
                <div class="user-info">
                    <small>Welcome,</small>
                    <strong id="top-name">${esc(session.name)}</strong>
                </div>
                <span class="user-arrow">⌄</span>
            </button>
            <div class="profile-menu" id="profile-menu">
                <button type="button" onclick="addAccount()"><span>＋</span> Add Account</button>
                <div class="profile-divider"></div>
                <button type="button" class="logout-menu" onclick="logout()"><span>↪</span> Sign Out</button>
            </div>
        `;
    }
}

function toggleProfileMenu() {
    const menu = document.getElementById("profile-menu");
    const button = document.querySelector(".profile-btn");
    if (!menu) return;
    const opened = menu.classList.toggle("show");
    button?.classList.toggle("open", opened);
}

function addAccount() {
    localStorage.removeItem("findit2_session");
    location.href = "login.html?add=1";
}

function logout() {
    localStorage.removeItem("findit2_session");
    ensureGuestSession();
    location.href = "index.html";
}

document.addEventListener("click", event => {
    const wrap = document.querySelector(".profile-wrap");
    const menu = document.getElementById("profile-menu");
    const button = document.querySelector(".profile-btn");
    if (wrap && menu && !wrap.contains(event.target)) {
        menu.classList.remove("show");
        button?.classList.remove("open");
    }
});

/* =========================================
   AUTHENTICATION LOGIC
========================================= */

function doLogin() {
    const contact = document.getElementById("li-contact")?.value.trim();
    const password = document.getElementById("li-pw")?.value;

    if (!contact || !password) {
        toast("Please enter your login information.");
        return;
    }

    const user = getUsers().find(
        u => String(u.contact).toLowerCase() === contact.toLowerCase() && u.password === password
    );

    if (!user) {
        toast("Invalid phone/email or password.");
        return;
    }

    setSession({ id: user.id, name: user.name, contact: user.contact, role: "user" });
    location.href = "index.html";
}

function doSignup() {
    const name = document.getElementById("su-name")?.value.trim();
    const contact = document.getElementById("su-contact")?.value.trim();
    const password = document.getElementById("su-pw")?.value;
    const confirm = document.getElementById("su-pw2")?.value;

    if (!name || !contact || !password) {
        toast("Please fill all required fields.");
        return;
    }
    if (password.length < 6) {
        toast("Password must be at least 6 characters.");
        return;
    }
    if (password !== confirm) {
        toast("Passwords do not match.");
        return;
    }

    const users = getUsers();
    if (users.some(u => String(u.contact).toLowerCase() === contact.toLowerCase())) {
        toast("This account already exists.");
        return;
    }

    const user = { id: "u_" + Date.now(), name, contact, password };
    users.push(user);
    saveUsers(users);

    setSession({ id: user.id, name: user.name, contact: user.contact, role: "user" });
    location.href = "index.html";
}

function doForgotPassword() {
    const contact = document.getElementById("fp-contact")?.value.trim();
    const password = document.getElementById("fp-pw")?.value;
    const confirm = document.getElementById("fp-pw2")?.value;

    if (!contact || !password || !confirm) {
        toast("Please fill all fields.");
        return;
    }
    if (password.length < 6) {
        toast("Password must be at least 6 characters.");
        return;
    }
    if (password !== confirm) {
        toast("Passwords do not match.");
        return;
    }

    const users = getUsers();
    const index = users.findIndex(u => String(u.contact).toLowerCase() === contact.toLowerCase());

    if (index === -1) {
        toast("Account not found.");
        return;
    }

    users[index].password = password;
    saveUsers(users);
    toast("Password reset successfully.");
    setTimeout(() => {
        if (typeof setAuthTab === "function") setAuthTab("login");
    }, 800);
}

function setAuthTab(tab) {
    const login = document.getElementById("login-fields");
    const signup = document.getElementById("signup-fields");
    const forgot = document.getElementById("forgot-fields");
    const tabLogin = document.getElementById("tab-login");
    const tabSignup = document.getElementById("tab-signup");

    if (login) login.style.display = "none";
    if (signup) signup.style.display = "none";
    if (forgot) forgot.style.display = "none";

    tabLogin?.classList.remove("active");
    tabSignup?.classList.remove("active");

    if (tab === "login") {
        if (login) login.style.display = "block";
        tabLogin?.classList.add("active");
    } else if (tab === "signup") {
        if (signup) signup.style.display = "block";
        tabSignup?.classList.add("active");
    } else if (tab === "forgot") {
        if (forgot) forgot.style.display = "block";
    }
}

function guestMode() {
    setSession({ id: "guest", name: "Guest User", contact: "", role: "guest" });
    location.href = "index.html";
}

/* =========================================
   REPORT TYPE & PHOTO PREVIEWS
========================================= */

function setType(type) {
    curType = type;
    const lostTab = document.getElementById("lost-tab");
    const foundTab = document.getElementById("found-tab");
    lostTab?.classList.toggle("active", type === "lost");
    foundTab?.classList.toggle("active", type === "found");
    
    const lblDate = document.getElementById("label-date");
    const lblLoc = document.getElementById("label-location");
    
    if (lblDate) {
        lblDate.textContent = type === "lost" ? "Lost Date" : "Found Date";
    }
    if (lblLoc) {
        lblLoc.textContent = type === "lost" ? "Lost Location" : "Found Location";
    }
}

function previewPhoto(input) {
    const preview = document.getElementById("photo-preview");
    const prompt = document.getElementById("upload-prompt");

    if (!preview || !prompt) return;
    if (!input?.files?.[0]) return;

    const file = input.files[0];

    if (file.size > 5 * 1024 * 1024) {
        toast("Photo must be smaller than 5MB.");
        input.value = "";
        return;
    }

    const reader = new FileReader();
    reader.onload = event => {
        prompt.style.display = "none";
        preview.style.display = "block";
        preview.innerHTML = `
            <div class="photo-preview-inside-wrapper">
                <img src="${event.target.result}" alt="Selected photo">
                <button type="button" class="remove-photo-btn" onclick="removePhoto(event)">×</button>
            </div>
        `;
    };
    reader.readAsDataURL(file);
}

function removePhoto(event) {
    if (event) {
        event.preventDefault();
        event.stopPropagation();
    }
    const input = document.getElementById("item-photo");
    const preview = document.getElementById("photo-preview");
    const prompt = document.getElementById("upload-prompt");

    if (input) input.value = "";
    if (preview) {
        preview.innerHTML = "";
        preview.style.display = "none";
    }
    if (prompt) prompt.style.display = "flex";
}

function updateDescriptionCount() {
    const input = document.getElementById("item-description");
    const count = document.getElementById("description-count");
    if (input && count) {
        count.textContent = input.value.length + "/500";
    }
}

/* =========================================
   SUBMIT REPORT
========================================= */

function submitItem() {
    const session = getSession();

    if (!session || session.role === "guest") {
        toast("Please Sign In or Sign Up to submit a report.");
        return;
    }

    const title = document.getElementById("item-title")?.value.trim();
    const category = document.getElementById("item-category")?.value;
    const date = document.getElementById("item-date")?.value;
    const locationValue = document.getElementById("item-location")?.value.trim();
    const contactInfo = document.getElementById("item-contact")?.value.trim();
    const description = document.getElementById("item-description")?.value.trim();
    const photoInput = document.getElementById("item-photo");

    if (!title || !category || !date || !locationValue || !contactInfo || !description) {
        toast("Please fill all required fields.");
        return;
    }

    function saveReport(photoData = "") {
        items.unshift({
            id: "item_" + Date.now(),
            type: curType,
            title: title,
            category: category,
            date: date,
            location: locationValue,
            contactInfo: contactInfo,
            description: description,
            photo: photoData,
            ownerId: session.id,
            ownerName: session.name,
            recovered: false
        });
        save();
        toast("Report submitted successfully.");
        setTimeout(() => {
            location.href = "index.html";
        }, 500);
    }

    if (photoInput?.files?.[0]) {
        const reader = new FileReader();
        reader.onload = event => {
            saveReport(event.target.result);
        };
        reader.readAsDataURL(photoInput.files[0]);
    } else {
        saveReport();
    }
}

/* =========================================
   ACCOUNT PAGE
========================================= */

function initAccount() {
    const session = ensureGuestSession();
    const name = document.getElementById("account-name");
    const contact = document.getElementById("account-contact");
    const history = document.getElementById("account-history");

    if (session.role === "guest") {
        if (name) name.textContent = "Guest User";
        if (contact) contact.textContent = "Browsing in guest mode";

        const lost = document.getElementById("my-lost");
        const found = document.getElementById("my-found");
        const recovered = document.getElementById("my-recovered");

        if (lost) lost.textContent = "0";
        if (found) found.textContent = "0";
        if (recovered) recovered.textContent = "0";

        if (history) {
            history.innerHTML = `
                <div class="empty">
                    <h3>Account Required</h3>
                    <p>Please log in or sign up to view and manage your reports.</p>
                    <div style="display: flex; gap: 10px; justify-content: center; margin-top: 15px;">
                        <button type="button" class="btn-warn-primary" onclick="location.href='login.html'">Sign In</button>
                        <button type="button" class="btn-warn-secondary" onclick="location.href='login.html?add=1'">Sign Up</button>
                    </div>
                </div>
            `;
        }
        return;
    }

    if (name) name.textContent = session.name;
    if (contact) contact.textContent = session.contact;

    const mine = items.filter(x => x.ownerId === session.id);
    const lost = mine.filter(x => x.type === "lost" && x.recovered !== true).length;
    const found = mine.filter(x => x.type === "found" && x.recovered !== true).length;
    const recovered = mine.filter(x => x.recovered === true).length;

    const lostCount = document.getElementById("my-lost");
    const foundCount = document.getElementById("my-found");
    const recoveredCount = document.getElementById("my-recovered");

    if (lostCount) lostCount.textContent = lost;
    if (foundCount) foundCount.textContent = found;
    if (recoveredCount) recoveredCount.textContent = recovered;

    if (!history) return;
    history.innerHTML = "";

    if (!mine.length) {
        history.innerHTML = `
            <div class="empty">
                <h3>No Reports Yet</h3>
                <p>Your reports will appear here.</p>
            </div>
        `;
        return;
    }
    mine.forEach(item => {
        history.innerHTML += createCard(item);
    });
}

/* =========================================
   REPORT CARD & DASHBOARD
========================================= */

function createCard(item) {
    let statusText;
    let statusClass;

    if (item.recovered === true) {
        statusText = "RECOVERED";
        statusClass = "recovered";
    } else if (item.type === "lost") {
        statusText = "LOST";
        statusClass = "lost";
    } else {
        statusText = "FOUND";
        statusClass = "found";
    }

    const image = item.photo
        ? `<img class="report-card-image" src="${esc(item.photo)}" alt="${esc(item.title)}">`
        : `<div class="report-card-placeholder">${ICONS[item.category] || "📦"}</div>`;

    return `
        <article class="report-card" onclick="openModal('${item.id}')">
            <div class="report-card-media">
                ${image}
                <span class="report-status ${statusClass}">${statusText}</span>
            </div>
            <div class="report-card-body">
                <h3>${esc(item.title)}</h3>
                <div class="report-card-meta">
                    <span>${ICONS[item.category] || "📦"} ${esc(item.category)}</span>
                    <span>📍 ${esc(item.location)}</span>
                </div>
                <div class="report-card-footer">
                    <span>📅 ${esc(item.date)}</span>
                    <span>${esc(item.ownerName || "User")}</span>
                </div>
            </div>
        </article>
    `;
}

function setDashboardFilter(filter) {
    dashboardFilter = filter;
    const buttons = document.querySelectorAll('.stat-card');
    buttons.forEach(btn => btn.classList.remove('active-filter'));
    const activeBtn = document.getElementById('filter-' + filter);
    if(activeBtn) activeBtn.classList.add('active-filter');
    renderDashboard();
}

function renderDashboard() {
    const all = items.length;
    const lost = items.filter(x => x.type === "lost" && x.recovered !== true).length;
    const found = items.filter(x => x.type === "found" && x.recovered !== true).length;
    const recovered = items.filter(x => x.recovered === true).length;

    const allCount = document.getElementById("all-count");
    const lostCount = document.getElementById("lost-count");
    const foundCount = document.getElementById("found-count");
    const recoveredCount = document.getElementById("recovered-count");

    if (allCount) allCount.textContent = all;
    if (lostCount) lostCount.textContent = lost;
    if (foundCount) foundCount.textContent = found;
    if (recoveredCount) recoveredCount.textContent = recovered;

    const box = document.getElementById("dashboard-list");
    if (!box) return;

    const searchInput = document.getElementById("home-q");
    const categoryInput = document.getElementById("home-cat");

    const q = searchInput?.value.trim().toLowerCase() || "";
    const category = categoryInput?.value || "";

    let list = [...items];

    if (dashboardFilter === "lost") {
        list = list.filter(x => x.type === "lost" && x.recovered !== true);
    } else if (dashboardFilter === "found") {
        list = list.filter(x => x.type === "found" && x.recovered !== true);
    } else if (dashboardFilter === "recovered") {
        list = list.filter(x => x.recovered === true);
    }

    if (q) {
        list = list.filter(x =>
            String(x.title || "").toLowerCase().includes(q) ||
            String(x.description || "").toLowerCase().includes(q) ||
            String(x.location || "").toLowerCase().includes(q) ||
            String(x.category || "").toLowerCase().includes(q)
        );
    }

    if (category) {
        list = list.filter(x => x.category === category);
    }

    box.innerHTML = "";
    if (!list.length) {
        box.innerHTML = `
            <div class="empty">
                <h3>No reports found</h3>
                <p>Try another search or category.</p>
            </div>
        `;
        return;
    }

    list.forEach(item => {
        box.innerHTML += createCard(item);
    });
}

function setupDashboardSearch() {
    const search = document.getElementById("home-q");
    const category = document.getElementById("home-cat");
    if (search) search.addEventListener("input", () => { renderDashboard(); });
    if (category) category.addEventListener("change", () => { renderDashboard(); });
}

/* =========================================
   MODAL & ACTIONS
========================================= */

function openModal(id) {
    const item = items.find(x => String(x.id) === String(id));
    if (!item) return;

    const modal = document.getElementById("item-modal");
    const box = document.getElementById("modal-box");
    if (!modal || !box) return;

    box.innerHTML = renderModalView(item);
    modal.classList.add("show");
}

function closeModal() {
    const modal = document.getElementById("item-modal");
    if (modal) {
        modal.classList.remove("show");
        modal.style.display = "";
    }
}

function closeOuter(event) {
    if (event.target.id === "item-modal") {
        closeModal();
    }
}

document.addEventListener("click", event => {
    const modal = document.getElementById("item-modal");
    if (modal && event.target === modal) closeModal();
});

function renderModalView(item) {
    const session = getSession();
    const isOwner = session && session.role !== "guest" && item.ownerId === session.id;

    const image = item.photo
        ? `<img class="modal-image" src="${esc(item.photo)}" alt="${esc(item.title)}">`
        : `<div class="modal-image-placeholder">${ICONS[item.category] || "📦"}</div>`;

    let statusText, statusClass;
    if (item.recovered === true) {
        statusText = "RECOVERED"; statusClass = "recovered";
    } else if (item.type === "lost") {
        statusText = "LOST"; statusClass = "lost";
    } else {
        statusText = "FOUND"; statusClass = "found";
    }

    const dateLabel = item.type === "lost" ? "Lost Date" : "Found Date";
    const locLabel = item.type === "lost" ? "Lost Location" : "Found Location";

    return `
        <div class="modal-content">
            <button class="modal-close" onclick="closeModal()">×</button>
            ${image}
            <div class="modal-details">
                <span class="report-status ${statusClass}">${statusText}</span>
                <h2>${esc(item.title)}</h2>
                <div class="modal-info">
                    <div>
                        <strong>Category</strong>
                        <span>${esc(item.category)}</span>
                    </div>
                    <div>
                        <strong>${locLabel}</strong>
                        <span>📍 ${esc(item.location)}</span>
                    </div>
                    <div>
                        <strong>${dateLabel}</strong>
                        <span>📅 ${esc(item.date)}</span>
                    </div>
                    <div>
                        <strong>Contact Info</strong>
                        <span>📞 ${esc(item.contactInfo || "Not provided")}</span>
                    </div>
                    <div>
                        <strong>Reported By</strong>
                        <span>${esc(item.ownerName || "User")}</span>
                    </div>
                </div>
                <div class="modal-description">
                    <strong>Description</strong>
                    <p>${esc(item.description)}</p>
                </div>
                ${isOwner ? `
                    <div class="modal-actions">
                        <button class="btn-secondary" onclick="editItem('${item.id}')">✏️ Edit</button>
                        ${!item.recovered ? `
                            <button class="btn-success" onclick="markRecovered('${item.id}')">✓ Recovered</button>
                        ` : ""}
                        <button class="btn-danger" onclick="deleteItem('${item.id}')">🗑 Delete</button>
                    </div>
                ` : ""}
            </div>
        </div>
    `;
}

function editItem(id) {
    const session = getSession();
    const item = items.find(x => x.id === id);

    if (!session || session.role === "guest" || !item || item.ownerId !== session.id) {
        toast("You can only edit your own report.");
        return;
    }

    const box = document.getElementById("modal-box");
    if (!box) return;

    box.innerHTML = `
        <div class="edit-box">
            <button class="edit-close" onclick="closeModal()">×</button>
            <h2>Edit Report</h2>
            <div class="edit-field">
                <label>Item Name</label>
                <input id="edit-title" class="input" value="${esc(item.title)}">
            </div>
            <div class="edit-field">
                <label>Category</label>
                <select id="edit-category" class="input">
                    <option>Phone</option>
                    <option>Wallet</option>
                    <option>Keys</option>
                    <option>ID Card</option>
                    <option>Books</option>
                    <option>Electronics</option>
                    <option>Others</option>
                </select>
            </div>
            <div class="edit-field">
                <label>Date</label>
                <input id="edit-date" class="input" type="date" value="${esc(item.date)}">
            </div>
            <div class="edit-field">
                <label>Location</label>
                <input id="edit-location" class="input" value="${esc(item.location)}">
            </div>
            <div class="edit-field">
                <label>Contact Info</label>
                <input id="edit-contact" class="input" value="${esc(item.contactInfo || "")}">
            </div>
            <div class="edit-field">
                <label>Description</label>
                <textarea id="edit-description" class="input">${esc(item.description)}</textarea>
            </div>
            <label class="edit-photo-btn" for="edit-photo">📷 Change Photo</label>
            <input id="edit-photo" type="file" accept="image/png,image/jpeg,image/webp" onchange="previewEditPhoto(this)" hidden>
            <div id="edit-photo-preview" class="edit-photo-preview">
                ${item.photo ? `<img src="${esc(item.photo)}">` : ""}
            </div>
            <button class="primary-btn" onclick="saveEdit('${item.id}')">✓ Save Changes</button>
        </div>
    `;

    const category = document.getElementById("edit-category");
    if (category) category.value = item.category;

    const modal = document.getElementById("item-modal");
    if (modal) modal.classList.add("show");
}

function previewEditPhoto(input) {
    const box = document.getElementById("edit-photo-preview");
    if (!input?.files?.[0]) return;
    const file = input.files[0];
    if (file.size > 5 * 1024 * 1024) {
        toast("Photo must be smaller than 5MB.");
        input.value = "";
        return;
    }
    const reader = new FileReader();
    reader.onload = event => {
        if (box) box.innerHTML = `<img src="${event.target.result}">`;
    };
    reader.readAsDataURL(file);
}

function saveEdit(id) {
    const session = getSession();
    const index = items.findIndex(x => x.id === id);

    if (!session || session.role === "guest" || index === -1 || items[index].ownerId !== session.id) {
        toast("You cannot edit this report.");
        return;
    }

    const title = document.getElementById("edit-title")?.value.trim();
    const category = document.getElementById("edit-category")?.value;
    const date = document.getElementById("edit-date")?.value;
    const locationValue = document.getElementById("edit-location")?.value.trim();
    const contactInfo = document.getElementById("edit-contact")?.value.trim();
    const description = document.getElementById("edit-description")?.value.trim();

    if (!title || !category || !date || !locationValue || !contactInfo || !description) {
        toast("Please fill all fields.");
        return;
    }

    function finish(photoData) {
        items[index].title = title;
        items[index].category = category;
        items[index].date = date;
        items[index].location = locationValue;
        items[index].contactInfo = contactInfo;
        items[index].description = description;
        if (photoData !== undefined) items[index].photo = photoData;
        save();
        closeModal();
        toast("Report updated successfully.");
        renderDashboard();
        if (window.location.href.toLowerCase().includes("account.html")) initAccount();
    }

    const input = document.getElementById("edit-photo");
    if (input?.files?.[0]) {
        const reader = new FileReader();
        reader.onload = event => finish(event.target.result);
        reader.readAsDataURL(input.files[0]);
    } else {
        finish();
    }
}

function markRecovered(id) {
    const session = getSession();
    const item = items.find(x => x.id === id);
    if (!session || session.role === "guest" || !item || item.ownerId !== session.id) {
        toast("You cannot manage this report.");
        return;
    }
    item.recovered = true;
    save();
    closeModal();
    toast("Report marked as recovered.");
    renderDashboard();
    if (window.location.href.toLowerCase().includes("account.html")) initAccount();
}

function deleteItem(id) {
    const session = getSession();
    const item = items.find(x => x.id === id);
    if (!session || session.role === "guest" || !item || item.ownerId !== session.id) {
        toast("You cannot delete this report.");
        return;
    }
    if (!confirm("Delete this report?")) return;
    items = items.filter(x => x.id !== id);
    save();
    closeModal();
    toast("Report deleted.");
    renderDashboard();
    if (window.location.href.toLowerCase().includes("account.html")) initAccount();
}

/* =========================================
   INITIALIZATION
========================================= */

document.addEventListener("DOMContentLoaded", () => {
    const session = ensureGuestSession();
    initProfile();

    const currentUrl = window.location.href.toLowerCase();

    // Home Page
    if (currentUrl.includes("index.html") || window.location.pathname.endsWith("/")) {
        setupDashboardSearch();
        setDashboardFilter(dashboardFilter);
    }

    // Report Item Page
    if (currentUrl.includes("report.html")) {
        const warning = document.getElementById("guest-report-warning");
        const formCard = document.getElementById("report-form-card");

        if (session.role === "guest") {
            if (warning) warning.style.display = "flex";
            if (formCard) formCard.classList.add("guest-disabled");
        } else {
            if (warning) warning.style.display = "none";
            if (formCard) formCard.classList.remove("guest-disabled");
        }
        
        setType(curType);

        const date = document.getElementById("item-date");
        if (date && !date.value) {
            date.value = new Date().toISOString().split("T")[0];
        }
        const description = document.getElementById("item-description");
        if (description) {
            description.addEventListener("input", updateDescriptionCount);
            updateDescriptionCount();
        }
    }

    // Account Page
    if (currentUrl.includes("account.html")) {
        initAccount();
    }
});
