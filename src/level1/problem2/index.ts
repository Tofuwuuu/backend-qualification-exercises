import { randomBytes } from 'crypto';

const RANDOM_BYTES = randomBytes(4);
let COUNTER = randomBytes(3).readUIntBE(0, 3);

export class ObjectId {
  private data: Buffer;

  constructor(type: number, timestamp: number) {
    const normalizedType = Math.floor(type) & 0xff;
    const normalizedTimestamp = Math.floor(timestamp);

    this.data = Buffer.alloc(14);
    this.data.writeUInt8(normalizedType, 0);
    this.data.writeUIntBE(normalizedTimestamp, 1, 6);
    RANDOM_BYTES.copy(this.data, 7);

    const counter = COUNTER;
    COUNTER = (COUNTER + 1) & 0xffffff;
    this.data.writeUIntBE(counter, 11, 3);
  }

  static generate(type?: number): ObjectId {
    return new ObjectId(type ?? 0, Date.now());
  }
  
  toString(encoding?: 'hex' | 'base64'): string {
    return this.data.toString(encoding ?? 'hex');
  }
}