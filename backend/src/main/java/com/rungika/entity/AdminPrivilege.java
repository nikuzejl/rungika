package com.rungika.entity;

import lombok.Getter;
import lombok.Setter;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

@Getter
@Setter
@Document(collection = "admins")
public class AdminPrivilege {
    @Id
    private String id;

    @Indexed(unique = true)
    private String email;
}
