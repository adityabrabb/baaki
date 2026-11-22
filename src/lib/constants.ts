// Purpose: every magic number and string for Baaki (PRD §6, §8, §9).
// Nothing else in src/lib may hard-code these values.

// Storage and schema (PRD §9)
export const STORAGE_KEY = 'baaki:v1';
export const SCHEMA_VERSION = 1;

// Calendar: Asia/Kolkata convention; all dates are YYYY-MM-DD strings
export const TIMEZONE = 'Asia/Kolkata';
export const DATE_FORMAT = 'yyyy-MM-dd';
export const MONTH_FORMAT = 'yyyy-MM';
export const DATE_ONLY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
export const MONTH_KEY_PATTERN = /^\d{4}-\d{2}$/;
export const FIRST_DAY_OF_MONTH = 1;

// Enumerations (types.ts derives its unions from these tuples)
export const TONES = ['gentle', 'firm', 'final'] as const;
export const LANGUAGES = ['english', 'hinglish', 'hindi'] as const;
export const PAYMENT_METHODS = ['upi', 'cash'] as const;
export const REMINDER_CHANNELS = ['whatsapp', 'copy'] as const;
export const RISK_BADGES = ['reliable', 'usually_late', 'risky'] as const;

// Settings defaults
export const DEFAULT_TONE = 'gentle';
export const DEFAULT_LANGUAGE = 'hinglish';

// Business seed (PRD §8)
export const BUSINESS_NAME = "Priya's Maths Classes";
export const OPENING_BALANCE = 18000;
export const DEFAULT_BUFFER = 5000;
// Seed only: expected cash on the next rent date sits this far under the buffer
export const BAD_DAY_SHORTFALL = 1000;
export const UPI_ID = 'priya.tutor@upi';
export const PHONE_PREFIX = '+91 90000 0';
export const PHONE_DIGITS = 4;

// Roster seed (PRD §1, §8)
export const STUDENT_COUNT = 32;
export const FAMILY_COUNT = 28;
export const BATCH_NAMES = ['Batch A', 'Batch B', 'Batch C', 'Batch D'] as const;
export const CLASS_MIN = 8;
export const CLASS_MAX = 10;
export const FEE_MIN = 1500;
export const FEE_MAX = 2500;
export const FEE_STEP = 100;
export const FEE_DUE_DAY = 5;
export const SEED_CHILD_NAMES = [
   'Aarav', 'Diya', 'Kabir', 'Meera', 'Ishaan', 'Saanvi', 'Vihaan', 'Anika',
   'Reyansh', 'Tara', 'Dev', 'Ira', 'Yash', 'Nisha', 'Arjun', 'Kiara',
   'Advait', 'Riya', 'Shaurya', 'Pooja', 'Rohan', 'Sneha', 'Kunal', 'Asha',
   'Tanvi', 'Ritvik', 'Gauri', 'Om', 'Siddhi', 'Nikhil', 'Esha', 'Parth',
] as const;
export const SEED_SURNAMES = [
   'Kulkarni', 'Deshpande', 'Joshi', 'Patil', 'Pawar', 'Gokhale', 'Mehta',
   'Iyer', 'Naik', 'Bhave', 'Sathe', 'Rane', 'Sawant', 'Kale', 'Jadhav',
   'Chavan', 'Ghorpade', 'Bapat', 'Oak', 'Phadke', 'Karve', 'Limaye', 'Modak',
   'Wagh', 'Thorat', 'Shinde', 'Khare', 'Garde',
] as const;
export const FAMILY_LABEL = 'family';
export const FAMILY_SUFFIX = ` ${FAMILY_LABEL}`;
export const NAME_WORD_PATTERN = /\s+/;
export const SIBLING_FAMILY_COUNT = 4;

// Seeded history (PRD §8)
export const RNG_SEED = 1729;
export const HISTORY_MONTHS = 6;
export const RELIABLE_FAMILY_COUNT = 17;
export const USUALLY_LATE_FAMILY_COUNT = 8;
export const OVERDUE_INVOICE_COUNT = 8;
export const SEED_LAST_MONTH_OWING_COUNT = 2;
export const OVERDUE_MIN = 8;
export const OVERDUE_MAX = 10;
export const PARTIAL_PAYMENT_DIVISOR = 2;
export const SEED_REMINDER_OFFSETS_DAYS = [-1, -5] as const;
export const SEED_PARTIAL_PAY_DAYS_AFTER_DUE = 2;
export const DELAY_RANGE_DAYS = {
   reliable: [0, 3],
   usually_late: [4, 15],
   risky: [12, 25],
} as const;

// mulberry32 PRNG constants
export const MULBERRY_INCREMENT = 0x6d2b79f5;
export const MULBERRY_SHIFT_A = 15;
export const MULBERRY_SHIFT_B = 7;
export const MULBERRY_SHIFT_C = 14;
export const MULBERRY_ODD_MASK = 1;
export const MULBERRY_MASK_B = 61;
export const UINT32_RANGE = 4294967296;

// Recurring bills (PRD §1, §5 /bills); dayOfMonth is the due day
export const RENT_BILL_ID = 'bill-rent';
export const BILL_PRESETS = [
   { id: RENT_BILL_ID, name: 'Rent', amount: 12000, dayOfMonth: 1 },
   { id: 'bill-helper', name: 'Helper salary', amount: 6000, dayOfMonth: 7 },
   { id: 'bill-phone', name: 'Phone and internet', amount: 800, dayOfMonth: 12 },
   { id: 'bill-printing', name: 'Printing', amount: 1500, dayOfMonth: 20 },
] as const;

// Domain: reliability, forecast, chase (PRD §6)
export const RELIABILITY_WINDOW_MONTHS = 6;
export const RELIABLE_MAX_AVG_DELAY = 3;
export const USUALLY_LATE_MAX_AVG_DELAY = 15;
export const RISK_WEIGHTS = { reliable: 0, usually_late: 0.5, risky: 1 } as const;
export const FORECAST_HORIZON_DAYS = 90;
export const PESSIMISTIC_EXTRA_DELAY_DAYS = 15;
export const CHASE_RECENT_REMINDER_DAYS = 3;
export const WHATIF_LATE_DAYS = 15;
export const WHATIF_TOP_FAMILY_COUNT = 5;
export const RISKY_BADGE = 'risky' as const;

// Reliability labels and thresholds (PRD §6)
export const ON_TIME_MAX_DELAY_DAYS = 0;
export const PERCENT_SCALE = 100;
export const NO_HISTORY_BADGE = 'reliable' as const;
export const RELIABILITY_LABELS = {
   reliable: 'Reliable',
   usually_late: 'Usually late',
   risky: 'Risky',
} as const;

// Forecast assumptions shown in the UI (the forecast is an estimate)
export const FORECAST_ASSUMPTIONS = [
   'Cash on hand is the opening balance plus every recorded payment.',
   'Optimistic: every open invoice is paid on its due date; overdue ones are paid today.',
   'Expected: each family pays on its due date plus its average delay; overdue fees add nothing until paid.',
   'Pessimistic: expected plus a further late margin; Risky families never pay.',
   'Overdue fees are not counted until they are paid.',
   'Bills leave on their day of the month and are always paid in full.',
   'Partial payments reduce what is still expected; fully paid invoices add nothing.',
   'Fees for future months are projected for active students not yet invoiced, due on the fee day; Risky families are left out.',
] as const;
export const SCENARIO_LINE_COPY = {
   prefix: 'Scenario:',
   normalDetail: 'No what-if picked; this is the expected forecast.',
   familyLate: (days: number) => `Shifts one family's expected fees ${days} days later.`,
   topLate: (count: number, days: number) =>
      `Shifts the ${count} largest families' expected fees ${days} days later.`,
   lose: (count: number) => `Removes ${count} students' projected fees from next month.`,
   raise: (percent: number) => `Raises projected fees ${percent}% from next month.`,
} as const;

// Alerts (PRD §6): kinds, the message stem and the action each alert names
export const ALERT_KINDS = ['uncovered_bill', 'below_buffer'] as const;
export const ALERT_MESSAGES = {
   uncovered_bill: 'Is not covered by expected cash.',
   below_buffer: 'Leaves expected cash under the buffer.',
} as const;
export const ALERT_ACTIONS = {
   uncovered_bill: 'Chase overdue families before then, or move the bill.',
   below_buffer: 'Chase a few more families or move the bill to a later day.',
} as const;

// What-if scenarios (PRD §6): ids in display order, labels, and defaults
export const WHATIF_SCENARIOS = [
   'family_late',
   'top_families_late',
   'lose_students',
   'raise_fees',
] as const;
export const WHATIF_LABELS = {
   family_late: 'One family pays late',
   top_families_late: 'Top families pay late',
   lose_students: 'Students leave next month',
   raise_fees: 'Fees rise next month',
} as const;
export const WHATIF_LOST_STUDENT_COUNT = 2;

export const WHATIF_FEE_RISE_PERCENT = 10;
export const NEXT_MONTH_OFFSET = 1;

// Money formatting: the only money formatter is formatINR (PRD §6)
export const INR_SYMBOL = '₹';
export const NEGATIVE_SIGN = '-';
export const INR_FIRST_GROUP_SIZE = 3;
export const INR_LATER_GROUP_SIZE = 2;
export const INR_GROUP_SEPARATOR = ',';

// Quick-add parser (PRD §6): deterministic regex; AI only if this fails
export const QUICK_ADD_MAX_LENGTH = 120;
export const QUICK_ADD_MAX_DIGITS = 7;
export const QUICK_ADD_DAY_OFFSETS = { today: 0, yesterday: -1 } as const;
export const QUICK_ADD_BILL_WORDS = ['rent'] as const;
export const QUICK_ADD_PAYMENT_PATTERN = new RegExp(
   `^([a-z][a-z .'-]*?)\\s+(?:paid\\s+)?(?:rs\\.?\\s*|₹\\s*)?` +
      `(\\d{1,${QUICK_ADD_MAX_DIGITS}})` +
      `(?:\\s+(${PAYMENT_METHODS.join('|')}))?` +
      `(?:\\s+(${Object.keys(QUICK_ADD_DAY_OFFSETS).join('|')}))?$`,
   'i',
);
export const QUICK_ADD_BILL_PATTERN = new RegExp(
   `^(${QUICK_ADD_BILL_WORDS.join('|')})\\s+paid` +
      `(?:\\s+(${Object.keys(QUICK_ADD_DAY_OFFSETS).join('|')}))?$`,
   'i',
);

// Fonts: CSS variable names set on <html> and read by tokens.css (design system)
export const FONT_VARIABLES = {
   display: '--font-anton',
   hand: '--font-kalam',
   body: '--font-hind',
} as const;

// App shell and accessibility
export const APP_TITLE = 'Baaki';
export const APP_DESCRIPTION = 'Fee and cash-flow back office for a home tutor.';
export const MAIN_CONTENT_ID = 'main';
export const SKIP_LINK_LABEL = 'Skip to main content';

// Store provider status (client only; loading is the first render)
export const STORE_STATUS = {
   loading: 'loading',
   ready: 'ready',
   error: 'error',
} as const;
export const STORE_LOADING_COPY = 'Opening your khata...';
export const STORE_ERROR_COPY =
   "Couldn't open your khata. Refresh the page to try again.";
export const STORE_MISSING_PROVIDER =
   'useStore must be used inside StoreProvider.';

// Navigation (PRD §5 routes)
export const NAV_LABEL = 'Main navigation';
export const HOME_HREF = '/';
export const NAV_PRIMARY_ITEMS = [
   { href: '/', label: 'Today' },
   { href: '/owed', label: 'Owed' },
   { href: '/forecast', label: 'Forecast' },
   { href: '/students', label: 'Students' },
] as const;
export const NAV_MORE_LABEL = 'More';
export const NAV_MORE_MENU_ID = 'more-menu';
export const NAV_MORE_ITEMS = [
   { href: '/bills', label: 'Bills' },
   { href: '/pricing', label: 'Pricing' },
   { href: '/settings', label: 'Settings' },
] as const;

// Khata components: stamps, chase card, quick-add, big numbers
export const STAMP_VARIANTS = [
   'paid',
   'overdue',
   'part_paid',
   'raised',
   'covered',
   'tight',
   'not_covered',
] as const;
export const STAMP_LABELS = {
   paid: 'PAID',
   overdue: 'OVERDUE',
   part_paid: 'PART-PAID',
   raised: 'RAISED',
   covered: 'COVERED',
   tight: 'TIGHT',
   not_covered: 'NOT COVERED',
} as const;
export const FOCUS_RING_CLASS =
   'focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ink focus-visible:ring-offset-2 focus-visible:ring-offset-paper';
export const CHASE_LABEL = 'Chase';
export const DAYS_LATE_LABEL = 'days late';
export const QUICK_ADD_ID = 'quick-add';
export const QUICK_ADD_LABEL = 'Quick add';
export const QUICK_ADD_PLACEHOLDER =
   'Write it like your khata... Rohan paid 1500 upi';
export const QUICK_ADD_SUBMIT_LABEL = 'Add';


// Students slice (PRD §4 step 1, §5 /students): ids, form limits and copy
export const STUDENT_ID_PREFIX = 'stu';
export const FAMILY_ID_PREFIX = 'fam';
export const INVOICE_ID_PREFIX = 'inv';
export const ID_SEPARATOR = '-';
export const FIRST_NEW_ID_NUMBER = 1;
export const ID_STEP = 1;
export const NEW_FAMILY_PHONE = '';
export const NAME_MAX_LENGTH = 60;
export const RAISE_MONTH_FORMAT = 'MMMM yyyy';
export const ROW_SEPARATOR = ' · ';
export const INPUT_CLASS = `min-h-11 w-full border-2 border-ink bg-chalk px-3 font-body text-base text-ink ${FOCUS_RING_CLASS}`;
export const DEFAULT_BATCH = BATCH_NAMES[0];
export const BLANK_STUDENT_DRAFT = {
   name: '',
   familyName: '',
   batch: DEFAULT_BATCH,
   classLevel: CLASS_MIN,
   feeAmount: FEE_MIN,
} as const;
export const STUDENT_ERRORS = {
   nameRequired: 'Enter the student name.',
   nameTooLong: `Keep the name under ${NAME_MAX_LENGTH} characters.`,
   familyRequired: 'Enter the family name.',
   familyTooLong: `Keep the family name under ${NAME_MAX_LENGTH} characters.`,
   batchInvalid: 'Pick a batch from the list.',
   classRange: `Class must be a whole number from ${CLASS_MIN} to ${CLASS_MAX}.`,
   feeRange: `Fee must be a whole number of rupees from ${FEE_MIN} to ${FEE_MAX}.`,
} as const;
export const STUDENTS_COPY = {
   addButton: 'Add student',
   editButton: 'Edit',
   formAddTitle: 'Add a student',
   formEditTitle: 'Edit student',
   saveButton: 'Save student',
   cancelButton: 'Cancel',
   nameLabel: 'Student name',
   familyLabel: 'Family name',
   batchLabel: 'Batch',
   classLabel: 'Class',
   feeLabel: 'Monthly fee (₹)',
   raisePrefix: 'Raise',
   raiseSuffix: 'fees',
   raiseDone: 'Fee invoices raised:',
   raiseNone:
      "Nothing new to raise: each active student already has next month's invoice.",
   savedNote: 'Student saved.',
   saveError:
      "Couldn't save to this browser. Changes may be lost on refresh.",
   saveMissing: 'That student is no longer in the roster.',
} as const;

// Today page (PRD §5 /): cash line, next bill, chase queue and alerts
export const TODAY_CHASE_LIMIT = 5;
export const TODAY_COPY = {
   cashLabel: 'Cash in hand',
   owedThisMonth: 'still owed for this month',
   billTitle: 'Next bill',
   billDue: 'Due',
   noBill: 'No active bills. Add rent and other outgoings to see the next one.',
   chaseTitle: 'Chase queue',
   chaseMore: 'Showing the top families. The Owed board lists everyone.',
   alertsTitle: 'Alerts',
   alertsEmpty: `No bill is at risk in the next ${FORECAST_HORIZON_DAYS} days.`,
   alertAction: 'Open the Owed board',
} as const;

// Placeholder page copy (PRD §5); empty states until each feature slice lands
export const PAGE_COPY = {
   today: {
      title: 'Today',
      empty: 'Nothing to chase yet. Raise next month\'s fees to fill the list.',
   },
   owed: {
      title: 'Owed',
      empty: 'No one owes you yet. Overdue families will be written here.',
   },
   students: {
      title: 'Students',
      empty: 'Your roster is empty. Add students to start invoicing.',
   },
   invoice: {
      title: 'Invoice',
      empty: 'This invoice has no timeline yet. Payments will be written here.',
   },
   forecast: {
      title: 'Forecast',
      empty: 'The cash forecast needs students and bills first.',
   },
   bills: {
      title: 'Bills',
      empty: 'No recurring bills yet. Add rent and other outgoings.',
   },
   pricing: {
      title: 'Pricing',
      empty: 'Plans and the business case will be written here.',
   },
   settings: {
      title: 'Settings',
      empty: 'Business name, UPI id and demo controls go here.',
   },
} as const;

// Invoice slice (PRD §5 /invoice/[id]): payment limits, timeline labels and copy
export const PAYMENT_ID_PREFIX = 'pay';
export const MIN_PAYMENT_AMOUNT = 1;
export const PAYMENT_METHOD_LABELS = { upi: 'UPI', cash: 'Cash' } as const;
export const REMINDER_TONE_LABELS = {
   gentle: 'Gentle',
   firm: 'Firm',
   final: 'Final',
} as const;
export const REMINDER_CHANNEL_LABELS = {
   whatsapp: 'WhatsApp',
   copy: 'Copied',
} as const;
export const TIMELINE_KINDS = ['raised', 'reminder', 'payment', 'paid'] as const;
export const TIMELINE_KIND_LABELS = {
   raised: 'Raised',
   reminder: 'Reminder sent',
   payment: 'Payment received',
   paid: 'Paid in full',
} as const;
export const OWED_HREF = '/owed';
export const OWED_FAMILY_QUERY = 'family';
export const PAYMENT_ERRORS = {
   amountRequired: 'Enter the amount in whole rupees.',
   amountMin: `Amount must be at least ${MIN_PAYMENT_AMOUNT} rupee.`,
   amountTooHigh: 'Amount cannot be more than the balance still due.',
   methodRequired: 'Pick UPI or cash.',
   dateInvalid: 'Pick a date from today or earlier.',
   alreadyPaid: 'This invoice is already paid in full.',
   invoiceMissing: 'That invoice is no longer in the khata.',
} as const;
export const INVOICE_COPY = {
   notFound: 'No invoice matches that id. It may have been removed.',
   studentLabel: 'Student',
   familyLabel: 'Family',
   monthLabel: 'Month',
   dueLabel: 'Due',
   stillDue: 'Still due',
   receivedSuffix: 'received',
   paidNote: 'Fully paid. Nothing more to collect.',
   fullHint: 'Enter the full balance to mark this invoice paid.',
   timelineTitle: 'Timeline',
   timelineEmpty: 'No activity yet.',
   paymentTitle: 'Record a payment',
   amountLabel: 'Amount received (₹)',
   methodLabel: 'Paid by',
   dateLabel: 'Date paid',
   submitButton: 'Record payment',
   savedNote: 'Payment recorded.',
   saveError: STUDENTS_COPY.saveError,
} as const;

// Owed board slice (PRD §4 steps 2-3, §5 /owed): ageing, sheet copy, reminder template
export const AGEING_BUCKETS = [
   { id: 'days_0_7', label: '0-7 days', maxDays: 7 },
   { id: 'days_8_30', label: '8-30 days', maxDays: 30 },
   { id: 'days_30_plus', label: '30+ days', maxDays: Number.POSITIVE_INFINITY },
] as const;
export const OWED_REMINDER_CHANNEL = 'copy' as const;
export const REMINDER_ID_PREFIX = 'rem';
export const REMINDER_TOKEN_PATTERN = /\{(\w+)\}/g;
export const REMINDER_TEMPLATE =
   'Hello {family}, the fee of {amount} is {days} days past due. Please pay when you can. Thank you, {business}.';
export const OWED_FAMILY_ROW_PREFIX = 'owed-family';
export const OWED_SHEET_TITLE_ID = 'chase-sheet-title';
export const OWED_HIGHLIGHT_CLASS =
   'ring-4 ring-marigold ring-offset-2 ring-offset-paper';
export const OWED_ESCAPE_KEY = 'Escape';
export const OWED_COPY = {
   totalLabel: 'Total owed',
   bucketsTitle: 'Days overdue',
   bucketCountLabel: 'open',
   rowsTitle: 'Families who owe',
   noOverdue: 'Nothing is overdue yet. Every open fee is still within its due date.',
   chaseSheetTitle: 'Chase reminder',
   sheetNote:
      'Nothing is sent for you: WhatsApp opens with this text and you press send.',
   copyButton: 'Copy reminder',
   closeButton: 'Close',
   copied: 'Copied. Paste it into WhatsApp to send.',
   copyError: "Couldn't copy here. Select the text and copy it by hand.",
} as const;

// Today bill status (PRD §6): expected balance on the bill date decides the stamp
export const BILL_STATUSES = ['covered', 'tight', 'not_covered'] as const;
export const BILL_STATUS_WORDS = {
   covered: 'covered',
   tight: 'tight',
   not_covered: 'not covered',
} as const;
export const BILL_HEADLINE_CHASE_PREFIX = 'Chase';
export const FAMILY_WORDS = { one: 'family', many: 'families' } as const;
export const CHASE_TARGET_LIMIT = 3;
export const NAME_LIST_JOIN = ', ';

// Alerts (PRD §6): only bills inside the window, max one per bill
export const ALERT_WINDOW_DAYS = 30;
export const ALERT_MAX_COUNT = 3;

// Day labels on Today: "1 Dec · in 9 days"
export const DAY_LABEL_FORMAT = 'd MMM';
export const DAY_WORDS = { one: 'day', many: 'days' } as const;
export const RELATIVE_TODAY = 'today';
export const RELATIVE_FUTURE_PREFIX = 'in';
export const RELATIVE_PAST_SUFFIX = 'ago';

// AI (PRD §7): server routes only; every failure falls back to templates
export const GEMINI_API_KEY_ENV = 'GEMINI_API_KEY';
export const GEMINI_MODEL_ENV = 'GEMINI_MODEL';
export const GEMINI_MODEL_DEFAULT = 'gemini-2.5-flash';
export const AI_TIMEOUT_MS = 20000;
export const AI_TIMEOUT_MESSAGE = 'AI request timed out.';
export const AI_MAX_REMINDER_CHARS = 400;
export const REMINDER_LINK_PATTERN = /(?:https?:\/\/|upi:\/\/|(?:www\.)?wa\.me\/)\S+/gi;
export const REMINDER_WHITESPACE_PATTERN = /\s+/g;
export const REMINDER_LINK_SEPARATOR = ' ';
export const AI_REMINDER_ROUTE = '/api/ai/reminder';
export const JSON_HEADERS = { 'Content-Type': 'application/json' } as const;
export const AI_PARSE_ROUTE = '/api/ai/parse';
export const AI_JSON_FENCE_PATTERN = /^```(?:json)?\s*|\s*```$/g;

export const LANGUAGE_LABELS = {
   english: 'English',
   hinglish: 'Hinglish',
   hindi: 'Hindi',
} as const;
export const AI_PROMPT_RULES = [
   'Write one WhatsApp fee reminder for a home tutor to send a parent.',
   'Plain text only, no markdown, no emoji, at most 400 characters.',
   'Polite and synthetic; never give tax, legal or financial advice.',
   'Include the amount. Do not write any link or URL; Baaki adds the payment link.',
] as const;
export const AI_PARSE_PROMPT =
   'Read one quick-add line from a tutor and reply with JSON only: {"type":"payment"|"bill_paid"|"unknown","student":string|null,"amount":integer|null,"method":"upi"|"cash"|null,"date":"YYYY-MM-DD"|null}. Use today as the reference day for words like yesterday. Line:';
export const REMINDER_SOURCES = ['ai', 'template'] as const;
export const PARSE_TYPES = ['payment', 'bill_paid', 'unknown'] as const;
export const QUICK_ADD_MAX_AMOUNT = 10 ** QUICK_ADD_MAX_DIGITS - 1;
export const AI_ERRORS = {
   badJson: 'Send the request as JSON.',
   badInput: 'The request is missing a field or has a wrong value.',
   serverError: 'The draft could not be made. Try again in a moment.',
   parseFailed: "Couldn't read that line. Try: Rohan paid 1500 upi",
} as const;

// Reminder fallback templates (PRD §7): tone x language; tokens filled by the service
export const REMINDER_FALLBACK_TEMPLATES = {
   gentle: {
      english:
         'Hello {family}, a gentle reminder that the fee of {amount} for {child} is {days} days past due. You can pay by UPI here: {upi}. If you have already paid, please ignore this note. Thank you, {business}.',
      hinglish:
         'Namaste {family}, {child} ki fees {amount} abhi {days} din se baaki hai. Aap yahan UPI se pay kar sakte hain: {upi}. Agar pehle hi pay ho chuka hai to is message ko ignore karein. Dhanyavaad, {business}.',
      hindi:
         'नमस्ते {family}, {child} की फीस {amount} {days} दिन से बाकी है। आप यहाँ UPI से भुगतान कर सकते हैं: {upi}। अगर भुगतान हो चुका है तो इस संदेश को अनदेखा करें। धन्यवाद, {business}।',
   },
   firm: {
      english:
         'Hello {family}, the fee of {amount} for {child} is now {days} days overdue. Please pay it this week using UPI: {upi}. Reply here if there is a problem so we can plan it together. Thank you, {business}.',
      hinglish:
         '{family}, {child} ki fees {amount} {days} din se overdue hai. Is hafte tak UPI se pay karein: {upi}. Koi dikkat ho to yahin reply karein, hum mil kar plan kar lenge. Dhanyavaad, {business}.',
      hindi:
         '{family}, {child} की फीस {amount} {days} दिन से अतिदेय है। कृपया इस सप्ताह UPI से भुगतान करें: {upi}। कोई समस्या हो तो यहीं उत्तर दें, हम मिलकर हल निकाल लेंगे। धन्यवाद, {business}।',
   },
   final: {
      english:
         'Hello {family}, this is the final reminder. The fee of {amount} for {child} is {days} days overdue and must be cleared now. Pay via UPI: {upi}. If it is not paid, we will need to discuss next steps. Thank you, {business}.',
      hinglish:
         '{family}, yeh aakhri reminder hai. {child} ki fees {amount} {days} din se overdue hai aur abhi clear karni hai. UPI: {upi}. Payment na hone par aage ki baat karni padegi. Dhanyavaad, {business}.',
      hindi:
         '{family}, यह अंतिम अनुस्मारक है। {child} की फीस {amount} {days} दिन से अतिदेय है और इसे अभी जमा करना होगा। UPI: {upi}। भुगतान न होने पर आगे की बात करनी होगी। धन्यवाद, {business}।',
   },
} as const;
export const REMINDER_TOKENS = ['family', 'child', 'amount', 'days', 'business', 'upi'] as const;

// Payment links (PRD §5, §8): demo helpers, they do not collect money
export const UPI_SCHEME = 'upi://pay';
export const UPI_CURRENCY = 'INR';
export const WHATSAPP_BASE = 'https://wa.me/';
export const COUNTRY_CODE = '91';
export const LOCAL_NUMBER_LENGTH = 10;
export const NON_DIGITS_PATTERN = /\D/g;

// Quick-add and Chase sheet copy (PRD §4 steps 3-4, §6)
export const QUICK_ADD_SAVE_LABEL = 'Save';
export const QUICK_ADD_PICK_LABEL = 'Pick the family';
export const QUICK_ADD_CONFIRM_LABEL = 'Confirm';
export const QUICK_ADD_CANCEL_LABEL = 'Cancel';
export const QUICK_ADD_READING_COPY = 'Reading your line...';
export const QUICK_ADD_SAVED_COPY = 'Saved. Owed and Today are updated.';
export const QUICK_ADD_METHOD_TITLE = 'Paid by';
export const QUICK_ADD_BILL_UNSUPPORTED =
   'Bill payments are not tracked yet, so nothing can be saved for this line.';
export const QUICK_ADD_ERRORS = {
   unknownFamily: 'No student or family matches that name.',
   ambiguous: 'More than one family matches that name.',
   nothingOwed: 'Nothing is owed by that family right now.',
   tooMuch: 'That is more than the family still owes.',
   saveFailed: "Couldn't save to this browser. Changes may be lost on refresh.",
} as const;
export const DRAFT_KEY_SEPARATOR = '|';
export const DRAFT_ROWS = 8;
export const WHATSAPP_WINDOW_TARGET = '_blank';
export const WHATSAPP_WINDOW_FEATURES = 'noopener,noreferrer';
export const CHASE_TONE_ID = 'chase-tone';
export const CHASE_LANGUAGE_ID = 'chase-language';
export const CHASE_DRAFT_ID = 'chase-draft';
export const CHASE_SHEET_COPY = {
   drafting: 'Drafting the reminder...',
   emptyDraft: 'No draft yet. Pick a tone and language.',
   draftError: "Couldn't draft this reminder. You can still type one.",
   toneLabel: 'Tone',
   languageLabel: 'Language',
   draftLabel: 'Reminder text',
   openWhatsApp: 'Open WhatsApp',
   sourceAi: 'Drafted by AI.',
   sourceTemplate: 'Drafted from a template (no AI key or AI was unavailable).',
   logged: 'Logged on the invoice timeline.',
   noPhone: 'No phone number for this family. WhatsApp needs one.',
} as const;

// Forecast page (PRD §5 /forecast, §6): horizon toggle, chart, copy and colours
export const FORECAST_WINDOWS = [30, 60, 90] as const;
export const FORECAST_DEFAULT_WINDOW = 30;
export const FORECAST_CHART_HEIGHT_PX = 320;
export const FORECAST_WHATIF_CHIP_LABEL = `Top ${WHATIF_TOP_FAMILY_COUNT} pay ${WHATIF_LATE_DAYS} days late`;
export const FORECAST_DATE_TICK_FORMAT = 'd MMM';
export const FORECAST_CHART_COLORS = {
   ink: '#1B2A6B',
   marigold: '#F6A11A',
   marginRed: '#D7263D',
   grid: '#D9CBB0',
} as const;
export const FORECAST_BAND_OPACITY = 0.35;
export const FORECAST_SCENARIO_DASH = '8 6';
export const FORECAST_TICK_FONT_SIZE = 12;
export const FORECAST_COPY = {
   title: 'Cash forecast',
   estimateNote: 'An estimate, not a promise. Check the assumptions below.',
   horizonLabel: 'Days ahead',
   whatIfLabel: 'What-if',
   whatIfOn: 'The dashed line is the what-if, drawn over the solid expected line. Your recorded data is unchanged.',
   whatIfOff: 'Pick a what-if to draw a dashed line over the expected one.',
   expectedLegend: 'Expected balance',
   bandLegend: 'Optimistic to pessimistic',
   bufferLegend: 'Buffer',
   billLegend: 'Bill due',
   chartLabel: 'Forecast chart of expected cash with an optimistic to pessimistic band',
   lowestPrefix: 'Lowest balance in this window:',
   actionUnderBuffer: 'Chase the top families before then, or move a bill to a later day.',
   actionAboveBuffer: 'Cash holds above the buffer; keep chasing overdue families.',
   assumptionsTitle: 'Assumptions',
   errorCopy: "Couldn't work out the forecast from this browser's data.",
   noBillsNote: 'Add rent and other bills to see them on the chart.',
} as const;

// What-if controls and comparison copy (PRD §6, §12): one scenario at a time
export const WHATIF_LATE_DAYS_MAX = 45;
export const WHATIF_LOST_STUDENT_MAX = 5;
export const WHATIF_FEE_RISE_MAX = 20;
export const WHATIF_MIN_VALUE = 0;
export const WHATIF_CONTROL_STEP = 1;
export const WHATIF_PICKER_LABEL = 'Choose one what-if';
export const WHATIF_NORMAL_LABEL = 'Normal';
export const WHATIF_CONTROL_IDS = {
   family: 'whatif-family',
   lateDays: 'whatif-late-days',
   lostStudents: 'whatif-lost-students',
   feeRise: 'whatif-fee-rise',
} as const;
export const WHATIF_STEP_BUTTON_CLASS = `min-h-11 min-w-11 border-2 border-ink bg-chalk px-3 font-body text-base text-ink disabled:opacity-50 ${FOCUS_RING_CLASS}`;
export const WHATIF_CONTROLS_COPY = {
   familyLabel: 'Family',
   lateLabel: (days: number) => `Pays ${days} days late`,
   loseLabel: (count: number) => `Lose ${count} students from next month`,
   riseLabel: (percent: number) => `Raise fees ${percent}% from next month`,
   stepperFewer: 'Fewer',
   stepperMore: 'More',
} as const;
export const WHATIF_COMPARE_COPY = {
   lead: 'the lowest balance goes from',
   middle: 'to',
   same: 'the lowest balance is the same as normal.',
} as const;

// Pricing page (PRD §10): proposed plans, ROI line and the business case
export const PRICING_PLANS = [
   { id: 'free', name: 'Free', monthlyRupees: 0, summary: 'Up to 10 students, manual reminders' },
   { id: 'pro', name: 'Pro', monthlyRupees: 299, summary: 'Unlimited students, AI reminders, forecast, what-if' },
   { id: 'centre', name: 'Centre', monthlyRupees: 799, summary: 'Coaching centres, 3 staff logins, batch reports' },
] as const;
export const PRICING_COPY = {
   label: 'Proposed pricing',
   perMonth: '/month',
   roi: 'One recovered ₹1,500 fee pays 5 months of Pro.',
   assumption: 'Prices and the ROI line are assumptions, not customer results. No payment is taken in this demo.',
   whoPaysTitle: 'Who pays',
   whoPays: 'The tutor pays for her own plan. Parents pay their fees as before, by UPI or cash.',
   whySwitchTitle: 'Why switch from the notebook',
   whySwitch: "It answers \"who owes me\" and \"will I make rent\" in 5 seconds, and drafts the awkward message.",
} as const;

// Settings page (PRD §5 /settings): demo reset with an inline two-step confirm
export const SETTINGS_COPY = {
   businessTitle: 'Business',
   businessNote: 'Your name and UPI id go on every reminder. Baaki does not collect money.',
   businessNameLabel: 'Business name',
   upiLabel: 'UPI id',
   businessSave: 'Save business',
   businessSaved: 'Business details saved.',
   exportTitle: 'Export invoices',
   exportNote: 'Downloads every invoice as a CSV file: family, student, month, amount, paid and status.',
   exportButton: 'Export CSV',
   exportDisabled: 'No invoices yet, so there is nothing to export.',
   exportDone: 'CSV downloaded.',
   exportError: "Couldn't build the CSV file. Try again.",
   resetTitle: 'Demo data',
   resetNote: 'Restores the seeded demo: families, invoices, payments and bills. Changes made in this browser are replaced.',
   resetButton: 'Reset demo data',
   resetQuestion: 'Replace everything in this browser with the demo data?',
   resetConfirm: 'Yes, reset',
   resetCancel: 'Cancel',
   resetDone: 'Demo data restored.',
   resetError: "Couldn't reset this browser's storage. Try again.",
} as const;

// Bills page (PRD §5 /bills): recurring bills, add/edit/delete, opening balance and buffer
export const BILLS_COPY = {
   title: 'Recurring bills',
   note: 'Bills leave on their due day and are always paid in full. Changes update Forecast and Today at once.',
   dueLabel: 'Next due',
   monthlyLabel: '/month',
   errorCopy: "Couldn't load the bills from this browser's data.",
   addButton: 'Add bill',
   editButton: 'Edit',
   deleteButton: 'Delete',
   pausedLabel: 'Paused',
   formAddTitle: 'Add a bill',
   formEditTitle: 'Edit bill',
   saveButton: 'Save bill',
   cancelButton: 'Cancel',
   nameLabel: 'Bill name',
   amountLabel: 'Monthly amount (₹)',
   dayLabel: 'Day of the month (1 to 28)',
   savedNote: 'Bill saved.',
   deletedNote: 'Bill deleted.',
   balanceTitle: 'Opening balance and buffer',
   openingLabel: 'Opening balance (₹)',
   bufferLabel: 'Safety buffer (₹)',
   balanceSave: 'Save balances',
   balanceSaved: 'Balances saved.',
   saveError: STUDENTS_COPY.saveError,
} as const;

// Bills input limits and rules (PRD §5 /bills)
export const BILL_ID_PREFIX = 'bill';
// Every month has a 28th, so a due day from 1 to 28 always exists
export const BILL_DAY_MIN = 1;
export const BILL_DAY_MAX = 28;
export const BILL_ERRORS = {
   nameRequired: 'Enter the bill name.',
   nameTooLong: `Keep the name under ${NAME_MAX_LENGTH} characters.`,
   wholeRupees: 'Enter the amount in whole rupees.',
   amountPositive: 'Amount must be more than 0 rupees.',
   dayRange: `Day must be a whole number from ${BILL_DAY_MIN} to ${BILL_DAY_MAX}.`,
   balanceNegative: 'Cannot be negative. Use 0 or more.',
} as const;

// Business identity (PRD §5 /settings): the name and UPI id that reminders carry
export const UPI_ID_PATTERN = /^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z][a-zA-Z0-9]{2,64}$/;
export const BUSINESS_ERRORS = {
   nameRequired: 'Enter the business name.',
   nameTooLong: `Keep the business name under ${NAME_MAX_LENGTH} characters.`,
   upiInvalid: 'Use a UPI id like name@bank, for example priya@okbank.',
} as const;

// Invoice CSV export (PRD §5 /settings): RFC 4180 layout, plain integer money
export const CSV_HEADER = ['family', 'student', 'month', 'amount', 'paid', 'status'] as const;
export const CSV_DELIMITER = ',';
export const CSV_LINE_END = '\r\n';
export const CSV_QUOTE = '"';
export const CSV_QUOTE_ESCAPE = '""';
export const CSV_QUOTE_PATTERN = /"/g;
export const CSV_NEEDS_QUOTES_PATTERN = /[",\r\n]/;
export const CSV_MIME_TYPE = 'text/csv;charset=utf-8';
export const CSV_FILE_NAME = 'baaki-invoices.csv';



