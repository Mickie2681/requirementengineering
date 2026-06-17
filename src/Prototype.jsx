import { useMemo, useRef, useState } from "react";

const AMBIGUOUS_TERMS = [
  "fast", "quick", "quickly", "easy", "simple", "secure", "reliable", "user-friendly",
  "efficient", "robust", "scalable", "slow", "good", "proper", "important", "non-negotiable"
];

const EXAMPLES = [
  {
    label: "Coding bootcamp platform",
    text: `So we’re building an online learning platform for our coding bootcamp. Right now everything is scattered across email and WhatsApp and it’s a mess. What we need first is for students to be able to create an account and browse the courses we offer, filtered by track — web development, data science, that kind of thing. Once they pick a course they should be able to enrol and pay for it online. Most of our students pay with mobile money, M-Pesa specifically, but some international students will want card payments too.

Inside a course, students watch video lessons. The thing is, a lot of our learners are on mobile data and connections aren’t great, so the video has to work on low bandwidth, and ideally they can download a lesson to watch offline. After each module there should be a quiz, and the quizzes need to be graded automatically so students get instant feedback. We also want to track each student’s progress through the course — what they’ve completed, their quiz scores, a simple dashboard.

Instructors need their own view. They should be able to upload lessons and quiz questions, and see how their students are doing — who’s falling behind, average scores, that sort of thing. There’s also a lot of value in a discussion forum per course where students ask questions and instructors or other students answer. When a student finishes a course and passes the final assessment, the system should automatically issue a certificate they can download and share on LinkedIn.

A few other things matter a lot to us. Student records — names, payment details, progress — are sensitive, and we have to comply with Kenya’s Data Protection Act, so proper handling of personal data is non-negotiable. The platform also needs to be reliable; we can’t have it going down during exam week. We had an outage last cohort and it was a disaster, so something like 99.9% uptime is what we’re aiming for. During exam periods we get spikes — maybe five thousand students all logging in around the same time — and it can’t slow to a crawl. And honestly the interface has to be simple; some of our students aren’t very confident with technology, and we want it usable on a cheap Android phone, not just a laptop. Accessibility matters too — we’ve had visually impaired applicants, so screen-reader support would be important.

Oh, and administratively, we’d like to be able to pull reports — enrolment numbers, revenue, completion rates per cohort — so we can see how the business is doing and report to our funders.`
  },
  {
    label: "E-commerce platform",
    text: `We need an online store where customers can browse products by category and search for specific items. Customers should be able to add things to a cart and check out securely. We want to accept credit cards and mobile payments. The site needs to load fast. We also need an admin panel where staff can update inventory and view orders. The system should handle peak season traffic, about 10x normal, without slowing down.`
  },
  {
    label: "Hospital patient portal",
    text: `Patients need to book appointments online without calling reception. They should be able to see their test results and upcoming appointments. Doctors need to add notes and prescriptions to patient records. Everything must comply with patient data privacy regulations. Notifications should remind patients of upcoming appointments by SMS or email. The portal should be available 24/7.`
  }
];

const BASELINE_RULES = [
  {
    key: "account", type: "FR", category: "Authentication",
    terms: ["create an account", "register", "account"],
    statement: "The system shall allow students to register and create a user account.",
    userStory: "As a student, I want to create an account so that I can access the learning platform.",
    acceptance: "Given a new student is on the registration page, when they submit valid details, then the system shall create the account and confirm registration.",
    rationale: "The stakeholder explicitly states that students should be able to create an account."
  },
  {
    key: "browse courses", type: "FR", category: "Search",
    terms: ["browse the courses", "filtered by track", "browse courses"],
    statement: "The system shall allow students to browse available courses filtered by track.",
    userStory: "As a student, I want to filter courses by track so that I can find a suitable course quickly.",
    acceptance: "Given available courses exist, when a student selects a track filter, then the system shall display only courses belonging to that track.",
    rationale: "The input mentions browsing courses by tracks such as web development and data science."
  },
  {
    key: "enrol", type: "FR", category: "Data Management",
    terms: ["enrol", "enroll", "pick a course"],
    statement: "The system shall allow students to enrol in a selected course.",
    userStory: "As a student, I want to enrol in a course so that I can participate in the bootcamp.",
    acceptance: "Given a student selects a course, when they choose enrol, then the system shall add the student to that course after required checks are completed.",
    rationale: "The stakeholder says students should be able to enrol after choosing a course."
  },
  {
    key: "payments", type: "FR", category: "Integration",
    terms: ["pay for it online", "M-Pesa", "card payments", "mobile money"],
    statement: "The system shall allow students to pay for courses online via M-Pesa mobile money and card payment.",
    userStory: "As a student, I want to pay online using M-Pesa or a card so that I can complete enrolment conveniently.",
    acceptance: "Given a student is enrolling in a paid course, when they choose M-Pesa or card payment and payment succeeds, then the system shall record the payment and confirm enrolment.",
    rationale: "The input explicitly lists online payment, M-Pesa, mobile money and card payment."
  },
  {
    key: "video lessons", type: "FR", category: "User Interface",
    terms: ["watch video lessons", "video lessons"],
    statement: "The system shall allow students to watch video lessons within an enrolled course.",
    userStory: "As a student, I want to watch course video lessons so that I can learn the course content.",
    acceptance: "Given a student is enrolled in a course, when they open a lesson, then the system shall play the video lesson in the course interface.",
    rationale: "The stakeholder identifies video lessons as a core learning activity."
  },
  {
    key: "offline download", type: "FR", category: "User Interface",
    terms: ["download a lesson", "watch offline", "offline"],
    statement: "The system shall allow students to download lessons for offline viewing.",
    userStory: "As a student, I want to download lessons so that I can study when my internet connection is poor.",
    acceptance: "Given a downloadable lesson is available, when a student selects download, then the system shall save the lesson for offline viewing.",
    rationale: "The stakeholder states that students should ideally be able to download lessons for offline viewing."
  },
  {
    key: "quiz grading", type: "FR", category: "Other",
    terms: ["quiz", "graded automatically", "instant feedback"],
    statement: "The system shall automatically grade module quizzes and provide immediate feedback.",
    userStory: "As a student, I want quizzes to be graded automatically so that I can receive immediate feedback.",
    acceptance: "Given a student submits a module quiz, when the submission is complete, then the system shall grade the quiz and display feedback immediately.",
    rationale: "The input explicitly requires automatic quiz grading and instant feedback."
  },
  {
    key: "progress", type: "FR", category: "Reporting",
    terms: ["track each student’s progress", "track each student's progress", "quiz scores", "simple dashboard"],
    statement: "The system shall track and display each student’s progress, including completed modules and quiz scores.",
    userStory: "As a student, I want to view my progress so that I can understand what I have completed and what remains.",
    acceptance: "Given a student has course activity, when they open the dashboard, then the system shall show completed modules and quiz scores.",
    rationale: "The stakeholder asks for progress tracking, completed items, quiz scores and a dashboard."
  },
  {
    key: "instructor upload", type: "FR", category: "Data Management",
    terms: ["upload lessons", "quiz questions"],
    statement: "The system shall allow instructors to upload lessons and quiz questions.",
    userStory: "As an instructor, I want to upload lessons and quiz questions so that I can manage course content.",
    acceptance: "Given an authenticated instructor is in their view, when they upload a lesson or quiz question, then the system shall save it to the selected course.",
    rationale: "The input states that instructors should be able to upload lessons and quiz questions."
  },
  {
    key: "instructor dashboard", type: "FR", category: "Reporting",
    terms: ["students are doing", "falling behind", "average scores"],
    statement: "The system shall provide instructors with a dashboard of student performance, including students falling behind and average scores.",
    userStory: "As an instructor, I want to see student performance so that I can support learners who are falling behind.",
    acceptance: "Given students have progress and quiz data, when an instructor opens the dashboard, then the system shall show performance indicators including average scores and students falling behind.",
    rationale: "The stakeholder asks for an instructor view showing performance and students falling behind."
  },
  {
    key: "forum", type: "FR", category: "Collaboration",
    terms: ["discussion forum", "ask questions", "answer"],
    statement: "The system shall provide a per-course discussion forum for questions and answers.",
    userStory: "As a student, I want to ask course questions in a forum so that instructors and peers can help me.",
    acceptance: "Given a course has a forum, when a student posts a question, then instructors and students in that course shall be able to view and respond to it.",
    rationale: "The input identifies a discussion forum per course as valuable."
  },
  {
    key: "certificate", type: "FR", category: "Other",
    terms: ["certificate", "final assessment", "LinkedIn"],
    statement: "The system shall automatically issue a downloadable certificate when a student passes the final assessment.",
    userStory: "As a student, I want to receive a certificate after passing so that I can share evidence of completion.",
    acceptance: "Given a student passes the final assessment, when completion is confirmed, then the system shall generate a downloadable certificate.",
    rationale: "The stakeholder explicitly requests automatic certificate issuing after passing the final assessment."
  },
  {
    key: "reports", type: "FR", category: "Reporting",
    terms: ["pull reports", "enrolment numbers", "revenue", "completion rates"],
    statement: "The system shall allow administrators to generate reports on enrolment, revenue, and completion rates per cohort.",
    userStory: "As an administrator, I want cohort reports so that I can monitor the business and report to funders.",
    acceptance: "Given an administrator selects a cohort, when they generate a report, then the system shall show enrolment, revenue and completion-rate data for that cohort.",
    rationale: "The stakeholder asks for administrative reports on enrolment, revenue and completion rates."
  },
  {
    key: "low bandwidth", type: "NFR", category: "Performance",
    terms: ["low bandwidth", "mobile data", "connections aren’t great", "connections aren't great"],
    statement: "The system shall stream video lessons effectively over low-bandwidth mobile connections.",
    userStory: "As a student with limited data, I want videos to work on low bandwidth so that I can learn without a strong connection.",
    acceptance: "Given a student is using a low-bandwidth mobile connection, when they play a lesson video, then the system shall adapt playback to maintain usable viewing quality.",
    rationale: "The stakeholder describes mobile data and poor connections, requiring low-bandwidth video support."
  },
  {
    key: "data protection", type: "NFR", category: "Compliance",
    terms: ["Data Protection Act", "personal data", "payment details", "sensitive"],
    statement: "The system shall comply with Kenya’s Data Protection Act when handling personal, payment, and progress data.",
    userStory: "As a student, I want my personal and payment data handled lawfully so that my privacy is protected.",
    acceptance: "Given the system processes personal, payment or progress data, when data is collected, stored or accessed, then the system shall follow applicable Kenya Data Protection Act requirements.",
    rationale: "The input explicitly references sensitive student records and Kenya’s Data Protection Act."
  },
  {
    key: "uptime", type: "NFR", category: "Reliability",
    terms: ["99.9% uptime", "reliable", "going down", "exam week"],
    statement: "The system shall maintain at least 99.9% uptime, particularly during examination periods.",
    userStory: "As a student, I want the platform to stay available during exams so that I can complete assessments without disruption.",
    acceptance: "Given the system is operating during an examination period, when uptime is measured for the service window, then availability shall be at least 99.9%.",
    rationale: "The stakeholder gives a measurable uptime target and highlights exam-period reliability."
  },
  {
    key: "concurrent users", type: "NFR", category: "Scalability",
    terms: ["five thousand", "5,000", "logging in", "can’t slow", "can't slow"],
    statement: "The system shall support at least 5,000 concurrent users without significant performance degradation.",
    userStory: "As an administrator, I want the platform to handle exam-period spikes so that many students can log in at the same time.",
    acceptance: "Given 5,000 students access the system concurrently, when they log in during peak periods, then core pages shall remain responsive without significant performance degradation.",
    rationale: "The input identifies spikes of about five thousand students and states the system must not slow to a crawl."
  },
  {
    key: "android usability", type: "NFR", category: "Usability",
    terms: ["simple", "cheap Android phone", "not just a laptop", "not very confident"],
    statement: "The system shall provide a simple interface usable on low-end Android devices by users with limited technical confidence.",
    userStory: "As a student with a basic Android phone, I want a simple interface so that I can use the platform without advanced technical skills.",
    acceptance: "Given a student uses a low-end Android phone, when they access core learning tasks, then the interface shall remain usable and easy to navigate.",
    rationale: "The stakeholder stresses simplicity, limited technical confidence and support for cheap Android phones."
  },
  {
    key: "screen reader", type: "NFR", category: "Accessibility",
    terms: ["screen-reader", "visually impaired", "Accessibility matters"],
    statement: "The system shall support screen-reader accessibility for visually impaired users.",
    userStory: "As a visually impaired applicant, I want screen-reader support so that I can access the platform independently.",
    acceptance: "Given a user relies on a screen reader, when they navigate core pages, then page structure, labels and controls shall be readable by screen-reader software.",
    rationale: "The stakeholder identifies visually impaired applicants and screen-reader support."
  },
  {
    key: "role access", type: "NFR", category: "Security",
    terms: ["students", "instructors", "administrators", "own view"],
    statement: "The system should separate student, instructor, and administrator access according to role.",
    userStory: "As a platform owner, I want role-based access so that users only see functions appropriate to their responsibilities.",
    acceptance: "Given a user logs in, when their role is identified, then the system shall display only the actions and data permitted for that role.",
    rationale: "The transcript describes separate student, instructor and administrator views; this is a reasonable but implicit access-control requirement.",
    prototypeOnly: true
  }
];

const typeColors = {
  FR: { bg: "#E8F4FD", border: "#2196F3", badge: "#1565C0", badgeBg: "#BBDEFB" },
  NFR: { bg: "#F3E5F5", border: "#9C27B0", badge: "#6A1B9A", badgeBg: "#E1BEE7" }
};

const confidenceColors = {
  High: { color: "#1B5E20", bg: "#E8F5E9" },
  Medium: { color: "#E65100", bg: "#FFF3E0" },
  Low: { color: "#B71C1C", bg: "#FFEBEE" }
};

function norm(text) {
  return text.toLowerCase().replace(/[’]/g, "'").replace(/\s+/g, " ").trim();
}

function evidence(input, terms) {
  const sentences = input
    .replace(/\n+/g, " ")
    .split(/(?<=[.!?])\s+/)
    .map(s => s.trim())
    .filter(Boolean);
  const found = sentences.find(s => terms.some(t => norm(s).includes(norm(t))));
  return found || "Evidence inferred from several related stakeholder statements.";
}

function ambiguityNotes(statement, source) {
  const haystack = norm(`${statement} ${source}`);
  return AMBIGUOUS_TERMS
    .filter(t => haystack.includes(norm(t)))
    .map(t => `Clarify “${t}” with a measurable criterion or acceptance test.`);
}

function confidenceFor(rule, source) {
  if (rule.prototypeOnly) return "Low";
  const explicitHits = rule.terms.filter(t => norm(source).includes(norm(t))).length;
  if (explicitHits >= 2) return "High";
  return explicitHits === 1 ? "Medium" : "Low";
}

function extractKnownRequirements(input) {
  const lower = norm(input);
  const candidates = [];
  BASELINE_RULES.forEach(rule => {
    const matched = rule.terms.some(term => lower.includes(norm(term)));
    const roleRule = rule.key === "role access" && ["students", "instructors", "administrators"].filter(t => lower.includes(t)).length >= 2;
    if (matched || roleRule) {
      const source = evidence(input, rule.terms);
      candidates.push({
        ...rule,
        source,
        confidence: confidenceFor(rule, source),
        ambiguity: ambiguityNotes(rule.statement, source)
      });
    }
  });
  return candidates;
}

function extractGenericRequirements(input, usedKeys) {
  const generic = [];
  const sentences = input
    .replace(/\n+/g, " ")
    .split(/(?<=[.!?])\s+/)
    .map(s => s.trim())
    .filter(s => /\b(need|must|should|shall|want|able to|allow|support|provide|send|generate|view|upload|download|pay|book|track|integrate|comply)\b/i.test(s));

  sentences.slice(0, 12).forEach((s, index) => {
    const sl = norm(s);
    if ([...usedKeys].some(k => sl.includes(k))) return;
    const type = /fast|performance|uptime|secure|privacy|comply|available|accessible|scalable|slow|traffic/i.test(s) ? "NFR" : "FR";
    const category = type === "NFR"
      ? (/privacy|comply|regulation|data protection/i.test(s) ? "Compliance" : /fast|slow|traffic|load/i.test(s) ? "Performance" : /available|uptime|24\/7/i.test(s) ? "Reliability" : /accessible|elderly|simple|easy/i.test(s) ? "Usability" : "Other")
      : (/search|browse/i.test(s) ? "Search" : /report|dashboard|view/i.test(s) ? "Reporting" : /payment|integrat|sms|email|slack/i.test(s) ? "Integration" : /upload|record|inventory|notes|prescriptions/i.test(s) ? "Data Management" : "Other");
    generic.push({
      key: `generic-${index}`,
      type,
      category,
      statement: `The system shall ${s.replace(/^\s*(we\s+)?(need|want)\s+(to\s+)?/i, "").replace(/^it\s+should\s+/i, "").replace(/^the\s+system\s+should\s+/i, "").replace(/\.$/, "").trim()}.`,
      userStory: "As a stakeholder, I want this capability so that the system meets the stated business need.",
      acceptance: "Given the relevant user context, when the stated action is performed, then the system shall satisfy the requirement and produce the expected result.",
      rationale: "This sentence contains requirement language such as need, should, must, allow or support.",
      source: s,
      confidence: "Medium",
      ambiguity: ambiguityNotes(s, s)
    });
  });
  return generic;
}

function runLocalExtraction(input) {
  const known = extractKnownRequirements(input);
  const usedKeys = new Set(known.flatMap(r => r.terms?.map(t => norm(t)) || []));
  const generic = known.length < 6 ? extractGenericRequirements(input, usedKeys) : [];
  return [...known, ...generic].slice(0, 25).map((r, i) => ({
    id: `REQ-${String(i + 1).padStart(3, "0")}`,
    type: r.type,
    category: r.category,
    statement: r.statement,
    userStory: r.userStory,
    acceptance: r.acceptance,
    rationale: r.rationale,
    confidence: r.confidence,
    source: r.source,
    ambiguity: r.ambiguity || [],
    prototypeOnly: Boolean(r.prototypeOnly)
  }));
}

export default function App() {
  const [input, setInput] = useState("");
  const [requirements, setRequirements] = useState([]);
  const [filter, setFilter] = useState("All");
  const [expanded, setExpanded] = useState({});
  const [hasRun, setHasRun] = useState(false);
  const [status, setStatus] = useState({});
  const [editingId, setEditingId] = useState(null);
  const [drafts, setDrafts] = useState({});
  const [exportText, setExportText] = useState("");
  const [copyMsg, setCopyMsg] = useState("");
  const [elapsed, setElapsed] = useState(null);
  const textareaRef = useRef(null);
  const exportRef = useRef(null);

  function analyse() {
    if (!input.trim()) return;
    const t0 = performance.now();
    const results = runLocalExtraction(input);
    const t1 = performance.now();
    setRequirements(results);
    setExpanded({});
    setStatus({});
    setDrafts({});
    setExportText("");
    setCopyMsg("");
    setElapsed(Math.max(1, Math.round(t1 - t0)));
    setHasRun(true);
  }

  function loadExample(ex) {
    setInput(ex.text);
    setRequirements([]);
    setHasRun(false);
    setStatus({});
    setDrafts({});
    setExportText("");
    setCopyMsg("");
    setElapsed(null);
    setTimeout(() => textareaRef.current?.focus(), 50);
  }

  function setReq(id, value) {
    setStatus(s => {
      const next = { ...s };
      if (next[id] === value) delete next[id];
      else next[id] = value;
      return next;
    });
    setExportText("");
    setCopyMsg("");
  }

  function startEdit(req) {
    setEditingId(req.id);
    setDrafts(d => ({ ...d, [req.id]: d[req.id] ?? req.statement }));
  }

  function statementFor(req) {
    return drafts[req.id] ?? req.statement;
  }

  function buildExport(format = "json") {
    const approved = requirements
      .filter(r => status[r.id] === "accepted")
      .map(r => ({
        id: r.id,
        type: r.type,
        category: r.category,
        statement: statementFor(r),
        userStory: r.userStory,
        acceptance: r.acceptance,
        source: r.source,
        ambiguity: r.ambiguity,
        confidence: r.confidence,
        edited: drafts[r.id] != null && drafts[r.id] !== r.statement
      }));

    let output;
    if (format === "csv") {
      const header = ["ID", "Type", "Category", "Statement", "Acceptance Criteria", "Confidence"];
      const rows = approved.map(r => [r.id, r.type, r.category, r.statement, r.acceptance, r.confidence]
        .map(v => `"${String(v).replaceAll('"', '""')}"`).join(","));
      output = [header.join(","), ...rows].join("\n");
    } else {
      output = JSON.stringify(approved, null, 2);
    }
    setExportText(output);
    setCopyMsg("");
    navigator.clipboard?.writeText(output).then(
      () => setCopyMsg(`Approved requirements copied as ${format.toUpperCase()}.`),
      () => setCopyMsg("Copy failed — select the text below manually.")
    );
    setTimeout(() => exportRef.current?.focus(), 50);
  }

  const filtered = useMemo(() => filter === "All" ? requirements : requirements.filter(r => r.type === filter), [filter, requirements]);
  const frCount = requirements.filter(r => r.type === "FR").length;
  const nfrCount = requirements.filter(r => r.type === "NFR").length;
  const acceptedCount = requirements.filter(r => status[r.id] === "accepted").length;
  const rejectedCount = requirements.filter(r => status[r.id] === "rejected").length;
  const pendingCount = requirements.length - acceptedCount - rejectedCount;
  const ambiguityCount = requirements.reduce((sum, r) => sum + (r.ambiguity?.length ? 1 : 0), 0);

  const btn = (bg, color, border) => ({
    padding: "5px 11px", fontSize: 12, fontWeight: 600, border: `1px solid ${border}`,
    borderRadius: 7, background: bg, color, cursor: "pointer"
  });

  return (
    <div style={{ fontFamily: "Inter, system-ui, sans-serif", maxWidth: 980, margin: "0 auto", padding: "2rem 1.5rem", color: "#1a1a1a" }}>
      <div style={{ marginBottom: "1.5rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
          <div style={{ width: 8, height: 34, background: "#2E4057", borderRadius: 2 }} />
          <h1 style={{ margin: 0, fontSize: 24, fontWeight: 700, letterSpacing: "-0.5px" }}>AI Requirements Assistant</h1>
        </div>
        <p style={{ margin: "0 0 0 18px", fontSize: 14, color: "#555", lineHeight: 1.6 }}>
          A self-contained NLP proof of concept for Requirements Engineering. It extracts candidate requirements, classifies FR/NFR, flags ambiguity, generates user stories and acceptance criteria, and keeps the analyst in control through accept/edit/reject review.
        </p>
      </div>

      <div style={{ marginBottom: "1rem" }}>
        <span style={{ fontSize: 12, fontWeight: 700, color: "#777", textTransform: "uppercase", letterSpacing: "0.05em", marginRight: 10 }}>Try an example:</span>
        {EXAMPLES.map(ex => (
          <button key={ex.label} onClick={() => loadExample(ex)} style={{ marginRight: 8, marginBottom: 6, padding: "5px 13px", fontSize: 12, border: "1px solid #ddd", borderRadius: 20, background: "#fff", cursor: "pointer", color: "#333" }}>{ex.label}</button>
        ))}
      </div>

      <textarea
        ref={textareaRef}
        value={input}
        onChange={e => setInput(e.target.value)}
        placeholder="Paste stakeholder interview notes, meeting notes, emails, support complaints, or user feedback..."
        style={{ width: "100%", minHeight: 190, padding: "14px 16px", fontSize: 14, lineHeight: 1.6, border: "1.5px solid #ddd", borderRadius: 10, resize: "vertical", boxSizing: "border-box", fontFamily: "inherit", color: "#1a1a1a", outline: "none" }}
        onFocus={e => e.target.style.borderColor = "#2E4057"}
        onBlur={e => e.target.style.borderColor = "#ddd"}
      />

      <button onClick={analyse} disabled={!input.trim()} style={{ marginTop: 12, padding: "11px 28px", fontSize: 14, fontWeight: 700, background: !input.trim() ? "#ccc" : "#2E4057", color: "#fff", border: "none", borderRadius: 8, cursor: !input.trim() ? "not-allowed" : "pointer" }}>
        Extract Requirements →
      </button>

      {requirements.length > 0 && (
        <div style={{ marginTop: 28 }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 10, marginBottom: 16 }}>
            <Metric label="Candidates" value={requirements.length} />
            <Metric label="Functional" value={frCount} />
            <Metric label="Non-functional" value={nfrCount} />
            <Metric label="Ambiguity flags" value={ambiguityCount} />
            <Metric label="Run time" value={`${elapsed} ms`} />
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 16, flexWrap: "wrap", padding: "10px 14px", background: "#F7F8FA", border: "1px solid #eee", borderRadius: 8 }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: "#333" }}>Analyst review:</span>
            <span style={{ fontSize: 13, color: "#1B5E20" }}>✓ {acceptedCount} accepted</span>
            <span style={{ fontSize: 13, color: "#B71C1C" }}>✕ {rejectedCount} rejected</span>
            <span style={{ fontSize: 13, color: "#777" }}>○ {pendingCount} pending</span>
            <button onClick={() => buildExport("json")} disabled={acceptedCount === 0} style={{ marginLeft: "auto", ...btn(acceptedCount === 0 ? "#ccc" : "#2E4057", "#fff", acceptedCount === 0 ? "#ccc" : "#2E4057") }}>Copy JSON</button>
            <button onClick={() => buildExport("csv")} disabled={acceptedCount === 0} style={btn(acceptedCount === 0 ? "#ccc" : "#fff", acceptedCount === 0 ? "#fff" : "#2E4057", acceptedCount === 0 ? "#ccc" : "#2E4057")}>Copy CSV</button>
          </div>

          {copyMsg && <div style={{ marginBottom: 10, fontSize: 12, color: "#555" }}>{copyMsg}</div>}
          {exportText && <textarea ref={exportRef} readOnly value={exportText} onFocus={e => e.target.select()} style={{ width: "100%", minHeight: 130, marginBottom: 16, padding: 12, fontSize: 12, fontFamily: "ui-monospace, Menlo, monospace", border: "1px solid #ddd", borderRadius: 8, background: "#fafafa", color: "#333", boxSizing: "border-box" }} />}

          <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
            {["All", "FR", "NFR"].map(f => (
              <button key={f} onClick={() => setFilter(f)} style={{ padding: "6px 16px", fontSize: 13, border: "1.5px solid", borderColor: filter === f ? "#2E4057" : "#ddd", borderRadius: 20, background: filter === f ? "#2E4057" : "#fff", color: filter === f ? "#fff" : "#555", cursor: "pointer", fontWeight: filter === f ? 700 : 400 }}>{f === "All" ? "All" : f === "FR" ? "Functional" : "Non-Functional"}</button>
            ))}
          </div>

          {filtered.map(req => {
            const tc = typeColors[req.type] || typeColors.FR;
            const cc = confidenceColors[req.confidence] || confidenceColors.Medium;
            const isOpen = expanded[req.id];
            const st = status[req.id];
            const isEditing = editingId === req.id;
            const wasEdited = drafts[req.id] != null && drafts[req.id] !== req.statement;
            const cardBorder = st === "accepted" ? "#1B5E20" : st === "rejected" ? "#B71C1C" : tc.border;
            return (
              <div key={req.id} style={{ marginBottom: 12, border: `1px solid ${cardBorder}`, borderLeft: `5px solid ${cardBorder}`, borderRadius: 10, background: "#fff", overflow: "hidden", opacity: st === "rejected" ? 0.58 : 1 }}>
                <div style={{ padding: "15px 16px", display: "flex", gap: 12 }}>
                  <span style={{ flexShrink: 0, padding: "3px 8px", borderRadius: 5, background: tc.badgeBg, color: tc.badge, fontSize: 11, fontWeight: 800, height: 18 }}>{req.type}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6, flexWrap: "wrap" }}>
                      <span style={{ fontSize: 12, fontWeight: 700, color: "#777" }}>{req.id}</span>
                      <span style={{ fontSize: 12, padding: "2px 8px", borderRadius: 4, background: "#f0f0f0", color: "#555" }}>{req.category}</span>
                      <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 4, background: cc.bg, color: cc.color, fontWeight: 700 }}>{req.confidence} confidence</span>
                      {req.prototypeOnly && <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 4, background: "#FFF3E0", color: "#E65100", fontWeight: 700 }}>Prototype-only</span>}
                      {req.ambiguity?.length > 0 && <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 4, background: "#FFF8E1", color: "#8A6D00", fontWeight: 700 }}>Needs clarification</span>}
                      {st === "accepted" && <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 4, background: "#E8F5E9", color: "#1B5E20", fontWeight: 700 }}>Accepted</span>}
                      {st === "rejected" && <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 4, background: "#FFEBEE", color: "#B71C1C", fontWeight: 700 }}>Rejected</span>}
                      {wasEdited && <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 4, background: "#E3F2FD", color: "#1565C0", fontWeight: 700 }}>Edited</span>}
                    </div>

                    {isEditing ? (
                      <div>
                        <textarea value={drafts[req.id] ?? req.statement} onChange={e => setDrafts(d => ({ ...d, [req.id]: e.target.value }))} style={{ width: "100%", minHeight: 70, padding: "8px 10px", fontSize: 14, lineHeight: 1.5, border: "1.5px solid #2E4057", borderRadius: 6, resize: "vertical", boxSizing: "border-box", fontFamily: "inherit" }} />
                        <div style={{ marginTop: 8, display: "flex", gap: 8, flexWrap: "wrap" }}>
                          <button onClick={() => setEditingId(null)} style={btn("#2E4057", "#fff", "#2E4057")}>Save</button>
                          <button onClick={() => setEditingId(null)} style={btn("#fff", "#555", "#ddd")}>Cancel</button>
                          <button onClick={() => { setDrafts(d => { const n = { ...d }; delete n[req.id]; return n; }); setEditingId(null); }} style={btn("#fff", "#888", "#ddd")}>Revert</button>
                        </div>
                      </div>
                    ) : (
                      <p style={{ margin: 0, fontSize: 14, lineHeight: 1.5, color: "#1a1a1a", textDecoration: st === "rejected" ? "line-through" : "none" }}>{statementFor(req)}</p>
                    )}

                    {!isEditing && (
                      <div style={{ marginTop: 10, display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
                        <button onClick={() => setReq(req.id, "accepted")} style={btn(st === "accepted" ? "#1B5E20" : "#E8F5E9", st === "accepted" ? "#fff" : "#1B5E20", "#1B5E20")}>✓ Accept</button>
                        <button onClick={() => setReq(req.id, "rejected")} style={btn(st === "rejected" ? "#B71C1C" : "#FFEBEE", st === "rejected" ? "#fff" : "#B71C1C", "#B71C1C")}>✕ Reject</button>
                        <button onClick={() => startEdit(req)} style={btn("#fff", "#1565C0", "#90CAF9")}>✎ Edit</button>
                        <button onClick={() => setExpanded(e => ({ ...e, [req.id]: !e[req.id] }))} style={{ ...btn("#fff", "#777", "#ddd"), marginLeft: "auto" }}>{isOpen ? "Hide details ▾" : "Show details ▸"}</button>
                      </div>
                    )}
                  </div>
                </div>

                {isOpen && !isEditing && (
                  <div style={{ padding: "12px 16px 15px", borderTop: "1px solid #f0f0f0", background: tc.bg }}>
                    <Detail label="User story" text={req.userStory} />
                    <Detail label="Acceptance criteria" text={req.acceptance} />
                    <Detail label="Evidence" text={req.source} />
                    <Detail label="AI rationale" text={req.rationale} />
                    {req.ambiguity?.length > 0 && <Detail label="Clarification needed" text={req.ambiguity.join(" ")} />}
                  </div>
                )}
              </div>
            );
          })}

          <p style={{ marginTop: 18, fontSize: 13, color: "#777", textAlign: "center" }}>
            This prototype demonstrates the LLM Extraction Engine concept with transparent local NLP rules, then adds human-in-the-loop review and export for traceability readiness.
          </p>
        </div>
      )}

      {hasRun && requirements.length === 0 && (
        <div style={{ marginTop: 24, padding: 24, textAlign: "center", border: "1px dashed #ddd", borderRadius: 10, color: "#888" }}>
          No requirements extracted. Add more stakeholder detail or use words such as need, should, must, allow, support, provide, or comply.
        </div>
      )}
    </div>
  );
}

function Metric({ label, value }) {
  return <div style={{ padding: "12px 14px", border: "1px solid #eee", borderRadius: 10, background: "#FAFAFA" }}><div style={{ fontSize: 12, color: "#777", marginBottom: 4 }}>{label}</div><div style={{ fontSize: 20, fontWeight: 800, color: "#2E4057" }}>{value}</div></div>;
}

function Detail({ label, text }) {
  return <p style={{ margin: "0 0 8px", fontSize: 13, color: "#444", lineHeight: 1.55 }}><strong style={{ color: "#222" }}>{label}: </strong>{text}</p>;
}
