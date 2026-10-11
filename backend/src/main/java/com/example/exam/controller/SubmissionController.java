package com.example.exam.controller;

import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.exam.model.Result;
import com.example.exam.repository.ExamRepository;
import com.example.exam.repository.QuestionRepository;
import com.example.exam.repository.ResultRepository;

@RestController
@RequestMapping("/api/exams")
public class SubmissionController {

    private final ExamRepository exams;
    private final QuestionRepository questions;
    private final ResultRepository results;

    public SubmissionController(
            ExamRepository exams,
            QuestionRepository questions,
            ResultRepository results) {
        this.exams = exams;
        this.questions = questions;
        this.results = results;
    }

    @PostMapping("/{id}/submit")
    public ResponseEntity<?> submit(
            @PathVariable Long id,
            @RequestBody Map<String, String> answers) {

        if (!exams.existsById(id)) {
            return ResponseEntity.notFound().build();
        }

        var list = questions.findByExamId(id);

        int score = 0;
        int total = 0;

        for (var q : list) {
            total += q.getMarks();

            String answer = answers.get(String.valueOf(q.getId()));

            if (answer != null &&
                    answer.equalsIgnoreCase(q.getCorrectAnswer())) {
                score += q.getMarks();
            }
        }

        // Save the exam result to the database
        Result result = new Result();
        result.setExamId(id);
        result.setStudentName("Student");
        result.setScore(score);
        result.setTotalMarks(total);
        result.setTotalQuestions(list.size());
        resultR.save(result);

        // Return the result to the frontend
        return ResponseEntity.ok(Map.of(
                "score", score,
                "totalMarks", total,
                "questionCount", list.size(),
                "percentage", total == 0
                        ? 0
                        : Math.round(score * 100.0 / total)
        ));
    }
}