// A tiny fake localStorage for tests: a Map behind the Storage interface.
// failWith: make every setItem throw that error name (e.g. 'QuotaExceededError' = the storage is full).
export class FakeStorage implements Storage {
  private items = new Map<string, string>()
  failWith: string | null = null

  get length(): number {
    return this.items.size
  }

  clear(): void {
    this.items.clear()
  }

  getItem(key: string): string | null {
    return this.items.get(key) ?? null
  }

  key(index: number): string | null {
    return Array.from(this.items.keys())[index] ?? null
  }

  removeItem(key: string): void {
    this.items.delete(key)
  }

  setItem(key: string, value: string): void {
    if (this.failWith !== null) throw new DOMException('Storage write failed', this.failWith)
    this.items.set(key, value)
  }
}
