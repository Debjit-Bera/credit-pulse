export const DEFAULT_RATE = 12

export type Tone = 'green' | 'amber' | 'orange' | 'red'

export type FormValues = {
  age: string
  income: string
  expenses: string
  emi: string
  loan: string
  tenure: string
}

export type Profile = {
  age: number
  income: number
  expenses: number
  emi: number
  loan: number
  tenure: number
}

export type FormErrors = Partial<Record<keyof FormValues, string>>

export type Risk = { label: string; tone: Tone }

export type BreakdownItem = {
  key: string
  label: string
  max: number
  points: number
  note: string
}

export type Analysis = {
  newEmi: number
  totalRepay: number
  totalInterest: number
  existingRatio: number
  expenseRatio: number
  foir: number
  loanToAnnual: number
  leftover: number
  leftoverRatio: number
  ageAtMaturity: number
  breakdown: BreakdownItem[]
  score: number
  risk: Risk
}

export type CheckStatus = 'pass' | 'warn' | 'fail'

export type Check = {
  id: string
  title: string
  status: CheckStatus
  detail: string
  tip: string
}

export type Verdict = {
  label: string
  tone: Tone
  fails: number
  warns: number
  text: string
}

export const fmt = (n: number) =>
  '₹' + Math.round(Number.isFinite(n) ? n : 0).toLocaleString('en-IN')
export const pct = (x: number) => (x * 100).toFixed(0) + '%'
const round1000 = (n: number) => Math.max(1000, Math.round(n / 1000) * 1000)

export function calcEmi(principal: number, annualRate: number, months: number) {
  if (!principal || !months) return 0
  const r = annualRate / 12 / 100
  if (r === 0) return principal / months
  const f = Math.pow(1 + r, months)
  return (principal * r * f) / (f - 1)
}

export function maxLoanForEmi(emi: number, annualRate: number, months: number) {
  if (emi <= 0 || !months) return 0
  const r = annualRate / 12 / 100
  if (r === 0) return emi * months
  return (emi * (1 - Math.pow(1 + r, -months))) / r
}

export function schedule(principal: number, annualRate: number, months: number, rows = 6) {
  const emi = calcEmi(principal, annualRate, months)
  const r = annualRate / 12 / 100
  let balance = principal
  const out: { month: number; interest: number; principalPart: number; balance: number }[] = []
  for (let m = 1; m <= Math.min(rows, months); m++) {
    const interest = balance * r
    const principalPart = emi - interest
    balance = Math.max(0, balance - principalPart)
    out.push({ month: m, interest, principalPart, balance })
  }
  return out
}

export function validate(form: FormValues): FormErrors {
  const errors: FormErrors = {}
  const num = (k: keyof FormValues) => (form[k] === '' ? NaN : Number(form[k]))

  const age = num('age')
  if (isNaN(age)) errors.age = 'Enter your age'
  else if (!Number.isInteger(age) || age < 18 || age > 80) errors.age = 'Age must be a whole number from 18 to 80'

  const income = num('income')
  if (isNaN(income)) errors.income = 'Enter your monthly income'
  else if (income <= 0) errors.income = 'Income must be more than 0'
  else if (income > 10000000) errors.income = 'Please enter a realistic income'

  const expenses = num('expenses')
  if (isNaN(expenses)) errors.expenses = 'Enter your monthly expenses (enter 0 if none)'
  else if (expenses < 0) errors.expenses = 'Expenses cannot be negative'

  const emi = num('emi')
  if (isNaN(emi)) errors.emi = 'Enter your existing EMI (enter 0 if none)'
  else if (emi < 0) errors.emi = 'EMI cannot be negative'

  const loan = num('loan')
  if (isNaN(loan)) errors.loan = 'Enter the loan amount you need'
  else if (loan < 1000) errors.loan = 'Minimum loan amount is ₹1,000'
  else if (loan > 1000000) errors.loan = 'Maximum micro-loan amount is ₹10,00,000'

  const tenure = num('tenure')
  if (isNaN(tenure)) errors.tenure = 'Enter the loan duration in months'
  else if (!Number.isInteger(tenure) || tenure < 3 || tenure > 120)
    errors.tenure = 'Duration must be a whole number from 3 to 120 months'

  return errors
}

export function toProfile(form: FormValues): Profile {
  return {
    age: Number(form.age),
    income: Number(form.income),
    expenses: Number(form.expenses),
    emi: Number(form.emi),
    loan: Number(form.loan),
    tenure: Number(form.tenure),
  }
}

const clamp01 = (v: number) => Math.min(1, Math.max(0, v))
const points = (value: number, best: number, worst: number, max: number) =>
  Math.round(clamp01((value - worst) / (best - worst)) * max * 10) / 10

export function getRisk(score: number): Risk {
  if (score >= 75) return { label: 'Low Risk', tone: 'green' }
  if (score >= 55) return { label: 'Moderate Risk', tone: 'amber' }
  if (score >= 35) return { label: 'High Risk', tone: 'orange' }
  return { label: 'Very High Risk', tone: 'red' }
}

export const toneForRatio = (ratio: number): Tone =>
  ratio >= 0.75 ? 'green' : ratio >= 0.5 ? 'amber' : ratio >= 0.25 ? 'orange' : 'red'

// Age is intentionally excluded from the score; it only feeds the maturity check.
export function analyze(p: Profile, rate: number): Analysis {
  const newEmi = calcEmi(p.loan, rate, p.tenure)
  const totalRepay = newEmi * p.tenure
  const totalInterest = totalRepay - p.loan

  const existingRatio = p.emi / p.income
  const expenseRatio = p.expenses / p.income
  const foir = (p.emi + newEmi) / p.income
  const loanToAnnual = p.loan / (p.income * 12)
  const leftover = p.income - p.expenses - p.emi - newEmi
  const leftoverRatio = leftover / p.income
  const ageAtMaturity = p.age + p.tenure / 12

  const breakdown: BreakdownItem[] = [
    {
      key: 'debt',
      label: 'Existing Debt Burden',
      max: 20,
      points: points(existingRatio, 0.1, 0.5, 20),
      note: `Existing EMI is ${pct(existingRatio)} of income (best: under 10%)`,
    },
    {
      key: 'expense',
      label: 'Spending Discipline',
      max: 20,
      points: points(expenseRatio, 0.4, 0.9, 20),
      note: `Expenses are ${pct(expenseRatio)} of income (best: under 40%)`,
    },
    {
      key: 'afford',
      label: 'New Loan Affordability',
      max: 30,
      points: points(foir, 0.3, 0.7, 30),
      note: `All EMIs together would be ${pct(foir)} of income (best: under 30%)`,
    },
    {
      key: 'size',
      label: 'Loan Size vs Income',
      max: 15,
      points: points(loanToAnnual, 0.25, 3, 15),
      note: `Loan is ${loanToAnnual.toFixed(2)}x your yearly income (best: under 0.25x)`,
    },
    {
      key: 'buffer',
      label: 'Monthly Savings Buffer',
      max: 15,
      points: points(leftoverRatio, 0.25, 0, 15),
      note: `${fmt(leftover)} left after all expenses and EMIs (best: 25%+ of income)`,
    },
  ]

  const score = Math.round(breakdown.reduce((sum, b) => sum + b.points, 0))

  return {
    newEmi,
    totalRepay,
    totalInterest,
    existingRatio,
    expenseRatio,
    foir,
    loanToAnnual,
    leftover,
    leftoverRatio,
    ageAtMaturity,
    breakdown,
    score,
    risk: getRisk(score),
  }
}

export function getChecks(p: Profile, a: Analysis): Check[] {
  const checks: Check[] = []
  const add = (id: string, title: string, status: CheckStatus, detail: string, tip = '') =>
    checks.push({ id, title, status, detail, tip })

  if (p.income < 15000)
    add('income', 'Monthly Income', 'fail',
      `Income of ${fmt(p.income)} is below the typical ₹15,000 minimum many lenders ask for.`,
      'Add a co-applicant or show extra income (freelance, rent, part-time) to strengthen the application.')
  else if (p.income < 20000)
    add('income', 'Monthly Income', 'warn',
      `Income of ${fmt(p.income)} is on the lower side, so lenders will be strict on other factors.`,
      'Keep expenses and existing EMIs low to compensate for a modest income.')
  else add('income', 'Monthly Income', 'pass', `Income of ${fmt(p.income)} meets typical minimum requirements.`)

  if (a.expenseRatio > 0.65)
    add('expenses', 'Monthly Expenses', 'fail',
      `Expenses take ${pct(a.expenseRatio)} of your income, leaving little room to repay a loan.`,
      `Aim to bring expenses under ${fmt(p.income * 0.5)} (50% of income). That is ${fmt(Math.max(0, p.expenses - p.income * 0.5))} less per month.`)
  else if (a.expenseRatio > 0.5)
    add('expenses', 'Monthly Expenses', 'warn',
      `Expenses take ${pct(a.expenseRatio)} of income – a bit high (comfortable level is under 50%).`,
      `Trim about ${fmt(p.expenses - p.income * 0.5)} per month (dining out, subscriptions, impulse buys).`)
  else add('expenses', 'Monthly Expenses', 'pass', `Expenses are ${pct(a.expenseRatio)} of income – healthy.`)

  if (a.existingRatio > 0.4)
    add('emi', 'Existing EMI Burden', 'fail',
      `Existing EMIs use ${pct(a.existingRatio)} of income. Lenders usually want this under 40%.`,
      'Close or prepay your smallest loan first to free up monthly cash.')
  else if (a.existingRatio > 0.25)
    add('emi', 'Existing EMI Burden', 'warn',
      `Existing EMIs use ${pct(a.existingRatio)} of income, which limits room for a new loan.`,
      'Avoid taking any new credit and consider prepaying one small EMI.')
  else add('emi', 'Existing EMI Burden', 'pass', `Existing EMIs are only ${pct(a.existingRatio)} of income.`)

  if (a.foir > 0.5)
    add('foir', 'Total EMI After New Loan', 'fail',
      `With the new EMI of ${fmt(a.newEmi)}, all EMIs would be ${pct(a.foir)} of income (limit is usually 40–50%).`,
      'Ask for a smaller loan or a longer tenure so the new EMI is smaller.')
  else if (a.foir > 0.4)
    add('foir', 'Total EMI After New Loan', 'warn',
      `All EMIs would be ${pct(a.foir)} of income – close to the usual limit.`,
      'A slightly smaller loan amount would make approval much more comfortable.')
  else add('foir', 'Total EMI After New Loan', 'pass', `All EMIs would be ${pct(a.foir)} of income – within limits.`)

  if (a.loanToAnnual > 2)
    add('amount', 'Requested Loan Amount', 'fail',
      `The loan is ${a.loanToAnnual.toFixed(1)}x your yearly income – very large for a micro-loan.`,
      `Try a loan closer to ${fmt(p.income * 12)} (one year of income) or less.`)
  else if (a.loanToAnnual > 1)
    add('amount', 'Requested Loan Amount', 'warn',
      `The loan is ${a.loanToAnnual.toFixed(1)}x your yearly income, which is on the high side.`,
      'Reducing the amount even by 20% improves your chances.')
  else add('amount', 'Requested Loan Amount', 'pass', `The loan is ${a.loanToAnnual.toFixed(2)}x yearly income – reasonable.`)

  const emiShare = a.newEmi / p.income
  if (p.tenure < 12 && emiShare > 0.35)
    add('tenure', 'Loan Tenure', 'fail',
      `A ${p.tenure}-month tenure makes the EMI ${pct(emiShare)} of income – too heavy.`,
      'Stretch the tenure to 12+ months to cut the monthly EMI.')
  else if (p.tenure < 12 && emiShare > 0.25)
    add('tenure', 'Loan Tenure', 'warn',
      `A short ${p.tenure}-month tenure pushes the EMI up to ${pct(emiShare)} of income.`,
      'A slightly longer tenure would lower the EMI.')
  else if (p.tenure > 72)
    add('tenure', 'Loan Tenure', 'warn',
      `A ${p.tenure}-month tenure means you pay ${fmt(a.totalInterest)} in interest (${pct(a.totalInterest / p.loan)} of the loan).`,
      'Shorten the tenure if your budget allows, to save on interest.')
  else add('tenure', 'Loan Tenure', 'pass', `${p.tenure} months is a balanced tenure for this amount.`)

  const maturity = a.ageAtMaturity.toFixed(1)
  if (p.age < 21)
    add('age', 'Age at Loan Maturity', 'fail',
      `Many lenders need borrowers to be 21+. You are ${p.age}. (You will be ${maturity} when the loan ends.)`,
      'Apply with a parent or guardian as co-applicant, or wait until you are 21.')
  else if (a.ageAtMaturity > 65)
    add('age', 'Age at Loan Maturity', 'fail',
      `You would be ${maturity} when the loan ends – above the usual limit of 65.`,
      `Choose a tenure of at most ${Math.max(3, Math.floor((65 - p.age) * 12))} months.`)
  else if (a.ageAtMaturity > 60)
    add('age', 'Age at Loan Maturity', 'warn',
      `You would be ${maturity} when the loan ends – close to the retirement-age limit lenders use.`,
      'A shorter tenure or a co-applicant can help.')
  else add('age', 'Age at Loan Maturity', 'pass', `You would be ${maturity} when the loan ends – no age concern.`)

  if (a.leftover < 0)
    add('cushion', 'Monthly Cash Cushion', 'fail',
      `After expenses and all EMIs you would be short by ${fmt(-a.leftover)} every month.`,
      'You need to cut expenses or reduce the loan – the budget does not balance right now.')
  else if (a.leftoverRatio < 0.1)
    add('cushion', 'Monthly Cash Cushion', 'warn',
      `Only ${fmt(a.leftover)} (${pct(a.leftoverRatio)} of income) would be left each month.`,
      'Build a buffer of at least 10–15% of income before borrowing.')
  else add('cushion', 'Monthly Cash Cushion', 'pass', `${fmt(a.leftover)} would remain each month – a healthy cushion.`)

  return checks
}

export function getVerdict(a: Analysis, checks: Check[]): Verdict {
  const fails = checks.filter((c) => c.status === 'fail').length
  const warns = checks.filter((c) => c.status === 'warn').length
  if (fails > 0 || a.score < 40)
    return { label: 'Likely Rejected', tone: 'red', fails, warns,
      text: 'A lender would probably decline this request as it stands.' }
  if (warns > 0 || a.score < 65)
    return { label: 'Borderline – Needs Review', tone: 'amber', fails, warns,
      text: 'This request could go either way. A few improvements would help a lot.' }
  return { label: 'Likely Approved', tone: 'green', fails, warns,
    text: 'This request looks healthy and would likely be approved.' }
}

export function buildRoadmap(p: Profile, rate: number) {
  const today = analyze(p, rate)

  const m1 = { ...p, expenses: Math.round(p.expenses * 0.9) }
  const m2 = { ...m1, expenses: Math.round(p.expenses * 0.85), emi: Math.round(p.emi * 0.8) }
  const m3 = { ...m2, loan: round1000(p.loan * 0.85) }

  const steps = [
    {
      month: 1,
      title: 'Cut spending & track money',
      actions: [
        `Reduce monthly expenses by about 10%: ${fmt(p.expenses)} → ${fmt(m1.expenses)}`,
        'Write down every expense for 30 days and cancel unused subscriptions',
        'Pay every bill and EMI on or before the due date',
      ],
      profile: m1,
    },
    {
      month: 2,
      title: 'Lighten your debt load',
      actions: [
        `Push expenses down to about 15% less: ${fmt(m2.expenses)}`,
        p.emi > 0
          ? `Prepay or close one small loan to cut existing EMI by ~20%: ${fmt(p.emi)} → ${fmt(m2.emi)}`
          : 'Stay debt-free – do not open any new credit lines',
        'Start an emergency fund (even ₹500–₹1,000 a month)',
      ],
      profile: m2,
    },
    {
      month: 3,
      title: 'Right-size the loan & re-apply',
      actions: [
        `Ask for a smaller loan (about 15% less): ${fmt(p.loan)} → ${fmt(m3.loan)}`,
        'Avoid applying to several lenders at once – too many enquiries look risky',
        'Re-check your score, then apply when it reaches 75+',
      ],
      profile: m3,
    },
  ]

  return {
    today,
    steps: steps.map((s) => ({ ...s, result: analyze(s.profile, rate) })),
  }
}

export function buildAlternatives(p: Profile, rate: number) {
  const maxByAge = Math.max(3, Math.floor((65 - p.age) * 12))
  const room = Math.max(0, 0.4 * p.income - p.emi)
  const maxLoanSame = Math.floor(maxLoanForEmi(room, rate, p.tenure) / 1000) * 1000

  const longer = Math.max(p.tenure, Math.min(p.tenure + 12, 84, maxByAge))
  const balancedTenure = Math.max(p.tenure, Math.min(p.tenure + 6, 84, maxByAge))

  const raw = [
    { id: 'current', name: 'Your Request', loan: p.loan, tenure: p.tenure, desc: 'What you asked for' },
    { id: 'lower', name: 'Lower Amount', loan: round1000(p.loan * 0.75), tenure: p.tenure, desc: '25% smaller loan, same tenure' },
    { id: 'longer', name: 'Longer Tenure', loan: p.loan, tenure: longer, desc: `Same amount spread over ${longer} months` },
    { id: 'balanced', name: 'Balanced Mix', loan: round1000(p.loan * 0.85), tenure: balancedTenure, desc: '15% smaller loan and a slightly longer tenure' },
  ]
  if (maxLoanSame >= 1000)
    raw.push({
      id: 'safest',
      name: 'Safest Fit',
      loan: Math.min(p.loan, maxLoanSame),
      tenure: p.tenure,
      desc: 'Largest amount that keeps total EMIs at 40% of income',
    })

  const seen = new Set<string>()
  const options = raw
    .filter((o) => {
      const key = o.loan + '-' + o.tenure
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })
    .map((o) => {
      const sim = { ...p, loan: o.loan, tenure: o.tenure }
      const a = analyze(sim, rate)
      const verdict = getVerdict(a, getChecks(sim, a))
      return { ...o, a, verdict }
    })

  return { options, maxLoanSame, room, maxByAge }
}
