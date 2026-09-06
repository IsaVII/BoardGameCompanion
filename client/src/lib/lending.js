// Lending tracker helpers.

const DAY = 86400000;

export function daysOut(loan, now = Date.now()) {
  const end = loan.returnedAt ? new Date(loan.returnedAt).getTime() : now;
  return Math.floor((end - new Date(loan.lentAt).getTime()) / DAY);
}

export function isOverdue(loan, now = Date.now()) {
  if (loan.returnedAt) return false;
  return daysOut(loan, now) >= (loan.reminderDays ?? 30);
}

export function splitLoans(loans, now = Date.now()) {
  const active = loans.filter((l) => !l.returnedAt);
  return {
    overdue: active.filter((l) => isOverdue(l, now)),
    out: active.filter((l) => !isOverdue(l, now)),
    returned: loans.filter((l) => l.returnedAt),
  };
}
