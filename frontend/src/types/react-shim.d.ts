// Broad compatibility shim to eliminate React/JSX red underlines in editors when TS config/type resolution is flaky.
// This file can be removed once the editor correctly picks up @types/react and @types/react-dom.

declare module 'react' {
  export type ReactNode = any;
  export type FC<P = {}> = (props: P & { children?: ReactNode }) => any;
  export const Fragment: any;
  export const createElement: any;
  export const useState: any;
  export const useEffect: any;
  export const useMemo: any;
  export const useCallback: any;
  export const useRef: any;
  export const useContext: any;
  export const createContext: any;
  const React: any;
  export default React;
}

// Automatic JSX runtime shims
declare module 'react/jsx-runtime' {
  export const jsx: any;
  export const jsxs: any;
  export const Fragment: any;
}

declare module 'react/jsx-dev-runtime' {
  export const jsxDEV: any;
  export const Fragment: any;
}

// React DOM client shim
declare module 'react-dom/client' {
  export const createRoot: any;
}

// Fallback module declarations for libraries that may not ship types
declare module 'lovable-tagger' {
  export const componentTagger: any;
  const _default: any;
  export default _default;
}
