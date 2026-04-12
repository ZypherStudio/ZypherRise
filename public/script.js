document.addEventListener('DOMContentLoaded', () => {

    // --- 1. OS DETECTION LOGIC --- //
    const detectedOsSpan = document.getElementById('detected-os');
    const heroBtn = document.getElementById('hero-download-btn');
    const dlCards = document.querySelectorAll('.dl-card');

    let osName = "Bilinmeyen OS";
    let btnText = "İndir (.zip)";
    
    const userAgent = window.navigator.userAgent.toLowerCase();
    
    // Remove highlight from all cards first
    dlCards.forEach(card => {
        card.classList.remove('highlight');
        const badge = card.querySelector('.badge');
        if(badge) badge.remove();
    });

    // Helper to highlight card
    function highlightCard(index) {
        if(dlCards[index]) {
            dlCards[index].classList.add('highlight');
            const badge = document.createElement('div');
            badge.className = 'badge';
            badge.textContent = '🔥 Önerilen';
            dlCards[index].appendChild(badge);
        }
    }

    if (userAgent.indexOf("win") !== -1) {
        osName = "Windows";
        highlightCard(0); // Win is 0
    } else if (userAgent.indexOf("mac") !== -1 || userAgent.indexOf("os x") !== -1) {
        osName = "macOS";
        highlightCard(1); // Mac is 1
    } else if (userAgent.indexOf("linux") !== -1) {
        osName = "Linux";
        highlightCard(2); // Linux is 2
    }

    if(detectedOsSpan) detectedOsSpan.textContent = osName;
    
    // Default hero button entirely to Windows globally as per request
    if(heroBtn) {
        heroBtn.textContent = "Windows İçin İndir (.exe)";
        heroBtn.href = "https://github.com/ZypherStudio/ZypherRise/releases/latest/download/ZypherRise.Setup.1.1.1.exe";
    }

    // Downloads are now handled by <a> tags with href and download attributes
    if(heroBtn) heroBtn.setAttribute('download', '');

    // --- 2. SMOOTH SCROLLING --- //
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const targetId = this.getAttribute('href');
            if(targetId === '#') return;
            const targetNode = document.querySelector(targetId);
            if(targetNode) {
                e.preventDefault();
                targetNode.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });

    // --- 3. SCROLL REVEAL ANIMATIONS --- //
    function reveal() {
        var reveals = document.querySelectorAll(".reveal");
        for (var i = 0; i < reveals.length; i++) {
            var windowHeight = window.innerHeight;
            var elementTop = reveals[i].getBoundingClientRect().top;
            var elementVisible = 100;
            
            if (elementTop < windowHeight - elementVisible) {
                reveals[i].classList.add("active");
            }
        }
    }

    window.addEventListener("scroll", reveal);
    reveal(); // Trigger on load

    // --- 4. FAQ ACCORDION LOGIC --- //
    const faqItems = document.querySelectorAll('.faq-item');
    faqItems.forEach(item => {
        item.querySelector('.faq-question').addEventListener('click', () => {
            // Close others (optional)
            faqItems.forEach(i => {
                if (i !== item) i.classList.remove('active');
            });
            // Toggle current
            item.classList.toggle('active');
        });
    });

    // --- 7. AUTO-UPDATE SITE BANNER --- //
    const betaBannerSpan = document.querySelector('.beta-banner span');
    async function checkLatestRelease() {
        try {
            const res = await fetch('https://api.github.com/repos/ZypherStudio/ZypherRise/releases/latest');
            const data = await res.json();
            if(data && data.tag_name) {
                if(betaBannerSpan) {
                    betaBannerSpan.innerHTML = `En Güncel Sürüm Yayında: <strong style="color:var(--accent); cursor:pointer;" onclick="document.getElementById('download').scrollIntoView({behavior:'smooth'})">${data.tag_name}</strong> - Tıkla ve İndir!`;
                }
            }
        } catch(e) {
            console.warn("Could not fetch latest release for banner");
        }
    }
    checkLatestRelease();

});

// --- 5. I18N DICTIONARY & LOGIC --- //
const TRANSLATIONS = {
    "en": {
        "Özellikler": "Features",
        "Temalar": "Themes",
        "S.S.S": "FAQ",
        "İndir": "Download",
        "Discord'a Katıl": "Join Discord",
        "Oyunun Kontrolünü": "Take Control of",
        "Eline Al.": "The Game.",
        "Sınırları aşan optimizasyon, tek tıkla mod kurulumu ve 3D özel skin laboratuvarı. ZypherRise ile Minecraft deneyimini maksimize et.": "Optimization beyond limits, 1-click mod installation, and 3D custom skin lab. Maximize your Minecraft experience with ZypherRise.",
        "İndir (Otomatik)": "Download (Auto)",
        "Daha Fazla Bilgi": "More Info",
        "Maceraya Hazır Mısın?": "Ready for Adventure?",
        "OYNA": "PLAY",
        "Popüler Modlar": "Popular Mods",
        "Senin Tarzın, Senin Kuralların": "Your Style, Your Rules",
        "ZypherRise, dünyanın en gelişmiş tema motoruna sahiptir. Canın sıkıldığında uygulamayı kapatmana veya yeniden başlatmana gerek kalmaz. Tema kartlarına tıkla ve anında geçiş yap.": "ZypherRise features the world's most advanced theme engine. No need to close or restart the app. Click theme cards and switch instantly.",
        "Canlı CSS Entegrasyonu": "Live CSS Integration",
        "Karanlık ve Neon Seçenekleri": "Dark and Neon Options",
        "Göz Yormayan UI Tasarımı": "Eye-Friendly UI Design",
        "Sınırları Zorlayan Özellikler": "Boundary-Pushing Features",
        "Standart başlatıcıları unutun, ZypherRise tam donanımlı gelir.": "Forget standard launchers, ZypherRise comes fully equipped.",
        "Oto FPS Boost": "Auto FPS Boost",
        "Karakter Laboratuvarı": "Character Laboratory",
        "Modrinth Entegrasyonu": "Modrinth Integration",
        "Sürüm Merkezi": "Version Hub",
        "İşletim Sistemini Seç": "Choose Operating System",
        "Senin için en uygun kurulum dosyasını veya taşınabilir sürümü indir.": "Download the most suitable installer or portable version for you.",
        "Mevcut Cihazınız:": "Your Current Device:",
        "Hakkında": "About",
        "Geliştirme Aşamasındadır.": "Is Under Development.",
        "Haberler:": "News:",
        "Yeni Nesil Minecraft Launcher Deneyimi. © 2026 Tüm Hakları Saklıdır.": "Next Generation Minecraft Launcher Experience. © 2026 All Rights Reserved.",
        "Yapımcı ve Kurucu: Zypher Studio": "Creator and Founder: Zypher Studio",
        "Sıkça Sorulan Sorular": "Frequently Asked Questions",
        "Önerilen": "Recommended",
        "Windows İçin İndir (.exe)": "Download for Windows (.exe)",
        "Mac İçin İndir (.dmg)": "Download for Mac (.dmg)",
        "Linux İçin İndir (.AppImage)": "Download for Linux (.AppImage)"
    }
};

const langSelect = document.getElementById('lang-select');
if(langSelect) {
    const savedLang = localStorage.getItem('zr_web_lang') || 'tr';
    langSelect.value = savedLang;
    
    function applyWebTranslations(lang) {
        if(lang !== 'en') return;
        const dict = TRANSLATIONS[lang];
        
        const walk = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null, false);
        let n;
        while(n = walk.nextNode()) {
            const text = n.nodeValue.trim();
            if(dict[text]) {
                n.nodeValue = n.nodeValue.replace(text, dict[text]);
            }
        }
        document.querySelectorAll('a, button, h1, h2, h3, p, span, strong, div').forEach(el => {
            const inner = el.textContent.trim();
            if(dict[inner]) {
                el.innerHTML = el.innerHTML.replace(inner, dict[inner]);
            }
        });
    }

    applyWebTranslations(savedLang);

    langSelect.addEventListener('change', (e) => {
        localStorage.setItem('zr_web_lang', e.target.value);
        window.location.reload();
    });
}

// --- 6. AUTHENTICATION LOGIC --- //
const authBtn = document.getElementById('nav-auth-btn');
const authModal = document.getElementById('auth-modal');
const closeAuth = document.getElementById('close-auth-modal');
const tabLogin = document.getElementById('tab-login');
const tabRegister = document.getElementById('tab-register');
const authForm = document.getElementById('auth-form');
const authEmail = document.getElementById('auth-email');
const authError = document.getElementById('auth-error');
const authSuccess = document.getElementById('auth-success');

let isLoginMode = true;

if(authBtn) {
    const loggedUser = localStorage.getItem('zypher_user');
    if(loggedUser) {
        authBtn.innerHTML = `<i class="fa-solid fa-user-check"></i> ${JSON.parse(loggedUser).username}`;
        authBtn.style.background = 'var(--accent)';
    }

    authBtn.addEventListener('click', (e) => {
        e.preventDefault();
        if(localStorage.getItem('zypher_user')) {
            if(confirm("Çıkış yapmak istiyor musunuz?")) {
                localStorage.removeItem('zypher_user');
                window.location.reload();
            }
            return;
        }
        authModal.style.display = 'flex';
    });
}

if(closeAuth) closeAuth.addEventListener('click', () => authModal.style.display = 'none');
window.addEventListener('click', (e) => { if(e.target === authModal) authModal.style.display = 'none'; });

if(tabLogin && tabRegister) {
    tabLogin.addEventListener('click', () => {
        isLoginMode = true;
        tabLogin.classList.add('active');
        tabRegister.classList.remove('active');
        authEmail.style.display = 'none';
        authEmail.removeAttribute('required');
        authError.textContent = '';
        authSuccess.textContent = '';
    });
    tabRegister.addEventListener('click', () => {
        isLoginMode = false;
        tabRegister.classList.add('active');
        tabLogin.classList.remove('active');
        authEmail.style.display = 'block';
        authEmail.setAttribute('required', 'true');
        authError.textContent = '';
        authSuccess.textContent = '';
    });
}

if(authForm) {
    authForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        authError.textContent = '';
        authSuccess.textContent = '';
        
        const username = document.getElementById('auth-username').value;
        const password = document.getElementById('auth-password').value;
        const email = document.getElementById('auth-email').value;

        const apiOrigin = window.location.origin;
        const endpoint = isLoginMode ? `${apiOrigin}/api/login` : `${apiOrigin}/api/register`;
        const payload = isLoginMode ? { username, password } : { username, email, password };

        try {
            const res = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const data = await res.json();
            
            if(data.success) {
                authSuccess.textContent = isLoginMode ? 'Giriş başarılı! Yönlendiriliyor...' : 'Kayıt başarılı! Kurucu Pelerini hediyeniz tanımlandı.';
                localStorage.setItem('zypher_user', JSON.stringify(data.user));
                setTimeout(() => window.location.reload(), 1500);
            } else {
                authError.textContent = data.message;
            }
        } catch (err) {
            authError.textContent = 'Sunucuya bağlanılamadı! Lütfen "node server.js" çalıştığından emin olun.';
        }
    });
}
