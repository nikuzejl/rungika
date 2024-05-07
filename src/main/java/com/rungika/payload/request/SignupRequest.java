package com.rungika.payload.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.util.Set;

public class SignupRequest {
    @NotBlank
    @Size(min = 1, max = 50)
    private String firstName;

    @Size(min = 1, max = 50)
    private String lastName;

    @NotBlank
    @Size(max = 50)
    @Email
    private String email;

    @Size(min = 1, max = 10)
    private String phone;

    @NotBlank
    @Size(min = 6, max = 40)
    private String password;

    private Set<String> roles;

    public String getFirstName() {
        return firstName;
    }

    public void setFirstName(String firstName) {
        this.firstName = firstName;
    }

    public String getLastName() {
        return lastName;
    }

    public void setLastName(String lastName) {
        this.lastName = lastName;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String setPhone(String phone){
        return this.phone = phone;
    }

    public String getPhone(){
        return this.phone;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public Set<String> getRoles() {
        return this.roles;
    }

    public void setRole(Set<String> roles) {
        this.roles = roles;
    }
}
