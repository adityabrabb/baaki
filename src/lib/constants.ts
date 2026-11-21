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
] as const;
export const SEED_SURNAMES = [
   'Kulkarni', 'Deshpande', 'Joshi', 'Patil', 'Pawar', 'Gokhale', 'Mehta',
   'Iyer', 'Naik', 'Bhave', 'Sathe', 'Rane', 'Sawant', 'Kale',
] as const;
export const FAMILY_LABEL = 'family';
export const SIBLING_FAMILY_COUNT = 4;

// Seeded history (PRD §8)
export const RNG_SEED = 1729;
export const HISTORY_MONTHS = 6;
export const RELIABLE_FAMILY_COUNT = 17;
export const USUALLY_LATE_FAMILY_COUNT = 8;
export const OVERDUE_INVOICE_COUNT = 9;
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
   'Students who leave and fee changes are not modelled.',
] as const;

// Alerts (PRD §6): kinds, the message stem and the action each alert names
export const ALERT_KINDS = ['uncovered_bill', 'below_buffer'] as const;
export const ALERT_MESSAGES = {
   uncovered_bill: 'is not covered by expected cash.',
   below_buffer: 'leaves expected cash under the buffer.',
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
export const STAMP_VARIANTS = ['paid', 'overdue', 'part_paid', 'raised'] as const;
export const STAMP_LABELS = {
   paid: 'PAID',
   overdue: 'OVERDUE',
   part_paid: 'PART-PAID',
   raised: 'RAISED',
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
export const QUICK_ADD_DISABLED_REASON =
   'Saving lines arrives in a later slice.';

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
      "Nothing new to raise: each active student already has this month's invoice.",
   savedNote: 'Student saved.',
   saveError:
      "Couldn't save to this browser. Changes may be lost on refresh.",
   saveMissing: 'That student is no longer in the roster.',
} as const;

// Placeholder page copy (PRD §5); empty states until each feature slice lands
export const CASH_STATUS_PLACEHOLDER =
   'Cash status appears here once the forecast is connected.';

export const PAGE_COPY = {
   today: {
      title: 'Today',
      empty: 'Nothing to chase yet. Raise this month\'s fees to fill the list.',
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
      'This is a template. Nothing is sent for you: copy it into WhatsApp yourself.',
   copyButton: 'Copy reminder',
   closeButton: 'Close',
   copied: 'Copied. Paste it into WhatsApp to send.',
   copyError: "Couldn't copy here. Select the text and copy it by hand.",
} as const;


