declare module '*.css' {
  const content: Record<string, string>;
  export default content;
}

// For CSS files imported as side effects
declare module '*.module.css';

declare module '*.global.css';