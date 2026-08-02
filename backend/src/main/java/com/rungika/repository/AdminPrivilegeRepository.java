package com.rungika.repository;

import com.rungika.entity.AdminPrivilege;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AdminPrivilegeRepository extends MongoRepository<AdminPrivilege, String> {
    boolean existsByEmailIgnoreCase(String email);
}
