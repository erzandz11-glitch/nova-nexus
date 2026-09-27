import { NOVA_ENVIRONMENTS } from './novaRegistry';
import { NovaEnvironment } from './novaTypes';

export interface KeyboardRouterOptions {
  onOpenCommandSurface: () => void;
  onNavigateEnvironment?: (env: NovaEnvironment) => void;
}

export class NovaKeyboardRouter {
  private static sequencePendingKey: string | null = null;
  private static sequenceTimer: ReturnType<typeof setTimeout> | null = null;

  static isInputElement(el: Element | null): boolean {
    if (!el) return false;
    const tagName = el.tagName.toUpperCase();
    const isEditable = (el as HTMLElement).isContentEditable;
    return tagName === 'INPUT' || tagName === 'TEXTAREA' || tagName === 'SELECT' || isEditable;
  }

  static attach(options: KeyboardRouterOptions): () => void {
    if (typeof window === 'undefined') return () => {};

    const handleKeyDown = (e: KeyboardEvent) => {
      // 1. Check for ⌘K / Ctrl+K
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        options.onOpenCommandSurface();
        return;
      }

      // 2. Input Guard
      const activeEl = document.activeElement;
      if (this.isInputElement(activeEl)) {
        return;
      }

      // 3. Sequence Key Handler
      const key = e.key.toUpperCase();

      if (!this.sequencePendingKey) {
        if (key === 'G') {
          this.sequencePendingKey = 'G';
          if (this.sequenceTimer) clearTimeout(this.sequenceTimer);
          this.sequenceTimer = setTimeout(() => {
            this.sequencePendingKey = null;
          }, 1200);
        }
      } else if (this.sequencePendingKey === 'G') {
        if (this.sequenceTimer) clearTimeout(this.sequenceTimer);
        this.sequencePendingKey = null;

        let targetEnv: NovaEnvironment | null = null;
        if (key === 'H') targetEnv = 'platform';
        else if (key === 'M') targetEnv = 'mind';
        else if (key === 'P') targetEnv = 'producer';
        else if (key === 'A') targetEnv = 'artlabs';
        else if (key === 'C') targetEnv = 'community';

        if (targetEnv) {
          e.preventDefault();
          if (options.onNavigateEnvironment) {
            options.onNavigateEnvironment(targetEnv);
          } else {
            const url = NOVA_ENVIRONMENTS[targetEnv].url;
            window.location.href = url;
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      if (this.sequenceTimer) clearTimeout(this.sequenceTimer);
    };
  }
}
