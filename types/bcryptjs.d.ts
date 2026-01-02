declare module "bcryptjs" {
  export function hash(
    data: string,
    saltOrRounds: number | string,
    callback: (err: Error | null, encrypted: string) => void
  ): void;

  export function compare(
    data: string,
    encrypted: string,
    callback: (err: Error | null, same: boolean) => void
  ): void;

  const _default: {
    hash: typeof hash;
    compare: typeof compare;
  };

  export default _default;
}
