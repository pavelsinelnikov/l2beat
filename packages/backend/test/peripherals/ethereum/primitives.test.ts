import { expect } from 'chai'

import { Bytes, EthereumAddress, KeccakHash } from '../../../src/model'
import {
  asBigIntFromQuantity,
  asBytesFromData,
  asEthereumAddressFromData,
  asKeccakHashFromData,
  bigIntToQuantity,
  blockTagToString,
} from '../../../src/peripherals/ethereum/primitives'

describe('asBytesFromData', () => {
  const cases = [
    { value: '0x41', expected: [0x41] },
    { value: '0x004200', expected: [0x00, 0x42, 0x00] },
    { value: '0x', expected: [] },
    { value: '0x004200', length: 3, expected: [0x00, 0x42, 0x00] },
    {
      value: '0x004200',
      length: 4,
      error: 'Length mismatch, expected 4 bytes',
    },
    { value: '0xf0f0f', error: 'Data must represent each byte as two digits' },
    { value: '004200', error: 'Data must start with 0x' },
    { value: '0xNotValid', error: 'Data must be a hex string' },
  ]
  for (const { value, length, error, expected } of cases) {
    if (error) {
      it(`throws for ${value}`, () => {
        expect(() => asBytesFromData(value, length)).to.throw(TypeError, error)
      })
    } else if (expected) {
      const len = length !== undefined ? ` - length ${length}` : ''
      it(`reads ${value} as ${expected}${len}`, () => {
        const result = asBytesFromData(value, length)
        expect(result).to.deep.equal(Bytes.fromByteArray(expected))
      })
    }
  }
})

describe('asEthereumAddressFromData', () => {
  const address = '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2'

  it('correctly reads a 20 byte address', () => {
    expect(asEthereumAddressFromData(address)).to.deep.equal(
      EthereumAddress(address)
    )
  })

  it('throws for shorter bytes', () => {
    expect(() => asEthereumAddressFromData('0x1234')).to.throw(
      TypeError,
      'Invalid EthereumAddress'
    )
  })
})

describe('asKeccakHashFromData', () => {
  const hash =
    '0xabcdabcd12345678abcdabcd12345678ABCDABCD12345678ABCDABCD12345678'

  it('correctly reads a 32 byte hash', () => {
    expect(asKeccakHashFromData(hash)).to.deep.equal(new KeccakHash(hash))
  })

  it('throws for shorter bytes', () => {
    expect(() => asKeccakHashFromData('0x1234')).to.throw(
      TypeError,
      'KeccakHash must be exactly 32 bytes'
    )
  })
})

describe('asBigIntFromQuantity', () => {
  const cases = [
    { value: '0x41', expected: 65n },
    { value: '0x400', expected: 1024n },
    { value: '0x0', expected: 0n },
    { value: '0x0400', error: 'Quantity cannot have leading zeroes' },
    { value: 'ff', error: 'Quantity must start with 0x' },
    { value: '0xNotValid', error: 'Quantity must be a hex string' },
  ]
  for (const { value, error, expected } of cases) {
    if (error) {
      it(`throws for ${value}`, () => {
        expect(() => asBigIntFromQuantity(value)).to.throw(TypeError, error)
      })
    } else if (expected !== undefined) {
      it(`reads ${value} as ${expected}`, () => {
        const result = asBigIntFromQuantity(value)
        expect(result).to.equal(expected)
      })
    }
  }
})

describe('bigIntToQuantity', () => {
  const cases = [
    { value: 65n, expected: '0x41' },
    { value: 1024n, expected: '0x400' },
    { value: 0n, expected: '0x0' },
    { value: -1n, error: 'Quantity cannot be a negative integer' },
  ]
  for (const { value, error, expected } of cases) {
    if (error) {
      it(`throws for ${value}`, () => {
        expect(() => bigIntToQuantity(value)).to.throw(TypeError, error)
      })
    } else if (expected !== undefined) {
      it(`reads ${value} as ${expected}`, () => {
        const result = bigIntToQuantity(value)
        expect(result).to.equal(expected)
      })
    }
  }
})

describe('blockTagToString', () => {
  it('converts numbers to quantities', () => {
    expect(blockTagToString(2n)).to.equal('0x2')
  })

  it('leaves strings untouched', () => {
    expect(blockTagToString('latest')).to.equal('latest')
  })
})
