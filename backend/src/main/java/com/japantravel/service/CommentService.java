package com.japantravel.service;

import com.japantravel.domain.Comment;
import com.japantravel.domain.TravelLog;
import com.japantravel.domain.User;
import com.japantravel.repository.CommentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class CommentService {

    private final CommentRepository commentRepository;

    @Transactional
    public Comment addComment(TravelLog travelLog, User user, String content) {
        log.info("[CommentService] addComment 시작 - logId: {}, userId: {}", travelLog.getLogId(), user.getUserId());

        Comment comment = Comment.builder()
                .travelLog(travelLog)
                .user(user)
                .content(content)
                .build();

        Comment saved = commentRepository.save(comment);
        log.info("[CommentService] addComment 완료 - commentId: {}", saved.getCommentId());
        return saved;
    }

    @Transactional(readOnly = true)
    public List<Comment> getComments(Long logId) {
        log.info("[CommentService] getComments 시작 - logId: {}", logId);

        List<Comment> comments = commentRepository.findByTravelLog_LogIdOrderByCreatedAtAsc(logId);
        log.info("[CommentService] getComments 완료 - logId: {}, 조회 건수: {}", logId, comments.size());
        return comments;
    }

    @Transactional
    public void deleteComment(Long commentId, Long requestUserId) {
        log.info("[CommentService] deleteComment 시작 - commentId: {}, requestUserId: {}", commentId, requestUserId);

        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> {
                    log.warn("[CommentService] 존재하지 않는 댓글 - commentId: {}", commentId);
                    return new IllegalArgumentException("존재하지 않는 댓글입니다.");
                });

        if (!comment.getUser().getUserId().equals(requestUserId)) {
            log.warn("[CommentService] 삭제 권한 없음 - commentId: {}, requestUserId: {}", commentId, requestUserId);
            throw new IllegalArgumentException("삭제 권한이 없습니다.");
        }

        commentRepository.delete(comment);
        log.info("[CommentService] deleteComment 완료 - commentId: {}", commentId);
    }
}
