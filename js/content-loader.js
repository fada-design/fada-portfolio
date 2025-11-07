// 動的コンテンツローダー - HTMLファイルから直接読み込み
class ContentLoader {
    constructor() {
        this.cache = new Map();
    }

    // HTMLファイルから特定IDの要素を取得
    async loadContentFromHTML(filePath, elementId) {
        try {
            // キャッシュをチェック
            const cacheKey = `${filePath}_${elementId}`;
            if (this.cache.has(cacheKey)) {
                return this.cache.get(cacheKey);
            }

            // HTMLファイルを取得
            const response = await fetch(filePath);
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
                throw new Error(`Element with ID "${elementId}" not found in ${filePath}`);
            }
            
            // 要素の内容を取得
            const content = element.innerHTML;
            
            // キャッシュに保存
            this.cache.set(cacheKey, content);
            
            return content;
        } catch (error) {
            console.error(`Error loading content from ${filePath}:`, error);
            return `<p>コンテンツの読み込みに失敗しました: ${error.message}</p>`;
        }
    }

    // 各サマリーコンテンツを取得
    async getServicesSummary() {
        return await this.loadContentFromHTML('./services.html', 'services-summary');
    }

    async getAboutSummary() {
        return await this.loadContentFromHTML('./about.html', 'about-summary');
    }

    async getWorksSummary() {
        return await this.loadContentFromHTML('./works.html', 'works-summary');
    }

    async getBlogSummary() {
        return `<div style="text-align: center; padding: 6rem 2rem; background: #f8f9fa; border-radius: 12px; margin-bottom: 4rem;">
    <h2 style="font-size: 2rem; color: #2c5f7d; margin-bottom: 1rem;">ブログコンテンツ作成中</h2>
    <p style="font-size: 1.1rem; color: #666; line-height: 1.8;">
        現在、ブログコンテンツを準備しております。<br>
        建築設計のヒントやプロジェクトの紹介など、有益な情報を定期的に更新予定です。<br>
        今しばらくお待ちください。
    </p>
</div>`;
    }

    // ヘッダーとフッターのコンテンツ（静的）
    getHeaderContent() {
        return `<header>
    <nav>
        <div class="logo">
            <a href="index.html">
                <img class="logo-image" src="./images/logo.png" alt="文山建築設計事務所">
            </a>
        </div>
        <ul class="nav-links">
            <li><a href="index.html" data-page="index">ホーム</a></li>
            <li><a href="about.html" data-page="about">会社概要</a></li>
            <li><a href="services.html" data-page="services">サービス</a></li>
            <li><a href="works.html" data-page="works">実績</a></li>
            <li><a href="blog.html" data-page="blog">ブログ</a></li>
            <li><a href="contact.html" data-page="contact">お問い合わせ</a></li>
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

        // ローディング表示
        if (contentType !== 'header' && contentType !== 'footer') {
            element.innerHTML = '<p style="text-align: center; color: #999;">コンテンツを読み込み中...</p>';
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
        } catch (error) {
            console.error(`Error loading ${contentType}:`, error);
            element.innerHTML = `<p>コンテンツの読み込みに失敗しました: ${error.message}</p>`;
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
            
            // ヘッダーとフッターを同期的に読み込み
            await this.loadContent('header-placeholder', 'header');
            await this.loadContent('footer-placeholder', 'footer');
            
            // 各セクションのサマリーコンテンツを並行読み込み
            const contentMappings = [
                { elementId: 'services-content', type: 'services-summary' },
                { elementId: 'about-content', type: 'about-summary' },
                { elementId: 'works-content', type: 'works-summary' },
                { elementId: 'blog-content', type: 'blog-summary' }
            ];

            // 並行して読み込み
            const promises = contentMappings.map(async mapping => {
                const element = document.getElementById(mapping.elementId);
                if (element) {
                    await this.loadContent(mapping.elementId, mapping.type);
                }
            });

            await Promise.all(promises);
            
            // アクティブメニューのハイライト
            this.setActiveMenu();
            
            console.log('動的コンテンツローダーの初期化完了 - 詳細ページを編集すれば自動的にindex.htmlに反映されます');
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

// DOMが読み込まれた後に実行
document.addEventListener('DOMContentLoaded', function() {
    contentLoader.init();
});

// 開発用：グローバルアクセス
window.contentLoader = contentLoader;