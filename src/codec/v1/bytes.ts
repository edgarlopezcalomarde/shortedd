/** Escritor/lector de bytes con varints LEB128 sin signo, usados por el layout binario v1. */

export class ByteWriter {
  private chunks: number[] = []

  writeByte(value: number): void {
    this.chunks.push(value & 0xff)
  }

  writeVarint(value: number): void {
    let remaining = value
    while (remaining >= 0x80) {
      this.chunks.push((remaining & 0x7f) | 0x80)
      remaining = Math.floor(remaining / 128)
    }
    this.chunks.push(remaining & 0x7f)
  }

  writeBytes(bytes: Uint8Array): void {
    for (const byte of bytes) this.chunks.push(byte)
  }

  writeVarintPrefixedString(text: string): void {
    const bytes = new TextEncoder().encode(text)
    this.writeVarint(bytes.length)
    this.writeBytes(bytes)
  }

  toUint8Array(): Uint8Array {
    return new Uint8Array(this.chunks)
  }
}

export class ByteReader {
  private offset = 0
  private readonly bytes: Uint8Array

  constructor(bytes: Uint8Array) {
    this.bytes = bytes
  }

  get remaining(): number {
    return this.bytes.length - this.offset
  }

  readByte(): number {
    if (this.offset >= this.bytes.length) {
      throw new Error('payload truncado: se esperaba un byte más')
    }
    return this.bytes[this.offset++]
  }

  readVarint(): number {
    let result = 0
    let shift = 1
    for (let i = 0; i < 5; i++) {
      const byte = this.readByte()
      result += (byte & 0x7f) * shift
      if ((byte & 0x80) === 0) return result
      shift *= 128
    }
    throw new Error('payload inválido: varint demasiado largo')
  }

  readBytes(length: number): Uint8Array {
    if (length < 0 || this.offset + length > this.bytes.length) {
      throw new Error('payload truncado: longitud declarada excede el buffer')
    }
    const slice = this.bytes.subarray(this.offset, this.offset + length)
    this.offset += length
    return slice
  }

  readVarintPrefixedString(): string {
    const length = this.readVarint()
    return new TextDecoder().decode(this.readBytes(length))
  }
}
