import React, { useEffect, useMemo, useState } from 'react';
import { api } from './api.js';
import './styles.css';

const blankExam = {
  title: '',
  subject: '',
  durationMinutes: 20,
  description: ''
};

const blankQuestion = {
  examId: '',
  text: '',
  optionA: '',
  optionB: '',
  optionC: '',
  optionD: '',
  correctAnswer: 'A',
  marks: 1
};

export default function App() {
  const [tab, setTab] = useState('dashboard');
  const [exams, setExams] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [savedResults, setSavedResults] = useState([]);
  const [examForm, setExamForm] = useState(blankExam);
  const [questionForm, setQuestionForm] = useState(blankQuestion);
  const [editExamId, setEditExamId] = useState(null);
  const [editQuestionId, setEditQuestionId] = useState(null);
  const [activeExam, setActiveExam] = useState(null);
  const [activeQuestions, setActiveQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [search, setSearch] = useState('');
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  const [resultsLoading, setResultsLoading] = useState(false);

  async function refresh() {
    try {
      const [e, q] = await Promise.all([
        api.exams(),
        api.questions()
      ]);
      setExams(e);
      setQuestions(q);
      setError('');
    } catch (err) {
      setError(
        `${err.message}. Make sure the Spring Boot backend is running on port 8081.`
      );
    }
  }

  async function loadResults() {
    setResultsLoading(true);
    setError('');

    try {
      const data = await api.results();
      setSavedResults(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || 'Unable to load saved exam results.');
    } finally {
      setResultsLoading(false);
    }
  }

  useEffect(() => {
    refresh();
  }, []);

  const filteredExams = useMemo(
    () =>
      exams.filter(e =>
        `${e.title} ${e.subject}`
          .toLowerCase()
          .includes(search.toLowerCase())
      ),
    [exams, search]
  );

  async function saveExam(ev) {
    ev.preventDefault();

    try {
      const payload = {
        ...examForm,
        durationMinutes: Number(examForm.durationMinutes)
      };

      if (editExamId) {
        await api.updateExam(editExamId, payload);
      } else {
        await api.createExam(payload);
      }

      setNotice(
        editExamId
          ? 'Exam updated successfully.'
          : 'Exam created successfully.'
      );

      setExamForm(blankExam);
      setEditExamId(null);
      await refresh();
    } catch (err) {
      setError(err.message);
    }
  }

  function editExam(exam) {
    setExamForm({
      title: exam.title,
      subject: exam.subject,
      durationMinutes: exam.durationMinutes,
      description: exam.description || ''
    });

    setEditExamId(exam.id);
    setTab('exams');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function removeExam(id) {
    if (!confirm('Delete this exam and all its questions?')) return;

    try {
      await api.deleteExam(id);
      setNotice('Exam deleted.');
      await refresh();
    } catch (err) {
      setError(err.message);
    }
  }

  async function saveQuestion(ev) {
    ev.preventDefault();

    try {
      const payload = {
        ...questionForm,
        examId: Number(questionForm.examId),
        marks: Number(questionForm.marks)
      };

      if (editQuestionId) {
        await api.updateQuestion(editQuestionId, payload);
      } else {
        await api.createQuestion(payload);
      }

      setNotice(
        editQuestionId
          ? 'Question updated successfully.'
          : 'Question created successfully.'
      );

      setQuestionForm({
        ...blankQuestion,
        examId: exams[0]?.id || ''
      });
      setEditQuestionId(null);
      await refresh();
    } catch (err) {
      setError(err.message);
    }
  }

  function editQuestion(q) {
    setQuestionForm({
      examId: String(q.examId),
      text: q.text,
      optionA: q.optionA,
      optionB: q.optionB,
      optionC: q.optionC,
      optionD: q.optionD,
      correctAnswer: q.correctAnswer,
      marks: q.marks
    });

    setEditQuestionId(q.id);
    setTab('questions');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function removeQuestion(id) {
    if (!confirm('Delete this question?')) return;

    try {
      await api.deleteQuestion(id);
      setNotice('Question deleted.');
      await refresh();
    } catch (err) {
      setError(err.message);
    }
  }

  async function beginExam(exam) {
  try {
    setError('');
    setNotice('');

    const qs = await api.examQuestions(exam.id);

    console.log('Selected exam ID:', exam.id);
    console.log('Questions returned by backend:', qs);

    if (!Array.isArray(qs)) {
      throw new Error(
        'Unexpected response from the backend. Check the browser console.'
      );
    }

    if (qs.length === 0) {
      setError(
        `No questions found for ${exam.title} (ID: ${exam.id}).`
      );
      return;
    }

    setActiveExam(exam);
    setActiveQuestions(qs);
    setAnswers({});
    setResult(null);
    setTab('take');
  } catch (err) {
    setError(err.message);
  }
}

  async function submitExam(ev) {
    ev.preventDefault();

    try {
      const submittedResult = await api.submit(
        activeExam.id,
        answers
      );

      setResult(submittedResult);

      // Refresh the list of persisted results after submission.
      await loadResults();
    } catch (err) {
      setError(err.message);
    }
  }

  const nav = [
    ['dashboard', 'Overview', '⌂'],
    ['exams', 'Manage Exams', '▤'],
    ['questions', 'Manage Questions', '☷'],
    ['take', 'Take Exam', '✓'],
    ['results', 'Results', '▥']
  ];

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-icon">OE</div>
          <div>
            <b>Exam<span>Portal</span></b>
            <small>ONLINE ASSESSMENT</small>
          </div>
        </div>

        <div className="nav-label">WORKSPACE</div>

        {nav.map(([id, label, icon]) => (
          <button
            key={id}
            className={`nav-item ${tab === id ? 'selected' : ''}`}
            onClick={() => {
              setTab(id);
              setNotice('');
              setError('');

              if (id === 'results') {
                loadResults();
              }
            }}
          >
            <span className="nav-icon">{icon}</span>
            {label}
            {tab === id && <span className="nav-active" />}
          </button>
        ))}

        <div className="sidebar-bottom">
          <div className="status-dot" />
          <span>Local project</span>
          <small>Java full stack</small>
        </div>
      </aside>

      <main className="main">
        <header className="topbar">
          <div>
            <div className="eyebrow">LEARNING & ASSESSMENT</div>
            <h1>
              {nav.find(n => n[0] === tab)?.[1] || 'Take Exam'}
            </h1>
          </div>
          <div className="profile">
            <div className="avatar">S</div>
            <div>
              <b>Student / Admin</b>
              <small>Project demo</small>
            </div>
          </div>
        </header>

        {notice && (
          <div className="alert success">
            {notice}
            <button onClick={() => setNotice('')}>×</button>
          </div>
        )}

        {error && (
          <div className="alert danger">
            {error}
            <button onClick={() => setError('')}>×</button>
          </div>
        )}

        {tab === 'dashboard' && (
          <section className="page-content">
            <div className="welcome">
              <div>
                <div className="eyebrow light">YOUR LEARNING SPACE</div>
                <h2>Welcome to ExamPortal</h2>
                <p>
                  Create assessments, manage questions, and test your
                  knowledge in one place.
                </p>
                <button
                  className="btn white"
                  onClick={() => setTab('take')}
                >
                  Explore available exams <span>→</span>
                </button>
              </div>
              <div className="welcome-art">
                <div className="art-circle">✓</div>
                <div className="art-card">
                  ✦ &nbsp; Ready to begin?
                  <small>Learn. Attempt. Improve.</small>
                </div>
              </div>
            </div>

            <div className="stat-grid">
              <Stat icon="▤" label="Total Exams" value={exams.length} tone="blue" />
              <Stat icon="☷" label="Total Questions" value={questions.length} tone="purple" />
              <Stat
                icon="◷"
                label="Available Subjects"
                value={new Set(exams.map(e => e.subject)).size}
                tone="orange"
              />
              <Stat icon="✓" label="System Status" value="Ready" tone="green" />
            </div>

            <div className="section-heading">
              <div>
                <h3>Available examinations</h3>
                <p>Choose an exam to start your assessment.</p>
              </div>
              <button
                className="btn outline"
                onClick={() => setTab('exams')}
              >
                Manage exams →
              </button>
            </div>

            <ExamCards exams={exams.slice(0, 3)} onTake={beginExam} />

            <div className="tip">
              <span>✦</span>
              <div>
                <b>Project checklist</b>
                <p>
                  Frontend and backend are separated. CRUD operations
                  are available for exams and questions, with automatic
                  score calculation.
                </p>
              </div>
            </div>
          </section>
        )}

        {tab === 'exams' && (
          <section className="page-content two-col">
            <div className="panel form-panel">
              <div className="panel-title">
                <div>
                  <h3>{editExamId ? 'Edit examination' : 'Create examination'}</h3>
                  <p>Enter the exam details below.</p>
                </div>
                <span className="panel-icon">＋</span>
              </div>

              <form onSubmit={saveExam} className="form">
                <Field label="Exam title">
                  <input
                    required
                    value={examForm.title}
                    onChange={e =>
                      setExamForm({ ...examForm, title: e.target.value })
                    }
                    placeholder="e.g. Java Fundamentals"
                  />
                </Field>

                <Field label="Subject">
                  <input
                    required
                    value={examForm.subject}
                    onChange={e =>
                      setExamForm({ ...examForm, subject: e.target.value })
                    }
                    placeholder="e.g. Java Programming"
                  />
                </Field>

                <Field label="Duration (minutes)">
                  <input
                    required
                    type="number"
                    min="1"
                    value={examForm.durationMinutes}
                    onChange={e =>
                      setExamForm({
                        ...examForm,
                        durationMinutes: e.target.value
                      })
                    }
                  />
                </Field>

                <Field label="Description">
                  <textarea
                    value={examForm.description}
                    onChange={e =>
                      setExamForm({
                        ...examForm,
                        description: e.target.value
                      })
                    }
                    placeholder="Briefly describe this examination"
                    rows="3"
                  />
                </Field>

                <div className="form-actions">
                  <button className="btn primary" type="submit">
                    {editExamId ? 'Save changes' : '＋ Create exam'}
                  </button>
                  {editExamId && (
                    <button
                      className="btn outline"
                      type="button"
                      onClick={() => {
                        setEditExamId(null);
                        setExamForm(blankExam);
                      }}
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            </div>

            <div className="panel">
              <div className="panel-title">
                <div>
                  <h3>Examination list</h3>
                  <p>{exams.length} examination(s) available</p>
                </div>
              </div>

              <input
                className="search"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="⌕ Search exams..."
              />

              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>EXAMINATION</th>
                      <th>DURATION</th>
                      <th>ACTIONS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredExams.map(e => (
                      <tr key={e.id}>
                        <td>
                          <b>{e.title}</b>
                          <small>{e.subject}</small>
                        </td>
                        <td>{e.durationMinutes} min</td>
                        <td>
                          <div className="actions">
                            <button title="Edit" onClick={() => editExam(e)}>✎</button>
                            <button
                              title="Delete"
                              className="delete"
                              onClick={() => removeExam(e.id)}
                            >
                              ×
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {!filteredExams.length && (
                      <tr>
                        <td colSpan="3" className="empty">No exams found.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        )}

        {tab === 'questions' && (
          <section className="page-content two-col">
            <div className="panel form-panel">
              <div className="panel-title">
                <div>
                  <h3>{editQuestionId ? 'Edit question' : 'Add a question'}</h3>
                  <p>Multiple-choice question details.</p>
                </div>
                <span className="panel-icon">＋</span>
              </div>

              {!exams.length ? (
                <p className="empty">Create an exam before adding questions.</p>
              ) : (
                <form onSubmit={saveQuestion} className="form">
                  <Field label="Assign to exam">
                    <select
                      required
                      value={questionForm.examId}
                      onChange={e =>
                        setQuestionForm({
                          ...questionForm,
                          examId: e.target.value
                        })
                      }
                    >
                      <option value="">Choose an exam</option>
                      {exams.map(e => (
                        <option key={e.id} value={e.id}>{e.title}</option>
                      ))}
                    </select>
                  </Field>

                  <Field label="Question">
                    <textarea
                      required
                      rows="2"
                      value={questionForm.text}
                      onChange={e =>
                        setQuestionForm({ ...questionForm, text: e.target.value })
                      }
                      placeholder="Type your question here..."
                    />
                  </Field>

                  {['A', 'B', 'C', 'D'].map(letter => (
                    <Field key={letter} label={`Option ${letter}`}>
                      <input
                        required
                        value={questionForm[`option${letter}`]}
                        onChange={e =>
                          setQuestionForm({
                            ...questionForm,
                            [`option${letter}`]: e.target.value
                          })
                        }
                        placeholder={`Enter option ${letter}`}
                      />
                    </Field>
                  ))}

                  <div className="form-row">
                    <Field label="Correct answer">
                      <select
                        value={questionForm.correctAnswer}
                        onChange={e =>
                          setQuestionForm({
                            ...questionForm,
                            correctAnswer: e.target.value
                          })
                        }
                      >
                        {['A', 'B', 'C', 'D'].map(a => (
                          <option key={a} value={a}>Option {a}</option>
                        ))}
                      </select>
                    </Field>
                    <Field label="Marks">
                      <input
                        type="number"
                        min="1"
                        value={questionForm.marks}
                        onChange={e =>
                          setQuestionForm({
                            ...questionForm,
                            marks: e.target.value
                          })
                        }
                      />
                    </Field>
                  </div>

                  <div className="form-actions">
                    <button className="btn primary" type="submit">
                      {editQuestionId ? 'Save changes' : '＋ Add question'}
                    </button>
                    {editQuestionId && (
                      <button
                        className="btn outline"
                        type="button"
                        onClick={() => {
                          setEditQuestionId(null);
                          setQuestionForm({
                            ...blankQuestion,
                            examId: exams[0]?.id || ''
                          });
                        }}
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </form>
              )}
            </div>

            <div className="panel">
              <div className="panel-title">
                <div>
                  <h3>Question bank</h3>
                  <p>{questions.length} question(s) across all exams</p>
                </div>
              </div>

              <div className="question-list">
                {questions.map((q, i) => (
                  <div className="question-row" key={q.id}>
                    <div className="q-number">{String(i + 1).padStart(2, '0')}</div>
                    <div className="q-details">
                      <b>{q.text}</b>
                      <small>{q.examTitle} · {q.marks} mark(s)</small>
                      <div className="option-preview">
                        A. {q.optionA} &nbsp; B. {q.optionB}
                      </div>
                    </div>
                    <div className="actions">
                      <button onClick={() => editQuestion(q)} title="Edit">✎</button>
                      <button
                        className="delete"
                        onClick={() => removeQuestion(q.id)}
                        title="Delete"
                      >
                        ×
                      </button>
                    </div>
                  </div>
                ))}
                {!questions.length && (
                  <p className="empty">No questions yet. Add your first question.</p>
                )}
              </div>
            </div>
          </section>
        )}

        {tab === 'take' && (
          <section className="page-content">
            {!activeExam ? (
              <>
                <div className="section-heading">
                  <div>
                    <h3>Choose an examination</h3>
                    <p>Select an exam to answer its multiple-choice questions.</p>
                  </div>
                </div>
                <ExamCards exams={exams} onTake={beginExam} />
              </>
            ) : (
              <div className="panel take-panel">
                <div className="take-header">
                  <div>
                    <span className="tag">{activeExam.subject}</span>
                    <h2>{activeExam.title}</h2>
                    <p>{activeExam.description}</p>
                  </div>
                  <button
                    className="btn outline"
                    onClick={() => {
                      setActiveExam(null);
                      setResult(null);
                    }}
                  >
                    ← All exams
                  </button>
                </div>

                {result ? (
                  <div className="result-box">
                    <div className="result-check">✓</div>
                    <h2>Assessment completed!</h2>
                    <div className="score">
                      {result.score}<span> / {result.totalMarks}</span>
                    </div>
                    <p>
                      You answered {result.questionCount} question(s).
                      Your score is {result.percentage}%.
                    </p>
                    <button
                      className="btn primary"
                      onClick={() => {
                        setActiveExam(null);
                        setResult(null);
                        setTab('dashboard');
                        refresh();
                      }}
                    >
                      Back to dashboard
                    </button>
                  </div>
                ) : (
                  <form onSubmit={submitExam}>
                    <div className="exam-meta">
                      <span>◷ {activeExam.durationMinutes} minutes</span>
                      <span>☷ {activeQuestions.length} questions</span>
                      <span>✦ Multiple choice</span>
                    </div>

                    {activeQuestions.map((q, i) => (
                      <div className="exam-question" key={q.id}>
                        <div className="question-label">
                          QUESTION {i + 1} <span>{q.marks} mark(s)</span>
                        </div>
                        <h3>{q.text}</h3>
                        <div className="answer-options">
                          {['A', 'B', 'C', 'D'].map(a => (
                            <label
                              key={a}
                              className={`answer-option ${answers[q.id] === a ? 'chosen' : ''}`}
                            >
                              <input
                                type="radio"
                                name={`q-${q.id}`}
                                checked={answers[q.id] === a}
                                onChange={() =>
                                  setAnswers({ ...answers, [q.id]: a })
                                }
                              />
                              <span className="answer-letter">{a}</span>
                              {q[`option${a}`]}
                            </label>
                          ))}
                        </div>
                      </div>
                    ))}

                    <button className="btn primary submit-btn" type="submit">
                      Submit examination →
                    </button>
                  </form>
                )}
              </div>
            )}
          </section>
        )}

        {/* Results page: load and display records saved by the backend. */}
        {tab === 'results' && (
          <section className="page-content">
            <div className="panel">
              <div className="panel-title">
                <div>
                  <h3>Saved exam results</h3>
                  <p>Results retrieved from your backend.</p>
                </div>
                <button
                  className="btn outline"
                  onClick={loadResults}
                  disabled={resultsLoading}
                >
                  {resultsLoading ? 'Loading...' : '↻ Refresh'}
                </button>
              </div>

              {resultsLoading ? (
                <p className="empty">Loading saved results...</p>
              ) : savedResults.length === 0 ? (
                <p className="empty">
                  No saved results found. Complete an exam first, then refresh.
                </p>
              ) : (
                <div className="table-wrap">
                  <table>
                    <thead>
                      <tr>
                        <th>EXAM</th>
                        <th>SCORE</th>
                        <th>TOTAL MARKS</th>
                        <th>PERCENTAGE</th>
                        <th>DATE</th>
                      </tr>
                    </thead>
                    <tbody>
                      {savedResults.map((r, i) => {
                        const score = r.score ?? r.marksObtained;
                        const total = r.totalMarks ?? r.maxMarks;
                        const percentage =
                          r.percentage ??
                          (Number.isFinite(Number(score)) &&
                          Number.isFinite(Number(total)) &&
                          Number(total) > 0
                            ? Math.round((Number(score) / Number(total)) * 100)
                            : null);

                        return (
                          <tr key={r.id ?? r.resultId ?? i}>
                            <td>
                              <b>
                                {r.examTitle ??
                                  r.exam?.title ??
                                  r.title ??
                                  (r.examId != null
                                    ? `Exam #${r.examId}`
                                    : 'Exam result')}
                              </b>
                              <small>
                                {r.studentName ?? r.student?.name ?? ''}
                              </small>
                            </td>
                            <td>{score ?? '—'}</td>
                            <td>{total ?? '—'}</td>
                            <td>
                              {percentage != null ? `${percentage}%` : '—'}
                            </td>
                            <td>
                              {r.submittedAt ?? r.createdAt ?? r.date
                                ? new Date(
                                    r.submittedAt ?? r.createdAt ?? r.date
                                  ).toLocaleString()
                                : '—'}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </section>
        )}
{tab === 'results' && (
  <section className="page-content">
    <div className="panel">
      <div className="panel-title">
        <div>
          <h3>Saved Exam Results</h3>
          <p>View your completed examinations and scores.</p>
        </div>
        <button
          className="btn outline"
          onClick={loadResults}
        >
          Refresh results
        </button>
      </div>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>EXAM</th>
              <th>SCORE</th>
              <th>TOTAL MARKS</th>
              <th>PERCENTAGE</th>
            </tr>
          </thead>
          <tbody>
            {savedResults.length > 0 ? (
              savedResults.map((r, i) => (
                <tr key={r.id ?? i}>
                  <td>{r.examTitle ?? r.exam?.title ?? 'Exam'}</td>
                  <td>{r.score ?? 0}</td>
                  <td>{r.totalMarks ?? 0}</td>
                  <td>{r.percentage ?? 0}%</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="empty">
                  No saved results found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  </section>
)}
        <footer>
          Online Examination System <span>•</span> Java Full Stack College Project
          <span>•</span> React + Spring Boot
        </footer>
      </main>
    </div>
  );
}

function Stat({ icon, label, value, tone }) {
  return (
    <div className="stat-card">
      <div className={`stat-icon ${tone}`}>{icon}</div>
      <div>
        <small>{label}</small>
        <strong>{value}</strong>
      </div>
      <span className="stat-decoration">↗</span>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label className="field">
      <span>{label}</span>
      {children}
    </label>
  );
}

function ExamCards({ exams, onTake }) {
  return (
    <div className="exam-grid">
      {exams.map((e, i) => (
        <article className="exam-card" key={e.id}>
          <div className={`exam-card-icon tone-${i % 3}`}>
            {['⌘', '▦', '✦'][i % 3]}
          </div>
          <div className="exam-subject">{e.subject}</div>
          <h3>{e.title}</h3>
          <p>
            {e.description ||
              'Test your understanding with this examination.'}
          </p>
          <div className="exam-card-meta">
            <span>◷ {e.durationMinutes} min</span>
            <span>▤ Examination</span>
          </div>
          <button
            className="btn primary full"
            onClick={() => onTake(e)}
          >
            Start exam <span>→</span>
          </button>
        </article>
      ))}
      {!exams.length && (
        <div className="panel empty">
          No exams available yet. Create one in Manage Exams.
        </div>
      )}
    </div>
  );
}