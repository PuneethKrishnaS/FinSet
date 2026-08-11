const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

export const numberToWords = (num, currencyCode = 'INR') => {
  if (!num || isNaN(num) || num <= 0) return '';
  
  const isIndian = currencyCode === 'INR';
  
  let wholeNumber = Math.floor(num);
  let fractionalPart = Math.round((num - wholeNumber) * 100);
  
  if (wholeNumber === 0 && fractionalPart === 0) return '';
  
  const convertBelowThousand = (n) => {
    if (n === 0) return '';
    if (n < 10) return ones[n];
    if (n < 20) return teens[n - 10];
    if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 !== 0 ? ' ' + ones[n % 10] : '');
    return ones[Math.floor(n / 100)] + ' Hundred' + (n % 100 !== 0 ? ' ' + convertBelowThousand(n % 100) : '');
  };

  let words = '';
  
  if (isIndian) {
    if (wholeNumber >= 10000000) {
      words += convertBelowThousand(Math.floor(wholeNumber / 10000000)) + ' Crore ';
      wholeNumber %= 10000000;
    }
    if (wholeNumber >= 100000) {
      words += convertBelowThousand(Math.floor(wholeNumber / 100000)) + ' Lakh ';
      wholeNumber %= 100000;
    }
    if (wholeNumber >= 1000) {
      words += convertBelowThousand(Math.floor(wholeNumber / 1000)) + ' Thousand ';
      wholeNumber %= 1000;
    }
    words += convertBelowThousand(wholeNumber);
  } else {
    // Western system
    if (wholeNumber >= 1000000000) {
      words += convertBelowThousand(Math.floor(wholeNumber / 1000000000)) + ' Billion ';
      wholeNumber %= 1000000000;
    }
    if (wholeNumber >= 1000000) {
      words += convertBelowThousand(Math.floor(wholeNumber / 1000000)) + ' Million ';
      wholeNumber %= 1000000;
    }
    if (wholeNumber >= 1000) {
      words += convertBelowThousand(Math.floor(wholeNumber / 1000)) + ' Thousand ';
      wholeNumber %= 1000;
    }
    words += convertBelowThousand(wholeNumber);
  }

  words = words.trim();
  
  let currencyName = 'Dollars';
  let fractionName = 'Cents';
  
  if (currencyCode === 'INR') {
    currencyName = words === 'One' ? 'Rupee' : 'Rupees';
    fractionName = 'Paise';
  } else if (currencyCode === 'USD') {
    currencyName = words === 'One' ? 'Dollar' : 'Dollars';
    fractionName = 'Cents';
  } else if (currencyCode === 'EUR') {
    currencyName = words === 'One' ? 'Euro' : 'Euros';
    fractionName = 'Cents';
  } else if (currencyCode === 'GBP') {
    currencyName = words === 'One' ? 'Pound' : 'Pounds';
    fractionName = 'Pence';
  } else {
    currencyName = currencyCode;
    fractionName = 'Cents';
  }

  let finalStr = '';
  if (words) {
    finalStr += words + ' ' + currencyName;
  }
  
  if (fractionalPart > 0) {
    let fractionWords = convertBelowThousand(fractionalPart);
    if (finalStr) {
      finalStr += ' and ' + fractionWords + ' ' + fractionName;
    } else {
      finalStr = fractionWords + ' ' + fractionName;
    }
  }
  
  return finalStr;
};
