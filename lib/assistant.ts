import {
  analyze,
  buildAlternatives,
  buildRoadmap,
  calcEmi,
  fmt,
  getChecks,
  getVerdict,
  pct,
  type Profile,
} from './finance'

export const SUGGESTIONS = [
  'What is my credit score?',
  'Why might my loan be rejected?',
  'How can I improve my score?',
  'How much loan can I afford?',
  'What will my EMI be?',
  'Suggest a safer loan option',
]

export type ChatMessage = { from: 'bot' | 'user'; text: string }

export const WELCOME: ChatMessage = {
  from: 'bot',
  text: 'Hi! I am the CreditPulse Assistant. Ask me about your score, loan rejection reasons, EMI or safer options. Every answer is based on the details you entered.',
}

const has = (text: string, words: string[]) => words.some((w) => text.includes(w))

export function getReply(question: string, p: Profile, rate: number): string {
  const q = question.toLowerCase()
  const a = analyze(p, rate)
  const checks = getChecks(p, a)
  const verdict = getVerdict(a, checks)
  const problems = checks.filter((c) => c.status !== 'pass')
  const disclaimer = '\n\n(Reminder: this is an estimate, not an actual bank decision.)'

  if (has(q, ['hello', 'hi ', 'hey', 'help']) || q.trim() === 'hi')
    return 'Hi! I can answer questions about your score, rejection risk, EMI, affordability, tenure, age and safer loan options. Tap a suggestion below or type your own question.'

  if (has(q, ['real', 'bank', 'actual', 'official', 'accurate', 'guarantee']))
    return 'CreditPulse gives you an estimate using transparent, rule-based checks. Real banks use credit bureau reports, KYC and their own policies, so their decision can be different.'

  if (has(q, ['reject', 'denied', 'decline', 'approve', 'approval', 'eligib', 'chance', 'why']))
    return problems.length === 0
      ? `Good news! Verdict: ${verdict.label}. None of the checks raised a concern.` + disclaimer
      : `Verdict: ${verdict.label}.\nMain concerns:\n` +
          problems.map((c) => `• ${c.title}: ${c.detail}`).join('\n') +
          '\n\nOpen "Rejection Check" for the full breakdown.'

  if (has(q, ['improve', 'increase', 'boost', 'better', 'tip', 'raise', 'roadmap', 'plan'])) {
    const r = buildRoadmap(p, rate)
    const last = r.steps[2].result
    const tips = problems.filter((c) => c.tip).slice(0, 3).map((c) => `• ${c.tip}`)
    return (
      `Your score is ${a.score}/100. If you follow the 3-month roadmap it could rise to about ${last.score}/100 (${last.risk.label}).\n` +
      (tips.length ? '\nTop tips for you:\n' + tips.join('\n') : '\nYour profile is already strong – keep paying on time!')
    )
  }

  if (has(q, ['afford', 'how much', 'maximum', 'max', 'borrow', 'eligible amount'])) {
    const alt = buildAlternatives(p, rate)
    return alt.maxLoanSame >= 1000
      ? `Keeping total EMIs at 40% of income, you could comfortably borrow about ${fmt(alt.maxLoanSame)} over ${p.tenure} months at ${rate}% (new EMI of roughly ${fmt(calcEmi(alt.maxLoanSame, rate, p.tenure))}).`
      : `Your existing EMI of ${fmt(p.emi)} already uses most of the safe EMI limit (40% of income = ${fmt(p.income * 0.4)}), so there is almost no room for a new loan right now. Reducing existing EMIs first would help.`
  }

  if (has(q, ['alternative', 'safer', 'lower', 'reduce', 'option', 'smaller', 'suggest'])) {
    const alt = buildAlternatives(p, rate)
    const best = [...alt.options].sort((x, y) => y.a.score - x.a.score)[0]
    return `The best option in my comparison is "${best.name}": ${fmt(best.loan)} for ${best.tenure} months, EMI ${fmt(best.a.newEmi)}, score ${best.a.score}/100 (${best.verdict.label}). See "Alternative Loans" to compare all options.`
  }

  if (has(q, ['existing', 'debt', 'current emi', 'foir', 'ratio', 'obligation']))
    return `Your existing EMI is ${fmt(p.emi)} (${pct(a.existingRatio)} of income). With the new loan, total EMIs would be ${fmt(p.emi + a.newEmi)} (${pct(a.foir)} of income). Under 40% is considered comfortable.`

  if (has(q, ['emi', 'instal', 'monthly pay', 'repay', 'interest']))
    return `For ${fmt(p.loan)} over ${p.tenure} months at ${rate}%: monthly EMI ${fmt(a.newEmi)}, total interest ${fmt(a.totalInterest)}, total repayment ${fmt(a.totalRepay)}. Change the rate on the EMI Calculator page to try other values.`

  if (has(q, ['tenure', 'duration', 'month', 'year', 'longer', 'shorter']))
    return `Your tenure is ${p.tenure} months. A longer tenure lowers the EMI but increases total interest; a shorter one does the opposite. At ${p.tenure} months your EMI is ${fmt(a.newEmi)}. Check "Alternative Loans" for a longer-tenure comparison.`

  if (has(q, ['age', 'retire', 'maturity', 'old']))
    return `You are ${p.age} now and would be about ${a.ageAtMaturity.toFixed(1)} when the loan ends. Age does NOT reduce your score – it is only used to check that the loan finishes before a typical lender age limit (about 65).`

  if (has(q, ['expense', 'spend', 'saving', 'buffer', 'left']))
    return `Your expenses are ${fmt(p.expenses)} (${pct(a.expenseRatio)} of income). After expenses, existing EMI and the new EMI you would have ${fmt(a.leftover)} left each month (${pct(a.leftoverRatio)} of income).`

  if (has(q, ['income', 'salary', 'earn']))
    return `Your monthly income is ${fmt(p.income)} (${fmt(p.income * 12)} per year). Your requested loan is ${a.loanToAnnual.toFixed(2)}x that yearly income.`

  if (has(q, ['score', 'rating', 'points', 'risk', 'category']))
    return (
      `Your CreditPulse score is ${a.score}/100 – ${a.risk.label}.\n` +
      a.breakdown.map((b) => `• ${b.label}: ${b.points.toFixed(1)}/${b.max}`).join('\n') +
      disclaimer
    )

  return 'I did not quite get that. Try asking about your score, rejection reasons, how to improve, EMI, how much you can afford, tenure, age or safer loan options.'
}
