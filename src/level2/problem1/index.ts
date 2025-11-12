export class ExecutionCache<TInputs extends Array<unknown>, TOutput> {
  private readonly cache = new Map<string, Promise<TOutput>>();

  constructor(private readonly handler: (...args: TInputs) => Promise<TOutput>) {}
  
  async fire(key: string, ...args: TInputs): Promise<TOutput> {
    if (this.cache.has(key)) {
      return this.cache.get(key)!;
    }

    const execution = Promise.resolve(this.handler(...args)).catch((error) => {
      this.cache.delete(key);
      throw error;
    });

    this.cache.set(key, execution);

    return execution;
  }
}
