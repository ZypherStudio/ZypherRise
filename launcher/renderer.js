// --- WINDOW CONTROLS ---
document.getElementById('close-btn').addEventListener('click', () => window.launcherAPI.closeApp());
document.getElementById('minimize-btn').addEventListener('click', () => window.launcherAPI.minimizeApp());

// --- UI ELEMENTS ---
const playBtn = document.getElementById('play-btn');
const usernameInput = document.getElementById('username-input');
const authSelect = document.getElementById('auth-select');
const msLoginBtn = document.getElementById('ms-login-btn');
const versionSelect = document.getElementById('version-select'); // Used for quick launch
const playerAvatar = document.getElementById('player-avatar');
const progressContainer = document.getElementById('progress-container');
const progressBar = document.getElementById('progress-bar');
const progressText = document.getElementById('progress-text');
const zypherConnectBtn = document.getElementById('zypher-connect-btn');
const zypherModal = document.getElementById('zypher-modal');
const closeZypherModal = document.getElementById('close-zypher-modal');
const zypherPassword = document.getElementById('zypher-password');
const zypherLoginBtn = document.getElementById('zypher-login-btn');
const zypherAuthMsg = document.getElementById('zypher-auth-msg');
const founderBadge = document.getElementById('founder-badge');
const authStatusContainer = document.getElementById('auth-status-container');
const signOutBtn = document.getElementById('sign-out-btn');
const capeBadge = document.getElementById('cape-badge');

// Settings Elements
const ramSelect = document.getElementById('ram-select');
const fpsBoostCheck = document.getElementById('fps-boost');
const autoJoinCheck = document.getElementById('auto-join');
const javaPathInput = document.getElementById('java-path');
const saveSettingsBtn = document.getElementById('save-settings-btn');
const zypherCapeCheck = document.getElementById('zypher-cape'); // Cosmetic
const langSelect = document.getElementById('lang-select'); // V5 Language
const ramSuggestionBox = document.getElementById('ram-suggestion-box'); // V5 Smart RAM

// --- TABS LOGIC ---
const navItems = document.querySelectorAll('.nav-item');
navItems.forEach((btn) => {
    btn.addEventListener('click', () => {
        navItems.forEach(n => n.classList.remove('active'));
        btn.classList.add('active');

        document.querySelectorAll('.view-section').forEach(v => {
            v.style.display = 'none';
            v.classList.remove('active');
        });

        const target = document.getElementById(btn.getAttribute('data-target'));
        if(target) {
            target.style.display = 'flex';
            target.classList.add('active');
        }
    });
});

// --- THEME ENGINE ---
const themeCards = document.querySelectorAll('.theme-card');
themeCards.forEach(card => {
    card.addEventListener('click', () => {
        themeCards.forEach(c => c.classList.remove('active'));
        card.classList.add('active');
        const themeOption = card.getAttribute('data-theme');
        document.body.setAttribute('data-theme', themeOption);
        localStorage.setItem('zr_theme', themeOption);
    });
});

// --- 3D SKIN VIEWER (V3 EXCLUSIVE) ---
let skinViewer;
let isWalking = true;
const API_BASE = 'https://zypher-rise-two.vercel.app'; 

const STEVE_UUID = "8667ba71-b85a-4004-af54-4b6a23a31f45";

function initSkinViewer() {
    const container = document.getElementById("skin_container");
    if(!container) return;
    
    if(typeof skinview3d === 'undefined') {
        console.error("Skinview3D kütüphanesi yüklenemedi.");
        return;
    }

    try {
        skinViewer = new skinview3d.SkinViewer({
            canvas: container,
            width: 220,
            height: 300,
            skin: `https://crafatar.com/skins/${STEVE_UUID}`
        });

        skinViewer.camera.position.set(20, 10, 35);
        skinViewer.controls.enableZoom = false;

        let walk = skinViewer.animations.add(skinview3d.WalkingAnimation);
        walk.speed = 0.8;
        
        const walkBtn = document.getElementById('walk-toggle');
        if(walkBtn) {
            walkBtn.addEventListener('click', () => {
                isWalking = !isWalking;
                if(isWalking) { walk.play(); walkBtn.innerHTML = '<i class="fa-solid fa-person-walking"></i> Yürüt / Durdur'; }
                else { walk.pause(); walkBtn.innerHTML = '<i class="fa-solid fa-pause"></i> Yürüt / Durdur'; }
            });
        }
    } catch(err) {
        console.error("3D motoru başlatılamadı:", err);
    }
}

// Upload Skin Logic - Moved outside to guarantee binding
const uploadInput = document.getElementById('skin-upload');
const applySkinBtn = document.getElementById('apply-skin-btn');
let pendingSkinData = null;

uploadInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file && skinViewer) {
        const reader = new FileReader();
        reader.onload = (event) => {
            pendingSkinData = event.target.result;
            skinViewer.loadSkin(pendingSkinData);
        };
        reader.readAsDataURL(file);
    }
    const skinLabel = document.getElementById('selected-skin-name');
    if(skinLabel) skinLabel.textContent = file ? file.name : "Dosya Hazır";
    uploadInput.value = '';
});

applySkinBtn.addEventListener('click', () => {
    if(pendingSkinData) {
        localStorage.setItem('zr_custom_skin', pendingSkinData);
        updateSidebarAvatar(pendingSkinData, true);
        applySkinBtn.innerHTML = '<i class="fa-solid fa-check"></i> Uygulandı!';
        setTimeout(() => { applySkinBtn.innerHTML = '<i class="fa-solid fa-floppy-disk"></i> Kaydet ve Uygula'; }, 2000);
    } else {
        localStorage.removeItem('zr_custom_skin');
        updateAvatars(usernameInput.value.trim());
        applySkinBtn.innerHTML = '<i class="fa-solid fa-check"></i> Varsayılana Dönüldü';
        setTimeout(() => { applySkinBtn.innerHTML = '<i class="fa-solid fa-floppy-disk"></i> Kaydet ve Uygula'; }, 2000);
    }
});

zypherCapeCheck.addEventListener('change', () => {
    if(!skinViewer) return;
    if(zypherCapeCheck.checked) {
        skinViewer.loadCape(`https://crafatar.com/capes/${STEVE_UUID}`);
    } else {
        skinViewer.loadCape(null);
    }
});

function updateSidebarAvatar(source, isBase64 = false) {
    if(isBase64) {
        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = 32; canvas.height = 32;
            const ctx = canvas.getContext('2d');
            ctx.imageSmoothingEnabled = false;
            // Crop head (8,8, size 8x8) and draw to 32x32
            ctx.drawImage(img, 8, 8, 8, 8, 0, 0, 32, 32);
            // Draw hat layer (40,8, size 8x8)
            ctx.drawImage(img, 40, 8, 8, 8, 0, 0, 32, 32);
            playerAvatar.src = canvas.toDataURL();
        };
        img.src = source;
    } else {
        playerAvatar.src = `https://minotar.net/helm/${encodeURIComponent(source)}/40`;
    }
}

function updateAvatars(username) {
    if(!username) return;
    const customSkin = localStorage.getItem('zr_custom_skin');
    
    if(customSkin) {
        updateSidebarAvatar(customSkin, true);
        if(skinViewer) skinViewer.loadSkin(customSkin);
    } else {
        updateSidebarAvatar(username);
        if(skinViewer) {
            skinViewer.loadSkin(`https://minotar.net/skin/${encodeURIComponent(username)}`).catch(() => {
                skinViewer.loadSkin(`https://crafatar.com/skins/${STEVE_UUID}`);
            });
        }
    }
}

// Update avatar live as user types (debounced)
let avatarDebounce;
usernameInput.addEventListener('input', () => {
    clearTimeout(avatarDebounce);
    avatarDebounce = setTimeout(() => updateAvatars(usernameInput.value.trim()), 600);
});

// --- V5 SMART RAM & I18N ---
const API_BASE = "http://localhost:3000";
const TRANSLATIONS = {
    "en": {
        "Oyna": "Play",
        "Profil & Skin": "Profile & Skins",
        "Sürümler Merkezi": "Versions Hub",
        "Canlı Sunucular": "Live Servers",
        "Gelişmiş Modlar": "Advanced Mods",
        "Temalar": "Themes",
        "Ayarlar": "Settings",
        "Limitsiz Deneyim.": "Limitless Experience.",
        "ZypherRise ile Minecraft'ın sınırlarını zorla.": "Push the boundaries of Minecraft with ZypherRise.",
        "Aktif Profil (Sürüm):": "Active Profile (Version):",
        "OYNA": "PLAY",
        "Hazırlanıyor... %0": "Preparing... %0",
        "Karakter Laboratuvarı": "Character Laboratory",
        "Skinini yükle veya Zypher Pelerini kuşan.": "Upload your skin or equip the Zypher Cape.",
        "Bilgisayardan Seç": "Select from PC",
        "Sürüm Laboratuvarı": "Version Laboratory",
        "Yeni Profil Ekle": "Add New Profile",
        "Sunucu Ağları (Live)": "Server Networks (Live)",
        "Mod Kütüphanesi": "Mod Library",
        "Ara": "Search",
        "Özel Temalar": "Custom Themes",
        "Gelişmiş Ayarlar": "Advanced Settings",
        "Maksimum RAM:": "Maximum RAM:",
        "Oto FPS Boost (Özel JVM Argümanları Uygula)": "Auto FPS Boost (Apply Custom JVM Args)",
        "Açılışta Otomatik Sunucuya Katıl (play.zypherrise.com)": "Auto-Join Server on Launch (play.zypherrise.com)",
        "Uygulama Dili (Language):": "App Language:",
        "Değişiklikleri Kaydet": "Save Changes",
        "Hakkında": "About",
        "Yapımcı ve Kurucu: Zypher Studio": "Creator and Founder: Zypher Studio"
    }
};

function applyTranslations(lang) {
    if(lang !== 'en') {
        // Just reload for TR to clear EN modifications if user switches back to TR
        // Wait, best is just window.location.reload() if switching backwards, but let's just keep logic basic
        return;
    }
    const dict = TRANSLATIONS[lang];
    if(!dict) return;
    
    // Brute force translation of text nodes
    const walk = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null, false);
    let n;
    while(n = walk.nextNode()) {
        const text = n.nodeValue.trim();
        if(dict[text]) {
            n.nodeValue = n.nodeValue.replace(text, dict[text]);
        }
    }
    
    // Translate specific buttons that might not trigger via TreeWalker correctly due to formatting
    document.querySelectorAll('.nav-item, h2, label, button, option, p, h3').forEach(el => {
        const inner = el.textContent.trim();
        if(dict[inner]) {
            el.innerHTML = el.innerHTML.replace(inner, dict[inner]);
        }
    });
}

// --- SETTINGS MANGEMENT ---
function loadSettings() {
    usernameInput.value = localStorage.getItem('zr_username') || 'Player1';
    authSelect.value = localStorage.getItem('zr_auth_type') || 'offline';
    ramSelect.value = localStorage.getItem('zr_ram') || '4G';
    javaPathInput.value = localStorage.getItem('zr_java') || '';
    fpsBoostCheck.checked = localStorage.getItem('zr_fps_boost') === 'true';
    autoJoinCheck.checked = localStorage.getItem('zr_auto_join') === 'true';
    zypherCapeCheck.checked = localStorage.getItem('zr_cape') === 'true';
    
    const savedLang = localStorage.getItem('zr_lang') || 'tr';
    langSelect.value = savedLang;
    if(savedLang === 'en') applyTranslations('en');
    
    // V5 Smart RAM Check
    window.launcherAPI.getTotalMem().then(bytes => {
        const gb = Math.round(bytes / (1024 * 1024 * 1024));
        let recommended = "4G";
        if (gb <= 4) recommended = "2G";
        else if (gb >= 16) recommended = "8G";
        else if (gb >= 8) recommended = "4G";
        
        ramSuggestionBox.innerHTML = `<p style="color:var(--accent); font-size:12px;">🖥️ Sistem RAM'iniz: ${gb}GB. Sizin için önerilen: <strong>${recommended}</strong>.</p>`;
    }).catch(() => { ramSuggestionBox.innerHTML = ''; });

    const savedTheme = localStorage.getItem('zr_theme') || 'dark';
    document.body.setAttribute('data-theme', savedTheme);
    themeCards.forEach(c => {
        if(c.getAttribute('data-theme') === savedTheme) {
            themeCards.forEach(tc => tc.classList.remove('active'));
            c.classList.add('active');
        }
    });

    handleAuthUI();
    updateAvatars(usernameInput.value);
    
    if(zypherCapeCheck.checked && skinViewer) {
        skinViewer.loadCape("https://crafatar.com/capes/853c80ef3c3749fdaa49938b674adae6");
    }
}

saveSettingsBtn.addEventListener('click', () => {
    localStorage.setItem('zr_ram', ramSelect.value);
    localStorage.setItem('zr_java', javaPathInput.value);
    localStorage.setItem('zr_fps_boost', fpsBoostCheck.checked);
    localStorage.setItem('zr_auto_join', autoJoinCheck.checked);
    localStorage.setItem('zr_cape', zypherCapeCheck.checked);
    
    const prevLang = localStorage.getItem('zr_lang') || 'tr';
    localStorage.setItem('zr_lang', langSelect.value);
    
    saveSettingsBtn.textContent = langSelect.value === 'en' ? "Saved!" : "Kaydedildi!";
    
    if(prevLang !== langSelect.value) {
        window.location.reload(); // Reload to apply language universally
    }

    setTimeout(() => { saveSettingsBtn.textContent = langSelect.value === 'en' ? "Save Changes" : "Değişiklikleri Kaydet"; }, 2000);
});

// --- AUTH UI ---
function handleAuthUI() {
    const val = authSelect.value;
    usernameInput.style.display = val === 'microsoft' ? 'none' : 'block';
    msLoginBtn.style.display = val === 'microsoft' ? 'block' : 'none';
    
    // Zypher logic
    if (val === 'zypher') {
        if (zypherTokenData) {
            zypherConnectBtn.style.display = 'none';
            authStatusContainer.style.display = 'flex';
        } else {
            zypherConnectBtn.style.display = 'block';
            authStatusContainer.style.display = 'none';
        }
    } else {
        zypherConnectBtn.style.display = 'none';
        authStatusContainer.style.display = 'none';
    }
    
    localStorage.setItem('zr_auth_type', val);
}
authSelect.addEventListener('change', handleAuthUI);

// Sign Out Logic
signOutBtn.addEventListener('click', () => {
    zypherTokenData = null;
    localStorage.removeItem('zr_zypher_token'); // Mock storage
    
    // Reset UI
    zypherConnectBtn.innerHTML = '<i class="fa-solid fa-network-wired"></i> Ağa Bağlan';
    zypherConnectBtn.style.background = 'var(--accent)';
    authStatusContainer.style.display = 'none';
    zypherConnectBtn.style.display = 'block';
    
    // Reset Skin View
    zypherCapeCheck.checked = false;
    zypherCapeCheck.disabled = false;
    if(skinViewer) {
        skinViewer.loadCape(null);
        skinViewer.loadSkin(`https://minotar.net/skin/${encodeURIComponent(usernameInput.value.trim())}`);
    }
    
    handleAuthUI();
});

// Zypher modal open/close
if(zypherConnectBtn) zypherConnectBtn.addEventListener('click', () => { zypherModal.style.display = 'flex'; });
if(closeZypherModal) closeZypherModal.addEventListener('click', () => { zypherModal.style.display = 'none'; });
window.addEventListener('click', (e) => { if(e.target === zypherModal) zypherModal.style.display = 'none'; });

// Zypher Network Login
let zypherTokenData = null;
zypherLoginBtn.addEventListener('click', async () => {
    zypherLoginBtn.textContent = 'Bağlanıyor...';
    const zypherUsernameField = document.getElementById('zypher-username-input');
    const loginUsername = zypherUsernameField ? zypherUsernameField.value.trim() : usernameInput.value.trim();
    try {
        const res = await fetch(`${API_BASE}/api/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: loginUsername, password: zypherPassword.value })
        });
        const data = await res.json();
        if(data.success) {
            zypherTokenData = data.user;
            usernameInput.value = data.user.username;
            zypherAuthMsg.textContent = "Bağlantı Başarılı! ⭐";
            zypherAuthMsg.style.color = "#10b981";
            
            // Show Status
            authStatusContainer.style.display = 'flex';
            zypherConnectBtn.style.display = 'none';
            
            // Rotate character to show back
            if(skinViewer) {
                skinViewer.camera.position.set(-20, 10, -35); // Look from back
                setTimeout(() => {
                    skinViewer.camera.position.set(20, 10, 35); // Reset after 3 seconds
                }, 3000);
            }

            // Update button to show connected state
            zypherConnectBtn.innerHTML = `<i class="fa-solid fa-check"></i> ${data.user.username} (Bağlandı)`;
            zypherConnectBtn.style.background = '#10b981';
            // Close modal after short delay
            setTimeout(() => { zypherModal.style.display = 'none'; }, 1200);
            // Force Zypher Cape
            zypherCapeCheck.checked = true;
            zypherCapeCheck.disabled = true;
            if(skinViewer) skinViewer.loadCape("https://crafatar.com/capes/853c80ef3c3749fdaa49938b674adae6");
        } else {
            zypherAuthMsg.textContent = data.message;
            zypherAuthMsg.style.color = "#ef4444";
        }
    } catch(err) {
        zypherAuthMsg.textContent = 'Sunucuya ulaşılamıyor. node server.js çalışıyor mu?';
        zypherAuthMsg.style.color = "#ef4444";
    }
    zypherLoginBtn.textContent = 'Ağa Bağlan';
});

let msTokenData = null;
msLoginBtn.addEventListener('click', async () => {
    msLoginBtn.textContent = "Giriş Bekleniyor...";
    const res = await window.launcherAPI.msLogin();
    if(res.success && res.profile) {
        msTokenData = res.profile;
        msLoginBtn.textContent = "Oturum: " + res.profile.name;
        // In MSMC, profile.id is the UUID
        if(skinViewer) {
            skinViewer.loadSkin(`https://crafatar.com/skins/${res.profile.id}`);
            playerAvatar.src = `https://crafatar.com/avatars/${res.profile.id}?size=64&overlay`;
        }
    } else {
        msLoginBtn.textContent = "Giriş Başarısız!";
        setTimeout(() => { msLoginBtn.textContent = "Microsoft ile Giriş Yap"; }, 2000);
    }
});

// --- ADVANCED VERSIONS MANAGER (V3) ---
let globalVersions = [];
const vNumberSelect = document.getElementById('v-number');
const createProfileBtn = document.getElementById('create-profile-btn');
const vTypeSelect = document.getElementById('v-type');

async function fetchVersions() {
    try {
        const response = await fetch('https://piston-meta.mojang.com/mc/game/version_manifest_v2.json');
        const data = await response.json();
        globalVersions = data.versions.filter(v => v.type === 'release');
        
        vNumberSelect.innerHTML = '';
        versionSelect.innerHTML = ''; // Also populate quick launch
        
        globalVersions.forEach(v => {
            const opt = document.createElement('option');
            opt.value = v.id;
            opt.textContent = v.id;
            vNumberSelect.appendChild(opt);
            
            const opt2 = document.createElement('option');
            opt2.value = v.id;
            opt2.textContent = v.id + (v.id === data.latest.release ? ' (En Yeni)' : '');
            versionSelect.appendChild(opt2);
        });
        
        const savedVer = localStorage.getItem('zr_version');
        if (savedVer && globalVersions.find(v => v.id === savedVer)) versionSelect.value = savedVer;
    } catch (err) {
        vNumberSelect.innerHTML = '<option value="1.20.4">1.20.4</option>';
    }
}

createProfileBtn.addEventListener('click', () => {
    const type = vTypeSelect.value;
    const number = vNumberSelect.value;
    
    const div = document.createElement('div');
    div.className = 'version-card';
    div.innerHTML = `<h3>${type.toUpperCase()} ${number}</h3><p>Özel Profil</p>`;
    
    // Quick switch logic
    div.addEventListener('click', () => {
        versionSelect.value = number;
        // Switch back to play tab quickly
        document.querySelector('[data-target="view-play"]').click();
        alert(`${type} ${number} profili seçildi!`);
    });

    document.getElementById('versions-grid').appendChild(div);
});

// --- MODRINTH SEARCH ---
const modsContainer = document.getElementById('mods-list');
const modSearchInput = document.getElementById('mod-search-input');
const modCategorySelect = document.getElementById('mod-category');
const modSearchBtn = document.getElementById('mod-search-btn');
let activeModVersion = '';

async function fetchMods(query = "", category = "", gameVersion = "") {
    try {
        modsContainer.innerHTML = '<div style="color:var(--text-muted); padding:20px;">Aranıyor...</div>';
        let url = `https://api.modrinth.com/v2/search?limit=24&index=relevance`;
        if(query) url += `&query=${encodeURIComponent(query)}`;
        
        let facets = [];
        if(category) facets.push([`categories:${category}`]);
        if(gameVersion) facets.push([`versions:${gameVersion}`]);
        if(facets.length > 0) url += `&facets=${encodeURIComponent(JSON.stringify(facets))}`;

        const response = await fetch(url);
        const data = await response.json();
        modsContainer.innerHTML = '';
        
        if(data.hits.length === 0) {
            modsContainer.innerHTML = '<p>Mod bulunamadı.</p>';
            return;
        }

        data.hits.forEach(mod => {
            const card = document.createElement('div');
            card.className = 'mod-card';
            card.innerHTML = `
                <img src="${mod.icon_url || 'https://via.placeholder.com/64'}" alt="${mod.title}">
                <div class="mod-info">
                    <h3>${mod.title}</h3>
                    <p>${mod.description}</p>
                    <span class="mod-author">by ${mod.author}</span>
                </div>
                <button class="btn-install" data-id="${mod.project_id}">Kur</button>
            `;
            modsContainer.appendChild(card);
        });

        // Installer logic
        document.querySelectorAll('.btn-install').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const projectId = e.target.getAttribute('data-id');
                e.target.textContent = "İndiriliyor...";
                e.target.disabled = true;
                
                try {
                    const vRes = await fetch(`https://api.modrinth.com/v2/project/${projectId}/version`);
                    const versions = await vRes.json();
                    if(versions.length > 0 && versions[0].files.length > 0) {
                        const fileUrl = versions[0].files[0].url;
                        const fileName = versions[0].files[0].filename;
                        const res = await window.launcherAPI.installMod({ url: fileUrl, filename: fileName });
                        if(res.success) {
                            e.target.textContent = "Kuruldu!";
                            e.target.style.background = "var(--accent)";
                        } else { e.target.textContent = "Hata"; }
                    } else { e.target.textContent = "Dosya Yok"; }
                } catch(err){ e.target.textContent = "Hata"; }
            });
        });
    } catch (err) {
        modsContainer.innerHTML = '<p>Modlar yüklenemedi.</p>';
    }
}

modSearchBtn.addEventListener('click', () => {
    fetchMods(modSearchInput.value, modCategorySelect.value, activeModVersion);
});

modSearchInput.addEventListener('keydown', (e) => {
    if(e.key === 'Enter') fetchMods(modSearchInput.value, modCategorySelect.value, activeModVersion);
});

// Version pill logic
document.querySelectorAll('.version-pill').forEach(pill => {
    pill.addEventListener('click', () => {
        document.querySelectorAll('.version-pill').forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
        activeModVersion = pill.getAttribute('data-version');
        fetchMods(modSearchInput.value, modCategorySelect.value, activeModVersion);
    });
});

// --- LAUNCH LOGIC ---
playBtn.addEventListener('click', async () => {
    let finalAuth = null;
    let username = usernameInput.value.trim() || 'Player';

    if (authSelect.value === 'microsoft') {
        if(!msTokenData) { alert("Lütfen önce Microsoft ile giriş yapın!"); return; }
        finalAuth = msTokenData;
        username = msTokenData.name;
    } else if (authSelect.value === 'zypher') {
        if(!zypherTokenData) { alert("Lütfen önce Zypher Ağı'na bağlanın!"); return; }
        username = zypherTokenData.username;
    }

    const version = versionSelect.value;
    localStorage.setItem('zr_username', username);
    localStorage.setItem('zr_version', version);

    playBtn.disabled = true;
    playBtn.textContent = 'BAŞLATILIYOR...';
    progressContainer.style.display = 'block';
    progressText.textContent = 'Motor Hazırlanıyor...';

    const result = await window.launcherAPI.launch({
        username: username,
        version: version,
        memory: ramSelect.value,
        javaPath: javaPathInput.value.trim(),
        fpsBoost: fpsBoostCheck.checked,
        autoJoin: autoJoinCheck.checked,
        authProfile: finalAuth
    });

    if (!result.success) {
        alert('Başlatma hatası: ' + result.error);
        playBtn.disabled = false;
        playBtn.textContent = 'OYNA';
        progressContainer.style.display = 'none';
    }
});

// IPC EVENTS
window.launcherAPI.onProgress((e) => {
    if (e.task && e.total) { // MCLC format
        const percent = Math.floor((e.task / e.total) * 100);
        progressBar.style.width = `${percent}%`;
        progressText.textContent = `İndiriliyor: %${percent}`;
    } else if (typeof e === 'string') {
        progressBar.style.width = '100%';
        progressText.textContent = e;
    }
});

window.launcherAPI.onClosed((e) => {
    playBtn.disabled = false;
    playBtn.textContent = 'OYNA';
    progressContainer.style.display = 'none';
});

// --- V4: SERVER MONITOR LOGIC ---
const serverListContainer = document.getElementById('server-list');
const TARGET_SERVERS = ["play.zypherrise.com", "mc.hypixel.net", "play.craftrise.tc"];

async function fetchServers() {
    if(!serverListContainer) return;
    serverListContainer.innerHTML = '';
    
    for (const ip of TARGET_SERVERS) {
        // Create skeleton
        const card = document.createElement('div');
        card.className = 'server-card';
        card.innerHTML = `<p style="color:var(--text-muted)">${ip} sorgulanıyor...</p>`;
        serverListContainer.appendChild(card);

        try {
            // Using mcsrvstat API
            const res = await fetch(`https://api.mcsrvstat.us/3/${ip}`);
            const data = await res.json();
            
            if (data.online) {
                const max = data.players.max || 1;
                const online = data.players.online || 0;
                const percent = Math.min((online / max) * 100, 100);
                
                card.innerHTML = `
                    <div class="server-header">
                        <div class="server-info">
                            <h3>${ip === "play.zypherrise.com" ? "ZypherRise Official" : ip.split('.')[1].toUpperCase() + " Network"}</h3>
                            <p>${ip}</p>
                        </div>
                        <div class="status-badge"><div class="ping-dot"></div> Özgür Ağ</div>
                    </div>
                    <div class="player-bar-bg"><div class="player-bar-fill" style="width: ${percent}%;"></div></div>
                    <div class="player-count">${online.toLocaleString()} <span>/ ${max.toLocaleString()} Oyuncu</span></div>
                    <button class="btn-join" data-ip="${ip}">Hemen Katıl</button>
                `;
            } else {
                card.innerHTML = `
                    <div class="server-header">
                        <div class="server-info">
                            <h3>${ip}</h3>
                            <p>Çevrimdışı / Ulaşılamıyor</p>
                        </div>
                        <div class="status-badge offline"><div class="ping-dot" style="animation:none;"></div> Kapalı</div>
                    </div>
                    <button class="btn-join" disabled>Kapalı</button>
                `;
            }
        } catch (err) {
            card.innerHTML = `<p style="color:red">Bağlantı Hatası: ${ip}</p>`;
        }
    }

    // Attach Join Logic
    document.querySelectorAll('.btn-join').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const ip = e.target.getAttribute('data-ip');
            if(ip) {
                document.querySelector('[data-target="view-play"]').click(); // Go back to play tab
                // Enable Auto Join checkbox implicitly and set a target maybe
                autoJoinCheck.checked = true;
                // Currently minecraft-launcher-core requires autoJoin argument passed via quickPlay
                alert(`Ayarlarınız "${ip}" sunucusuna otomatik katılmak üzere ayarlandı! OYNA tuşuna basın.`);
            }
        });
    });
}

// INIT
setTimeout(() => {
    initSkinViewer();
    loadSettings();
    fetchVersions();
    fetchMods(); // Load default trending
    fetchServers(); // V4 Server status
}, 200);

// --- PREMIUM UI SOUND ENGINE (AUDIO CONTEXT MATH) ---
const AudioContext = window.AudioContext || window.webkitAudioContext;
const audioCtx = new AudioContext();

function playHoverSound() {
    if (audioCtx.state === 'suspended') audioCtx.resume();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.type = 'sine';
    // Yüksek frekanstan düşüğe çok yumuşak ve kısa (0.05 ms) bir 'tık'
    osc.frequency.setValueAtTime(1000, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(500, audioCtx.currentTime + 0.05);
    gain.gain.setValueAtTime(0.03, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.05);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.05);
}

function playClickSound() {
    if (audioCtx.state === 'suspended') audioCtx.resume();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.type = 'triangle';
    // Daha dolgun, baslı ve tok bir 'tak' sesi (0.1ms)
    osc.frequency.setValueAtTime(400, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(100, audioCtx.currentTime + 0.1);
    gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.1);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.1);
}

// Attach Sounds via Mutation Observer (to catch dynamically loaded elements like mods)
document.body.addEventListener('mouseenter', (e) => {
    if (e.target.matches && e.target.matches('button, .nav-item, .theme-card, .mod-card, .version-card, select, input')) {
        playHoverSound();
    }
}, true); // Capture phase

});

// --- AUTO-UPDATE UI LOGIC ---
const updateBanner = document.getElementById('update-banner');
const updateText = document.getElementById('update-text');
const updateProgBar = document.getElementById('update-progress-bar');
const restartBtn = document.getElementById('restart-btn');

if (window.launcherAPI && window.launcherAPI.onUpdateMsg) {
    window.launcherAPI.onUpdateMsg((data) => {
        updateBanner.style.display = 'flex';
        updateText.textContent = data.text;
        
        if (data.type === 'downloaded') {
            restartBtn.style.display = 'block';
            updateProgBar.parentElement.style.display = 'none'; // Hide bar when ready
        }
    });

    window.launcherAPI.onUpdateProgress((percent) => {
        updateBanner.style.display = 'flex';
        updateProgBar.style.width = percent + '%';
    });

    restartBtn.addEventListener('click', () => {
        window.launcherAPI.restartApp();
    });
}

