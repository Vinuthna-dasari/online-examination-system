package com.example.exam.controller;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.exam.model.Result;
import com.example.exam.repository.ResultRepository;

@RestController
@RequestMapping("/api/results")
public class ResultController {

    private final ResultRepository results;

    public ResultController(ResultRepository results) {
        this.results = results;
    }

    @GetMapping
    public List<Result> getAllResults() {
        return results.findAll();
    }

    @GetMapping("/exam/{examId}")
    public List<Result> getResultsByExam(
            @PathVariable Long examId) {
        return results.findByExamId(examId);
    }
}