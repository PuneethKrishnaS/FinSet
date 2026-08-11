import re
from datetime import datetime

sample_text = """
01-07-2026 Opening Balance 3950.25 Cr
01-07-2026 UPI/011899351551/19:48:19/UPI/9964830947@
axl/Paym 166.00 4116.25 Cr
01-07-2026 UPI/209765965941/19:48:59/UPI/8746919515@
ibl/Sent 166.00 3950.25 Cr
02-07-2026 UPI/764539404367/17:38:14/UPI/Q848019034@
ybl/Paym 48.00 3902.25 Cr
03-07-2026 UPI/727152165097/15:05:27/UPI/Q651069973@
ybl/Paym 20.00 3882.25 Cr
04-07-2026 UPI/209996618712/19:14:14/UPI/q877842522@
ybl/Sent 40.00 3842.25 Cr
05-07-2026 UPI/002991048750/16:59:29/UPI/9964830947@
axl/Paym 674.00 4516.25 Cr
05-07-2026 UPI/618605778361/17:01:00/UPI/amazonpayhfc
@rapl/R 670.00 3846.25 Cr
05-07-2026 UPI/309818929437/18:04:30/UPI/7975353919@
upi/Mone 10.00 3836.25 Cr
08-07-2026 UPI/655554708844/19:56:35/UPI/8095496895@
superyes

1000.00 4132.25 Cr
"""

# Re-assemble wrapped lines.
# If a line doesn't start with a date, it's a continuation of the previous line.
lines = sample_text.strip().split('\n')
transactions = []
current_txn = ""

for line in lines:
    line = line.strip()
    if not line:
        continue
    # Check if line starts with date DD-MM-YYYY
    if re.match(r'^\d{2}-\d{2}-\d{4}', line):
        if current_txn:
            transactions.append(current_txn)
        current_txn = line
    else:
        current_txn += " " + line

if current_txn:
    transactions.append(current_txn)

parsed = []
last_balance = 0.0

for txn in transactions:
    # Pattern: DATE NARRATION [CHQ] AMOUNT BALANCE Cr
    # Example: 01-07-2026 UPI/... 166.00 4116.25 Cr
    match = re.search(r'^(\d{2}-\d{2}-\d{4})\s+(.+?)\s+([\d\.]+)\s+([\d\.]+)\s+(Cr|Dr)$', txn)
    if match:
        date_str = match.group(1)
        narration = match.group(2).strip()
        amount = float(match.group(3))
        balance = float(match.group(4))
        
        # Determine if it's a deposit or withdrawal based on balance change
        # Wait, opening balance line is different: "01-07-2026 Opening Balance 3950.25 Cr"
        if "Opening Balance" in narration:
            last_balance = balance
            continue
            
        is_deposit = (balance > last_balance)
        parsed.append({
            "date": date_str,
            "description": narration,
            "amount": amount,
            "type": "income" if is_deposit else "expense",
            "balance": balance
        })
        last_balance = balance

for p in parsed:
    print(f"[{p['date']}] {p['type'].upper()} {p['amount']} | Bal: {p['balance']} | {p['description'][:30]}")
