declare module 'is-plain-object' {
  export function isPlainObject(value: any): value is Record<string, any>;
}