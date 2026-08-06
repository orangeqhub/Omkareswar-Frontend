import { useState, useEffect, useMemo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Calculator, RotateCcw, ChevronDown } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { enquiryService } from '../../services/enquiryService';
import { toast } from '../../store/toastStore';

/**
 * Safely parses any property price representation into a valid number.
 */
function parsePropertyPrice(rawPrice) {
  if (rawPrice === null || rawPrice === undefined) return 0;
  if (typeof rawPrice === 'number') {
    return isNaN(rawPrice) || !isFinite(rawPrice) ? 0 : rawPrice;
  }
  if (typeof rawPrice === 'string') {
    const cleaned = rawPrice.replace(/[^0-9.]/g, '');
    const num = parseFloat(cleaned);
    return isNaN(num) || !isFinite(num) ? 0 : num;
  }
  return 0;
}

/**
 * Formats numbers into Indian Rupee currency standard: ₹40,00,000
 */
function formatInrCurrency(value) {
  const num = Number(value || 0);
  if (isNaN(num) || !isFinite(num)) return '₹0';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(Math.round(num));
}

export default function HomeLoanCalculator({ property, initialPrice }) {
  const { i18n } = useTranslation(['properties', 'common']);
  const isTelugu = i18n.language === 'te';

  // 1. Determine base property price safely
  const parsedBasePrice = useMemo(() => {
    if (initialPrice !== undefined) return parsePropertyPrice(initialPrice);
    if (property?.price) return parsePropertyPrice(property.price);
    return 0;
  }, [property, initialPrice]);

  // Default Loan Amount: 80% of Property Price, or 30 Lakhs default
  const defaultLoanAmount = useMemo(() => {
    if (parsedBasePrice > 0) {
      return Math.min(50000000, Math.max(100000, Math.round(parsedBasePrice * 0.8)));
    }
    return 3000000;
  }, [parsedBasePrice]);

  // State
  const user = useAuthStore((s) => s.user);
  const [isApplying, setIsApplying] = useState(false);
  const [loanAmount, setLoanAmount] = useState(defaultLoanAmount);
  const [interestInput, setInterestInput] = useState('8.5');
  const [tenureInput, setTenureInput] = useState('20');
  const [showAmortization, setShowAmortization] = useState(false);

  // Sync with base price changes
  useEffect(() => {
    setLoanAmount(defaultLoanAmount);
  }, [defaultLoanAmount]);

  const resetToDefaults = useCallback(() => {
    setLoanAmount(defaultLoanAmount);
    setInterestInput('8.5');
    setTenureInput('20');
  }, [defaultLoanAmount]);

  const handleApplyLoan = async () => {
    if (!user) {
      toast.info(isTelugu ? 'హోమ్ లోన్ దరఖాస్తు చేసుకోవడానికి దయచేసి లాగిన్ అవ్వండి.' : 'Please login to apply for a home loan.');
      return;
    }

    // 1. Sanitize and validate mobile phone number
    const cleanPhone = (user.mobile || '').replace(/\D/g, '');
    const sanitizedPhone = cleanPhone.length > 10 && cleanPhone.startsWith('91') 
      ? cleanPhone.slice(2) 
      : cleanPhone;

    if (!/^[6-9]\d{9}$/.test(sanitizedPhone)) {
      toast.error(isTelugu 
        ? 'దయచేసి మీ ప్రొఫైల్‌లో సరైన 10 అంకెల మొబైల్ నంబర్‌ను అప్‌డేట్ చేయండి (ఉదాహరణ: 9000000001).' 
        : 'Please update a valid 10-digit mobile number in your profile (e.g., 9000000001).'
      );
      return;
    }

    // 2. Validate UUID formats to prevent backend validation rejection
    const isValidUUID = (id) => {
      return typeof id === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
    };

    const propertyIdVal = isValidUUID(property?.id) ? property.id : null;
    const sellerIdVal = isValidUUID(property?.sellerId) ? property.sellerId : null;

    try {
      setIsApplying(true);
      await enquiryService.create({
        propertyId: propertyIdVal,
        sellerId: sellerIdVal,
        buyerName: user.name || 'Anonymous Buyer',
        buyerPhone: sanitizedPhone,
        buyerEmail: user.email || null,
        enquiryType: 'general',
        message: `Home Loan Assistance Request\nRequested Amount: ${formatInrCurrency(loanAmount)}\nUser ID: ${user.id}\nUser Name: ${user.name || 'Anonymous'}\nUser Role: ${user.role.toUpperCase()}`,
        channel: 'contact',
      });
      
      toast.success(isTelugu 
        ? 'హోమ్ లోన్ దరఖాస్తు విజయవంతంగా పంపబడింది! మా ప్రతినిధి త్వరలో మిమ్మల్ని సంప్రదిస్తారు.' 
        : 'Home Loan application submitted successfully! Our agent will contact you shortly.'
      );
    } catch (error) {
      console.error('Home loan application failed:', error);
      toast.error(isTelugu ? 'దరఖాస్తు పంపడం విఫలమైంది. దయచేసి మళ్ళీ ప్రయత్నించండి.' : 'Failed to submit application. Please try again.');
    } finally {
      setIsApplying(false);
    }
  };

  // Handlers for Input Blur clamping
  const handleAmountBlur = () => {
    if (loanAmount < 100000) setLoanAmount(100000);
    if (loanAmount > 50000000) setLoanAmount(50000000);
  };

  const handleInterestBlur = () => {
    const num = parseFloat(interestInput) || 8.5;
    if (num < 1) {
      setInterestInput('1');
    } else if (num > 20) {
      setInterestInput('20');
    } else {
      setInterestInput(String(num));
    }
  };

  const handleTenureBlur = () => {
    const num = parseInt(tenureInput, 10) || 20;
    if (num < 1) {
      setTenureInput('1');
    } else if (num > 30) {
      setTenureInput('30');
    } else {
      setTenureInput(String(num));
    }
  };

  // Calculations
  const interestRateNum = parseFloat(interestInput) || 0;
  const tenureYearsNum = parseInt(tenureInput, 10) || 0;

  const { monthlyEmi, totalInterest, totalPayable, amortizationSchedule } = useMemo(() => {
    const P = loanAmount;
    const r = interestRateNum / 12 / 100;
    const N = tenureYearsNum * 12;

    if (N <= 0 || P <= 0) {
      return {
        monthlyEmi: 0,
        totalInterest: 0,
        totalPayable: P,
        amortizationSchedule: [],
      };
    }

    let emiVal = 0;
    if (r === 0) {
      emiVal = P / N;
    } else {
      const pow = Math.pow(1 + r, N);
      emiVal = (P * r * pow) / (pow - 1);
    }

    const roundedEmi = Math.round(emiVal);
    const payable = roundedEmi * N;
    const interest = Math.max(0, payable - P);

    // Amortization Schedule Calculation
    const schedule = [];
    let balance = P;

    for (let year = 1; year <= tenureYearsNum; year++) {
      let yearlyInterest = 0;
      let yearlyPrincipal = 0;

      for (let month = 1; month <= 12; month++) {
        const interestMonth = balance * r;
        let principalMonth = roundedEmi - interestMonth;

        if (balance < principalMonth) {
          principalMonth = balance;
        }

        yearlyInterest += interestMonth;
        yearlyPrincipal += principalMonth;
        balance -= principalMonth;
      }

      schedule.push({
        year,
        principalPaid: Math.round(yearlyPrincipal),
        interestPaid: Math.round(yearlyInterest),
        remainingBalance: Math.max(0, Math.round(balance)),
      });
    }

    return {
      monthlyEmi: roundedEmi,
      totalInterest: Math.round(interest),
      totalPayable: Math.round(payable),
      amortizationSchedule: schedule,
    };
  }, [loanAmount, interestRateNum, tenureYearsNum]);

  // Donut SVG parameters
  const totalAmount = loanAmount + totalInterest;
  const principalPercentage = totalAmount > 0 ? (loanAmount / totalAmount) * 100 : 50;
  const interestPercentage = 100 - principalPercentage;

  const radius = 50;
  const strokeWidth = 12;
  const circumference = 2 * Math.PI * radius;
  const principalDash = (principalPercentage / 100) * circumference;
  const interestDash = (interestPercentage / 100) * circumference;

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6 max-w-5xl mx-auto">
      {/* Title Header */}
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h3 className="flex items-center gap-2 text-xl font-bold text-brand-800">
            <Calculator size={22} className="text-brand-600" />
            <span>{isTelugu ? 'హోమ్ లోన్ EMI క్యాలిక్యులేటర్' : 'Home Loan EMI Calculator'}</span>
          </h3>
          <p className="mt-1 text-xs text-gray-500">
            {isTelugu ? 'మీ నెలవారీ హోమ్ లోన్ EMIని తక్షణమే లెక్కించండి.' : 'Calculate your monthly home loan EMI instantly.'}
          </p>
        </div>

        <button
          type="button"
          onClick={resetToDefaults}
          className="inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-gray-50 px-2.5 py-1.5 text-xs font-semibold text-gray-600 transition hover:bg-gray-100 hover:text-brand-800 active:scale-95"
          title="Reset values"
        >
          <RotateCcw size={13} />
          <span>{isTelugu ? 'రీసెట్' : 'Reset'}</span>
        </button>
      </div>

      {/* Calculator Grid */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-start">
        {/* Left Column - Inputs */}
        <div className="space-y-6 lg:col-span-7">
          {/* Input 1: Loan Amount */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-semibold text-gray-700">
                {isTelugu ? 'రుణ మొత్తం (Loan Amount)' : 'Loan Amount'}
              </label>
              <div className="relative w-44">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-gray-400">₹</span>
                <input
                  type="text"
                  value={new Intl.NumberFormat('en-IN').format(loanAmount)}
                  onChange={(e) => {
                    const val = e.target.value.replace(/[^0-9]/g, '');
                    const parsed = parseInt(val, 10) || 0;
                    setLoanAmount(Math.min(50000000, parsed));
                  }}
                  onBlur={handleAmountBlur}
                  className="w-full rounded-lg border border-gray-300 pl-7 pr-3 py-1.5 text-right text-sm font-bold text-gray-800 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100"
                />
              </div>
            </div>
            <input
              type="range"
              min={100000}
              max={50000000}
              step={50000}
              value={loanAmount}
              onChange={(e) => setLoanAmount(Number(e.target.value))}
              className="h-1.5 w-full cursor-pointer appearance-none rounded-lg bg-gray-200 accent-brand-600"
              aria-label="Loan Amount Range"
            />
            <div className="flex justify-between text-[10px] text-gray-400 font-medium">
              <span>₹1 L</span>
              <span>₹5 Cr</span>
            </div>
          </div>

          {/* Input 2: Rate of Interest */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-semibold text-gray-700">
                {isTelugu ? 'వడ్డీ రేటు (Rate of Interest p.a)' : 'Rate of Interest (p.a)'}
              </label>
              <div className="relative w-28">
                <input
                  type="text"
                  value={interestInput}
                  onChange={(e) => {
                    const val = e.target.value.replace(/[^0-9.]/g, '');
                    const parts = val.split('.');
                    let cleaned = val;
                    if (parts.length > 2) {
                      cleaned = parts[0] + '.' + parts.slice(1).join('');
                    }
                    setInterestInput(cleaned);
                  }}
                  onBlur={handleInterestBlur}
                  className="w-full rounded-lg border border-gray-300 pl-3 pr-6 py-1.5 text-right text-sm font-bold text-gray-800 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100"
                />
                <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-sm font-semibold text-gray-400">%</span>
              </div>
            </div>
            <input
              type="range"
              min={1}
              max={20}
              step={0.05}
              value={parseFloat(interestInput) || 8.5}
              onChange={(e) => setInterestInput(e.target.value)}
              className="h-1.5 w-full cursor-pointer appearance-none rounded-lg bg-gray-200 accent-brand-600"
              aria-label="Interest Rate Range"
            />
            <div className="flex justify-between text-[10px] text-gray-400 font-medium">
              <span>1%</span>
              <span>20%</span>
            </div>
          </div>

          {/* Input 3: Loan Tenure */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-semibold text-gray-700">
                {isTelugu ? 'రుణ కాలపరిమితి (Loan Tenure)' : 'Loan Tenure'}
              </label>
              <div className="relative w-28">
                <input
                  type="text"
                  value={tenureInput}
                  onChange={(e) => {
                    const val = e.target.value.replace(/[^0-9]/g, '');
                    setTenureInput(val);
                  }}
                  onBlur={handleTenureBlur}
                  className="w-full rounded-lg border border-gray-300 pl-3 pr-12 py-1.5 text-right text-sm font-bold text-gray-800 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100"
                />
                <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-gray-400">Years</span>
              </div>
            </div>
            <input
              type="range"
              min={1}
              max={30}
              step={1}
              value={parseInt(tenureInput, 10) || 20}
              onChange={(e) => setTenureInput(e.target.value)}
              className="h-1.5 w-full cursor-pointer appearance-none rounded-lg bg-gray-200 accent-brand-600"
              aria-label="Loan Tenure Range"
            />
            <div className="flex justify-between text-[10px] text-gray-400 font-medium">
              <span>1 Yr</span>
              <span>30 Yrs</span>
            </div>
          </div>
        </div>

        {/* Right Column - Results Dashboard */}
        <div className="lg:col-span-5 rounded-xl border border-gray-100 bg-gray-50/50 p-5 lg:p-6">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center lg:flex-col">
            {/* SVG Donut Chart */}
            <div className="relative flex h-40 w-40 shrink-0 items-center justify-center mx-auto">
              <svg width="100%" height="100%" viewBox="0 0 140 140" className="rotate-[30deg]">
                {/* Background Ring Track */}
                <circle
                  cx="70"
                  cy="70"
                  r={radius}
                  fill="transparent"
                  stroke="#e5e7eb"
                  strokeWidth={strokeWidth}
                />
                {/* Interest Segment */}
                <circle
                  cx="70"
                  cy="70"
                  r={radius}
                  fill="transparent"
                  stroke="#eab308" // Muted gold / Amber-500
                  strokeWidth={strokeWidth}
                  strokeDasharray={`${interestDash} ${circumference}`}
                  strokeDashoffset={0}
                  transform="rotate(-90 70 70)"
                />
                {/* Principal Segment */}
                <circle
                  cx="70"
                  cy="70"
                  r={radius}
                  fill="transparent"
                  stroke="#6b8e23" // Olive green (Brand accent)
                  strokeWidth={strokeWidth}
                  strokeDasharray={`${principalDash} ${circumference}`}
                  strokeDashoffset={0}
                  transform={`rotate(${-90 + interestPercentage * 3.6} 70 70)`}
                />
              </svg>
              {/* Inner Circle Label */}
              <div className="absolute flex flex-col items-center justify-center text-center">
                <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">
                  {isTelugu ? 'ప్రిన్సిపల్' : 'Principal'}
                </span>
                <span className="text-xs font-extrabold text-brand-800">
                  {principalPercentage.toFixed(0)}%
                </span>
              </div>
            </div>

            {/* Values Breakdown */}
            <div className="w-full space-y-4">
              <div className="border-b border-gray-200/60 pb-3 text-center sm:text-left lg:text-center">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                  {isTelugu ? 'నెలవారీ EMI' : 'Monthly EMI'}
                </span>
                <p className="text-2xl font-extrabold text-brand-700 mt-0.5 sm:text-3xl">
                  {formatInrCurrency(monthlyEmi)}
                </p>
              </div>

              <div className="space-y-2.5">
                {/* Principal Amount Row */}
                <div className="flex items-center justify-between text-xs border-b border-gray-100 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full bg-brand-600"></span>
                    <span className="font-semibold text-gray-500">
                      {isTelugu ? 'అసలు మొత్తం' : 'Principal Amount'}
                    </span>
                  </div>
                  <span className="font-bold text-gray-800">
                    {formatInrCurrency(loanAmount)}
                  </span>
                </div>

                {/* Total Interest Row */}
                <div className="flex items-center justify-between text-xs border-b border-gray-100 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full bg-yellow-500"></span>
                    <span className="font-semibold text-gray-500">
                      {isTelugu ? 'మొత్తం వడ్డీ' : 'Total Interest'}
                    </span>
                  </div>
                  <span className="font-bold text-gray-800">
                    {formatInrCurrency(totalInterest)}
                  </span>
                </div>

                {/* Total Payable Row */}
                <div className="flex items-center justify-between text-xs pb-1">
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full bg-gray-300"></span>
                    <span className="font-semibold text-gray-500">
                      {isTelugu ? 'మొత్తం చెల్లించవలసినది' : 'Total Amount'}
                    </span>
                  </div>
                  <span className="font-bold text-gray-800">
                    {formatInrCurrency(totalPayable)}
                  </span>
                </div>
              </div>

              {/* Apply for Loan Button */}
              <div className="pt-3 border-t border-gray-200/50 mt-3">
                <button
                  type="button"
                  onClick={handleApplyLoan}
                  disabled={isApplying}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-brand-600 py-3 text-sm font-bold text-warm-white transition hover:bg-brand-700 disabled:opacity-60 active:scale-95 shadow-sm cursor-pointer"
                >
                  {isApplying ? (
                    <>
                      <svg className="animate-spin h-5 w-5 text-warm-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>{isTelugu ? 'దరఖాస్తు పంపబడుతోంది...' : 'Applying...'}</span>
                    </>
                  ) : (
                    <span>{isTelugu ? 'హోమ్ లోన్ అసిస్టెన్స్ పొందండి' : 'Get Loan Assistance'}</span>
                  )}
                </button>
                <p className="text-[10px] text-gray-400 text-center mt-1.5 font-medium">
                  {isTelugu 
                    ? 'ఆసక్తి వ్యక్తం చేసిన వెంటనే మా బ్యాంక్ ప్రతినిధి సంప్రదిస్తారు.' 
                    : 'Our financial agent will contact you upon expressing interest.'
                  }
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Yearly Amortization Schedule Collapsible Section */}
      <div className="mt-8 border-t border-gray-100 pt-6">
        <button
          type="button"
          onClick={() => setShowAmortization(!showAmortization)}
          className="flex w-full items-center justify-between rounded-xl bg-gray-50 px-4 py-3 text-sm font-semibold text-brand-800 transition hover:bg-gray-100"
        >
          <span>{isTelugu ? 'వార్షిక అమొర్టైజేషన్ షెడ్యూల్ చూడండి' : 'View Yearly Amortization Schedule'}</span>
          <ChevronDown
            size={16}
            className={`text-brand-600 transition-transform duration-200 ${showAmortization ? 'rotate-180' : ''}`}
          />
        </button>

        {showAmortization && (
          <div className="mt-4 overflow-x-auto rounded-xl border border-gray-200">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-gray-600 font-semibold">
                  <th className="px-4 py-3">{isTelugu ? 'సంవత్సరం' : 'Year'}</th>
                  <th className="px-4 py-3 text-right">{isTelugu ? 'చెల్లించిన అసలు' : 'Principal Paid'}</th>
                  <th className="px-4 py-3 text-right">{isTelugu ? 'చెల్లించిన వడ్డీ' : 'Interest Paid'}</th>
                  <th className="px-4 py-3 text-right">{isTelugu ? 'మిగిలిన బ్యాలెన్స్' : 'Remaining Balance'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-gray-700">
                {amortizationSchedule.map((row) => (
                  <tr key={row.year} className="hover:bg-gray-50/40 transition">
                    <td className="px-4 py-3 font-semibold">{isTelugu ? `${row.year}వ సంవత్సరం` : `Year ${row.year}`}</td>
                    <td className="px-4 py-3 text-right font-medium text-brand-700">{formatInrCurrency(row.principalPaid)}</td>
                    <td className="px-4 py-3 text-right font-medium text-amber-700">{formatInrCurrency(row.interestPaid)}</td>
                    <td className="px-4 py-3 text-right font-semibold text-gray-800">{formatInrCurrency(row.remainingBalance)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
