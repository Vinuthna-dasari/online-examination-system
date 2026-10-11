const API = import.meta.env.VITE_API_URL || 'http://localhost:8081/api';

async function request(path, options = {}) {
  const response = await fetch(`${API}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    }
  });

  if (!response.ok) {
    let message = `Request failed (${response.status})`;
    try {
      const data = await response.json();
      message = data.error || message;
    } catch {}
    throw new Error(message);
  }

  if (response.status === 204) return null;
  return response.json();
}

export const api = {
  exams: () => request('/exams'),
  createExam: data =>
    request('/exams', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
  updateExam: (id, data) =>
    request(`/exams/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    }),
  deleteExam: id =>
    request(`/exams/${id}`, { method: 'DELETE' }),

  questions: () => request('/questions'),
  createQuestion: data =>
    request('/questions', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
  updateQuestion: (id, data) =>
    request(`/questions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    }),
  deleteQuestion: id =>
    request(`/questions/${id}`, { method: 'DELETE' }),

  examQuestions: id => request(`/exams/${id}/questions`),

  results: () => request('/results'),
  resultsByExam: id => request(`/results/exam/${id}`),

  // Submit answers for an exam.
  submit: (id, answers) =>
    request(`/exams/${id}/submit`, {
      method: 'POST',
      body: JSON.stringify(answers)
    })
};