package com.japantravel.repository;

import com.japantravel.domain.Comment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface CommentRepository extends JpaRepository<Comment, Long> {
    List<Comment> findByTravelLog_LogIdOrderByCreatedAtAsc(Long logId);

    @Modifying(clearAutomatically = true)
    @Query("DELETE FROM Comment c WHERE c.user.userId = :userId")
    void deleteByUserId(@Param("userId") Long userId);

    @Modifying(clearAutomatically = true)
    @Query("DELETE FROM Comment c WHERE c.travelLog.logId IN :logIds")
    void deleteByTravelLogIdIn(@Param("logIds") List<Long> logIds);
}
