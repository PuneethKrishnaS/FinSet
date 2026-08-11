/**
 * A utility to parse SMS messages from common Indian banks (SBI, HDFC, ICICI, Bank of Baroda, etc.)
 */

export const parseBankSMS = (smsText) => {
  const text = smsText.toLowerCase();

  // Typical bank keywords
  if (!text.includes('debited') && !text.includes('credited') && !text.includes('spent') && !text.includes('deducted')) {
    return null; // Not a transaction SMS
  }

  const result = {
    amount: null,
    merchant: 'Unknown',
    type: 'expense',
    date: new Date().toISOString().split('T')[0],
  };

  // Determine type
  if (text.includes('credited') || text.includes('deposited')) {
    result.type = 'income';
  }

  // Extract amount
  // Matches Rs., INR, Rs, rs., inr, followed by space or no space, then numbers and optional decimals
  const amountRegex = /(?:rs\.?|inr)\s*([\d,]+\.?\d*)/i;
  const amountMatch = smsText.match(amountRegex);
  if (amountMatch && amountMatch[1]) {
    result.amount = parseFloat(amountMatch[1].replace(/,/g, ''));
  } else {
    // Sometimes it's just 'debited by 500.00'
    const fallbackRegex = /(?:debited|credited|spent) (?:by|for)?\s*([\d,]+\.?\d*)/i;
    const fallbackMatch = smsText.match(fallbackRegex);
    if (fallbackMatch && fallbackMatch[1]) {
      result.amount = parseFloat(fallbackMatch[1].replace(/,/g, ''));
    }
  }

  if (!result.amount) {
    return null; // Couldn't parse amount, discard
  }

  // Extract merchant / info
  if (text.includes('vpa')) {
    const vpaRegex = /vpa\s+([a-zA-Z0-9.\-_@]+)/i;
    const vpaMatch = smsText.match(vpaRegex);
    if (vpaMatch && vpaMatch[1]) {
      result.merchant = "UPI - " + vpaMatch[1].split('@')[0];
    }
  } else if (text.includes('upi/')) {
    const upiRegex = /upi\/(?:[a-z0-9]+\/)+([a-z0-9.\-_]+)/i;
    const upiMatch = smsText.match(upiRegex);
    if (upiMatch && upiMatch[1]) {
      result.merchant = "UPI - " + upiMatch[1];
    }
  } else if (text.includes('at')) {
    // E.g. spent at Amazon
    const atRegex = /at\s+([a-zA-Z0-9.\-\s]+?)(?:on|ref|avl|$)/i;
    const atMatch = smsText.match(atRegex);
    if (atMatch && atMatch[1]) {
      result.merchant = atMatch[1].trim();
    }
  } else if (text.includes('to')) {
    const toRegex = /to\s+([a-zA-Z0-9.\-\s]+?)(?:on|ref|avl|$)/i;
    const toMatch = smsText.match(toRegex);
    if (toMatch && toMatch[1]) {
      result.merchant = "To " + toMatch[1].trim();
    }
  }

  // Cleanup merchant string length
  if (result.merchant.length > 50) {
    result.merchant = result.merchant.substring(0, 50);
  }

  return result;
};
