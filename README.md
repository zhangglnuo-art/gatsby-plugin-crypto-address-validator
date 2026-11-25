# gatsby-plugin-crypto-address-validator

Zero-dependency **Gatsby plugin** and GraphQL node source for validating multi-chain cryptocurrency wallet address syntax, cryptographic checksums, mandatory custodial **Memo / Destination Tag** routing rules, and prefix/suffix **address-poisoning lookalike detection** across 46+ blockchain networks.

Built and maintained by the security engineering team behind the [AllSwap Multi-Chain Address & Memo Validator](https://allswap.io/tools/address-validator) and the [AllSwap Non-Custodial Cross-Chain Swap & Bridge Aggregator](https://allswap.io/).

## Features

- **Gatsby GraphQL Node Sourcing (`allCryptoChainRule`)**: Automatically sources supported blockchain validation rules, Memo/Destination Tag requirements, and regex specifications into Gatsby's GraphQL data layer at build time.
- **Runtime Client & SSR Validation API (`validateCryptoAddress`)**: Importable helper function for validating wallet forms, Web3 donation widgets, and checkout components in Gatsby React pages.
- **Mandatory Memo & Destination Tag Enforcement**: Prevents accidental custodial deposit loss on shared settlement accounts (`XRP`, `XLM`, `ATOM`, `TON`, `HBAR`, `EOS`).
- **Vanity Address-Poisoning Defense (`detectAddressPoisoning`)**: Flags lookalike addresses that copy the leading 5 and trailing 4 characters of a known trusted counterparty address.

## Installation

```bash
npm install gatsby-plugin-crypto-address-validator
```

## Configuration (`gatsby-config.js`)

```javascript
module.exports = {
  plugins: [
    {
      resolve: `gatsby-plugin-crypto-address-validator`,
      options: {
        strictMemoValidation: true,
        enablePoisoningDetection: true,
      },
    },
  ],
};
```

## Usage in Gatsby Pages & Components

```javascript
import React from "react";
import { graphql } from "gatsby";
import { validateCryptoAddress } from "gatsby-plugin-crypto-address-validator";

export default function CheckoutValidationPage({ data }) {
  const check = validateCryptoAddress(
    "XRP",
    "rEb8TK3gBgk5auZkwc6sHnwrGVJH8DuaLh",
    "104928173"
  );

  return (
    <main>
      <h1>Verification Status: {check.code}</h1>
      <p>{check.message}</p>
      <ul>
        {data.allCryptoChainRule.nodes.map((chain) => (
          <li key={chain.ticker}>
            {chain.ticker} ({chain.name}) — Requires Memo: {String(chain.requiresMemo)}
          </li>
        ))}
      </ul>
    </main>
  );
}

export const query = graphql`
  query {
    allCryptoChainRule {
      nodes {
        ticker
        name
        requiresMemo
        memoName
        referenceUrl
      }
    }
  }
`;
```

## Documentation & Reference Links

- **Interactive Multi-Chain Address & Memo Validator**: [https://allswap.io/tools/address-validator](https://allswap.io/tools/address-validator)
- **AllSwap Cross-Chain Swap & Bridge Aggregator**: [https://allswap.io](https://allswap.io)
- **Technical Specification & Developer Docs**: [https://allswap.io/docs](https://allswap.io/docs)
- **Core CLI & Reproducible Test Suite (MIT)**: [https://github.com/zhangglnuo-art/multichain-memo-address-validator](https://github.com/zhangglnuo-art/multichain-memo-address-validator)

## License

MIT © [AllSwap Security Labs](https://allswap.io)
