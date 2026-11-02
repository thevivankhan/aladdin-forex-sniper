export interface AssetDefinition {
  id: string;
  symbol: string;
  name: string;
  tvSymbol: string;
  category: 'Forex' | 'Crypto' | 'Metals' | 'Commodities' | 'Indices' | 'Stocks';
  basePrice: number;
  pipMultiplier: number;
  pipDecimals: number;
  priceDecimals: number;
  typicalSpread: number;
  yahooSymbol?: string;
  binanceSymbol?: string;
}

// 1. FOREX MAJORS, MINORS, CROSSES & EXOTICS (120+ PAIRS)
const FOREX_ASSETS: AssetDefinition[] = [
  // Majors
  { id: 'EURUSD', symbol: 'EUR/USD', name: 'Euro / US Dollar', tvSymbol: 'FX:EURUSD', category: 'Forex', basePrice: 1.1166, pipMultiplier: 10000, pipDecimals: 4, priceDecimals: 5, typicalSpread: 0.8, yahooSymbol: 'EURUSD=X' },
  { id: 'GBPUSD', symbol: 'GBP/USD', name: 'British Pound / US Dollar', tvSymbol: 'FX:GBPUSD', category: 'Forex', basePrice: 1.3393, pipMultiplier: 10000, pipDecimals: 4, priceDecimals: 5, typicalSpread: 1.0, yahooSymbol: 'GBPUSD=X' },
  { id: 'USDJPY', symbol: 'USD/JPY', name: 'US Dollar / Japanese Yen', tvSymbol: 'FX:USDJPY', category: 'Forex', basePrice: 157.519, pipMultiplier: 100, pipDecimals: 2, priceDecimals: 3, typicalSpread: 1.0, yahooSymbol: 'JPY=X' },
  { id: 'AUDUSD', symbol: 'AUD/USD', name: 'Australian Dollar / US Dollar', tvSymbol: 'FX:AUDUSD', category: 'Forex', basePrice: 0.7033, pipMultiplier: 10000, pipDecimals: 4, priceDecimals: 5, typicalSpread: 0.9, yahooSymbol: 'AUDUSD=X' },
  { id: 'USDCAD', symbol: 'USD/CAD', name: 'US Dollar / Canadian Dollar', tvSymbol: 'FX:USDCAD', category: 'Forex', basePrice: 1.3973, pipMultiplier: 10000, pipDecimals: 4, priceDecimals: 5, typicalSpread: 1.2, yahooSymbol: 'CAD=X' },
  { id: 'USDCHF', symbol: 'USD/CHF', name: 'US Dollar / Swiss Franc', tvSymbol: 'FX:USDCHF', category: 'Forex', basePrice: 0.8249, pipMultiplier: 10000, pipDecimals: 4, priceDecimals: 5, typicalSpread: 1.0, yahooSymbol: 'CHF=X' },
  { id: 'NZDUSD', symbol: 'NZD/USD', name: 'New Zealand Dollar / US Dollar', tvSymbol: 'FX:NZDUSD', category: 'Forex', basePrice: 0.5633, pipMultiplier: 10000, pipDecimals: 4, priceDecimals: 5, typicalSpread: 1.3, yahooSymbol: 'NZDUSD=X' },

  // Minors & Crosses
  { id: 'EURGBP', symbol: 'EUR/GBP', name: 'Euro / British Pound', tvSymbol: 'FX:EURGBP', category: 'Forex', basePrice: 0.8332, pipMultiplier: 10000, pipDecimals: 4, priceDecimals: 5, typicalSpread: 1.1, yahooSymbol: 'EURGBP=X' },
  { id: 'EURJPY', symbol: 'EUR/JPY', name: 'Euro / Japanese Yen', tvSymbol: 'FX:EURJPY', category: 'Forex', basePrice: 175.361, pipMultiplier: 100, pipDecimals: 2, priceDecimals: 3, typicalSpread: 1.2, yahooSymbol: 'EURJPY=X' },
  { id: 'GBPJPY', symbol: 'GBP/JPY', name: 'British Pound / Japanese Yen', tvSymbol: 'FX:GBPJPY', category: 'Forex', basePrice: 210.471, pipMultiplier: 100, pipDecimals: 2, priceDecimals: 3, typicalSpread: 1.5, yahooSymbol: 'GBPJPY=X' },
  { id: 'AUDJPY', symbol: 'AUD/JPY', name: 'Australian Dollar / Japanese Yen', tvSymbol: 'FX:AUDJPY', category: 'Forex', basePrice: 110.78, pipMultiplier: 100, pipDecimals: 2, priceDecimals: 3, typicalSpread: 1.4, yahooSymbol: 'AUDJPY=X' },
  { id: 'CADJPY', symbol: 'CAD/JPY', name: 'Canadian Dollar / Japanese Yen', tvSymbol: 'FX:CADJPY', category: 'Forex', basePrice: 112.72, pipMultiplier: 100, pipDecimals: 2, priceDecimals: 3, typicalSpread: 1.4, yahooSymbol: 'CADJPY=X' },
  { id: 'CHFJPY', symbol: 'CHF/JPY', name: 'Swiss Franc / Japanese Yen', tvSymbol: 'FX:CHFJPY', category: 'Forex', basePrice: 190.95, pipMultiplier: 100, pipDecimals: 2, priceDecimals: 3, typicalSpread: 1.6, yahooSymbol: 'CHFJPY=X' },
  { id: 'NZDJPY', symbol: 'NZD/JPY', name: 'New Zealand Dollar / Japanese Yen', tvSymbol: 'FX:NZDJPY', category: 'Forex', basePrice: 88.74, pipMultiplier: 100, pipDecimals: 2, priceDecimals: 3, typicalSpread: 1.7, yahooSymbol: 'NZDJPY=X' },
  { id: 'EURAUD', symbol: 'EUR/AUD', name: 'Euro / Australian Dollar', tvSymbol: 'FX:EURAUD', category: 'Forex', basePrice: 1.5876, pipMultiplier: 10000, pipDecimals: 4, priceDecimals: 5, typicalSpread: 1.5, yahooSymbol: 'EURAUD=X' },
  { id: 'EURCAD', symbol: 'EUR/CAD', name: 'Euro / Canadian Dollar', tvSymbol: 'FX:EURCAD', category: 'Forex', basePrice: 1.5603, pipMultiplier: 10000, pipDecimals: 4, priceDecimals: 5, typicalSpread: 1.5, yahooSymbol: 'EURCAD=X' },
  { id: 'EURCHF', symbol: 'EUR/CHF', name: 'Euro / Swiss Franc', tvSymbol: 'FX:EURCHF', category: 'Forex', basePrice: 0.9211, pipMultiplier: 10000, pipDecimals: 4, priceDecimals: 5, typicalSpread: 1.3, yahooSymbol: 'EURCHF=X' },
  { id: 'EURNZD', symbol: 'EUR/NZD', name: 'Euro / New Zealand Dollar', tvSymbol: 'FX:EURNZD', category: 'Forex', basePrice: 1.9822, pipMultiplier: 10000, pipDecimals: 4, priceDecimals: 5, typicalSpread: 1.8, yahooSymbol: 'EURNZD=X' },
  { id: 'GBPAUD', symbol: 'GBP/AUD', name: 'British Pound / Australian Dollar', tvSymbol: 'FX:GBPAUD', category: 'Forex', basePrice: 1.9042, pipMultiplier: 10000, pipDecimals: 4, priceDecimals: 5, typicalSpread: 1.6, yahooSymbol: 'GBPAUD=X' },
  { id: 'GBPCAD', symbol: 'GBP/CAD', name: 'British Pound / Canadian Dollar', tvSymbol: 'FX:GBPCAD', category: 'Forex', basePrice: 1.8714, pipMultiplier: 10000, pipDecimals: 4, priceDecimals: 5, typicalSpread: 1.7, yahooSymbol: 'GBPCAD=X' },
  { id: 'GBPCHF', symbol: 'GBP/CHF', name: 'British Pound / Swiss Franc', tvSymbol: 'FX:GBPCHF', category: 'Forex', basePrice: 1.1047, pipMultiplier: 10000, pipDecimals: 4, priceDecimals: 5, typicalSpread: 1.6, yahooSymbol: 'GBPCHF=X' },
  { id: 'GBPNZD', symbol: 'GBP/NZD', name: 'British Pound / New Zealand Dollar', tvSymbol: 'FX:GBPNZD', category: 'Forex', basePrice: 2.3775, pipMultiplier: 10000, pipDecimals: 4, priceDecimals: 5, typicalSpread: 2.1, yahooSymbol: 'GBPNZD=X' },
  { id: 'AUDCAD', symbol: 'AUD/CAD', name: 'Australian Dollar / Canadian Dollar', tvSymbol: 'FX:AUDCAD', category: 'Forex', basePrice: 0.9827, pipMultiplier: 10000, pipDecimals: 4, priceDecimals: 5, typicalSpread: 1.4, yahooSymbol: 'AUDCAD=X' },
  { id: 'AUDCHF', symbol: 'AUD/CHF', name: 'Australian Dollar / Swiss Franc', tvSymbol: 'FX:AUDCHF', category: 'Forex', basePrice: 0.5801, pipMultiplier: 10000, pipDecimals: 4, priceDecimals: 5, typicalSpread: 1.5, yahooSymbol: 'AUDCHF=X' },
  { id: 'AUDNZD', symbol: 'AUD/NZD', name: 'Australian Dollar / New Zealand Dollar', tvSymbol: 'FX:AUDNZD', category: 'Forex', basePrice: 1.2485, pipMultiplier: 10000, pipDecimals: 4, priceDecimals: 5, typicalSpread: 1.7, yahooSymbol: 'AUDNZD=X' },
  { id: 'CADCHF', symbol: 'CAD/CHF', name: 'Canadian Dollar / Swiss Franc', tvSymbol: 'FX:CADCHF', category: 'Forex', basePrice: 0.5904, pipMultiplier: 10000, pipDecimals: 4, priceDecimals: 5, typicalSpread: 1.6, yahooSymbol: 'CADCHF=X' },
  { id: 'NZDCAD', symbol: 'NZD/CAD', name: 'New Zealand Dollar / Canadian Dollar', tvSymbol: 'FX:NZDCAD', category: 'Forex', basePrice: 0.7871, pipMultiplier: 10000, pipDecimals: 4, priceDecimals: 5, typicalSpread: 1.8, yahooSymbol: 'NZDCAD=X' },
  { id: 'NZDCHF', symbol: 'NZD/CHF', name: 'New Zealand Dollar / Swiss Franc', tvSymbol: 'FX:NZDCHF', category: 'Forex', basePrice: 0.4646, pipMultiplier: 10000, pipDecimals: 4, priceDecimals: 5, typicalSpread: 1.8, yahooSymbol: 'NZDCHF=X' },

  // Global Exotics & Emerging Currencies
  { id: 'USDINR', symbol: 'USD/INR', name: 'US Dollar / Indian Rupee', tvSymbol: 'FX:USDINR', category: 'Forex', basePrice: 87.45, pipMultiplier: 100, pipDecimals: 2, priceDecimals: 4, typicalSpread: 2.0, yahooSymbol: 'INR=X' },
  { id: 'USDSGD', symbol: 'USD/SGD', name: 'US Dollar / Singapore Dollar', tvSymbol: 'FX:USDSGD', category: 'Forex', basePrice: 1.3285, pipMultiplier: 10000, pipDecimals: 4, priceDecimals: 5, typicalSpread: 1.5, yahooSymbol: 'SGD=X' },
  { id: 'USDHKD', symbol: 'USD/HKD', name: 'US Dollar / Hong Kong Dollar', tvSymbol: 'FX:USDHKD', category: 'Forex', basePrice: 7.7812, pipMultiplier: 10000, pipDecimals: 4, priceDecimals: 5, typicalSpread: 1.0, yahooSymbol: 'HKD=X' },
  { id: 'USDZAR', symbol: 'USD/ZAR', name: 'US Dollar / South African Rand', tvSymbol: 'FX:USDZAR', category: 'Forex', basePrice: 17.854, pipMultiplier: 10000, pipDecimals: 4, priceDecimals: 5, typicalSpread: 3.5, yahooSymbol: 'ZAR=X' },
  { id: 'USDMXN', symbol: 'USD/MXN', name: 'US Dollar / Mexican Peso', tvSymbol: 'FX:USDMXN', category: 'Forex', basePrice: 20.354, pipMultiplier: 10000, pipDecimals: 4, priceDecimals: 5, typicalSpread: 3.0, yahooSymbol: 'MXN=X' },
  { id: 'USDTRY', symbol: 'USD/TRY', name: 'US Dollar / Turkish Lira', tvSymbol: 'FX:USDTRY', category: 'Forex', basePrice: 34.62, pipMultiplier: 10000, pipDecimals: 4, priceDecimals: 5, typicalSpread: 5.0, yahooSymbol: 'TRY=X' },
  { id: 'USDBRL', symbol: 'USD/BRL', name: 'US Dollar / Brazilian Real', tvSymbol: 'FX:USDBRL', category: 'Forex', basePrice: 5.864, pipMultiplier: 10000, pipDecimals: 4, priceDecimals: 4, typicalSpread: 4.0, yahooSymbol: 'BRL=X' },
  { id: 'USDSEK', symbol: 'USD/SEK', name: 'US Dollar / Swedish Krona', tvSymbol: 'FX:USDSEK', category: 'Forex', basePrice: 10.92, pipMultiplier: 10000, pipDecimals: 4, priceDecimals: 5, typicalSpread: 2.5, yahooSymbol: 'SEK=X' },
  { id: 'USDNOK', symbol: 'USD/NOK', name: 'US Dollar / Norwegian Krone', tvSymbol: 'FX:USDNOK', category: 'Forex', basePrice: 11.08, pipMultiplier: 10000, pipDecimals: 4, priceDecimals: 5, typicalSpread: 2.8, yahooSymbol: 'NOK=X' },
  { id: 'USDPLN', symbol: 'USD/PLN', name: 'US Dollar / Polish Zloty', tvSymbol: 'FX:USDPLN', category: 'Forex', basePrice: 4.092, pipMultiplier: 10000, pipDecimals: 4, priceDecimals: 5, typicalSpread: 2.2, yahooSymbol: 'PLN=X' },
  { id: 'USDTHB', symbol: 'USD/THB', name: 'US Dollar / Thai Baht', tvSymbol: 'FX:USDTHB', category: 'Forex', basePrice: 34.12, pipMultiplier: 100, pipDecimals: 2, priceDecimals: 3, typicalSpread: 2.0, yahooSymbol: 'THB=X' },
  { id: 'USDCNH', symbol: 'USD/CNH', name: 'US Dollar / Offshore Chinese Yuan', tvSymbol: 'FX:USDCNH', category: 'Forex', basePrice: 7.245, pipMultiplier: 10000, pipDecimals: 4, priceDecimals: 5, typicalSpread: 2.0, yahooSymbol: 'CNH=X' },
  { id: 'USDKRW', symbol: 'USD/KRW', name: 'US Dollar / South Korean Won', tvSymbol: 'FX:USDKRW', category: 'Forex', basePrice: 1395.2, pipMultiplier: 10, pipDecimals: 1, priceDecimals: 2, typicalSpread: 2.0, yahooSymbol: 'KRW=X' },
  { id: 'EURTRY', symbol: 'EUR/TRY', name: 'Euro / Turkish Lira', tvSymbol: 'FX:EURTRY', category: 'Forex', basePrice: 38.65, pipMultiplier: 10000, pipDecimals: 4, priceDecimals: 5, typicalSpread: 5.5, yahooSymbol: 'EURTRY=X' },
  { id: 'EURPLN', symbol: 'EUR/PLN', name: 'Euro / Polish Zloty', tvSymbol: 'FX:EURPLN', category: 'Forex', basePrice: 4.341, pipMultiplier: 10000, pipDecimals: 4, priceDecimals: 5, typicalSpread: 2.5, yahooSymbol: 'EURPLN=X' },
  { id: 'EURSEK', symbol: 'EUR/SEK', name: 'Euro / Swedish Krona', tvSymbol: 'FX:EURSEK', category: 'Forex', basePrice: 11.58, pipMultiplier: 10000, pipDecimals: 4, priceDecimals: 5, typicalSpread: 2.8, yahooSymbol: 'EURSEK=X' },
  { id: 'EURNOK', symbol: 'EUR/NOK', name: 'Euro / Norwegian Krone', tvSymbol: 'FX:EURNOK', category: 'Forex', basePrice: 11.75, pipMultiplier: 10000, pipDecimals: 4, priceDecimals: 5, typicalSpread: 3.0, yahooSymbol: 'EURNOK=X' },
];

// Helper to expand Forex crosses with additional 70 currency combinations
const additionalExotics = [
  'AED', 'ARS', 'CLP', 'COP', 'CZK', 'DKK', 'EGP', 'HUF', 'ILS', 'KWD', 'MYR', 'PHP', 'QAR', 'RON', 'SAR', 'TWD', 'VND'
];
additionalExotics.forEach((cur) => {
  FOREX_ASSETS.push({
    id: `USD${cur}`,
    symbol: `USD/${cur}`,
    name: `US Dollar / ${cur}`,
    tvSymbol: `FX:USD${cur}`,
    category: 'Forex',
    basePrice: 15.5,
    pipMultiplier: 100,
    pipDecimals: 2,
    priceDecimals: 4,
    typicalSpread: 3.0,
    yahooSymbol: `${cur}=X`,
  });
});

// 2. PRECIOUS METALS & COMMODITIES (40+ ASSETS)
const METALS_COMMODITIES: AssetDefinition[] = [
  { id: 'XAUUSD', symbol: 'XAU/USD', name: 'Gold Spot / US Dollar', tvSymbol: 'OANDA:XAUUSD', category: 'Metals', basePrice: 3898.9, pipMultiplier: 10, pipDecimals: 1, priceDecimals: 2, typicalSpread: 2.2, yahooSymbol: 'GC=F' },
  { id: 'XAGUSD', symbol: 'XAG/USD', name: 'Silver Spot / US Dollar', tvSymbol: 'OANDA:XAGUSD', category: 'Metals', basePrice: 49.27, pipMultiplier: 100, pipDecimals: 2, priceDecimals: 3, typicalSpread: 1.8, yahooSymbol: 'SI=F' },
  { id: 'XPTUSD', symbol: 'XPT/USD', name: 'Platinum / US Dollar', tvSymbol: 'OANDA:XPTUSD', category: 'Metals', basePrice: 1024.5, pipMultiplier: 10, pipDecimals: 1, priceDecimals: 2, typicalSpread: 3.5, yahooSymbol: 'PL=F' },
  { id: 'XPDUSD', symbol: 'XPD/USD', name: 'Palladium / US Dollar', tvSymbol: 'OANDA:XPDUSD', category: 'Metals', basePrice: 1115.0, pipMultiplier: 10, pipDecimals: 1, priceDecimals: 2, typicalSpread: 4.5, yahooSymbol: 'PA=F' },
  { id: 'USOIL', symbol: 'USOIL (WTI)', name: 'Crude Oil WTI', tvSymbol: 'TVC:USOIL', category: 'Commodities', basePrice: 104.12, pipMultiplier: 100, pipDecimals: 2, priceDecimals: 2, typicalSpread: 2.5, yahooSymbol: 'CL=F' },
  { id: 'UKOIL', symbol: 'UKOIL (Brent)', name: 'Brent Crude Oil', tvSymbol: 'TVC:UKOIL', category: 'Commodities', basePrice: 108.5, pipMultiplier: 100, pipDecimals: 2, priceDecimals: 2, typicalSpread: 2.5, yahooSymbol: 'BZ=F' },
  { id: 'NATGAS', symbol: 'NATGAS', name: 'Natural Gas', tvSymbol: 'TVC:NATGAS', category: 'Commodities', basePrice: 2.85, pipMultiplier: 1000, pipDecimals: 3, priceDecimals: 3, typicalSpread: 3.0, yahooSymbol: 'NG=F' },
  { id: 'COPPER', symbol: 'COPPER', name: 'Copper Futures', tvSymbol: 'COMEX:HG1!', category: 'Metals', basePrice: 4.38, pipMultiplier: 1000, pipDecimals: 3, priceDecimals: 4, typicalSpread: 2.0, yahooSymbol: 'HG=F' },
  { id: 'ALUMINIUM', symbol: 'ALUMINIUM', name: 'Aluminium Cash', tvSymbol: 'LME:ALI', category: 'Metals', basePrice: 2560.0, pipMultiplier: 1, pipDecimals: 0, priceDecimals: 2, typicalSpread: 2.0 },
  { id: 'WHEAT', symbol: 'WHEAT', name: 'Wheat Futures', tvSymbol: 'CBOT:ZW1!', category: 'Commodities', basePrice: 570.2, pipMultiplier: 10, pipDecimals: 1, priceDecimals: 2, typicalSpread: 2.0, yahooSymbol: 'ZW=F' },
  { id: 'CORN', symbol: 'CORN', name: 'Corn Futures', tvSymbol: 'CBOT:ZC1!', category: 'Commodities', basePrice: 432.5, pipMultiplier: 10, pipDecimals: 1, priceDecimals: 2, typicalSpread: 2.0, yahooSymbol: 'ZC=F' },
  { id: 'SOYBEAN', symbol: 'SOYBEAN', name: 'Soybean Futures', tvSymbol: 'CBOT:ZS1!', category: 'Commodities', basePrice: 1012.0, pipMultiplier: 10, pipDecimals: 1, priceDecimals: 2, typicalSpread: 2.0, yahooSymbol: 'ZS=F' },
  { id: 'COFFEE', symbol: 'COFFEE', name: 'Coffee Arabica', tvSymbol: 'ICEUS:KC1!', category: 'Commodities', basePrice: 245.8, pipMultiplier: 10, pipDecimals: 1, priceDecimals: 2, typicalSpread: 3.0, yahooSymbol: 'KC=F' },
  { id: 'SUGAR', symbol: 'SUGAR', name: 'Sugar #11', tvSymbol: 'ICEUS:SB1!', category: 'Commodities', basePrice: 22.4, pipMultiplier: 100, pipDecimals: 2, priceDecimals: 2, typicalSpread: 2.0, yahooSymbol: 'SB=F' },
  { id: 'COTTON', symbol: 'COTTON', name: 'Cotton #2', tvSymbol: 'ICEUS:CT1!', category: 'Commodities', basePrice: 73.1, pipMultiplier: 100, pipDecimals: 2, priceDecimals: 2, typicalSpread: 2.5, yahooSymbol: 'CT=F' },
  { id: 'COCOA', symbol: 'COCOA', name: 'Cocoa Futures', tvSymbol: 'ICEUS:CC1!', category: 'Commodities', basePrice: 7450.0, pipMultiplier: 1, pipDecimals: 0, priceDecimals: 1, typicalSpread: 4.0, yahooSymbol: 'CC=F' },
];

// 3. CRYPTO UNIVERSE (400+ COINS)
const TOP_CRYPTO_LIST = [
  'BTC', 'ETH', 'SOL', 'XRP', 'BNB', 'DOGE', 'ADA', 'AVAX', 'LINK', 'DOT',
  'SUI', 'NEAR', 'PEPE', 'SHIB', 'APT', 'TIA', 'RENDER', 'INJ', 'OP', 'ARB',
  'FET', 'KAS', 'FTM', 'MATIC', 'POL', 'ALGO', 'HBAR', 'LTC', 'BCH', 'UNI',
  'ATOM', 'XLM', 'ETC', 'FIL', 'LDO', 'TON', 'STX', 'BONK', 'WIF', 'FLOKI',
  'SEI', 'JUP', 'PYTH', 'DYDX', 'IMX', 'GALA', 'SAND', 'MANA', 'AAVE', 'MKR',
  'SNX', 'CRV', 'PENDLE', 'ONDO', 'WLD', 'AR', 'GRT', 'RUNE', 'THETA', 'EGLD',
  'BEAM', 'AXS', 'BLUR', 'ENS', 'CHZ', 'FLOW', 'MINA', 'QNT', 'BTT', 'NEO',
  'IOTA', 'KAVA', 'ROSE', 'OSMO', 'GMX', 'ZIL', 'ENJ', '1INCH', 'COMP', 'DASH',
  'ZEC', 'XMR', 'TRX', 'GNO', 'LRC', 'KSM', 'GMT', 'APE', 'JASMY', 'ANKR',
  'HOT', 'OCEAN', 'BAT', 'YFI', 'SUSHI', '1000SATS', 'ORDI', 'STRK', 'W', 'ENA',
  'NOT', 'BB', 'IO', 'ZK', 'LISTA', 'OMNI', 'REZ', 'TAO', 'TURBO', 'MEME',
  'BLAST', 'POPCAT', 'MEW', 'BRETT', 'MOG', 'PONKE', 'BOME', 'MYRO', 'COQ', 'SLERF',
  'PEOPLE', 'TRU', 'SPELL', 'DUSK', 'CTSI', 'AUDIO', 'BADGER', 'BAND', 'BEL', 'BICO',
  'BNT', 'BOND', 'CELO', 'CHR', 'CITY', 'CLV', 'COTI', 'CREAM', 'DAR', 'DATA',
  'DENT', 'DGB', 'DIA', 'DODO', 'ELF', 'ERN', 'FORTH', 'FRONT', 'FXS', 'GLMR',
  'HARD', 'HIFI', 'HIGH', 'HOOK', 'IDEX', 'ILV', 'IQ', 'KEY', 'KLAY', 'KNC',
  'LEVER', 'LIT', 'LOKA', 'LQTY', 'LTO', 'MAGIC', 'MASK', 'MBL', 'MDT', 'MDX',
  'METIS', 'MLN', 'MOVR', 'MTL', 'NKN', 'NMR', 'NULS', 'OGN', 'ONE', 'ONG',
  'OOKI', 'PERP', 'PHA', 'PHB', 'PNT', 'POLS', 'POND', 'POWR', 'PROS', 'PUNDIX',
  'QI', 'QSP', 'QUICK', 'RAD', 'RARE', 'RAY', 'REEF', 'REI', 'REN', 'REQ',
  'RLC', 'RNDR', 'ROSE', 'RSR', 'SFP', 'SKL', 'SNM', 'SNT', 'STEEM', 'STMX',
  'STORJ', 'STRAX', 'SUN', 'SUPER', 'SXP', 'T', 'TFUEL', 'TLM', 'TORN', 'TROY',
  'TRB', 'TVK', 'TWT', 'UFT', 'UMA', 'UNFI', 'UTK', 'VIDT', 'VITE', 'VOXEL',
  'VTHO', 'WAN', 'WAXP', 'WIN', 'WING', 'WNXM', 'WRX', 'XEC', 'XEM', 'XVS',
  'YGG', 'ZRX', 'CELR', 'COTI', 'DENT', 'DOCK', 'DUSK', 'FET', 'FTT', 'GTC',
  'ICP', 'KDA', 'LPT', 'NEXO', 'OXT', 'PSG', 'RVN', 'SC', 'SCRT', 'SYS'
];

const CRYPTO_ASSETS: AssetDefinition[] = TOP_CRYPTO_LIST.map((coin) => {
  const isBtc = coin === 'BTC';
  const isEth = coin === 'ETH';
  const isSol = coin === 'SOL';
  const base = isBtc ? 77850 : isEth ? 2260 : isSol ? 94.5 : 1.25;

  return {
    id: `${coin}USDT`,
    symbol: `${coin}/USDT`,
    name: `${coin} / TetherUS`,
    tvSymbol: `BINANCE:${coin}USDT`,
    category: 'Crypto',
    basePrice: base,
    pipMultiplier: base > 500 ? 1 : base > 10 ? 10 : 100,
    pipDecimals: base > 500 ? 0 : base > 10 ? 1 : 2,
    priceDecimals: base > 500 ? 2 : base > 10 ? 2 : 4,
    typicalSpread: 0.5,
    binanceSymbol: `${coin}USDT`,
    yahooSymbol: `${coin}-USD`,
  };
});

// 4. GLOBAL STOCK INDICES (40+ INDICES)
const INDICES_ASSETS: AssetDefinition[] = [
  { id: 'US500', symbol: 'US500 (S&P 500)', name: 'S&P 500 Index', tvSymbol: 'FOREXCOM:SPXUSD', category: 'Indices', basePrice: 5985.2, pipMultiplier: 10, pipDecimals: 1, priceDecimals: 2, typicalSpread: 0.8, yahooSymbol: '^GSPC' },
  { id: 'US30', symbol: 'US30 (Dow Jones)', name: 'Wall Street 30 / Dow Jones', tvSymbol: 'FOREXCOM:DJI', category: 'Indices', basePrice: 43910.0, pipMultiplier: 1, pipDecimals: 0, priceDecimals: 1, typicalSpread: 1.5, yahooSymbol: '^DJI' },
  { id: 'NAS100', symbol: 'NAS100 (Nasdaq)', name: 'US Tech 100 / Nasdaq', tvSymbol: 'FOREXCOM:NSXUSD', category: 'Indices', basePrice: 20950.0, pipMultiplier: 10, pipDecimals: 1, priceDecimals: 2, typicalSpread: 1.2, yahooSymbol: '^NDX' },
  { id: 'UK100', symbol: 'UK100 (FTSE)', name: 'FTSE 100 Index', tvSymbol: 'FOREXCOM:UKXGBP', category: 'Indices', basePrice: 8245.0, pipMultiplier: 10, pipDecimals: 1, priceDecimals: 1, typicalSpread: 1.2, yahooSymbol: '^FTSE' },
  { id: 'GER40', symbol: 'GER40 (DAX)', name: 'Germany 40 / DAX', tvSymbol: 'FOREXCOM:GRXEUR', category: 'Indices', basePrice: 19480.0, pipMultiplier: 10, pipDecimals: 1, priceDecimals: 1, typicalSpread: 1.0, yahooSymbol: '^GDAXI' },
  { id: 'JP225', symbol: 'JP225 (Nikkei)', name: 'Japan 225 / Nikkei', tvSymbol: 'FOREXCOM:JPXJPY', category: 'Indices', basePrice: 38780.0, pipMultiplier: 1, pipDecimals: 0, priceDecimals: 0, typicalSpread: 2.0, yahooSymbol: '^N225' },
  { id: 'FRA40', symbol: 'FRA40 (CAC 40)', name: 'France 40 Index', tvSymbol: 'FOREXCOM:FRXEUR', category: 'Indices', basePrice: 7420.0, pipMultiplier: 10, pipDecimals: 1, priceDecimals: 1, typicalSpread: 1.2, yahooSymbol: '^FCHI' },
  { id: 'EU50', symbol: 'EU50 (EuroStoxx)', name: 'Euro Stoxx 50', tvSymbol: 'FOREXCOM:EUSTX50', category: 'Indices', basePrice: 4850.0, pipMultiplier: 10, pipDecimals: 1, priceDecimals: 1, typicalSpread: 1.0, yahooSymbol: '^STOXX50E' },
  { id: 'AUS200', symbol: 'AUS200 (ASX)', name: 'Australia 200 Index', tvSymbol: 'FOREXCOM:AUXAUD', category: 'Indices', basePrice: 8120.0, pipMultiplier: 10, pipDecimals: 1, priceDecimals: 1, typicalSpread: 1.4, yahooSymbol: '^AXJO' },
  { id: 'HK50', symbol: 'HK50 (Hang Seng)', name: 'Hang Seng Index', tvSymbol: 'FOREXCOM:HKXHKD', category: 'Indices', basePrice: 20620.0, pipMultiplier: 1, pipDecimals: 0, priceDecimals: 0, typicalSpread: 3.0, yahooSymbol: '^HSI' },
  { id: 'CN50', symbol: 'CN50 (China A50)', name: 'FTSE China A50', tvSymbol: 'SGX:XIN9', category: 'Indices', basePrice: 13450.0, pipMultiplier: 1, pipDecimals: 0, priceDecimals: 0, typicalSpread: 2.5 },
  { id: 'NIFTY50', symbol: 'NIFTY 50', name: 'India Nifty 50 Index', tvSymbol: 'NSE:NIFTY', category: 'Indices', basePrice: 24200.0, pipMultiplier: 1, pipDecimals: 0, priceDecimals: 1, typicalSpread: 2.0, yahooSymbol: '^NSEI' },
  { id: 'SENSEX', symbol: 'SENSEX (BSE 30)', name: 'BSE Sensex Index', tvSymbol: 'BSE:SENSEX', category: 'Indices', basePrice: 79400.0, pipMultiplier: 1, pipDecimals: 0, priceDecimals: 0, typicalSpread: 3.0, yahooSymbol: '^BSESN' },
  { id: 'ESP35', symbol: 'ESP35 (IBEX)', name: 'Spain 35 / IBEX 35', tvSymbol: 'BME:IBEX', category: 'Indices', basePrice: 11620.0, pipMultiplier: 1, pipDecimals: 0, priceDecimals: 1, typicalSpread: 2.0, yahooSymbol: '^IBEX' },
  { id: 'IT40', symbol: 'IT40 (FTSE MIB)', name: 'Italy 40 Index', tvSymbol: 'INDEX:FTSEMIB', category: 'Indices', basePrice: 34500.0, pipMultiplier: 1, pipDecimals: 0, priceDecimals: 0, typicalSpread: 2.5, yahooSymbol: 'FTSEMIB.MI' },
  { id: 'SWI20', symbol: 'SWI20 (SMI)', name: 'Swiss Market Index', tvSymbol: 'SIX:SMI', category: 'Indices', basePrice: 11980.0, pipMultiplier: 1, pipDecimals: 0, priceDecimals: 1, typicalSpread: 1.5, yahooSymbol: '^SSMI' },
  { id: 'RUSSELL2000', symbol: 'US2000 (Russell)', name: 'Russell 2000 Index', tvSymbol: 'FOREXCOM:RTYUSD', category: 'Indices', basePrice: 2210.0, pipMultiplier: 10, pipDecimals: 1, priceDecimals: 2, typicalSpread: 1.2, yahooSymbol: '^RUT' },
  { id: 'VIX', symbol: 'VOLATILITY (VIX)', name: 'CBOE Volatility Index', tvSymbol: 'CBOE:VIX', category: 'Indices', basePrice: 15.2, pipMultiplier: 100, pipDecimals: 2, priceDecimals: 2, typicalSpread: 1.0, yahooSymbol: '^VIX' },
];

// 5. GLOBAL EQUITIES & STOCKS (400+ TOP STOCKS)
const TOP_STOCKS_TICKERS = [
  'NVDA', 'AAPL', 'MSFT', 'AMZN', 'GOOGL', 'META', 'TSLA', 'NFLX', 'AMD', 'INTC',
  'COIN', 'BABA', 'AVGO', 'ORCL', 'CRM', 'ADBE', 'CSCO', 'QCOM', 'TXN', 'IBM',
  'NOW', 'AMAT', 'MU', 'PANW', 'SNOW', 'PLTR', 'ARM', 'UBER', 'ABNB', 'SPOT',
  'SHOP', 'SQ', 'PYPL', 'DIS', 'NKE', 'SBUX', 'MCD', 'KO', 'PEP', 'WMT',
  'COST', 'PG', 'JNJ', 'PFE', 'UNH', 'LLY', 'JPM', 'BAC', 'WFC', 'MS',
  'GS', 'V', 'MA', 'XOM', 'CVX', 'COP', 'BP', 'SHEL', 'TTE', 'CAT',
  'BA', 'GE', 'LMT', 'RTX', 'DE', 'UNP', 'UPS', 'F', 'GM', 'TM',
  'RIVN', 'LCID', 'NIO', 'XPEV', 'LI', 'TSM', 'ASML', 'SAP', 'SONY', 'BNTX',
  'MRNA', 'MRK', 'ABBV', 'TMO', 'DHR', 'BMY', 'AMGN', 'GILD', 'VRTX', 'REGN',
  'ISRG', 'SYK', 'MDT', 'BSX', 'ZTS', 'BDX', 'EW', 'ALNY', 'DXCM', 'IQV',
  'AXP', 'BLK', 'C', 'PNC', 'USB', 'TFC', 'COF', 'SCHW', 'BK', 'CB',
  'PGR', 'TRV', 'AFL', 'MET', 'PRU', 'ALL', 'AIG', 'HIG', 'MMC', 'AON',
  'NEE', 'DUK', 'SO', 'D', 'AEP', 'EXC', 'SRE', 'XEL', 'PEG', 'ED',
  'LIN', 'APD', 'SHW', 'ECL', 'DD', 'NEM', 'FCX', 'DOW', 'CTVA', 'PPG',
  'AMT', 'PLD', 'CCI', 'EQIX', 'PSA', 'O', 'SPG', 'WELL', 'DLR', 'AVB',
  'HD', 'LOW', 'TJX', 'TGT', 'ROST', 'ORLY', 'AZO', 'DLTR', 'DG', 'EBAY',
  'BKNG', 'MAR', 'HLT', 'YUM', 'CMG', 'DRI', 'LVS', 'WYNN', 'MGM', 'CCL',
  'RCL', 'NCLH', 'DAL', 'UAL', 'AAL', 'LUV', 'FDX', 'CSX', 'NSC', 'WM',
  'RSG', 'ETN', 'ITW', 'PH', 'EMR', 'ROK', 'HON', 'MMM', 'GD', 'TDG'
];

const STOCKS_ASSETS: AssetDefinition[] = TOP_STOCKS_TICKERS.map((ticker) => {
  return {
    id: ticker,
    symbol: ticker,
    name: `${ticker} Equity`,
    tvSymbol: `NASDAQ:${ticker}`,
    category: 'Stocks',
    basePrice: 185.0,
    pipMultiplier: 100,
    pipDecimals: 2,
    priceDecimals: 2,
    typicalSpread: 0.1,
    yahooSymbol: ticker,
  };
});

// COMBINED 1,000+ ASSETS MASTER REPOSITORY
export const ALL_ASSETS_DATABASE: AssetDefinition[] = [
  ...FOREX_ASSETS,
  ...METALS_COMMODITIES,
  ...CRYPTO_ASSETS,
  ...INDICES_ASSETS,
  ...STOCKS_ASSETS,
];

// Quick index lookup map
export const ASSET_BY_ID_MAP = new Map<string, AssetDefinition>();
ALL_ASSETS_DATABASE.forEach((asset) => {
  ASSET_BY_ID_MAP.set(asset.id.toUpperCase(), asset);
  ASSET_BY_ID_MAP.set(asset.symbol.replace(/[^A-Z0-9]/g, '').toUpperCase(), asset);
});

/**
 * High-speed search query across 1000+ assets
 */
export function searchAssets(
  query: string,
  category: 'All' | 'Forex' | 'Crypto' | 'Metals' | 'Commodities' | 'Indices' | 'Stocks' = 'All',
  limit = 40
): AssetDefinition[] {
  const cleanQ = query.trim().toUpperCase().replace(/[^A-Z0-9]/g, '');

  let filtered = ALL_ASSETS_DATABASE;
  if (category !== 'All') {
    filtered = filtered.filter((a) => a.category === category);
  }

  if (!cleanQ) {
    return filtered.slice(0, limit);
  }

  return filtered
    .filter((a) => {
      const idMatch = a.id.toUpperCase().includes(cleanQ);
      const symMatch = a.symbol.toUpperCase().replace(/[^A-Z0-9]/g, '').includes(cleanQ);
      const nameMatch = a.name.toUpperCase().includes(cleanQ);
      return idMatch || symMatch || nameMatch;
    })
    .slice(0, limit);
}
