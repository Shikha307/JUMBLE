package com.jumble.userjob.user.service;

import com.jumble.userjob.user.model.User;
import com.jumble.userjob.user.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Optional;
import java.util.UUID;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    public User createUser(User user, MultipartFile resumeFile) throws IOException {
        if (resumeFile != null && !resumeFile.isEmpty()) {
            user.setResumeFilename(resumeFile.getOriginalFilename());
            user.setResumeContentType(resumeFile.getContentType());
            user.setResumeData(resumeFile.getBytes());
        }

        return userRepository.save(user);
    }

    public Optional<User> getUserById(String id) {
        return userRepository.findById(id);
    }
}
