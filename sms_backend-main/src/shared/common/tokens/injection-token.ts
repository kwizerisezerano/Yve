export type InjectionToken<T> = string & { readonly __type?: T };

export function createInjectionToken<T>(name: string): InjectionToken<T> {
  return name as InjectionToken<T>;
}
