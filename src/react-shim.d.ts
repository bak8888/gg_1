declare module 'react' {
  export function StrictMode(props: { children?: unknown }): unknown;
  export function useEffect(effect: () => void | (() => void), deps?: unknown[]): void;
  export function useMemo<T>(factory: () => T, deps?: unknown[]): T;
  export function useState<T = undefined>(initial?: T | (() => T)): [T, (value: T | ((previous: T) => T)) => void];
}

declare module 'react-dom/client' {
  export function createRoot(element: Element): { render(children: unknown): void };
}

declare module 'react/jsx-runtime' {
  export const jsx: unknown;
  export const jsxs: unknown;
  export const Fragment: unknown;
}

declare namespace JSX {
  interface IntrinsicAttributes { key?: string | number; }
  interface IntrinsicElements {
    [elementName: string]: any;
  }
}
