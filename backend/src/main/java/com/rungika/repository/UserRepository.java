package com.rungika.repository;

import com.rungika.entity.User;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends MongoRepository<User, String> {
    Optional<User> findByEmail(String email);
    Optional<User> findByEmailIgnoreCase(String email);
    Optional<User> findByEmailVerificationToken(String emailVerificationToken);
    Optional<User> findByPasswordResetToken(String passwordResetToken);

    Boolean existsByEmail(String email);

    void deleteByEmail(String email);
}

