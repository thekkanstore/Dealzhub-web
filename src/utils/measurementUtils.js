/**
 * Category-Driven Product Measurement and Sizing Utilities
 */

export const STANDARD_CLOTHING_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL', 'Free Size'];
export const STANDARD_FOOTWEAR_SIZES = ['UK 5', 'UK 6', 'UK 7', 'UK 8', 'UK 9', 'UK 10', 'Euro 38', 'Euro 39', 'Euro 40', 'Euro 41'];

export const ALL_MEASUREMENT_UNITS = [
  { value: 'pcs', label: 'Pieces (pcs)', type: 'count' },
  { value: 'pair', label: 'Pairs (pair)', type: 'count' },
  { value: 'pack', label: 'Pack', type: 'count' },
  { value: 'kg', label: 'Kilogram (kg)', type: 'weight' },
  { value: 'g', label: 'Gram (g)', type: 'weight' },
  { value: 'ltr', label: 'Liter (ltr)', type: 'volume' },
  { value: 'ml', label: 'Milliliter (ml)', type: 'volume' },
  { value: 'quantity', label: 'Quantity', type: 'count' },
];

/**
 * Explicit profile mapping for all 20 store categories in Firestore
 */
export const CATEGORY_PROFILES = {
  // Sizing only (Apparel, Footwear, Fashion)
  'apparel': {
    hasMeasurementOptions: true,
    type: 'apparel',
    supportsSizes: true,
    sizeType: 'clothing',
    presetSizes: STANDARD_CLOTHING_SIZES,
    allowedUnits: ['pcs', 'pack'],
    defaultUnit: 'pcs',
    allowFractionalWeight: false,
    allowWeightOptions: false,
  },
  'fashion and accessories': {
    hasMeasurementOptions: true,
    type: 'apparel',
    supportsSizes: true,
    sizeType: 'clothing',
    presetSizes: STANDARD_CLOTHING_SIZES,
    allowedUnits: ['pcs', 'pair', 'pack'],
    defaultUnit: 'pcs',
    allowFractionalWeight: false,
    allowWeightOptions: false,
  },

  // Weight items (Kg, Grams, Pack)
  'grocery': {
    hasMeasurementOptions: true,
    type: 'grocery_weight',
    supportsSizes: false,
    allowedUnits: ['kg', 'g', 'pack', 'pcs'],
    defaultUnit: 'kg',
    allowFractionalWeight: true,
    allowWeightOptions: true,
    suggestedWeights: ['100g', '250g', '500g', '1kg', '2kg', '5kg'],
  },
  'spices': {
    hasMeasurementOptions: true,
    type: 'grocery_weight',
    supportsSizes: false,
    allowedUnits: ['g', 'kg', 'pack', 'pcs'],
    defaultUnit: 'g',
    allowFractionalWeight: true,
    allowWeightOptions: true,
    suggestedWeights: ['50g', '100g', '250g', '500g', '1kg'],
  },
  'meat, fish, egg': {
    hasMeasurementOptions: true,
    type: 'grocery_weight',
    supportsSizes: false,
    allowedUnits: ['kg', 'g', 'pack', 'pcs'],
    defaultUnit: 'kg',
    allowFractionalWeight: true,
    allowWeightOptions: true,
    suggestedWeights: ['250g', '500g', '1kg', '2kg'],
  },

  // Volume & Weight items (Liters, ml, kg, g)
  'food & beverages': {
    hasMeasurementOptions: true,
    type: 'liquid_or_weight',
    supportsSizes: false,
    allowedUnits: ['ltr', 'ml', 'kg', 'g', 'pack', 'pcs'],
    defaultUnit: 'ltr',
    allowFractionalWeight: true,
    allowWeightOptions: true,
    suggestedWeights: ['250ml', '500ml', '1L', '2L', '500g', '1kg'],
  },
  'beauty': {
    hasMeasurementOptions: true,
    type: 'liquid_or_weight',
    supportsSizes: false,
    allowedUnits: ['ml', 'g', 'pcs', 'pack'],
    defaultUnit: 'pcs',
    allowFractionalWeight: true,
    allowWeightOptions: true,
    suggestedWeights: ['30ml', '50ml', '100ml', '200ml', '50g', '100g'],
  },
  'wellness': {
    hasMeasurementOptions: true,
    type: 'liquid_or_weight',
    supportsSizes: false,
    allowedUnits: ['g', 'kg', 'ml', 'ltr', 'pack', 'pcs'],
    defaultUnit: 'g',
    allowFractionalWeight: true,
    allowWeightOptions: true,
    suggestedWeights: ['100g', '250g', '500g', '1kg'],
  },

  // Standard non-quantified categories (NO weights, NO sizes - kept simple as-is!)
  'pets & animals': { hasMeasurementOptions: false, type: 'standard', supportsSizes: false, allowFractionalWeight: false, allowWeightOptions: false, allowedUnits: ['pcs'], defaultUnit: 'pcs', presetSizes: [] },
  'books': { hasMeasurementOptions: false, type: 'standard', supportsSizes: false, allowFractionalWeight: false, allowWeightOptions: false, allowedUnits: ['pcs'], defaultUnit: 'pcs', presetSizes: [] },
  'computer & hardware': { hasMeasurementOptions: false, type: 'standard', supportsSizes: false, allowFractionalWeight: false, allowWeightOptions: false, allowedUnits: ['pcs'], defaultUnit: 'pcs', presetSizes: [] },
  'customized products': { hasMeasurementOptions: false, type: 'standard', supportsSizes: false, allowFractionalWeight: false, allowWeightOptions: false, allowedUnits: ['pcs'], defaultUnit: 'pcs', presetSizes: [] },
  'furniture': { hasMeasurementOptions: false, type: 'standard', supportsSizes: false, allowFractionalWeight: false, allowWeightOptions: false, allowedUnits: ['pcs'], defaultUnit: 'pcs', presetSizes: [] },
  'home appliances': { hasMeasurementOptions: false, type: 'standard', supportsSizes: false, allowFractionalWeight: false, allowWeightOptions: false, allowedUnits: ['pcs'], defaultUnit: 'pcs', presetSizes: [] },
  'home decors & handmades': { hasMeasurementOptions: false, type: 'standard', supportsSizes: false, allowFractionalWeight: false, allowWeightOptions: false, allowedUnits: ['pcs'], defaultUnit: 'pcs', presetSizes: [] },
  'kids, stationery, & gifts': { hasMeasurementOptions: false, type: 'standard', supportsSizes: false, allowFractionalWeight: false, allowWeightOptions: false, allowedUnits: ['pcs'], defaultUnit: 'pcs', presetSizes: [] },
  'kitchen appliances': { hasMeasurementOptions: false, type: 'standard', supportsSizes: false, allowFractionalWeight: false, allowWeightOptions: false, allowedUnits: ['pcs'], defaultUnit: 'pcs', presetSizes: [] },
  'mobile accessories': { hasMeasurementOptions: false, type: 'standard', supportsSizes: false, allowFractionalWeight: false, allowWeightOptions: false, allowedUnits: ['pcs'], defaultUnit: 'pcs', presetSizes: [] },
  'musical instruments': { hasMeasurementOptions: false, type: 'standard', supportsSizes: false, allowFractionalWeight: false, allowWeightOptions: false, allowedUnits: ['pcs'], defaultUnit: 'pcs', presetSizes: [] },
  'plants & gardening': { hasMeasurementOptions: false, type: 'standard', supportsSizes: false, allowFractionalWeight: false, allowWeightOptions: false, allowedUnits: ['pcs'], defaultUnit: 'pcs', presetSizes: [] },
};

/**
 * Evaluates category data and returns the measurement/sizing profile
 */
export function getCategoryMeasurementProfile(category) {
  if (!category) {
    return {
      hasMeasurementOptions: false,
      type: 'none',
      supportsSizes: false,
      allowedUnits: ['pcs'],
      defaultUnit: 'pcs',
      allowFractionalWeight: false,
      allowWeightOptions: false,
      presetSizes: [],
    };
  }

  const rawName = (typeof category === 'string' ? category : (category.name || category.key || '')).trim().toLowerCase();

  // 1. Direct match in CATEGORY_PROFILES
  if (CATEGORY_PROFILES[rawName]) {
    return CATEGORY_PROFILES[rawName];
  }

  // 2. Keyword fallback for sub-matches or future custom categories
  if (/shoe|footwear|sneaker|sandal|slipper|boot/.test(rawName)) {
    return {
      hasMeasurementOptions: true,
      type: 'apparel',
      sizeType: 'footwear',
      supportsSizes: true,
      allowedUnits: ['pair', 'pcs', 'pack'],
      defaultUnit: 'pair',
      allowFractionalWeight: false,
      allowWeightOptions: false,
      presetSizes: STANDARD_FOOTWEAR_SIZES,
    };
  }

  if (/clothing|dress|apparel|shirt|pant|tshirt|saree|suit|jeans|cloth/.test(rawName)) {
    return CATEGORY_PROFILES['apparel'];
  }

  if (/liquid|oil|milk|dairy|beverage|juice|drink/.test(rawName)) {
    return CATEGORY_PROFILES['food & beverages'];
  }

  if (/grocery|supermarket|fruit|vegetable|meat|fish|spice|grain|rice|dal|wheat|flour|food|bakery/.test(rawName)) {
    return CATEGORY_PROFILES['grocery'];
  }

  // Default fallback for any unspecified category: keep as-is (standard item, no measurement prompts)
  return {
    hasMeasurementOptions: false,
    type: 'standard',
    supportsSizes: false,
    allowedUnits: ['pcs'],
    defaultUnit: 'pcs',
    allowFractionalWeight: false,
    allowWeightOptions: false,
    presetSizes: [],
  };
}

/**
 * Formats a clean price string with its unit
 * e.g. "₹40 / 1 kg", "₹120 / 500 g", "₹499 / pcs"
 */
export function formatProductPriceUnit(actualPrice, discountPrice, unit = 'pcs', unitValue = 1) {
  const cleanUnit = (unit || 'pcs').toLowerCase();
  const cleanVal = parseFloat(unitValue) || 1;
  const unitLabel = cleanVal === 1 ? cleanUnit : `${cleanVal} ${cleanUnit}`;
  return unitLabel;
}

/**
 * Converts a weight/volume value to a standard base in grams or milliliters
 */
export function normalizeMeasurement(value, unit) {
  const num = parseFloat(value) || 0;
  const u = (unit || '').toLowerCase();
  if (u === 'kg' || u === 'ltr') {
    return num * 1000;
  }
  return num; // 'g', 'ml', 'pcs', etc.
}

/**
 * Calculates scaled price for a fractional weight or volume selection
 * basePrice: Price for baseValue of baseUnit (e.g. ₹80 for 1 kg)
 * targetValue: User selected amount (e.g. 500)
 * targetUnit: User selected unit (e.g. 'g')
 */
export function calculateScaledPrice(basePrice, baseUnit = 'pcs', baseUnitValue = 1, targetValue = 1, targetUnit = 'pcs') {
  const price = parseFloat(basePrice) || 0;
  if (!price) return 0;

  const bUnit = (baseUnit || 'pcs').toLowerCase();
  const tUnit = (targetUnit || bUnit).toLowerCase();

  // If both are weight or both are volume, scale proportionally
  const isWeight = (bUnit === 'kg' || bUnit === 'g') && (tUnit === 'kg' || tUnit === 'g');
  const isVolume = (bUnit === 'ltr' || bUnit === 'ml') && (tUnit === 'ltr' || tUnit === 'ml');

  if (isWeight || isVolume) {
    const baseNormalized = normalizeMeasurement(baseUnitValue, bUnit);
    const targetNormalized = normalizeMeasurement(targetValue, tUnit);
    if (baseNormalized > 0) {
      const scaled = (targetNormalized / baseNormalized) * price;
      return Math.round(scaled * 100) / 100;
    }
  }

  // Discrete count unit multiplier
  return Math.round(price * (parseFloat(targetValue) || 1) * 100) / 100;
}

/**
 * Normalizes unit string aliases to standard tokens ('kg', 'g', 'ltr', 'ml', 'pcs', 'pack')
 */
export function normalizeUnitAlias(rawUnit, defaultUnit = 'g') {
  if (!rawUnit) return defaultUnit;
  const u = rawUnit.toLowerCase().trim();
  if (['g', 'gm', 'gms', 'gram', 'grams'].includes(u)) return 'g';
  if (['kg', 'kgs', 'kilo', 'kilos', 'kilogram', 'kilograms'].includes(u)) return 'kg';
  if (['l', 'ltr', 'ltrs', 'litre', 'litres', 'liter', 'liters'].includes(u)) return 'ltr';
  if (['ml', 'mls', 'milliliter', 'milliliters'].includes(u)) return 'ml';
  if (['pcs', 'pc', 'piece', 'pieces'].includes(u)) return 'pcs';
  if (['pack', 'packs', 'packet', 'packets', 'pkt'].includes(u)) return 'pack';
  return u;
}

/**
 * Parses any weight/volume/package string typed by shop owner or user
 * e.g. "250g" -> { value: 250, unit: 'g', label: '250g' }
 *      "1.5kg" -> { value: 1.5, unit: 'kg', label: '1.5kg' }
 *      "500 ml" -> { value: 500, unit: 'ml', label: '500ml' }
 *      "1/2 kg" -> { value: 0.5, unit: 'kg', label: '0.5kg' }
 */
export function parseWeightOption(str, defaultUnit = 'g') {
  if (!str) return null;
  const cleaned = String(str).trim();

  // Check for fractional pattern like "1/2 kg" or "1/4 kg"
  const fracMatch = cleaned.match(/^(\d+)\/(\d+)\s*([a-zA-Z]+)?$/);
  if (fracMatch) {
    const num = parseFloat(fracMatch[1]);
    const den = parseFloat(fracMatch[2]);
    const value = den > 0 ? num / den : 1;
    const unit = normalizeUnitAlias(fracMatch[3] || defaultUnit, defaultUnit);
    return {
      value,
      unit,
      label: `${value}${unit}`,
    };
  }

  // Standard numeric pattern like "250g", "1.5 kg", "500ml", or unitless "250", "1"
  const match = cleaned.match(/^([\d.]+)\s*([a-zA-Z]+)?$/);
  if (match) {
    const value = parseFloat(match[1]);
    const rawUnit = match[2];
    let unit;
    if (rawUnit) {
      unit = normalizeUnitAlias(rawUnit, defaultUnit);
    } else {
      const d = normalizeUnitAlias(defaultUnit, 'g');
      if (['kg', 'g'].includes(d)) {
        unit = value >= 50 ? 'g' : 'kg';
      } else if (['ltr', 'ml'].includes(d)) {
        unit = value >= 50 ? 'ml' : 'ltr';
      } else {
        unit = d;
      }
    }
    return {
      value,
      unit,
      label: `${value}${unit}`,
    };
  }

  return {
    value: 1,
    unit: normalizeUnitAlias(defaultUnit, 'pcs'),
    label: cleaned,
  };
}

/**
 * Parses multiple weight options from a string (e.g. "250g, 500g, 1kg")
 */
export function parseWeightOptionsList(inputStr, defaultUnit = 'g') {
  if (!inputStr) return [];
  const parts = String(inputStr).split(/[,;]+/).map(p => p.trim()).filter(Boolean);
  return parts.map(p => parseWeightOption(p, defaultUnit)).filter(Boolean);
}

/**
 * Resolves the dynamic weight/package options configured by the shop owner
 */
export function getProductWeightOptions(product) {
  if (!product) return [];

  // If shop owner typed in specific weight/package options
  if (product.weightOptions && Array.isArray(product.weightOptions) && product.weightOptions.length > 0) {
    return product.weightOptions
      .map(opt => parseWeightOption(opt, product.unit || 'g'))
      .filter(Boolean);
  }

  // Fallback to the base unit and unitValue typed by shop owner
  const isWeightOrVolume = ['kg', 'g', 'ltr', 'ml'].includes((product.unit || '').toLowerCase());
  if (isWeightOrVolume && product.unitValue) {
    const val = parseFloat(product.unitValue) || 1;
    return [
      {
        value: val,
        unit: product.unit,
        label: `${val}${product.unit}`,
      }
    ];
  }

  return [];
}

