package com.example.exam.service;

import com.example.exam.model.Exam;
import com.example.exam.model.Question;
import com.example.exam.repository.ExamRepository;
import com.example.exam.repository.QuestionRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class DataLoader implements CommandLineRunner {
    private final ExamRepository exams;
    private final QuestionRepository questions;
    public DataLoader(ExamRepository exams, QuestionRepository questions) {
        this.exams = exams; this.questions = questions;
    }
    @Override public void run(String... args) {
        if (exams.count() > 0) return;
        Exam java = exams.save(new Exam("Java Fundamentals Quiz", "Java", 20, "A sample multiple-choice examination."));
        add(java, "Which keyword creates a subclass in Java?", "implements", "extends", "inherits", "instanceof", "B");
        add(java, "Which method is the entry point of a Java application?", "start()", "run()", "main()", "init()", "C");
        add(java, "Which type stores true or false?", "int", "String", "char", "boolean", "D");
        Exam db = exams.save(new Exam("Database Basics", "Database Management", 15, "A sample DBMS examination."));
        add(db, "What does SQL stand for?", "Structured Query Language", "Simple Question List", "Sequential Query Logic", "Standard Queue Language", "A");
        add(db, "Which command retrieves data?", "INSERT", "SELECT", "UPDATE", "DELETE", "B");
    }
    private void add(Exam exam, String text, String a, String b, String c, String d, String correct) {
        Question q = new Question(); q.setExam(exam); q.setText(text);
        q.setOptionA(a); q.setOptionB(b); q.setOptionC(c); q.setOptionD(d);
        q.setCorrectAnswer(correct); q.setMarks(1); questions.save(q);
    }
}
