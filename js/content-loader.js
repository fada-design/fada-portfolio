// 動的コンテンツローダー - モバイル対応版
class ContentLoader {
    constructor() {
        this.cache = new Map();
        // ベースURLを設定（モバイル対応の重要ポイント）
        this.baseURL = this.getBaseURL();
    }

    // ベースURLを取得する関数（モバイル対応の追加）
    getBaseURL() {
        // 本番環境とローカル環境を自動判定
        const hostname = window.location.hostname;
        if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '') {
            // ローカル環境
            return window.location.origin + window.location.pathname.replace(/[^\/]*$/, '');
        } else {
            // 本番環境（fada-s.com）
            return 'https://fada-s.com/';
        }
    }

    // URLを正規化する関数（モバイル対応の追加）
    normalizeURL(filePath) {
        // 相対パスを絶対URLに変換
        if (filePath.startsWith('./')) {
            filePath = filePath.substring(2);
        }
        if (filePath.startsWith('/')) {
            return this.baseURL + filePath.substring(1);
        }
        return this.baseURL + filePath;
    }

    // HTMLファイルから特定IDの要素を取得
    async loadContentFromHTML(filePath, elementId) {
        try {
            // キャッシュをチェック
            const cacheKey = `${filePath}_${elementId}`;
            if (this.cache.has(cacheKey)) {
                return this.cache.get(cacheKey);
            }

            // URLを正規化（モバイル対応）
            const fullURL = this.normalizeURL(filePath);
            console.log(`Loading content from: ${fullURL}`);

            // HTMLファイルを取得（タイムアウト設定追加）
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 5000); // 5秒でタイムアウト

            const response = await fetch(fullURL, {
                method: 'GET',
                mode: 'cors',
                cache: 'no-cache',
                signal: controller.signal
            }).catch(error => {
                // フェッチエラーの場合、もう一度相対パスで試す
                console.log(`Retrying with relative path: ${filePath}`);
                return fetch(filePath);
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                throw new Error(`Failed to load ${filePath}: ${response.status}`);
            }
            
            const html = await response.text();
            
            // DOMParserでHTMLをパース
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            
            // 指定IDの要素を取得
            const element = doc.getElementById(elementId);
            if (!element) {
                console.warn(`Element with ID "${elementId}" not found in ${filePath}`);
                return this.getFallbackContent(elementId);
            }
            
            // 要素の内容を取得
            const content = element.innerHTML;
            
            // キャッシュに保存
            this.cache.set(cacheKey, content);
            
            return content;
        } catch (error) {
            console.error(`Error loading content from ${filePath}:`, error);
            // フォールバック内容を返す
            return this.getFallbackContent(elementId);
        }
    }

    // フォールバックコンテンツ（モバイル対応の追加）
    getFallbackContent(elementId) {
        const fallbacks = {
            'services-summary': `
                <div class="services-grid">
                    <div class="service-card">
                        <h3>建築設計</h3>
                        <p>新築・リノベーション・増改築まで、お客様のニーズに合わせた設計を提供します。</p>
                    </div>
                    <div class="service-card">
                        <h3>建築音響コンサルティング</h3>
                        <p>騒音対策から音響設計まで、快適な音環境を実現します。</p>
                    </div>
                    <div class="service-card">
                        <h3>技術コンサルティング</h3>
                        <p>建築に関する技術的な課題解決をサポートします。</p>
                    </div>
                </div>`,
            'about-summary': `
                <div style="text-align: center; padding: 2rem;">
                    <h3>環境と人が互いに自律し、調和できる未来へ</h3>
                    <p>文山建築設計事務所は、建築を通じて社会に貢献することを使命としています。</p>
                </div>`,
            'works-summary': `
                <div class="works-grid">
                    <div class="work-summary">
                        <div class="summary-info">
                            <h3>実績紹介</h3>
                            <p>詳細な実績情報は準備中です。</p>
                        </div>
                    </div>
                </div>`,
            'blog-summary': `
                <div style="text-align: center; padding: 2rem;">
                    <h3>ブログコンテンツ準備中</h3>
                    <p>建築設計のヒントやプロジェクトの紹介など、有益な情報を定期的に更新予定です。</p>
                </div>`
        };
        return fallbacks[elementId] || '<p>コンテンツを読み込めませんでした。</p>';
    }

    // 各サマリーコンテンツを取得
    async getServicesSummary() {
        return await this.loadContentFromHTML('services.html', 'services-summary');
    }

    async getAboutSummary() {
        return await this.loadContentFromHTML('about.html', 'about-summary');
    }

    async getWorksSummary() {
        return await this.loadContentFromHTML('works.html', 'works-summary');
    }

    async getBlogSummary() {
        return await this.loadContentFromHTML('blog.html', 'blog-summary');
    }

    // ヘッダーとフッターのコンテンツ（静的）
    getHeaderContent() {
        return `<header>
    <nav>
        <div class="logo">
            <div class="logo-text">
                <div class="logo-main">文山建築設計事務所</div>
                <div class="logo-sub">Fumiyama Architect's Design Associates</div>
            </div>
        </div>
        <button class="mobile-menu-toggle" id="mobileMenuToggle">
            <span></span>
            <span></span>
            <span></span>
        </button>
        <ul class="nav-links" id="navLinks">
            <li><a href="#home" data-page="index">ホーム</a></li>
            <li><a href="#about" data-page="about">会社概要</a></li>
            <li><a href="#services" data-page="services">サービス</a></li>
            <li><a href="#works" data-page="works">実績</a></li>
            <li><a href="#blog" data-page="blog">ブログ</a></li>
            <li><a href="#contact" data-page="contact">お問い合わせ</a></li>
        </ul>
    </nav>
</header>`;
    }

    getFooterContent() {
        return `<footer>
    <div class="footer-content">
        <div class="footer-section">
            <h4>文山建築設計事務所</h4>
            <p>FUMIYAMA ARCHITECT'S DESIGN ASSOCIATES</p>
            <p>〒547-0044<br>大阪市平野区平野本町2-10-4<br>えんだら百歩4C</p>
            <p>TEL: 06-7660-4777</p>
            <p>Email: s1@fada.email</p>
        </div>
        <div class="footer-section">
            <h4>メニュー</h4>
            <a href="index.html">ホーム</a>
            <a href="about.html">会社概要</a>
            <a href="services.html">サービス</a>
            <a href="works.html">実績</a>
            <a href="blog.html">ブログ</a>
        </div>
        <div class="footer-section">
            <h4>お問い合わせ</h4>
            <a href="contact.html">お問い合わせ</a>
            <a href="#">プライバシーポリシー</a>
        </div>
    </div>
    <div class="footer-bottom">
        <p>&copy; 2024 FUMIYAMA ARCHITECT'S DESIGN ASSOCIATES. All rights reserved.</p>
    </div>
</footer>`;
    }

    // メインの読み込み処理
    async loadContent(elementId, contentType) {
        const element = document.getElementById(elementId);
        if (!element) return;

        // ローディング表示（短時間のため簡略化）
        if (contentType !== 'header' && contentType !== 'footer') {
            element.innerHTML = '<p style="text-align: center; color: #999;">読み込み中...</p>';
        }

        try {
            let content;
            switch (contentType) {
                case 'header':
                    content = this.getHeaderContent();
                    break;
                case 'footer':
                    content = this.getFooterContent();
                    break;
                case 'services-summary':
                    content = await this.getServicesSummary();
                    break;
                case 'about-summary':
                    content = await this.getAboutSummary();
                    break;
                case 'works-summary':
                    content = await this.getWorksSummary();
                    break;
                case 'blog-summary':
                    content = await this.getBlogSummary();
                    break;
                default:
                    content = '<p>コンテンツが見つかりません。</p>';
            }
            
            element.innerHTML = content;
            
            // モバイルメニューの再初期化（ヘッダー読み込み後）
            if (contentType === 'header') {
                this.initMobileMenu();
            }
        } catch (error) {
            console.error(`Error loading ${contentType}:`, error);
            element.innerHTML = this.getFallbackContent(contentType);
        }
    }

    // モバイルメニューの初期化（追加）
    initMobileMenu() {
        const mobileMenuToggle = document.getElementById('mobileMenuToggle');
        const navLinks = document.getElementById('navLinks');
        const overlay = document.getElementById('overlay');
        
        if (mobileMenuToggle && navLinks) {
            mobileMenuToggle.addEventListener('click', function() {
                this.classList.toggle('active');
                navLinks.classList.toggle('active');
                if (overlay) overlay.classList.toggle('active');
            });

            // メニューリンククリックでメニューを閉じる
            const menuLinks = navLinks.querySelectorAll('a');
            menuLinks.forEach(link => {
                link.addEventListener('click', function() {
                    mobileMenuToggle.classList.remove('active');
                    navLinks.classList.remove('active');
                    if (overlay) overlay.classList.remove('active');
                });
            });
        }
    }

    // アクティブメニューをハイライトする関数
    setActiveMenu() {
        const currentPage = this.getCurrentPageName();
        const navLinks = document.querySelectorAll('.nav-links a');
        
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('data-page') === currentPage) {
                link.classList.add('active');
            }
        });
    }

    // 現在のページ名を取得する関数
    getCurrentPageName() {
        const path = window.location.pathname;
        const fileName = path.split('/').pop();
        
        if (fileName === '' || fileName === 'index.html') {
            return 'index';
        }
        
        return fileName.replace('.html', '');
    }

    // 初期化処理
    async init() {
        try {
            console.log('動的コンテンツローダーを初期化中...');
            console.log('Base URL:', this.baseURL);
            
            // ヘッダーとフッターを読み込み
            await this.loadContent('header-placeholder', 'header');
            await this.loadContent('footer-placeholder', 'footer');
            
            // 各セクションのサマリーコンテンツを読み込み
            const contentMappings = [
                { elementId: 'services-content', type: 'services-summary' },
                { elementId: 'about-content', type: 'about-summary' },
                { elementId: 'works-content', type: 'works-summary' },
                { elementId: 'blog-content', type: 'blog-summary' }
            ];

            // 順次読み込み（モバイル対応のため）
            for (const mapping of contentMappings) {
                const element = document.getElementById(mapping.elementId);
                if (element) {
                    await this.loadContent(mapping.elementId, mapping.type);
                }
            }
            
            // アクティブメニューのハイライト
            this.setActiveMenu();
            
            console.log('動的コンテンツローダーの初期化完了');
        } catch (error) {
            console.error('Content loading failed:', error);
        }
    }

    // キャッシュをクリアする関数（開発用）
    clearCache() {
        this.cache.clear();
        console.log('キャッシュをクリアしました');
    }
}

// グローバルインスタンスを作成
const contentLoader = new ContentLoader();

// DOMが読み込まれた後に実行（タイミング調整）
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
        contentLoader.init();
    });
} else {
    // 既にDOMが読み込まれている場合
    contentLoader.init();
}

// 開発用：グローバルアクセス
window.contentLoader = contentLoader;