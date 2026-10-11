package com.example.exam.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.exam.model.Result;

public interface ResultRepository
        extends JpaRepository<Result, Long> {

    List<Result> findByExamId(Long examId);
}