package com.example.exam.controller;

import com.example.exam.model.Exam;
import com.example.exam.repository.ExamRepository;
import com.example.exam.repository.QuestionRepository;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/exams")
public class ExamController {
    private final ExamRepository exams;
    private final QuestionRepository questions;
    public ExamController(ExamRepository exams, QuestionRepository questions) {
        this.exams = exams; this.questions = questions;
    }
    @GetMapping public List<Exam> all() { return exams.findAll(); }
    @GetMapping("/{id}") public ResponseEntity<Exam> one(@PathVariable Long id) {
        return exams.findById(id).map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }
    @PostMapping public Exam create(@Valid @RequestBody Exam exam) { exam.setId(null); return exams.save(exam); }
    @PutMapping("/{id}") public ResponseEntity<Exam> update(@PathVariable Long id, @Valid @RequestBody Exam input) {
        return exams.findById(id).map(e -> {
            e.setTitle(input.getTitle()); e.setSubject(input.getSubject());
            e.setDurationMinutes(input.getDurationMinutes()); e.setDescription(input.getDescription());
            return ResponseEntity.ok(exams.save(e));
        }).orElse(ResponseEntity.notFound().build());
    }
    @DeleteMapping("/{id}") public ResponseEntity<Void> delete(@PathVariable Long id) {
        if (!exams.existsById(id)) return ResponseEntity.notFound().build();
        questions.deleteByExamId(id); exams.deleteById(id); return ResponseEntity.noContent().build();
    }
    @GetMapping("/{id}/questions") public List<?> questions(@PathVariable Long id) {
        return questions.findByExamId(id).stream().map(q -> {
            var m = new java.util.LinkedHashMap<String,Object>();
            m.put("id", q.getId()); m.put("examId", q.getExam().getId()); m.put("text", q.getText());
            m.put("optionA", q.getOptionA()); m.put("optionB", q.getOptionB());
            m.put("optionC", q.getOptionC()); m.put("optionD", q.getOptionD()); m.put("marks", q.getMarks());
            return m;
        }).toList();
    }
}
