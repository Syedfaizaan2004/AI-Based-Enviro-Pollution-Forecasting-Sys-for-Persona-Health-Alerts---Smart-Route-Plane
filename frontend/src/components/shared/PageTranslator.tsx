import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router';
import { api } from '@/services/api';
import { DEFAULT_LANGUAGE, normalizeLanguageCode } from '@/constants/languages';

type BatchTranslationResponse = {
  translations: Record<string, string>;
  target_language: string;
};

const TRANSLATABLE_ATTRIBUTES = ['placeholder', 'title', 'aria-label'] as const;
const MAX_TEXT_LENGTH = 1000;
const BATCH_SIZE = 100;

function isInsideIgnoredElement(node: Node) {
  const element = node.parentElement;
  return Boolean(
    element?.closest(
      '[data-no-translate], script, style, noscript, svg, canvas, code, pre, input, textarea'
    )
  );
}

function isTranslatableText(value: string | null) {
  const text = value?.trim() || '';
  if (text.length < 2 || text.length > MAX_TEXT_LENGTH) return false;
  return /[A-Za-z]/.test(text);
}

function preserveOuterWhitespace(original: string, translated: string) {
  const leading = original.match(/^\s*/)?.[0] || '';
  const trailing = original.match(/\s*$/)?.[0] || '';
  return `${leading}${translated}${trailing}`;
}

function getTextNodes(root: HTMLElement) {
  const nodes: Text[] = [];
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      if (isInsideIgnoredElement(node) || !isTranslatableText(node.nodeValue)) {
        return NodeFilter.FILTER_REJECT;
      }
      return NodeFilter.FILTER_ACCEPT;
    },
  });

  let currentNode = walker.nextNode();
  while (currentNode) {
    nodes.push(currentNode as Text);
    currentNode = walker.nextNode();
  }

  return nodes;
}

function getAttributeElements(root: HTMLElement) {
  const selector = TRANSLATABLE_ATTRIBUTES.map((attribute) => `[${attribute}]`).join(',');
  return Array.from(root.querySelectorAll<HTMLElement>(selector)).filter(
    (element) => !element.closest('[data-no-translate]')
  );
}

export function PageTranslator() {
  const { i18n } = useTranslation();
  const location = useLocation();
  const originalsRef = useRef<WeakMap<Text, string>>(new WeakMap());
  const trackedTextNodesRef = useRef<Set<Text>>(new Set());
  const attributeOriginalsRef = useRef<WeakMap<Element, Map<string, string>>>(new WeakMap());
  const trackedAttributeElementsRef = useRef<Set<Element>>(new Set());
  const cacheRef = useRef<Map<string, string>>(new Map());
  const runIdRef = useRef(0);

  useEffect(() => {
    const restoreOriginalText = () => {
      trackedTextNodesRef.current.forEach((node) => {
        const original = originalsRef.current.get(node);
        if (node.isConnected && original) {
          node.nodeValue = original;
        }
      });

      trackedAttributeElementsRef.current.forEach((element) => {
        const originals = attributeOriginalsRef.current.get(element);
        if (!element.isConnected || !originals) return;

        originals.forEach((value, attribute) => {
          element.setAttribute(attribute, value);
        });
      });
    };

    const translatePage = async () => {
      const language = normalizeLanguageCode(i18n.language);
      const isIgnoredPage = location.pathname === '/' || location.pathname.startsWith('/admin');
      const currentRunId = ++runIdRef.current;

      if (language === DEFAULT_LANGUAGE || isIgnoredPage) {
        restoreOriginalText();
        return;
      }

      const activeTextNodes = new Set([
        ...getTextNodes(document.body),
        ...Array.from(trackedTextNodesRef.current).filter(
          (node) => node.isConnected && !isInsideIgnoredElement(node)
        ),
      ]);

      const textNodes = Array.from(activeTextNodes).map((node) => {
        if (!originalsRef.current.has(node)) {
          originalsRef.current.set(node, node.nodeValue || '');
          trackedTextNodesRef.current.add(node);
        }

        return {
          node,
          original: originalsRef.current.get(node) || '',
        };
      });

      const activeAttributeElements = new Set([
        ...getAttributeElements(document.body),
        ...Array.from(trackedAttributeElementsRef.current).filter(
          (element) => element.isConnected && !element.closest('[data-no-translate]')
        ),
      ]);

      const attributeEntries = Array.from(activeAttributeElements).flatMap((element) => {
        let originals = attributeOriginalsRef.current.get(element);
        if (!originals) {
          originals = new Map();
          attributeOriginalsRef.current.set(element, originals);
          trackedAttributeElementsRef.current.add(element);
        }

        return TRANSLATABLE_ATTRIBUTES.flatMap((attribute) => {
          const currentValue = element.getAttribute(attribute);
          if (!originals.has(attribute) && !isTranslatableText(currentValue)) return [];

          if (!originals.has(attribute)) {
            originals.set(attribute, currentValue || '');
          }

          return [{
            element,
            attribute,
            original: originals.get(attribute) || '',
          }];
        });
      });

      const uniqueTexts = Array.from(
        new Set([
          ...textNodes.map((entry) => entry.original.trim()),
          ...attributeEntries.map((entry) => entry.original.trim()),
        ])
      ).filter(isTranslatableText);

      const missingTexts = uniqueTexts.filter((text) => !cacheRef.current.has(`${language}:${text}`));

      for (let index = 0; index < missingTexts.length; index += BATCH_SIZE) {
        const chunk = missingTexts.slice(index, index + BATCH_SIZE);
        try {
          const { data } = await api.post<BatchTranslationResponse>('/translation/translate-batch', {
            texts: chunk,
            target_language: language,
            source_language: DEFAULT_LANGUAGE,
          });

          Object.entries(data.translations).forEach(([original, translated]) => {
            cacheRef.current.set(`${language}:${original}`, translated);
          });
        } catch {
          return;
        }
      }

      if (currentRunId !== runIdRef.current) return;

      textNodes.forEach(({ node, original }) => {
        const translated = cacheRef.current.get(`${language}:${original.trim()}`);
        if (node.isConnected && translated) {
          node.nodeValue = preserveOuterWhitespace(original, translated);
        }
      });

      attributeEntries.forEach(({ element, attribute, original }) => {
        const translated = cacheRef.current.get(`${language}:${original.trim()}`);
        if (element.isConnected && translated) {
          element.setAttribute(attribute, translated);
        }
      });
    };

    let timeoutId: number | undefined;
    const scheduleTranslation = () => {
      window.clearTimeout(timeoutId);
      timeoutId = window.setTimeout(() => {
        translatePage();
      }, 150);
    };

    const observer = new MutationObserver((mutations) => {
      const shouldTranslate = mutations.some((mutation) => {
        if (mutation.type === 'attributes') {
          return TRANSLATABLE_ATTRIBUTES.includes(
            mutation.attributeName as (typeof TRANSLATABLE_ATTRIBUTES)[number]
          );
        }
        return true;
      });

      if (shouldTranslate) {
        scheduleTranslation();
      }
    });

    const currentLanguage = normalizeLanguageCode(i18n.language);
    const isIgnoredPage = location.pathname === '/' || location.pathname.startsWith('/admin');

    if (currentLanguage === DEFAULT_LANGUAGE || isIgnoredPage) {
      restoreOriginalText();
      // No observer needed for default language or ignored pages
    } else {
      observer.observe(document.body, {
        attributes: true,
        attributeFilter: [...TRANSLATABLE_ATTRIBUTES],
        characterData: true,
        childList: true,
        subtree: true,
      });
      scheduleTranslation();
    }

    const handleLanguageChange = () => {
      const newLanguage = normalizeLanguageCode(i18n.language);
      const isCurrentlyIgnored = location.pathname === '/' || location.pathname.startsWith('/admin');
      
      if (newLanguage === DEFAULT_LANGUAGE || isCurrentlyIgnored) {
        observer.disconnect();
        restoreOriginalText();
      } else {
        observer.observe(document.body, {
          attributes: true,
          attributeFilter: [...TRANSLATABLE_ATTRIBUTES],
          characterData: true,
          childList: true,
          subtree: true,
        });
        scheduleTranslation();
      }
    };

    i18n.on('languageChanged', handleLanguageChange);

    return () => {
      window.clearTimeout(timeoutId);
      observer.disconnect();
      i18n.off('languageChanged', handleLanguageChange);
    };
  }, [i18n, location.pathname]);

  return null;
}
