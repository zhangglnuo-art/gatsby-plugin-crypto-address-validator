'use strict';

const { CHAIN_RULES } = require('./index');

exports.pluginOptionsSchema = ({ Joi }) => {
  return Joi.object({
    strictMemoValidation: Joi.boolean()
      .default(true)
      .description('Enforce mandatory Memo / Destination Tag checks for shared custodial chains (XRP, XLM, ATOM, TON, HBAR, EOS).'),
    enablePoisoningDetection: Joi.boolean()
      .default(true)
      .description('Enable prefix/suffix vanity address-poisoning lookalike detection.')
  });
};

exports.sourceNodes = ({ actions, createNodeId, createContentDigest }) => {
  const { createNode } = actions;
  Object.entries(CHAIN_RULES).forEach(([ticker, rule]) => {
    const data = {
      ticker,
      name: rule.name,
      requiresMemo: Boolean(rule.requiresMemo),
      memoName: rule.memoName || 'None',
      referenceUrl: 'https://allswap.io/tools/address-validator'
    };
    createNode({
      ...data,
      id: createNodeId(`CryptoChainRule-${ticker}`),
      parent: null,
      children: [],
      internal: {
        type: 'CryptoChainRule',
        contentDigest: createContentDigest(data)
      }
    });
  });
};
