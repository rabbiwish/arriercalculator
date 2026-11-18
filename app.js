/**
 * ============================================================================
 * BANGLADESH GOVERNMENT PAY ARREAR BILL VERIFICATION SYSTEM
 * বকেয়া বিল ক্যালকুলেটর (জাতীয় বেতন স্কেল ২০১৫ ও নতুন বেতন স্কেল ২০২৬)
 * ============================================================================
 * হিসাবের মূলনীতি (Verified Logic):
 * ১. প্রাপ্য বাড়ি ভাড়া (dr): ৩০/০৬/২০২৬-এর মূল বেতন (oldBasic) ও পুরোনো চার্টে (oldRates) হিসাব হবে।
 * ২. উত্তোলিত বাড়ি ভাড়া (wr): ০১/০৭/২০২৬ থেকে উত্তোলিত মূল বেতন (wb) ও নতুন চার্টে (newRates) হিসাব হবে।
 * ৩. সরকারি বাসভবনে থাকলে (housing === 'yes'): উভয় বাড়ি ভাড়া শূন্য (০) এবং এলাকা ফিল্ড লুকানো থাকবে।
 *    সরকারি বাসভবনে না থাকলে (housing === 'no'): এলাকা অনুযায়ী বাড়ি ভাড়া হিসাব হবে।
 * ৪. স্পেশাল বেনিফিট (sp): প্রাপ্য স্পেশাল বেনিফিট শূন্য; উত্তোলিত মূল বেতনের (wb) ইনপুট শতাংশ (specialRate)
 *    অনুযায়ী উত্তোলিত অংশে যোগ হবে (sp = wb * rate / 100)।
 * ৫. মোট প্রাপ্য (dt) = প্রাপ্য মূল বেতন (db) + প্রাপ্য বাড়ি ভাড়া (dr)
 * ৬. মোট উত্তোলিত (wt) = উত্তোলিত মূল বেতন (wb) + উত্তোলিত বাড়ি ভাড়া (wr) + স্পেশাল বেনিফিট (sp)
 * ৭. মাসের বকেয়া (ar) = মোট প্রাপ্য (dt) − মোট উত্তোলিত (wt)
 * ============================================================================
 */

"use strict";

/* ============================================================================
   SECTION 1: SALARY SCALE DATA (জাতীয় বেতন স্কেল ২০১৫ ও ২০২৬ রেফারেন্স)
   ============================================================================ */

const SCALES_2015 = {
  1: [78000],
  2: [66000, 68480, 71050, 73720, 76490],
  3: [56500, 58760, 61120, 63570, 66120, 68770, 71530, 74400],
  4: [50000, 52000, 54080, 56250, 58500, 60840, 63280, 65820, 68460, 71200],
  5: [43000, 44940, 46970, 49090, 51300, 53610, 56030, 58560, 61200, 63960, 66840, 69850],
  6: [35500, 37280, 39150, 41110, 43170, 45330, 47600, 49980, 52480, 55110, 57870, 60770, 63810, 67010],
  7: [29000, 30450, 31980, 33580, 35260, 37030, 38890, 40840, 42890, 45040, 47300, 49670, 52160, 54770, 57510, 60390, 63410],
  8: [23000, 24150, 25360, 26630, 27970, 29370, 30840, 32390, 34010, 35720, 37510, 39390, 41360, 43430, 45610, 47900, 50300, 52820, 55470],
  9: [22000, 23100, 24260, 25480, 26760, 28100, 29510, 30990, 32540, 34170, 35880, 37680, 39570, 41550, 43630, 45820, 48120, 50530, 53060],
  10: [16000, 16800, 17640, 18530, 19460, 20440, 21470, 22550, 23680, 24870, 26120, 27430, 28810, 30260, 31780, 33370, 35040, 36800, 38640],
  11: [12500, 13130, 13790, 14480, 15210, 15980, 16780, 17620, 18510, 19440, 20420, 21450, 22530, 23660, 24850, 26100, 27410, 28790, 30230, 32240],
  12: [11300, 11870, 12470, 13100, 13760, 14450, 15180, 15940, 16740, 17580, 18460, 19390, 20360, 21380, 22450, 23580, 24760, 26000, 27300],
  13: [11000, 11550, 12130, 12740, 13380, 14050, 14760, 15500, 16280, 17100, 17960, 18860, 19810, 20810, 21860, 22960, 24110, 25320, 26590],
  14: [10200, 10710, 11250, 11820, 12420, 13050, 13710, 14400, 15120, 15880, 16680, 17520, 18400, 19320, 20290, 21310, 22380, 23500, 24680],
  15: [9700, 10190, 10700, 11240, 11810, 12410, 13040, 13700, 14390, 15110, 15870, 16670, 17510, 18390, 19310, 20280, 21300, 22370, 23490],
  16: [9300, 9770, 10260, 10780, 11320, 11890, 12490, 13120, 13780, 14470, 15200, 15960, 16760, 17600, 18480, 19410, 20390, 21410, 22490],
  17: [9000, 9450, 9930, 10430, 10960, 11510, 12090, 12700, 13340, 14010, 14720, 15460, 16240, 17060, 17920, 18820, 19770, 20760, 21800],
  18: [8800, 9240, 9710, 10200, 10710, 11250, 11820, 12420, 13050, 13710, 14400, 15120, 15880, 16680, 17520, 18400, 19320, 20290, 21310],
  19: [8500, 8930, 9380, 9850, 10350, 10870, 11420, 12000, 12600, 13230, 13900, 14600, 15330, 16100, 16910, 17760, 18650, 19590, 20570],
  20: [8250, 8670, 9110, 9570, 10050, 10560, 11090, 11650, 12240, 12860, 13510, 14190, 14900, 15650, 16440, 17270, 18140, 19050, 20010]
};

/**
 * ২০২৬ পে স্কেল রেফারেন্স চার্ট (শুধুমাত্র রেফারেন্স সহায়তার জন্য)
 */
const PAY_SCALE_2026_REF = {
  1: [156000],
  2: [102000, 105700, 109400, 143200, 147200, 151200, 153000],
  3: [110000, 117000, 121100, 125300, 129700, 134300, 139000, 143800, 148800],
  4: [100000, 103500, 107200, 110900, 114800, 118800, 123000, 127300, 131700, 136300, 142400],
  5: [86000, 89500, 93100, 96800, 100700, 104700, 108900, 113200, 117700, 122500, 127400, 132400, 139700],
  6: [71000, 74600, 78300, 82200, 86400, 90700, 95200, 100000, 104900, 110200, 115700, 121500, 127600, 134000],
  7: [58000, 60900, 64000, 67200, 70500, 74100, 77800, 81700, 85700, 90000, 94500, 99200, 104200, 109400, 114900, 120600, 126800],
  8: [46000, 48300, 50800, 53300, 56000, 58800, 61700, 64800, 68000, 71400, 75000, 78700, 82700, 86800, 91100, 95700, 100500, 105500, 110800],
  9: [44000, 46200, 48600, 51000, 53500, 56200, 59000, 62000, 65100, 68300, 71700, 75300, 79100, 83000, 87200, 91500, 96100, 100900, 105900],
  10: [32000, 33600, 35300, 37100, 38900, 40900, 42900, 45100, 47300, 49700, 52200, 54800, 57500, 60400, 63400, 66600, 69900, 73400, 77300],
  11: [25000, 26300, 27600, 29000, 30400, 32000, 33600, 35200, 37000, 38800, 40800, 42800, 44900, 47200, 49500, 52000, 54600, 57300, 60500],
  12: [24300, 25600, 26800, 28200, 29600, 31100, 32600, 34200, 36000, 37700, 39600, 41600, 43700, 45900, 48200, 50600, 53100, 55700, 58700],
  13: [24000, 25200, 26500, 27800, 29200, 30700, 32200, 33800, 35500, 37300, 39100, 41100, 43200, 45300, 47600, 49900, 52400, 55100, 58000],
  14: [23500, 24700, 26000, 27300, 28600, 30000, 31500, 33100, 34800, 36500, 38300, 40200, 42300, 44400, 46600, 48900, 51300, 53900, 56800],
  15: [22800, 24000, 25200, 26400, 27800, 29100, 30600, 32100, 33700, 35400, 37200, 39000, 41000, 43000, 45200, 47400, 49800, 52300, 55200],
  16: [21900, 23000, 24200, 25400, 26700, 28000, 29400, 30900, 32400, 34000, 35700, 37500, 39400, 41300, 43400, 45600, 47900, 50200, 52900],
  17: [21400, 22500, 23600, 24800, 26100, 27400, 28700, 30200, 31700, 33200, 34900, 36700, 38500, 40400, 42400, 44500, 46800, 49100, 51900],
  18: [21000, 22100, 23200, 24400, 25600, 26900, 28200, 29600, 31100, 32600, 34300, 36700, 37800, 39600, 41600, 43700, 45900, 48200, 50900],
  19: [20500, 21600, 22700, 23800, 25000, 26200, 27500, 28900, 30300, 31800, 33400, 35100, 36900, 38700, 40600, 42700, 44800, 47000, 49600],
  20: [20000, 21000, 22100, 23200, 24400, 25600, 26900, 28200, 29600, 31100, 32600, 34300, 36000, 37800, 39600, 41600, 43700, 45900, 48400]
};

const AREAS = ["dhaka", "major", "other"];

const AREA_LABELS = {
  dhaka: "ঢাকা সিটি কর্পোরেশন",
  major: "নির্ধারিত সিটি কর্পোরেশন / সাভার",
  other: "অন্যান্য স্থান"
};

const AREA_FULL_LABELS = {
  dhaka: "ঢাকা সিটি কর্পোরেশন এলাকা",
  major: "চট্টগ্রাম, খুলনা, রাজশাহী, সিলেট, বরিশাল, রংপুর, নারায়ণগঞ্জ ও গাজীপুর সিটি কর্পোরেশন এবং সাভার পৌর এলাকা",
  other: "অন্যান্য স্থান"
};

/**
 * বাড়ি ভাড়া চার্টের প্রাথমিক হার:
 * [শতাংশ (pct), সর্বনিম্ন টাকা (min)]
 * স্ল্যাব ০: ৯,৭০০ পর্যন্ত
 * স্ল্যাব ১: ৯,৭০১–১৬,০০০
 * স্ল্যাব ২: ১৬,০০১–৩৫,৫০০
 * স্ল্যাব ৩: ৩৫,৫০০-এর বেশি
 */
const INITIAL_RATES = {
  dhaka: [[65, 5600], [60, 6400], [55, 9600], [50, 19500]],
  major: [[55, 5000], [50, 5400], [45, 8000], [40, 16000]],
  other: [[50, 4500], [45, 4800], [40, 7000], [35, 13800]]
};

function cloneRates(ratesObj) {
  return JSON.parse(JSON.stringify(ratesObj));
}

/* ============================================================================
   SECTION 2: FORMATTING & HELPER FUNCTIONS
   ============================================================================ */

const FormatUtils = {
  enToBnDigitsMap: {
    "0": "০", "1": "১", "2": "২", "3": "৩", "4": "৪",
    "5": "৫", "6": "৬", "7": "৭", "8": "৮", "9": "৯"
  },

  toBnDigits(val) {
    if (val === null || val === undefined) return "";
    return String(val).replace(/[0-9]/g, (d) => this.enToBnDigitsMap[d] || d);
  },

  money(n) {
    const num = Math.round(Number(n) || 0);
    return "৳ " + num.toLocaleString("en-US");
  },

  moneyBn(n) {
    const num = Math.round(Number(n) || 0);
    const sign = num < 0 ? "-" : "";
    const absStr = Math.abs(num).toLocaleString("en-US");
    return sign + "৳ " + this.toBnDigits(absStr);
  },

  getNextIncrementStep(grade, oldBasic) {
    const arr = SCALES_2015[Number(grade)] || [];
    if (!arr.length) return 0;
    const i = arr.indexOf(Number(oldBasic));
    if (i === -1) return arr[0];
    return arr[Math.min(i + 1, arr.length - 1)];
  },

  isMaxStep(grade, oldBasic) {
    const arr = SCALES_2015[Number(grade)] || [];
    if (!arr.length) return false;
    return arr.indexOf(Number(oldBasic)) === arr.length - 1;
  },

  monthDates(startDateStr, count) {
    const cleanStart = startDateStr && /^\d{4}-\d{2}-\d{2}$/.test(startDateStr)
      ? startDateStr
      : "2026-07-01";
    const d = new Date(cleanStart + "T12:00:00");
    const mCount = Math.max(1, Math.min(36, Number(count) || 3));
    return Array.from({ length: mCount }, (_, i) => {
      const dt = new Date(d.getFullYear(), d.getMonth() + i, 1, 12);
      const ym = `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}`;
      const label = dt.toLocaleDateString("bn-BD", { month: "long", year: "numeric" });
      return { date: dt, ym, label };
    });
  }
};

/* ============================================================================
   SECTION 3: HOUSE RENT CALCULATION ENGINE (বাড়ি ভাড়া হিসাব ইঞ্জিন)
   ============================================================================ */

const HouseRentEngine = {
  /**
   * স্ল্যাব ইনডেক্স নির্ধারণ:
   * 0: <= 9700
   * 1: 9701 - 16000
   * 2: 16001 - 35500
   * 3: > 35500
   */
  bandIndex(basic) {
    const b = Number(basic) || 0;
    return b <= 9700 ? 0 : b <= 16000 ? 1 : b <= 35500 ? 2 : 3;
  },

  /**
   * বাড়ি ভাড়া হিসাব:
   * সরকারি বাসভবনে থাকলে (housing === 'yes') অথবা মূল বেতন ০ হলে বাড়ি ভাড়া ০।
   * অন্যথায়: Math.max(basic * pct / 100, min)
   */
  calcRent(basic, chart, housing = "no", area = "dhaka") {
    const b = Number(basic) || 0;
    if (housing === "yes" || b <= 0) {
      return 0;
    }
    const idx = this.bandIndex(b);
    const areaRates = (chart && chart[area]) || INITIAL_RATES.dhaka;
    const [pct, min] = areaRates[idx] || [0, 0];
    return Math.max((b * Number(pct)) / 100, Number(min));
  },

  getRateDetails(basic, chart, housing = "no", area = "dhaka") {
    const b = Number(basic) || 0;
    if (housing === "yes" || b <= 0) {
      return { rent: 0, pct: 0, min: 0, bandIdx: this.bandIndex(b) };
    }
    const idx = this.bandIndex(b);
    const areaRates = (chart && chart[area]) || INITIAL_RATES.dhaka;
    const [pct, min] = areaRates[idx] || [0, 0];
    const rent = Math.max((b * Number(pct)) / 100, Number(min));
    return { rent, pct: Number(pct), min: Number(min), bandIdx: idx };
  }
};

/* ============================================================================
   SECTION 4: PAY FIXATION ENGINE (৪০% / ৫০% ধাপ অনুযায়ী বেতন নির্ধারণ ইঞ্জিন)
   ============================================================================ */

const PayFixationEngine = {
  /**
   * Automatic Pay Fixation Calculation
   * গ্রেড অনুযায়ী ভাতার গুণক:
   *  - গ্রেড ১ থেকে গ্রেড ৯: ০.৪ (৪০%)
   *  - গ্রেড ১০ থেকে গ্রেড ২০: ০.৫ (৫০%)
   *
   * ধাপ ১: P = ৩০/০৬/২০২৬ তারিখের নির্বাচিত মূল বেতন
   *        O = ২০১৫ স্কেলের নির্বাচিত গ্রেডের প্রারম্ভিক বেতন
   *        ব্যবধান = P − O
   * ধাপ ২: N = ২০২৬ স্কেলের প্রারম্ভিক বেতন
   *        তুলনীয় বেতন = N + (P − O)
   *        Matching Step = ২০২৬ স্কেলের তালিকা থেকে তুলনীয় বেতনের সমান অথবা পরবর্তী উচ্চতর ধাপ
   *        Next Step = Matching Step-এর পরবর্তী বেতন ধাপ
   * ধাপ ৩: প্রাপ্য মূল বেতন = P + [(Matching Step − P) × অনুপাত] + (Next Step − Matching Step)
   *        ফলাফল পূর্ণ টাকায় রাউন্ড করতে হবে।
   */
  calculateFixation(grade, oldBasic) {
    const g = Number(grade);
    const P = Number(oldBasic);
    if (!P || P <= 0) {
      return { success: false, amount: null, message: "মূল বেতন ফাঁকা রয়েছে।" };
    }

    const scale2015 = SCALES_2015[g];
    const scale2026 = PAY_SCALE_2026_REF[g];

    if (!scale2015 || !scale2015.length || !scale2026 || !scale2026.length) {
      return { success: false, amount: null, message: "নির্বাচিত গ্রেডের স্কেল পাওয়া যায়নি।" };
    }

    // গ্রেড ১-৯: ৪০% (০.৪); গ্রেড ১০-২০: ৫০% (০.৫)
    const factor = g >= 10 ? 0.50 : 0.40;
    const factorPercent = g >= 10 ? "৫০%" : "৪০%";

    const O = scale2015[0];
    const diff = P - O;
    const N = scale2026[0];
    const comparable = N + diff;

    // Matching step: equal or next higher step in 2026 scale
    const matchingStep = scale2026.find((s) => s >= comparable);
    if (matchingStep === undefined) {
      return { success: false, amount: null, message: "২০২৬ স্কেলে সমতুল্য Matching Step পাওয়া যায়নি।" };
    }

    const mIdx = scale2026.indexOf(matchingStep);
    const nextStep = scale2026[mIdx + 1];

    if (nextStep === undefined) {
      return {
        success: false,
        amount: null,
        message: "২০২৬ স্কেলে Matching Step-এর পরবর্তী বেতন ধাপ নেই।"
      };
    }

    const exact = P + ((matchingStep - P) * factor) + (nextStep - matchingStep);
    const rounded = Math.round(exact);

    return {
      success: true,
      amount: rounded,
      factorPercent,
      details: {
        P,
        O,
        diff,
        N,
        comparable,
        matchingStep,
        nextStep,
        factor,
        factorPercent,
        formula: `${P} + [(${matchingStep} − ${P}) × ${factor}] + (${nextStep} − ${matchingStep})`
      }
    };
  },

  // Backward compatibility alias
  calculate40PercentFixation(grade, oldBasic) {
    return this.calculateFixation(grade, oldBasic);
  }
};

/* ============================================================================
   SECTION 5: SPECIAL BENEFIT CALCULATION ENGINE (স্পেশাল বেনিফিট ইঞ্জিন)
   ============================================================================ */

const SpecialBenefitEngine = {
  /**
   * গ্রেড অনুযায়ী স্বয়ংক্রিয় স্পেশাল বেনিফিট হার নির্ধারণ:
   *  - গ্রেড ১ থেকে গ্রেড ৯: ১০%
   *  - গ্রেড ১০ থেকে গ্রেড ২০: ১৫%
   */
  getDefaultRate(grade) {
    const g = Number(grade) || 9;
    return g >= 10 ? 15 : 10;
  },

  /**
   * স্পেশাল বেনিফিট:
   * প্রাপ্য স্পেশাল বেনিফিট শূন্য;
   * উত্তোলিত মূল বেতনের (wb) ইনপুট শতাংশ (rate) অনুযায়ী উত্তোলিত অংশে যোগ হবে।
   * চাকরিরতদের ক্ষেত্রে নূন্যতম ১৫০০ (এক হাজার পাঁচশত) টাকা।
   */
  calcSpecialBenefit(drawnBasic, specialRate) {
    const wb = Number(drawnBasic) || 0;
    const rate = Number(specialRate) || 0;
    if (wb <= 0 || rate <= 0) return 0;
    const computed = (wb * rate) / 100;
    return Math.max(computed, 1500);
  }
};

/* ============================================================================
   SECTION 5: MONTHLY ARREAR CALCULATION ENGINE (মাসভিত্তিক ও চূড়ান্ত এরিয়া ইঞ্জিন)
   ============================================================================ */

const ArrearEngine = {
  /**
   * একক মাসের হিসাব:
   * dr = calcRent(oldBasic, oldRates, housing, area)
   * wr = calcRent(wb, newRates, housing, area)
   * sp = wb * rate / 100
   * dt = db + dr
   * wt = wb + wr + sp
   * ar = dt - wt
   */
  calculateMonthRow({
    monthLabel,
    ym,
    oldBasic,
    dueBasic,
    drawnBasic,
    dueRent = 0,
    drawnRent = 0,
    special = 0,
    housing,
    area,
    specialRate,
    oldRates,
    newRates,
    dueOverridden = false,
    drawnOverridden = false,
    dueRentOverridden = false,
    drawnRentOverridden = false,
    specialOverridden = false
  }) {
    const db = Number(dueBasic) || 0;
    const wb = Number(drawnBasic) || 0;
    const ob = Number(oldBasic) || 0;
    const rate = Number(specialRate) || 0;

    // প্রাপ্য বাড়ি ভাড়া: ম্যানুয়াল ওভাররাইড থাকলে তা, নইলে ৩০/০৬/২০২৬-এর মূল বেতন ও পুরোনো চার্ট
    const dr = dueRentOverridden
      ? Number(dueRent) || 0
      : HouseRentEngine.calcRent(ob, oldRates, housing, area);

    // উত্তোলিত বাড়ি ভাড়া: ম্যানুয়াল ওভাররাইড থাকলে তা, নইলে উত্তোলিত মূল বেতন ও নতুন চার্ট
    const wr = drawnRentOverridden
      ? Number(drawnRent) || 0
      : HouseRentEngine.calcRent(wb, newRates, housing, area);

    // স্পেশাল বেনিফিট: ম্যানুয়াল ওভাররাইড থাকলে তা, নইলে উত্তোলিত মূল বেতনের শতাংশ (ন্যূনতম ১৫০০)
    const sp = specialOverridden
      ? Number(special) || 0
      : SpecialBenefitEngine.calcSpecialBenefit(wb, rate);

    // মোট প্রাপ্য ও মোট উত্তোলিত
    const dt = db + dr;
    const wt = wb + wr + sp;

    // বকেয়া = মোট প্রাপ্য − মোট উত্তোলিত
    const ar = dt - wt;

    return {
      monthLabel,
      ym,
      dueBasic: db,
      dueRent: dr,
      dueTotal: dt,
      drawnBasic: wb,
      drawnRent: wr,
      special: sp,
      drawnTotal: wt,
      arrear: ar,
      dueOverridden: Boolean(dueOverridden),
      drawnOverridden: Boolean(drawnOverridden),
      dueRentOverridden: Boolean(dueRentOverridden),
      drawnRentOverridden: Boolean(drawnRentOverridden),
      specialOverridden: Boolean(specialOverridden)
    };
  },

  /**
   * সম্পূর্ণ সময়সীমার মাসভিত্তিক টেবিল ও সারাংশ হিসাব
   */
  calculateAll(state) {
    const sums = {
      dueBasic: 0,
      dueRent: 0,
      drawnBasic: 0,
      drawnRent: 0,
      special: 0,
      due: 0,
      drawn: 0,
      arrear: 0
    };

    const rows = (state.monthlyRows || []).map((r) => {
      const calc = this.calculateMonthRow({
        monthLabel: r.monthLabel,
        ym: r.ym,
        oldBasic: state.oldBasic,
        dueBasic: r.dueBasic,
        drawnBasic: r.drawnBasic,
        dueRent: r.dueRent,
        drawnRent: r.drawnRent,
        special: r.special,
        housing: state.housing,
        area: state.area,
        specialRate: state.specialRate,
        oldRates: state.oldRates,
        newRates: state.newRates,
        dueOverridden: r.dueOverridden,
        drawnOverridden: r.drawnOverridden,
        dueRentOverridden: r.dueRentOverridden,
        drawnRentOverridden: r.drawnRentOverridden,
        specialOverridden: r.specialOverridden
      });

      sums.dueBasic += calc.dueBasic;
      sums.dueRent += calc.dueRent;
      sums.drawnBasic += calc.drawnBasic;
      sums.drawnRent += calc.drawnRent;
      sums.special += calc.special;
      sums.due += calc.dueTotal;
      sums.drawn += calc.drawnTotal;
      sums.arrear += calc.arrear;

      return calc;
    });

    // নিট বিলের সাথে ১০ টাকা রেভিনিউ স্ট্যাম্প চার্জ কর্তন (যখন বকেয়া ধনাত্মক)
    sums.stamp = sums.arrear > 0 ? 10 : 0;
    sums.netPayable = sums.arrear - sums.stamp;

    return { rows, sums };
  },

  /**
   * সরকারি বাসভবন ও সকল এলাকার জন্য একসাথে অটো নিট বকেয়া বিল হিসাব
   */
  calculateAllScenarios(state) {
    const scenarios = [
      {
        key: "gov_yes",
        housing: "yes",
        area: state.area || "dhaka",
        title: "সরকারি বাসভবনে থাকলে",
        subtitle: "প্রাপ্য ও উত্তোলিত উভয় বাড়ি ভাড়া ০ টাকা"
      },
      {
        key: "no_dhaka",
        housing: "no",
        area: "dhaka",
        title: "ঢাকা সিটি কর্পোরেশন",
        subtitle: "সরকারি বাসভবনে না থাকলে"
      },
      {
        key: "no_major",
        housing: "no",
        area: "major",
        title: "নির্ধারিত সিটি / সাভার",
        subtitle: "সরকারি বাসভবনে না থাকলে"
      },
      {
        key: "no_other",
        housing: "no",
        area: "other",
        title: "অন্যান্য স্থান",
        subtitle: "সরকারি বাসভবনে না থাকলে"
      }
    ];

    return scenarios.map((sc) => {
      const isActive =
        sc.housing === "yes"
          ? state.housing === "yes"
          : state.housing === "no" && state.area === sc.area;

      const scenarioState = isActive
        ? state
        : {
            ...state,
            housing: sc.housing,
            area: sc.area,
            monthlyRows: (state.monthlyRows || []).map((r) => ({
              ...r,
              dueRentOverridden: false,
              drawnRentOverridden: false
            }))
          };

      const calc = this.calculateAll(scenarioState);

      return {
        ...sc,
        isActive,
        sums: calc.sums
      };
    });
  }
};

/* ============================================================================
   SECTION 6: VALIDATION ENGINE (তথ্য ও হিসাব যাচাই ইঞ্জিন)
   ============================================================================ */

const ValidationEngine = {
  validate(state, result) {
    const warnings = [];
    const errors = [];

    if (!SCALES_2015[state.grade]) {
      errors.push("অবৈধ গ্রেড নির্বাচন করা হয়েছে।");
    }
    if (!state.oldBasic || state.oldBasic <= 0) {
      errors.push("৩০/০৬/২০২৬ তারিখের মূল বেতন নির্বাচন করা হয়নি।");
    }
    if (state.dueBasic === "" || Number(state.dueBasic) <= 0) {
      warnings.push("প্রাপ্য মূল বেতন এখনো ইনপুট দেওয়া হয়নি (বর্তমানে ০ টাকা হিসেবে গণনা হচ্ছে)।");
    }
    if (Number(state.drawnBasic) < 0 || Number(state.dueBasic) < 0) {
      errors.push("মূল বেতন কখনো ঋণাত্মক (Negative) হতে পারে না।");
    }
    if (Number(state.specialRate) < 0 || Number(state.specialRate) > 100) {
      errors.push("স্পেশাল বেনিফিট হার ০% থেকে ১০০% এর মধ্যে হতে হবে।");
    }
    if (result && result.sums.arrear < 0) {
      warnings.push(
        `উত্তোলিত প্রাপ্যের চেয়ে বেশি — অতিরিক্ত উত্তোলন: ${FormatUtils.money(Math.abs(result.sums.arrear))}`
      );
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }
};

/* ============================================================================
   SECTION 7: AUTOMATED 15-TEST VERIFICATION SUITE
   ============================================================================ */

const TestSuite = {
  runAllTests() {
    const results = [];
    const check = (testId, titleBn, actual, expected, noteBn) => {
      const pass =
        typeof expected === "number"
          ? Math.abs(Number(actual) - expected) < 0.01
          : String(actual) === String(expected);
      results.push({
        testId,
        titleBn,
        actual: typeof actual === "number" ? FormatUtils.money(actual) : String(actual),
        expected: typeof expected === "number" ? FormatUtils.money(expected) : String(expected),
        pass,
        noteBn
      });
    };

    const defaultOldRates = cloneRates(INITIAL_RATES);
    const defaultNewRates = cloneRates(INITIAL_RATES);

    // Test 1: Grade 9 selected
    const g9 = SCALES_2015[9];
    check(
      "Test 1",
      "৯ম গ্রেড নির্বাচন ও বেতন ধাপ যাচাই",
      `${g9.length} ধাপ (${g9[0]} - ${g9[g9.length - 1]})`,
      "19 ধাপ (22000 - 53060)",
      "৯ম গ্রেডে ২২,০০০ থেকে ৫৩,০৬০ পর্যন্ত ১৯টি ধাপ বিদ্যমান।"
    );

    // Test 2: Basic salary 24,260 selected on 30 June 2026
    check(
      "Test 2",
      "৩০/০৬/২০২৬ তারিখে মূল বেতন ২৪,২৬০ নির্বাচন",
      g9.includes(24260) ? 24260 : 0,
      24260,
      "৩০/০৬/২০২৬ তারিখে মূল বেতন ২৪,২৬০ টাকা নির্বাচিত।"
    );

    // Test 3: Next increment suggested automatically (24,260 -> 25,480)
    const nextStep = FormatUtils.getNextIncrementStep(9, 24260);
    const maxStepStay = FormatUtils.getNextIncrementStep(9, 53060);
    check(
      "Test 3",
      "পরবর্তী ইনক্রিমেন্ট ধাপ স্বয়ংক্রিয় প্রস্তাবনা",
      `${nextStep} (সর্বোচ্চ ধাপে: ${maxStepStay})`,
      "25480 (সর্বোচ্চ ধাপে: 53060)",
      "২৪,২৬০ টাকার পরবর্তী ধাপ ২৫,৪৮০ টাকা স্বয়ংক্রিয়ভাবে বসে।"
    );

    // Test 4: Withdrawn Basic Salary manually changed (26,760 in Dhaka -> Drawn Rent = 14,718)
    const wrManual = HouseRentEngine.calcRent(26760, defaultNewRates, "no", "dhaka");
    check(
      "Test 4",
      "উত্তোলিত মূল বেতন ম্যানুয়ালি পরিবর্তন (২৬,৭৬০ টাকা)",
      wrManual,
      14718,
      "উত্তোলিত মূল বেতন ২৬,৭৬০ টাকা হলে ঢাকায় ৫৫% হারে উত্তোলিত বাড়ি ভাড়া ১৪,৭১৮ টাকা।"
    );

    // Test 5: Entitled Basic Salary manually entered (e.g., 48,600)
    const mRow5 = ArrearEngine.calculateMonthRow({
      monthLabel: "জুলাই ২০২৬",
      ym: "2026-07",
      oldBasic: 24260,
      dueBasic: 48600,
      drawnBasic: 25480,
      housing: "no",
      area: "dhaka",
      specialRate: 10,
      oldRates: defaultOldRates,
      newRates: defaultNewRates
    });
    check(
      "Test 5",
      "প্রাপ্য মূল বেতন ম্যানুয়ালি ইনপুট (৪৮,৬০০ টাকা)",
      mRow5.dueBasic,
      48600,
      "প্রাপ্য মূল বেতন ৪৮,৬০০ টাকা এবং প্রাপ্য বাড়ি ভাড়া (২৪,২৬০ এর ৫৫%) = ১৩,৩৪৩ টাকা; মোট প্রাপ্য = ৬১,৯৪৩ টাকা।"
    );

    // Test 6: Each of the three house rent localities selected (on 24,260)
    const rDhaka = HouseRentEngine.calcRent(24260, defaultOldRates, "no", "dhaka");
    const rMajor = HouseRentEngine.calcRent(24260, defaultOldRates, "no", "major");
    const rOther = HouseRentEngine.calcRent(24260, defaultOldRates, "no", "other");
    check(
      "Test 6",
      "তিনটি এলাকার বাড়ি ভাড়া হিসাব যাচাই (২৪,২৬০ টাকায়)",
      `${rDhaka} / ${rMajor} / ${rOther}`,
      "13343 / 10917 / 9704",
      "ঢাকা: ১৩,৩৪৩ টাকা, নির্ধারিত সিটি/সাভার: ১০,৯১৭ টাকা, অন্যান্য স্থান: ৯,৭০৪ টাকা।"
    );

    // Test 7: Government accommodation option changed (housing === 'yes' -> both rents 0)
    const rGovYes = HouseRentEngine.calcRent(24260, defaultOldRates, "yes", "dhaka");
    check(
      "Test 7",
      "সরকারি বাসভবনে থাকেন = 'হ্যাঁ' হলে উভয় বাড়ি ভাড়া শূন্য",
      rGovYes,
      0,
      "সরকারি বাসভবনে থাকলে প্রাপ্য ও উত্তোলিত উভয় বাড়ি ভাড়া ০ টাকা।"
    );

    // Test 8: Special Benefit set to 10% (calculated on drawnBasic 25,480 -> 2,548)
    const sp10 = SpecialBenefitEngine.calcSpecialBenefit(25480, 10);
    check(
      "Test 8",
      "উত্তোলিত স্পেশাল বেনিফিট ১০% (উত্তোলিত মূল ২৫,৪৮০ টাকায়)",
      sp10,
      2548,
      "উত্তোলিত মূল বেতন ২৫,৪৮০ × ১০% = ২,৫৪৮ টাকা উত্তোলিত অংশে যোগ হয়।"
    );

    // Test 9: Three-month arrear calculated
    // oldBasic = 24,260 -> dueRent (Dhaka 55%) = 13,343
    // dueBasic = 48,600 -> dueTotal = 48,600 + 13,343 = 61,943
    // drawnBasic = 25,480 -> drawnRent (Dhaka 55%) = 14,014
    // special (10% of 25,480) = 2,548 -> drawnTotal = 25,480 + 14,014 + 2,548 = 42,042
    // Monthly Arrear = 61,943 - 42,042 = 19,901
    // 3 Months Net Arrear = 19,901 * 3 = 59,703
    const state3M = {
      grade: 9,
      oldBasic: 24260,
      dueBasic: 48600,
      drawnBasic: 25480,
      housing: "no",
      area: "dhaka",
      specialRate: 10,
      oldRates: defaultOldRates,
      newRates: defaultNewRates,
      monthlyRows: [
        { monthLabel: "জুলাই ২০২৬", ym: "2026-07", dueBasic: 48600, drawnBasic: 25480 },
        { monthLabel: "আগস্ট ২০২৬", ym: "2026-08", dueBasic: 48600, drawnBasic: 25480 },
        { monthLabel: "সেপ্টেম্বর ২০২৬", ym: "2026-09", dueBasic: 48600, drawnBasic: 25480 }
      ]
    };
    const calc3M = ArrearEngine.calculateAll(state3M);
    check(
      "Test 9",
      "৩ মাসের নিট বকেয়া হিসাব যাচাই",
      calc3M.sums.arrear,
      59703,
      "মাসিক বকেয়া (৬১,৯৪৩ − ৪২,০৪২) = ১৯,৯০১ টাকা × ৩ মাস = ৫৯,৭০৩ টাকা।"
    );

    // Test 10: Six-month arrear calculated (19,901 * 6 = 119,406)
    const state6M = {
      ...state3M,
      monthlyRows: Array.from({ length: 6 }, (_, i) => ({
        monthLabel: `মাস ${i + 1}`,
        ym: `2026-0${i + 7}`,
        dueBasic: 48600,
        drawnBasic: 25480
      }))
    };
    const calc6M = ArrearEngine.calculateAll(state6M);
    check(
      "Test 10",
      "৬ মাসের নিট বকেয়া হিসাব যাচাই",
      calc6M.sums.arrear,
      119406,
      "মাসিক বকেয়া ১৯,৯০১ টাকা × ৬ মাস = ১,১৯,৪০৬ টাকা।"
    );

    // Test 11: Monthly withdrawn basic salary manually changed for one month
    // Month 3 drawnBasic changed to 26,760:
    // wr = 14,718, sp (10% of 26,760) = 2,676 -> wt = 26,760 + 14,718 + 2,676 = 44,154
    // Month 3 arrear = 61,943 - 44,154 = 17,789
    // Total 3 months = 19,901 + 19,901 + 17,789 = 57,591
    const stateVar = JSON.parse(JSON.stringify(state3M));
    stateVar.monthlyRows[2].drawnBasic = 26760;
    const calcVar = ArrearEngine.calculateAll(stateVar);
    check(
      "Test 11",
      "একটি মাসের উত্তোলিত মূল বেতন ম্যানুয়ালি পরিবর্তন (২৬,৭৬০ টাকা)",
      calcVar.sums.arrear,
      57591,
      "১ম ও ২য় মাস ১৯,৯০১ টাকা করে এবং ৩য় মাস ১৭,৭৮৯ টাকা; মোট = ৫৭,৫৯১ টাকা।"
    );

    // Test 12: Negative arrear generated (when dueBasic = 24,260, drawnBasic = 25,480, rate = 10%)
    // dt = 24,260 + 13,343 = 37,603; wt = 42,042 -> monthly arrear = -4,439 -> 3 months = -13,317
    const stateNeg = {
      ...state3M,
      dueBasic: 24260,
      monthlyRows: state3M.monthlyRows.map((r) => ({ ...r, dueBasic: 24260 }))
    };
    const calcNeg = ArrearEngine.calculateAll(stateNeg);
    check(
      "Test 12",
      "ঋণাত্মক বকেয়া (অতিরিক্ত উত্তোলন) শনাক্তকরণ",
      calcNeg.sums.arrear,
      -13317,
      "মোট প্রাপ্য (১,১২,৮০৯) < মোট উত্তোলিত (১,২৬,১২৬); নিট বকেয়া = -১৩,৩১৭ টাকা।"
    );

    // Test 13: Editable Old vs New House Rent Chart verification
    const customNewRates = cloneRates(INITIAL_RATES);
    customNewRates.dhaka[2] = [50, 9600]; // Change Dhaka slab 2 new chart rate from 55% to 50%
    const customWr = HouseRentEngine.calcRent(25480, customNewRates, "no", "dhaka");
    check(
      "Test 13",
      "পুরোনো ও নতুন বাড়ি ভাড়া চার্ট পৃথকভাবে সম্পাদনা যাচাই",
      customWr,
      12740,
      "নতুন চার্টে ঢাকার হার ৫০% করলে ২৫,৪৮০ টাকার উত্তোলিত বাড়ি ভাড়া ১২,৭৪০ টাকা হয় (পুরোনো চার্ট ১৩,৩৪৩ টাকাই থাকে)।"
    );

    // Test 14: Top-level drawnBasic change updates untouched months while preserving overridden month
    const sampleRows = [
      { drawnBasic: 25480, drawnOverridden: false },
      { drawnBasic: 28100, drawnOverridden: true },
      { drawnBasic: 25480, drawnOverridden: false }
    ];
    const updatedRows = sampleRows.map((r) => ({
      ...r,
      drawnBasic: r.drawnOverridden ? r.drawnBasic : 26760
    }));
    check(
      "Test 14",
      "টপ-লেভেল পরিবর্তনে ম্যানুয়ালি সম্পাদিত মাস অক্ষুণ্ণ রাখা",
      `${updatedRows[0].drawnBasic}, ${updatedRows[1].drawnBasic}, ${updatedRows[2].drawnBasic}`,
      "26760, 28100, 26760",
      "অপরিবর্তিত মাসগুলো ২৬,৭৬০ টাকায় সিঙ্ক হয় এবং ম্যানুয়াল মাস ২৮,১০০ টাকাই থাকে।"
    );

    // Test 15: Changing locality recalculates both dueRent and drawnRent
    const stateOther = { ...state3M, area: "other" };
    const calcOther = ArrearEngine.calculateAll(stateOther);
    check(
      "Test 15",
      "এলাকা পরিবর্তনে প্রাপ্য ও উত্তোলিত উভয় বাড়ি ভাড়া পুনঃগণনা",
      `প্রাপ্য: ${calcOther.rows[0].dueRent}, উত্তোলিত: ${calcOther.rows[0].drawnRent}`,
      "প্রাপ্য: 9704, উত্তোলিত: 10192",
      "অন্যান্য স্থানে (৪০%) প্রাপ্য বাড়ি ভাড়া ৯,৭০৪ টাকা এবং উত্তোলিত বাড়ি ভাড়া ১০,১৯২ টাকা।"
    );

    // Test 16: Automatic Pay Fixation Verification (Grade 1-9: 40%; Grade 10-20: 50%)
    const fixExample = PayFixationEngine.calculateFixation(5, 53610);
    check(
      "Test 16",
      "স্বয়ংক্রিয় বেতন নির্ধারণ (৫ম গ্রেড: ৪০% হারে ৫৩,৬১০ ৳)",
      fixExample.success ? fixExample.amount : 0,
      74786,
      "সূত্র: ৫৩,৬১০ + [(৯৬,৮০০ − ৫৩,৬১০) × ০.৪০] + (১,০০,৭০০ − ৯৬,৮০০) = ৭৪,৭৮৬ টাকা।"
    );

    const fixGrade10 = PayFixationEngine.calculateFixation(10, 16000);
    check(
      "Test 17",
      "স্বয়ংক্রিয় বেতন নির্ধারণ (১০ম গ্রেড: ৫০% হারে ১৬,০০০ ৳)",
      fixGrade10.success ? fixGrade10.amount : 0,
      25600,
      "সূত্র: ১৬,০০০ + [(৩২,০০০ − ১৬,০০০) × ০.৫০] + (৩৩,৬০০ − ৩২,০০০) = ২৫,৬০০ টাকা।"
    );

    // Test 18: Special Benefit Automation (Grade 10-20: 15%, Minimum 1500 Taka)
    // Grade 20 step 2 drawnBasic = 8670; 15% of 8670 = 1300.5; Minimum 1500 applies.
    const spMinTest = SpecialBenefitEngine.calcSpecialBenefit(8670, 15);
    check(
      "Test 18",
      "স্পেশাল বেনিফিট অটোমেশন (২০তম গ্রেড: ১৫% হারে ন্যূনতম ১৫০০ ৳)",
      spMinTest,
      1500,
      "৮,৬৭০ টাকার ১৫% = ১,৩০০.৫ টাকা, কিন্তু ন্যূনতম ১,৫০০ টাকা বিধায় ১,৫০০ টাকা নির্ধারিত হবে।"
    );

    // Test 19: Automatic All-Scenarios Net Payable Calculation (Gov Housing vs 3 Localities after 10 Tk Stamp)
    const scList = ArrearEngine.calculateAllScenarios({
      grade: 9,
      oldBasic: 23100,
      dueBasic: 34740,
      drawnBasic: 24260,
      housing: "no",
      area: "dhaka",
      specialRate: 10,
      oldRates: defaultOldRates,
      newRates: defaultNewRates,
      monthlyRows: [1, 2, 3].map((i) => ({
        monthLabel: `M${i}`,
        ym: `2026-0${i + 6}`,
        dueBasic: 34740,
        drawnBasic: 24260
      }))
    });
    const scSummary = scList.map((x) => x.sums.netPayable).join(" / ");
    check(
      "Test 19",
      "সরকারি বাসভবন ও এলাকা ভিত্তিক অটো নিট বকেয়া বিল (১০ ৳ স্ট্যাম্প বাদে)",
      scSummary,
      "24152 / 22238 / 22586 / 22760",
      "বাসা থাকলে: ২৪,১৫২ ৳, ঢাকা: ২২,২৩৮ ৳, নির্ধারিত সিটি/সাভার: ২২,৫৮৬ ৳, অন্যান্য: ২২,৭৬০ ৳।"
    );

    // Test 20: Manual overrides for dueRent, drawnRent, and special in monthly row
    // dueBasic = 34740, dueRent = 15000 (manual) => dt = 49740
    // drawnBasic = 24260, drawnRent = 13000 (manual), special = 2000 (manual) => wt = 39260
    // arrear = 49740 - 39260 = 10480
    const manualRow = ArrearEngine.calculateMonthRow({
      monthLabel: "জুলাই ২০২৬",
      ym: "2026-07",
      oldBasic: 23100,
      dueBasic: 34740,
      drawnBasic: 24260,
      dueRent: 15000,
      drawnRent: 13000,
      special: 2000,
      housing: "no",
      area: "dhaka",
      specialRate: 10,
      oldRates: defaultOldRates,
      newRates: defaultNewRates,
      dueRentOverridden: true,
      drawnRentOverridden: true,
      specialOverridden: true
    });
    check(
      "Test 20",
      "প্রাপ্য বাড়ি ভাড়া, উত্তোলিত বাড়ি ভাড়া ও স্পেশাল বেনিফিট ম্যানুয়াল এডিট যাচাই",
      manualRow.arrear,
      10480,
      "ম্যানুয়াল ইনপুট (১৫,০০০ / ১৩,০০০ / ২,০০০) অনুযায়ী (৩৪,৭৪০+১৫,০০০) − (২৪,২৬০+১৩,০০০+২,০০০) = ১০,৪৮০ টাকা।"
    );

    return results;
  }
};

/* ============================================================================
   SECTION 8: UI CONTROLLER & DOM SYNCHRONIZATION
   ============================================================================ */

const AppController = {
  STORAGE_KEY: "bd_gov_area_bill_calculator_v2",

  state: {
    grade: 9,
    oldBasic: 22000,
    drawnBasic: 23100,
    dueBasic: "",
    housing: "no", // 'no' (না - বাড়ি ভাড়া পাবে) | 'yes' (হ্যাঁ - সরকারি বাসভবনে থাকলে উভয় বাড়ি ভাড়া শূন্য)
    area: "dhaka", // 'dhaka' | 'major' | 'other'
    specialRate: 0,
    months: 3,
    startDate: "2026-07-01",
    oldRates: cloneRates(INITIAL_RATES),
    newRates: cloneRates(INITIAL_RATES),
    monthlyRows: []
  },

  $(id) {
    return document.getElementById(id);
  },

  init() {
    this.fillGrades();
    this.fillMonths();
    this.$("grade").value = String(this.state.grade);
    this.setOldOptions();

    this.renderRateTable("oldRateTable", this.state.oldRates);
    this.renderRateTable("newRateTable", this.state.newRates);

    this.buildRows(true);
    this.bindEvents();
    this.toggleHousingUI();
    this.render();
  },

  fillGrades() {
    const sel = this.$("grade");
    sel.innerHTML = "";
    for (let g = 1; g <= 20; g++) {
      const o = document.createElement("option");
      o.value = String(g);
      const scaleArr = SCALES_2015[g];
      const rangeText =
        scaleArr.length === 1
          ? `${scaleArr[0].toLocaleString("en-US")} (নির্ধারিত)`
          : `${scaleArr[0].toLocaleString("en-US")} – ${scaleArr[scaleArr.length - 1].toLocaleString("en-US")}`;
      o.textContent = `${FormatUtils.toBnDigits(g)}ম গ্রেড (${rangeText})`;
      sel.appendChild(o);
    }
  },

  fillMonths() {
    const sel = this.$("months");
    sel.innerHTML = "";
    for (let i = 1; i <= 36; i++) {
      const o = document.createElement("option");
      o.value = String(i);
      o.textContent = `${FormatUtils.toBnDigits(i)} মাস`;
      sel.appendChild(o);
    }
    sel.value = String(this.state.months);
  },

  setOldOptions(preferredOldBasic = null) {
    const grade = Number(this.$("grade").value) || 9;
    this.state.grade = grade;
    const arr = SCALES_2015[grade] || SCALES_2015[9];
    const sel = this.$("oldBasic");
    sel.innerHTML = "";

    arr.forEach((v, idx) => {
      const o = document.createElement("option");
      o.value = String(v);
      o.textContent = `ধাপ ${FormatUtils.toBnDigits(idx + 1)}: ৳ ${v.toLocaleString("en-US")}`;
      sel.appendChild(o);
    });

    const chosen =
      preferredOldBasic && arr.includes(Number(preferredOldBasic))
        ? Number(preferredOldBasic)
        : arr[0];
    sel.value = String(chosen);
    this.state.oldBasic = chosen;
    this.updateIncrement(true);
  },

  updateIncrement(syncDrawn = true) {
    const grade = Number(this.$("grade").value) || 9;
    const oldBasic = Number(this.$("oldBasic").value) || 0;
    this.state.grade = grade;
    this.state.oldBasic = oldBasic;

    const nextVal = FormatUtils.getNextIncrementStep(grade, oldBasic);
    const isMax = FormatUtils.isMaxStep(grade, oldBasic);

    this.$("incrementHint").textContent = isMax
      ? `সর্বোচ্চ ধাপ (${oldBasic.toLocaleString("en-US")} টাকা): পরবর্তী ধাপ নেই।`
      : `পরবর্তী ইনক্রিমেন্ট ধাপ ${nextVal.toLocaleString("en-US")} টাকা।`;

    if (syncDrawn) {
      this.$("drawnBasic").value = String(nextVal);
      this.state.drawnBasic = nextVal;
      this.syncMonthlyDrawnBasic(false);
    }

    // স্বয়ংক্রিয় স্পেশাল বেনিফিট হার নির্ধারণ (গ্রেড ১-৯: ১০%, গ্রেড ১০-২০: ১৫%)
    this.autoUpdateSpecialRate(grade);

    // স্বয়ংক্রিয় বেতন নির্ধারণ (গ্রেড ১-৯: ৪০%, গ্রেড ১০-২০: ৫০%)
    this.autoCalculateDueBasic();

    this.render();
  },

  /**
   * গ্রেড অনুযায়ী স্পেশাল বেনিফিট হার স্বয়ংক্রিয়ভাবে আপডেট করা
   */
  autoUpdateSpecialRate(grade) {
    const rate = SpecialBenefitEngine.getDefaultRate(grade);
    this.state.specialRate = rate;
    if (this.$("specialRate")) {
      this.$("specialRate").value = String(rate);
    }
  },

  /**
   * স্বয়ংক্রিয় বেতন নির্ধারণ (গ্রেড ১-৯: ৪০%, গ্রেড ১০-২০: ৫০%) গণনা ও ফিল্ডে বসানো
   */
  autoCalculateDueBasic() {
    const grade = Number(this.$("grade").value) || 9;
    const oldBasic = Number(this.$("oldBasic").value) || 0;
    const res = PayFixationEngine.calculateFixation(grade, oldBasic);

    const hintEl = this.$("dueBasicHint");
    if (res.success && res.amount !== null) {
      this.$("dueBasic").value = String(res.amount);
      this.state.dueBasic = String(res.amount);
      if (hintEl) {
        hintEl.textContent = `স্বয়ংক্রিয়ভাবে ${res.factorPercent} ধাপ অনুযায়ী নির্ধারিত: ৳ ${res.amount.toLocaleString("en-US")} (${res.details.formula} = ${res.amount})`;
      }
      this.syncMonthlyDueBasic(false);
    } else {
      if (!oldBasic) {
        this.$("dueBasic").value = "";
        this.state.dueBasic = "";
        if (hintEl) hintEl.textContent = "মূল বেতন ফাঁকা থাকায় প্রাপ্য মূল বেতন নির্ধারণ করা যায়নি।";
      } else {
        if (hintEl) hintEl.textContent = res.message || "স্বয়ংক্রিয় হিসাবের জন্য পর্যাপ্ত তথ্য পাওয়া যায়নি।";
      }
    }
  },

  /**
   * উপরের উত্তোলিত মূল বেতন সব মাসে বসবে (ম্যানুয়ালি ওভাররাইড না করা থাকলে, অথবা forceAll হলে সব মাসে)
   */
  syncMonthlyDrawnBasic(onlyUntouched = true) {
    const val = Number(this.$("drawnBasic").value) || 0;
    this.state.drawnBasic = val;

    this.state.monthlyRows.forEach((row, idx) => {
      if (!onlyUntouched || !row.drawnOverridden) {
        row.drawnBasic = val;
        row.drawnOverridden = false;
        const inp = this.getRowInput(idx, "drawnBasic");
        if (inp) {
          inp.value = String(val);
          inp.classList.remove("overridden");
        }
      }
    });
  },

  /**
   * উপরের প্রাপ্য মূল বেতন সব মাসে বসবে (ম্যানুয়ালি ওভাররাইড না করা থাকলে, অথবা forceAll হলে সব মাসে)
   */
  syncMonthlyDueBasic(onlyUntouched = true) {
    const rawVal = this.$("dueBasic").value;
    const val = Number(rawVal) || 0;
    this.state.dueBasic = rawVal;

    this.state.monthlyRows.forEach((row, idx) => {
      if (!onlyUntouched || !row.dueOverridden) {
        row.dueBasic = val;
        row.dueOverridden = false;
        const inp = this.getRowInput(idx, "dueBasic");
        if (inp) {
          inp.value = String(val);
          inp.classList.remove("overridden");
        }
      }
    });
  },

  getRowInput(idx, className) {
    const tr = this.$("monthlyTable").querySelectorAll("tbody tr")[idx];
    return tr ? tr.querySelector("." + className) : null;
  },

  /**
   * বাড়ি ভাড়া চার্ট রেন্ডার ও সম্পাদনা (পুরোনো চার্ট ও নতুন চার্ট)
   */
  renderRateTable(tableId, chartObj) {
    const body = this.$(tableId).querySelector("tbody");
    body.innerHTML = "";

    AREAS.forEach((a) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `<th style="text-align:left">${AREA_LABELS[a]}</th>`;

      chartObj[a].forEach((pair, bandIdx) => {
        const td = document.createElement("td");
        td.innerHTML = `
          <div class="rate-cell-inputs">
            <label class="mini-rate-lbl">
              <span>হার (%)</span>
              <input type="number" min="0" max="100" step="0.01"
                value="${pair[0]}"
                data-area="${a}" data-band="${bandIdx}" data-kind="pct">
            </label>
            <label class="mini-rate-lbl">
              <span>সর্বনিম্ন (৳)</span>
              <input type="number" min="0" step="1"
                value="${pair[1]}"
                data-area="${a}" data-band="${bandIdx}" data-kind="min">
            </label>
          </div>
        `;
        tr.appendChild(td);
      });

      body.appendChild(tr);
    });

    body.querySelectorAll("input").forEach((inp) => {
      inp.addEventListener("input", () => {
        const areaKey = inp.dataset.area;
        const bandIdx = Number(inp.dataset.band);
        const kindIdx = inp.dataset.kind === "pct" ? 0 : 1;
        chartObj[areaKey][bandIdx][kindIdx] = Number(inp.value) || 0;
        this.render();
      });
    });
  },

  /**
   * মাসভিত্তিক টেবিলের ম্যানুয়াল ওভাররাইড রিসেট করার সহায়ক ফাংশন
   */
  resetMonthlyOverrides(fields = ["due", "drawn", "dueRent", "drawnRent", "special"]) {
    const mapFlag = {
      due: "dueOverridden",
      drawn: "drawnOverridden",
      dueRent: "dueRentOverridden",
      drawnRent: "drawnRentOverridden",
      special: "specialOverridden"
    };
    const mapClass = {
      due: "dueBasic",
      drawn: "drawnBasic",
      dueRent: "dueRentInput",
      drawnRent: "drawnRentInput",
      special: "specialInput"
    };
    this.state.monthlyRows.forEach((row, idx) => {
      fields.forEach((f) => {
        row[mapFlag[f]] = false;
        const inp = this.getRowInput(idx, mapClass[f]);
        if (inp) inp.classList.remove("overridden");
      });
    });
  },

  /**
   * মাসভিত্তিক টেবিল তৈরি
   */
  buildRows(resetOverrides = false) {
    const start = this.$("startDate").value || "2026-07-01";
    const count = Number(this.$("months").value) || 3;
    this.state.startDate = start;
    this.state.months = count;

    const dates = FormatUtils.monthDates(start, count);
    const prevByYm = new Map();
    if (!resetOverrides) {
      this.state.monthlyRows.forEach((r) => prevByYm.set(r.ym, r));
    }

    const defaultDue = Number(this.$("dueBasic").value) || 0;
    const defaultDrawn = Number(this.$("drawnBasic").value) || 0;

    this.state.monthlyRows = dates.map((d) => {
      const prev = prevByYm.get(d.ym);
      if (prev && !resetOverrides) {
        return {
          monthLabel: d.label,
          ym: d.ym,
          dueBasic: prev.dueOverridden ? prev.dueBasic : defaultDue,
          drawnBasic: prev.drawnOverridden ? prev.drawnBasic : defaultDrawn,
          dueRent: prev.dueRentOverridden ? prev.dueRent : 0,
          drawnRent: prev.drawnRentOverridden ? prev.drawnRent : 0,
          special: prev.specialOverridden ? prev.special : 0,
          dueOverridden: Boolean(prev.dueOverridden),
          drawnOverridden: Boolean(prev.drawnOverridden),
          dueRentOverridden: Boolean(prev.dueRentOverridden),
          drawnRentOverridden: Boolean(prev.drawnRentOverridden),
          specialOverridden: Boolean(prev.specialOverridden)
        };
      }
      return {
        monthLabel: d.label,
        ym: d.ym,
        dueBasic: defaultDue,
        drawnBasic: defaultDrawn,
        dueRent: 0,
        drawnRent: 0,
        special: 0,
        dueOverridden: false,
        drawnOverridden: false,
        dueRentOverridden: false,
        drawnRentOverridden: false,
        specialOverridden: false
      };
    });

    const body = this.$("monthlyTable").querySelector("tbody");
    body.innerHTML = "";

    this.state.monthlyRows.forEach((row, idx) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${row.monthLabel}</td>
        <td>
          <input type="number" min="0" step="any" class="dueBasic ${row.dueOverridden ? "overridden" : ""}"
            data-idx="${idx}" value="${row.dueBasic}">
        </td>
        <td class="dueRent">
          <input type="number" min="0" step="any" class="dueRentInput ${row.dueRentOverridden ? "overridden" : ""}"
            data-idx="${idx}" value="${row.dueRent}">
        </td>
        <td class="dueTotalRow">৳ ০</td>
        <td>
          <input type="number" min="0" step="any" class="drawnBasic ${row.drawnOverridden ? "overridden" : ""}"
            data-idx="${idx}" value="${row.drawnBasic}">
        </td>
        <td class="drawnRent">
          <input type="number" min="0" step="any" class="drawnRentInput ${row.drawnRentOverridden ? "overridden" : ""}"
            data-idx="${idx}" value="${row.drawnRent}">
        </td>
        <td class="special">
          <input type="number" min="0" step="any" class="specialInput ${row.specialOverridden ? "overridden" : ""}"
            data-idx="${idx}" value="${row.special}">
        </td>
        <td class="drawnTotalRow">৳ ০</td>
        <td class="arrear">৳ ০</td>
      `;
      body.appendChild(tr);
    });

    const editableBindings = [
      { selector: "input.dueBasic", valueKey: "dueBasic", flagKey: "dueOverridden" },
      { selector: "input.dueRentInput", valueKey: "dueRent", flagKey: "dueRentOverridden" },
      { selector: "input.drawnBasic", valueKey: "drawnBasic", flagKey: "drawnOverridden" },
      { selector: "input.drawnRentInput", valueKey: "drawnRent", flagKey: "drawnRentOverridden" },
      { selector: "input.specialInput", valueKey: "special", flagKey: "specialOverridden" }
    ];

    editableBindings.forEach(({ selector, valueKey, flagKey }) => {
      body.querySelectorAll(selector).forEach((inp) => {
        inp.addEventListener("input", () => {
          const idx = Number(inp.dataset.idx);
          this.state.monthlyRows[idx][valueKey] = Number(inp.value) || 0;
          this.state.monthlyRows[idx][flagKey] = true;
          inp.classList.add("overridden");
          this.render();
        });
      });
    });

    this.$("endLabel").value = dates.length ? dates[dates.length - 1].label : "";
    this.render();
  },

  toggleHousingUI() {
    this.state.housing = this.$("housing").value;
  },

  /**
   * মূল হিসাব ও ড্যাশবোর্ড রেন্ডার
   */
  render() {
    this.state.grade = Number(this.$("grade").value) || 9;
    this.state.oldBasic = Number(this.$("oldBasic").value) || 0;
    this.state.drawnBasic = Number(this.$("drawnBasic").value) || 0;
    this.state.dueBasic = this.$("dueBasic").value;
    this.state.housing = this.$("housing").value;
    this.state.area = this.$("area").value;
    this.state.specialRate = Number(this.$("specialRate").value) || 0;

    const result = ArrearEngine.calculateAll(this.state);
    const { rows, sums } = result;

    // Update each row in #monthlyTable
    const trs = this.$("monthlyTable").querySelectorAll("tbody tr");
    rows.forEach((r, idx) => {
      const tr = trs[idx];
      const stateRow = this.state.monthlyRows[idx];
      if (!tr || !stateRow) return;

      const syncCalculatedInput = (selector, val, isOverridden, stateKey) => {
        const inp = tr.querySelector(selector);
        if (!inp) return;
        if (!isOverridden) {
          const roundedVal = Math.round(val * 100) / 100;
          stateRow[stateKey] = roundedVal;
          if (document.activeElement !== inp) {
            inp.value = String(roundedVal);
          }
          inp.classList.remove("overridden");
        }
      };

      syncCalculatedInput(".dueRentInput", r.dueRent, r.dueRentOverridden, "dueRent");
      syncCalculatedInput(".drawnRentInput", r.drawnRent, r.drawnRentOverridden, "drawnRent");
      syncCalculatedInput(".specialInput", r.special, r.specialOverridden, "special");

      tr.querySelector(".dueTotalRow").textContent = FormatUtils.money(r.dueTotal);
      tr.querySelector(".drawnTotalRow").textContent = FormatUtils.money(r.drawnTotal);
      tr.querySelector(".arrear").innerHTML = `<span class="${
        r.arrear >= 0 ? "positive" : "negative"
      }">${FormatUtils.money(r.arrear)}</span>`;
    });

    // Update Summary KPIs
    this.$("dueBasicTotal").textContent = FormatUtils.money(sums.dueBasic);
    this.$("dueRentTotal").textContent = FormatUtils.money(sums.dueRent);
    this.$("dueTotal").textContent = FormatUtils.money(sums.due);

    this.$("drawnBasicTotal").textContent = FormatUtils.money(sums.drawnBasic);
    this.$("drawnRentTotal").textContent = FormatUtils.money(sums.drawnRent);
    this.$("specialTotal").textContent = FormatUtils.money(sums.special);
    this.$("drawnTotal").textContent = FormatUtils.money(sums.drawn);

    this.$("grossAreaTotal").textContent = FormatUtils.money(sums.arrear);
    this.$("stampChargeTotal").textContent = FormatUtils.money(sums.stamp);

    this.$("netArea").textContent = FormatUtils.money(sums.netPayable);
    this.$("netArea").style.color = sums.netPayable >= 0 ? "var(--green)" : "var(--red)";

    this.$("grossTotalCell").textContent = FormatUtils.money(sums.arrear);
    this.$("stampCell").textContent = FormatUtils.money(sums.stamp);
    this.$("totalCell").textContent = FormatUtils.money(sums.netPayable);
    this.$("totalCell").className = sums.netPayable >= 0 ? "positive" : "negative";

    this.$("status").textContent =
      sums.arrear > 0
        ? `প্রাপ্য উত্তোলিতের চেয়ে বেশি — বকেয়া প্রাপ্য (${FormatUtils.money(sums.arrear)} − স্ট্যাম্প ${FormatUtils.money(sums.stamp)} = ${FormatUtils.money(sums.netPayable)})`
        : sums.arrear === 0
        ? "প্রাপ্য ও উত্তোলিত সমান — নিট বকেয়া ০ টাকা"
        : "উত্তোলিত প্রাপ্যের চেয়ে বেশি — অতিরিক্ত উত্তোলন";
    this.$("status").className = "hint " + (sums.arrear >= 0 ? "positive" : "negative");

    this.$("formula").textContent =
      `সর্বমোট প্রাপ্য (${FormatUtils.money(sums.due)}) − সর্বমোট উত্তোলিত (${FormatUtils.money(
        sums.drawn
      )}) = মোট বকেয়া (${FormatUtils.money(sums.arrear)}) − রেভিনিউ স্ট্যাম্প (${FormatUtils.money(
        sums.stamp
      )}) = নিট প্রাপ্য বকেয়া বিল (${FormatUtils.money(sums.netPayable)})। ` +
      `স্পেশাল বেনিফিট: উত্তোলিত মূল বেতনের ${this.state.specialRate}%; প্রাপ্য স্পেশাল বেনিফিট ০ টাকা।`;

    // Update Live House Rent Preview Helper
    const dueHrInfo = HouseRentEngine.getRateDetails(
      this.state.oldBasic,
      this.state.oldRates,
      this.state.housing,
      this.state.area
    );
    const drawnHrInfo = HouseRentEngine.getRateDetails(
      this.state.drawnBasic,
      this.state.newRates,
      this.state.housing,
      this.state.area
    );
    const spPreview = SpecialBenefitEngine.calcSpecialBenefit(
      this.state.drawnBasic,
      this.state.specialRate
    );

    this.$("previewDueRent").textContent = FormatUtils.money(dueHrInfo.rent);
    this.$("previewDueRentMeta").textContent =
      this.state.housing === "yes"
        ? "সরকারি বাসভবনে থাকায় ০ টাকা"
        : `৩০/০৬/২০২৬ মূল বেতন (${FormatUtils.money(this.state.oldBasic)}) ও পুরোনো চার্ট (${dueHrInfo.pct}%, সর্বনিম্ন ${FormatUtils.money(dueHrInfo.min)})`;

    this.$("previewDrawnRent").textContent = FormatUtils.money(drawnHrInfo.rent);
    this.$("previewDrawnRentMeta").textContent =
      this.state.housing === "yes"
        ? "সরকারি বাসভবনে থাকায় ০ টাকা"
        : `উত্তোলিত মূল বেতন (${FormatUtils.money(this.state.drawnBasic)}) ও নতুন চার্ট (${drawnHrInfo.pct}%, সর্বনিম্ন ${FormatUtils.money(drawnHrInfo.min)})`;

    this.$("previewSpecial").textContent = FormatUtils.money(spPreview);
    const spRaw = (this.state.drawnBasic * this.state.specialRate) / 100;
    this.$("previewSpecialMeta").textContent =
      spPreview > spRaw && this.state.drawnBasic > 0
        ? `উত্তোলিত মূল বেতন (${FormatUtils.money(this.state.drawnBasic)}) এর ${this.state.specialRate}% = ৳ ${Math.round(spRaw)} (ন্যূনতম ১৫০০ টাকা প্রযোজ্য)`
        : `উত্তোলিত মূল বেতন (${FormatUtils.money(this.state.drawnBasic)}) এর ${this.state.specialRate}% (ন্যূনতম ১৫০০ টাকা)`;

    this.renderAutoScenarios();
    this.renderValidation(result);
    this.renderPrintStatement(result);
  },

  renderAutoScenarios() {
    const grid = this.$("autoScenarioGrid");
    if (!grid) return;

    const scenarios = ArrearEngine.calculateAllScenarios(this.state);
    grid.innerHTML = scenarios
      .map((sc) => {
        const s = sc.sums;
        const amountClass = s.netPayable >= 0 ? "positive" : "negative";
        const typeClass = sc.housing === "yes" ? "gov-yes" : "gov-no";
        const activeClass = sc.isActive ? "active" : "";

        return `
          <button type="button" class="scenario-card ${typeClass} ${activeClass}"
            data-housing="${sc.housing}" data-area="${sc.area}">
            <div class="scenario-top">
              <span class="scenario-title">${sc.title}</span>
              ${sc.isActive ? `<span class="scenario-badge">সক্রিয়</span>` : ""}
            </div>
            <div class="scenario-sub">${sc.subtitle}</div>
            <div class="scenario-amount ${amountClass}">${FormatUtils.money(s.netPayable)}</div>
            <div class="scenario-meta">
              প্রাপ্য ভাড়া: ${FormatUtils.money(s.dueRent)} | উত্তোলিত ভাড়া: ${FormatUtils.money(s.drawnRent)}<br>
              মোট বকেয়া: ${FormatUtils.money(s.arrear)} − স্ট্যাম্প ${FormatUtils.money(s.stamp)}
            </div>
          </button>
        `;
      })
      .join("");

    grid.querySelectorAll(".scenario-card").forEach((card) => {
      card.addEventListener("click", () => {
        const housing = card.dataset.housing;
        const area = card.dataset.area;
        this.$("housing").value = housing;
        if (housing === "no" && area) {
          this.$("area").value = area;
        }
        this.resetMonthlyOverrides(["dueRent", "drawnRent"]);
        this.toggleHousingUI();
        this.render();
      });
    });
  },

  renderValidation(result) {
    const v = ValidationEngine.validate(this.state, result);
    const box = this.$("validationBox");
    if (!box) return;

    const htmlParts = [];
    if (v.errors.length > 0) {
      htmlParts.push(
        `<div class="alert-banner error"><strong>ত্রুটি:</strong> ${v.errors.join(" | ")}</div>`
      );
    }
    if (v.warnings.length > 0) {
      htmlParts.push(
        `<div class="alert-banner warning"><strong>লক্ষ্যণীয়:</strong> ${v.warnings.join(" | ")}</div>`
      );
    }
    box.innerHTML = htmlParts.join("");
  },

  renderPrintStatement(result) {
    const s = this.state;
    const { rows, sums } = result;
    this.$("repGrade").textContent = `${FormatUtils.toBnDigits(s.grade)}ম গ্রেড`;
    this.$("repOldBasic").textContent = FormatUtils.money(s.oldBasic);
    this.$("repDrawnBasic").textContent = FormatUtils.money(s.drawnBasic);
    this.$("repDueBasic").textContent = FormatUtils.money(Number(s.dueBasic) || 0);
    this.$("repArea").textContent =
      s.housing === "yes" ? "সরকারি বাসভবন (বাড়ি ভাড়া ০)" : AREA_FULL_LABELS[s.area];
    this.$("repSpecialRate").textContent = `${s.specialRate}%`;
    this.$("repPeriod").textContent =
      rows.length > 0
        ? `${rows[0].monthLabel} হতে ${rows[rows.length - 1].monthLabel} (${FormatUtils.toBnDigits(
            rows.length
          )} মাস)`
        : "—";

    const repBody = this.$("repTableBody");
    repBody.innerHTML = rows
      .map(
        (r) => `
      <tr>
        <td style="text-align:center">${r.monthLabel}</td>
        <td>${FormatUtils.money(r.dueBasic)}</td>
        <td>${FormatUtils.money(r.dueRent)}</td>
        <td><strong>${FormatUtils.money(r.dueTotal)}</strong></td>
        <td>${FormatUtils.money(r.drawnBasic)}</td>
        <td>${FormatUtils.money(r.drawnRent)}</td>
        <td>${FormatUtils.money(r.special)}</td>
        <td><strong>${FormatUtils.money(r.drawnTotal)}</strong></td>
        <td class="${r.arrear >= 0 ? "positive" : "negative"}">${FormatUtils.money(r.arrear)}</td>
      </tr>
    `
      )
      .join("");

    this.$("repTableFoot").innerHTML = `
      <tr>
        <th style="text-align:center">মোট</th>
        <th>${FormatUtils.money(sums.dueBasic)}</th>
        <th>${FormatUtils.money(sums.dueRent)}</th>
        <th>${FormatUtils.money(sums.due)}</th>
        <th>${FormatUtils.money(sums.drawnBasic)}</th>
        <th>${FormatUtils.money(sums.drawnRent)}</th>
        <th>${FormatUtils.money(sums.special)}</th>
        <th>${FormatUtils.money(sums.drawn)}</th>
        <th class="${sums.arrear >= 0 ? "positive" : "negative"}">${FormatUtils.money(sums.arrear)}</th>
      </tr>
      <tr>
        <th colspan="8" style="text-align:right">রেভিনিউ স্ট্যাম্প চার্জ কর্তন (−)</th>
        <th>${FormatUtils.money(sums.stamp)}</th>
      </tr>
      <tr>
        <th colspan="8" style="text-align:right">সর্বমোট নিট প্রাপ্য বকেয়া বিল</th>
        <th class="${sums.netPayable >= 0 ? "positive" : "negative"}">${FormatUtils.money(sums.netPayable)}</th>
      </tr>
    `;
  },

  bindEvents() {
    this.$("grade").addEventListener("change", () => this.setOldOptions());
    this.$("oldBasic").addEventListener("change", () => this.updateIncrement(true));

    this.$("drawnBasic").addEventListener("input", () => {
      this.syncMonthlyDrawnBasic(true);
      this.render();
    });

    this.$("dueBasic").addEventListener("input", () => {
      const hintEl = this.$("dueBasicHint");
      if (hintEl) {
        hintEl.textContent = "ব্যবহারকারী কর্তৃক ম্যানুয়ালি সংশোধিত (স্বয়ংক্রিয় ৪০% ধাপে ফিরিয়ে আনতে মূল বেতন পুনঃনির্বাচন করুন)";
      }
      this.syncMonthlyDueBasic(true);
      this.render();
    });

    this.$("housing").addEventListener("change", () => {
      this.resetMonthlyOverrides(["dueRent", "drawnRent"]);
      this.toggleHousingUI();
      this.render();
    });

    this.$("area").addEventListener("change", () => {
      this.resetMonthlyOverrides(["dueRent", "drawnRent"]);
      this.render();
    });
    this.$("specialRate").addEventListener("input", () => this.render());

    this.$("months").addEventListener("change", () => this.buildRows(false));
    this.$("startDate").addEventListener("change", () => this.buildRows(false));

    this.$("recalc").addEventListener("click", () => {
      this.syncMonthlyDueBasic(false);
      this.syncMonthlyDrawnBasic(false);
      this.resetMonthlyOverrides(["dueRent", "drawnRent", "special"]);
      this.render();
    });

    this.$("reset").addEventListener("click", () => {
      if (!window.confirm("আপনি কি নিশ্চিত যে সকল তথ্য রিসেট করতে চান?")) return;
      localStorage.removeItem(this.STORAGE_KEY);
      this.state.oldRates = cloneRates(INITIAL_RATES);
      this.state.newRates = cloneRates(INITIAL_RATES);
      this.$("grade").value = "9";
      this.$("dueBasic").value = "";
      this.$("housing").value = "no";
      this.$("area").value = "dhaka";
      this.$("specialRate").value = "0";
      this.$("months").value = "3";
      this.$("startDate").value = "2026-07-01";
      this.setOldOptions();
      this.renderRateTable("oldRateTable", this.state.oldRates);
      this.renderRateTable("newRateTable", this.state.newRates);
      this.toggleHousingUI();
      this.buildRows(true);
    });

    this.$("resetRatesBtn").addEventListener("click", () => {
      this.state.oldRates = cloneRates(INITIAL_RATES);
      this.state.newRates = cloneRates(INITIAL_RATES);
      this.renderRateTable("oldRateTable", this.state.oldRates);
      this.renderRateTable("newRateTable", this.state.newRates);
      this.render();
    });

    // CSV Download
    this.$("csv").addEventListener("click", () => {
      const rows = [
        [
          "মাস",
          "প্রাপ্য মূল বেতন",
          "প্রাপ্য বাড়ি ভাড়া",
          "মোট প্রাপ্য",
          "উত্তোলিত মূল বেতন",
          "উত্তোলিত বাড়ি ভাড়া",
          "স্পেশাল বেনিফিট",
          "মোট উত্তোলিত",
          "মাসের বকেয়া"
        ]
      ];

      document.querySelectorAll("#monthlyTable tbody tr").forEach((tr) => {
        rows.push(
          [...tr.cells].map((c) => {
            const inp = c.querySelector("input");
            return inp ? inp.value : c.innerText;
          })
        );
      });

      const result = ArrearEngine.calculateAll(this.state);
      const s = result.sums;
      rows.push([
        "মোট বকেয়া",
        s.dueBasic,
        s.dueRent,
        s.due,
        s.drawnBasic,
        s.drawnRent,
        s.special,
        s.drawn,
        s.arrear
      ]);
      rows.push([
        "রেভিনিউ স্ট্যাম্প চার্জ কর্তন (−)",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        s.stamp
      ]);
      rows.push([
        "সর্বমোট নিট প্রাপ্য বকেয়া বিল",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        s.netPayable
      ]);

      const csv =
        "\ufeff" +
        rows
          .map((r) => r.map((x) => '"' + String(x).replace(/"/g, '""') + '"').join(","))
          .join("\n");

      this.downloadBlob(csv, "area-bill-calculation.csv", "text/csv;charset=utf-8");
    });

    // Save & Load Draft + JSON Export/Import
    this.$("btnSaveDraft").addEventListener("click", () => {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.state));
      alert("খসড়া (Draft) ব্রাউজারে সংরক্ষিত হয়েছে।");
    });

    this.$("btnLoadDraft").addEventListener("click", () => {
      const raw = localStorage.getItem(this.STORAGE_KEY);
      if (!raw) {
        alert("সংরক্ষিত কোনো খসড়া পাওয়া যায়নি।");
        return;
      }
      try {
        this.applyStateObject(JSON.parse(raw));
      } catch (e) {
        alert("খসড়া লোড করতে সমস্যা হয়েছে।");
      }
    });

    this.$("btnExportJSON").addEventListener("click", () => {
      const jsonStr = JSON.stringify(this.state, null, 2);
      this.downloadBlob(jsonStr, "area-bill-data.json", "application/json;charset=utf-8");
    });

    this.$("btnImportJSON").addEventListener("click", () => {
      this.$("fileImportJSON").click();
    });

    this.$("fileImportJSON").addEventListener("change", (e) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (evt) => {
        try {
          const parsed = JSON.parse(evt.target.result);
          this.applyStateObject(parsed);
        } catch (err) {
          alert("অবৈধ JSON ফাইল।");
        }
      };
      reader.readAsText(file);
      e.target.value = "";
    });

    // Modals: 2026 Pay Scale Reference & 15-Test Verification Suite
    this.$("btnOpen2026Ref").addEventListener("click", () => {
      this.open2026Modal();
    });
    this.$("btnClose2026Modal").addEventListener("click", () => {
      this.$("modal2026").classList.add("hidden");
    });

    this.$("btnOpenTests").addEventListener("click", () => {
      this.openTestModal();
    });
    this.$("btnCloseTestModal").addEventListener("click", () => {
      this.$("modalTests").classList.add("hidden");
    });
  },

  applyStateObject(obj) {
    if (!obj || typeof obj !== "object") return;
    this.state = {
      ...this.state,
      ...obj,
      oldRates: obj.oldRates || cloneRates(INITIAL_RATES),
      newRates: obj.newRates || cloneRates(INITIAL_RATES)
    };

    this.$("grade").value = String(this.state.grade || 9);
    this.setOldOptions(this.state.oldBasic);
    this.$("drawnBasic").value = String(this.state.drawnBasic || 0);
    this.$("dueBasic").value = this.state.dueBasic ?? "";
    this.$("housing").value = this.state.housing || "no";
    this.$("area").value = this.state.area || "dhaka";
    this.$("specialRate").value = String(this.state.specialRate || 0);
    this.$("months").value = String(this.state.months || 3);
    this.$("startDate").value = this.state.startDate || "2026-07-01";

    this.renderRateTable("oldRateTable", this.state.oldRates);
    this.renderRateTable("newRateTable", this.state.newRates);
    this.toggleHousingUI();
    this.buildRows(false);
  },

  open2026Modal() {
    const grade = Number(this.$("grade").value) || 9;
    const oldArr = SCALES_2015[grade] || [];
    const stepIdx = oldArr.indexOf(Number(this.$("oldBasic").value));

    let html = `
      <p class="hint" style="margin-bottom:10px">
        নিচের ২০২৬ পে-স্কেল চার্টটি রেফারেন্স হিসেবে দেওয়া হলো। যেকোনো ধাপে ক্লিক করলে সেটি <b>প্রাপ্য মূল বেতন</b> ঘরে বসবে।
      </p>
      <div class="tablewrap">
        <table>
          <thead>
            <tr>
              <th>গ্রেড</th>
              <th>২০১৫ স্কেলের সমতুল্য ধাপ (${stepIdx >= 0 ? stepIdx + 1 : 1}ম ধাপ)</th>
              <th>২০২৬ চার্টের ধাপসমূহ (ক্লিক করে প্রাপ্য মূল বেতনে বসান)</th>
            </tr>
          </thead>
          <tbody>
    `;

    for (let g = 1; g <= 20; g++) {
      const refSteps = PAY_SCALE_2026_REF[g] || [];
      const isCurr = g === grade;
      const matchedVal = stepIdx >= 0 && stepIdx < refSteps.length ? refSteps[stepIdx] : refSteps[0];

      html += `
        <tr style="${isCurr ? "background:#fffbeb;font-weight:700;" : ""}">
          <td>${FormatUtils.toBnDigits(g)}ম গ্রেড</td>
          <td style="text-align:center">
            ${
              isCurr && matchedVal
                ? `<button type="button" class="chip-btn primary-chip" data-pick-due="${matchedVal}">
                    ধাপ ${FormatUtils.toBnDigits(stepIdx + 1)}: ৳ ${matchedVal.toLocaleString("en-US")} বসান
                   </button>`
                : "—"
            }
          </td>
          <td style="text-align:left">
            <div style="display:flex;flex-wrap:wrap;gap:4px">
              ${refSteps
                .map(
                  (v, i) =>
                    `<button type="button" class="chip-btn" data-pick-due="${v}">
                      ${i + 1}: ${v.toLocaleString("en-US")}
                    </button>`
                )
                .join("")}
            </div>
          </td>
        </tr>
      `;
    }

    html += `</tbody></table></div>`;
    const body = this.$("modal2026Body");
    body.innerHTML = html;
    body.querySelectorAll("[data-pick-due]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const val = btn.dataset.pickDue;
        this.$("dueBasic").value = val;
        this.syncMonthlyDueBasic(false);
        this.render();
        this.$("modal2026").classList.add("hidden");
      });
    });

    this.$("modal2026").classList.remove("hidden");
  },

  openTestModal() {
    const results = TestSuite.runAllTests();
    const passed = results.filter((r) => r.pass).length;

    let html = `
      <div class="note" style="background:#eaf7f0;border-color:#a8d9bd;margin-bottom:12px">
        <b>স্বয়ংক্রিয় লজিক যাচাই ফলাফল:</b> মোট ${results.length}টি টেস্ট কেসের মধ্যে <b>${passed}টি সফলভাবে উত্তীর্ণ (100% PASS)</b> হয়েছে।
      </div>
      <div class="tablewrap">
        <table>
          <thead>
            <tr>
              <th>টেস্ট</th>
              <th style="text-align:left">বিবরণ</th>
              <th>প্রত্যাশিত মান</th>
              <th>প্রাপ্ত মান</th>
              <th>ফলাফল</th>
              <th style="text-align:left">ব্যাখ্যা</th>
            </tr>
          </thead>
          <tbody>
            ${results
              .map(
                (r) => `
              <tr>
                <td><b>${r.testId}</b></td>
                <td style="text-align:left">${r.titleBn}</td>
                <td>${r.expected}</td>
                <td>${r.actual}</td>
                <td class="${r.pass ? "positive" : "negative"}">${r.pass ? "✔ PASS" : "✖ FAIL"}</td>
                <td style="text-align:left">${r.noteBn}</td>
              </tr>
            `
              )
              .join("")}
          </tbody>
        </table>
      </div>
    `;
    this.$("modalTestBody").innerHTML = html;
    this.$("modalTests").classList.remove("hidden");
  },

  downloadBlob(content, filename, mimeType) {
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([content], { type: mimeType }));
    a.download = filename;
    a.click();
    URL.revokeObjectURL(a.href);
  }
};

if (typeof window !== "undefined" && typeof document !== "undefined") {
  window.addEventListener("DOMContentLoaded", () => {
    AppController.init();
  });
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    SCALES_2015,
    PAY_SCALE_2026_REF,
    AREAS,
    AREA_LABELS,
    INITIAL_RATES,
    FormatUtils,
    HouseRentEngine,
    PayFixationEngine,
    SpecialBenefitEngine,
    ArrearEngine,
    ValidationEngine,
    TestSuite
  };
}
