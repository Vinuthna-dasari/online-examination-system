package com.example.exam.controller;

import com.example.exam.model.Exam;
import com.example.exam.model.Question;
import com.example.exam.repository.ExamRepository;
import com.example.exam.repository.QuestionRepository;
import jakarta.validation.Valid;
import java.util.List;
import java.util.Map;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/questions")
public class QuestionController {
    private final QuestionRepository questions;
    private final ExamRepository exams;
    public QuestionController(QuestionRepository questions, ExamRepository exams) {
        this.questions = questions; this.exams = exams;
    }
    @GetMapping public List<?> all() {
        return questions.findAll().stream().map(this::publicQuestion).toList();
    }
    @PostMapping public ResponseEntity<?> create(@Valid @RequestBody Map<String,Object> body) {
        return save(null, body);
    }
    @PutMapping("/{id}") public ResponseEntity<?> update(@PathVariable Long id, @Valid @RequestBody Map<String,Object> body) {
        return save(id, body);
    }
    private ResponseEntity<?> save(Long id, Map<String,Object> body) {
        try {
            Long examId = Long.valueOf(body.get("examId").toString());
            Exam exam = exams.findById(examId).orElse(null);
            if (exam == null) return ResponseEntity.badRequest().body(Map.of("error", "Select a valid exam."));
            Question q = id == null ? new Question() : questions.findById(id).orElse(null);
            if (q == null) return ResponseEntity.notFound().build();
            q.setExam(exam);
            q.setText(body.get("text").toString());
            q.setOptionA(body.get("optionA").toString()); q.setOptionB(body.get("optionB").toString());
            q.setOptionC(body.get("optionC").toString()); q.setOptionD(body.get("optionD").toString());
            q.setCorrectAnswer(body.get("correctAnswer").toString().toUpperCase());
            q.setMarks(Integer.parseInt(body.getOrDefault("marks", 1).toString()));
            return ResponseEntity.ok(publicQuestion(questions.save(q)));
        } catch (Exception ex) {
            return ResponseEntity.badRequest().body(Map.of("error", "Check that all question fields are filled in correctly."));
        }
    }
    @DeleteMapping("/{id}") public ResponseEntity<Void> delete(@PathVariable Long id) {
        if (!questions.existsById(id)) return ResponseEntity.notFound().build();
        questions.deleteById(id); return ResponseEntity.noContent().build();
    }
    private Map<String,Object> publicQuestion(Question q) {
        var m = new java.util.LinkedHashMap<String,Object>();
        m.put("id", q.getId()); m.put("examId", q.getExam().getId()); m.put("examTitle", q.getExam().getTitle());
        m.put("text", q.getText()); m.put("optionA", q.getOptionA()); m.put("optionB", q.getOptionB());
        m.put("optionC", q.getOptionC()); m.put("optionD", q.getOptionD()); m.put("marks", q.getMarks());
        m.put("correctAnswer", q.getCorrectAnswer());
        return m;
    }
}
