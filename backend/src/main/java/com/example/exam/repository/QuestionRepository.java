package com.example.exam.repository;
import com.example.exam.model.Question;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
public interface QuestionRepository extends JpaRepository<Question, Long> {
    List<Question> findByExamId(Long examId);
    void deleteByExamId(Long examId);
}
