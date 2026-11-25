'use strict';

const CHAIN_RULES = {
  EVM:  { name: 'Ethereum / Arbitrum / Base / Optimism / Polygon / BNB (EVM)', regex: /^0x[a-fA-F0-9]{40}$/, requiresMemo: false, memoName: 'None' },
  BTC:  { name: 'Bitcoin (Legacy / SegWit / Taproot Bech32m)', regex: /^(1[a-km-zA-HJ-NP-Z1-9]{25,34}|3[a-km-zA-HJ-NP-Z1-9]{25,34}|bc1[qpzry9x8gf2tvdw0s3jn54khce6mua7l]{25,87})$/, requiresMemo: false, memoName: 'None' },
  SOL:  { name: 'Solana (Ed25519 Base58)', regex: /^[1-9A-HJ-NP-Za-km-z]{32,44}$/, requiresMemo: false, memoName: 'SPL Memo (Optional)' },
  XRP:  { name: 'XRP Ledger (XRPL)', regex: /^r[1-9A-HJ-NP-Za-km-z]{24,34}$/, requiresMemo: true, memoName: 'Destination Tag (32-bit unsigned int)', memoRegex: /^[0-9]{1,10}$/ },
  XLM:  { name: 'Stellar Lumens (StrKey)', regex: /^G[A-Z2-7]{55}$/, requiresMemo: true, memoName: 'Stellar Memo (up to 28 bytes)', memoRegex: /^.{1,28}$/ },
  ATOM: { name: 'Cosmos Hub (Bech32)', regex: /^cosmos1[qpzry9x8gf2tvdw0s3jn54khce6mua7l]{38}$/, requiresMemo: true, memoName: 'Cosmos Memo', memoRegex: /^.{1,256}$/ },
  TON:  { name: 'The Open Network (TON)', regex: /^((EQ|UQ)[A-Za-z0-9_-]{46}|(0|-1):[a-fA-F0-9]{64})$/, requiresMemo: true, memoName: 'TON Comment / Memo Tag', memoRegex: /^.{1,120}$/ },
  TRX:  { name: 'TRON (TVM Base58Check)', regex: /^T[1-9A-HJ-NP-Za-km-z]{33}$/, requiresMemo: false, memoName: 'None' },
  SUI:  { name: 'Sui Network', regex: /^0x[a-fA-F0-9]{64}$/, requiresMemo: false, memoName: 'None' },
  APT:  { name: 'Aptos Network', regex: /^0x[a-fA-F0-9]{1,64}$/, requiresMemo: false, memoName: 'None' },
  HBAR: { name: 'Hedera Hashgraph', regex: /^0\.0\.[1-9][0-9]{0,9}$/, requiresMemo: true, memoName: 'Hedera Memo (up to 100 bytes)', memoRegex: /^.{1,100}$/ },
  EOS:  { name: 'EOSIO / Vaulta', regex: /^[a-z1-5.]{1,12}$/, requiresMemo: true, memoName: 'EOS Memo', memoRegex: /^.{1,256}$/ }
};

function detectAddressPoisoning(candidate, trusted) {
  if (!candidate || !trusted) return false;
  const a = String(candidate).trim();
  const b = String(trusted).trim();
  if (a.toLowerCase() === b.toLowerCase() || a.length < 12 || b.length < 12) return false;
  const prefA = a.slice(0, 5).toLowerCase();
  const prefB = b.slice(0, 5).toLowerCase();
  const sufA  = a.slice(-4).toLowerCase();
  const sufB  = b.slice(-4).toLowerCase();
  return prefA === prefB && sufA === sufB;
}

function validateCryptoAddress(chain, address, memo = '', trustedAddress = '') {
  const code = String(chain || '').trim().toUpperCase();
  const rule = CHAIN_RULES[code];
  if (!rule) {
    return { valid: false, code: 'UNSUPPORTED_CHAIN', chain: code, message: `Unsupported blockchain ticker: ${code}` };
  }
  const cleanAddr = String(address || '').trim();
  const cleanMemo = String(memo || '').trim();
  if (!cleanAddr || !rule.regex.test(cleanAddr)) {
    return { valid: false, code: 'INVALID_ADDRESS_SYNTAX', chain: code, message: `Invalid ${rule.name} wallet address format.` };
  }
  if (rule.requiresMemo) {
    if (!cleanMemo) {
      return { valid: false, code: 'MISSING_MANDATORY_MEMO', chain: code, message: `${code} transfers require a mandatory ${rule.memoName}.` };
    }
    if (rule.memoRegex && !rule.memoRegex.test(cleanMemo)) {
      return { valid: false, code: 'INVALID_MEMO_FORMAT', chain: code, message: `Invalid ${rule.memoName} format for ${code}.` };
    }
  }
  if (trustedAddress && detectAddressPoisoning(cleanAddr, trustedAddress)) {
    return {
      valid: false,
      code: 'ADDRESS_POISONING_ALERT',
      chain: code,
      message: 'CRITICAL ALERT: Candidate address matches prefix and suffix of trusted reference address while differing in middle bytes.'
    };
  }
  return {
    valid: true,
    code: 'VALID_VERIFIED',
    chain: code,
    message: `Verified valid ${rule.name} address and routing configuration.`
  };
}

module.exports = {
  CHAIN_RULES,
  validateCryptoAddress,
  detectAddressPoisoning
};
