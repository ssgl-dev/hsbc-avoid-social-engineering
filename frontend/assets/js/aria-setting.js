export function setAriaAttributes() {
    function getFocusables(el) {
        return Array.from(
            el.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])')
        ).filter(el => !el.disabled && el.offsetParent !== null);
    }
    // Find textContent before the given element
    function getPreviousTextContent(startEl) {
        if (!startEl) return '';
        // helper: extract trimmed non-empty text from a node
        function nodeText(node) {
            if (!node) return '';
            if (node.nodeType === Node.TEXT_NODE) return node.textContent.trim();
            if (node.nodeType === Node.ELEMENT_NODE) return node.textContent.trim();
            return '';
        }

        // 1) search previous siblings
        let node = startEl.previousSibling;
        while (node) {
            const t = nodeText(node);
            if (t) return t;
            node = node.previousSibling;
        }

        // 2) If no siblings are found, search the parent's previous content
        let el = startEl;
        while (el.parentElement) {
            const parent = el.parentElement;
            const children = Array.from(parent.childNodes);
            const idx = children.indexOf(el);
            for (let i = idx - 1; i >= 0; i--) {
                const t = nodeText(children[i]);
                if (t) return t;
            }
            // If no text is found, continue searching the parent
            el = parent;
        }

        return '';
    }

    function setAriaLabels() {
        let focusables = getFocusables(document);
        focusables.forEach(el=>{
            // take the first text content if there are multiple children with textContent
            const first = el.textContent.split(/\s*\n+\s*|\s{2,}/)   
                                .find(Boolean);              
            el.setAttribute('aria-label', first || '')
            el.setAttribute('title',  first || '')
            
            if (el.className === "trans-hands-icon") {
                const prevContent = getPreviousTextContent(el);
                const first = prevContent.split(/\s*\n+\s*|\s{2,}/)   
                                .find(Boolean);
                if (curLanguage === 'en') {
                    el.setAttribute('aria-label', 'Play this section\'s sign language translation: ' + (first || ''))
                    el.setAttribute('title',  'Play this section\'s sign language translation: ' + (first || ''))
                }
                else {
                    el.setAttribute('aria-label', '播放手語視頻：' + (first || ''))
                    el.setAttribute('title',  '播放手語視頻：' + (first || ''))
                }
            }

        });
    }
    // language setting
    const curLanguage = location.pathname.endsWith('en') ? 'en' : 'cn';
    setAriaLabels();
};