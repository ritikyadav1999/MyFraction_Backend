// utils/globalStore.js

// Initial global state
const globalState = {
  transactionHash: null,
  currentInvestor: null,
  currentPropertyId: null,
  investmentAmount: null,
};

// Setters
const setTransactionHash = (hash) => {
  globalState.transactionHash = hash;
};

const setCurrentInvestor = (investor) => {
  globalState.currentInvestor = investor;
};

const setCurrentPropertyId = (propertyId) => {
  globalState.currentPropertyId = propertyId;
};

const setInvestmentAmount = (amount) => {
  globalState.investmentAmount = amount;
};

// Getters
const getTransactionHash = () => globalState.transactionHash;
const getCurrentInvestor = () => globalState.currentInvestor;
const getCurrentPropertyId = () => globalState.currentPropertyId;
const getInvestmentAmount = () => globalState.investmentAmount;

module.exports = {
  setTransactionHash,
  setCurrentInvestor,
  setCurrentPropertyId,
  setInvestmentAmount,
  getTransactionHash,
  getCurrentInvestor,
  getCurrentPropertyId,
  getInvestmentAmount,
};
