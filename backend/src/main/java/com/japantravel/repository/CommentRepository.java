package com.japantravel.repository;

import com.japantravel.domain.Comment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CommentRepository extends JpaRepository<Comment, Long> {
    List<Comment> findByTravelLog_LogIdOrderByCreatedAtAsc(Long logId);
}
